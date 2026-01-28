import { getRecipe } from "../handlers/recipes";

export const handler = async (event: any) => {
    try {


        const id = event.pathParameters?.id || event.pathParameters?.recipeId;
        if (!id) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
                },

                body: JSON.stringify({ error: 'Recipe ID is required' })
            };
        }

        const recipe = await getRecipe(id);
        if (!recipe) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
                },

                body: JSON.stringify({ error: 'Recipe not found' })
            };
        }
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            },

            body: JSON.stringify(recipe)
        };
    } catch (err) {
        console.error('Error in getRecipe handler:', err);
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
