import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

const redemptionsCollection = collection(db, "rewardRedemptions");

export async function getRewardRedemptionsByAdmin(admin) {
  const redemptionsQuery = query(
    redemptionsCollection,
    where("universityId", "==", admin.universityId),
    where("departmentId", "==", admin.departmentId)
  );

  const querySnapshot = await getDocs(redemptionsQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function getRewardRedemptionByCode(admin, redeemCode) {
  const redemptionsQuery = query(
    redemptionsCollection,
    where("universityId", "==", admin.universityId),
    where("departmentId", "==", admin.departmentId),
    where("redeemCode", "==", redeemCode.trim().toUpperCase())
  );

  const querySnapshot = await getDocs(redemptionsQuery);

  if (querySnapshot.empty) {
    return null;
  }

  const document = querySnapshot.docs[0];

  return {
    id: document.id,
    ...document.data(),
  };
}

export async function claimRewardRedemption(redemptionId, adminId) {
  const redemptionRef = doc(db, "rewardRedemptions", redemptionId);

  await updateDoc(redemptionRef, {
    status: "claimed",
    claimedAt: serverTimestamp(),
    claimedBy: adminId,
    updatedAt: serverTimestamp(),
  });
}

export async function createDummyRewardRedemption(admin, reward) {
  if (!reward) {
    throw new Error("Reward is required to create dummy redemption.");
  }

  const randomCode = `ECO-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;

  const rewardRef = doc(db, "rewards", reward.id);
  const redemptionRef = doc(collection(db, "rewardRedemptions"));

  await runTransaction(db, async (transaction) => {
    const rewardSnapshot = await transaction.get(rewardRef);

    if (!rewardSnapshot.exists()) {
      throw new Error("Reward not found.");
    }

    const rewardData = rewardSnapshot.data();
    const currentStock = Number(rewardData.stock || 0);

    if (currentStock <= 0) {
      throw new Error("Reward stock is empty.");
    }

    transaction.set(redemptionRef, {
      rewardId: reward.id,
      rewardTitle: rewardData.title,

      studentId: "student_dummy_001",
      studentName: "Budi Santoso",
      studentEmail: "budi@student.its.ac.id",

      pointsUsed: Number(rewardData.pointsRequired),
      redeemCode: randomCode,

      status: "pending",

      universityId: admin.universityId,
      universityName: admin.universityName,
      universityShortName: admin.universityShortName,

      departmentId: admin.departmentId,
      departmentName: admin.departmentName,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      claimedAt: null,
      claimedBy: null,
    });

    transaction.update(rewardRef, {
      stock: currentStock - 1,
      updatedAt: serverTimestamp(),
    });
  });

  return {
    id: redemptionRef.id,
    rewardId: reward.id,
    rewardTitle: reward.title,

    studentId: "student_dummy_001",
    studentName: "Budi Santoso",
    studentEmail: "budi@student.its.ac.id",

    pointsUsed: Number(reward.pointsRequired),
    redeemCode: randomCode,

    status: "pending",

    universityId: admin.universityId,
    universityName: admin.universityName,
    universityShortName: admin.universityShortName,

    departmentId: admin.departmentId,
    departmentName: admin.departmentName,

    createdAt: new Date(),
    updatedAt: new Date(),

    claimedAt: null,
    claimedBy: null,
  };
}