const crypto = require('crypto');
const config = require('../config');
const { getStorage } = require('../storage');

let cachedJwks = null;
let jwksExpiresAt = 0;

async function getSigningKeys(issuer) {
  if (cachedJwks && Date.now() < jwksExpiresAt) return cachedJwks;
  const response = await fetch(`${issuer}/.well-known/jwks.json`);
  if (!response.ok) throw new Error('Unable to retrieve Cognito signing keys.');
  const body = await response.json();
  cachedJwks = body.keys || [];
  jwksExpiresAt = Date.now() + 60 * 60 * 1000;
  return cachedJwks;
}

function decodePart(part) {
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
}

async function authenticateCognito(req) {
  if (!config.COGNITO.USER_POOL_ID || !config.COGNITO.CLIENT_ID) {
    const error = new Error('AWS mode requires COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID.');
    error.statusCode = 503;
    throw error;
  }

  const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
  if (!match) {
    const error = new Error('A valid Cognito bearer token is required.');
    error.statusCode = 401;
    throw error;
  }

  const segments = match[1].split('.');
  if (segments.length !== 3) throw Object.assign(new Error('Invalid bearer token.'), { statusCode: 401 });

  let header;
  let claims;
  try {
    header = decodePart(segments[0]);
    claims = decodePart(segments[1]);
  } catch {
    throw Object.assign(new Error('Invalid Cognito bearer token.'), { statusCode: 401 });
  }
  const region = config.AWS.REGION;
  const issuer = `https://cognito-idp.${region}.amazonaws.com/${config.COGNITO.USER_POOL_ID}`;
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== issuer || !Number.isFinite(claims.exp) || claims.exp <= now || (claims.nbf && claims.nbf > now) || claims.token_use !== 'id' || claims.aud !== config.COGNITO.CLIENT_ID) {
    throw Object.assign(new Error('Cognito token issuer, expiry, type, or audience is invalid.'), { statusCode: 401 });
  }

  const keys = await getSigningKeys(issuer);
  const jwk = keys.find(key => key.kid === header.kid && key.kty === 'RSA');
  if (!jwk || header.alg !== 'RS256') throw Object.assign(new Error('Unknown Cognito token signing key.'), { statusCode: 401 });
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${segments[0]}.${segments[1]}`);
  verifier.end();
  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  if (!verifier.verify(publicKey, Buffer.from(segments[2], 'base64url'))) {
    throw Object.assign(new Error('Cognito token signature is invalid.'), { statusCode: 401 });
  }

  const groups = claims['cognito:groups'] || [];
  const claimedRole = String(claims['custom:role'] || claims.role || '').toLowerCase();
  const role = groups.some(group => ['faculty', 'teachers'].includes(String(group).toLowerCase())) || claimedRole === 'teacher'
    ? 'teacher'
    : 'student';
  const userId = claims['custom:roll_no'] || claims['custom:roll_number'] || claims.preferred_username || claims['cognito:username'] || claims.username || claims.sub;
  const user = await getStorage().getUser(userId);
  if (!user) throw Object.assign(new Error('Cognito identity is not registered in the portal.'), { statusCode: 403 });
  if (user.role !== role) throw Object.assign(new Error('Cognito role does not match the portal account.'), { statusCode: 403 });
  return user;
}

async function authenticate(req) {
  if (config.AUTH_MODE === 'cognito') return authenticateCognito(req);

  // Local demo mode only. These headers are user-selectable demo identities, not authentication.
  const storage = getStorage();
  const userId = req.headers['x-user-id'] || 'CS-2023-084';
  const requestedRole = req.headers['x-user-role'];
  const user = await storage.getUser(userId);
  if (user) return user;
  return {
    userId,
    role: requestedRole || (userId.startsWith('FAC') ? 'teacher' : 'student'),
    name: userId.startsWith('FAC') ? 'Demo Faculty' : 'Demo Student'
  };
}

module.exports = { authenticate };
