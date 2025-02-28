import { create } from 'zustand';
import { signIn, signOut } from 'next-auth/react';

interface AuthState {
  // Auth state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  registerWithCredentials: (username: string, email: string, password: string) => Promise<void>;
  registerWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearErrors: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  isLoading: false,
  error: null,
  
  // Actions
  loginWithCredentials: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });
      
      if (res?.error) {
        set({ error: "Invalid credentials", isLoading: false });
        return;
      }
      
      // Keep isLoading true because we're redirecting
      
    } catch (error) {
      console.error("Login error:", error);
      set({ error: "An unexpected error occurred", isLoading: false });
    }
  },
  
  loginWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await signIn("google", { callbackUrl: "/dashboard" });
      
      // No need to set isLoading to false as we're redirecting
      
    } catch (error) {
      console.error("Google sign in error:", error);
      set({ error: "Could not sign in with Google", isLoading: false });
    }
  },
  
  registerWithCredentials: async (username, email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      const res = await fetch('/api/auth/register', {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        set({ error: data.message || "Registration failed", isLoading: false });
        return;
      }
      
      // Auto login after successful registration
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false
      });
      
      if (loginRes?.error) {
        set({ 
          error: "Registration successful but auto-login failed. Please try logging in manually.", 
          isLoading: false 
        });
        return;
      }
      
      // Keep isLoading true because we're redirecting
      
    } catch (error) {
      console.error("Registration error:", error);
      set({ error: "An unexpected error occurred", isLoading: false });
    }
  },
  
  registerWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await signIn("google", { callbackUrl: "/dashboard" });
      
      // No need to set isLoading to false as we're redirecting
      
    } catch (error) {
      console.error("Google sign up error:", error);
      set({ error: "Could not sign up with Google", isLoading: false });
    }
  },
  
  logout: async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
  
  clearErrors: () => set({ error: null })
}));

export default useAuthStore; 