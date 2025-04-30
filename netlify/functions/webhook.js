const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// you’ll want to verify Apple’s signature here via their JWK endpoint

exports.handler = async ({ body }) => {
  const payload = JSON.parse(body)
  const info = payload.data.signedTransactionInfo
  if (info.notificationType !== 'INITIAL_BUY') {
    return { statusCode: 200 }
  }
  const token = info.appAccountToken
  const now = new Date()
  const { rows } = await pool.query(`
    UPDATE referral_tokens
      SET status='completed', completed_at=$1
    WHERE token=$2 AND status='pending'
    RETURNING inviter_user_id
  `, [now, token])

  if (rows[0]) {
    await pool.query(
      `UPDATE users SET promo_eligible = true WHERE id = $1`,
      [rows[0].inviter_user_id]
    )
  }
  return { statusCode: 200 }
}
