// import jwt from 'jsonwebtoken'

// export function verifyJwt(authHeader?: string) {
//     if (!authHeader) {
//         throw new Error("Missing Authorization header");
//     }
//     const token = authHeader.replace("Bearer ", "");
//     const secretName = process.env.NEXTAUTH_SECRET ? 'NEXTAUTH_SECRET' : (process.env.MM_JWT_SECRET ? 'MM_JWT_SECRET' : 'none');
//     console.log('verifyJwt using env var:', secretName);

//     const decoded = jwt.verify(
//         token,
//         process.env.NEXTAUTH_SECRET as string
//     ) as any;
//     return decoded
// }
// src/utils/verifyJwt.ts
import jwt from 'jsonwebtoken';

export function verifyJwtFromHeader(authHeader?: string) {
    const secret = process.env.NEXTAUTH_SECRET ?? process.env.MM_JWT_SECRET;
    if (!secret) {
        console.error('Missing JWT secret NEXTAUTH_SECRET or MM_JWT_SECRET');
        return null;
    }

    if (!authHeader) {
        console.warn('No Authorization header provided');
        return null;
    }

    // Extract token from header (accept "Bearer <token>" or raw token)
    let token: string | undefined;
    const parts = authHeader.split(' ');

    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        token = parts[1];
    } else if (parts.length === 1) {
        token = parts[0]; // accept raw token
    } else {
        console.warn('Malformed Authorization header', authHeader);
        return null;
    }

    try {
        return jwt.verify(token, secret);
    } catch (err) {
        console.error('JWT verification failed:', err?.message ?? err);
        return null;
    }
}
//   const parts = authHeader.split(' ');
//   if (parts.length !== 2) {
//     console.warn('Malformed Authorization header', authHeader);
//     return null;
//   }

//   const token = parts[1];
//   try {
//     return jwt.verify(token, secret);
//   } catch (err) {
//     console.error('JWT verification failed:', err?.message ?? err);
//     return null;
//   }
// extract token from header (accept "Bearer <token>" or raw token)