import { createRecipe } from "../handlers/recipes";
import { verifyJwt } from "../utils/verifyJwt";

export const handler = async (event: any) => {
    try {
        const auth = event.headers?.authorization ||
            event.headers?.Authorization ||
            event.headers?.AUTHORIZATION;

        const decoded = verifyJwt(auth);
        const data = JSON.parse(event.body);
        const userId = event.requestContext?.authorizer?.userId;
        const insertedId = await createRecipe({ ...data, userId });

        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'applications/json' },
                body: JSON.stringify({ error: 'Request body is required' })

            };
        }
        if (!userId) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Unauthorized: userId missing' })
            };
        }

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'applications/json' },
            body: JSON.stringify({ id: insertedId })
        };
    } catch (err) {
        console.error("JWT verification failed:", err);
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'applications/json' },
            body: JSON.stringify({ error: 'Unauthorized' })
        }
    }
}