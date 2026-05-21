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

const challengesCollection = collection(db, "challenges");

export async function getChallengesByAdmin(admin) {
  const challengesQuery = query(
    challengesCollection,
    where("universityId", "==", admin.universityId),
    where("departmentId", "==", admin.departmentId)
  );

  const querySnapshot = await getDocs(challengesQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function addChallenge(admin, challengeData) {
  const docRef = await addDoc(challengesCollection, {
    title: challengeData.title,
    description: challengeData.description,
    points: Number(challengeData.points),
    status: challengeData.status,

    proofRequired: true,
    proofType: challengeData.proofType,
    quantityRequired:
      challengeData.proofType === "photo_quantity"
        ? Number(challengeData.quantityRequired)
        : null,

    universityId: admin.universityId,
    universityName: admin.universityName,
    universityShortName: admin.universityShortName,

    departmentId: admin.departmentId,
    departmentName: admin.departmentName,

    createdBy: admin.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateChallenge(challengeId, challengeData) {
  const challengeRef = doc(db, "challenges", challengeId);

  await updateDoc(challengeRef, {
    title: challengeData.title,
    description: challengeData.description,
    points: Number(challengeData.points),
    status: challengeData.status,

    proofRequired: true,
    proofType: challengeData.proofType,
    quantityRequired:
      challengeData.proofType === "photo_quantity"
        ? Number(challengeData.quantityRequired)
        : null,

    updatedAt: serverTimestamp(),
  });
}

export async function deleteChallenge(challengeId) {
  const challengeRef = doc(db, "challenges", challengeId);

  await deleteDoc(challengeRef);
}