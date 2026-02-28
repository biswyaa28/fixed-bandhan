/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Firebase Cloud Messaging Service Worker
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Handles push notifications when the app is in the background or closed.
 * This file MUST live at the root of the public directory so its scope
 * covers the entire origin (Firebase SDK requirement).
 *
 * COST: FREE — Firebase Cloud Messaging has no per-message charges.
 *
 * Notification types handled:
 *   - match:         "You matched with Priya!"
 *   - message:       "New message from Rohan"
 *   - like:          "Anjali liked your profile"
 *   - special:       "Vikram sent Special Interest"
 *   - system:        "Complete your profile for better matches"
 *
 * The main app's service worker (sw.js) handles caching/offline.
 * This file handles ONLY push notifications to keep concerns separated.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* eslint-disable no-restricted-globals */

// Import Firebase scripts (compat mode for service workers)
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

// ── Firebase Config ──────────────────────────────────────────────────────────
// These values are safe to expose in client code — security is enforced
// server-side via Firestore rules and Firebase Auth, not by hiding keys.
// In production, the build process can replace these placeholder values.
firebase.initializeApp({
  apiKey: self.__FIREBASE_CONFIG__?.apiKey || "",
  authDomain: self.__FIREBASE_CONFIG__?.authDomain || "",
  projectId: self.__FIREBASE_CONFIG__?.projectId || "",
  storageBucket: self.__FIREBASE_CONFIG__?.storageBucket || "",
  messagingSenderId: self.__FIREBASE_CONFIG__?.messagingSenderId || "",
  appId: self.__FIREBASE_CONFIG__?.appId || "",
});

const messaging = firebase.messaging();

// ── Notification click action map ────────────────────────────────────────────
const ACTION_URLS = {
  match: "/matches",
  message: "/chat",
  like: "/matches",
  special: "/matches",
  appreciation: "/matches",
  profile_visit: "/profile",
  system: "/profile",
};

// ── Handle background messages ───────────────────────────────────────────────
messaging.onBackgroundMessage(function (payload) {
  const data = payload.data || {};
  const notification = payload.notification || {};

  const title = notification.title || data.title || "Bandhan AI";
  const body = notification.body || data.body || "You have a new notification";
  const type = data.type || "system";
  const icon = "/icons/icon-192x192.png";
  const badge = "/icons/icon-96x96.png";

  const options = {
    body: body,
    icon: icon,
    badge: badge,
    tag: type + "-" + (data.senderId || Date.now()),
    renotify: type === "message", // Re-alert for new messages in same conversation
    vibrate: [100, 50, 100], // Short vibration pattern for Indian devices
    data: {
      url: data.url || ACTION_URLS[type] || "/matches",
      type: type,
      senderId: data.senderId,
      matchId: data.matchId,
    },
    actions: getActionsForType(type),
  };

  return self.registration.showNotification(title, options);
});

// ── Notification actions by type ─────────────────────────────────────────────
function getActionsForType(type) {
  switch (type) {
    case "message":
      return [
        { action: "reply", title: "Reply", icon: "/icons/icon-96x96.png" },
        { action: "dismiss", title: "Dismiss" },
      ];
    case "match":
      return [
        { action: "view", title: "View Match", icon: "/icons/icon-96x96.png" },
        { action: "message", title: "Message" },
      ];
    case "like":
    case "special":
      return [
        { action: "view", title: "View Profile", icon: "/icons/icon-96x96.png" },
        { action: "dismiss", title: "Dismiss" },
      ];
    default:
      return [];
  }
}

// ── Handle notification click ────────────────────────────────────────────────
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.url || "/matches";

  // Handle action buttons
  if (event.action === "reply" && data.matchId) {
    targetUrl = "/chat/" + data.matchId;
  } else if (event.action === "message" && data.matchId) {
    targetUrl = "/chat/" + data.matchId;
  } else if (event.action === "view" && data.senderId) {
    targetUrl = "/matches";
  } else if (event.action === "dismiss") {
    return; // Just close the notification
  }

  // Focus existing window or open new one
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // Try to find an existing Bandhan window
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          client.postMessage({ type: "NOTIFICATION_CLICK", url: targetUrl, data: data });
          return client.focus();
        }
      }
      // No existing window — open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ── Handle notification close (analytics) ────────────────────────────────────
self.addEventListener("notificationclose", function (event) {
  var data = event.notification.data || {};
  // Post to main thread for analytics tracking
  self.clients.matchAll({ type: "window" }).then(function (clients) {
    clients.forEach(function (client) {
      client.postMessage({
        type: "NOTIFICATION_DISMISSED",
        notificationType: data.type,
        timestamp: Date.now(),
      });
    });
  });
});
