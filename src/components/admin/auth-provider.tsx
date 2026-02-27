"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  idToken: string | null;
  configError: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  idToken: null,
  configError: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ hd: "hotbeamproductions.com" });

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseConfigured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  const [configError] = useState(!firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;

    const firebaseAuth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [firebaseConfigured]);

  const signIn = useCallback(async () => {
    await signInWithPopup(getFirebaseAuth(), googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, idToken, configError, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
