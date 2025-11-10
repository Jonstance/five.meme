# 🚀 Setup Guide: Bonding Curve Launchpad

This guide will walk you through setting up and deploying your four.meme-style bonding curve launchpad.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or another Web3 wallet
- BNB for gas fees (testnet or mainnet)
- BSCScan API key (for contract verification)

---

## 🔧 Step 1: Install Dependencies

### Frontend Dependencies (Already Installed)
```bash
npm install
```

### Smart Contract Dependencies (New)
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
npm install dotenv
```

---

## 🔑 Step 2: Environment Setup

Create a `.env` file in the root directory:

```env
# Private key for deployment (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# BSCScan API key for contract verification
BSCSCAN_API_KEY=your_bscscan_api_key_here

# Backend API URL
REACT_APP_API_URL=http://localhost:3001

# WebSocket URL (for real-time updates)
REACT_APP_WS_URL=ws://localhost:3001

# Network (bscTestnet or bsc)
REACT_APP_NETWORK=bscTestnet
```

⚠️ **IMPORTANT:** Never commit your `.env` file to git. Add it to `.gitignore`.

### Get Your Private Key
1. Open MetaMask
2. Click the three dots → Account Details
3. Export Private Key (enter password)
4. Copy the key (starts with 0x)

### Get BSCScan API Key
1. Go to [BSCScan](https://bscscan.com/)
2. Register/Login
3. Go to API-KEYs section
4. Create a new API key

---

## 📦 Step 3: Initialize Hardhat

```bash
npx hardhat init
```

Choose: "Create an empty hardhat.config.js"

The `hardhat.config.js` file has already been created for you with BSC configuration.

---

## 🏗️ Step 4: Compile Smart Contracts

```bash
npx hardhat compile
```

This will compile:
- `BondingCurveLaunch.sol`
- `BondingCurveFactory.sol`

Output will be in `artifacts/` directory.

---

## 🧪 Step 5: Test on BSC Testnet

### Get Testnet BNB
1. Go to [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
2. Enter your wallet address
3. Receive 0.5 BNB for testing

### Deploy to Testnet
```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

Expected output:
```
🚀 Starting deployment...
📝 Deploying contracts with account: 0x...
💰 Account balance: 500000000000000000

📦 Deploying BondingCurveFactory...
✅ BondingCurveFactory deployed to: 0x...
   Transaction hash: 0x...

⏳ Waiting for confirmations...
✅ Confirmations complete

📋 DEPLOYMENT SUMMARY
==================================================
BondingCurveFactory: 0xYourFactoryAddress
Network: bscTestnet
Deployer: 0xYourAddress
==================================================
```

### Save the Factory Address
Copy the factory address and update `/src/utility/connect.ts`:

```typescript
export const BONDING_CURVE_FACTORY_ADDRESS = "0xYourFactoryAddress"
```

---

## ✅ Step 6: Verify Contracts on BSCScan

```bash
npx hardhat verify --network bscTestnet 0xYourFactoryAddress
```

This makes your contract readable on BSCScan.

---

## 📝 Step 7: Export ABIs

Copy the compiled ABIs to your frontend:

```bash
mkdir -p src/ABIs
cp artifacts/contracts/BondingCurveLaunch.sol/BondingCurveLaunch.json src/ABIs/
cp artifacts/contracts/BondingCurveFactory.sol/BondingCurveFactory.json src/ABIs/
```

Or use this script:

```bash
node scripts/export-abis.js
```

Create `scripts/export-abis.js`:
```javascript
const fs = require('fs');
const path = require('path');

const contracts = [
  'BondingCurveLaunch',
  'BondingCurveFactory'
];

contracts.forEach(contract => {
  const artifact = require(`../artifacts/contracts/${contract}.sol/${contract}.json`);

  fs.writeFileSync(
    path.join(__dirname, `../src/ABIs/${contract}.json`),
    JSON.stringify(artifact, null, 2)
  );

  console.log(`✅ Exported ${contract}.json`);
});
```

---

## 🔗 Step 8: Integrate with Frontend

### Update `src/utility/connect.ts`

```typescript
import BondingCurveLaunch from "../ABIs/BondingCurveLaunch.json"
import BondingCurveFactory from "../ABIs/BondingCurveFactory.json"

export const BONDING_CURVE_FACTORY_ADDRESS = "0xYourFactoryAddress" // From deployment

export const getConnectedContracts = (signer: ethers.Signer) => {
  // ... existing code ...

  return {
    ...existingReturns,
    BONDING_CURVE_FACTORY_ADDRESS,
    BondingCurveLaunch,
    BondingCurveFactory,
  }
}
```

