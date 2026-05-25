import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
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

  await runTransaction(db, async (transaction) => {
    // 1. READ submission dulu
    const submissionSnapshot = await transaction.get(submissionRef);

    if (!submissionSnapshot.exists()) {
      throw new Error("Submission not found.");
    }

    const submissionData = submissionSnapshot.data();

    if (submissionData.status !== "submitted") {
      throw new Error("This submission has already been reviewed.");
    }

    const finalPointsAwarded =
      newStatus === "approved" ? Number(pointsAwarded) : 0;

    let studentRef = null;
    let studentData = null;

    // 2. Kalau approved, READ student dulu sebelum write apa pun
    if (newStatus === "approved") {
      studentRef = doc(db, "users", submissionData.studentId);

      const studentSnapshot = await transaction.get(studentRef);

      if (!studentSnapshot.exists()) {
        throw new Error("Student user not found.");
      }

      studentData = studentSnapshot.data();
    }

    // 3. Setelah semua READ selesai, baru WRITE submission
    transaction.update(submissionRef, {
      status: newStatus,
      pointsAwarded: finalPointsAwarded,
      adminNote,
      reviewedBy,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 4. Kalau approved, WRITE points student
    if (newStatus === "approved" && studentRef && studentData) {
      const currentPoints = Number(studentData.points || 0);

      transaction.update(studentRef, {
        points: currentPoints + finalPointsAwarded,
        updatedAt: serverTimestamp(),
      });
    }
  });
}