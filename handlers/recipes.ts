import { getDb } from "../utils/mongo";
import { ObjectId } from "mongodb";

//Read - get all recipes
export async function listRecipes(params: string) {
    const db = await getDb();
    return db.collection('recipes').find({
        $or: [
            { isSeeded: true },
            { userId: new ObjectId(params) }
        ]
    }).toArray();
}

//Read - get one recipe by ID
export async function getRecipe(id: string) {
    const db = await getDb();
    return db.collection('recipes').findOne({ _id: new ObjectId(id) });
}

//Create - add a new recipe
export async function createRecipe(data: any) {
    const db = getDb();
    const result = (await db).collection('recipes').insertOne({
        ...data,
        userId: new ObjectId(data.userId),
        created_at: new Date()
    })
    return (await result).insertedId
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
    const db = getDb();
    const recipe = await (await db).collection('recipes').findOne({_id: new ObjectId(id)});

    if(!recipe || recipe.isSeeded){
        throw new Error('Cannot Delete MeanMuse recipe');
    }
    return (await db).collection('recipes').deleteOne({ _id: new ObjectId(id) })
}