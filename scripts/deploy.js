const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString(), "\n");

  // Deploy BondingCurveFactory
  console.log("📦 Deploying BondingCurveFactory...");
  const BondingCurveFactory = await hre.ethers.getContractFactory("BondingCurveFactory");
  const factory = await BondingCurveFactory.deploy();
  await factory.deployed();

  console.log("✅ BondingCurveFactory deployed to:", factory.address);
  console.log("   Transaction hash:", factory.deployTransaction.hash, "\n");

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await factory.deployTransaction.wait(5);
  console.log("✅ Confirmations complete\n");

  // Log deployment info
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log("BondingCurveFactory:", factory.address);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(50), "\n");

  // Create a test launch (optional - comment out for mainnet)
  if (hre.network.name !== "bsc") {
    console.log("🧪 Creating test launch...");

    const createTx = await factory.createLaunch(
      "Test Meme Coin",           // name
      "TMEME",                     // symbol
      ethers.utils.parseEther("1000000000"), // totalSupply (1B tokens)
      "https://placeholder.com/logo.png",    // logoUrl
      "The first test meme coin on our platform!", // description
      "https://example.com",       // website
      "https://twitter.com/test",  // twitter
      "https://t.me/test",         // telegram
      "https://discord.gg/test",   // discord
      { value: ethers.utils.parseEther("0.01") } // creation fee
    );

    const receipt = await createTx.wait();

    // Find LaunchCreated event
    const event = receipt.events?.find(e => e.event === "LaunchCreated");
    if (event) {
      console.log("✅ Test launch created!");
      console.log("   Launch address:", event.args.launchAddress);
      console.log("   Token address:", event.args.token);
      console.log("   Creator:", event.args.creator, "\n");
    }
  }

  // Save deployment addresses to file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    bondingCurveFactory: factory.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  fs.writeFileSync(
    `deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`💾 Deployment info saved to deployments/${hre.network.name}.json\n`);

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 VERIFICATION INSTRUCTIONS");
    console.log("=".repeat(50));
    console.log("Run the following command to verify on BSCScan:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${factory.address}`);
    console.log("=".repeat(50), "\n");
  }

  console.log("✅ Deployment complete! 🎉\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
