import { createRecipe } from "../handlers/recipes";

export const handler = async (event: any) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'applications/json' },
                body: JSON.stringify({ error: 'Request body is required' })

            };
        }
        const data = JSON.parse(event.body);
        const userId = event.requestContext?.authorizer?.userId;
        if (!userId) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Unauthorized: userId missing' })
            };
        }
        const insertedId = await createRecipe({ ...data, userId });

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'applications/json' },
            body: JSON.stringify({ id: insertedId })
        };
    } catch (err) {
        console.error('Error in createRecipe handler:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'applications/json' },
            body: JSON.stringify({ error: 'internal server error' })
        }
    }
}