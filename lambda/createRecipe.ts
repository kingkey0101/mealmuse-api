import { createRecipe } from "../handlers/recipes";
import { verifyJwtFromHeader } from "../utils/verifyJwt";

export const handler = async (event: any) => {
    try {
        const auth = event.headers?.authorization ||
            event.headers?.Authorization ||
            event.headers?.AUTHORIZATION;

        const decoded = verifyJwtFromHeader(auth);
        if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
                },
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }
        const userId = String((decoded as any).id);
        const data = JSON.parse(event.body);
        // const userId = event.requestContext?.authorizer?.userId;
        const insertedId = await createRecipe({ ...data, userId });

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
        if (!userId) {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
                },

                body: JSON.stringify({ error: 'Unauthorized: userId missing' })
            };
        }

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
        console.error("JWT verification failed:", err);
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            },

            body: JSON.stringify({ error: 'Unauthorized' })
        }
    }
}