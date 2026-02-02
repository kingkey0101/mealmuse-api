import { searchRecipes } from '../handlers/recipes';
import { verifyJwtFromHeader } from '../utils/verifyJwt';

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
                    "Access-Control-Allow-Methods": "GET,OPTIONS",
                },
                body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
            };
        }

        const userId = String((decoded as any).userId);
        const queryParams = event.queryStringParameters || {};

        const filters = {
            skill: queryParams.skill,
            dietaryPreferences: queryParams.diet,
            cookingTime: queryParams.time ? parseInt(queryParams.time) : undefined,
            cuisine: queryParams.cuisine,
            limit: queryParams.limit ? parseInt(queryParams.limit) : 50,
            offset: queryParams.offset ? parseInt(queryParams.offset) : 0,
        };

        const result = await searchRecipes(userId, filters);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://mymealmuse.com",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
            },
            body: JSON.stringify(result)
        };
    } catch (err) {
        console.error("Error in searchRecipes handler:", err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "https://mymealmuse.com",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
            },
            body: JSON.stringify({ error: 'Internal server error' })
        }
    }
}
