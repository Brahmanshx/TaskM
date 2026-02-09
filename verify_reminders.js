const API_URL = 'http://localhost:3000';
const EMAIL = 'test@example.com';
const PASSWORD = 'password123';

async function verifyReminders() {
  try {
    console.log('--- 1. Logging in ---');
    const loginRes = await fetch(`${API_URL}/users/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    const userId = loginData.user.id;
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'user-id': userId.toString(),
      'Content-Type': 'application/json'
    };
    console.log('✓ Logged in as user:', userId);

    console.log('\n--- 2. Creating a task with immediate reminder ---');
    // Set reminder 1 second in the past to trigger immediately by cron
    const pastTime = new Date(Date.now() - 1000).toISOString();
    const taskRes = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Immediate Verification Task',
        description: 'Testing the notification system',
        userId: userId,
        reminderTime: pastTime
      })
    });
    const taskData = await taskRes.json();
    console.log('✓ Task created with reminder at:', pastTime);

    console.log('\n--- 3. Waiting for cron job (up to 70s) ---');
    console.log('Cron runs every minute. This will take a moment...');
    
    // Poll for notifications every 10s
    let notificationFound = false;
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 10000));
      process.stdout.write('.');
      
      const notifyRes = await fetch(`${API_URL}/notifications`, { headers });
      const notifications = await notifyRes.json();
      
      const activeReminder = notifications.find(n => n.message.includes('Immediate Verification Task'));
      if (activeReminder) {
        console.log('\n✓ NOTIFICATION RECEIVED!');
        console.log('Message:', activeReminder.message);
        notificationFound = true;
        break;
      }
    }

    if (notificationFound) {
      console.log('\n✅ TASK REMINDERS VERIFIED SUCCESSFULLY!');
    } else {
      console.log('\n❌ Notification not received within timeout.');
    }

  } catch (error) {
    console.error('\n❌ Verification failed');
    console.error('Error:', error.message);
  }
}

verifyReminders();
