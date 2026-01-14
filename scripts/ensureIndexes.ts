// mealmuse-api/scripts/ensureIndexes.ts
import { getDb } from "../utils/mongo";

async function ensure() {
  const db = await getDb();
  await db.collection("ai_cache").createIndex({ created_at: 1 }, { expireAfterSeconds: 86400 });
  await db.collection("recipes").createIndex({ title: "text", ingredients: "text" });
  console.log("Indexes ensured");
  process.exit(0);
}

ensure().catch(err => { console.error(err); process.exit(1); });