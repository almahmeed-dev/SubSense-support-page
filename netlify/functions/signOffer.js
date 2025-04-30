const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  // only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // parse body
  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { productId, offerId, userId } = data;
  if (!productId || !offerId || !userId) {
    return {
      statusCode: 400,
      body: 'Missing productId, offerId or userId'
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env.APPSTORE_ISSUER_ID,
    iat: now,
    exp: now + 20 * 60,         // 20-minute TTL
    bid: process.env.BUNDLE_ID, // e.g. com.yourapp.bundle
    productId,
    offerId,
    userId
  };

  let signature;
  try {
    signature = jwt.sign(
      payload,
      process.env.APPSTORE_PRIVATE_KEY,
      {
        algorithm: 'ES256',
        keyid: process.env.APPSTORE_KEY_ID
      }
    );
  } catch (e) {
    return { statusCode: 500, body: 'Signing error' };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      signature,
      keyIdentifier: process.env.APPSTORE_KEY_ID
    })
  };
};
