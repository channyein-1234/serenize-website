// /api/sendReminders.js

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

// Helper: get current date and time
function getCurrentDateTime() {
  const now = new Date();
  // Convert to ISO date YYYY-MM-DD
  const date = now.toISOString().split('T')[0];
  // Format time as HH:mm (24-hour)
  const time = now.toTimeString().slice(0, 5);
  return { date, time };
}

export default async function handler(req, res) {
  console.log('Checking reminders to send...');

  const { date, time } = getCurrentDateTime();

  try {
    // Fetch reminders where date/time matches and not sent yet
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('id, title, date, time, user_id')
      .eq('date', date)
      .eq('time', time)
      .eq('sent', false);

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      return res.status(500).json({ error: 'Error fetching reminders' });
    }

    if (!reminders || reminders.length === 0) {
      console.log('No reminders due at this time.');
      return res.status(200).json({ message: 'No reminders due' });
    }

    // Loop through all due reminders
    for (const reminder of reminders) {
      // Get push subscriptions for the reminder's user
      const { data: subscriptions, error: subsError } = await supabase
        .from('push_subscriptions')
        .select('id, subscription')
        .eq('user_id', reminder.user_id);

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
        continue;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${reminder.user_id}`);
        continue;
      }

      // Prepare notification payload
      const payload = JSON.stringify({
        title: 'Reminder',
        body: reminder.title,
        data: { reminderId: reminder.id },
      });

      // Send notification to each subscription
      for (const sub of subscriptions) {
        let pushSubscription;

        try {
          // Parse subscription JSON if stored as string
          pushSubscription =
            typeof sub.subscription === 'string'
              ? JSON.parse(sub.subscription)
              : sub.subscription;

          await webpush.sendNotification(pushSubscription, payload);
          console.log(`Notification sent for reminder ${reminder.id} to user ${reminder.user_id}`);
        } catch (err) {
          console.error('Failed to send notification, removing subscription:', err);

          // Remove invalid subscription from DB
          await supabase
            .from('push_subscriptions')  // fixed table name here
            .delete()
            .eq('id', sub.id);

          console.log(`Deleted invalid subscription with id ${sub.id}`);
        }
      }

      // Mark reminder as sent to avoid duplicates
      const { error: updateError } = await supabase
        .from('reminders')
        .update({ sent: true })
        .eq('id', reminder.id);

      if (updateError) {
        console.error('Failed to mark reminder as sent:', updateError);
      }
    }

    res.status(200).json({ message: 'Reminders processed' });
  } catch (err) {
    console.error('Unexpected error in reminder handler:', err);
    res.status(500).json({ error: 'Unexpected error' });
  }
}
