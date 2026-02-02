import { listFavorites } from "../handlers/favorites";
import { verifyJwtFromHeader } from "../utils/verifyJwt";

export const handler = async (event: any) => {
    try {
        const auth = event.headers?.authorization ||
            event.headers?.Authorization ||
            event.headers?.AUTHORIZATION;

        const decoded = verifyJwtFromHeader(auth);
        if (!decoded || typeof decoded === 'string' || !('userId' in decoded)) {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": "https://mymealmuse.com",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,OPTIONS",
                },
                body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
            };
        }

        const userId = String((decoded as any).userId);
        const favorites = await listFavorites(userId);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://mymealmuse.com",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
            },
            body: JSON.stringify(favorites)
        };
    } catch (err) {
        console.error("Error in listFavorites handler:", err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "https://mymealmuse.com",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
            },
            body: JSON.stringify({ error: 'Internal server error' })
        }
    }
}