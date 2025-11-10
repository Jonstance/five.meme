import mongoose from "mongoose";
import { ExpressApi } from "./express.api";
import { getIndexer } from "./services/eventIndexer";
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/padmeme';

async function startServer() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // Start Express API
    const api = new ExpressApi();
    api.run();

    // Start event indexer if factory address is configured
    if (process.env.FACTORY_ADDRESS) {
      console.log('🔍 Starting blockchain event indexer...');
      const indexer = getIndexer();
      await indexer.start();
    } else {
      console.log('⚠️  FACTORY_ADDRESS not configured');
      console.log('   Deploy contracts and add FACTORY_ADDRESS to .env to enable event indexing');
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    const indexer = getIndexer();
    indexer.stop();
    await mongoose.connection.close();
    console.log('✅ Cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();

// Export app for compatibility
const app = new ExpressApi().app;
export { app };