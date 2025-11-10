import Footer from "../../components/Footer/Footer"
import Navbar from "../../components/Navbar/Navbar"
import "./Airdrop.css"
import logoMin from "../../assets/logos/logo-min.svg"
import { ethers, BigNumber } from "ethers"
import AirdropABI from "../../ABIs/Airdrop.json"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import STANDARDTOKEN_ABI from "../../ABIs/StandardToken.json"
import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWalletClient } from "wagmi";

interface TokenDetails {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
}

interface AirdropEntry {
  address: string;
  amount: number;
}

const Airdrop = () => {
    const [address, setAddress] = useState("");
    const [balance, setBalance] = useState<number>(0);
    const [distributionList, setDistributionList] = useState("");
    const [tokenContractDetails, setTokenContractDetails] = useState<TokenDetails | null>(null);
    const [listOfAddress, setListOfAddress] = useState<string[]>([]);
    const [listOfValue, setListOfValues] = useState<BigNumber[]>([]);
    const [hasUserApproved, setHasUserApproved] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalNumberOfTokenToAirdrop, setTotalNumberOfTokenToAirdrop] = useState<number>(0);
    const [currentAllowance, setCurrentAllowance] = useState<BigNumber>(BigNumber.from(0));
    const [dropFee, setDropFee] = useState<BigNumber>(BigNumber.from(0));

    const { data: walletClient } = useWalletClient();
    const { address: userAddress, isConnected } = useAccount();

    const LENGTH_OF_CONTRACT_ADDRESS = 42;
    const AIRDROP_CONTRACT_ADDRESS = "0x42e044829504cbcdfc20dad3a0cbae77738b718f";
    const MAX_ADDRESSES_PER_BATCH = 500;

    // Validation helpers
    const isValidAddress = (addr: string): boolean => {
        return ethers.utils.isAddress(addr);
    };

    const validateDistributionList = (list: string): { isValid: boolean; errors: string[]; entries: AirdropEntry[] } => {
        const errors: string[] = [];
        const entries: AirdropEntry[] = [];
        
        if (!list.trim()) {
            return { isValid: false, errors: ["Distribution list is empty"], entries: [] };
        }

        const lines = list.trim().split('\n');
        
        if (lines.length > MAX_ADDRESSES_PER_BATCH) {
            errors.push(`Maximum ${MAX_ADDRESSES_PER_BATCH} addresses allowed per batch`);
        }

        const uniqueAddresses = new Set<string>();
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            const parts = trimmedLine.split(',');
            if (parts.length !== 2) {
                errors.push(`Line ${index + 1}: Invalid format. Use address,amount`);
                return;
            }

            const [addr, amountStr] = parts.map(p => p.trim());
            
            if (!isValidAddress(addr)) {
                errors.push(`Line ${index + 1}: Invalid address format`);
                return;
            }

            if (uniqueAddresses.has(addr.toLowerCase())) {
                errors.push(`Line ${index + 1}: Duplicate address ${addr}`);
                return;
            }
            uniqueAddresses.add(addr.toLowerCase());

            const amount = parseFloat(amountStr);
            if (isNaN(amount) || amount <= 0) {
                errors.push(`Line ${index + 1}: Invalid amount`);
                return;
            }

            entries.push({ address: addr, amount });
        });

        return { isValid: errors.length === 0, errors, entries };
    };

    const createProvider = useCallback(() => {
        if (!walletClient) {
            throw new Error("No wallet client available. Please connect your wallet.");
        }
        return new ethers.providers.Web3Provider(walletClient.transport);
    }, [walletClient]);

    const getDropFee = async (): Promise<void> => {
        try {
            const provider = createProvider();
            const airDropContract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, AirdropABI, provider);
            const fee = await airDropContract.dropFee();
            setDropFee(fee);
        } catch (error) {
            console.error("Get drop fee error:", error);
            // Set default fee if contract call fails
            setDropFee(ethers.utils.parseEther("0.001"));
        }
    };

    const checkAllowance = async (tokenAddress: string, userAddr: string): Promise<void> => {
        try {
            const provider = createProvider();
            const tokenContract = new ethers.Contract(tokenAddress, STANDARDTOKEN_ABI.abi, provider);
            const allowance = await tokenContract.allowance(userAddr, AIRDROP_CONTRACT_ADDRESS);
            setCurrentAllowance(allowance);
        } catch (error) {
            console.error("Check allowance error:", error);
            setCurrentAllowance(BigNumber.from(0));
        }
    };

    const handleCreateAirdrop = async (tokenAddress: string, receivers: string[], amountsToReceive: BigNumber[]): Promise<boolean> => {
        try {
            const provider = createProvider();
            const signer = provider.getSigner();
            const airDropContract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, AirdropABI, signer);
            
            // Convert BigNumber array to regular array for contract call
            const amounts = amountsToReceive.map(amount => amount.toString());
            
            const tx = await airDropContract.airdrop(tokenAddress, receivers, amounts, {
                value: dropFee
            });
            
            await tx.wait();
            return true;
        } catch (error) {
            console.error("Airdrop error:", error);
            throw error;
        }
    };

    const getTokenBalance = async (tokenAddress: string, userAddr: string): Promise<number> => {
        try {
            const provider = createProvider();
            const tokenContract = new ethers.Contract(tokenAddress, STANDARDTOKEN_ABI.abi, provider);
            
            const [userBalanceRes, decimalsRes] = await Promise.all([
                tokenContract.balanceOf(userAddr),
                tokenContract.decimals()
            ]);
            
            const decimals = parseInt(decimalsRes.toString());
            const userBalance = parseFloat(userBalanceRes.toString()) / Math.pow(10, decimals);
            
            return userBalance;
        } catch (error) {
            console.error("Get token balance error:", error);
            throw error;
        }
    };

    const approveToken = async (spenderAddress: string, amount: BigNumber, tokenAddress: string): Promise<void> => {
        try {
            const provider = createProvider();
            const signer = provider.getSigner();
            const tokenContract = new ethers.Contract(tokenAddress, STANDARDTOKEN_ABI.abi, signer);
            
            const tx = await tokenContract.approve(spenderAddress, amount);
            await tx.wait();
        } catch (error) {
            console.error("Approve token error:", error);
            throw error;
        }
    };

    const getTokenDetails = async (tokenAddress: string): Promise<TokenDetails> => {
        try {
            const provider = createProvider();
            const tokenContract = new ethers.Contract(tokenAddress, STANDARDTOKEN_ABI.abi, provider);
            
            const [tokenName, tokenSymbol, tokenDecimals] = await Promise.all([
                tokenContract.name(),
                tokenContract.symbol(),
                tokenContract.decimals()
            ]);
            
            return {
                tokenAddress,
                tokenName,
                tokenSymbol,
                tokenDecimals: parseInt(tokenDecimals.toString())
            };
        } catch (error) {
            console.error("Get token details error:", error);
            throw error;
        }
    };

    const getContractDetails = async (tokenAddress: string) => {
        try {
            setIsLoading(true);
            const tokenDetails = await getTokenDetails(tokenAddress);
            setTokenContractDetails(tokenDetails);
            
            if (userAddress) {
                await Promise.all([
                    getUserBalance(tokenAddress),
                    checkAllowance(tokenAddress, userAddress)
                ]);
            }
        } catch (error) {
            toast.error("Error fetching token details. Please check the token address.");
            setTokenContractDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    const getUserBalance = async (tokenAddress: string) => {
        if (!userAddress) return;
        
        try {
            const userBalance = await getTokenBalance(tokenAddress, userAddress);
            setBalance(userBalance);
        } catch (error) {
            console.error("Get user balance error:", error);
            setBalance(0);
        }
    };

    const handleApprove = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }

        const validation = validateDistributionList(distributionList);
        if (!validation.isValid) {
            toast.error(`Validation errors:\n${validation.errors.join('\n')}`);
            return;
        }

        if (!tokenContractDetails) {
            toast.error("Token details not loaded");
            return;
        }

        const approveLoading = toast.loading("Approving tokens...");

        try {
            const listOfAddresses: string[] = [];
            const listOfValues: BigNumber[] = [];
            let sumOfAmountsToAirdrop = 0;

            for (const entry of validation.entries) {
                const amountInWei = ethers.utils.parseUnits(
                    entry.amount.toString(),
                    tokenContractDetails.tokenDecimals
                );
                listOfValues.push(amountInWei);
                listOfAddresses.push(entry.address);
                sumOfAmountsToAirdrop += entry.amount;
            }

            // Calculate total amount in wei
            const totalAmountInWei = listOfValues.reduce((sum, amount) => sum.add(amount), BigNumber.from(0));

            // Check if user has sufficient balance
            if (balance < sumOfAmountsToAirdrop) {
                throw new Error(`Insufficient balance. Required: ${sumOfAmountsToAirdrop}, Available: ${balance}`);
            }

            // Check if additional approval is needed
            if (currentAllowance.lt(totalAmountInWei)) {
                await approveToken(AIRDROP_CONTRACT_ADDRESS, totalAmountInWei, address);
                await checkAllowance(address, userAddress!);
            }

            toast.update(approveLoading, {
                autoClose: 3000,
                render: "Tokens approved successfully!",
                isLoading: false,
                type: "success",
            });

            setHasUserApproved(true);
            setTotalNumberOfTokenToAirdrop(sumOfAmountsToAirdrop);
            setListOfAddress(listOfAddresses);
            setListOfValues(listOfValues);

        } catch (error: any) {
            console.error("Approve error:", error);
            toast.update(approveLoading, {
                autoClose: 5000,
                render: error.message || "Error approving tokens",
                isLoading: false,
                type: "error",
            });
        }
    };

    const handleAirdrop = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }

        const airdropLoading = toast.loading("Running airdrop...");

        try {
            await handleCreateAirdrop(address, listOfAddress, listOfValue);

            toast.update(airdropLoading, {
                autoClose: 5000,
                render: "Airdrop completed successfully!",
                isLoading: false,
                type: "success",
            });

            // Reset state after successful airdrop
            setHasUserApproved(false);
            setDistributionList("");
            setTotalNumberOfTokenToAirdrop(0);
            setListOfAddress([]);
            setListOfValues([]);
            
            // Refresh balance and allowance
            if (userAddress && tokenContractDetails) {
                await Promise.all([
                    getUserBalance(address),
                    checkAllowance(address, userAddress)
                ]);
            }

        } catch (error: any) {
            console.error("Airdrop error:", error);
            toast.update(airdropLoading, {
                autoClose: 5000,
                render: error.message || "Error running airdrop",
                isLoading: false,
                type: "error",
            });
        }
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAddress = e.target.value;
        setAddress(newAddress);
        
        // Reset dependent states when address changes
        setTokenContractDetails(null);
        setBalance(0);
        setHasUserApproved(false);
        setDistributionList("");
        setTotalNumberOfTokenToAirdrop(0);
        setCurrentAllowance(BigNumber.from(0));
    };

    // Initialize drop fee on component mount
    useEffect(() => {
        if (walletClient) {
            getDropFee();
        }
    }, [walletClient]);

    useEffect(() => {
        if (address.length === LENGTH_OF_CONTRACT_ADDRESS && isValidAddress(address)) {
            getContractDetails(address);
        }
    }, [address, userAddress]);

    // Check if user has approved sufficient tokens
    const hasSufficientApproval = () => {
        if (!tokenContractDetails || listOfValue.length === 0) return false;
        const totalNeeded = listOfValue.reduce((sum, amount) => sum.add(amount), BigNumber.from(0));
        return currentAllowance.gte(totalNeeded);
    };

    return (
        <div className="airdrop">
            <Navbar />
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="airdrop_wrapper">
                <div className="badge_wrapper">
                    <div className="badge">
                        <span>pad.meme Airdrop</span>
                    </div>
                </div>

                <span className="note_ad">
                    Airdrop your token to all your users with the click of a button!
                </span>

                <div className="section_ins">
                    <span className="t1">Airdrop Instructions:</span>
                    <span>• Airdrop tokens to as many users as desired (max {MAX_ADDRESSES_PER_BATCH} per batch)</span>
                    <span>• If you are running a sale, make sure tokens are not airdropped until after</span>
                    <span>• Enter your token address first</span>
                    <span>• Enter a list of users to airdrop followed by amount (comma separated)</span>
                    <span>• Format: address,amount (one per line)</span>
                    <span className="fee">
                        Airdrop fees: {ethers.utils.formatEther(dropFee)} BNB
                    </span>
                </div>

                <div className="section_2">
                    <div className="inputs">
                        <div className="address_entry">
                            <span>Enter Token Address</span>
                            <input 
                                type="text"
                                value={address}
                                onChange={handleAddressChange}
                                placeholder="0x..."
                                disabled={isLoading}
                            />
                            {address && !isValidAddress(address) && (
                                <span style={{color: 'red', fontSize: '12px'}}>Invalid address format</span>
                            )}
                        </div>

                        <div className="token_dt">
                            <div className="gp">
                                <span className="l">Token Name:</span>
                                <span className="r">
                                    {isLoading ? "Loading..." : (tokenContractDetails?.tokenName || "N/A")}
                                </span>
                            </div>

                            <div className="gp">
                                <span className="l">Token Symbol:</span>
                                <span className="r">
                                    {isLoading ? "Loading..." : (tokenContractDetails?.tokenSymbol || "N/A")}
                                </span>
                            </div>

                            <div className="gp">
                                <span className="l">Your Balance:</span>
                                <span className="r">
                                    {balance.toLocaleString()} {tokenContractDetails?.tokenSymbol || ""}
                                </span>
                            </div>

                            <div className="gp">
                                <span className="l">Current Allowance:</span>
                                <span className="r">
                                    {tokenContractDetails ? 
                                        parseFloat(ethers.utils.formatUnits(currentAllowance, tokenContractDetails.tokenDecimals)).toLocaleString() 
                                        : "0"} {tokenContractDetails?.tokenSymbol || ""}
                                </span>
                            </div>
                        </div>

                        <div className="list">
                            <span>Enter Distribution List</span>
                            <textarea
                                name=""
                                id=""
                                placeholder={`Enter Distribution List (one per line)\ne.g.\n0xB71b214Cb885500844365E95CD9942C7276E7fD8,500\n0x6d6247501b822FD4Eaa76FCB64bAEa360279497f,600`}
                                value={distributionList}
                                onChange={(e) => setDistributionList(e.target.value)}
                                disabled={!tokenContractDetails}
                            />
                        </div>

                        <span className="rm">
                            For best results we recommend you do a maximum of {MAX_ADDRESSES_PER_BATCH} addresses at a time!
                        </span>
                    </div>

                    <div className="inputs rt">
                        <div className="data">
                            <span>Your tokens being airdropped:</span>
                            <span className="value">
                                {totalNumberOfTokenToAirdrop.toLocaleString()} {tokenContractDetails?.tokenSymbol || ""}
                            </span>
                        </div>

                        <div className="data">
                            <span>Airdrop fee required:</span>
                            <span className="value">
                                {ethers.utils.formatEther(dropFee)} BNB
                            </span>
                        </div>

                        <div className="btns">
                            <div className="lb">
                                {!isConnected && (
                                    <div style={{opacity: "0.6", cursor: "not-allowed"}}>
                                        Connect Wallet First
                                    </div>
                                )}
                                
                                {isConnected && !hasSufficientApproval() && tokenContractDetails && (
                                    <div 
                                        onClick={handleApprove}
                                        style={{cursor: distributionList ? "pointer" : "not-allowed", opacity: distributionList ? "1" : "0.6"}}
                                    >
                                        Approve Tokens
                                    </div>
                                )}
                                
                                {isConnected && hasSufficientApproval() && (
                                    <div 
                                        onClick={handleAirdrop}
                                        style={{cursor: "pointer"}}
                                    >
                                        Execute Airdrop
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Airdrop;