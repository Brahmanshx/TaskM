const run = async () => {
  const API_URL = 'http://localhost:3000';
  
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
    
    if (!loginRes.ok) {
        const err = await loginRes.text();
        throw new Error(`Login failed: ${loginRes.status} ${err}`);
    }
    const { token, user } = await loginRes.json();
    console.log('Login successful. User ID:', user.id);

    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    // 2. Create Task
    console.log('Creating task...');
    const taskRes = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Verify Backend',
        description: 'Automated test task',
        userId: user.id
      })
    });
    
    if (!taskRes.ok) {
        const err = await taskRes.text();
        throw new Error(`Create Task failed: ${taskRes.status} ${err}`);
    }
    const createdTask = await taskRes.json();
    console.log('Task created:', createdTask);

    // 3. Get Tasks
    console.log('Fetching tasks...');
    const listRes = await fetch(`${API_URL}/tasks?userId=${user.id}`, { headers });
    
    if (!listRes.ok) {
        const err = await listRes.text();
        throw new Error(`Get Tasks failed: ${listRes.status} ${err}`);
    }
    const tasks = await listRes.json();
    console.log('Tasks found:', tasks.length);
    console.log(tasks);

  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  }
};

run();
