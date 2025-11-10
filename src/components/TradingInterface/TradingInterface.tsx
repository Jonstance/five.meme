import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { toast } from 'react-toastify';
import './TradingInterface.scss';

interface TradingInterfaceProps {
  launchAddress: string;
  tokenSymbol: string;
  tokenName: string;
  graduated: boolean;
}

interface MarketStats {
  currentPrice: string;
  marketCap: string;
  liquidityBNB: string;
  progressPercent: number;
  holdersCount: number;
  isGraduated: boolean;
}

interface TradeState {
  amount: string;
  estimatedTokens: string;
  estimatedBNB: string;
  isLoading: boolean;
  slippage: number;
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({
  launchAddress,
  tokenSymbol,
  tokenName,
  graduated
}) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Trading state
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [tradeState, setTradeState] = useState<TradeState>({
    amount: '',
    estimatedTokens: '0',
    estimatedBNB: '0',
    isLoading: false,
    slippage: 1
  });

  // Market data
  const [marketStats, setMarketStats] = useState<MarketStats>({
    currentPrice: '0',
    marketCap: '0',
    liquidityBNB: '0',
    progressPercent: 0,
    holdersCount: 0,
    isGraduated: false
  });

  // User data
  const [userBalance, setUserBalance] = useState({
    bnb: '0',
    tokens: '0'
  });

  const [referralAddress, setReferralAddress] = useState('');
  const [rushModeActive, setRushModeActive] = useState(false);
  const [rushModeTimeLeft, setRushModeTimeLeft] = useState(0);

