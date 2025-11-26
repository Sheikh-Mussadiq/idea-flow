import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";
import { userService } from "../services/userService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getSession = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session error:', error);
        throw error;
      }
      
      if (session?.user) {
        setAuthUser(session.user);
        
        // Use fetchUserProfile with retry logic to handle trigger delay
        const userProfile = await userService.fetchUserProfile(session.user.id);
        
        if (userProfile) {
          setCurrentUser(userProfile);
          setIsAuthenticated(true);
        } else {
            // If profile not found after retries, something might be wrong, but we still have authUser
            console.warn("User profile not found after retries");
        }
      }
    } catch (error) {
      console.error('Error in getSession:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email, password, fullName) => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fullName
      )}&background=random`;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: defaultAvatar,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
      return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Fetch profile immediately after sign in
      if (data.session?.user) {
          setAuthUser(data.session.user);
          const userProfile = await userService.fetchUserProfile(data.session.user.id);
          if (userProfile) {
            setCurrentUser(userProfile);
            setIsAuthenticated(true);
          }
      }
      return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      setAuthUser(null);
      setCurrentUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  useEffect(() => {
      getSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        isLoading,
        authUser,
        signUp,
        signIn,
        signInWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
