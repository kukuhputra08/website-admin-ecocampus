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
const usersCollection = collection(db, "users");

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

    studentUid: submissionData.studentUid || "",
    studentId: submissionData.studentId || "",
    studentName: submissionData.studentName || "",
    studentEmail: submissionData.studentEmail || "",

    proofImageUrl: submissionData.proofImageUrl || "",
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

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return value.toString().trim();
}

async function findStudentUserInsideTransaction(transaction, submissionData) {
  const studentUid = normalizeText(submissionData.studentUid);
  const userId = normalizeText(submissionData.userId);
  const uid = normalizeText(submissionData.uid);
  const studentId = normalizeText(submissionData.studentId);
  const studentEmail = normalizeText(submissionData.studentEmail);
  const email = normalizeText(submissionData.email);

  async function findByDocumentId(documentId) {
    if (!documentId) return null;

    const userRef = doc(db, "users", documentId);
    const userSnapshot = await transaction.get(userRef);

    if (!userSnapshot.exists()) {
      return null;
    }

    return {
      ref: userRef,
      data: userSnapshot.data(),
      id: userSnapshot.id,
    };
  }

  async function findByField(fieldName, value) {
    if (!value) return null;

    const userQuery = query(
      usersCollection,
      where(fieldName, "==", value)
    );

    const userSnapshot = await transaction.get(userQuery);

    if (userSnapshot.empty) {
      return null;
    }

    const userDocument = userSnapshot.docs[0];

    return {
      ref: userDocument.ref,
      data: userDocument.data(),
      id: userDocument.id,
    };
  }

  const documentIdCandidates = [
    studentUid,
    userId,
    uid,
    studentId,
  ];

  for (const candidate of documentIdCandidates) {
    const result = await findByDocumentId(candidate);

    if (result) {
      return result;
    }
  }

  const studentIdResult = await findByField("studentId", studentId);

  if (studentIdResult) {
    return studentIdResult;
  }

  const studentEmailResult = await findByField(
    "email",
    studentEmail || email
  );

  if (studentEmailResult) {
    return studentEmailResult;
  }

  return null;
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
    const submissionSnapshot = await transaction.get(submissionRef);

    if (!submissionSnapshot.exists()) {
      throw new Error("Submission not found.");
    }

    const submissionData = submissionSnapshot.data();

    if (submissionData.status !== "submitted") {
      throw new Error("This submission has already been reviewed.");
    }

    const finalPointsAwarded =
      newStatus === "approved" ? Number(pointsAwarded || 0) : 0;

    let studentUser = null;

    if (newStatus === "approved") {
      studentUser = await findStudentUserInsideTransaction(
        transaction,
        submissionData
      );

      if (!studentUser) {
        throw new Error(
          "Student user not found. Pastikan submission memiliki studentUid, studentId, atau studentEmail yang sesuai dengan collection users."
        );
      }
    }

    transaction.update(submissionRef, {
      status: newStatus,
      pointsAwarded: finalPointsAwarded,
      adminNote: adminNote || "",
      reviewedBy: reviewedBy || "",
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (newStatus === "approved" && studentUser) {
      const currentPoints = Number(studentUser.data.points || 0);

      transaction.update(studentUser.ref, {
        points: currentPoints + finalPointsAwarded,
        updatedAt: serverTimestamp(),
      });
    }
  });
}