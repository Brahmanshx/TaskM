const API_URL = 'http://localhost:3000';
const EMAIL = 'test@example.com';
const PASSWORD = 'password123';

async function verifyAI() {
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

    console.log('\n--- 2. Creating a test goal ---');
    const goalRes = await fetch(`${API_URL}/goals`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Master Quantum Physics',
        description: 'Understand the subatomic world and wave-particle duality',
        userId: userId
      })
    });
    const goalData = await goalRes.json();
    const goalId = goalData.id;
    console.log('✓ Goal created with ID:', goalId);

    console.log('\n--- 3. Generating AI Sub-Goals (Gemini) ---');
    console.log('This may take a few seconds...');
    const aiRes = await fetch(`${API_URL}/goals/${goalId}/generate-subgoals`, {
      method: 'POST',
      headers
    });
    const aiData = await aiRes.json();
    
    if (aiRes.status !== 201) {
      console.error('AI Error:', aiData);
      throw new Error(`AI generation failed with status ${aiRes.status}`);
    }

    console.log('✓ AI Breakdown Successful!');
    console.log('Milestones generated:');
    aiData.forEach((sg, i) => {
      console.log(`${i+1}. [ ] ${sg.title} - ${sg.description}`);
    });

    const firstSubGoalId = aiData[0].id;
    console.log('\n--- 4. Toggling first milestone ---');
    await fetch(`${API_URL}/subgoals/${firstSubGoalId}/toggle`, {
      method: 'PUT',
      headers
    });
    console.log('✓ Milestone 1 toggled to COMPLETED');

    console.log('\n--- 5. Verifying Progress Update ---');
    const verifyRes = await fetch(`${API_URL}/goals?userId=${userId}`, { headers });
    const verifyData = await verifyRes.json();
    const updatedGoal = verifyData.find(g => g.id === goalId);
    console.log('Goal Progress:', updatedGoal.progress + '%');
    
    if (updatedGoal.progress > 0) {
      console.log('\n✅ AI GOAL BREAKDOWN VERIFIED SUCCESSFULLY!');
    } else {
      console.log('\n❌ Progress not updated.');
    }

  } catch (error) {
    console.error('\n❌ Verification failed');
    console.error('Error Message:', error.message);
  }
}

verifyAI();
