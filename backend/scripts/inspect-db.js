require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME
  });
  const [events] = await conn.execute('SELECT id, name, start_date, end_date FROM events ORDER BY id LIMIT 10');
  console.log('\n=== EVENTS ===');
  events.forEach(e => console.log(`  id=${e.id} | "${e.name}" | ${e.start_date} → ${e.end_date}`));
  const [members] = await conn.execute('SELECT id, first_name, last_name FROM members ORDER BY id LIMIT 10');
  console.log('\n=== MEMBERS (premiers 10) ===');
  members.forEach(m => console.log(`  id=${m.id} | ${m.first_name} ${m.last_name}`));
  const [shifts] = await conn.execute('SELECT id, event_id, label, start_time, end_time, capacity FROM shifts ORDER BY id');
  console.log('\n=== SHIFTS ACTUELS ===');
  shifts.forEach(s => console.log(`  id=${s.id} | event=${s.event_id} | "${s.label}" | ${s.start_time} → ${s.end_time} (cap:${s.capacity})`));
  const [kcols] = await conn.execute('SELECT id, event_id, title FROM kanban_columns ORDER BY id');
  console.log('\n=== KANBAN COLS ===');
  kcols.forEach(k => console.log(`  id=${k.id} | event=${k.event_id} | "${k.title}"`));
  await conn.end();
}
run().catch(console.error);
