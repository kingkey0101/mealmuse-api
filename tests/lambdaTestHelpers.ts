import jwt from 'jsonwebtoken';

const SECRET = process.env.NEXTAUTH_SECRET || '1283b1277854d83b12e724f91f8ca5548db980327dbb63fad8ff56f72479ec29';

/**
 * Generate a test JWT token for Lambda testing
 */
export function generateTestToken(userId: string = 'test-user-123'): string {
  return jwt.sign(
    { userId, email: 'test@example.com' },
    SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Create a mock Lambda event for GET requests
 */
export function createMockGetEvent(
  path: string,
  queryParams?: Record<string, string>,
  token?: string
): any {
  return {
    resource: path,
    path,
    httpMethod: 'GET',
    headers: {
      Authorization: token || `Bearer ${generateTestToken()}`,
      'Content-Type': 'application/json',
    },
    queryStringParameters: queryParams || {},
    body: null,
    isBase64Encoded: false,
  };
}

/**
 * Create a mock Lambda event for POST requests
 */
export function createMockPostEvent(
  path: string,
  body: any,
  token?: string
): any {
  return {
    resource: path,
    path,
    httpMethod: 'POST',
    headers: {
      Authorization: token || `Bearer ${generateTestToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    queryStringParameters: {},
    isBase64Encoded: false,
  };
}

/**
 * Create a mock Lambda event for DELETE requests
 */
export function createMockDeleteEvent(
  path: string,
  pathParameters?: Record<string, string>,
  token?: string
): any {
  return {
    resource: path,
    path,
    httpMethod: 'DELETE',
    headers: {
      Authorization: token || `Bearer ${generateTestToken()}`,
      'Content-Type': 'application/json',
    },
    pathParameters: pathParameters || {},
    queryStringParameters: {},
    body: null,
    isBase64Encoded: false,
  };
}
