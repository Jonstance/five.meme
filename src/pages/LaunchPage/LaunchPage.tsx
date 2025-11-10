import "./LaunchPage.css";
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import projectImg from "../../assets/logos/launch.svg";
import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { PresaleContext } from "../../setup/context/PresaleContext";
import { useParams } from "react-router";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { NewProjectDto } from "../../dto/project.dto";
import twitterImg from "../../assets/logos/twitter_i.svg";
import facebookImg from "../../assets/logos/facebook_i.svg";
import instagramImg from "../../assets/logos/instagram_i.svg";
import redditImg from "../../assets/logos/reddit_i.svg";
import discordImg from "../../assets/logos/discord_i.svg";
import telegramImg from "../../assets/logos/telegram_i.svg";
import webImg from "../../assets/logos/web_i.svg";
import BNBLaunchPad from "../../ABIs/BNBLaunchPad.json";
import { ethers } from "ethers";
import WalletContext from "../../setup/context/walletContext";
import { useAccount, useClient, useWalletClient } from 'wagmi';

// Add new interfaces for enhanced features
interface CountdownTimer {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface InvestmentState {
  amount: string;
  tokensReceived: string;
  isInvesting: boolean;
  minContribution: string;
  maxContribution: string;
}

interface UserData {
  contribution: string;
  claimableTokens: string;
  hasClaimed: boolean;
  releasableTokens: string;
}


const LaunchPage = () => {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Original state
  const [data, setData] = useState<NewProjectDto>({
    name: '',
    symbol: '',
    hardcap: 0,
    softcap: 0,
    presaleRate: 0,
    listingRate: 0,
    liqPercent: 0,
    liqLockTime: 0
  });
  const [totalBnbContributed, setTotalBnbContributed] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);


  // Enhanced state for new features
  const [timeLeft, setTimeLeft] = useState<CountdownTimer>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [investment, setInvestment] = useState<InvestmentState>({
    amount: '',
    tokensReceived: '0',
    isInvesting: false,
    minContribution: '',
    maxContribution: ''
  });
  
  // Updated user data state
  const [userData, setUserData] = useState<UserData>({
    contribution: '0',
    claimableTokens: '0',
    hasClaimed: false,
    releasableTokens: '0'
  });
  const [presaleContract, setPresaleContract] = useState<ethers.Contract | null>(null);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [contractBalances, setContractBalances] = useState({ bnb: '0', tokens: '0' });

