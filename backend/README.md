# 🚀 Backend - Bonding Curve Event Indexer & API

Complete backend for pad.meme bonding curve launchpad with real-time blockchain event indexing.

---

## ✅ Setup Complete!

The backend is **fully configured** and ready to run. All you need to do is:

1. **Install MongoDB**
2. **Configure environment variables**
3. **Start the server**

---

## 🔧 Quick Start

### 1. Install MongoDB

**macOS:**
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
```

**Windows:**
Download from [mongodb.com](https://www.mongodb.com/try/download/community)

### 2. Configure Environment

Create `.env` in project root (if not exists):
```bash
# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/padmeme

# Blockchain (after deploying contracts)
BSC_RPC_URL=https://bsc-dataseed.binance.org/
FACTORY_ADDRESS=

# Optional: Private RPC for better performance
# BSC_RPC_URL=https://bsc-mainnet.nodereal.io/v1/YOUR_API_KEY
```

### 3. Start Backend

```bash
cd backend
npm run dev
```

**Expected Output:**
```
🔌 Connecting to MongoDB...
✅ MongoDB connected successfully
{ port: 5000 }
🚀 Server running on port 5000
⚠️  FACTORY_ADDRESS not configured
   Deploy contracts and add FACTORY_ADDRESS to .env to enable event indexing
```

---

## 📝 After Deploying Smart Contracts

Once you deploy contracts to BSC:

### 1. Compile Contracts
```bash
# In project root
cd contracts
npx hardhat compile
```

### 2. Copy ABIs to Backend
```bash
# Copy compiled ABIs
cp artifacts/contracts/BondingCurveFactory.sol/BondingCurveFactory.json ../backend/src/ABIs/
cp artifacts/contracts/BondingCurveLaunch.sol/BondingCurveLaunch.json ../backend/src/ABIs/
```

### 3. Deploy Contracts
```bash
# Deploy to BSC Testnet
npx hardhat run scripts/deploy.js --network bscTestnet

# Copy the factory address from output
```

### 4. Update .env
```bash
# Add factory address to .env
FACTORY_ADDRESS=0xYourDeployedFactoryAddress
```

### 5. Restart Backend
```bash
cd backend
npm run dev
```

**Now you'll see:**
```
🔌 Connecting to MongoDB...
✅ MongoDB connected successfully
{ port: 5000 }
🚀 Server running on port 5000
🔍 Starting blockchain event indexer...
📊 Indexing historical events...
Found X historical launches
✅ Historical events indexed
👂 Listening for new launch events...
⏰ Periodic updates scheduled (every 30s)
```

---

## 🔌 API Endpoints

### GET /api/bonding-launches
Get all bonding curve launches

**Query Parameters:**
- `sort` - `newest`, `hot`, `top`, `completed` (default: `hot`)
- `filter` - `all`, `active`, `graduated`, `verified` (default: `all`)
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)
- `search` - Search by name or symbol

**Example:**
```bash
curl "http://localhost:5000/api/bonding-launches?sort=hot&filter=active&limit=10"
```

**Response:**
```json
{
  "launches": [
    {
      "address": "0x...",
      "name": "MoonDoge",
      "symbol": "MDOGE",
      "marketCap": 123456,
      "volume24h": 50000,
      "progressPercent": 45.5,
      "graduated": false,
      ...
    }
  ],
  "total": 100,
  "hasMore": true
}
```

### GET /api/bonding-launches/:address
Get specific launch details

**Example:**
```bash
curl "http://localhost:5000/api/bonding-launches/0x123..."
```

### GET /api/bonding-launches/platform/stats
Get platform statistics

**Example:**
```bash
curl "http://localhost:5000/api/bonding-launches/platform/stats"
```

**Response:**
```json
{
  "launches": 47,
  "volume": "1.2M",
  "traders": 1834,
  "graduated": 12
}
```

---

## 🏗️ Architecture

### Event Indexer

**What it does:**
1. **On Startup:** Indexes all historical `LaunchCreated` events
2. **Real-time:** Listens for new launches
3. **Updates:** Auto-updates stats every 30 seconds
4. **Storage:** Saves to MongoDB for fast queries

**Event Flow:**
```
BSC Blockchain → Event Indexer → MongoDB → REST API → Frontend
```

### Database Schema

**BondingLaunch Collection:**
```typescript
{
  address: string;           // Launch contract address (indexed)
  tokenAddress: string;      // Token contract address
  name: string;             // Token name
  symbol: string;           // Token symbol
  creator: string;          // Creator address
  marketCap: number;        // Current market cap
  volume24h: number;        // 24h volume (indexed)
  progressPercent: number;  // 0-100%
  graduated: boolean;       // Graduated to DEX (indexed)
  verified: boolean;        // Verification status
  // ... more fields
}
```

---

## 📁 File Structure

```
backend/src/
├── ABIs/                          # Smart contract ABIs
│   ├── BondingCurveFactory.json
│   └── BondingCurveLaunch.json
├── models/
│   └── bondingLaunch.model.ts    # MongoDB schema
├── routes/
│   └── bondingLaunches.routes.ts # API endpoints
├── services/
│   └── eventIndexer.ts           # Blockchain event listener
├── controllers/                   # Existing controllers
├── app.routing.ts                # Route configuration
├── express.api.ts                # Express setup
└── main.ts                       # Entry point
```

---

## 🧪 Testing

### 1. Test MongoDB Connection
```bash
mongosh
# Should connect successfully
```

### 2. Test API Endpoints
```bash
# Get all launches
curl http://localhost:5000/api/bonding-launches

