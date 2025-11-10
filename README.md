# 🚀 pad.meme - Bonding Curve Launchpad

A next-generation **bonding curve launchpad** on Binance Smart Chain, inspired by four.meme. Launch and trade tokens with continuous automated market making, anti-sniping protection, and automatic DEX graduation.

## 🎯 What's Different?

**Traditional Presales:**
- Fixed price, fixed timeline
- Manual finalization
- No trading until DEX listing

**Our Bonding Curve System:**
- ✨ **Instant Trading** - Buy/sell immediately on bonding curve
- 📈 **Dynamic Pricing** - Price increases with supply sold
- 🎓 **Auto-Graduation** - Automatic PancakeSwap listing at 80% sold
- 🛡️ **Anti-Sniping** - Max buy limits in first 3 blocks
- ⏰ **Rush Mode** - 10-minute time-locked selling to prevent dumps
- 💰 **Referral Rewards** - 0.25% of trading fees to referrers
- 🔄 **Fair Launch** - No presale advantages, everyone trades on same curve

## ✨ Key Features

### Smart Contracts
- **BondingCurveLaunch.sol** - Core bonding curve with security features
- **BondingCurveFactory.sol** - One-click launch creation
- Linear price curve algorithm
- 1% trading fee structure
- Internal token accounting with claims
- Admin verification & flagging system

### Trading Interface
- Modern buy/sell UI with real-time calculations
- Slippage controls (0.5%, 1%, 2%, 5%)
- Referral address input for rewards
- Rush mode warnings
- Market stats dashboard
- Bonding curve progress visualization

### Market Discovery
- Search by name/symbol
- Sort: Newest, Hot (volume), Top (market cap), Completed
- Filter: All, Active, Graduated, Verified
- Rich token cards with live stats
- Mobile-responsive design

