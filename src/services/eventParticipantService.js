import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

const eventParticipantsCollection = collection(db, "eventParticipants");

export async function getEventParticipantsByAdmin(admin) {
  const participantsQuery = query(
    eventParticipantsCollection,
    where("universityId", "==", admin.universityId)
  );

  const querySnapshot = await getDocs(participantsQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function addEventParticipant(admin, participantData) {
  const docRef = await addDoc(eventParticipantsCollection, {
    eventId: participantData.eventId,

    studentId: participantData.studentId,
    studentName: participantData.studentName,
    studentEmail: participantData.studentEmail,
    departmentId: participantData.departmentId,
    departmentName: participantData.departmentName,

    universityId: admin.universityId,
    universityName: admin.universityName,
    universityShortName: admin.universityShortName,

    registeredAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}