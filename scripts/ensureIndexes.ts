// mealmuse-api/scripts/ensureIndexes.ts
import { getDb } from "../utils/mongo";

async function ensure() {
  const db = await getDb();
  await db.collection("ai_cache").createIndex({ created_at: 1 }, { expireAfterSeconds: 86400 });
  await db.collection("recipes").createIndex({ title: "text", ingredients: "text" });

  // Skill level filtering
  await db.collection("recipes").createIndex({ skill: 1 });
  
  // Dietary preferences filtering
  await db.collection("recipes").createIndex({ dietaryPreferences: 1 });
  
  // Cooking time filtering
  await db.collection("recipes").createIndex({ cookingTime: 1 });
  
  // Combined indexes for common filter patterns
  await db.collection("recipes").createIndex({ skill: 1, cookingTime: 1 });
  await db.collection("recipes").createIndex({ dietaryPreferences: 1, cookingTime: 1 });

  // Favorites indexes
  await db.collection("user_favorites").createIndex({ userId: 1, recipeId: 1 }, { unique: true });
  await db.collection("user_favorites").createIndex({ userId: 1 });
  await db.collection("user_favorites").createIndex({ recipeId: 1 });

  console.log("Indexes ensured");
  process.exit(0);
}

ensure().catch(err => { console.error(err); process.exit(1); });