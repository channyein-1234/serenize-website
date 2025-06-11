/* eslint-disable no-restricted-globals */
self.addEventListener('push', function (event) {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/img/serenize-icon.png',
    });
  });
  