import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { createNotificationForUser } from "./notificationService";

const reportsCollection = collection(db, "reports");
function getReportStatusLabel(status) {
  const statusMap = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    rejected: "Rejected",
  };

  return statusMap[status] || status;
}

function buildReportNotificationMessage(reportData, status, adminNote) {
  const statusLabel = getReportStatusLabel(status);
  const reportTitle = reportData.title || "laporan kamu";

  let message = `Laporan "${reportTitle}" sekarang berstatus ${statusLabel}.`;

  if (adminNote && adminNote.trim()) {
    message += ` Catatan admin: ${adminNote.trim()}`;
  }

  return message;
}

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
  const reportSnapshot = await getDoc(reportRef);

  if (!reportSnapshot.exists()) {
    throw new Error("Report not found.");
  }

  const reportData = reportSnapshot.data();
  const previousStatus = reportData.status;

  await updateDoc(reportRef, {
    status,
    adminNote,
    updatedAt: serverTimestamp(),
  });

  if (previousStatus !== status) {
    try {
      await createNotificationForUser({
        userId: reportData.studentUid,
        type: "report",
        title: "Status laporan diperbarui",
        message: buildReportNotificationMessage(
          reportData,
          status,
          adminNote
        ),
        relatedId: reportId,
        metadata: {
          reportId,
          previousStatus,
          newStatus: status,
        },
      });
    } catch (error) {
      console.error("Failed to create report notification:", error);
    }
  }
}