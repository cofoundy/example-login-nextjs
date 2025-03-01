import { create } from 'zustand';

interface ProfileState {
  // Profile state
  isLoading: boolean;
  error: string | null;
  success: string | null;
  
  // Actions
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updateProfileImage: (imageFile: File) => Promise<boolean>;
  clearMessages: () => void;
}

interface UpdateProfileData {
  username?: string;
  name?: string;
  email?: string;
}

const useProfileStore = create<ProfileState>((set) => ({
  // Initial state
  isLoading: false,
  error: null,
  success: null,
  
  // Actions
  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null, success: null });
      
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        set({ 
          error: responseData.message || 'Failed to update profile', 
          isLoading: false 
        });
        return;
      }
      
      set({ 
        success: 'Profile updated successfully', 
        isLoading: false 
      });
    } catch (error) {
      console.error('Profile update error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred', 
        isLoading: false 
      });
    }
  },
  
  updateProfileImage: async (imageFile) => {
    try {
      set({ isLoading: true, error: null, success: null });
      
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      
      const res = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        set({ 
          error: data.message || 'Failed to update profile image', 
          isLoading: false 
        });
        return false;
      }
      
      set({ 
        success: 'Profile image updated successfully', 
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      console.error('Profile image update error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred', 
        isLoading: false 
      });
      return false;
    }
  },
  
  clearMessages: () => set({ error: null, success: null }),
}));

export default useProfileStore; 