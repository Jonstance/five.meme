#!/bin/bash

# 🔧 Hardhat Setup Script
# This script installs all necessary dependencies for smart contract development

echo "🚀 Setting up Hardhat for smart contract development..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing base dependencies..."
    npm install
    echo ""
fi

# Install Hardhat and tools
echo "🔨 Installing Hardhat and development tools..."
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers @nomicfoundation/hardhat-chai-matchers

# Install OpenZeppelin contracts
echo "🛡️ Installing OpenZeppelin contracts..."
npm install @openzeppelin/contracts

# Install additional dependencies
echo "📚 Installing additional dependencies..."
npm install dotenv ethers@^5.8.0

# Create directories
echo "📁 Creating project directories..."
mkdir -p contracts
mkdir -p scripts
mkdir -p test
mkdir -p deployments
mkdir -p src/ABIs

# Create .gitignore additions
echo "📝 Updating .gitignore..."
cat >> .gitignore << EOL

# Hardhat
cache/
artifacts/
deployments/*.json
!deployments/.gitkeep

# Environment
.env
.env.local

# Misc
coverage/
coverage.json
typechain/
typechain-types/
EOL

# Create .env.example
echo "📄 Creating .env.example..."
cat > .env.example << EOL
# Private key for deployment (NEVER commit your real key!)
PRIVATE_KEY=your_private_key_here

# BSCScan API key for contract verification
BSCSCAN_API_KEY=your_bscscan_api_key_here

# Network (bscTestnet or bsc)
REACT_APP_NETWORK=bscTestnet

# Backend API URL
REACT_APP_API_URL=http://localhost:3001

# WebSocket URL
REACT_APP_WS_URL=ws://localhost:3001
EOL

# Create deployments directory placeholder
touch deployments/.gitkeep

# Create export-abis script
echo "📜 Creating ABI export script..."
cat > scripts/export-abis.js << 'EOL'
const fs = require('fs');
const path = require('path');

const contracts = [
  'BondingCurveLaunch',
  'BondingCurveFactory'
];

console.log('📦 Exporting ABIs to src/ABIs/...\n');

contracts.forEach(contract => {
  try {
    const artifactPath = path.join(__dirname, `../artifacts/contracts/${contract}.sol/${contract}.json`);
    const artifact = require(artifactPath);

    const outputPath = path.join(__dirname, `../src/ABIs/${contract}.json`);
    fs.writeFileSync(
      outputPath,
      JSON.stringify(artifact, null, 2)
    );

    console.log(`✅ Exported ${contract}.json`);
  } catch (error) {
    console.error(`❌ Error exporting ${contract}:`, error.message);
  }
});

console.log('\n✅ ABI export complete!');
EOL

# Add npm scripts to package.json
echo "📝 Adding npm scripts..."
node << 'EOL'
const fs = require('fs');
const packageJson = require('./package.json');

// Add hardhat scripts
packageJson.scripts = {
  ...packageJson.scripts,
  'compile': 'hardhat compile',
  'deploy:testnet': 'hardhat run scripts/deploy.js --network bscTestnet',
  'deploy:mainnet': 'hardhat run scripts/deploy.js --network bsc',
  'verify:testnet': 'hardhat verify --network bscTestnet',
  'verify:mainnet': 'hardhat verify --network bsc',
  'export-abis': 'node scripts/export-abis.js',
  'setup': 'npm install && hardhat compile && node scripts/export-abis.js',
  'clean': 'hardhat clean && rm -rf cache artifacts'
};

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Package.json updated with Hardhat scripts');
EOL

echo ""
echo "✅ Hardhat setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Copy .env.example to .env and fill in your details"
echo "   2. Run 'npm run compile' to compile contracts"
echo "   3. Run 'npm run deploy:testnet' to deploy to BSC testnet"
echo "   4. Run 'npm run export-abis' to export ABIs to frontend"
echo ""
echo "📚 Read SETUP_GUIDE.md for detailed instructions"
echo "⚡ Read QUICK_START.md for a quick overview"
echo ""
