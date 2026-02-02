// scripts/initProdDb.ts
/**
 * Initialize production database (mealmuse_prod)
 * Run this ONCE after setting MM_MONGODB_DB=mealmuse_prod in AWS Lambda
 */

import { getDb } from '../utils/mongo';

async function initProdDb() {
  try {
    console.log('🚀 Initializing production database...');
    
    const db = await getDb('mealmuse_prod');
    console.log(`✅ Connected to database: ${db.databaseName}`);

    // 1. Create indexes for recipes collection
    console.log('\n📊 Creating indexes for recipes collection...');
    await db.collection('recipes').createIndexes([
      { key: { userId: 1 } },
      { key: { title: 'text', description: 'text' } },
      { key: { isSeeded: 1 } },
      { key: { created_at: -1 } },
    ]);
    console.log('✅ Recipe indexes created');

    // 2. Create indexes for users collection
    console.log('\n📊 Creating indexes for users collection...');
    await db.collection('users').createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { email: 1 }, unique: true, sparse: true },
      { key: { tier: 1 } },
    ]);
    console.log('✅ User indexes created');

    // 3. Create indexes for user_favorites collection
    console.log('\n📊 Creating indexes for user_favorites collection...');
    await db.collection('user_favorites').createIndexes([
      { key: { userId: 1 }, unique: true },
    ]);
    console.log('✅ User favorites indexes created');

    // 4. Create indexes for ai_interactions collection with TTL
    console.log('\n📊 Creating indexes for ai_interactions collection...');
    await db.collection('ai_interactions').createIndexes([
      { key: { userId: 1 } },
      { key: { type: 1 } },
      { key: { keywords: 1 } },
      { key: { topic: 1 } },
      { key: { created_at: 1 }, expireAfterSeconds: 7776000 }, // 90 days TTL
    ]);
    console.log('✅ AI interactions indexes created (90-day TTL)');

    // 5. Verify collections exist
    console.log('\n📋 Verifying collections...');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Available collections:', collectionNames);

    console.log('\n🎉 Production database initialized successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Verify AWS Lambda environment variable: MM_MONGODB_DB=mealmuse_prod');
    console.log('2. (Optional) Run seedRecipes.ts to populate with curated recipes');
    console.log('3. Deploy updated lambda_all.zip to AWS Lambda');
    console.log('4. Test all endpoints with production database');

  } catch (error) {
    console.error('❌ Error initializing production database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

initProdDb();
