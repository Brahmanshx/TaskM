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
    
    if (!loginRes.ok) {
      const errorText = await loginRes.text();
      throw new Error(`Login failed: ${loginRes.status} - ${errorText}`);
    }
    const { token, user } = await loginRes.json();
    console.log('Login successful. User ID:', user.id);

    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    // 2. Update Profile
    console.log('Updating profile...');
    const updateRes = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        jobTitle: 'Developer'
      })
    });

    console.log('Update response status:', updateRes.status);
    const updateText = await updateRes.text();
    console.log('Update response body:', updateText);

    if (!updateRes.ok) {
      throw new Error(`Update Profile failed: ${updateRes.status} - ${updateText}`);
    }

    console.log('Profile update successful!');

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
};

run();
