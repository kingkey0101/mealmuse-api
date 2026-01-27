import { listRecipes } from '../handlers/recipes';
import { verifyJwtFromHeader } from '../utils/verifyJwt';

export const handler = async (event: any, context: any) => {
    console.log("EVENT HEADERS:", JSON.stringify(event.headers, null, 2));
    try {
        const auth = event.headers?.authorization ||
            event.headers?.Authorization ||
            event.headers?.AUTHORIZATION;

        const decoded = verifyJwtFromHeader(auth);
        const userId = typeof decoded === 'object' && decoded !== null ? decoded.id : null;

        if (!userId) {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
                },

                body: JSON.stringify({ error: 'Unauthorized: userId missing' })
            }
        }
        const recipes = await listRecipes(userId);

        console.log("Fetched recipes:", recipes)
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            },

            body: JSON.stringify(recipes)
        };
    } catch (err) {
        console.error("JWT verification failed:", err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            },

            body: JSON.stringify({ error: "Internal Server Error" })
        }
    }
}