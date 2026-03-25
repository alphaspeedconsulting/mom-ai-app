/**
 * Service Worker — Push notification handler for Mom.alpha
 *
 * Handles Web Push events and notification display.
 * This file is registered alongside the PWA service worker.
 */

/* eslint-disable no-restricted-globals */

self.addEventListener("push", function (event) {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Mom.alpha", body: event.data.text() };
  }

  const title = data.title || "Mom.alpha";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    tag: data.tag || "mom-alpha-notification",
    renotify: true,
    data: {
      url: data.url || "/notifications",
      action_type: data.action_type,
      action_payload: data.action_payload,
    },
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data?.url || "/notifications";

  // Handle action buttons
  if (event.action === "sign_slip") {
    event.waitUntil(clients.openWindow("/agents/school"));
    return;
  }

  if (event.action === "view_calendar") {
    event.waitUntil(clients.openWindow("/calendar"));
    return;
  }

  // Default: open the specified URL
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Focus existing window if found
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(url);
      })
  );
});
