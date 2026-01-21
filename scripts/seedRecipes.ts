import { getDb } from "../utils/mongo";

async function seed() {
  try {
    const db = await getDb();
    const recipes = db.collection("recipes");
    // optional reset
    await recipes.deleteMany({});
    const result = await recipes.insertMany([
      {
        title: "Pantry Pasta",
        cuisine: ['Italian'],
        ingredients: ["pasta", "olive oil", "garlic"],
        skill: 'beginner',
        steps: ['Bring water to a boil', 'Add the pasta', 'Cook 10-12 minutes based on package instructions', 'Drain pasta', 'Toss in olive oil', 'Add garlic'],
        equipment: ['Large pot', 'Strainer', 'tongs'], created_at: new Date(),
      },
      {
        title: "Chicken Stir Fry",
        cuisine: ['Chinese'],
        ingredients: ['Chicken breast or thigh', "soy sauce", "veg", 'Ginger', 'Garlic', "rice"],
        skill: 'intermediate',
        steps: ['Slice chicken and vetetables', 'Heat wok over high heat', 'Stir fry chicken until browned', 'add rice', 'Add vegetables and aromatics', 'Add soy sauce and cook until reduced by half'],
        equipment: ['Wok', 'Cutting board', 'Chef knif'],
        created_at: new Date()
      },
      {
        title: 'Picadillo tacos',
        cuisine: 'Mexican',
        ingredients: ['Ground beef', 'Cumin', 'Chili powder', 'Paprika', 'Garlic powder', 'Salt(to taste)', 'Tortillas', 'Lettuce', 'Water(as needed)'],
        skill: 'beginner',
        steps: ['Brown ground beef in a skillet', 'Add spices and water', 'Simmer until thickened', 'Warm tortillas', 'Assemble tacos'],
        equipment: ['Skillet', 'Spoon'],
        created_at: new Date()
      },
      {
        title: "Shrimp Scampi",
        cuisine: "Italian",
        ingredients: ["shrimp", "butter", "garlic", "lemon", "parsley"],
        skill: "intermediate",
        steps: [
          "Melt butter in pan",
          "Add garlic and sauté",
          "Add shrimp and cook until pink",
          "Add lemon juice and parsley",
          "Serve over pasta or rice"
        ],
        equipment: ["skillet", "zester", "chef knife"],
        created_at: new Date()
      },
      {
        title: "Vegetable Curry",
        cuisine: "Indian",
        ingredients: ["mixed vegetables", "coconut milk", "curry paste", "onion", "garlic"],
        skill: "intermediate",
        steps: [
          "Sauté onions and garlic",
          "Add curry paste and cook until fragrant",
          "Add vegetables",
          "Pour in coconut milk",
          "Simmer until vegetables are tender"
        ],
        equipment: ["saucepan", "wooden spoon"],
        created_at: new Date()
      },
      {
        title: "Classic Omelette",
        cuisine: "French",
        ingredients: ["eggs", "butter", "salt", "pepper", "cheese"],
        skill: "beginner",
        steps: [
          "Whisk eggs with salt and pepper",
          "Melt butter in pan",
          "Pour eggs and cook gently",
          "Add cheese",
          "Fold and serve"
        ],
        equipment: ["nonstick pan", "whisk", "spatula"],
        created_at: new Date()
      },
      {
        title: "Sushi Rice Bowl",
        cuisine: "Japanese",
        ingredients: ["rice", "soy sauce", "cucumber", "avocado", "nori"],
        skill: "beginner",
        steps: [
          "Cook rice",
          "Slice vegetables",
          "Assemble bowl",
          "Top with soy sauce and nori"
        ],
        equipment: ["rice cooker", "chef knife"],
        created_at: new Date()
      },
      {
        title: "Beef Bulgogi",
        cuisine: "Korean",
        ingredients: ["beef", "soy sauce", "sugar", "garlic", "sesame oil"],
        skill: "advanced",
        steps: [
          "Slice beef thinly",
          "Marinate in bulgogi sauce",
          "Cook over high heat",
          "Serve with rice"
        ],
        equipment: ["wok", "mixing bowl", "chef knife"],
        created_at: new Date()
      },
      {
        title: "Greek Salad",
        cuisine: "Greek",
        ingredients: ["tomatoes", "cucumber", "feta", "olive oil", "olives"],
        skill: "beginner",
        steps: [
          "Chop vegetables",
          "Mix in bowl",
          "Add feta and olives",
          "Dress with olive oil"
        ],
        equipment: ["mixing bowl", "chef knife"],
        created_at: new Date()
      },
      {
        title: "BBQ Chicken",
        cuisine: "American",
        ingredients: ["chicken thighs", "BBQ sauce", "salt", "pepper"],
        skill: "intermediate",
        steps: [
          "Season chicken",
          "Grill over medium heat",
          "Brush with BBQ sauce",
          "Cook until internal temp reaches 165°F"
        ],
        equipment: ["grill", "tongs"],
        created_at: new Date()
      },
      {
        title: "Pad Thai",
        cuisine: "Thai",
        ingredients: ["rice noodles", "egg", "bean sprouts", "peanuts", "tamarind sauce"],
        skill: "advanced",
        steps: [
          "Soak rice noodles",
          "Scramble eggs in wok",
          "Add noodles and sauce",
          "Add sprouts and peanuts"
        ],
        equipment: ["wok", "spatula"],
        created_at: new Date()
      },
      {
        title: "Falafel Wrap",
        cuisine: "Middle Eastern",
        ingredients: ["falafel", "pita", "lettuce", "tomato", "tahini"],
        skill: "beginner",
        steps: [
          "Warm pita",
          "Cook falafel",
          "Assemble wrap with toppings",
          "Drizzle tahini"
        ],
        equipment: ["skillet", "chef knife"],
        created_at: new Date()
      },
      {
        title: "Salmon Teriyaki",
        cuisine: "Japanese",
        ingredients: ["salmon", "soy sauce", "mirin", "sugar"],
        skill: "intermediate",
        steps: [
          "Mix teriyaki sauce",
          "Pan-sear salmon",
          "Add sauce and reduce",
          "Serve with rice"
        ],
        equipment: ["skillet", "mixing bowl"],
        created_at: new Date()
      },
      {
        title: "Shakshuka",
        cuisine: "Middle Eastern",
        ingredients: ["eggs", "tomatoes", "onion", "garlic", "paprika"],
        skill: "intermediate",
        steps: [
          "Sauté onions and garlic",
          "Add tomatoes and spices",
          "Simmer sauce",
          "Crack eggs into sauce",
          "Cook until eggs set"
        ],
        equipment: ["skillet", "wooden spoon"],
        created_at: new Date()
      },
      {
        title: "Ramen Bowl",
        cuisine: "Japanese",
        ingredients: ["ramen noodles", "broth", "egg", "scallions", "soy sauce"],
        skill: "beginner",
        steps: [
          "Boil noodles",
          "Heat broth",
          "Assemble bowl",
          "Top with egg and scallions"
        ],
        equipment: ["pot", "ladle"],
        created_at: new Date()
      }

    ]);
    console.log("Inserted count:", result.insertedCount);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();