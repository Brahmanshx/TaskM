const API_URL = 'http://localhost:3000';

const run = async () => {
  try {
    // 1. Login
    console.log('=== STEP 1: LOGIN ===');
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
    console.log('✓ Login successful');
    console.log('  User ID:', user.id);
    console.log('  Token:', token.substring(0, 20) + '...');

    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    // 2. Get Profile
    console.log('\n=== STEP 2: GET PROFILE ===');
    const getRes = await fetch(`${API_URL}/users/profile`, { 
      method: 'GET',
      headers 
    });
    console.log('GET /users/profile status:', getRes.status);
    
    if (!getRes.ok) {
      const errorText = await getRes.text();
      console.log('GET Error:', errorText);
      throw new Error(`Get Profile failed: ${getRes.status}`);
    }
    
    const profile = await getRes.json();
    console.log('✓ Profile fetched successfully');
    console.log('  Current profile:', JSON.stringify(profile, null, 2));

    // 3. Update Profile
    console.log('\n=== STEP 3: UPDATE PROFILE ===');
    const updateData = {
      firstName: 'TestFirst',
      lastName: 'TestLast',
      phone: '1234567890',
      bio: 'Test bio',
      location: 'Test City',
      jobTitle: 'Test Developer',
      department: 'Engineering',
      organization: 'Test Corp'
    };
    
    console.log('Sending update with data:', JSON.stringify(updateData, null, 2));
    
    const updateRes = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });

    console.log('PUT /users/profile status:', updateRes.status);
    console.log('Response headers:', Object.fromEntries(updateRes.headers.entries()));
    
    const updateText = await updateRes.text();
    console.log('Response body:', updateText);

    if (!updateRes.ok) {
      throw new Error(`Update Profile failed: ${updateRes.status} - ${updateText}`);
    }

    console.log('✓ Profile updated successfully!');

    // 4. Verify Update
    console.log('\n=== STEP 4: VERIFY UPDATE ===');
    const verifyRes = await fetch(`${API_URL}/users/profile`, { headers });
    const updatedProfile = await verifyRes.json();
    console.log('Updated profile:', JSON.stringify(updatedProfile, null, 2));

    if (updatedProfile.firstName !== 'TestFirst') {
      throw new Error('Profile update not persisted!');
    }

    console.log('\n✅ ALL TESTS PASSED!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

run();
