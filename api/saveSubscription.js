import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY 
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, subscription } = req.body;

  if (!userId || !subscription) {
    return res.status(400).json({ error: 'Missing userId or subscription' });
  }

  try {
    // Save subscription as stringified JSON
    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert([
        {
          user_id: userId,
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString(),
        }
      ], { onConflict: ['user_id'] });  // Or change onConflict logic as discussed

    if (error) {
      console.error('Error saving subscription:', error);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    return res.status(200).json({ message: 'Subscription saved', data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
