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

const reportsCollection = collection(db, "reports");

export async function getReportsByAdmin(admin) {
  const reportsQuery = query(
    reportsCollection,
    where("universityId", "==", admin.universityId),
    where("departmentId", "==", admin.departmentId)
  );

  const querySnapshot = await getDocs(reportsQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function addReport(admin, reportData) {
  const docRef = await addDoc(reportsCollection, {
    title: reportData.title,
    description: reportData.description,
    category: reportData.category,
    status: "pending",

    buildingId: reportData.buildingId,
    roomId: reportData.roomId || null,

    reportedBy: reportData.reportedBy,
    imageUrl: reportData.imageUrl,

    adminNote: "",

    universityId: admin.universityId,
    universityName: admin.universityName,
    universityShortName: admin.universityShortName,

    departmentId: admin.departmentId,
    departmentName: admin.departmentName,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateReportStatus(reportId, status, adminNote) {
  const reportRef = doc(db, "reports", reportId);

  await updateDoc(reportRef, {
    status,
    adminNote,
    updatedAt: serverTimestamp(),
  });
}