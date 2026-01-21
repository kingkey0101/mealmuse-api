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
        const insertedId = await createRecipe(data);

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