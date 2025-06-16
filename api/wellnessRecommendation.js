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
                        You are a helpful wellness assistant.

                        A user is experiencing stress, anxiety, or low mood based on their recent mood logs.

                        Suggest:
                        - 2 YouTube videos with helpful titles and full links (must be wellness-related),
                        - 1 activity idea (just one clear sentence),

                        Do NOT include greetings or intros.

                        Format the response EXACTLY like this:

                        Videos:
                        1. Title - https://www.youtube.com/watch?v=abc123
                        2. Title - https://www.youtube.com/watch?v=xyz456

                        Activity:
                        Your activity suggestion sentence here.
                        `;


    const suggestions = await getAIAssistantResponse(user_id, systemContent, userPrompt);

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error in wellnessRecommendation:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
