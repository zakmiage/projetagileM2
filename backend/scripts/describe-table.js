require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const [cols] = await conn.execute('DESCRIBE budget_attachments');
  console.log('budget_attachments columns:');
  cols.forEach(c => console.log(`  ${c.Field} | ${c.Type} | null:${c.Null} | default:${c.Default}`));
  await conn.end();
}
run().catch(console.error);
