const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeGoal(goalTitle, goalDescription) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a goal planning assistant. Analyze the following goal and break it down into 4-6 actionable sub-goals or milestones.

Goal Title: ${goalTitle}
Goal Description: ${goalDescription || 'No additional description provided'}

Requirements:
- Generate 4-6 specific, measurable sub-goals
- Each sub-goal should be a clear milestone toward achieving the main goal
- Order them logically (from first to last)
- Keep each sub-goal title concise (max 60 characters)
- Provide a brief description for each (max 150 characters)

Return ONLY a valid JSON array in this exact format:
[
  {
    "title": "Sub-goal title",
    "description": "Brief description of what needs to be done"
  }
]

Do not include any markdown formatting, code blocks, or additional text. Return only the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Raw AI Response:', text);
    
    // Improved JSON extraction: find the first '[' and last ']'
    const startBracket = text.indexOf('[');
    const endBracket = text.lastIndexOf(']');
    
    if (startBracket === -1 || endBracket === -1 || endBracket < startBracket) {
      throw new Error('AI response did not contain a valid JSON array');
    }
    
    const cleanedText = text.substring(startBracket, endBracket + 1);
    console.log('Cleaned AI Response:', cleanedText);
    
    // Parse the JSON
    const subGoals = JSON.parse(cleanedText);
    
    // Validate structure
    if (!Array.isArray(subGoals)) {
      throw new Error('AI response is not an array');
    }
    
    // Ensure each sub-goal has required fields
    return subGoals.map((sg, index) => ({
      title: sg.title || `Milestone ${index + 1}`,
      description: sg.description || '',
      order: index
    }));
    
  } catch (error) {
    console.error('Error analyzing goal with AI:', error);
    
    // Fallback: return generic sub-goals
    return [
      { title: 'Plan and Research', description: 'Gather information and create a detailed plan', order: 0 },
      { title: 'Initial Setup', description: 'Set up necessary tools and resources', order: 1 },
      { title: 'Core Implementation', description: 'Work on the main components', order: 2 },
      { title: 'Review and Refine', description: 'Test, review, and make improvements', order: 3 },
      { title: 'Final Completion', description: 'Finalize and achieve the goal', order: 4 }
    ];
  }
}

module.exports = { analyzeGoal };
