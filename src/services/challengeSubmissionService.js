import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

const submissionsCollection = collection(db, "challengeSubmissions");

export async function getChallengeSubmissionsByAdmin(admin) {
  const submissionsQuery = query(
    submissionsCollection,
    where("universityId", "==", admin.universityId),
    where("departmentId", "==", admin.departmentId)
  );

  const querySnapshot = await getDocs(submissionsQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function addChallengeSubmission(admin, submissionData) {
  const docRef = await addDoc(submissionsCollection, {
    challengeId: submissionData.challengeId,

    studentId: submissionData.studentId,
    studentName: submissionData.studentName,
    studentEmail: submissionData.studentEmail,

    proofImageUrl: submissionData.proofImageUrl,
    submittedQuantity: submissionData.submittedQuantity || null,
    note: submissionData.note || "",

    status: "submitted",
    pointsAwarded: 0,
    adminNote: "",

    universityId: admin.universityId,
    universityName: admin.universityName,
    universityShortName: admin.universityShortName,

    departmentId: admin.departmentId,
    departmentName: admin.departmentName,

    submittedAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function reviewChallengeSubmission({
  submissionId,
  newStatus,
  pointsAwarded,
  adminNote,
  reviewedBy,
}) {
  const submissionRef = doc(db, "challengeSubmissions", submissionId);

  await updateDoc(submissionRef, {
    status: newStatus,
    pointsAwarded,
    adminNote,
    reviewedBy,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}