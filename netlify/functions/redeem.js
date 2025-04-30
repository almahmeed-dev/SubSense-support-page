const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

exports.handler = async (event) => {
  // 1. Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // 2. Safe JSON parse
  let data
  try {
    data = JSON.parse(event.body || '')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { token, inviteeUserId } = data
  // 3. Validate inputs
  if (!token || !inviteeUserId) {
    return { statusCode: 400, body: 'token and inviteeUserId are required' }
  }

  const now = new Date()
  const result = await pool.query(
    `UPDATE referral_tokens
        SET invitee_user_id = $1,
            status = 'pending',
            redeemed_at = $2
      WHERE token = $3
        AND status = 'new'
      RETURNING inviter_user_id`,
    [inviteeUserId, now, token]
  )

  if (!result.rowCount) {
    return { statusCode: 400, body: 'Invalid or used token' }
  }

  return { statusCode: 200, body: 'OK' }
}
