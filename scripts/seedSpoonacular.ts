import { getDb } from "../utils/mongo";
import { searchRecipes } from "../utils/spoonacular";
import { normalizeSpoonacularRecipe } from "../utils/normalizeRecipe";

// 10 cuisines × 5 diets = 50 API requests (exactly at daily limit)
const CUISINES = ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'French', 'American', 'Mediterranean', 'Korean'];
const DIETS = ['Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Ketogenic']; // Removed 'Paleo' to stay under 50/day limit
const COOKING_TIMES = [15, 30, 45, 60];

async function seedSpoonacularRecipes() {
  try {
    const db = await getDb();
    const recipesCollection = db.collection('recipes');

    console.log('🌱 Starting Spoonacular seeding...');
    console.log(`📊 API Usage: ${CUISINES.length} cuisines × ${DIETS.length} diets = ${CUISINES.length * DIETS.length} API requests (50/day limit)`);
    console.log('⏳ This will take a few minutes due to rate limiting...\n');
    let savedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Fetch from different combinations
    for (const cuisine of CUISINES) {
      for (const diet of DIETS) {
        try {
          console.log(`Fetching ${cuisine} ${diet} recipes...`);

          const recipes = await searchRecipes({
            cuisine,
            diet,
            number: 10,
          });

          for (const spoonRecipe of recipes) {
            try {
              // Check for duplicates
              const existing = await recipesCollection.findOne({
                spoonacularId: spoonRecipe.id,
              });

              if (existing) {
                skippedCount++;
                continue;
              }

              // Normalize and save
              const normalized = normalizeSpoonacularRecipe(spoonRecipe);
              await recipesCollection.insertOne({
                ...normalized,
                isSeeded: true,
                created_at: new Date(),
                updated_at: new Date(),
              });

              savedCount++;
              console.log(`✓ Saved: ${normalized.title}`);
            } catch (err) {
              const errMsg = `Failed to save ${spoonRecipe.title}: ${err}`;
              errors.push(errMsg);
              console.error(errMsg);
            }
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          const errMsg = `Error fetching ${cuisine} ${diet}: ${err}`;
          errors.push(errMsg);
          console.error(errMsg);
        }
      }
    }

    console.log(`\n=== Seeding Complete ===`);
    console.log(`Saved: ${savedCount} recipes`);
    console.log(`Skipped (duplicates): ${skippedCount} recipes`);
    if (errors.length > 0) {
      console.log(`Errors: ${errors.length}`);
      errors.forEach(e => console.error(`  - ${e}`));
    }

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seedSpoonacularRecipes();