  const baseUrl: string = "/api";

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (!data?.hardcap || !totalBnbContributed) return 0;
    return (parseFloat(totalBnbContributed) / data.hardcap) * 100;
  }, [totalBnbContributed, data?.hardcap]);

  // Fix the getStatus function with correct logic
  const getStatus = useCallback(() => {
    if (!data?.startTime || !data?.endTime) return 'Unknown';
    
    const startDate = new Date(data.startTime);
    const endDate = new Date(data.endTime);
    const now = new Date();
    const contributedAmount = parseFloat(totalBnbContributed);

    console.log("Status Debug:", {
      now: now.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      contributedAmount,
      hardcap: data.hardcap,
      softcap: data.softcap,
      dbStatus: data.status
    });

    // If manually set to finalize in database
    if (data.status === "Finalise") return "Finalised";
    
    // Check if presale hasn't started yet
    if (now < startDate) return "Coming Soon";
    
    // Check if presale has ended (current time is past end time)
    if (now > endDate) {
      // Check if soft cap was reached
      if (contributedAmount >= (data.softcap || 0)) {
        return "Completed"; // Successful presale
      } else {
        return "Failed"; // Didn't reach soft cap
      }
    }
    
    // Presale is currently running (between start and end time)
    if (now >= startDate && now <= endDate) {
      // Check if hard cap reached during presale
      if (contributedAmount >= (data.hardcap || 0)) {
        return "Completed"; // Hard cap reached, presale ends early
      } else {
        return "Live"; // Presale is active
      }
    }
    
    return "Unknown";
  }, [data?.startTime, data?.endTime, data?.status, data?.hardcap, data?.softcap, totalBnbContributed]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Live":
        return "live";
      case "Completed":
        return "completed";
      case "Failed":
        return "failed";
      case "Coming Soon":
        return "coming-soon";
      case "Finalised":
        return "finalised";
      default:
        return "";
    }
  };

  
  // Update the countdown timer to handle expired time better
  useEffect(() => {
    if (!data?.endTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = data.endTime ? new Date(data.endTime).getTime() : new Date().getTime();
      const difference = endTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        // Time has expired - set all to 0
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.endTime]);

  // Calculate tokens received
  useEffect(() => {
    if (investment.amount && data?.presaleRate && !isNaN(parseFloat(investment.amount))) {
      const calculatedTokens = parseFloat(investment.amount) * parseFloat(String(data.presaleRate || '0'));
      const tokens = calculatedTokens.toFixed(8);
      setInvestment(prev => ({ ...prev, tokensReceived: tokens }));
    } else {
      setInvestment(prev => ({ ...prev, tokensReceived: '0' }));
    }
  }, [investment.amount, data?.presaleRate]);

  // Original data fetching
  useEffect(() => {
    if (params?.id) {
      setIsLoading(true);
      axios.get(`${baseUrl}/projects/${params.id}`)
        .then(res => setData(res.data))
        .catch(err => {
          console.error("Failed to load project", err);
          setError("Failed to load project details");
          toast.error("Failed to load project details");
        })
        .finally(() => setIsLoading(false));
    }
  }, [params?.id]);

  // Enhanced contract interaction
  const initializeContract = useCallback(async () => {
    if (!isConnected || !data?.presaleAddress || !walletClient) {
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(walletClient.transport);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        data.presaleAddress,
        BNBLaunchPad.output.abi,
        signer
      );
      
      setPresaleContract(contract);
    } catch (err) {
      console.error("Error initializing contract:", err);
      toast.error("Failed to initialize presale contract");
    }
  }, [isConnected, data?.presaleAddress, walletClient]);

  const fetchTotalContributed = async () => {
    if (!data?.presaleAddress) return;

    try {
      let provider;
      
      // Use wallet client if available, otherwise use public RPC
      if (walletClient && isConnected) {
        provider = new ethers.providers.Web3Provider(walletClient.transport);
      } else {
        // Use public BSC RPC when wallet is not connected
        provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
      }

      const contract = new ethers.Contract(data.presaleAddress, BNBLaunchPad.output.abi, provider);

      // Check if contract exists
      const contractCode = await provider.getCode(data.presaleAddress);
      if (contractCode === '0x') {
        console.warn("Contract not deployed at address:", data.presaleAddress);
        return;
      }

      const rawValue = await contract.totalBNBReceivedInAllTier();
      const contribution = ethers.utils.formatEther(rawValue);
      setTotalBnbContributed(contribution);
    } catch (err) {
      console.error("Error fetching total contribution:", err);
      setTotalBnbContributed('0');
    }
  };

  // FIXED: User's contribution using correct function name
  const fetchUserContribution = useCallback(async () => {
    if (!isConnected || !data?.presaleAddress || !address || !walletClient) return;

    try {
      const provider = new ethers.providers.Web3Provider(walletClient.transport);
      const contract = new ethers.Contract(data.presaleAddress, BNBLaunchPad.output.abi, provider);
      
      const userContrib = await contract.amountBoughtInBNB(address);
      const contribution = ethers.utils.formatEther(userContrib);
      
      setUserData(prev => ({ ...prev, contribution }));
    } catch (err) {
      console.error("Error fetching user contribution:", err);
      setUserData(prev => ({ ...prev, contribution: '0' }));
    }
  }, [isConnected, data?.presaleAddress, address, walletClient]);

  // Get user's claimable token balance
  const fetchUserClaimableTokens = useCallback(async () => {
    if (!isConnected || !data?.presaleAddress || !address || !walletClient) return;

    try {
      const provider = new ethers.providers.Web3Provider(walletClient.transport);
      const contract = new ethers.Contract(data.presaleAddress, BNBLaunchPad.output.abi, provider);
      
      const claimableBalance = await contract.claimableTokenBalance(address);
      const tokens = ethers.utils.formatEther(claimableBalance);
      
      setUserData(prev => ({ ...prev, claimableTokens: tokens }));
    } catch (err) {
      console.error("Error fetching claimable tokens:", err);
      setUserData(prev => ({ ...prev, claimableTokens: '0' }));
    }
  }, [isConnected, data?.presaleAddress, address, walletClient]);

  // Check if user has already claimed tokens
  const checkUserClaimedStatus = useCallback(async () => {
    if (!isConnected || !data?.presaleAddress || !address || !walletClient) return;

    try {
      const provider = new ethers.providers.Web3Provider(walletClient.transport);
      const contract = new ethers.Contract(data.presaleAddress, BNBLaunchPad.output.abi, provider);
      
      const hasClaimed = await contract.userClaimedTokens(address);
      
      setUserData(prev => ({ ...prev, hasClaimed }));
    } catch (err) {
      console.error("Error fetching claim status:", err);
      setUserData(prev => ({ ...prev, hasClaimed: false }));
    }
  }, [isConnected, data?.presaleAddress, address, walletClient]);

  // Get calculated releasable tokens (for vesting)
  const fetchCalculatedReleasedTokens = useCallback(async () => {
    if (!isConnected || !data?.presaleAddress || !walletClient) return;

    try {
      const provider = new ethers.providers.Web3Provider(walletClient.transport);
      const contract = new ethers.Contract(data.presaleAddress, BNBLaunchPad.output.abi, provider);
      
      const releasedTokens = await contract.calculateReleasedTokens();
      const tokens = ethers.utils.formatEther(releasedTokens);
      
      setUserData(prev => ({ ...prev, releasableTokens: tokens }));
    } catch (err) {
      console.error("Error fetching released tokens:", err);
      setUserData(prev => ({ ...prev, releasableTokens: '0' }));
    }
  }, [isConnected, data?.presaleAddress, walletClient]);

  // Get contract balances
  const fetchContractBalances = useCallback(async () => {
    if (!data?.presaleAddress) return;

    try {
      let provider;
      
      // Use wallet client if available, otherwise use public RPC
      if (walletClient && isConnected) {
        provider = new ethers.providers.Web3Provider(walletClient.transport);
      } else {
        // Use public BSC RPC when wallet is not connected
        provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
      }

      const contract = new ethers.Contract(data.presaleAddress, BNBLaunchPad.output.abi, provider);
      
      const [bnbBalance, tokenBalance] = await contract.checkBalancesOfContract();
      
      setContractBalances({
        bnb: ethers.utils.formatEther(bnbBalance),
        tokens: ethers.utils.formatEther(tokenBalance)
      });
    } catch (err) {
      console.error("Error fetching contract balances:", err);
    }
  }, [isConnected, data?.presaleAddress, walletClient]);

  // Comprehensive user data fetch
  const fetchAllUserData = useCallback(async () => {
    if (!isConnected || !address) return;
    
    await Promise.all([
      fetchUserContribution(),
      fetchUserClaimableTokens(),
      checkUserClaimedStatus(),
      fetchCalculatedReleasedTokens()
    ]);
  }, [
    fetchUserContribution,
    fetchUserClaimableTokens,
    checkUserClaimedStatus,
    fetchCalculatedReleasedTokens,
    isConnected,
    address
  ]);

  // Investment function - Updated to use buyTokens() instead of contribute()
  const handleInvestment = useCallback(async () => {
    if (!presaleContract || !investment.amount || parseFloat(investment.amount) <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }

    if (parseFloat(investment.amount) < parseFloat(investment.minContribution)) {
      toast.error(`Minimum contribution is ${investment.minContribution} BNB`);
      return;
    }

    if (parseFloat(investment.amount) > parseFloat(investment.maxContribution)) {
      toast.error(`Maximum contribution is ${investment.maxContribution} BNB`);
      return;
    }

    setInvestment(prev => ({ ...prev, isInvesting: true }));

    try {
      const amountInWei = ethers.utils.parseEther(investment.amount);
      
      // Use buyTokens() function instead of contribute()
      const tx = await presaleContract.buyTokens({ value: amountInWei });
      
      toast.info("Transaction submitted! Please wait for confirmation...", {
        autoClose: 5000,
      });

      await tx.wait();
      
      toast.success("Investment successful! 🎉", {
        autoClose: 5000,
      });

      // Refresh data
      await fetchTotalContributed();
      await fetchAllUserData();
      
      // Reset investment form
      setInvestment(prev => ({ ...prev, amount: '', tokensReceived: '0' }));

    } catch (err: any) {
      console.error("Investment error:", err);
      
      if (err.code === 4001) {
        toast.error("Transaction cancelled by user");
      } else if (err.message?.includes("insufficient funds")) {
        toast.error("Insufficient BNB balance");
      } else if (err.message?.includes("purchase cannot exceed hardCap")) {
        toast.error("Purchase would exceed hard cap. Try a smaller amount.");
      } else if (err.message?.includes("The sale has not started yet")) {
        toast.error("The presale has not started yet");
      } else if (err.message?.includes("The sale is closed")) {
        toast.error("The presale has ended");
      } else if (err.message?.includes("investing more than your limit")) {
        toast.error("You are investing more than your allocation limit");
      } else if (err.message?.includes("purchasing Power is so Low")) {
        toast.error("Investment amount is below the minimum required");
      } else if (err.message?.includes("No a whitelisted address")) {
        toast.error("You are not whitelisted for this presale");
      } else {
        toast.error("Investment failed. Please try again.");
      }
    } finally {
      setInvestment(prev => ({ ...prev, isInvesting: false }));
    }
  }, [presaleContract, investment, fetchTotalContributed, fetchAllUserData]);

  // Claim tokens function
  const handleClaimTokens = useCallback(async () => {
    if (!presaleContract) {
      toast.error("Contract not initialized");
      return;
    }

    if (userData.hasClaimed) {
      toast.error("You have already claimed your tokens");
      return;
    }

    if (parseFloat(userData.claimableTokens) <= 0) {
      toast.error("No tokens available to claim");
      return;
    }

    setIsClaimingTokens(true);

    try {
      const tx = await presaleContract.claimTokens();
      
      toast.info("Claiming tokens... Please wait for confirmation", {
        autoClose: 5000,
      });

      await tx.wait();
      
      toast.success("Tokens claimed successfully! 🎉", {
        autoClose: 5000,
      });

      // Refresh user data
      await fetchAllUserData();

    } catch (err: any) {
      console.error("Claim error:", err);
      
      if (err.code === 4001) {
        toast.error("Transaction cancelled by user");
      } else if (err.message?.includes("User cannot claim tokens till sale is finalized")) {
        toast.error("You cannot claim tokens until the presale is finalized");
      } else if (err.message?.includes("User has already claimed")) {
        toast.error("You have already claimed your tokens");
      } else if (err.message?.includes("You must claim at least")) {
        toast.error("Claimable amount too small. Wait for more tokens to vest.");
      } else {
        toast.error("Failed to claim tokens. Please try again.");
      }
    } finally {
      setIsClaimingTokens(false);
    }
  }, [presaleContract, userData.hasClaimed, userData.claimableTokens, fetchAllUserData]);

  

  // Quick amount selection
  const handleQuickAmount = useCallback((amount: string) => {
    setInvestment(prev => ({ ...prev, amount }));
  }, []);

  useEffect(() => {
    if (data?.presaleAddress) {
      fetchTotalContributed();
      fetchAllUserData();
      fetchContractBalances();
      initializeContract();
    }
  }, [data?.presaleAddress, fetchAllUserData, fetchContractBalances, initializeContract]);

  // Get current status for display
  const currentStatus = getStatus();
  const isPresaleEnded = currentStatus === "Completed" || currentStatus === "Failed" || currentStatus === "Finalised";

  const handleWithdrawContribution = useCallback(async () => {
  if (!presaleContract) {
    toast.error("Contract not initialized");
    return;
  }

  if (parseFloat(userData.contribution) <= 0) {
    toast.error("No contribution to withdraw");
    return;
  }

  if (currentStatus !== "Failed") {
    toast.error("Withdrawal only available for failed presales");
    return;
  }

  setIsWithdrawing(true);

  try {
    const tx = await presaleContract.withdrawContribution();
    
    toast.info("Withdrawing contribution... Please wait for confirmation", {
      autoClose: 5000,
    });

    await tx.wait();
    
    toast.success("Contribution withdrawn successfully! 💰", {
      autoClose: 5000,
    });

    // Refresh user data
    await fetchAllUserData();
    await fetchTotalContributed();

  } catch (err: any) {
    console.error("Withdrawal error:", err);
    
    if (err.code === 4001) {
      toast.error("Transaction cancelled by user");
    } else if (err.message?.includes("please wait till sale ends")) {
      toast.error("Please wait until the sale has ended");
    } else if (err.message?.includes("Cannot withdraw. Sale Exceeds softCap")) {
      toast.error("Cannot withdraw - presale reached soft cap");
    } else {
      toast.error("Failed to withdraw contribution. Please try again.");
    }
  } finally {
    setIsWithdrawing(false);
  }
}, [presaleContract, userData.contribution, currentStatus, fetchAllUserData, fetchTotalContributed]);



  if (isLoading) {
    return (
      <div className="launchpage">
        <Navbar />
        <main className="page_wrapper">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading project details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="launchpage">
        <Navbar />
        <main className="page_wrapper">
          <div className="error">
            <h3>⚠️ Error Loading Project</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="launchpage">
      <ToastContainer position="top-right" />
      <Navbar />
      <main className="page_wrapper">
        {/* Enhanced Header Section */}
        <div className="top_section">
          <div className="presale-status-badge">
            <span className={`status-indicator ${getStatusClass(currentStatus)}`}></span>
            <span>Status: {currentStatus}</span>
          </div>
          
          <div className="logo_and_name">
            <div className="logo_img">
              <img src={data?.logo} alt="Project logo" />
            </div>
            <div className="project_info">
              <h1 className="project_name">{data?.name}</h1>
              <div className="project_symbol">${data?.symbol}</div>
            </div>
          </div>
          
          <div className="description">
            <p>{data?.description}</p>
          </div>

          {/* Countdown Timer - Updated to show different message when ended */}
          {data?.endTime && (
            <div className="countdown-section">
              {!isPresaleEnded && timeLeft.days + timeLeft.hours + timeLeft.minutes + timeLeft.seconds > 0 ? (
                <>
                  <h3>⏰ Presale Ends In:</h3>
                  <div className="countdown-timer">
                    <div className="time-unit">
                      <span className="time-value">{timeLeft.days}</span>
                      <span className="time-label">Days</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-value">{timeLeft.hours}</span>
                      <span className="time-label">Hours</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-value">{timeLeft.minutes}</span>
                      <span className="time-label">Minutes</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-value">{timeLeft.seconds}</span>
                      <span className="time-label">Seconds</span>
                    </div>
                  </div>
                </>
              ) : currentStatus === "Coming Soon" ? (
                <>
                  <h3>🚀 Presale Starts In:</h3>
                  <div className="countdown-timer">
                    <div className="time-unit">
                      <span className="time-value">{timeLeft.days}</span>
                      <span className="time-label">Days</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-value">{timeLeft.hours}</span>
                      <span className="time-label">Hours</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-value">{timeLeft.minutes}</span>
                      <span className="time-label">Minutes</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-value">{timeLeft.seconds}</span>
                      <span className="time-label">Seconds</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="presale-ended">
                  <h3>
                    {currentStatus === "Completed" && "🎉 Presale Completed Successfully!"}
                    {currentStatus === "Failed" && "❌ Presale Failed - Soft Cap Not Reached"}
                    {currentStatus === "Finalised" && "✅ Presale Finalised"}
                  </h3>
                  <p>
                    {currentStatus === "Completed" && "The presale has ended and reached its funding goal."}
                    {currentStatus === "Failed" && "The presale has ended without reaching the minimum funding requirement."}
                    {currentStatus === "Finalised" && "The presale has been finalized and tokens are ready for distribution."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <div className="progress-header">
            <h3>🚀 Funding Progress</h3>
            <span className="progress-percentage">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="progress-labels">
            <span>{totalBnbContributed} BNB Raised</span>
            <span>Goal: {data?.hardcap} BNB</span>
          </div>
        </div>

        {/* Investment Panel - Updated to handle different states */}
        <div className="investment-panel">
          <h3>
            {currentStatus === "Live" && "💰 Invest Now"}
            {currentStatus === "Coming Soon" && "⏳ Presale Starting Soon"}
            {currentStatus === "Completed" && "✅ Presale Completed"}
            {currentStatus === "Failed" && "❌ Presale Failed"}
            {currentStatus === "Finalised" && "🎯 Presale Finalised"}
          </h3>
          
          {isConnected ? (
            <div className="investment-form">
              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-label">Your Contribution:</span>
                  <span className="stat-value">{userData.contribution} BNB</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Claimable Tokens:</span>
                  <span className="stat-value">{userData.claimableTokens} {data?.symbol}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Wallet:</span>
                  <span className="stat-value">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}</span>
                </div>
                {parseFloat(userData.releasableTokens) > 0 && (
                  <div className="stat-item">
                    <span className="stat-label">Releasable Tokens:</span>
                    <span className="stat-value">{userData.releasableTokens} {data?.symbol}</span>
                  </div>
                )}
              </div>

              {/* Only show investment form if presale is live */}
              {currentStatus === "Live" && (
                <>
                  <div className="investment-input">
                    <label htmlFor="investment-amount">Investment Amount (BNB)</label>
                    <input
                      id="investment-amount"
                      type="number"
                      value={investment.amount}
                      onChange={(e) => setInvestment(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder={`Min: ${investment.minContribution} BNB`}
                      min={investment.minContribution}
                      max={investment.maxContribution}
                      step="0.01"
                    />
                    <div className="tokens-received">
                      You will receive: <strong>{investment.tokensReceived} {data?.symbol}</strong>
                    </div>
                  </div>

                  <div className="quick-amounts">
                    {['0.1', '0.5', '1', '2', '5'].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleQuickAmount(amount)}
                        className="quick-amount-btn"
                        disabled={investment.isInvesting}
                      >
                        {amount} BNB
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Show appropriate message based on status */}
              {currentStatus === "Coming Soon" && (
                <div className="status-message">
                  <p>⏳ The presale hasn't started yet. Please wait for the start time.</p>
                </div>
              )}

              {currentStatus === "Failed" && (
                <div className="status-message failed">
                  <p>❌ This presale failed to reach its soft cap. You can withdraw your contribution if you participated.</p>
                </div>
              )}

              <div className="action-buttons">
                {/* Investment button - only show when live */}
                {currentStatus === "Live" && (
                  <button
                    onClick={handleInvestment}
                    disabled={!investment.amount || investment.isInvesting || parseFloat(investment.amount) <= 0}
                    className="invest-btn"
                  >
                    {investment.isInvesting ? (
  <>
    <div className="btn-spinner"></div>
    Investing...
  </>
) : (
  `Invest ${investment.amount || '0'} BNB`
)}
                  </button>
                )}
                              {/* Enhanced failed presale UI */}

{currentStatus === "Failed" && (
  <div className="failed-presale-info">
    <div className="failure-details">
      <h4>💔 Presale Failed</h4>
      <div className="failure-stats">
        <div className="stat">
          <span>Raised:</span>
          <span>{totalBnbContributed} BNB</span>
        </div>
        <div className="stat">
          <span>Soft Cap:</span>
          <span>{data?.softcap} BNB</span>
        </div>
        <div className="stat">
          <span>Shortfall:</span>
          <span>{(data?.softcap ?? 0 - parseFloat(totalBnbContributed)).toFixed(4)} BNB</span>
        </div>
      </div>
      <p>
        This presale did not reach its minimum funding goal of {data?.softcap} BNB. 
        All participants can now withdraw their contributions.
      </p>
    </div>
    
    {parseFloat(userData.contribution) > 0 ? (
      <div className="withdrawal-section">
        <div className="user-contribution">
          <span>Your Contribution: <strong>{userData.contribution} BNB</strong></span>
        </div>
        <button
          onClick={handleWithdrawContribution}
          disabled={isWithdrawing}
          className="withdraw-btn primary"
        >
          {isWithdrawing ? (
            <>
              <div className="btn-spinner"></div>
              Processing Withdrawal...
            </>
          ) : (
            <>
              💰 Withdraw {userData.contribution} BNB
            </>
          )}
        </button>
        <small>
          Click to withdraw your contribution back to your wallet. 
          This transaction will return your BNB minus gas fees.
        </small>
      </div>
    ) : (
      <div className="no-contribution">
        <p>You did not participate in this presale.</p>
      </div>
    )}
  </div>
)}

                {/* Claim Tokens Button - show when tokens are available */}
                {(currentStatus === "Completed" || currentStatus === "Finalised") && parseFloat(userData.claimableTokens) > 0 && (
                  <button
                    onClick={handleClaimTokens}
                    disabled={isClaimingTokens || userData.hasClaimed}
                    className="claim-btn"
                  >
                    {isClaimingTokens ? (
                      <>
                        <div className="btn-spinner"></div>
                        Claiming...
                      </>
                    ) : userData.hasClaimed ? (
                      "Already Claimed"
                    ) : (
                      `Claim ${userData.claimableTokens} ${data?.symbol}`
                    )}
                  </button>
                )}
              </div>

              <div className="investment-info">
                <small>
                  {currentStatus === "Live" && (
                    <>
                      • Min: {investment.minContribution} BNB | Max: {investment.maxContribution} BNB<br/>
                      • Rate: {data?.presaleRate} {data?.symbol}/BNB<br/>
                      • Tokens will be distributed after presale ends<br/>
                    </>
                  )}
                  {currentStatus === "Completed" && (
                    <>
                      • Presale successfully completed<br/>
                      • Tokens are available for claiming<br/>
                    </>
                  )}
                  {currentStatus === "Failed" && (
                    <>
                      • Presale failed to reach soft cap<br/>
                      • You can withdraw your contribution<br/>
                    </>
                  )}
                  {userData.hasClaimed && <span style={{color: 'green'}}>✅ You have already claimed your tokens</span>}
                </small>
              </div>
            </div>
          ) : (
            <div className="connect-wallet-prompt">
              <h4>🔗 Connect Your Wallet</h4>
              <p>
                {currentStatus === "Live" 
                  ? "Connect your wallet to participate in the presale"
                  : "Connect your wallet to view your participation details"
                }
              </p>
              <button className="connect-wallet-btn">
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Social Media Links */}
        <div className="sm_links">
          <h4>🌐 Join Our Community</h4>
          <div className="social-icons">
            {data?.website && (
              <button onClick={() => window.open(`${data.website}`, "_blank")} className="social-btn">
                <img src={webImg} alt="Website" />
                <span>Website</span>
              </button>
            )}
            {data?.twitter && (
              <button onClick={() => window.open(`${data.twitter}`, "_blank")} className="social-btn">
                <img src={twitterImg} alt="Twitter" />
                <span>Twitter</span>
              </button>
            )}
            {data?.telegram && (
              <button onClick={() => window.open(`${data.telegram}`, "_blank")} className="social-btn">
                <img src={telegramImg} alt="Telegram" />
                <span>Telegram</span>
              </button>
            )}
            {data?.discord && (
              <button onClick={() => window.open(`${data.discord}`, "_blank")} className="social-btn">
                <img src={discordImg} alt="Discord" />
                <span>Discord</span>
              </button>
            )}
            {data?.facebook && (
              <button onClick={() => window.open(`${data.facebook}`, "_blank")} className="social-btn">
                <img src={facebookImg} alt="Facebook" />
                <span>Facebook</span>
              </button>
            )}
            {data?.instagram && (
              <button onClick={() => window.open(`${data.instagram}`, "_blank")} className="social-btn">
                <img src={instagramImg} alt="Instagram" />
                <span>Instagram</span>
              </button>
            )}
            {data?.reddit && (
              <button onClick={() => window.open(`${data.reddit}`, "_blank")} className="social-btn">
                <img src={redditImg} alt="Reddit" />
                <span>Reddit</span>
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Summary Card */}
        <div className="summary_card">
          <h3>📊 Presale Details</h3>
          <div className="summary_details">
            <div className="detail_row highlight">
              <span>Total Contributed:</span>
              <span className="amount">{totalBnbContributed} BNB</span>
            </div>
            <div className="detail_row">
              <span>Soft Cap:</span>
              <span>{data?.softcap} BNB</span>
            </div>
            <div className="detail_row">
              <span>Hard Cap:</span>
              <span>{data?.hardcap} BNB</span>
            </div>
            <div className="detail_row">
              <span>Presale Rate:</span>
              <span>{data?.presaleRate} {data?.symbol}/BNB</span>
            </div>
            <div className="detail_row">
              <span>Listing Rate:</span>
              <span>{data?.listingRate} {data?.symbol}/BNB</span>
            </div>
            <div className="detail_row">
              <span>Liquidity %:</span>
              <span>{data?.liqPercent}%</span>
            </div>
            <div className="detail_row">
              <span>Lock Period:</span>
              <span>{data?.liqLockTime} days</span>
            </div>
            {data?.vestEnabled && (
              <>
                <div className="detail_row">
                  <span>First Release:</span>
                  <span>{data?.firstRelease}%</span>
                </div>
                <div className="detail_row">
                  <span>Vesting Period:</span>
                  <span>{data?.cyclePeriod} days</span>
                </div>
              </>
            )}
          </div>

          {/* Contract Balances (for debugging/transparency) */}
          <div className="contract-balances">
            <h4>🏦 Contract Balances</h4>
            <div className="balance-info">
              <div className="balance-item">
                <span>Contract BNB:</span>
                <span>{contractBalances.bnb} BNB</span>
              </div>
              <div className="balance-item">
                <span>Contract Tokens:</span>
                <span>{contractBalances.tokens} {data?.symbol}</span>
              </div>
            </div>
          </div>

          {/* Contract Address */}
          {data?.presaleAddress && (
            <div className="contract-info">
              <h4>📄 Contract Address</h4>
              <div className="contract-address">
                <code>{data.presaleAddress}</code>
                <button 
                  onClick={() => {
                    if (data.presaleAddress) {
                      navigator.clipboard.writeText(data.presaleAddress);
                      toast.success("Contract address copied!");
                    }
                  }}
                  className="copy-btn"
                >
                  📋
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LaunchPage;