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

const roomsCollection = collection(db, "rooms");

export async function getRoomsByAdmin(admin) {
  const roomsQuery = query(
    roomsCollection,
    where("universityId", "==", admin.universityId),
    where("departmentId", "==", admin.departmentId)
  );

  const querySnapshot = await getDocs(roomsQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function addRoom(admin, roomData) {
  const docRef = await addDoc(roomsCollection, {
    name: roomData.name,
    buildingId: roomData.buildingId,
    floor: Number(roomData.floor),
    type: roomData.type,

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

export async function updateRoom(roomId, roomData) {
  const roomRef = doc(db, "rooms", roomId);

  await updateDoc(roomRef, {
    name: roomData.name,
    buildingId: roomData.buildingId,
    floor: Number(roomData.floor),
    type: roomData.type,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRoom(roomId) {
  const roomRef = doc(db, "rooms", roomId);

  await deleteDoc(roomRef);
}