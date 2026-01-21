import { updateRecipe } from "../handlers/recipes";

export const handler = async (event: any) => {
    try {
        console.log('Raw event:', JSON.stringify(event, null, 2));
        const id = event.pathParameters?.id;
        console.log('ID from pathParameters:', id);

        if (!id) {
            return {
                statusCode: 400,
                headers: { 'Content-type': 'applications/json' },
                body: JSON.stringify({ error: 'Recipe ID is required' })
            };
        }
        if (!event.body) {
            console.log('No body recieved');
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'applications/json' },
                body: JSON.stringify({ error: 'Request body is required' })
            };
        }

        console.log('Raw body:', event.body);

        const updates = JSON.parse(event.body);
        console.log('Parsed updates:', updates);

        const result = await updateRecipe(id, updates);
        console.log('Mongo update result:', result);

        if (result.modifiedCount === 0) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'applications/json' },
                body: JSON.stringify({ error: 'Recipe not found or no changes applied' })
            };
        }
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'applications/json' },
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