import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { 
  onAuthStateChanged, 
  setPersistence, 
  browserLocalPersistence,
  signOut as firebaseSignOut
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe;

    async function initializeAuth() {
      try {
        // Set persistence to LOCAL
        await setPersistence(auth, browserLocalPersistence);
        console.log('Auth persistence set to LOCAL');

        // Listen for auth state changes
        unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'No user');
          setCurrentUser(user);
          if (!initialized) setInitialized(true);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
        setInitialized(true);
      }
    }

    initializeAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initialized]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
