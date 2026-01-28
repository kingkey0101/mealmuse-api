import { removeFavorite } from "../handlers/favorites";
import { verifyJwtFromHeader } from "../utils/verifyJwt";

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
                    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
                },
                body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
            };
        }

        const userId = String((decoded as any).userId);
        const recipeId = event.pathParameters?.id;

        if (!recipeId) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
                },
                body: JSON.stringify({ error: 'Recipe ID is required' })
            };
        }

        const result = await removeFavorite(userId, recipeId);

        return {
            statusCode: result.deletedCount > 0 ? 200 : 404,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
            },
            body: JSON.stringify({
                message: result.deletedCount > 0 ? 'Removed from favorites' : 'Favorite not found'
            })
        };
    } catch (err) {
        console.error("Error in removeFavorite handler:", err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
            },
            body: JSON.stringify({ error: 'Internal server error' })
        }
    }
}