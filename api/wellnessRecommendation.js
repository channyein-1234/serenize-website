import { getAIAssistantResponse } from './openAI.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://serenize-website.vercel.app/wellness'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  try {
    const { user_id } = req.body;

    const systemContent = 'You are a wellness video and activity suggestion assistant.';

    const userPrompt = `
      You are a helpful wellness assistant.

Use the following recent mood logs to guide your suggestions:
{moods}

Your task:
- Suggest 2 wellness-related YouTube videos with clear titles and full links.
- Suggest 1 wellness activity in a single sentence, directly related to the user's moods.

Important rules:
- Do NOT include any greetings, intros, or conclusions.
- Do NOT assume anything not in the mood data.
- Follow this exact format:

Videos:
1. Title - https://www.youtube.com/watch?v=abc123
2. Title - https://www.youtube.com/watch?v=xyz456
Activity:
1.Activity Title - your activity description here.
      
    `;

    const suggestions = await getAIAssistantResponse(user_id, systemContent, userPrompt);

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error in wellnessRecommendation:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
