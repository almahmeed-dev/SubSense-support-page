const crypto = require('crypto')
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

exports.handler = async (event) => {
  // TODO: authenticate inviter (e.g. via a JWT in Authorization header)
  const inviterId = /* extract from event.headers.authorization */
  if (!inviterId) {
    return { statusCode: 401, body: 'Unauthorized' }
  }

  const token = crypto.randomBytes(16).toString('hex')
  await pool.query(
    'INSERT INTO referral_tokens(token, inviter_user_id, status) VALUES($1,$2,$3)',
    [token, inviterId, 'new']
  )

  return {
    statusCode: 200,
    body: JSON.stringify({
      token,
      url: `https://${process.env.APP_DOMAIN}/invite?token=${token}`
    })
  }
}
