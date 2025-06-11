/* eslint-disable no-restricted-globals */
self.addEventListener('push', function (event) {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '../src/img/serenize-icon.png', 
    });
  });
  