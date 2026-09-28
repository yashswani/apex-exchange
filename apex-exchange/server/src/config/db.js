require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()')
  .then((res) => console.log('✅ Postgres connected:', res.rows[0]))
  .catch((err) => console.error('❌ Postgres connection error:', err.message));

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
