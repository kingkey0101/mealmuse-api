import { verifyJwt } from "../utils/verifyJwt";
import { deleteRecipe } from "../handlers/recipes";
import { getDb } from "../utils/mongo";
import { ObjectId } from "mongodb";

export const handler = async (event: any) => {
    try {
        const auth = event.headers?.authorization ||
            event.headers?.Authorization ||
            event.headers?.AUTHORIZATION;

        const decoded = verifyJwt(auth);
        const userId = decoded.id;

        const id = event.pathParameters?.id;
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Recipe ID is required" })
            };
        }

        const db = await getDb();
        const recipe = await db.collection("recipes").findOne({ _id: new ObjectId(id) });

        if (!recipe) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Recipe not found" })
            };
        }

        if (recipe.isSeeded) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "Seeded recipes cannot be deleted" })
            };
        }

        if (recipe.userId.toString() !== userId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "You do not own this recipe" })
            };
        }

        await deleteRecipe(id);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Recipe deleted successfully" })
        };

    } catch (err) {
        console.error("Error deleting recipe:", err);
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized" })
        };
    }
};