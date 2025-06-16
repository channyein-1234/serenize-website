import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAIAssistantResponse(user_id, systemContent, userMessage, history = []) {
  if (!user_id) throw new Error('Missing user_id');

  // Get today's date in UTC
  const todayDate = new Date().toISOString().split('T')[0];

  // Get today's moods
  const { data: moods, error } = await supabase
    .from('moods')
    .select('mood, difficulty, created_at')
    .eq('user_id', user_id)
    .gte('created_at', `${todayDate}T00:00:00Z`)
    .lt('created_at', `${todayDate}T23:59:59Z`)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Supabase error: ${error.message}`);

  const moodSummary = moods?.length
  ? `Today's mood logs: ${moods.map(m => `${m.mood} (difficulty: ${m.difficulty})`).join(', ')}.`
  : `No mood logs found for today.`;

  // Build the messages array for chat completion
  const messages = [
    { role: 'system', content: `${systemContent}\n\n${moodSummary}` },
    ...history.map((item) => ({
      role: item.role,
      content: item.content
    })),
    { role: 'user', content: userMessage }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
  });

  return response.choices[0].message.content;
}
