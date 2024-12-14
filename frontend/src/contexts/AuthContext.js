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

  useEffect(() => {
    // Set persistence first
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Auth persistence set to LOCAL');
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });

    // Then set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'No user');
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
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
