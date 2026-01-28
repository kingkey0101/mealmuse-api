const jwt = require('jsonwebtoken');

const secret = process.env.NEXTAUTH_SECRET || '1283b1277854d83b12e724f91f8ca5548db980327dbb63fad8ff56f72479ec29';

const payload = {
  userId: process.argv[2] || 'test-user-123',
  email: 'test@example.com'
};

const token = jwt.sign(payload, secret, { expiresIn: '24h' });

console.log('\n=== JWT Token Generated ===');
console.log(`\nPayload: ${JSON.stringify(payload)}`);
console.log(`\nToken:\n${token}`);
console.log('\n=== Copy this for Lambda test ===');
console.log(`Bearer ${token}`);

// node scripts/generateTestToken.js