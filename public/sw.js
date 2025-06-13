/* eslint-disable no-restricted-globals */

self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};
  const title = data.title || 'Reminder';

  console.log('Push received:', data);

  const options = {
    body: data.body || 'You have a new reminder!',
    requireInteraction: true, // force to stay until user interacts
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

