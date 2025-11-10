# 🎨 Frontend Integration Guide

This guide shows you how to integrate the new bonding curve components into your existing pages.

---

## ✅ What's Already Done

### New Pages Created
- ✅ [src/pages/MarketDiscovery/](src/pages/MarketDiscovery/) - Token discovery with filtering/sorting
- ✅ [src/pages/CreateBondingLaunch/](src/pages/CreateBondingLaunch/) - 4-step launch creation wizard
- ✅ [src/components/TradingInterface/](src/components/TradingInterface/) - Buy/sell trading UI

### New Hooks
- ✅ [src/hooks/useBondingCurve.ts](src/hooks/useBondingCurve.ts) - React hook for contract interactions

### Updated Files
- ✅ [src/App.tsx](src/App.tsx) - Added routes for `/market` and `/create-launch`
- ✅ [src/components/Navbar/Navbar.tsx](src/components/Navbar/Navbar.tsx) - Added Discover and Launch links

---

## 🔧 Integration Steps

### 1. Update Factory Address (REQUIRED)

After deploying your contracts, update the factory address:

**File:** `src/pages/CreateBondingLaunch/CreateBondingLaunch.tsx`

```typescript
// Line 73 - Change this:
const FACTORY_ADDRESS = "0x..."; // TODO: Update with deployed address

// To:
const FACTORY_ADDRESS = "0xYourDeployedFactoryAddress";
```

**Alternative:** Create a config file:

```typescript
// src/config/contracts.ts
export const CONTRACTS = {
  BONDING_CURVE_FACTORY: "0xYourFactoryAddress",
  // Add more as needed
};

// Then import in CreateBondingLaunch:
import { CONTRACTS } from '../../config/contracts';
const FACTORY_ADDRESS = CONTRACTS.BONDING_CURVE_FACTORY;
```

---

### 2. Integrate TradingInterface into LaunchPage

Update your existing LaunchPage to use the new TradingInterface:

**File:** `src/pages/LaunchPage/LaunchPage.tsx`

```typescript
import TradingInterface from '../../components/TradingInterface/TradingInterface';

// Inside your LaunchPage component:
const LaunchPage = () => {
  // ... your existing code ...

  // Check if this is a bonding curve launch (vs old presale)
  const isBondingCurveLaunch = data?.isBondingCurve || false;

  return (
    <div className="launch-page">
      <Navbar />

      {/* Existing presale UI */}
      {!isBondingCurveLaunch && (
        <div className="legacy-presale">
          {/* Your existing presale UI */}
        </div>
      )}

      {/* New bonding curve UI */}
      {isBondingCurveLaunch && (
        <TradingInterface
          launchAddress={params.id!}
          tokenSymbol={data.symbol}
          tokenName={data.name}
          graduated={data.graduated || false}
        />
      )}

      <Footer />
    </div>
  );
};
```

---

### 3. Update RainbowKit Theme (Optional)

Match the neon green theme:

**File:** `src/main.tsx`

```typescript
import { darkTheme } from '@rainbow-me/rainbowkit';

// Update the theme:
<RainbowKitProvider
  theme={darkTheme({
    accentColor: '#6CFF32', // ← Changed from '#f3ba2f' to neon green
    accentColorForeground: 'black',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small',
  })}
>
```

---

### 4. Add Global Styles

Import the design system variables in your main CSS:

**File:** `src/App.css`

```css
@import './styles/variables.scss';

/* Use the variables */
body {
  background: var(--dark-bg);
  color: var(--text-primary);
}

/* Or use SCSS directly */
.my-component {
  @include card-neon-hover;
  color: $neon-green;
}
```

---

## 🚀 Usage Examples

### Example 1: Using the Hook Directly

```typescript
import { useBondingCurve } from '../hooks/useBondingCurve';

const MyComponent = () => {
  const {
    marketStats,
    userBalance,
    buyTokens,
    sellTokens,
    isLoading
  } = useBondingCurve("0xLaunchAddress");

  const handleBuy = async () => {
    try {
      await buyTokens("0.1", "0xReferrerAddress");
      toast.success("Bought successfully!");
    } catch (error) {
      toast.error("Buy failed");
    }
  };

  return (
    <div>
      <p>Price: {marketStats?.currentPrice} BNB</p>
      <p>Your tokens: {userBalance.tokens}</p>
      <button onClick={handleBuy}>Buy 0.1 BNB</button>
    </div>
  );
};
```

### Example 2: Fetching All Launches

```typescript
import { ethers } from 'ethers';
import BondingCurveFactoryABI from '../ABIs/BondingCurveFactory.json';

const fetchLaunches = async () => {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const factory = new ethers.Contract(
    FACTORY_ADDRESS,
    BondingCurveFactoryABI.abi,
    provider
  );

  // Get paginated launches
  const launches = await factory.getAllLaunches(0, 20); // offset, limit

  // Get launch details
  for (const launchAddr of launches) {
    const info = await factory.getLaunchInfo(launchAddr);
    console.log(info.name, info.symbol, info.creator);
  }
};
```

