import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile, AdminUser, AdminRoleType } from '../types';
import { logActivity, initializeSeedDataIfNeeded } from './firestoreService';
import { ALL_PERMISSIONS } from './seedData';

export { ALL_PERMISSIONS } from './seedData';

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isOwner: boolean;
  adminRole: AdminRoleType | null;
  adminPermissions: string[];
  hasPermission: (permission: string) => boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileDetails: (displayName: string, photoURL?: string) => Promise<void>;
  // Auth modal global trigger
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Built-in owner emails that automatically receive Owner permissions
const SYSTEM_OWNERS = ['samarthpathak62@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<AdminRoleType | null>(null);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loadUserData = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let profile: UserProfile;
      if (userSnap.exists()) {
        profile = userSnap.data() as UserProfile;
      } else {
        // Create user profile in Firestore
        profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Crafter'),
          photoURL: firebaseUser.photoURL || '',
          createdAt: new Date().toISOString(),
          disabled: false,
          role: 'user',
        };
        await setDoc(userRef, profile);
        await logActivity(profile.email, 'User', 'Account Registered', 'New account created successfully');
      }

      // Check admin status from /admins/{uid}
      const adminRef = doc(db, 'admins', firebaseUser.uid);
      const adminSnap = await getDoc(adminRef);

      const isSystemOwner = firebaseUser.email && SYSTEM_OWNERS.includes(firebaseUser.email.toLowerCase());
      let resolvedAdminData: AdminUser | null = null;

      if (adminSnap.exists()) {
        resolvedAdminData = adminSnap.data() as AdminUser;
      } else if (firebaseUser.email) {
        // 1. If not found by UID, check if an admin was created with their email (e.g. before registration or with temp ID)
        try {
          const emailQ = query(collection(db, 'admins'), where('email', '==', firebaseUser.email.toLowerCase()));
          const emailSnap = await getDocs(emailQ);
          if (!emailSnap.empty) {
            const matchedDoc = emailSnap.docs[0];
            const matchedData = matchedDoc.data() as AdminUser;
            resolvedAdminData = {
              ...matchedData,
              uid: firebaseUser.uid,
              email: firebaseUser.email.toLowerCase(),
              displayName: firebaseUser.displayName || matchedData.displayName || profile.displayName,
            };
            // Link directly to /admins/{uid} so security rules match request.auth.uid
            await setDoc(adminRef, resolvedAdminData);
            if (matchedDoc.id !== firebaseUser.uid) {
              try {
                await deleteDoc(matchedDoc.ref);
              } catch (_) {}
            }
          }
        } catch (err) {
          console.warn('Could not query admins by email:', err);
        }
      }

      // 2. First Admin / New Database Auto-Bootstrap:
      // If no admin record was found, check if this is the very first user on a fresh Firebase database
      if (!resolvedAdminData) {
        let isFirstDatabaseUser = false;
        try {
          const allAdmins = await getDocs(collection(db, 'admins'));
          const actualStaff = allAdmins.docs.filter((d) => d.id !== 'owner_lock');
          if (actualStaff.length === 0) {
            isFirstDatabaseUser = true;
          }
        } catch (e) {
          console.warn('Could not verify existing staff count:', e);
        }

        if (isFirstDatabaseUser || isSystemOwner) {
          resolvedAdminData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'owner@minecraft-hosting.com',
            displayName: profile.displayName || 'Server Owner',
            role: 'Owner',
            permissions: [...ALL_PERMISSIONS],
            createdAt: new Date().toISOString(),
            assignedBy: 'System Auto-Bootstrap',
          };
          await setDoc(adminRef, resolvedAdminData);
          try {
            await setDoc(doc(db, 'admins', 'owner_lock'), {
              initialized: true,
              ownerUid: firebaseUser.uid,
              ownerEmail: resolvedAdminData.email,
              timestamp: new Date().toISOString(),
            });
          } catch (_) {}
          // Ensure database collections are seeded with default plans and settings
          await initializeSeedDataIfNeeded();
          console.log('Granted Owner privileges to:', firebaseUser.email);
        }
      }

      // Apply roles and state
      if (resolvedAdminData && !resolvedAdminData.disabled) {
        setIsAdmin(true);
        setAdminRole(resolvedAdminData.role);
        setAdminPermissions(resolvedAdminData.permissions || [...ALL_PERMISSIONS]);
        profile.role = resolvedAdminData.role;
      } else {
        setIsAdmin(false);
        setAdminRole(null);
        setAdminPermissions([]);
      }

      setUserProfile(profile);
    } catch (err) {
      console.warn('Error loading user data from Firestore:', err);
      // Fallback local profile if offline or restricted
      const fallbackRole = (firebaseUser.email && SYSTEM_OWNERS.includes(firebaseUser.email.toLowerCase())) ? 'Owner' : 'user';
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Player',
        createdAt: new Date().toISOString(),
        disabled: false,
        role: fallbackRole,
      });
      if (fallbackRole === 'Owner') {
        setIsAdmin(true);
        setAdminRole('Owner');
        setAdminPermissions([...ALL_PERMISSIONS]);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setAdminRole(null);
        setAdminPermissions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await logActivity(email, 'User', 'User Logged In', 'Successful credentials authentication');
    await loadUserData(cred.user);
  };

  const register = async (email: string, pass: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateFirebaseProfile(cred.user, { displayName });
    await loadUserData(cred.user);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await logActivity(
        cred.user.email || cred.user.uid,
        'User',
        'Google Authentication',
        'Authenticated successfully via Google Sign-In'
      );
      await loadUserData(cred.user);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    if (user?.email) {
      await logActivity(user.email, adminRole || 'User', 'User Logged Out', 'Session terminated');
    }
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setAdminRole(null);
    setAdminPermissions([]);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    await logActivity(email, 'User', 'Password Reset Requested', 'Sent reset instructions');
  };

  const updateProfileDetails = async (displayName: string, photoURL?: string) => {
    if (!user) return;
    await updateFirebaseProfile(user, { displayName, photoURL });
    const userRef = doc(db, 'users', user.uid);
    const updated: Partial<UserProfile> = { displayName, photoURL };
    await setDoc(userRef, updated, { merge: true });
    setUserProfile(prev => prev ? { ...prev, displayName, photoURL } : null);
    await logActivity(user.email || user.uid, 'User', 'Profile Updated', `Updated username to ${displayName}`);
  };

  const hasPermission = (perm: string): boolean => {
    if (!isAdmin) return false;
    if (adminRole === 'Owner') return true;
    return adminPermissions.includes(perm);
  };

  const isOwner = adminRole === 'Owner' || Boolean(user?.email && SYSTEM_OWNERS.includes(user.email.toLowerCase()));

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        isOwner,
        adminRole,
        adminPermissions,
        hasPermission,
        loading,
        login,
        register,
        signInWithGoogle,
        logout,
        resetPassword,
        updateProfileDetails,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
