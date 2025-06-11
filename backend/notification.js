const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');

// Supabase project URL and service role key
const supabase = createClient('https://jvfpbjoxilxcxezyxcnk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZnBiam94aWx4Y3hlenl4Y25rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUwNzY2MSwiZXhwIjoyMDYxMDgzNjYxfQ.P4jLG98y3wg5yUMUf-mv2yUMnWxWGQst54S7HDnAjZU');

// VAPID keys
webpush.setVapidDetails(
  'mailto:your@email.com',
  'BO4D32FzaA1l70RXJVotNlRBrytEPObPzDhBlHMKsime4hYYvNaj9qUjt_YTc2q5lmQhcLfLgNmpzRyN4B99oQU',
  'BVHBWR8pjBt_GvccP0BULDdy3QuZAZruqfSGPmNOKng'
);

async function sendDueReminders() {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

  // 1. Get reminders that are due and not sent
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('id, user_id, title')
    .eq('date', currentDate)
    .lte('time', currentTime)
    .eq('sent', false);

  if (error) {
    console.error('Error fetching reminders:', error);
    return;
  }

  for (const reminder of reminders) {
    const { id, user_id, title } = reminder;

    // 2. Get the user's push subscription
    const { data: subData, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', user_id)
      .maybeSingle();

    if (subError || !subData) {
      console.warn(`No subscription found for user ${user_id}`);
      continue;
    }

    try {
      // 3. Send the push notification
      await webpush.sendNotification(
        subData.subscription,
        JSON.stringify({
          title: 'Reminder',
          body: title,
        })
      );

      console.log(`Notification sent for reminder ${id}`);

      // 4. Mark as sent
      await supabase
        .from('reminders')
        .update({ sent: true })
        .eq('id', id);
    } catch (err) {
      console.error(`Failed to send reminder ${id}:`, err);
    }
  }
}

sendDueReminders();
