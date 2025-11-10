import "./Submit_Page.css";
import Navbar from "../../../components/Navbar/Navbar";
import { PresaleContext } from "../../../setup/context/PresaleContext";
import { useContext, useState, useCallback, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import BNBLaunchPadFactory from "../../../ABIs/BNBLaunchPadFactory.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAccount, useWalletClient } from "wagmi";

// Network-specific contract addresses
const CONTRACT_ADDRESSES: Record<number, string> = {
  56: "0xf0ca9a712386489eeebe51473a2a2af9c45e9fad", // BSC Mainnet
  97: "0x868c4f9435ddf83878372256278c65b00a5f7fb5", // BSC Testnet
  11155111: "0x868c4f9435ddf83878372256278c65b00a5f7fb5",
  // Add other networks as needed
};

// Supported networks
const SUPPORTED_NETWORKS = {
  56: "BSC Mainnet",
  97: "BSC Testnet",
  11155111: "Sepolia"
};

const GAS_MULTIPLIER = 1.2;
const REQUEST_TIMEOUT = 10000;

// Types
interface ValidationError {
  field: string;
  message: string;
}

interface GasInfo {
  estimate: string;
  networkFee: string;
}

interface NetworkInfo {
  chainId: number;
  name: string;
  isSupported: boolean;
  contractAddress?: string;
}

const Submit_Page = () => {
  // State
  const [approved, setApproved] = useState(false);
  const [presaleAddress, setPresaleAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gasInfo, setGasInfo] = useState<GasInfo | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [contractStatus, setContractStatus] = useState<{
    exists: boolean;
    hasMethod: boolean;
    error?: string;
  } | null>(null);

  // Hooks
  const { data: walletClient } = useWalletClient();
  const { address: wallet } = useAccount();
  const navigate = useNavigate();

  // Get Presale context
  const presaleContext = useContext(PresaleContext);
  if (!presaleContext) {
    throw new Error('Submit_Page must be used within a PresaleContext.Provider');
  }

  const {
    tokenName,
    tokenDecimal,
    tokenSymbol,
    presaleRate,
    websiteLink,
    whitelist,
    softcap,
    hardcap,
    minimumBuy,
    maximumBuy,
    refundType,
    router,
    liquidity,
    listingRate,
    startTime,
    endTime,
    discordLink,
    description,
    telegramLink,
    instagramLink,
    liquidityLockup,
    facebookLink,
    githubLink,
    logoUrl,
    redditLink,
    twitterLink,
    vesting,
    firstReleaseForPresale,
    vestingPeriodEachCycle,
    presaleTokenReleaseEachCycle,
    tokenAddress,
  } = presaleContext;

  // Check network and contract status
  const checkNetworkAndContract = useCallback(async () => {
    if (!walletClient) return;

    try {
      const provider = new ethers.providers.Web3Provider(walletClient.transport);
      const network = await provider.getNetwork();
      
      const isSupported = network.chainId in SUPPORTED_NETWORKS;
      const contractAddress = CONTRACT_ADDRESSES[network.chainId];
      
      setNetworkInfo({
        chainId: network.chainId,
        name: SUPPORTED_NETWORKS[network.chainId as keyof typeof SUPPORTED_NETWORKS] || `Unknown (${network.chainId})`,
        isSupported,
        contractAddress
      });

      if (!isSupported) {
        setContractStatus({
          exists: false,
          hasMethod: false,
          error: `Unsupported network: ${network.chainId}`
        });
        return;
      }

      if (!contractAddress) {
        setContractStatus({
          exists: false,
          hasMethod: false,
          error: "Contract address not configured for this network"
        });
        return;
      }

      // Check if contract exists
      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        setContractStatus({
          exists: false,
          hasMethod: false,
          error: "Contract not deployed at this address"
        });
        return;
      }

      // Check if contract has the flatFee method
      try {
        const contract = new ethers.Contract(
          contractAddress,
          BNBLaunchPadFactory.abi,
          provider
        );
        
        // Try to call flatFee method
        await contract.flatFee();
        
        setContractStatus({
          exists: true,
          hasMethod: true
        });
      } catch (error: any) {
        console.error("Contract method check failed:", error);
        setContractStatus({
          exists: true,
          hasMethod: false,
          error: `Contract method 'flatFee' not available: ${error.message}`
        });
      }

    } catch (error: any) {
      console.error("Network check failed:", error);
      setContractStatus({
        exists: false,
        hasMethod: false,
        error: `Network check failed: ${error.message}`
      });
    }
  }, [walletClient]);

  // Effect to check network and contract on wallet change
  useEffect(() => {
    checkNetworkAndContract();
  }, [checkNetworkAndContract]);

  // Comprehensive input validation
  const validateInputs = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Network validation
    if (!networkInfo?.isSupported) {
      errors.push({ field: 'network', message: 'Please switch to a supported network (BSC Mainnet or Testnet)' });
    }

    // Contract validation
    if (!contractStatus?.exists) {
      errors.push({ field: 'contract', message: 'Launchpad contract not available on this network' });
    }

    if (!contractStatus?.hasMethod) {
      errors.push({ field: 'contract', message: 'Contract method not available - please check contract ABI' });
    }

    // Token validation
    if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
      errors.push({ field: 'tokenAddress', message: 'Invalid token address' });
    }
    if (!tokenName?.trim()) {
      errors.push({ field: 'tokenName', message: 'Token name is required' });
    }
    if (!tokenSymbol?.trim()) {
      errors.push({ field: 'tokenSymbol', message: 'Token symbol is required' });
    }
    if (!tokenDecimal || tokenDecimal < 1 || tokenDecimal > 18) {
      errors.push({ field: 'tokenDecimal', message: 'Token decimals must be between 1 and 18' });
    }

    // Rate validation
    if (!presaleRate || presaleRate <= 0) {
      errors.push({ field: 'presaleRate', message: 'Presale rate must be greater than 0' });
    }
    if (!listingRate || listingRate <= 0) {
      errors.push({ field: 'listingRate', message: 'Listing rate must be greater than 0' });
    }

    // Cap validation
    if (!softcap || softcap <= 0) {
      errors.push({ field: 'softcap', message: 'Soft cap must be greater than 0' });
    }
    if (!hardcap || hardcap <= 0) {
      errors.push({ field: 'hardcap', message: 'Hard cap must be greater than 0' });
    }
    if (softcap && hardcap && Number(softcap) >= Number(hardcap)) {
      errors.push({ field: 'hardcap', message: 'Hard cap must be greater than soft cap' });
    }

    // Buy limit validation
    if (!minimumBuy || minimumBuy <= 0) {
      errors.push({ field: 'minimumBuy', message: 'Minimum buy must be greater than 0' });
    }
    if (!maximumBuy || maximumBuy <= 0) {
      errors.push({ field: 'maximumBuy', message: 'Maximum buy must be greater than 0' });
    }
    if (minimumBuy && maximumBuy && Number(minimumBuy) >= Number(maximumBuy)) {
      errors.push({ field: 'maximumBuy', message: 'Maximum buy must be greater than minimum buy' });
    }

    // Time validation
    const now = new Date();
    const start = startTime ? new Date(startTime) : null;
    const end = endTime ? new Date(endTime) : null;

    if (!start) {
      errors.push({ field: 'startTime', message: 'Start time is required' });
    } else if (start <= now) {
      errors.push({ field: 'startTime', message: 'Start time must be in the future' });
    }

    if (!end) {
      errors.push({ field: 'endTime', message: 'End time is required' });
    } else if (start && end <= start) {
      errors.push({ field: 'endTime', message: 'End time must be after start time' });
    }

    // Liquidity validation
    if (!liquidity || liquidity < 51 || liquidity > 100) {
      errors.push({ field: 'liquidity', message: 'Liquidity percentage must be between 51% and 100%' });
    }

    // Lock time validation
    if (!liquidityLockup || liquidityLockup < 30) {
      errors.push({ field: 'liquidityLockup', message: 'Liquidity lock time must be at least 30 days' });
    }

    return errors;
  }, [
    networkInfo, contractStatus, tokenAddress, tokenName, tokenSymbol, tokenDecimal, 
    presaleRate, listingRate, softcap, hardcap, minimumBuy, maximumBuy, 
    startTime, endTime, liquidity, liquidityLockup
  ]);

  // Memoized presale data
  const presaleData = useMemo(() => ({
    name: tokenName,
    symbol: tokenSymbol,
    address: tokenAddress,
    approved: approved,
    router,
    bought: 0,
    presaleRate: presaleRate,
    cyclePeriod: 0,
    decimals: tokenDecimal,
    description: description,
    discord: discordLink,
    ended: false,
    endTime: endTime ? new Date(endTime) : new Date(),
    hardcap: hardcap,
    facebook: facebookLink,
    firstRelease: 0,
    github: githubLink,
    instagram: instagramLink,
    liqLockTime: liquidityLockup,
    liqPercent: liquidity,
    listingRate: listingRate,
    logo: logoUrl,
    maxBNB: maximumBuy,
    minBNB: minimumBuy,
    participants: 0,
    telegram: telegramLink,
    twitter: twitterLink,
    website: websiteLink,
    whitelist: whitelist,
    startTime: startTime ? new Date(startTime) : new Date(),
    softcap: softcap,
    reddit: redditLink,
    refundType: refundType,
    tokenPerCycle: 0,
    vestEnabled: vesting || false,
    admin_wallet: wallet
  }), [
    tokenName, tokenSymbol, tokenAddress, approved, router, presaleRate,
    tokenDecimal, description, discordLink, endTime, hardcap, facebookLink,
    githubLink, instagramLink, liquidityLockup, liquidity, listingRate,
    logoUrl, maximumBuy, minimumBuy, telegramLink, twitterLink, websiteLink,
    whitelist, startTime, softcap, redditLink, refundType, vesting, wallet
  ]);

  // Get gas estimate and network fee
  const getGasEstimate = useCallback(async (): Promise<void> => {
    if (!wallet || !walletClient || !tokenAddress || !startTime || !endTime || !networkInfo?.isSupported || !contractStatus?.hasMethod) {
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(walletClient.transport);
      const signer = provider.getSigner();
      const contractAddress = networkInfo.contractAddress!;

      const factoryContract = new ethers.Contract(
        contractAddress,
        BNBLaunchPadFactory.abi,
        signer
      );

      const fee = await factoryContract.flatFee();
      const networkFee = ethers.utils.formatEther(fee);

      const _saleStartTime = Math.floor(new Date(startTime).getTime() / 1000);
      const _saleEndTime = Math.floor(new Date(endTime).getTime() / 1000);
      const refV = refundType === "refund" ? 0 : 1;

      const gasEstimate = await factoryContract.estimateGas.create(
        _saleStartTime,
        _saleEndTime,
        ethers.utils.parseEther((minimumBuy || "0").toString()),
        ethers.utils.parseEther((maximumBuy || "0").toString()),
        tokenAddress,
        ethers.utils.parseEther((hardcap || "0").toString()),
        ethers.utils.parseEther((softcap || "0").toString()),
        presaleRate || 0,
        listingRate || 0,
        liquidity || 0,
        2,
        refV,
        { value: fee }
      );

      setGasInfo({
        estimate: gasEstimate.toString(),
        networkFee
      });
    } catch (error) {
      console.error("Gas estimation failed:", error);
      toast.warning("Could not estimate gas fees. Transaction may still proceed.");
    }
  }, [
    wallet, walletClient, tokenAddress, startTime, endTime, minimumBuy,
    maximumBuy, hardcap, softcap, presaleRate, listingRate,
    liquidity, refundType, networkInfo, contractStatus
  ]);

  // Effect for gas estimation
  useEffect(() => {
    getGasEstimate();
  }, [getGasEstimate]);

  // Effect for validation
  useEffect(() => {
    const errors = validateInputs();
    setValidationErrors(errors);
  }, [validateInputs]);

  // Enhanced error handling for blockchain transactions
  const handleTransactionError = (error: any): string => {
    console.error("Transaction error:", error);

    if (error.code === 4001) {
      return "Transaction rejected by user";
    }
    if (error.code === -32603) {
      return "Internal JSON-RPC error. Please try again.";
    }
    if (error.code === "CALL_EXCEPTION") {
      return "Contract call failed. Please check network connection and contract address.";
    }
    if (error.message?.includes("insufficient funds")) {
      return "Insufficient funds for transaction";
    }
    if (error.message?.includes("gas")) {
      return "Gas estimation failed. Please try again.";
    }
    if (error.message?.includes("nonce")) {
      return "Transaction nonce error. Please reset your wallet and try again.";
    }
    if (error.message?.includes("replacement")) {
      return "Transaction replacement error. Please wait and try again.";
    }

    return `Transaction failed: ${error.message || "Unknown error"}`;
  };

  // Enhanced database save with retry logic
  const savePresaleToDatabase = async (presaleAddress: string, retries = 3): Promise<void> => {
    const dataToSave = { ...presaleData, presaleAddress };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          `api/projects/save`,
          dataToSave,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: REQUEST_TIMEOUT
          }
        );

        console.log("Presale saved to database:", response.data);
        toast.success("Presale recorded in database!");
        return;

      } catch (error: any) {
        console.error(`Database save attempt ${attempt} failed:`, error);

        if (attempt === retries) {
          if (error.code === 'ECONNABORTED') {
            throw new Error("Request timeout. Please check your connection.");
          } else if (error.response?.status === 400) {
            throw new Error("Invalid presale data. Please check your inputs.");
          } else if (error.response?.status === 500) {
            throw new Error("Server error. Please try again later.");
          } else {
            throw new Error("Failed to record presale in database");
          }
        }

        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  };

  // Main presale creation function
  // Replace your existing createPresale function with this fixed version