### Design System
- Neon green theme (#6CFF32) inspired by four.meme
- Dark mode with high contrast
- Smooth animations and transitions
- Reusable SCSS mixins and variables
- Production-ready component library

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, SCSS
- **Animations**: Framer Motion
- **Blockchain**: Ethers.js v5, Wagmi 2.15, RainbowKit 2.2
- **Smart Contracts**: Solidity 0.8.17, OpenZeppelin, Hardhat
- **Backend**: Node.js, Express, MongoDB
- **Build Tool**: Vite

## 🚀 Quick Start (30 Minutes)

### 1. Clone & Install
```bash
git clone <your-repo>
cd Billipad-new
npm install
```

### 2. Setup Hardhat (for contracts)
```bash
chmod +x scripts/setup-hardhat.sh
./scripts/setup-hardhat.sh
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your private key and API keys
```

### 4. Deploy to BSC Testnet
```bash
# Get testnet BNB from https://testnet.binance.org/faucet-smart
npm run compile
npm run deploy:testnet
```

### 5. Update Factory Address
Copy the deployed address and update `src/utility/connect.ts`:
```typescript
export const BONDING_CURVE_FACTORY_ADDRESS = "0xYourDeployedAddress"
```

### 6. Export ABIs & Start Dev Server
```bash
npm run export-abis
npm run dev
```

Visit `http://localhost:5173` 🎉

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 30 minutes
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup walkthrough
- **[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)** - Full 10-phase roadmap
- **[WHATS_NEW.md](WHATS_NEW.md)** - What's been added to your project

## 📦 Project Structure

```
Billipad-new/
├── contracts/                    # Smart contracts (NEW)
│   ├── BondingCurveLaunch.sol
│   └── BondingCurveFactory.sol
├── scripts/                      # Deployment scripts (NEW)
│   ├── deploy.js
│   └── setup-hardhat.sh
├── src/
│   ├── components/
│   │   ├── TradingInterface/    # Trading UI (NEW)
│   │   ├── Navbar/
│   │   └── Footer/
│   ├── pages/
│   │   ├── MarketDiscovery/     # Token discovery (NEW)
│   │   ├── LaunchPage/
│   │   └── ...
│   ├── styles/
│   │   └── variables.scss       # Design system (NEW)
│   └── ABIs/                    # Contract ABIs
├── backend/
│   └── src/
│       └── express.api.ts
├── QUICK_START.md               # 30-min guide (NEW)
├── SETUP_GUIDE.md               # Complete guide (NEW)
├── IMPLEMENTATION_ROADMAP.md    # 10-phase plan (NEW)
└── WHATS_NEW.md                 # What's new (NEW)
```

## 🎮 Available Commands

### Development
```bash
npm run dev              # Start development server (Vite)
npm run build            # Build for production
npm run preview          # Preview production build
```

### Smart Contracts
```bash
npm run compile          # Compile smart contracts
npm run deploy:testnet   # Deploy to BSC Testnet
npm run deploy:mainnet   # Deploy to BSC Mainnet
npm run verify:testnet   # Verify on BSCScan Testnet
npm run verify:mainnet   # Verify on BSCScan Mainnet
npm run export-abis      # Export ABIs to frontend
npm run clean            # Clean build artifacts
```

### Full Setup
```bash
npm run setup            # Install, compile, and export ABIs
```

## 🎨 Design Showcase

### Neon Green Theme
Primary color: `#6CFF32` (inspired by four.meme)

### Components Built
- ✅ TradingInterface - Complete buy/sell UI
- ✅ MarketDiscovery - Token discovery with filtering
- ✅ Card layouts with hover effects
- ✅ Progress bars with gradients
- ✅ Loading states and spinners
- ✅ Responsive navigation

### Reusable Mixins (SCSS)
```scss
@include card-neon-hover;     // Neon glow on hover
@include button-primary;       // Neon green button
@include input-field;          // Styled input
@include progress-bar(12px);   // Progress indicator
```

## 🔒 Security Features

### Smart Contract Security
- ✅ ReentrancyGuard on all state-changing functions
- ✅ Ownable access control
- ✅ SafeMath (Solidity 0.8+ built-in)
- ✅ Anti-sniping mechanism (max buy in first 3 blocks)
- ✅ Rush mode (time-locked selling)

### Recommended Before Mainnet
- 🔄 Professional audit ($5-15K)
- 🔄 Pausable emergency mechanism
- 🔄 Comprehensive test suite
- 🔄 Bug bounty program

## 📊 Feature Comparison

| Feature | Your Project | four.meme |
|---------|-------------|-----------|
| Bonding Curve Trading | ✅ | ✅ |
| Anti-Sniping | ✅ | ✅ |
| Rush Mode | ✅ | ✅ |
| Referral Rewards | ✅ | ✅ |
| Auto DEX Graduation | ✅ | ✅ |
| Market Discovery | ✅ | ✅ |
| Neon Green Design | ✅ | ✅ |
| Real-time Updates | 🔄 | ✅ |
| Price Charts | 🔄 | ✅ |
| Points System | 🔄 | ✅ |
| Multi-language | 🔄 | ✅ |

✅ = Implemented | 🔄 = Planned

## 🚧 Roadmap

### Phase 1-2: Core (✅ COMPLETE)
- Smart contracts with bonding curve
- Trading interface
- Market discovery
- Design system

### Phase 3-4: Backend & Data (🔄 Next)
- Event indexer
- WebSocket real-time updates
- Price oracle
- REST APIs

### Phase 5-6: Advanced Features
- Points/rewards system
- Price charts
- Limit orders
- DEX integration completion

### Phase 7-8: Polish & Launch
- Security audit
- Performance optimization
- Marketing materials
- Mainnet deployment

See [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) for complete details.

## 💰 Estimated Costs

### Development
- Smart contract audit: $5,000 - $15,000
- Developer time: Variable

### Deployment (BSC)
- Factory deployment: ~$2-5
- Each token launch: ~$1-2
- Buy/sell transactions: ~$0.20-0.50

### Operations (Monthly)
- Server hosting: $50-200
- Database: $30-100
- Domain + SSL: $2-5

## 🆘 Getting Help

1. **Setup Issues?**
   - Check [SETUP_GUIDE.md](SETUP_GUIDE.md)
   - Review console errors
   - Verify .env configuration

2. **Contract Questions?**
   - Read inline comments in `.sol` files
   - Check [OpenZeppelin docs](https://docs.openzeppelin.com/)

3. **Integration Help?**
   - See [WHATS_NEW.md](WHATS_NEW.md) for integration examples
   - Review TradingInterface component code

## 🤝 Contributing

Contributions welcome! Areas to improve:

- Real-time price updates (WebSocket)
- Price chart integration
- Points/rewards system
- Multi-language support
- Mobile app
- Test coverage

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- Inspired by [four.meme](https://four.meme/)
- Built with [OpenZeppelin](https://openzeppelin.com/) contracts
- Powered by [Binance Smart Chain](https://www.bnbchain.org/)

## 🌟 Support

If you find this project useful:
- ⭐ Star this repository
- 🐛 Report bugs via issues
- 💡 Suggest features
- 🔄 Share with your community

---

**Ready to launch your bonding curve platform? Let's go! 🚀**
