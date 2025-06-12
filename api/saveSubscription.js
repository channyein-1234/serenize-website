import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, subscription } = req.body;

  if (!userId || !subscription) {
    return res.status(400).json({ error: 'Missing userId or subscription' });
  }

  try {
    // Insert or update subscription for user_id
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          subscription,          // ensure your DB column type supports JSON
          created_at: new Date().toISOString(),
        },
        { onConflict: ['user_id'] }
      );

    if (error) {
      console.error('Error saving subscription:', error);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    return res.status(200).json({ message: 'Subscription saved', data });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