# Get platform stats
curl http://localhost:5000/api/bonding-launches/platform/stats
```

### 3. Check Logs
```bash
# Watch backend logs
npm run dev

# Check MongoDB data
mongosh
> use padmeme
> db.bondinglaunchs.find().pretty()
```

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Fix:** Start MongoDB
```bash
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

### Factory Address Not Found
```
⚠️  FACTORY_ADDRESS not configured
```

**Fix:** Deploy contracts first, then add address to `.env`

### RPC Rate Limiting
```
Error: Too many requests
```

**Fix:** Use private RPC provider
```bash
BSC_RPC_URL=https://bsc-mainnet.nodereal.io/v1/YOUR_API_KEY
```

### ABIs Not Found
```
Error: Cannot find module '../ABIs/BondingCurveFactory.json'
```

**Fix:** Copy ABIs after compiling contracts
```bash
cp contracts/artifacts/contracts/BondingCurveFactory.sol/BondingCurveFactory.json backend/src/ABIs/
```

---

## 📦 Dependencies

**Installed:**
- ✅ `ethers` (v5.7.2) - Blockchain interactions
- ✅ `mongoose` - MongoDB ODM
- ✅ `express` - Web framework
- ✅ `dotenv` - Environment variables
- ✅ `cors` - CORS support
- ✅ `compression` - Response compression
- ✅ All TypeScript types

---

## 🚀 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/padmeme
BSC_RPC_URL=https://bsc-dataseed.binance.org/
FACTORY_ADDRESS=0xYourMainnetAddress
PORT=5000
```

### Using PM2
```bash
npm install -g pm2
pm2 start src/main.ts --name padmeme-backend
pm2 save
pm2 startup
```

### Using Docker
```bash
docker build -t padmeme-backend .
docker run -p 5000:5000 --env-file .env padmeme-backend
```

---

## 📊 Monitoring

### View Logs
```bash
# Development
npm run dev

# Production (PM2)
pm2 logs padmeme-backend

# Check indexer status
pm2 logs padmeme-backend --lines 100
```

### Database Queries
```bash
mongosh

use padmeme

# Count launches
db.bondinglaunchs.count()

# Find active launches
db.bondinglaunchs.find({ graduated: false })

# Find top by volume
db.bondinglaunchs.find().sort({ volume24h: -1 }).limit(10)
```

---

## ✅ Complete Setup Checklist

- [x] Dependencies installed
- [x] MongoDB model created
- [x] API routes configured
- [x] Event indexer implemented
- [x] TypeScript configured
- [x] ABIs directory created
- [ ] MongoDB running
- [ ] Contracts compiled
- [ ] ABIs copied
- [ ] Contracts deployed
- [ ] Factory address configured
- [ ] Backend started
- [ ] API tested

---

**Backend is ready! Start MongoDB and run `npm run dev` to begin! 🎉**

*Last Updated: 2025-11-02*
