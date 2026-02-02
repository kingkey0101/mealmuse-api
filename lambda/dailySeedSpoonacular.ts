// lambda/dailySeedSpoonacular.ts
/**
 * AWS Lambda handler for daily Spoonacular recipe seeding
 * Triggered by EventBridge once per day
 * Prevents duplicates via spoonacularId check
 */

import { getDb } from '../utils/mongo';
import { searchRecipes } from '../utils/spoonacular';
import { normalizeSpoonacularRecipe } from '../utils/normalizeRecipe';

const CUISINES = ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'French', 'American', 'Mediterranean', 'Korean'];
const DIETS = ['Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Ketogenic'];

interface SeedResult {
  statusCode: number;
  body: string;
}

export const handler = async (event: any): Promise<SeedResult> => {
  try {
    console.log('🌱 Daily Spoonacular seeding started...');
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    const db = await getDb();
    const recipesCollection = db.collection('recipes');

    let savedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Fetch from different cuisine/diet combinations
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
              // Check for duplicates by spoonacularId
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
                source: 'spoonacular',
                created_at: new Date(),
                updated_at: new Date(),
              });
              savedCount++;
            } catch (recipeErr) {
              errors.push(`Recipe ${spoonRecipe.id}: ${recipeErr}`);
            }
          }

          // Rate limiting: 1 second between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (cuisineErr) {
          errors.push(`${cuisine} ${diet}: ${cuisineErr}`);
        }
      }
    }

    const message = `✅ Daily seeding complete. Saved: ${savedCount}, Skipped (duplicates): ${skippedCount}`;
    console.log(message);

    if (errors.length > 0) {
      console.warn(`⚠️ Errors encountered (${errors.length}):`, errors.slice(0, 5));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message,
        savedCount,
        skippedCount,
        errors: errors.length > 0 ? errors.slice(0, 5) : [],
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (err) {
    console.error('❌ Error in daily seed handler:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to seed recipes',
        details: String(err),
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
