/* eslint-disable no-restricted-globals */

self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};
  const title = data.title || 'Reminder';
  
  const options = {
    body: data.body || 'You have a new reminder!',
    icon: '/serenize_logo.png',
    badge: '/badge.png', 
    tag: data.tag || 'reminder',
    requireInteraction: true, // Keeps notification open until user interacts 
    data: data.data || {}, // Optional: e.g., reminder ID
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
