'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import useProfileStore from '@/stores/useProfileStore';

// Form validation schema
const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfile {
  id: number;
  email: string;
  username: string | null;
  name: string | null;
  profileImage: string | null;
  isVerified: boolean;
}

export default function ProfileForm() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { updateProfile, updateProfileImage, error, success, clearMessages } = useProfileStore();
  
  // Initialize form with react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
    },
    mode: 'onChange',
  });
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        setProfileData(data.user);
        
        // Set form default values
        form.reset({
          name: data.user.name || '',
          username: data.user.username || '',
          email: data.user.email || '',
        });
        
        // Set image preview if available
        if (data.user.profileImage) {
          setImagePreview(data.user.profileImage);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [form]);
  
  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    if (!profileData) return;
    
    // Only include fields that have been changed
    const changedValues: Record<string, string> = {};
    
    if (values.name !== profileData.name) changedValues.name = values.name || '';
    if (values.username !== profileData.username) changedValues.username = values.username || '';
    if (values.email !== profileData.email) changedValues.email = values.email || '';
    
    // If no changes, don't submit
    if (Object.keys(changedValues).length === 0 && !imageFile) {
      toast.info('No changes to save');
      return;
    }
    
    let hasChanges = false;
    
    // Update profile if there are changes to text fields
    if (Object.keys(changedValues).length > 0) {
      await updateProfile(changedValues);
      hasChanges = true;
      
      // Update session if email was changed
      if (changedValues.email || changedValues.name) {
        await update({
          ...session,
          user: {
            ...session?.user,
            ...(changedValues.name && { name: changedValues.name }),
            ...(changedValues.email && { email: changedValues.email }),
          },
        });
      }
    }
    
    // Upload profile image if selected
    if (imageFile) {
      const success = await updateProfileImage(imageFile);
      hasChanges = true;
      
      if (success && imagePreview) {
        // Update session with new profile image
        await update({
          ...session,
          user: {
            ...session?.user,
            image: imagePreview,
          },
        });
      }
    }
    
    // Refresh the page to update the navbar avatar
    if (hasChanges) {
      // Force a refresh of server components to update the navbar
      router.refresh();
    }
  };
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!profileData?.name) {
      return profileData?.email?.charAt(0).toUpperCase() || 'U';
    }
    
    const nameParts = profileData.name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };
  
  // Show toast notifications for success/error
  useEffect(() => {
    if (success) {
      toast.success(success);
      clearMessages();
    }
    
    if (error) {
      toast.error(error);
      clearMessages();
    }
  }, [success, error, clearMessages]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal information and how others see you on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Image */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
              <div className="relative group">
                <Avatar 
                  className="h-24 w-24 cursor-pointer border-2 border-muted group-hover:border-indigo-300 transition"
                  onClick={handleImageClick}
                >
                  <AvatarImage src={imagePreview || profileData?.profileImage || ''} />
                  <AvatarFallback className="bg-indigo-600 text-white text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  onClick={handleImageClick}
                >
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Click on the avatar to upload a new profile picture
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WebP. Max 5MB.
                </p>
              </div>
            </div>
            
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your full name as it will appear on your profile
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public username
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your email address is used for login and notifications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={form.formState.isSubmitting || useProfileStore.getState().isLoading}
            >
              {(form.formState.isSubmitting || useProfileStore.getState().isLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 