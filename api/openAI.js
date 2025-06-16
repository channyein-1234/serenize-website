// openAI.js
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAIAssistantResponse(user_id, systemContent, userPrompt) {
  if (!user_id) {
    throw new Error('Missing user_id');
  }

  // Fetch latest moods from Supabase
  const { data: moods, error } = await supabase
    .from('moods')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  // Compose full prompt with moods included in user prompt
  const fullUserPrompt = userPrompt.replace('{moods}', JSON.stringify(moods));

  // Call OpenAI chat completion
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: fullUserPrompt },
    ],
  });

  return response.choices[0].message.content;
}
