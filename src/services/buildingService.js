import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

const buildingsCollection = collection(db, "buildings");

export async function getBuildingsByAdmin(admin) {
  const buildingsQuery = query(
    buildingsCollection,
    where("universityId", "==", admin.universityId),
    where("departmentId", "==", admin.departmentId)
  );

  const querySnapshot = await getDocs(buildingsQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function addBuilding(admin, buildingName) {
  const docRef = await addDoc(buildingsCollection, {
    name: buildingName,
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

export async function updateBuilding(buildingId, buildingName) {
  const buildingRef = doc(db, "buildings", buildingId);

  await updateDoc(buildingRef, {
    name: buildingName,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBuilding(buildingId) {
  const buildingRef = doc(db, "buildings", buildingId);

  await deleteDoc(buildingRef);
}