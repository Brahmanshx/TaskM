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

    // 2. Fetch Analytics Stats
    console.log('Fetching analytics...');
    const statsRes = await fetch(`${API_URL}/analytics/stats?userId=${user.id}`, { headers });
    
    if (!statsRes.ok) throw new Error(`Fetch Analytics failed: ${statsRes.status}`);
    const stats = await statsRes.json();
    
    console.log('Analytics Data:', JSON.stringify(stats, null, 2));

    if (typeof stats.overview.totalTasks !== 'number') throw new Error('Invalid overview data');
    if (!Array.isArray(stats.taskDistribution)) throw new Error('Invalid task distribution data');

    console.log('Verification PASSED!');

  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  }
};

run();
