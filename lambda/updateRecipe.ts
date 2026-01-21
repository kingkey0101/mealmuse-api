import { updateRecipe } from "../handlers/recipes";

export const handler = async (event: any) => {
    try {
        const id = event.pathParameters?.id;

        if (!id) {
            return {
                statusCode: 400,
                headers: { 'Content-type': 'applications/json' },
                body: JSON.stringify({ error: 'Recipe ID is required' })
            };
        }
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'applications/json' },
                body: JSON.stringify({ error: 'Request body is required' })
            };
        }

        const updates = JSON.parse(event.body);
        const result = await updateRecipe(id, updates);

        if (result.modifiedCount === 0) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'applications/json' },
                body: JSON.stringify({ error: 'Recipe not found or no changes applied' })
            };
        }
        return {
            statusCode: 200,
            Headers: { 'Content-Type': 'applications/json' },
            body: JSON.stringify({ message: 'Recipe updated successfully' })
        };
    } catch (err) {
        console.error('Error in updateRecipes handler:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'applications/json' },
            body: JSON.stringify({ error: 'Internal server error' })
        }
    }
}