  // Load market stats
  useEffect(() => {
    loadMarketStats();
    const interval = setInterval(loadMarketStats, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, [launchAddress]);

  // Load user balance
  useEffect(() => {
    if (isConnected && address) {
      loadUserBalance();
    }
  }, [isConnected, address, launchAddress]);

  // Calculate estimated output
  useEffect(() => {
    if (tradeState.amount && parseFloat(tradeState.amount) > 0) {
      calculateEstimate();
    }
  }, [tradeState.amount, activeTab]);

  const loadMarketStats = async () => {
    try {
      // This would call your contract
      // const stats = await bondingCurveContract.getMarketStats();
      // For now, using placeholder
      setMarketStats({
        currentPrice: '0.000001',
        marketCap: '50000',
        liquidityBNB: '125',
        progressPercent: 65,
        holdersCount: 234,
        isGraduated: graduated
      });
    } catch (error) {
      console.error('Error loading market stats:', error);
    }
  };

  const loadUserBalance = async () => {
    try {
      if (!walletClient || !address) return;

      // Get BNB balance
      const provider = new ethers.providers.Web3Provider(walletClient as any);
      const bnbBalance = await provider.getBalance(address);

      // Get token balance from contract
      // const tokenBalance = await bondingCurveContract.tokenBalance(address);

      setUserBalance({
        bnb: ethers.utils.formatEther(bnbBalance),
        tokens: '0' // Would be from contract
      });
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const calculateEstimate = async () => {
    try {
      const amount = parseFloat(tradeState.amount);
      if (isNaN(amount) || amount <= 0) return;

      if (activeTab === 'buy') {
        // Calculate tokens for BNB
        // const tokens = await bondingCurveContract.calculateTokensForBNB(
        //   ethers.utils.parseEther(tradeState.amount)
        // );
        const estimatedTokens = (amount * 1000000).toFixed(2); // Placeholder
        setTradeState(prev => ({ ...prev, estimatedTokens }));
      } else {
        // Calculate BNB for tokens
        const estimatedBNB = (amount / 1000000).toFixed(6); // Placeholder
        setTradeState(prev => ({ ...prev, estimatedBNB }));
      }
    } catch (error) {
      console.error('Error calculating estimate:', error);
    }
  };

  const handleBuy = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!tradeState.amount || parseFloat(tradeState.amount) <= 0) {
      toast.error('Please enter an amount');
      return;
    }

    setTradeState(prev => ({ ...prev, isLoading: true }));

    try {
      // Validate balance
      if (parseFloat(tradeState.amount) > parseFloat(userBalance.bnb)) {
        toast.error('Insufficient BNB balance');
        return;
      }

      // Call contract
      // const tx = await bondingCurveContract.buyTokens(
      //   referralAddress || ethers.constants.AddressZero,
      //   { value: ethers.utils.parseEther(tradeState.amount) }
      // );
      // await tx.wait();

      toast.success(`Successfully bought ${tradeState.estimatedTokens} ${tokenSymbol}!`);

      // Refresh data
      await loadMarketStats();
      await loadUserBalance();
      setTradeState(prev => ({ ...prev, amount: '', estimatedTokens: '0' }));
    } catch (error: any) {
      console.error('Buy error:', error);
      toast.error(error?.message || 'Transaction failed');
    } finally {
      setTradeState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleSell = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!tradeState.amount || parseFloat(tradeState.amount) <= 0) {
      toast.error('Please enter an amount');
      return;
    }

    if (rushModeActive) {
      toast.error(`Rush mode active! You can sell in ${Math.ceil(rushModeTimeLeft / 60)} minutes`);
      return;
    }

    setTradeState(prev => ({ ...prev, isLoading: true }));

    try {
      // Validate balance
      if (parseFloat(tradeState.amount) > parseFloat(userBalance.tokens)) {
        toast.error('Insufficient token balance');
        return;
      }

      // Call contract
      // const tx = await bondingCurveContract.sellTokens(
      //   ethers.utils.parseEther(tradeState.amount)
      // );
      // await tx.wait();

      toast.success(`Successfully sold ${tradeState.amount} ${tokenSymbol}!`);

      // Refresh data
      await loadMarketStats();
      await loadUserBalance();
      setTradeState(prev => ({ ...prev, amount: '', estimatedBNB: '0' }));
    } catch (error: any) {
      console.error('Sell error:', error);
      toast.error(error?.message || 'Transaction failed');
    } finally {
      setTradeState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleMaxAmount = () => {
    if (activeTab === 'buy') {
      // Leave some for gas
      const maxBNB = Math.max(0, parseFloat(userBalance.bnb) - 0.01);
      setTradeState(prev => ({ ...prev, amount: maxBNB.toFixed(6) }));
    } else {
      setTradeState(prev => ({ ...prev, amount: userBalance.tokens }));
    }
  };

  return (
    <div className="trading-interface">
      {/* Market Stats Header */}
      <div className="market-stats">
        <div className="stat-card">
          <div className="stat-label">Price</div>
          <div className="stat-value">{marketStats.currentPrice} BNB</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Market Cap</div>
          <div className="stat-value">${marketStats.marketCap}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Liquidity</div>
          <div className="stat-value">{marketStats.liquidityBNB} BNB</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Holders</div>
          <div className="stat-value">{marketStats.holdersCount}</div>
        </div>
      </div>

      {/* Bonding Curve Progress */}
      <div className="bonding-progress">
        <div className="progress-header">
          <span>Bonding Curve Progress</span>
          <span className="progress-percent">{marketStats.progressPercent}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${marketStats.progressPercent}%` }}
          />
        </div>
        <div className="progress-info">
          When progress reaches 100%, tokens automatically graduate to PancakeSwap
        </div>
      </div>

      {/* Trading Card */}
      <div className="trading-card">
        {/* Tabs */}
        <div className="trade-tabs">
          <button
            className={`tab ${activeTab === 'buy' ? 'active' : ''}`}
            onClick={() => setActiveTab('buy')}
          >
            Buy
          </button>
          <button
            className={`tab ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => setActiveTab('sell')}
          >
            Sell
          </button>
        </div>

        {/* Balance Display */}
        <div className="balance-display">
          <span>Balance:</span>
          <span className="balance-value">
            {activeTab === 'buy'
              ? `${parseFloat(userBalance.bnb).toFixed(4)} BNB`
              : `${parseFloat(userBalance.tokens).toFixed(2)} ${tokenSymbol}`
            }
          </span>
        </div>

        {/* Input */}
        <div className="trade-input-group">
          <label>
            {activeTab === 'buy' ? 'You Pay' : 'You Sell'}
          </label>
          <div className="input-wrapper">
            <input
              type="number"
              placeholder="0.0"
              value={tradeState.amount}
              onChange={(e) => setTradeState(prev => ({ ...prev, amount: e.target.value }))}
              disabled={tradeState.isLoading || graduated}
            />
            <button
              className="max-button"
              onClick={handleMaxAmount}
              disabled={tradeState.isLoading}
            >
              MAX
            </button>
            <span className="currency">
              {activeTab === 'buy' ? 'BNB' : tokenSymbol}
            </span>
          </div>
        </div>

        {/* Output Estimate */}
        <div className="trade-output">
          <label>
            {activeTab === 'buy' ? 'You Receive' : 'You Receive'}
          </label>
          <div className="output-value">
            {activeTab === 'buy'
              ? `≈ ${tradeState.estimatedTokens} ${tokenSymbol}`
              : `≈ ${tradeState.estimatedBNB} BNB`
            }
          </div>
        </div>

        {/* Referral Input (Buy only) */}
        {activeTab === 'buy' && (
          <div className="referral-input">
            <label>Referral Address (Optional)</label>
            <input
              type="text"
              placeholder="0x..."
              value={referralAddress}
              onChange={(e) => setReferralAddress(e.target.value)}
              disabled={tradeState.isLoading}
            />
            <div className="referral-info">
              Using a referral gives both you and the referrer bonus rewards
            </div>
          </div>
        )}

        {/* Slippage Settings */}
        <div className="slippage-settings">
          <label>Slippage Tolerance</label>
          <div className="slippage-buttons">
            {[0.5, 1, 2, 5].map(value => (
              <button
                key={value}
                className={tradeState.slippage === value ? 'active' : ''}
                onClick={() => setTradeState(prev => ({ ...prev, slippage: value }))}
              >
                {value}%
              </button>
            ))}
          </div>
        </div>

        {/* Rush Mode Warning */}
        {rushModeActive && activeTab === 'sell' && (
          <div className="rush-mode-warning">
            ⚠️ Rush Mode Active: You cannot sell for {Math.ceil(rushModeTimeLeft / 60)} more minutes
          </div>
        )}

        {/* Trade Button */}
        <button
          className={`trade-button ${activeTab}`}
          onClick={activeTab === 'buy' ? handleBuy : handleSell}
          disabled={
            tradeState.isLoading ||
            !isConnected ||
            graduated ||
            (rushModeActive && activeTab === 'sell')
          }
        >
          {!isConnected ? 'Connect Wallet' :
           graduated ? 'Graduated to DEX' :
           tradeState.isLoading ? 'Processing...' :
           activeTab === 'buy' ? `Buy ${tokenSymbol}` : `Sell ${tokenSymbol}`
          }
        </button>

        {/* Info */}
        <div className="trade-info">
          <div className="info-row">
            <span>Trading Fee</span>
            <span>1%</span>
          </div>
          <div className="info-row">
            <span>Current Price</span>
            <span>{marketStats.currentPrice} BNB</span>
          </div>
          {activeTab === 'buy' && (
            <div className="info-row">
              <span>Referral Reward</span>
              <span>0.25% of fees</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;
