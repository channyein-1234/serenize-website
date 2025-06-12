import sendReminder from './sentReminder.js';

export default async function handler(req, res) {
  try {
    await sendReminder();
    res.status(200).end('Reminders sent');
  } catch (err) {
    console.error('Error in cron handler:', err);
    res.status(500).end('Failed to send reminders');
  }
}


