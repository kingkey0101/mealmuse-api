import { addFavorite } from "../handlers/favorites";
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
                    "Access-Control-Allow-Origin": "https://mymealmuse.com",
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
                    "Access-Control-Allow-Origin": "https://mymealmuse.com",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
                },
                body: JSON.stringify({ error: 'Recipe ID is required' })
            };
        }

        const result = await addFavorite(userId, recipeId);

        return {
            statusCode: result.alreadyFavorited ? 200 : 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
            },
            body: JSON.stringify({
                message: result.alreadyFavorited ? 'Already favorited' : 'Added to favorites',
                ...result
            })
        };
    } catch (err) {
        console.error("Error in addFavorite handler:", err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "https://mymealmuse.com",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
            },
            body: JSON.stringify({ error: 'Internal server error' })
        }
    }
}