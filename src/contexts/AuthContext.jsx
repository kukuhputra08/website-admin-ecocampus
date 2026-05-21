import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);

      try {
        if (!user) {
          setFirebaseUser(null);
          setCurrentAdmin(null);
          return;
        }

        setFirebaseUser(user);

        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          setCurrentAdmin({
            id: user.uid,
            ...userSnapshot.data(),
          });
        } else {
          setCurrentAdmin(null);
        }
      } catch (error) {
        console.error("Failed to load admin profile:", error);
        setCurrentAdmin(null);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    firebaseUser,
    currentAdmin,
    isAuthLoading,
    isLoggedIn: Boolean(firebaseUser),
    isEmailVerified: Boolean(firebaseUser?.emailVerified),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}