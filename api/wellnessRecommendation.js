// wellnessRecommendation.js
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
      You are a wellness assistant. 
      Based on the following recent moods from a user: {moods}, suggest 2-3 specific YouTube videos or activity ideas that can help improve their mental well-being. 
      Be concise and return direct suggestions or YouTube links. Do not include conversation or greeting.
      If possible, format suggestions as:
      1. Title - YouTube Link
      2. Title - YouTube Link
      Or short activity descriptions.
    `;

    const suggestions = await getAIAssistantResponse(user_id, systemContent, userPrompt);

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error in wellnessRecommendation:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
