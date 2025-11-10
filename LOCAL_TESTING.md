# 🏠 Local Testing Guide

Complete guide for testing the bonding curve platform locally using Hardhat's local blockchain.

---

## 🚀 Quick Start (3 Easy Steps)

### Terminal 1: Start Hardhat Node
```bash
npx hardhat node
```

Keep this running - it's your local blockchain!

### Terminal 2: Deploy Contracts & Start Backend
```bash
# Deploy contracts locally
npx hardhat run scripts/deploy-local.js --network localhost

# Start MongoDB (if not running)
brew services start mongodb-community@7.0
# OR use Docker: docker run -d -p 27017:27017 mongo:latest

# Start backend
cd backend
npm run dev
```

### Terminal 3: Start Frontend
```bash
npm run dev
```

**Visit:** [http://localhost:5173](http://localhost:5173)

---

## 📋 What Happens

### 1. Hardhat Node Starts
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts:
==================
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```

### 2. Contracts Deploy
```
🏠 Starting LOCAL deployment...
📦 Deploying BondingCurveFactory...
✅ BondingCurveFactory deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
🧪 Creating test launch...
✅ Test launch created!
📋 Copying ABIs to backend...
🔧 Updating .env file...
✅ Local deployment complete! 🎉
```

### 3. Backend Indexes Events
```
🔌 Connecting to MongoDB...
✅ MongoDB connected successfully
🚀 Server running on port 5000
🔍 Starting blockchain event indexer...
📊 Indexing historical events...
Found 1 historical launches
✅ Historical events indexed
```

---

## 🧪 Testing Workflow

### 1. Connect Wallet to Localhost

**In MetaMask:**
1. Click Networks → Add Network → Add a network manually
2. Enter details:
   - **Network Name:** Hardhat Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** ETH
3. Click Save

### 2. Import Test Account

**Copy a private key from the Hardhat node output:**
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**In MetaMask:**
1. Click account icon → Import Account
2. Paste private key
3. You now have 10,000 ETH for testing!

### 3. Test the Test Launch

The deployment script creates a test launch automatically:

```bash
Visit: http://localhost:5173/launch/[ADDRESS_FROM_DEPLOY_OUTPUT]
```

**Try:**
- ✅ Buy tokens with BNB
- ✅ Sell tokens (after 10-minute rush mode)
- ✅ Check bonding curve pricing
- ✅ Test referral rewards
- ✅ Watch progress to graduation

### 4. Create Your Own Launch

1. Go to [http://localhost:5173/create-launch](http://localhost:5173/create-launch)
2. Fill in token details
3. Submit with 0.01 ETH creation fee
4. Watch event indexer pick it up
5. Start trading!

### 5. Test Market Discovery

1. Go to [http://localhost:5173/market](http://localhost:5173/market)
2. See all launches (including test launch)
3. Test filtering, sorting, search
4. Click cards to view launches

---

## 🔧 Advanced Testing

### Test Anti-Sniping

```javascript
// In console, try to buy more than 10 BNB in first 3 blocks
// Should fail with "Exceeds anti-snipe limit"
```

### Test Rush Mode

```javascript
// Buy tokens, then immediately try to sell
// Should fail with "Rush mode active"
// Wait 10 minutes, then selling works
```

### Test Graduation

```javascript
// Buy enough to reach 80% of total supply
// Contract automatically graduates to PancakeSwap
// Watch graduated badge appear
```

### Test Referral Rewards

```javascript
// Use a referrer address when buying
// Referrer gets 0.25% of trading fee
// Check their balance increases
```

---

## 📁 File Locations

### Deployment Info
```bash
deployments/localhost.json
```

### Contract ABIs
```bash
backend/src/ABIs/BondingCurveFactory.json
backend/src/ABIs/BondingCurveLaunch.json
```

### Environment Variables
```bash
.env
```

---

## 🔄 Reset & Restart

### Reset Hardhat Blockchain
```bash
# Stop the node (Ctrl+C)
# Start again
npx hardhat node
```

### Redeploy Everything
```bash
# In new terminal
npx hardhat run scripts/deploy-local.js --network localhost
```

### Reset MongoDB
```bash
mongosh
> use padmeme
> db.bondinglaunchs.deleteMany({})
> exit
```

### Restart Backend
```bash
cd backend
npm run dev
```

---

## 🐛 Troubleshooting

### Hardhat Node Won't Start
```bash
# Kill existing process
lsof -ti:8545 | xargs kill -9

# Start again
npx hardhat node
```

### Can't Connect Wallet
- Make sure MetaMask is on "Hardhat Local" network
- Chain ID must be 31337
- RPC URL must be http://127.0.0.1:8545

### Transaction Failures
```bash
# Reset MetaMask account
# Settings → Advanced → Clear activity tab data
```

### Backend Can't Find Contracts
```bash
# Make sure ABIs were copied
ls -la backend/src/ABIs/

# If missing, run deploy script again
npx hardhat run scripts/deploy-local.js --network localhost
```

### MongoDB Connection Error
```bash
# Start MongoDB
brew services start mongodb-community@7.0

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Check if running
mongosh
```

---

## 💡 Tips

### Speed Up Testing

1. **Use Hardhat Console:**
```bash
npx hardhat console --network localhost
```

Then interact directly:
```javascript
const factory = await ethers.getContractAt("BondingCurveFactory", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
const launches = await factory.getAllLaunches(0, 10);
console.log(launches);
```

2. **Auto-mine Blocks:**
Hardhat auto-mines by default - instant transactions!

3. **Multiple Test Accounts:**
Import multiple accounts from Hardhat node for multi-user testing

4. **Frontend Dev Tools:**
- React DevTools
- Redux DevTools
- Network tab to see API calls

---

## 📊 Monitoring

### Watch Backend Logs
```bash
cd backend
npm run dev
```

Look for:
- Event indexing
- API requests
- Database updates

### Watch Frontend Console
```javascript
// Check for errors
// See transaction logs
// Monitor wallet connections
```

### Query MongoDB
```bash
mongosh

use padmeme

// Count launches
db.bondinglaunchs.count()

// See all launches
db.bondinglaunchs.find().pretty()

// Find specific launch
db.bondinglaunchs.findOne({ address: "0x..." })
```

---

## ✅ Testing Checklist

- [ ] Hardhat node running
- [ ] Contracts deployed
- [ ] ABIs copied to backend
- [ ] .env updated
- [ ] MongoDB running
- [ ] Backend started
- [ ] Frontend started
- [ ] Wallet connected to localhost
- [ ] Test account imported
- [ ] Can view test launch
- [ ] Can create new launch
- [ ] Can buy tokens
- [ ] Can sell tokens
- [ ] Market discovery shows launches
- [ ] Event indexer working
- [ ] API endpoints responding

---

## 🎯 Test Scenarios

### Scenario 1: Complete Launch Cycle
1. Create launch
2. Buy tokens gradually
3. Sell some tokens
4. Buy to 80% completion
5. Verify auto-graduation
6. Check PancakeSwap listing

### Scenario 2: Multi-User Trading
1. Import 3 test accounts
2. Account 1 creates launch
3. Account 2 buys with Account 1 as referrer
4. Account 3 buys without referrer
5. Verify different balances and rewards

### Scenario 3: Edge Cases
1. Try buying with 0 BNB (should fail)
2. Try buying more than available (should fail)
3. Try selling during rush mode (should fail)
4. Try buying after graduation (should fail)

---

## 🚀 Next Steps

After local testing:
1. Deploy to BSC Testnet: `npx hardhat run scripts/deploy.js --network bscTestnet`
2. Test on testnet with real wallet
3. Security audit
4. Deploy to BSC Mainnet
5. Launch! 🎉

---

**Happy Testing! 🧪✨**

*Last Updated: 2025-11-02*
