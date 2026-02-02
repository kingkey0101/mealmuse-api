import { getDb } from "../utils/mongo";
import { ObjectId } from "mongodb";

interface RecipeFilterOptions {
  skill?: string;
  dietaryPreferences?: string;
  cookingTime?: number;
  cuisine?: string;
  limit?: number;
  offset?: number;
}

//Read - get all recipes
export async function listRecipes(params: string) {
    const db = await getDb();
    return db.collection('recipes').find({
        $or: [
            { isSeeded: true },
            { userId: params }
        ]
    }).toArray();
}

//Read - search and filter recipes
export async function searchRecipes(userId: string, filters: RecipeFilterOptions = {}) {
    const db = await getDb();
    const query: any = {
        $or: [
            { isSeeded: true },
            { userId },
            { source: 'spoonacular' }
        ]
    };

    if (filters.skill) {
        query.skill = filters.skill.toLowerCase();
    }

    if (filters.dietaryPreferences) {
        query.dietaryPreferences = filters.dietaryPreferences;
    }

    if (filters.cookingTime) {
        query.cookingTime = { $lte: filters.cookingTime };
    }

    if (filters.cuisine) {
        query.cuisine = { $elemMatch: { $eq: filters.cuisine } };
    }

    const limit = Math.min(filters.limit || 50, 200);
    const offset = filters.offset || 0;

    const total = await db.collection('recipes').countDocuments(query);
    const recipes = await db.collection('recipes')
        .find(query)
        .limit(limit)
        .skip(offset)
        .sort({ cachedAt: -1, created_at: -1 })
        .toArray();

    return { recipes, total, limit, offset };
}

//Read - get one recipe by ID
export async function getRecipe(id: string) {
    const db = await getDb();
    return db.collection('recipes').findOne({ _id: new ObjectId(id) });
}

//Create - add a new recipe
export async function createRecipe(data: any) {
    const db = await getDb();
    const result = await db.collection('recipes').insertOne({
        ...data,
        userId: String(data.userId),
        created_at: new Date()
    })
    return result.insertedId
}

//Update - update a recipe by ID
export async function updateRecipe(id: string, updates: any) {
    const db = await getDb();
    const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(id) });
    if (!recipe || recipe.isSeeded) {
        throw new Error('Cannot modify MealMuse recipe');
    }
    return db.collection('recipes').updateOne({ _id: new ObjectId(id) }, { $set: updates });
}

//Delete - delete a recipe by ID
export async function deleteRecipe(id: string) {
    const db = await getDb();
    const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(id) });

    if (!recipe || recipe.isSeeded) {
        throw new Error('Cannot delete MealMuse recipe');
    }
    return await db.collection('recipes').deleteOne({ _id: new ObjectId(id) })
}

//Create - add a recipe generated from AI
export async function generateRecipeFromAI(data: any, userId: string) {
    const db = await getDb();
    const result = await db.collection('recipes').insertOne({
        ...data,
        userId: String(userId),
        source: 'ai_generated',
        created_at: new Date(),
        cachedAt: new Date(),
    });
    return result.insertedId;
}