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

const rewardsCollection = collection(db, "rewards");

export async function getRewardsByAdmin(admin) {
  const rewardsQuery = query(
    rewardsCollection,
    where("universityId", "==", admin.universityId),
    where("departmentId", "==", admin.departmentId)
  );

  const querySnapshot = await getDocs(rewardsQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function addReward(admin, rewardData) {
  const docRef = await addDoc(rewardsCollection, {
    title: rewardData.title,
    description: rewardData.description,
    pointsRequired: Number(rewardData.pointsRequired),
    stock: Number(rewardData.stock),
    status: rewardData.status,

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

export async function updateReward(rewardId, rewardData) {
  const rewardRef = doc(db, "rewards", rewardId);

  await updateDoc(rewardRef, {
    title: rewardData.title,
    description: rewardData.description,
    pointsRequired: Number(rewardData.pointsRequired),
    stock: Number(rewardData.stock),
    status: rewardData.status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReward(rewardId) {
  const rewardRef = doc(db, "rewards", rewardId);

  await deleteDoc(rewardRef);
}