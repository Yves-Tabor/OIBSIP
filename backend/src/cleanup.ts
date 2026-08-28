/**
 * One-time cleanup: drops the old pre-seeded Pizza document
 * so the user menu only shows admin-created Inventory items.
 * 
 * Run: node dist/cleanup.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI || '';

async function cleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Drop the old pre-seeded "pizzas" collection entirely
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'pizzas' }).toArray();
    if (collections.length > 0) {
      await db.collection('pizzas').drop();
      console.log('🗑️  Dropped old "pizzas" collection (pre-seeded items removed)');
    } else {
      console.log('ℹ️  No "pizzas" collection found — nothing to clean');
    }

    // Show current inventory count
    const invCount = await db.collection('inventories').countDocuments();
    console.log(`📦 Current inventory items: ${invCount}`);
    console.log('');
    console.log('✅ Cleanup complete!');
    console.log('   The user menu will now only show items you add via the Admin Inventory page.');
    
  } catch (err) {
    console.error('❌ Cleanup error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanup();
