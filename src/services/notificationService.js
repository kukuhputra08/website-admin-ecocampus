import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

const notificationsCollection = collection(db, "notifications");

const notificationSettingKeyMap = {
  report: "reportUpdates",
  challenge: "challengeUpdates",
  event: "eventUpdates",
  reward: "rewardUpdates",
};

export async function createNotificationForUser({
  userId,
  type,
  title,
  message,
  relatedId = null,
  metadata = {},
}) {
  if (!userId) {
    console.warn("Notification skipped: missing userId.");
    return {
      created: false,
      reason: "missing-user-id",
    };
  }

  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    console.warn("Notification skipped: user not found.", userId);
    return {
      created: false,
      reason: "user-not-found",
    };
  }

  const userData = userSnapshot.data();
  const notificationSettings = userData.notificationSettings || {};

  const settingKey = notificationSettingKeyMap[type];

  if (settingKey && notificationSettings[settingKey] === false) {
    console.log("Notification skipped: disabled by user settings.", {
      userId,
      type,
      settingKey,
    });

    return {
      created: false,
      reason: "disabled-by-user",
    };
  }

  const docRef = await addDoc(notificationsCollection, {
    userId,
    type,
    title,
    message,
    relatedId,
    metadata,

    isRead: false,
    createdAt: serverTimestamp(),
    readAt: null,
  });

  return {
    created: true,
    notificationId: docRef.id,
  };
}