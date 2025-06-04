import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useEffect, useState } from 'react';

// Initialize WebBrowser
WebBrowser.maybeCompleteAuthSession();

// Email validation regex
const EMAIL_REGEX = /\S+@\S+\.\S+/;

// Mock Firebase Auth User Interface
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  signInWithGoogle: async () => { },
  resetError: () => { },
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock Google OAuth configuration
  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    clientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  const handleSuccessfulAuth = useCallback(async (userData: User) => {
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Failed to save user to storage:', err);
      setError('Failed to authenticate');
    }
  }, []);

  // Load user from secure storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJSON = await SecureStore.getItemAsync('user');
        if (userJSON) {
          const userData = JSON.parse(userJSON);
          // Validate user data structure
          if (userData && typeof userData === 'object' && userData.uid && userData.email) {
            setUser(userData);
          } else {
            console.warn('Invalid user data in storage, clearing...');
            await SecureStore.deleteItemAsync('user');
          }
        }
      } catch (err) {
        console.error('Failed to load user from storage:', err);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    loadUser();
  }, []);

  // Handle Google sign-in response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      if (authentication) {
        // In a real app, we would exchange this token with Firebase
        // For now, we'll mock a user
        const mockGoogleUser: User = {
          uid: 'google-user-123',
          email: 'google-user@example.com',
          displayName: 'Google User',
          photoURL: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        };

        handleSuccessfulAuth(mockGoogleUser);
        setLoading(false);
      }
    }
  }, [googleResponse, handleSuccessfulAuth]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      if (!email || !password) {
        setError('Email and password are required');
        return;
      }
      if (!EMAIL_REGEX.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
      setLoading(true);
      
      // In a real app, we would call Firebase Auth here
      // For now, we'll just mock a successful response
      if (email === 'test@example.com' && password === 'password') {
        const mockUser: User = {
          uid: 'user-123',
          email,
          displayName: 'Test User',
          photoURL: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        };

        await handleSuccessfulAuth(mockUser);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }, [handleSuccessfulAuth]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, we would call Firebase Auth here
      // For now, we'll just mock a successful response
      const mockUser: User = {
        uid: 'user-' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: name,
      };

      await handleSuccessfulAuth(mockUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }, [handleSuccessfulAuth]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, we would call Firebase Auth here
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      await promptGoogleAsync();
      // Note: loading state will be reset to false in the useEffect that handles googleResponse
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setLoading(false);
    }
  }, [promptGoogleAsync]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || initialLoading,
        error,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        resetError,
      }}
    >
      {!initialLoading && children}
    </AuthContext.Provider>
  );
};