import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

const eventsCollection = collection(db, "events");

export async function getEventsByAdmin(admin) {
  const eventsQuery = query(
    eventsCollection,
    where("universityId", "==", admin.universityId)
  );

  const querySnapshot = await getDocs(eventsQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function addEvent(admin, eventData) {
  const docRef = await addDoc(eventsCollection, {
    title: eventData.title,
    description: eventData.description,
    location: eventData.location,
    date: eventData.date,
    quota: Number(eventData.quota),
    status: eventData.status,

    registeredCount: 0,

    universityId: admin.universityId,
    universityName: admin.universityName,
    universityShortName: admin.universityShortName,

    scope: "university",

    createdBy: admin.id,
    createdByDepartmentId: admin.departmentId,
    createdByDepartmentName: admin.departmentName,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateEvent(eventId, eventData) {
  const eventRef = doc(db, "events", eventId);

  await updateDoc(eventRef, {
    title: eventData.title,
    description: eventData.description,
    location: eventData.location,
    date: eventData.date,
    quota: Number(eventData.quota),
    status: eventData.status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(eventId) {
  const eventRef = doc(db, "events", eventId);

  await deleteDoc(eventRef);
}