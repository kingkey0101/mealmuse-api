// mealmuse-api/scripts/ensureIndexes.ts
import { getDb } from "../utils/mongo";

async function ensure() {
  const db = await getDb();
  await db.collection("ai_cache").createIndex({ created_at: 1 }, { expireAfterSeconds: 86400 });
  await db.collection("recipes").createIndex({ title: "text", ingredients: "text" });

  // Favorites indexes
  await db.collection("user_favorites").createIndex({ userId: 1, recipeId: 1 }, { unique: true });
  await db.collection("user_favorites").createIndex({ userId: 1 });
  await db.collection("user_favorites").createIndex({ recipeId: 1 });

  console.log("Indexes ensured");
  process.exit(0);
}

ensure().catch(err => { console.error(err); process.exit(1); });