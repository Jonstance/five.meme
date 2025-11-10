import { Router } from 'express';
import BondingLaunch from '../models/bondingLaunch.model';

const router = Router();

/**
 * GET /api/bonding-launches
 * Get all bonding curve launches with filtering and sorting
 */
router.get('/', async (req, res) => {
  try {
    const {
      sort = 'hot',
      filter = 'all',
      limit = 20,
      offset = 0,
      search = ''
    } = req.query;

    let query: any = {};

    // Apply filters
    if (filter === 'active') {
      query.graduated = false;
      query.progressPercent = { $lt: 100 };
    } else if (filter === 'graduated') {
      query.graduated = true;
    } else if (filter === 'verified') {
      query.verified = true;
    }

    // Apply search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortObj: any = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'hot':
        sortObj = { volume24h: -1 };
        break;
      case 'top':
        sortObj = { marketCap: -1 };
        break;
      case 'completed':
        query.progressPercent = { $gte: 100 };
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const launches = await BondingLaunch.find(query)
      .sort(sortObj)
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await BondingLaunch.countDocuments(query);

    res.json({
      launches,
      total,
      hasMore: Number(offset) + launches.length < total
    });
  } catch (error) {
    console.error('Error fetching bonding launches:', error);
    res.status(500).json({ error: 'Failed to fetch launches' });
  }
});

/**
 * GET /api/bonding-launches/:address
 * Get a specific bonding curve launch by address
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const launch = await BondingLaunch.findOne({ address });

    if (!launch) {
      return res.status(404).json({ error: 'Launch not found' });
    }

    res.json(launch);
  } catch (error) {
    console.error('Error fetching bonding launch:', error);
    res.status(500).json({ error: 'Failed to fetch launch' });
  }
});

/**
 * GET /api/bonding-launches/stats
 * Get platform statistics
 */
router.get('/platform/stats', async (req, res) => {
  try {
    const [launches, volume, traders, graduated] = await Promise.all([
      BondingLaunch.countDocuments(),
      BondingLaunch.aggregate([
        { $group: { _id: null, total: { $sum: '$volume24h' } } }
      ]),
      BondingLaunch.aggregate([
        { $group: { _id: null, total: { $sum: '$holdersCount' } } }
      ]),
      BondingLaunch.countDocuments({ graduated: true })
    ]);

    const totalVolume = volume[0]?.total || 0;
    const totalTraders = traders[0]?.total || 0;

    res.json({
      launches,
      volume: formatVolume(totalVolume),
      traders: totalTraders,
      graduated
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Helper function to format volume
function formatVolume(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toFixed(2);
}

export default router;
