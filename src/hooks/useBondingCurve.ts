import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import BondingCurveLaunchABI from '../ABIs/BondingCurveLaunch.json';

interface MarketStats {
  currentPrice: string;
  marketCap: string;
  liquidityBNB: string;
  progressPercent: number;
  holdersCount: number;
  isGraduated: boolean;
}

interface UserBalance {
  bnb: string;
  tokens: string;
}

export const useBondingCurve = (launchAddress: string) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance>({ bnb: '0', tokens: '0' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract
  useEffect(() => {
    if (!walletClient || !launchAddress) return;

    try {
      const provider = new ethers.providers.Web3Provider(walletClient as any);
      const signer = provider.getSigner();

      const bondingContract = new ethers.Contract(
        launchAddress,
        BondingCurveLaunchABI.abi,
        signer
      );

      setContract(bondingContract);
      setError(null);
    } catch (err: any) {
      console.error('Error initializing contract:', err);
      setError(err.message);
    }
  }, [walletClient, launchAddress]);

  // Load market stats
  const loadMarketStats = useCallback(async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      const stats = await contract.getMarketStats();

      setMarketStats({
        currentPrice: ethers.utils.formatEther(stats.currentPrice),
        marketCap: ethers.utils.formatEther(stats.marketCap),
        liquidityBNB: ethers.utils.formatEther(stats.liquidityBNB),
        progressPercent: stats.progressPercent.toNumber(),
        holdersCount: stats.holdersCount.toNumber(),
        isGraduated: stats.isGraduated
      });

      setError(null);
    } catch (err: any) {
      console.error('Error loading market stats:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Load user balance
  const loadUserBalance = useCallback(async () => {
    if (!contract || !address || !walletClient) return;

    try {
      const provider = new ethers.providers.Web3Provider(walletClient as any);

      // Get BNB balance
      const bnbBalance = await provider.getBalance(address);

      // Get token balance from contract
      const tokenBalance = await contract.tokenBalance(address);

      setUserBalance({
        bnb: ethers.utils.formatEther(bnbBalance),
        tokens: ethers.utils.formatEther(tokenBalance)
      });
    } catch (err: any) {
      console.error('Error loading user balance:', err);
    }
  }, [contract, address, walletClient]);

  // Calculate tokens for BNB
  const calculateTokensForBNB = useCallback(async (bnbAmount: string): Promise<string> => {
    if (!contract || !bnbAmount || parseFloat(bnbAmount) <= 0) return '0';

    try {
      const bnbWei = ethers.utils.parseEther(bnbAmount);
      const tokens = await contract.calculateTokensForBNB(bnbWei);
      return ethers.utils.formatEther(tokens);
    } catch (err: any) {
      console.error('Error calculating tokens:', err);
      return '0';
    }
  }, [contract]);

  // Calculate BNB for tokens
  const calculateBNBForTokens = useCallback(async (tokenAmount: string): Promise<string> => {
    if (!contract || !tokenAmount || parseFloat(tokenAmount) <= 0) return '0';

    try {
      const tokensWei = ethers.utils.parseEther(tokenAmount);
      const bnb = await contract.calculateBNBForTokens(tokensWei);
      return ethers.utils.formatEther(bnb);
    } catch (err: any) {
      console.error('Error calculating BNB:', err);
      return '0';
    }
  }, [contract]);

  // Buy tokens
  const buyTokens = useCallback(async (bnbAmount: string, referrer?: string) => {
    if (!contract) throw new Error('Contract not initialized');

    const bnbWei = ethers.utils.parseEther(bnbAmount);
    const referrerAddress = referrer || ethers.constants.AddressZero;

    const tx = await contract.buyTokens(referrerAddress, { value: bnbWei });
    return tx.wait();
  }, [contract]);

  // Sell tokens
  const sellTokens = useCallback(async (tokenAmount: string) => {
    if (!contract) throw new Error('Contract not initialized');

    const tokensWei = ethers.utils.parseEther(tokenAmount);
    const tx = await contract.sellTokens(tokensWei);
    return tx.wait();
  }, [contract]);

  // Claim tokens
  const claimTokens = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');

    const tx = await contract.claimTokens();
    return tx.wait();
  }, [contract]);

  // Claim referral earnings
  const claimReferralEarnings = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');

    const tx = await contract.claimReferralEarnings();
    return tx.wait();
  }, [contract]);

  // Get referral earnings
  const getReferralEarnings = useCallback(async (): Promise<string> => {
    if (!contract || !address) return '0';

    try {
      const earnings = await contract.referralEarnings(address);
      return ethers.utils.formatEther(earnings);
    } catch (err: any) {
      console.error('Error getting referral earnings:', err);
      return '0';
    }
  }, [contract, address]);

  // Check rush mode
  const checkRushMode = useCallback(async (): Promise<{ active: boolean; timeLeft: number }> => {
    if (!contract || !address) return { active: false, timeLeft: 0 };

    try {
      const [lastBuyTime, rushModeEnd] = await Promise.all([
        contract.lastBuyTime(address),
        contract.rushModeEnd()
      ]);

      const now = Math.floor(Date.now() / 1000);
      const rushModeActive = now < rushModeEnd.toNumber();

      if (!rushModeActive) return { active: false, timeLeft: 0 };

      const canSellAt = lastBuyTime.toNumber() + (rushModeEnd.toNumber() - now);
      const timeLeft = Math.max(0, canSellAt - now);

      return { active: timeLeft > 0, timeLeft };
    } catch (err: any) {
      console.error('Error checking rush mode:', err);
      return { active: false, timeLeft: 0 };
    }
  }, [contract, address]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (contract) {
      loadMarketStats();
      if (isConnected && address) {
        loadUserBalance();
      }
    }
  }, [contract, isConnected, address, loadMarketStats, loadUserBalance]);

  // Setup auto-refresh for market stats (every 10 seconds)
  useEffect(() => {
    if (!contract) return;

    const interval = setInterval(() => {
      loadMarketStats();
      if (isConnected && address) {
        loadUserBalance();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [contract, isConnected, address, loadMarketStats, loadUserBalance]);

  return {
    // State
    contract,
    marketStats,
    userBalance,
    isLoading,
    error,

    // Methods
    loadMarketStats,
    loadUserBalance,
    calculateTokensForBNB,
    calculateBNBForTokens,
    buyTokens,
    sellTokens,
    claimTokens,
    claimReferralEarnings,
    getReferralEarnings,
    checkRushMode
  };
};

export default useBondingCurve;