### Example 3: Listening to Events

```typescript
const listenToEvents = () => {
  const factory = new ethers.Contract(
    FACTORY_ADDRESS,
    BondingCurveFactoryABI.abi,
    provider
  );

  // Listen for new launches
  factory.on("LaunchCreated", (launchAddress, token, creator, name, symbol) => {
    console.log(`New launch: ${name} (${symbol}) at ${launchAddress}`);
    // Update your UI
  });

  // Cleanup
  return () => {
    factory.removeAllListeners();
  };
};
```

---

## 🎨 Design System Usage

### Using SCSS Mixins

```scss
@import '../../styles/variables.scss';

.my-trading-card {
  @include card-neon-hover; // Card with neon glow on hover
  padding: $spacing-2xl;

  .buy-button {
    @include button-primary; // Neon green button
  }

  .price {
    @include neon-text; // Gradient neon text
    font-size: $font-xl;
  }

  .progress {
    @include progress-bar(12px); // Progress indicator
  }
}
```

### Using CSS Variables

```tsx
const MyComponent = () => (
  <div style={{
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)'
  }}>
    <button style={{
      background: 'var(--neon-green)',
      color: 'var(--dark-bg)'
    }}>
      Click me
    </button>
  </div>
);
```

---

## 📱 Mobile Menu Integration

The mobile menu in Navbar now includes the new links automatically. No additional work needed!

---

## 🔄 Data Flow

### Creating a Launch
```
User → CreateBondingLaunch page
  → Fill 4-step form
  → Click "Create Launch"
  → BondingCurveFactory.createLaunch()
  → Token + Launch deployed
  → Redirect to /launch/:address
  → TradingInterface displays
```

### Trading Flow
```
User → /market (MarketDiscovery)
  → Click token card
  → Navigate to /launch/:address
  → TradingInterface loads
  → useBondingCurve hook fetches data
  → User buys/sells
  → Auto-refresh every 10s
```

---

## 🧪 Testing Checklist

After integration, test these flows:

### Creation Flow
- [ ] Navigate to `/create-launch`
- [ ] Fill in all 4 steps
- [ ] Wallet connects properly
- [ ] Transaction submits
- [ ] Redirects to launch page
- [ ] Token appears in `/market`

### Trading Flow
- [ ] Navigate to `/market`
- [ ] Search works
- [ ] Filters work (All, Active, Graduated, Verified)
- [ ] Sort works (Newest, Hot, Top, Completed)
- [ ] Click on token card
- [ ] TradingInterface loads
- [ ] Buy transaction works
- [ ] Balance updates
- [ ] Rush mode warning shows (if applicable)
- [ ] Sell transaction works (after 10 min)

### Mobile Flow
- [ ] Hamburger menu opens
- [ ] All links accessible
- [ ] Forms are responsive
- [ ] Trading interface works on mobile
- [ ] Cards display properly

---

## 🐛 Common Issues & Fixes

### Issue: "Contract not found"
**Fix:** Make sure you've deployed contracts and updated the factory address.

### Issue: "Cannot read properties of undefined"
**Fix:** Add null checks:
```typescript
const price = marketStats?.currentPrice || '0';
```

### Issue: "User rejected transaction"
**Fix:** This is expected. Handle gracefully:
```typescript
catch (error: any) {
  if (error.code === 4001) {
    toast.info("Transaction cancelled");
  }
}
```

### Issue: "Insufficient funds"
**Fix:** Check user has enough BNB:
```typescript
if (parseFloat(bnbAmount) > parseFloat(userBalance.bnb)) {
  toast.error("Insufficient BNB balance");
  return;
}
```

### Issue: CSS not applying
**Fix:** Make sure to import SCSS files:
```typescript
import './Component.scss';
```

---

## 🎯 Next Steps

1. **Deploy Contracts**
   ```bash
   npm run compile
   npm run deploy:testnet
   ```

2. **Update Factory Address**
   - In `CreateBondingLaunch.tsx`
   - In your config file

3. **Test Locally**
   ```bash
   npm run dev
   ```

4. **Create Test Launch**
   - Go to `/create-launch`
   - Fill form
   - Deploy with testnet BNB

5. **Test Trading**
   - Go to `/market`
   - Find your token
   - Test buy/sell

6. **Deploy Frontend**
   ```bash
   npm run build
   # Deploy dist/ folder to your hosting
   ```

---

## 📚 Related Documentation

- [QUICK_START.md](QUICK_START.md) - 30-minute quick start
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
- [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) - Full roadmap
- [WHATS_NEW.md](WHATS_NEW.md) - All changes summary

---

## 💡 Pro Tips

1. **Use TypeScript**: All components are fully typed for better DX
2. **Error Handling**: Always wrap contract calls in try-catch
3. **Loading States**: Use `isLoading` from the hook
4. **Auto-refresh**: Data refreshes every 10s automatically
5. **Mobile First**: All components are responsive by default

---

**Ready to integrate? Follow the steps above and you'll have a fully functional bonding curve launchpad! 🚀**

*Last Updated: 2025-11-01*
