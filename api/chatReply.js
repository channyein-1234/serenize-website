// chatReply.js
import { getAIAssistantResponse } from './openAI.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://serenize-website.vercel.app/chatbot');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, please use POST' });
  }

  try {
    const { user_id } = req.body;

    const systemContent = `
      Begin by warmly greeting the user.
      Engage in a natural, empathetic conversation first—listen, ask gentle follow-up questions, and show understanding.
      Do not offer advice or suggestions immediately.
      Only after understanding the user's mood or message, offer simple, supportive suggestions, activities, or videos.
      Speak like a kind, supportive friend. Use short to medium replies with good grammar and simple language.
    `;

    const userPrompt = `Based on the following recent moods: {moods}, suggest activities or videos to improve user's mental wellbeing.`;

    const suggestions = await getAIAssistantResponse(user_id, systemContent, userPrompt);

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error in chatReply:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
