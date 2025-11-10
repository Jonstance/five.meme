# 🔧 Backend Setup Guide

Complete guide for setting up the backend event indexer and APIs for bonding curve launches.

---

## 📋 Prerequisites

- Node.js 16+ installed
- MongoDB installed and running
- BSC RPC access (public or private)
- Smart contracts deployed to BSC

---

## 🚀 Quick Setup

### 1. Install MongoDB

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu:**
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

### 2. Configure Environment Variables

Create/update `.env` in the project root:

```bash
# Backend Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/padmeme

# Blockchain Configuration
BSC_RPC_URL=https://bsc-dataseed.binance.org/
FACTORY_ADDRESS=0xYourDeployedFactoryAddress

# Optional: Private RPC for better performance
# BSC_RPC_URL=https://bsc-mainnet.nodereal.io/v1/YOUR_API_KEY
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Start the Backend

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

You should see:
```
🔌 Connecting to MongoDB...
✅ MongoDB connected successfully
🚀 Server running on port 5000
🔍 Starting blockchain event indexer...
📊 Indexing historical events...
Found X historical launches
✅ Historical events indexed
👂 Listening for new launch events...
⏰ Periodic updates scheduled (every 30s)
```

---

## 📊 What the Backend Does

### Event Indexer

The event indexer automatically:
- 🔍 **Indexes all historical launches** on startup
- 👂 **Listens for new LaunchCreated events** in real-time
- 🔄 **Updates launch stats** every 30 seconds (price, volume, progress, etc.)
- 💾 **Stores data in MongoDB** for fast API queries
- 📈 **Calculates metrics** (market cap, 24h volume, holders count)

### API Endpoints

**GET /api/bonding-launches**
- Get all bonding curve launches with filtering and sorting
- Query params: `sort`, `filter`, `limit`, `offset`, `search`
- Example: `/api/bonding-launches?sort=hot&filter=active&limit=20`

**GET /api/bonding-launches/:address**
- Get details for a specific launch
- Example: `/api/bonding-launches/0x123...`

**GET /api/bonding-launches/platform/stats**
- Get platform-wide statistics
- Returns: total launches, volume, traders, graduated count

---

## 🔧 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Make sure MongoDB is running
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Check status
mongosh  # Should connect successfully
```

### Factory Address Not Configured

```
⚠️  FACTORY_ADDRESS not configured
```

**Solution:** Deploy contracts first, then add factory address to `.env`
```bash
# Deploy contracts
cd contracts
npx hardhat run scripts/deploy.js --network bscTestnet

# Copy factory address from output to .env
FACTORY_ADDRESS=0xYourFactoryAddress
```

### RPC Rate Limiting

```
Error: Too many requests
```

**Solution:** Use a private RPC provider
```bash
# Get free API key from NodeReal, QuickNode, or Ankr
BSC_RPC_URL=https://bsc-mainnet.nodereal.io/v1/YOUR_API_KEY
```

---

## 📦 Database Schema

### BondingLaunch Collection

```typescript
{
  address: string;           // Launch contract address
  tokenAddress: string;      // Token contract address
  name: string;             // Token name
  symbol: string;           // Token symbol
  logoUrl: string;          // Token logo URL
  description: string;      // Token description
  creator: string;          // Creator address
  createdAt: Date;          // Creation timestamp
  marketCap: number;        // Current market cap
  volume24h: number;        // 24h trading volume
  priceChange24h: number;   // 24h price change %
  progressPercent: number;  // Bonding curve progress (0-100%)
  holdersCount: number;     // Number of holders
  currentPrice: number;     // Current token price in BNB
  liquidityBNB: number;     // Total BNB in curve
  verified: boolean;        // Verification status
  graduated: boolean;       // Graduated to DEX
  website: string;          // Project website
  twitter: string;          // Twitter link
  telegram: string;         // Telegram link
  totalSupply: number;      // Total token supply
  soldTokens: number;       // Tokens sold so far
  bnbRaised: number;        // Total BNB raised
  lastUpdated: Date;        // Last update timestamp
}
```

---

## 🔄 How It Works

### 1. On Startup
```
Backend starts → Connects to MongoDB → Indexes historical events → Starts listening
```

### 2. New Launch Detected
```
LaunchCreated event → Fetch launch details → Fetch token info → Save to DB → Update frontend
```

### 3. Periodic Updates (every 30s)
```
For each active launch:
  → Fetch current stats from contract
  → Calculate metrics
  → Update database
  → Frontend auto-refreshes
```

---

## 🎯 Next Steps

After backend is running:

1. **Test the API**
   ```bash
   # Get all launches
   curl http://localhost:5000/api/bonding-launches

   # Get platform stats
   curl http://localhost:5000/api/bonding-launches/platform/stats
   ```

2. **Create a test launch**
   - Go to [http://localhost:5173/create-launch](http://localhost:5173/create-launch)
   - Create a new bonding curve launch
   - Watch backend logs to see event indexing

3. **Check Market Discovery**
   - Go to [http://localhost:5173/market](http://localhost:5173/market)
   - Should show real launches from database
   - Test filtering, sorting, and search

---

## 🚀 Production Deployment

### Environment Variables for Production

```bash
# Use production MongoDB (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/padmeme

# Use production BSC RPC
BSC_RPC_URL=https://bsc-dataseed.binance.org/

# Set factory address to mainnet deployment
FACTORY_ADDRESS=0xYourMainnetFactoryAddress

# Enable production mode
NODE_ENV=production
```

### Deploy to Hosting

**Option 1: VPS (DigitalOcean, AWS EC2, etc.)**
```bash
# Install dependencies
npm install --production

# Use PM2 for process management
npm install -g pm2
pm2 start backend/src/index.ts --name padmeme-backend
pm2 save
pm2 startup
```

**Option 2: Heroku**
```bash
# Add Heroku MongoDB addon
heroku addons:create mongolab:sandbox

# Deploy
git push heroku main
```

**Option 3: Railway**
- Connect GitHub repo
- Add MongoDB service
- Set environment variables
- Deploy automatically

---

## 📈 Monitoring

### Check Event Indexer Status

```bash
# View logs
tail -f backend/logs/indexer.log

# Or with PM2
pm2 logs padmeme-backend
```

### Database Queries

```bash
# Connect to MongoDB
mongosh

# Use database
use padmeme

# Count launches
db.bondinglaunchs.count()

# Find active launches
db.bondinglaunchs.find({ graduated: false })

# Find top by volume
db.bondinglaunchs.find().sort({ volume24h: -1 }).limit(10)
```

---

## 🆘 Support

If you encounter issues:

1. Check backend logs for errors
2. Verify MongoDB is running
3. Confirm factory address is correct
4. Test RPC connection
5. Check network connection

---

**Backend is ready! Your bonding curve platform now has real-time data indexing and API support! 🎉**

*Last Updated: 2025-11-02*
