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

    // 2. Update Profile
    console.log('Updating profile...');
    const updateRes = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Software Engineer',
        organization: 'Tech Corp'
      })
    });

    if (!updateRes.ok) throw new Error(`Update Profile failed: ${updateRes.status}`);
    const updateData = await updateRes.json();
    console.log('Profile updated:', updateData.message);

    // 3. fetch Profile
    console.log('Fetching profile...');
    const profileRes = await fetch(`${API_URL}/users/profile`, { headers });
    const profile = await profileRes.json();
    
    console.log('Fetched Profile:', JSON.stringify(profile, null, 2));

    if (profile.firstName !== 'John') throw new Error('Profile update not persisted (firstName mismatch)');
    if (profile.jobTitle !== 'Software Engineer') throw new Error('Profile update not persisted (jobTitle mismatch)');

    console.log('Verification PASSED!');

  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  }
};

run();
