
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';


const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PUBLIC_VAPID_KEY = process.env.PUBLIC_VAPID_KEY;
const PRIVATE_VAPID_KEY = process.env.PRIVATE_VAPID_KEY;

// Setup web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:admin@email.com',
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

// Initialize Supabase client with Service Role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
export default async function sendReminder() {
  console.log('Starting to send reminders');

  try {
    const now = new Date();
    
    const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('id, title, reminder_at, user_id')
    .lte('reminder_at', now.toISOString())
    .eq('sent', false);

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      throw new Error('Error fetching reminders');
    }

    if (!reminders || reminders.length === 0) {
      console.log('No reminders due today.');
      return;
    }

    for (const reminder of reminders) {
      // Get push subscriptions for the reminder's user
      const { data: subscriptions, error: subsError } = await supabase
        .from('push_subscriptions')
        .select('id, subscription')
        .eq('user_id', reminder.user_id);

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
        continue; // skip this reminder but continue others
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${reminder.user_id}`);
        continue;
      }

      const payload = JSON.stringify({
        title: 'Reminder',
        body: reminder.title,
        data: { reminderId: reminder.id },
      });

      for (const sub of subscriptions) {
        try {
          const pushSubscription =
            typeof sub.subscription === 'string'
              ? JSON.parse(sub.subscription)
              : sub.subscription;

          await webpush.sendNotification(pushSubscription, payload);
          console.log(`Notification sent for reminder ${reminder.id} to user ${reminder.user_id}`);
        } catch (err) {
          console.error('Failed to send notification, removing subscription:', err);
          // Remove invalid subscription from DB
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          console.log(`Deleted invalid subscription with id ${sub.id}`);
        }
      }

      // Mark reminder as sent
      const { error: updateError } = await supabase
        .from('reminders')
        .update({ sent: true })
        .eq('id', reminder.id);

      if (updateError) {
        console.error('Failed to mark reminder as sent:', updateError);
      }
    }

    console.log('Finished sending reminders');
  } catch (err) {
    console.error('Unexpected error in sendReminder function:', err);
    throw err;
  }
}
