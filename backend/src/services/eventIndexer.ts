import { ethers } from 'ethers';
import BondingLaunch from '../models/bondingLaunch.model';
import BondingCurveFactoryABI from '../ABIs/BondingCurveFactory.json';
import BondingCurveLaunchABI from '../ABIs/BondingCurveLaunch.json';

const BSC_RPC = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || '';

export class EventIndexer {
  private provider: ethers.providers.JsonRpcProvider;
  private factoryContract: ethers.Contract;
  private isRunning: boolean = false;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(BSC_RPC);
    this.factoryContract = new ethers.Contract(
      FACTORY_ADDRESS,
      BondingCurveFactoryABI.abi,
      this.provider
    );
  }

  /**
   * Start listening to blockchain events
   */
  async start() {
    if (this.isRunning) {
      console.log('Event indexer is already running');
      return;
    }

    console.log('🚀 Starting event indexer...');
    this.isRunning = true;

    // Index historical events first
    await this.indexHistoricalEvents();

    // Then listen for new events
    this.listenToNewEvents();

    // Start periodic update task
    this.startPeriodicUpdates();

    console.log('✅ Event indexer started successfully');
  }

  /**
   * Index all historical LaunchCreated events
   */
  private async indexHistoricalEvents() {
    try {
      console.log('📊 Indexing historical events...');

      const filter = this.factoryContract.filters.LaunchCreated();
      const events = await this.factoryContract.queryFilter(filter, 0, 'latest');

      console.log(`Found ${events.length} historical launches`);

      for (const event of events) {
        await this.handleLaunchCreated(event);
      }

      console.log('✅ Historical events indexed');
    } catch (error) {
      console.error('Error indexing historical events:', error);
    }
  }

  /**
   * Listen for new LaunchCreated events in real-time
   */
  private listenToNewEvents() {
    this.factoryContract.on('LaunchCreated', async (launchAddress, token, creator, name, symbol, event) => {
      console.log(`🆕 New launch detected: ${name} (${symbol}) at ${launchAddress}`);
      await this.handleLaunchCreated(event);
    });

    console.log('👂 Listening for new launch events...');
  }

  /**
   * Handle a LaunchCreated event
   */
  private async handleLaunchCreated(event: any) {
    try {
      const [launchAddress, tokenAddress, creator, name, symbol] = event.args;

      // Check if already exists
      const existing = await BondingLaunch.findOne({ address: launchAddress });
      if (existing) {
        console.log(`Launch ${launchAddress} already indexed, skipping...`);
        return;
      }

      // Fetch additional data from factory
      const launchInfo = await this.factoryContract.getLaunchInfo(launchAddress);

      // Fetch current stats from launch contract
      const launchContract = new ethers.Contract(
        launchAddress,
        BondingCurveLaunchABI.abi,
        this.provider
      );

      const [totalSupply, soldTokens, bnbRaised, graduated, currentPrice] = await Promise.all([
        launchContract.TOTAL_SUPPLY(),
        launchContract.tokensSold(),
        launchContract.bnbRaised(),
        launchContract.graduated(),
        launchContract.getCurrentPrice()
      ]);

      const progressPercent = (parseFloat(ethers.utils.formatEther(soldTokens)) /
                              parseFloat(ethers.utils.formatEther(totalSupply))) * 100;

      // Create new bonding launch entry
      const newLaunch = new BondingLaunch({
        address: launchAddress,
        tokenAddress: tokenAddress,
        name: name,
        symbol: symbol,
        logoUrl: launchInfo.logoUrl || '',
        description: launchInfo.description || '',
        creator: creator,
        createdAt: new Date(event.blockNumber * 1000), // Approximate timestamp
        marketCap: 0, // Will be calculated in updates
        volume24h: 0,
        priceChange24h: 0,
        progressPercent: progressPercent,
        holdersCount: 0, // Will be updated
        currentPrice: parseFloat(ethers.utils.formatEther(currentPrice)),
        liquidityBNB: parseFloat(ethers.utils.formatEther(bnbRaised)),
        verified: false,
        flagged: false,
        graduated: graduated,
        website: launchInfo.website || '',
        twitter: launchInfo.twitter || '',
        telegram: launchInfo.telegram || '',
        totalSupply: parseFloat(ethers.utils.formatEther(totalSupply)),
        soldTokens: parseFloat(ethers.utils.formatEther(soldTokens)),
        bnbRaised: parseFloat(ethers.utils.formatEther(bnbRaised)),
        lastUpdated: new Date()
      });

      await newLaunch.save();
      console.log(`✅ Indexed new launch: ${name} (${symbol})`);
    } catch (error) {
      console.error(`Error handling LaunchCreated event:`, error);
    }
  }

  /**
   * Periodically update stats for all launches
   */
  private startPeriodicUpdates() {
    // Update every 30 seconds
    setInterval(async () => {
      await this.updateAllLaunches();
    }, 30000);

    console.log('⏰ Periodic updates scheduled (every 30s)');
  }

  /**
   * Update stats for all active launches
   */
  private async updateAllLaunches() {
    try {
      const activeLaunches = await BondingLaunch.find({ graduated: false });

      for (const launch of activeLaunches) {
        await this.updateLaunchStats(launch.address);
      }
    } catch (error) {
      console.error('Error updating launches:', error);
    }
  }

  /**
   * Update stats for a specific launch
   */
  private async updateLaunchStats(launchAddress: string) {
    try {
      const launchContract = new ethers.Contract(
        launchAddress,
        BondingCurveLaunchABI.abi,
        this.provider
      );

      const [soldTokens, bnbRaised, graduated, currentPrice, totalSupply] = await Promise.all([
        launchContract.tokensSold(),
        launchContract.bnbRaised(),
        launchContract.graduated(),
        launchContract.getCurrentPrice(),
        launchContract.TOTAL_SUPPLY()
      ]);

      const progressPercent = (parseFloat(ethers.utils.formatEther(soldTokens)) /
                              parseFloat(ethers.utils.formatEther(totalSupply))) * 100;

      // Calculate market cap (simplified)
      const priceNum = parseFloat(ethers.utils.formatEther(currentPrice));
      const supplyNum = parseFloat(ethers.utils.formatEther(totalSupply));
      const marketCap = priceNum * supplyNum;

      await BondingLaunch.findOneAndUpdate(
        { address: launchAddress },
        {
          $set: {
            soldTokens: parseFloat(ethers.utils.formatEther(soldTokens)),
            bnbRaised: parseFloat(ethers.utils.formatEther(bnbRaised)),
            graduated: graduated,
            currentPrice: priceNum,
            progressPercent: progressPercent,
            marketCap: marketCap,
            liquidityBNB: parseFloat(ethers.utils.formatEther(bnbRaised)),
            lastUpdated: new Date()
          }
        }
      );
    } catch (error) {
      console.error(`Error updating launch ${launchAddress}:`, error);
    }
  }

  /**
   * Stop the event indexer
   */
  stop() {
    this.factoryContract.removeAllListeners();
    this.isRunning = false;
    console.log('🛑 Event indexer stopped');
  }
}

// Singleton instance
let indexerInstance: EventIndexer | null = null;

export function getIndexer(): EventIndexer {
  if (!indexerInstance) {
    indexerInstance = new EventIndexer();
  }
  return indexerInstance;
}
