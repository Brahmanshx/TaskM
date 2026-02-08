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

    // 2. Create Goal
    console.log('Creating goal...');
    const goalRes = await fetch(`${API_URL}/goals`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Learn AI Agent Dev',
        description: 'Master the art of agentic coding',
        targetDate: '2026-12-31',
        progress: 10,
        userId: user.id
      })
    });

    if (!goalRes.ok) throw new Error(`Create Goal failed: ${goalRes.status}`);
    const goal = await goalRes.json();
    console.log('Goal created:', goal.id);

    // 3. Update Progress
    console.log('Updating progress...');
    const updateRes = await fetch(`${API_URL}/goals/${goal.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        progress: 25,
        status: 'in-progress'
      })
    });
    
    if (!updateRes.ok) throw new Error(`Update Goal failed: ${updateRes.status}`);
    const updatedGoal = await updateRes.json();
    console.log('Goal updated. New progress:', updatedGoal.progress);

    // 4. List Goals
    console.log('Listing goals...');
    const listRes = await fetch(`${API_URL}/goals?userId=${user.id}`, { headers });
    const goals = await listRes.json();
    console.log(`Found ${goals.length} goals.`);
    
    if(goals.length === 0) throw new Error('No goals found!');

    console.log('Verification PASSED!');

  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  }
};

run();
