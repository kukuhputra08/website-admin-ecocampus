import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  reload,
} from "firebase/auth";

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export async function checkDepartmentHasAdmin(universityId, departmentId) {
  const usersRef = collection(db, "users");

  const adminQuery = query(
    usersRef,
    where("role", "==", "admin"),
    where("universityId", "==", universityId),
    where("departmentId", "==", departmentId)
  );

  const querySnapshot = await getDocs(adminQuery);

  return !querySnapshot.empty;
}

export async function registerAdmin({
  name,
  email,
  password,
  university,
  department,
}) {
  const hasAdmin = await checkDepartmentHasAdmin(
    university.id,
    department.id
  );

  if (hasAdmin) {
    throw new Error("This department already has an admin.");
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await sendEmailVerification(userCredential.user);

  const userRef = doc(db, "users", userCredential.user.uid);

  await setDoc(userRef, {
    uid: userCredential.user.uid,
    name,
    email,
    role: "admin",

    universityId: university.id,
    universityName: university.name,
    universityShortName: university.shortName,

    departmentId: department.id,
    departmentName: department.name,

    emailVerified: false,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userCredential.user;
}

export async function loginAdmin(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  if (!userCredential.user.emailVerified) {
    throw new Error("Please verify your email before login.");
  }

  return userCredential.user;
}

export async function checkEmailVerification() {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in.");
  }

  await reload(auth.currentUser);

  return auth.currentUser.emailVerified;
}

export async function resendVerificationEmail() {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in.");
  }

  await sendEmailVerification(auth.currentUser);
}

export async function logoutAdmin() {
  await signOut(auth);
}