import { listRecipes } from '../handlers/recipes';
import { verifyJwt } from '../utils/verifyJwt';

export const handler = async (event: any, context: any) => {
    console.log("EVENT HEADERS:", JSON.stringify(event.headers, null, 2));
    try {
        const auth = event.headers?.authorization ||
            event.headers?.Authorization ||
            event.headers?.AUTHORIZATION;

        const decoded = verifyJwt(auth)
        const userId = decoded.id;
        const recipes = await listRecipes(userId);

        if (!userId) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Unauthorized: userId missing' })
            }
        }
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recipes)
        };
    } catch (err) {
        console.error("JWT verification failed:", err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: "Internal Server Error" })
        }
    }
}