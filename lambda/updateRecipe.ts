import { verifyJwtFromHeader } from "../utils/verifyJwt";
import { updateRecipe } from "../handlers/recipes";
import { getDb } from "../utils/mongo";
import { ObjectId } from "mongodb";

export const handler = async (event: any) => {
    try {
        const auth = event.headers?.authorization ||
            event.headers?.Authorization ||
            event.headers?.AUTHORIZATION;

        const decoded = verifyJwtFromHeader(auth);

if (!decoded || typeof decoded === 'string' || !('userId' in decoded)) {
  return {
    statusCode: 401,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    },
    body: JSON.stringify({ error: "Unauthorized" })
  };
}

const userId = String((decoded as any).userId);

        const db = await getDb();
        const recipeId = event.pathParameters?.id; // Assuming the ID is passed in the path parameters
        const recipe = await db.collection("recipes").findOne({ _id: new ObjectId(recipeId) });

        if (!recipe) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
                },

                body: JSON.stringify({ error: "Recipe not found" })
            };
        }

        if (recipe.isSeeded) {
            return {
                statusCode: 403,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
                },

                body: JSON.stringify({ error: "Seeded recipes cannot be modified" })
            };
        }

        if (recipe.userId.toString() !== userId) {
            return {
                statusCode: 403,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
                },

                body: JSON.stringify({ error: "You do not own this recipe" })
            };
        }

        const updates = JSON.parse(event.body);
        await updateRecipe(recipeId, updates);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            },

            body: JSON.stringify({ message: "Recipe updated successfully" })
        };

    } catch (err) {
        console.error("Error updating recipe:", err);
        return {
            statusCode: 401,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            },

            body: JSON.stringify({ error: "Unauthorized" })
        };
    }
};