import { getDb } from "../utils/mongo";

async function seed() {
  try {
    const db = await getDb();
    const recipes = db.collection("recipes");
    // optional reset
    await recipes.deleteMany({});
    const result = await recipes.insertMany([
      { title: "Pantry Pasta", ingredients: ["pasta","olive oil","garlic"], created_at: new Date() },
      { title: "Quick Stir Fry", ingredients: ["rice","veg","soy sauce"], created_at: new Date() }
    ]);
    console.log("Inserted count:", result.insertedCount);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();