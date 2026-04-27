require('dotenv').config({path:'.env'});
const m=require('mysql2/promise');
(async()=>{
  const c=await m.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
  });
  const [r]=await c.execute(
    "SELECT event_id, "+
    "SUM(CASE WHEN actual_amount > 0 THEN actual_amount ELSE forecast_amount END) as total_fsdie "+
    "FROM budget_lines "+
    "WHERE is_fsdie_eligible=1 AND type='EXPENSE' AND validation_status != 'REFUSE' "+
    "GROUP BY event_id ORDER BY event_id"
  );
  console.log('FSDIE par event:');
  r.forEach(row=>console.log('  Event '+row.event_id+': '+row.total_fsdie));
  const [rev]=await c.execute(
    "SELECT event_id, category, label, forecast_amount, actual_amount "+
    "FROM budget_lines WHERE type='REVENUE' ORDER BY event_id, id"
  );
  console.log('\nRevenues actuels:');
  rev.forEach(row=>console.log('  E'+row.event_id+' ['+row.category+'] '+row.label+' prev='+row.forecast_amount+' reel='+row.actual_amount));
  await c.end();
})();
