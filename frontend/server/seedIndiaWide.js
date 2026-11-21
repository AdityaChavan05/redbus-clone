const mongoose = require('mongoose');
const { OPERATORS, ALL_BUSES_DATASET } = require('./data/indiaWideDataset');
const Bus = require('./models/bus');
const BusOperator = require('./models/operator');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/redbus";

async function seedDatabase() {
  console.log('--- India-Wide Bus Network Database Seeder ---');
  let isConnected = false;

  try {
    console.log(`Connecting to MongoDB (${MONGO_URI})...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Successfully connected to MongoDB.');
    isConnected = true;
  } catch (err) {
    console.warn('⚠️ MongoDB connection could not be established:', err.message);
    console.log('ℹ️ Running in resilient in-memory mode. The application uses the comprehensive dataset directly.');
    return { success: true, inMemory: true, operatorsCount: OPERATORS.length, busesCount: ALL_BUSES_DATASET.length };
  }

  try {
    // 1. Idempotently Seed Operators (prevent duplicates by operator name)
    console.log(`Seeding ${OPERATORS.length} Operators (24 Private + 11 Government)...`);
    let opsUpserted = 0;
    for (const op of OPERATORS) {
      await BusOperator.findOneAndUpdate(
        { name: op.name },
        { $set: op },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      opsUpserted++;
    }
    console.log(`✓ ${opsUpserted} Operators verified and seeded without duplication.`);

    // 2. Idempotently Seed Bus Routes (prevent duplicates by _id)
    console.log(`Seeding ${ALL_BUSES_DATASET.length} India-Wide Bus Routes...`);
    let busesUpserted = 0;
    for (const bus of ALL_BUSES_DATASET) {
      await Bus.findOneAndUpdate(
        { _id: bus._id },
        { $set: bus },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      busesUpserted++;
    }
    console.log(`✓ ${busesUpserted} Bus routes verified and seeded across India.`);

    console.log('--- Seeding Completed Successfully! ---');
    if (require.main === module) {
      process.exit(0);
    }
    return { success: true, operatorsCount: opsUpserted, busesCount: busesUpserted };
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