---

## 🎨 Step 9: Update Routing

Add new routes in `src/main.tsx`:

```typescript
import MarketDiscovery from './pages/MarketDiscovery/MarketDiscovery';

// In your routes:
<Route path="/market" element={<MarketDiscovery />} />
```

Update navigation in `src/components/Navbar/Navbar.tsx`:

```typescript
<Link to="/market">Discover</Link>
```

---

## 🚀 Step 10: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 🧪 Step 11: Test the Platform

### Create a Test Launch
1. Connect your wallet
2. Go to "Create Launch" (you may need to create this page)
3. Fill in token details
4. Pay 0.01 BNB creation fee
5. Wait for confirmation

### Test Trading
1. Go to Market Discovery page
2. Click on a token
3. Try buying tokens
4. Check your balance
5. Try selling (after rush mode expires)

---

## 🔄 Step 12: Backend Setup (For Production)

### Install Backend Dependencies
```bash
cd backend
npm install express mongoose socket.io ethers cors dotenv
```

### Configure MongoDB
Update `backend/src/server.ts` with your MongoDB URI:

```typescript
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/launchpad');
```

### Start Backend
```bash
cd backend
npm start
```

### Setup Event Indexer
The indexer will listen to blockchain events and update your database.

Create `backend/src/services/indexer.ts` (see IMPLEMENTATION_ROADMAP.md)

---

## 📊 Step 13: Monitoring & Analytics

### Setup BSCScan Links
In your frontend, add links to BSCScan for transparency:

```typescript
const bscScanUrl = process.env.REACT_APP_NETWORK === 'bsc'
  ? 'https://bscscan.com'
  : 'https://testnet.bscscan.com';

<a href={`${bscScanUrl}/address/${launchAddress}`}>View on BSCScan</a>
```

### Track Metrics
- Total launches created
- Trading volume
- Unique users
- Graduated tokens

---

## 🚀 Step 14: Mainnet Deployment

⚠️ **Before deploying to mainnet:**

1. ✅ Thoroughly test on testnet
2. ✅ Get smart contracts audited
3. ✅ Test with small amounts first
4. ✅ Have emergency procedures ready
5. ✅ Prepare documentation and support

### Deploy to Mainnet
```bash
npx hardhat run scripts/deploy.js --network bsc
```

### Verify on Mainnet
```bash
npx hardhat verify --network bsc 0xYourFactoryAddress
```

---

## 🛠️ Troubleshooting

### "Insufficient funds for gas"
- Ensure you have enough BNB in your wallet
- Check gas price in hardhat.config.js

### "Nonce too high"
```bash
npx hardhat clean
npx hardhat compile
```

### Contract verification fails
- Check that your Solidity version matches
- Ensure constructor arguments are correct
- Wait a few minutes and try again

### Frontend can't connect to contracts
- Verify factory address is correct
- Check that ABIs are exported
- Ensure wallet is connected to correct network

---

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [BSC Documentation](https://docs.bnbchain.org/)
- [Wagmi Docs](https://wagmi.sh/)

---

## 🎯 Next Steps

After successful deployment:

1. **Test extensively** with small amounts
2. **Gather user feedback**
3. **Implement real-time updates** (WebSocket)
4. **Add price charts**
5. **Create points/rewards system**
6. **Marketing and community building**

---

## 🆘 Getting Help

If you run into issues:

1. Check the console for error messages
2. Review the IMPLEMENTATION_ROADMAP.md
3. Check transaction on BSCScan
4. Review Hardhat/Ethers.js documentation

---

## ✅ Checklist

Before going live:

- [ ] Smart contracts compiled successfully
- [ ] Deployed to testnet and tested
- [ ] ABIs exported to frontend
- [ ] Factory address updated in code
- [ ] Contracts verified on BSCScan
- [ ] Created test launches
- [ ] Tested buy/sell functionality
- [ ] Tested rush mode
- [ ] Tested anti-sniping
- [ ] Tested referral system
- [ ] Backend API running
- [ ] Event indexer working
- [ ] Frontend connects to contracts
- [ ] Wallet connection working
- [ ] Navigation updated
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile responsive
- [ ] Security audit completed (for mainnet)
- [ ] Emergency procedures documented
- [ ] Support channels ready

---

**Good luck with your launch! 🚀**
