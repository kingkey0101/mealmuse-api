import jwt from 'jsonwebtoken'

export function verifyJwt(authHeader?: string) {
    if (!authHeader) {
        throw new Error("Missing Authorization header");
    }
    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET as string
    ) as any;
    return decoded
}