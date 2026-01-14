// scripts/testFetch.ts
import { getDb } from "../utils/mongo";

async function test() {
  try {
    const db = await getDb();
    const docs = await db.collection("recipes").find({}).limit(50).toArray();
    console.log("recipes:", docs);
    process.exit(0);
  } catch (err) {
    console.error("testFetch error:", err);
    process.exit(1);
  }
}

test();