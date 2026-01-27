// import { verifyJwtFromHeader } from "../utils/verifyJwt";
// import { deleteRecipe } from "../handlers/recipes";
// import { getDb } from "../utils/mongo";
// import { ObjectId } from "mongodb";
// import { JwtPayload } from "jsonwebtoken";

// export const handler = async (event: any) => {
//     try {
//         const auth = event.headers?.authorization ||
//             event.headers?.Authorization ||
//             event.headers?.AUTHORIZATION;

//         const decoded = verifyJwtFromHeader(auth) as JwtPayload;
//         const userId = decoded.id;

//         const id = event.pathParameters?.id;
//         if (!id) {
//             return {
//                 statusCode: 400,
//                 headers: {
//                     "Access-Control-Allow-Origin": "*",
//                     "Access-Control-Allow-Headers": "*",
//                     "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
//                 },

//                 body: JSON.stringify({ error: "Recipe ID is required" })
//             };
//         }

//         const db = await getDb();
//         const recipe = await db.collection("recipes").findOne({ _id: new ObjectId(id) });

//         if (!recipe) {
//             return {
//                 statusCode: 404,
//                 headers: {
//                     "Access-Control-Allow-Origin": "*",
//                     "Access-Control-Allow-Headers": "*",
//                     "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
//                 },

//                 body: JSON.stringify({ error: "Recipe not found" })
//             };
//         }

//         if (recipe.isSeeded) {
//             return {
//                 statusCode: 403,
//                 headers: {
//                     "Access-Control-Allow-Origin": "*",
//                     "Access-Control-Allow-Headers": "*",
//                     "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
//                 },

//                 body: JSON.stringify({ error: "Seeded recipes cannot be deleted" })
//             };
//         }

//         if (recipe.userId.toString() !== userId) {
//             return {
//                 statusCode: 403,
//                 headers: {
//                     "Access-Control-Allow-Origin": "*",
//                     "Access-Control-Allow-Headers": "*",
//                     "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
//                 },

//                 body: JSON.stringify({ error: "You do not own this recipe" })
//             };
//         }

//         await deleteRecipe(id);

//         return {
//             statusCode: 200,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//                 "Access-Control-Allow-Headers": "*",
//                 "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
//             },

//             body: JSON.stringify({ message: "Recipe deleted successfully" })
//         };

//     } catch (err) {
//         console.error("Error deleting recipe:", err);
//         return {
//             statusCode: 401,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//                 "Access-Control-Allow-Headers": "*",
//                 "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
//             },

//             body: JSON.stringify({ error: "Unauthorized" })
//         };
//     }
// };

import { verifyJwtFromHeader } from "../utils/verifyJwt";
import { deleteRecipe } from "../handlers/recipes";
import { getDb } from "../utils/mongo";
import { ObjectId } from "mongodb";

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS'
};

export const handler = async (event: any) => {
    try {
        // 1) Verify JWT safely
        const auth = event.headers?.authorization ||
            event.headers?.Authorization ||
            event.headers?.AUTHORIZATION;

        const decoded = verifyJwtFromHeader(auth);
        if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
            return {
                statusCode: 401,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Unauthorized: userId missing' })
            };
        }
        const userId = String((decoded as any).id);

        // 2) Validate path parameter
        const recipeId = event.pathParameters?.id;
        if (!recipeId) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Bad Request: recipe id missing' })
            };
        }

        // 3) Validate ObjectId format
        const isValidId = ObjectId.isValid ? ObjectId.isValid(recipeId) : /^[0-9a-fA-F]{24}$/.test(recipeId);
        if (!isValidId) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Bad Request: invalid recipe id' })
            };
        }

        // 4) Check if userId is stored as ObjectId or string in DB
        const userIdInDbIsObjectId = false;
        const ownerFilterValue = userIdInDbIsObjectId ? new ObjectId(userId) : String(userId);

        const filter = { _id: new ObjectId(recipeId), userId: ownerFilterValue };

        console.info('deleteRecipe filter', { filter: { _id: recipeId, userId: ownerFilterValue?.toString?.() ?? ownerFilterValue } });

        const db = await getDb();
        const result = await db.collection('recipes').findOneAndDelete(filter);

        // Driver may return null or { value: null }
        const deleted = result && (result as any).value ? (result as any).value : null;
        if (!deleted) {
            console.info('deleteRecipe not found', { recipeId, userId, userIdInDbIsObjectId });
            return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Not Found: recipe not found or not owned by user' })
            };
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, id: deleted._id.toString() })
        };

    } catch (err) {
        console.error('Error deleting recipe:', err);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};