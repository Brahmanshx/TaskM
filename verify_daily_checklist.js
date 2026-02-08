const API_URL = 'http://localhost:3000';

const run = async () => {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${API_URL}/users/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    const { token, user } = await loginRes.json();
    console.log('Login successful. User ID:', user.id);

    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    const today = new Date().toISOString().split('T')[0];

    // 2. Create Task for TODAY
    console.log(`Creating task for today (${today})...`);
    const taskRes = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Daily Focus 1',
        description: 'Must do today',
        userId: user.id,
        dueDate: today,
        status: 'pending'
      })
    });
    if (!taskRes.ok) throw new Error(`Create Task failed: ${taskRes.status}`);
    console.log('Task created.');

    // 3. Fetch Today's Tasks
    console.log('Fetching today\'s tasks...');
    const todayRes = await fetch(`${API_URL}/tasks?userId=${user.id}&dueDate=${today}`, { headers });
    const todayTasks = await todayRes.json();
    console.log(`Found ${todayTasks.length} tasks for today.`);
    
    const hasTask = todayTasks.some(t => t.title === 'Daily Focus 1' && t.dueDate === today);
    if (!hasTask) throw new Error('Created task not found in today\'s list!');

    console.log('Verification PASSED!');

  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  }
};

run();
