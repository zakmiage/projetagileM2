require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const [users] = await conn.execute('SELECT id, email, role FROM users ORDER BY id');
  console.log('=== USERS ===');
  users.forEach(u => console.log(`  id=${u.id} | ${u.email} | role=${u.role}`));

  // S'assurer que toto existe avec le rôle ADMIN
  const toto = users.find(u => u.email === 'toto@mail.com');
  if (!toto) {
    console.log('\n⚠️  toto@mail.com introuvable — vérifier seed-data.sql');
  } else if (toto.role !== 'ADMIN') {
    console.log(`\n⚠️  toto a le rôle "${toto.role}" — mise à jour vers ADMIN...`);
    await conn.execute(`UPDATE users SET role = 'ADMIN' WHERE email = 'toto@mail.com'`);
    console.log('  ✓ Rôle mis à jour vers ADMIN');
  } else {
    console.log('\n✅ toto@mail.com a bien le rôle ADMIN');
  }
  await conn.end();
}
run().catch(console.error);
