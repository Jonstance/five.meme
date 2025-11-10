const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🏠 Starting LOCAL deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // Deploy BondingCurveFactory
  console.log("📦 Deploying BondingCurveFactory...");
  const BondingCurveFactory = await hre.ethers.getContractFactory("BondingCurveFactory");
  const factory = await BondingCurveFactory.deploy();
  await factory.deployed();

  console.log("✅ BondingCurveFactory deployed to:", factory.address);
  console.log("   Transaction hash:", factory.deployTransaction.hash, "\n");

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    bondingCurveFactory: factory.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  fs.writeFileSync(
    path.join(deploymentsDir, "localhost.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to deployments/localhost.json\n");

  // Create test launch
  console.log("🧪 Creating test launch...");

  const createTx = await factory.createLaunch(
    "Test Meme Coin",           // name
    "TMEME",                     // symbol
    ethers.utils.parseEther("1000000000"), // totalSupply (1B tokens)
    "https://via.placeholder.com/100?text=TMEME",    // logoUrl
    "The first test meme coin on our local platform! Ready for trading on bonding curves.",
    "https://example.com",       // website
    "https://twitter.com/test",  // twitter
    "https://t.me/test",         // telegram
    "https://discord.gg/test",   // discord
    { value: ethers.utils.parseEther("0.01") } // creation fee
  );

  const receipt = await createTx.wait();

  // Find LaunchCreated event
  const event = receipt.events?.find(e => e.event === "LaunchCreated");
  let testLaunchAddress = null;
  let testTokenAddress = null;

  if (event) {
    testLaunchAddress = event.args.launchAddress;
    testTokenAddress = event.args.token;
    console.log("✅ Test launch created!");
    console.log("   Launch address:", testLaunchAddress);
    console.log("   Token address:", testTokenAddress);
    console.log("   Creator:", event.args.creator, "\n");
  }

  // Copy ABIs to backend
  console.log("📋 Copying ABIs to backend...");
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const backendABIsDir = path.join(__dirname, "../backend/src/ABIs");

  // Ensure backend ABIs directory exists
  if (!fs.existsSync(backendABIsDir)) {
    fs.mkdirSync(backendABIsDir, { recursive: true });
  }

  // Copy Factory ABI
  const factoryABI = path.join(artifactsDir, "BondingCurveFactory.sol/BondingCurveFactory.json");
  const factoryDest = path.join(backendABIsDir, "BondingCurveFactory.json");
  fs.copyFileSync(factoryABI, factoryDest);
  console.log("   ✅ BondingCurveFactory ABI copied");

  // Copy Launch ABI
  const launchABI = path.join(artifactsDir, "BondingCurveLaunch.sol/BondingCurveLaunch.json");
  const launchDest = path.join(backendABIsDir, "BondingCurveLaunch.json");
  fs.copyFileSync(launchABI, launchDest);
  console.log("   ✅ BondingCurveLaunch ABI copied\n");

  // Update .env file
  console.log("🔧 Updating .env file...");
  const envPath = path.join(__dirname, "../.env");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Update or add FACTORY_ADDRESS
  const factoryAddressRegex = /FACTORY_ADDRESS=.*/;
  const newFactoryLine = `FACTORY_ADDRESS=${factory.address}`;

  if (factoryAddressRegex.test(envContent)) {
    envContent = envContent.replace(factoryAddressRegex, newFactoryLine);
  } else {
    envContent += `\n${newFactoryLine}\n`;
  }

  // Update or add BSC_RPC_URL for localhost
  const rpcRegex = /BSC_RPC_URL=.*/;
  const newRpcLine = `BSC_RPC_URL=http://127.0.0.1:8545`;

  if (rpcRegex.test(envContent)) {
    envContent = envContent.replace(rpcRegex, newRpcLine);
  } else {
    envContent += `${newRpcLine}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("   ✅ .env updated with factory address and local RPC\n");

  // Print summary
  console.log("📋 LOCAL DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:                localhost (Hardhat)");
  console.log("BondingCurveFactory:    ", factory.address);
  console.log("Deployer:               ", deployer.address);
  console.log("Test Launch:            ", testLaunchAddress || "N/A");
  console.log("Test Token:             ", testTokenAddress || "N/A");
  console.log("=".repeat(60), "\n");

  console.log("✅ Local deployment complete! 🎉\n");
  console.log("📝 NEXT STEPS:");
  console.log("   1. Start backend:  cd backend && npm run dev");
  console.log("   2. Start frontend: npm run dev");
  console.log("   3. Visit http://localhost:5173");
  console.log("   4. Create launches and test trading!\n");

  console.log("💡 TIP: Your test launch is already created!");
  console.log(`   Visit: http://localhost:5173/launch/${testLaunchAddress}\n`);
}

main()
  .then(() => {
    console.log("✨ You can now use the local blockchain for testing!");
    console.log("   The Hardhat node is still running in the other terminal.\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
