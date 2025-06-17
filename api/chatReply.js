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
    const { user_id, message, history = [] } = req.body;

    const systemContent = `
                            You are a warm and empathetic mental wellness assistant.
                            Always act like a caring friend. Never repeat your greeting if the conversation is ongoing.
                            On the first message, greet the user gently.
                            In follow-up messages, do not greet again — continue naturally based on what the user just said.
                            If the user opens up emotionally, respond supportively. If they ask for help or suggestions, provide kind advice or a few relevant videos or simple activities.
                            Avoid long responses. Be kind, brief, and supportive. No overanalyzing or cold tone.
                                `.trim();

    const userPrompt = `User: ${message}`;

    const suggestions = await getAIAssistantResponse(user_id, systemContent, userPrompt, history);

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error in chatReply:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
