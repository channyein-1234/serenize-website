import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', 'https://serenize-website.vercel.app/chatbot'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // No content
  }

  console.log('Incoming method:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, please use POST' });
  }

  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id in request body' });
  }

  try {
    console.log('Starting handler, user_id:', user_id);

    const { data: moodData, error } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('Mood data:', moodData, 'Error:', error);

    if (error) {
      return res.status(500).json({ error: error.message || 'Error fetching moods' });
    }

    const prompt = `Based on the following recent moods: ${JSON.stringify(moodData)}, suggest activities or videos to improve user's mental wellbeing.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a friendly, supportive, and compassionate mental health assistant.
                    Speak naturally and empathetically like a helpful human friend.
                    Use simple language. Provide supportive suggestions, videos, or activities based on mood or message.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return res.status(200).json({ suggestions: response.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI or Supabase error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
