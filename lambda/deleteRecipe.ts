import { deleteRecipe } from "../handlers/recipes";

export const handler = async (event: any) => {
    try {
        const id = event.pathParameters?.id;

        if (!id) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'applications/json' },
                body: JSON.stringify({ error: 'Recipe ID is required' })
            };
        }

        const result = await deleteRecipe(id);

        if (result.deletedCount === 0) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'applications/json' },
                body: JSON.stringify({ error: "Recipe not found" })
            };
        }
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'applications/json' },
            body: JSON.stringify({ message: 'Recipe deleted successfully' })
        };
    } catch (err) {
        console.error('Error in deleteRecipe handler:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'applications/json' },
            body: JSON.stringify({ error: "Internal server error" })
        }
    }
}