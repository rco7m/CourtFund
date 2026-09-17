import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type AuthContextValue = {
  initializing: boolean;
  user: User | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Mirrors the old Postgres `handle_new_user` trigger: seed a profile + stats
// row the first time someone signs up, since Firestore has no server-side
// trigger equivalent without Cloud Functions.
async function seedNewUserDocs(user: User, displayName?: string) {
  const resolvedName = displayName || user.email?.split('@')[0] || null;
  const now = new Date().toISOString();

  await Promise.all([
    setDoc(
      doc(db, 'profiles', user.uid),
      {
        id: user.uid,
        email: user.email ?? null,
        display_name: resolvedName,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
      { merge: true },
    ),
    setDoc(
      doc(db, 'user_stats', user.uid),
      {
        user_id: user.uid,
        sessions_count: 0,
        hours_total: 0,
        avg_rating: null,
        streak_days: 0,
        updated_at: now,
      },
      { merge: true },
    ),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, nextUser => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      initializing,
      user,
      signUp: async (email, password, displayName) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(credential.user, { displayName });
        }
        await seedNewUserDocs(credential.user, displayName);
      },
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      signOut: async () => {
        await firebaseSignOut(auth);
      },
    };
  }, [initializing, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
