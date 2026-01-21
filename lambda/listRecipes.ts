import { listRecipes } from '../handlers/recipes';

export const handler = async (event: any, context: any) => {
    try {
        const recipes = await listRecipes('');
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recipes)
        };
    } catch (err) {
        console.error('Error in listRecipes handler:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: "Internal Server Error" })
        }
    }
}