const createPresale = async (): Promise<void> => {
  const errors = validateInputs();
  if (errors.length > 0) {
    errors.forEach(error => toast.error(error.message));
    return;
  }

  if (!wallet) {
    toast.error("Please connect your wallet first");
    return;
  }
  if (!walletClient) {
    toast.error("No wallet client available. Please connect your wallet.");
    return;
  }

  if (!networkInfo?.contractAddress) {
    toast.error("Contract address not available for current network");
    return;
  }

  setIsLoading(true);

  try {
    const provider = new ethers.providers.Web3Provider(walletClient.transport);
    const signer = provider.getSigner();
    const factoryContract = new ethers.Contract(
      networkInfo.contractAddress,
      BNBLaunchPadFactory.abi,
      signer
    );

    const network = await provider.getNetwork();
    console.log("Current network:", network.name, network.chainId);

    const fee = await factoryContract.flatFee();
    console.log("Factory fee:", ethers.utils.formatEther(fee), "BNB");

    const balance = await signer.getBalance();
    if (balance.lt(fee)) {
      toast.error("Insufficient balance to pay network fee");
      return;
    }

    const _saleStartTime = Math.floor(new Date(startTime!).getTime() / 1000);
    const _saleEndTime = Math.floor(new Date(endTime!).getTime() / 1000);
    const refV = refundType === "refund" ? 0 : 1;

    console.log("Creating presale with parameters:", {
      contractAddress: networkInfo.contractAddress,
      startTime: _saleStartTime,
      endTime: _saleEndTime,
      minimumBuy: ethers.utils.parseEther((minimumBuy || "0").toString()).toString(),
      maximumBuy: ethers.utils.parseEther((maximumBuy || "0").toString()).toString(),
      tokenAddress,
      hardcap: ethers.utils.parseEther((hardcap || "0").toString()).toString(),
      softcap: ethers.utils.parseEther((softcap || "0").toString()).toString(),
      presaleRate: presaleRate || 0,
      listingRate: listingRate || 0,
      liquidity: liquidity || 0,
      refundType: refV,
      fee: ethers.utils.formatEther(fee)
    });

    const tx = await factoryContract.create(
      _saleStartTime,
      _saleEndTime,
      ethers.utils.parseEther((minimumBuy || "0").toString()),
      ethers.utils.parseEther((maximumBuy || "0").toString()),
      tokenAddress,
      ethers.utils.parseEther((hardcap || "0").toString()),
      ethers.utils.parseEther((softcap || "0").toString()),
      presaleRate || 0,
      listingRate || 0,
      liquidity || 0,
      2,
      refV,
      {
        value: fee,
        gasLimit: gasInfo?.estimate ? Math.ceil(Number(gasInfo.estimate) * GAS_MULTIPLIER) : undefined
      }
    );

    toast.info("Transaction submitted. Waiting for confirmation...");
    console.log("Transaction hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    // Check transaction status
    if (receipt.status !== 1) {
      throw new Error("Transaction failed");
    }

    // Method 1: Try to find the event by name (case variations)
    let presaleAddr = null;
    const eventNames = ["presaleCreated", "PresaleCreated", "PreSaleCreated", "NewPresale"];
    
    for (const eventName of eventNames) {
      const event = receipt.events?.find((e: any) => e.event === eventName);
      if (event && event.args && event.args[0]) {
        presaleAddr = event.args[0];
        console.log(`Found event: ${eventName}`, event.args);
        break;
      }
    }

    // Method 2: If no named event found, look for the specific topic hash
    if (!presaleAddr) {
      console.log("Named event not found, searching by topic hash...");
      
      // This is the topic hash from your successful transaction
      const presaleCreatedTopic = "0x7bf7f6bd3b65822f26953a347d9e5d28588e6b9fd0cb5befdc2045045fb68012";
      
      const presaleEvent = receipt.logs.find((log: any) => 
        log.topics[0] === presaleCreatedTopic && 
        log.address.toLowerCase() === networkInfo.contractAddress!.toLowerCase()
      );
      
      if (presaleEvent) {
        // Extract presale address from topics[2] (remove the leading zeros)
        presaleAddr = "0x" + presaleEvent.topics[2].slice(26);
        console.log("Found presale event by topic:", presaleEvent);
        console.log("Extracted presale address:", presaleAddr);
      }
    }

    // Method 3: Parse all logs manually using contract interface
    if (!presaleAddr) {
      console.log("Parsing logs manually...");
      
      try {
        const contractInterface = new ethers.utils.Interface(BNBLaunchPadFactory.abi);
        
        for (const log of receipt.logs) {
          try {
            const parsedLog = contractInterface.parseLog(log);
            console.log("Parsed log:", parsedLog.name, parsedLog.args);
            
            // Check for any event that might contain the presale address
            if (parsedLog.args && parsedLog.args.length > 0) {
              const firstArg = parsedLog.args[0];
              if (ethers.utils.isAddress(firstArg)) {
                presaleAddr = firstArg;
                console.log(`Found presale address in ${parsedLog.name}:`, presaleAddr);
                break;
              }
            }
          } catch (parseError) {
            // Log from different contract, skip
          }
        }
      } catch (interfaceError) {
        console.error("Interface parsing failed:", interfaceError);
      }
    }

    // Method 4: Look for OwnershipTransferred event (indicates new contract deployment)
    if (!presaleAddr) {
      console.log("Looking for OwnershipTransferred event...");
      
      const ownershipTopic = "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0";
      const ownershipEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ownershipTopic && 
        log.topics[2] === ethers.utils.hexZeroPad(wallet.toLowerCase(), 32)
      );
      
      if (ownershipEvent) {
        presaleAddr = ownershipEvent.address;
        console.log("Found presale address from OwnershipTransferred:", presaleAddr);
      }
    }

    if (!presaleAddr) {
      // Log all available events for debugging
      console.log("All events in receipt:", receipt.events);
      console.log("All logs in receipt:", receipt.logs);
      throw new Error("Could not find presale address in transaction receipt. Check console for debug info.");
    }

    if (!ethers.utils.isAddress(presaleAddr)) {
      throw new Error(`Invalid presale address: ${presaleAddr}`);
    }

    console.log("Final presale address:", presaleAddr);
    toast.success("Presale created successfully on blockchain!");

    try {
      await savePresaleToDatabase(presaleAddr);
      
      setPresaleAddress(presaleAddr);
      setApproved(true);

      setTimeout(() => {
        navigate(`/presale/${presaleAddr}`);
      }, 2000);

    } catch (dbError: any) {
      toast.error(dbError.message);
      setPresaleAddress(presaleAddr);
      setApproved(true);
    }

  } catch (err: any) {
    const errorMessage = handleTransactionError(err);
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  const isFormValid = validationErrors.length === 0 && wallet && !isLoading;

  return (
    <div className="submit_page">
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <main className="page_main">
        {/* Network Status */}
        {networkInfo && (
          <div className={`network_status ${networkInfo.isSupported ? 'supported' : 'unsupported'}`}>
            <h3>Network Status</h3>
            <p><strong>Current Network:</strong> {networkInfo.name} (Chain ID: {networkInfo.chainId})</p>
            <p><strong>Status:</strong> {networkInfo.isSupported ? '✅ Supported' : '❌ Unsupported'}</p>
            {networkInfo.contractAddress && (
              <p><strong>Contract:</strong> {networkInfo.contractAddress}</p>
            )}
            {contractStatus && (
              <div className="contract_status">
                <p><strong>Contract Exists:</strong> {contractStatus.exists ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Methods Available:</strong> {contractStatus.hasMethod ? '✅ Yes' : '❌ No'}</p>
                {contractStatus.error && (
                  <p className="error"><strong>Error:</strong> {contractStatus.error}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="presale_summary">
          <h2>Presale Summary</h2>
          
          {validationErrors.length > 0 && (
            <div className="validation_errors">
              <h3>Please fix the following issues:</h3>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index} className="error_item">
                    <strong>{error.field}:</strong> {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="summary_grid">
            <div><strong>Token:</strong> {tokenName} ({tokenSymbol})</div>
            <div><strong>Token Address:</strong> {tokenAddress}</div>
            <div><strong>Decimals:</strong> {tokenDecimal}</div>
            <div><strong>Presale Rate:</strong> {presaleRate} tokens per BNB</div>
            <div><strong>Listing Rate:</strong> {listingRate} tokens per BNB</div>
            <div><strong>Soft Cap:</strong> {softcap} BNB</div>
            <div><strong>Hard Cap:</strong> {hardcap} BNB</div>
            <div><strong>Min Buy:</strong> {minimumBuy} BNB</div>
            <div><strong>Max Buy:</strong> {maximumBuy} BNB</div>
            <div><strong>Liquidity:</strong> {liquidity}%</div>
            <div><strong>Liquidity Lock:</strong> {liquidityLockup} days</div>
            <div><strong>Start:</strong> {startTime ? new Date(startTime).toLocaleString() : 'Not set'}</div>
            <div><strong>End:</strong> {endTime ? new Date(endTime).toLocaleString() : 'Not set'}</div>
            <div><strong>Refund Type:</strong> {refundType}</div>
          </div>

          {gasInfo && (
            <div className="fee_info">
              <p><strong>Network Fee:</strong> {gasInfo.networkFee} BNB</p>
              <p><strong>Estimated Gas:</strong> {gasInfo.estimate}</p>
            </div>
          )}
        </div>

        <div className="form_buttons">
          {!approved && (
            <button
              onClick={createPresale}
              disabled={!isFormValid}
              className={`submit_button ${isLoading ? 'loading' : ''} ${!isFormValid ? 'disabled' : ''}`}
              title={!isFormValid ? 'Please fix validation errors and connect wallet' : ''}
            >
              {isLoading ? 'Creating Presale...' : 'Submit Presale'}
            </button>
          )}

          {approved && presaleAddress && (
            <div className="success_message">
              <p>✅ Presale created successfully!</p>
              <p><strong>Address:</strong> {presaleAddress}</p>
              <Link to={`/presale/${presaleAddress}`} className="view_presale_btn">
                View Presale
              </Link>
            </div>
          )}

          {!wallet && (
            <p className="wallet_warning">
              Please connect your wallet to create a presale
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Submit_Page;