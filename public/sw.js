/* eslint-disable no-restricted-globals */
/* eslint-disable no-restricted-globals */

self.addEventListener('push', function (event) {
    const data = event.data?.json() || {};
    const title = data.title || 'Reminder';
    const options = {
      body: data.body || 'You have a new reminder!',
      icon: '/serenize_logo.png', 
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });