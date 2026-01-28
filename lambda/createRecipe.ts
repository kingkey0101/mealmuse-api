import { createRecipe } from "../handlers/recipes";
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
                    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
                },
                body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
            };
        }

        const userId = String((decoded as any).userId);

        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
                },
                body: JSON.stringify({ error: 'Request body is required' })
            };
        }

        const data = JSON.parse(event.body);
        const insertedId = await createRecipe({ ...data, userId });

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            },
            body: JSON.stringify({ id: insertedId })
        };
    } catch (err) {
        console.error("Error in createRecipe handler:", err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            },
            body: JSON.stringify({ error: 'Internal server error' })
        }
    }
}