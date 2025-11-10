# ⚡ Quick Start - Local Testing

**Test the entire platform locally in 5 minutes!**

---

## 🚀 One-Time Setup (First Time Only)

### 1. Install MongoDB
```bash
# macOS
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# OR use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Install Dependencies (if not done)
```bash
npm install
cd backend && npm install && cd ..
```

---

## 🏃 Start Testing (Every Time)

### Open 3 Terminals:

#### Terminal 1: Hardhat Node
```bash
npm run node
```
**Leave this running!** ✅

#### Terminal 2: Deploy & Backend
```bash
# Deploy contracts (takes 10 seconds)
npm run deploy:local

# Start backend
cd backend
npm run dev
```
**Leave this running!** ✅

#### Terminal 3: Frontend
```bash
npm run dev
```
**Leave this running!** ✅

---

## 🎯 You're Ready!

### Visit
[http://localhost:5173](http://localhost:5173)

### Connect Wallet to Localhost

**MetaMask Settings:**
- **Network Name:** Hardhat Local
- **RPC URL:** `http://127.0.0.1:8545`
- **Chain ID:** `31337`
- **Symbol:** ETH

### Import Test Account

**Private Key** (from Hardhat node output):
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

You'll have **10,000 ETH** for testing! 💰

---

## 🧪 What to Test

### 1. View Test Launch
The deployment automatically creates a test launch.
Find the address in the deploy output and visit:
```
http://localhost:5173/launch/[ADDRESS]
```

### 2. Create Your Own Launch
1. Go to [http://localhost:5173/create-launch](http://localhost:5173/create-launch)
2. Fill in details
3. Pay 0.01 ETH creation fee
4. Start trading!

### 3. Test Market Discovery
- [http://localhost:5173/market](http://localhost:5173/market)
- Filter, sort, search
- Click cards to view launches

### 4. Test Trading
- Buy tokens
- Wait 10 min for rush mode to end
- Sell tokens
- Watch bonding curve pricing
- Test referral rewards

---

## 🔄 Reset Everything

```bash
# Stop all terminals (Ctrl+C)
# Delete deployment data
rm deployments/localhost.json

# Clear MongoDB
mongosh
> use padmeme
> db.bondinglaunchs.deleteMany({})
> exit

# Start again from Terminal 1, 2, 3 above
```

---

## 📚 Full Documentation

- **[LOCAL_TESTING.md](LOCAL_TESTING.md)** - Complete guide
- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Backend details
- **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Frontend integration

---

## 💡 Quick Tips

- **Instant Transactions:** Hardhat auto-mines blocks
- **Unlimited ETH:** Test accounts have 10,000 ETH
- **Reset Anytime:** Just restart the node
- **Real Blockchain:** Everything works like mainnet!

---

**That's it! Start testing your bonding curve platform! 🎉**
