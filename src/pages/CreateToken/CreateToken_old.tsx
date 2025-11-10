import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import "./CreateToken.css";
import { useState, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import STF_ABI from "../../ABIs/StandardTokenFactory.json";
import TFB_ABI from "../../ABIs/TokenFactoryBase.json";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";

// Constants
const CONTRACTS = {
    STANDARD_TOKEN_FACTORY: "0x9180aa1fd00c299f5b768296df7831d2f462e8da",
    TOKEN_FACTORY_BASE: "0x18c7bde06910010eb39a24b6003d95d17a53efd9"
} as const;

const VALIDATION_RULES = {
    name: { min: 1, max: 50 },
    symbol: { min: 1, max: 10 },
    decimals: { min: 0, max: 18 },
    supply: { min: 1, max: 1e15 }
} as const;

interface TokenData {
    name: string;
    symbol: string;
    decimals: string;
    supply: string;
}

interface CreatedToken {
    address: string;
    transactionHash: string;
}

const CreateToken = () => {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    // Form state
    const [tokenData, setTokenData] = useState<TokenData>({
        name: "",
        symbol: "",
        decimals: "18",
        supply: ""
    });

    // UI state
    const [isCreating, setIsCreating] = useState(false);
    const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null);
    const [formErrors, setFormErrors] = useState<Partial<TokenData>>({});

    // Validation functions
    const validateField = useCallback((field: keyof TokenData, value: string): string | null => {
        const rules = VALIDATION_RULES[field];
        
        switch (field) {
            case 'name':
                if (!value.trim()) return "Token name is required";
                if (value.length < rules.min || value.length > rules.max) {
                    return `Name must be between ${rules.min} and ${rules.max} characters`;
                }
                return null;
                
            case 'symbol':
                if (!value.trim()) return "Token symbol is required";
                if (value.length < rules.min || value.length > rules.max) {
                    return `Symbol must be between ${rules.min} and ${rules.max} characters`;
                }
                if (!/^[A-Za-z0-9]+$/.test(value)) {
                    return "Symbol can only contain letters and numbers";
                }
                return null;
                
            case 'decimals':
                const decimalsNum = parseInt(value);
                if (isNaN(decimalsNum)) return "Decimals must be a number";
                if (decimalsNum < rules.min || decimalsNum > rules.max) {
                    return `Decimals must be between ${rules.min} and ${rules.max}`;
                }
                return null;
                
            case 'supply':
                const supplyNum = parseFloat(value);
                if (!value.trim()) return "Total supply is required";
                if (isNaN(supplyNum) || supplyNum <= 0) {
                    return "Supply must be a positive number";
                }
                if (supplyNum < rules.min || supplyNum > rules.max) {
                    return `Supply must be between ${rules.min.toLocaleString()} and ${rules.max.toLocaleString()}`;
                }
                return null;
                
            default:
                return null;
        }
    }, []);

    const validateForm = useCallback((): boolean => {
        const errors: Partial<TokenData> = {};
        let isValid = true;

        (Object.keys(tokenData) as Array<keyof TokenData>).forEach(field => {
            const error = validateField(field, tokenData[field]);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });

        setFormErrors(errors);
        return isValid;
    }, [tokenData, validateField]);

    // Input handlers
    const handleInputChange = useCallback((field: keyof TokenData, value: string) => {
        setTokenData(prev => ({ ...prev, [field]: value }));
        
        // Clear error for this field if it exists
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [formErrors]);

    // Token creation logic
    const createStandardToken = useCallback(async (
        tokenName: string, 
        tokenSymbol: string, 
        tokenDecimals: number, 
        totalSupply: number
    ): Promise<CreatedToken> => {
        if (!walletClient) {
            throw new Error("Wallet not connected. Please connect your wallet first.");
        }

        if (!address) {
            throw new Error("Wallet address not available.");
        }

        try {
            // Create provider from walletClient - compatible with wagmi v2
            const provider = new ethers.providers.Web3Provider(
                walletClient.transport, 
                walletClient.chain?.id || 56 // Default to BSC mainnet
            );
            
            // Verify network connection
            console.log("Checking network connection...");
            const network = await provider.getNetwork();
            console.log("Connected to network:", network.name, "Chain ID:", network.chainId);
            
            // Verify signer
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            console.log("Signer address:", signerAddress);
            
            // Verify we're on the right network (BSC = 56)
            if (network.chainId !== 56) {
                throw new Error(`Wrong network! Please switch to BSC Mainnet (Chain ID: 56). Current: ${network.chainId}`);
            }

            console.log("Skipping fee check, using known fee of 0.01 BNB");
            
            // Use hardcoded fee to avoid contract call issues
            const flatFee = ethers.utils.parseEther("0.01");
            console.log("Using flat fee: 0.01 BNB");

            // Check user balance
            const balance = await provider.getBalance(address);
            console.log("User balance:", ethers.utils.formatEther(balance), "BNB");
            
            if (balance.lt(flatFee)) {
                throw new Error(`Insufficient BNB balance. Required: ${ethers.utils.formatEther(flatFee)} BNB`);
            }

            console.log("Creating token...");
            // Create token
            const standardTokenFactory = new ethers.Contract(
                CONTRACTS.STANDARD_TOKEN_FACTORY, 
                STF_ABI.abi, 
                signer
            );

            // Calculate total supply with proper BigNumber handling
            const totalSupplyWei = ethers.utils.parseUnits(totalSupply.toString(), tokenDecimals);
            
            const createTokenTx = await standardTokenFactory.create(
                tokenName,
                tokenSymbol,
                tokenDecimals,
                totalSupplyWei,
                { 
                    value: flatFee,
                    gasLimit: ethers.utils.hexlify(500000) // Ensure proper gas limit format
                }
            );

            console.log("Transaction sent:", createTokenTx.hash);
            const receipt = await createTokenTx.wait();
            console.log("Transaction confirmed. Gas used:", receipt.gasUsed.toString());
            
            // Simplified event parsing - just use the receipt from the factory call
            // The token address is usually in the logs
            let tokenAddress = "";
            
            if (receipt.logs && receipt.logs.length > 0) {
                // The token address is typically the first log entry that's not the factory
                for (const log of receipt.logs) {
                    if (log.address && log.address.toLowerCase() !== CONTRACTS.STANDARD_TOKEN_FACTORY.toLowerCase()) {
                        tokenAddress = log.address;
                        console.log("Found token address in logs:", tokenAddress);
                        break;
                    }
                }
            }
            
            // If we still don't have it, try the events
            if (!tokenAddress && receipt.events && receipt.events.length > 0) {
                for (const event of receipt.events) {
                    if (event.address && event.address.toLowerCase() !== CONTRACTS.STANDARD_TOKEN_FACTORY.toLowerCase()) {
                        tokenAddress = event.address;
                        console.log("Found token address in events:", tokenAddress);
                        break;
                    }
                }
            }
            
            // Last resort: check if there are any contract creation logs
            if (!tokenAddress) {
                console.log("Checking for contract creation...");
                // Sometimes the token address is in the transaction receipt itself
                if (receipt.contractAddress) {
                    tokenAddress = receipt.contractAddress;
                    console.log("Found contract address:", tokenAddress);
                }
            }

            if (!tokenAddress) {
                // Don't fail completely, just warn and let user check manually
                console.warn("Could not automatically determine token address");
                tokenAddress = "Check transaction manually";
            }

            console.log("Final token address:", tokenAddress);

            return {
                address: tokenAddress,
                transactionHash: receipt.transactionHash,
            };
        } catch (error: any) {
            console.error("Token creation error:", error);
            
            // Enhanced error handling
            if (error.code === 4001) {
                throw new Error("Transaction rejected by user");
            } else if (error.code === -32603) {
                throw new Error("Internal JSON-RPC error. Please try again.");
            } else if (error.message?.includes("insufficient funds")) {
                throw new Error("Insufficient funds for transaction");
            } else if (error.message?.includes("execution reverted")) {
                throw new Error("Transaction failed. Please check your parameters and try again.");
            } else if (error.message?.includes("user rejected")) {
                throw new Error("Transaction rejected by user");
            }
            
            throw new Error(error.message || "An unexpected error occurred while creating the token");
        }
    }, [walletClient, address]);

    const handleCreateToken = useCallback(async () => {
        if (!validateForm()) {
            toast.error("Please fix the form errors before proceeding");
            return;
        }

        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsCreating(true);
        const loadingToast = toast.loading("Creating token...");

        try {
            const result = await createStandardToken(
                tokenData.name.trim(),
                tokenData.symbol.trim().toUpperCase(),
                parseInt(tokenData.decimals),
                parseFloat(tokenData.supply)
            );

            setCreatedToken(result);
            
            toast.update(loadingToast, {
                render: "Token created successfully! 🎉",
                autoClose: 3000,
                isLoading: false,
                type: "success",
            });
        } catch (error: any) {
            console.error("Token creation error:", error);
            toast.update(loadingToast, {
                render: error.message,
                autoClose: 5000,
                isLoading: false,
                type: "error",
            });
        } finally {
            setIsCreating(false);
        }
    }, [tokenData, validateForm, isConnected, createStandardToken]);

    // Utility functions
    const handleCopyAddress = useCallback(() => {
        if (createdToken?.address) {
            navigator.clipboard.writeText(createdToken.address)
                .then(() => toast.success("Token address copied to clipboard!"))
                .catch(() => toast.error("Failed to copy address"));
        }
    }, [createdToken?.address]);

    const handleOpenTransaction = useCallback(() => {
        if (createdToken?.transactionHash) {
            const url = `https://bscscan.com/tx/${createdToken.transactionHash}`;
            window.open(url, "_blank", "noopener,noreferrer");
        }
    }, [createdToken?.transactionHash]);

    const handleReset = useCallback(() => {
        setTokenData({ name: "", symbol: "", decimals: "18", supply: "" });
        setCreatedToken(null);
        setFormErrors({});
    }, []);

    // Render helpers
    const renderFormField = (
        field: keyof TokenData,
        label: string,
        placeholder: string,
        type: string = "text",
        note?: string
    ) => (
        <div className="input_group_1">
            <div className="group_1_label">
                <span className="mt">{label}</span>
                <span className="ast">*</span>
            </div>
            <div className="group_1_input">
                <input
                    type={type}
                    value={tokenData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    placeholder={placeholder}
                    className={formErrors[field] ? "error" : ""}
                    disabled={isCreating}
                />
                {formErrors[field] && (
                    <span className="error_message">{formErrors[field]}</span>
                )}
            </div>
            {note && <span className="group_1_note">{note}</span>}
        </div>
    );

    return (
        <div className="create_token">
            <Navbar />
            <ToastContainer position="top-right" />
            
            <main className="page_wrapper">
                {!createdToken ? (
                    <div className="fill_form">
                        <span className="required_label">(*) is a required field</span>
                        
                        <div className="input_group_1">
                            <div className="group_1_label">
                                <span className="mt">Token Type</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_1_input">
                                <select disabled>
                                    <option value="Standard">Standard</option>
                                </select>
                            </div>
                            <span className="group_1_note">0.01 BNB</span>
                        </div>

                        {renderFormField("name", "Name", "Ex: Ethereum")}
                        {renderFormField("symbol", "Symbol", "Ex: ETH")}
                        {renderFormField("decimals", "Decimals", "18", "number")}
                        {renderFormField("supply", "Total Supply", "Ex: 1000000", "number")}

                        <div className="form_buttons">
                            <button 
                                onClick={handleCreateToken} 
                                disabled={!isConnected || isCreating}
                                className={isCreating ? "loading" : ""}
                            >
                                {isCreating 
                                    ? "Creating Token..." 
                                    : isConnected 
                                        ? "Create Token" 
                                        : "Connect Wallet"
                                }
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="fill_form token_details">
                        <span className="created">🎉 Your token was created successfully!</span>
                        
                        <div className="details_table">
                            <div className="table_row">
                                <span>Name</span>
                                <span>{tokenData.name}</span>
                            </div>
                            <div className="table_row">
                                <span>Symbol</span>
                                <span>{tokenData.symbol.toUpperCase()}</span>
                            </div>
                            <div className="table_row">
                                <span>Decimals</span>
                                <span>{tokenData.decimals}</span>
                            </div>
                            <div className="table_row">
                                <span>Total Supply</span>
                                <span>{parseFloat(tokenData.supply).toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className="contract_address">
                            <span className="address_label">Contract Address:</span>
                            <span className="address" title={createdToken.address}>
                                {createdToken.address}
                            </span>
                        </div>
                        
                        <div className="three_btns">
                            <button className="btn_secondary" onClick={handleOpenTransaction}>
                                View Transaction
                            </button>
                            <button className="btn_secondary" onClick={handleCopyAddress}>
                                Copy Address
                            </button>
                            <Link to="/Create_presale" className="btn_primary">
                                Create Presale
                            </Link>
                        </div>
                        
                        <div className="form_buttons">
                            <button onClick={handleReset} className="btn_outline">
                                Create Another Token
                            </button>
                        </div>
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
};

export default CreateToken;