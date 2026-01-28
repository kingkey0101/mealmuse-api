import { getDb } from "../utils/mongo";
import { ObjectId } from "mongodb";

// Add a recipe to favorites
export async function addFavorite(userId: string, recipeId: string) {
    const db = await getDb();

    // Check if already favorited
    const existing = await db.collection('user_favorites').findOne({
        userId,
        recipeId: new ObjectId(recipeId)
    });

    if (existing) {
        return { alreadyFavorited: true };
    }

    // Add to favorites
    const result = await db.collection('user_favorites').insertOne({
        userId,
        recipeId: new ObjectId(recipeId),
        created_at: new Date()
    });

    return { insertedId: result.insertedId, alreadyFavorited: false };
}

// Remove a recipe from favorites
export async function removeFavorite(userId: string, recipeId: string) {
    const db = await getDb();
    const result = await db.collection('user_favorites').deleteOne({
        userId,
        recipeId: new ObjectId(recipeId)
    });

    return { deletedCount: result.deletedCount };
}

// Get all favorites for a user (with recipe details)
export async function listFavorites(userId: string) {
    const db = await getDb();

    const pipeline = [
        { $match: { userId } },
        {
            $lookup: {
                from: 'recipes',
                localField: 'recipeId',
                foreignField: '_id',
                as: 'recipe'
            }
        },
        { $unwind: '$recipe' },
        { $sort: { created_at: -1 } },
        {
            $project: {
                _id: 0,
                recipeId: 1,
                created_at: 1,
                recipe: 1
            }
        }
    ];

    return db.collection('user_favorites').aggregate(pipeline).toArray();
}

// Check if a recipe is favorited by user
export async function isFavorited(userId: string, recipeId: string) {
    const db = await getDb();
    const favorite = await db.collection('user_favorites').findOne({
        userId,
        recipeId: new ObjectId(recipeId)
    });

    return { isFavorited: !!favorite };
}