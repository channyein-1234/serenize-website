import sendReminder from './sentReminder.js';

export default async function handler(req, res) {
  // Check cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  try {
    await sendReminder();
    res.status(200).end('Reminders sent');
  } catch (err) {
    console.error('Error in cron handler:', err);
    res.status(500).end('Failed to send reminders');
  }
}
