const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('task_db', 'admin', 'password', {
  host: 'postgres',
  dialect: 'postgres',
  port: 5432,
  logging: false,
});

async function check() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    
    // Direct test insertion
    const testTitle = 'Direct SQL Test ' + Date.now();
    const testReminder = new Date().toISOString();
    await sequelize.query('INSERT INTO \"Tasks\" (title, \"userId\", \"reminderTime\", \"createdAt\", \"updatedAt\") VALUES (:title, 1, :reminder, NOW(), NOW())', {
      replacements: { title: testTitle, reminder: testReminder }
    });
    console.log('✓ Direct SQL Insert Successful');

    const [tasks] = await sequelize.query('SELECT id, title, \"reminderTime\", \"userId\" FROM \"Tasks\" ORDER BY \"createdAt\" DESC LIMIT 5');
    console.log('Recent Tasks:', JSON.stringify(tasks, null, 2));
    
    const [notifs] = await sequelize.query('SELECT * FROM \"Notifications\" ORDER BY \"createdAt\" DESC LIMIT 5');
    console.log('Recent Notifications:', JSON.stringify(notifs, null, 2));
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
