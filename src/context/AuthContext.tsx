import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "../lib/firebase";
import type { ClubEvent } from "../data/events";

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: "admin" | "member";
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginRecord {
  id: string;
  userId: string;
  email: string;
  displayName?: string;
  role: "admin" | "member";
  loginMethod?: string;
  loggedInAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  role: "admin" | "member" | null;
  loading: boolean;
  registeredEventIds: Set<string>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  registerForEvent: (event: ClubEvent) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ["techvedas.dsu@gmail.com"];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<"admin" | "member" | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const isAdminEmail = currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
        const resolvedRole: "admin" | "member" = isAdminEmail ? "admin" : "member";
        setRole(resolvedRole);
        const nowIso = new Date().toISOString();

        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          if (snapshot.exists()) {
            const existingData = snapshot.data() as UserProfile;
            const updatedProfile: UserProfile = {
              ...existingData,
              lastLoginAt: nowIso,
            };
            await setDoc(userDocRef, updatedProfile, { merge: true });
            setProfile(updatedProfile);
          } else {
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Member",
              photoURL: currentUser.photoURL || "",
              role: resolvedRole,
              createdAt: nowIso,
              lastLoginAt: nowIso,
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }

          // Record login audit entry to /logins
          const loginId = `log_${currentUser.uid}_${Date.now()}`;
          const loginDocRef = doc(db, "logins", loginId);
          await setDoc(loginDocRef, {
            id: loginId,
            userId: currentUser.uid,
            email: currentUser.email || "",
            displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Member",
            role: resolvedRole,
            loginMethod: currentUser.providerData[0]?.providerId || "google.com",
            loggedInAt: nowIso,
          });
        } catch (error) {
          console.warn("Could not sync user profile or login record to Firestore:", error);
          setProfile({
            id: currentUser.uid,
            email: currentUser.email || "",
            displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Member",
            photoURL: currentUser.photoURL || "",
            role: resolvedRole,
            createdAt: nowIso,
            lastLoginAt: nowIso,
          });
        }
      } else {
        setProfile(null);
        setRole(null);
        setRegisteredEventIds(new Set());
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync registered events when user is logged in
  useEffect(() => {
    if (!user) {
      setRegisteredEventIds(new Set());
      return;
    }

    const regQuery = query(collection(db, "registrations"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      regQuery,
      (snapshot) => {
        const eventIds = new Set<string>();
        snapshot.forEach((d) => {
          const data = d.data();
          if (data.eventId) {
            eventIds.add(data.eventId);
          }
        });
        setRegisteredEventIds(eventIds);
      },
      (error) => {
        console.warn("Failed to listen for registrations:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error("Google sign in error:", err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
      console.error("Email sign in error:", err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      throw err;
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  const registerForEvent = async (event: ClubEvent): Promise<boolean> => {
    if (!user) return false;

    const registrationId = `${user.uid}_${event.id}`;
    const regDocRef = doc(db, "registrations", registrationId);

    try {
      await setDoc(regDocRef, {
        id: registrationId,
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || user.email?.split("@")[0] || "Member",
        eventId: event.id,
        eventTitle: event.title,
        registeredAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `registrations/${registrationId}`);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        registeredEventIds,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        registerForEvent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
