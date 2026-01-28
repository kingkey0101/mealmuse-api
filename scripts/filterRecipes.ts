import { getDb } from "../utils/mongo";

// This script demonstrates filtering recipes by skill, dietary preferences, and cooking time
// Usage examples:
//   node dist/scripts/filterRecipes.js skill beginner
//   node dist/scripts/filterRecipes.js dietary vegetarian
//   node dist/scripts/filterRecipes.js time 25    (recipes under 25 minutes)
//   node dist/scripts/filterRecipes.js skill intermediate dietary gluten-free

(async () => {
    try {
        const db = await getDb();
        const args = process.argv.slice(2);

        if (args.length === 0) {
            console.log("Recipe Filtering Examples:");
            console.log("  node dist/scripts/filterRecipes.js skill beginner");
            console.log("  node dist/scripts/filterRecipes.js dietary vegetarian");
            console.log("  node dist/scripts/filterRecipes.js time 25");
            console.log("  node dist/scripts/filterRecipes.js skill intermediate dietary gluten-free");
            process.exit(0);
        }

        const filter: any = {};

        // Parse arguments
        for (let i = 0; i < args.length; i += 2) {
            const key = args[i];
            const value = args[i + 1];

            if (key === 'skill' && value) {
                filter.skill = value.toLowerCase();
            } else if (key === 'dietary' && value) {
                filter.dietaryPreferences = value;
            } else if (key === 'time' && value) {
                filter.cookingTime = { $lte: parseInt(value) };
            }
        }

        console.log("\nFilter criteria:", JSON.stringify(filter, null, 2));

        const results = await db.collection('recipes').find(filter).toArray();

        console.log(`\nFound ${results.length} recipes:\n`);
        results.forEach((recipe, idx) => {
            console.log(`${idx + 1}. ${recipe.title}`);
            console.log(`   Skill: ${recipe.skill}`);
            console.log(`   Cooking Time: ${recipe.cookingTime} minutes`);
            console.log(`   Dietary: ${recipe.dietaryPreferences.join(", ")}`);
            console.log("");
        });

        process.exit(0);
    } catch (err) {
        console.error("Filter error:", err);
        process.exit(1);
    }
})();
