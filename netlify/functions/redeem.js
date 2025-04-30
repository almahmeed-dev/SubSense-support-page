const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

exports.handler = async ({ body }) => {
  const { token, inviteeUserId } = JSON.parse(body)
  const now = new Date()
  const result = await pool.query(`
    UPDATE referral_tokens
      SET invitee_user_id=$1, status='pending', redeemed_at=$2
    WHERE token=$3 AND status='new'
    RETURNING inviter_user_id
  `, [inviteeUserId, now, token])

  return result.rowCount
    ? { statusCode: 200 }
    : { statusCode: 400, body: 'Invalid or used token' }
}
