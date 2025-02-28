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
        // Handle specific error for unverified users
        if (res.error === "UNVERIFIED_USER") {
          // We'll use NextAuth error page parameters to handle this
          window.location.href = `/auth/login?error=UNVERIFIED_USER&email=${encodeURIComponent(email)}`;
          return;
        }
        
        set({ error: "Invalid credentials", isLoading: false });
        return;
      }
      
      // Keep isLoading true because we're redirecting
      window.location.href = "/dashboard";
      
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
      
      // Check if verification email was sent
      if (data.isVerificationEmailSent) {
        // Redirect to verification page
        window.location.href = `/verify?email=${encodeURIComponent(email)}`;
        return;
      }
      
      // Auto login after successful registration (if no verification is needed)
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
      
      // Keep isLoading true because we're redirecting to dashboard
      window.location.href = "/dashboard";
      
    } catch (error) {
      console.error("Registration error:", error);
      set({ error: "An unexpected error occurred", isLoading: false });
    }
  },
  
  registerWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await signIn("google", { 
        callbackUrl: "/dashboard",
        // Add a provider query param to identify this as a Google registration
        // This will be used by the register API to auto-verify Google users
        query: { provider: "google" }
      });
      
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