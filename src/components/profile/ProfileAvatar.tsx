"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileAvatarProps {
  name?: string | null;
  email?: string | null;
  profileImage?: string | null;
  sessionImage?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  forceRefresh?: boolean; // Force refresh of the image
}

// Helper function to check if URL is a Google image
const isGoogleImageUrl = (url: string): boolean => {
  return url.includes('googleusercontent.com') || 
         url.includes('google.com') ||
         url.includes('googleapis.com');
};

/**
 * A reusable profile avatar component that displays a user's profile image or initials fallback
 * 
 * @param name - The user's name (optional)
 * @param email - The user's email (optional)
 * @param profileImage - The user's profile image URL from database (optional)
 * @param sessionImage - The user's image URL from session (optional)
 * @param size - Size of the avatar (sm, md, lg, xl)
 * @param onClick - Click handler for the avatar (optional)
 * @param forceRefresh - Force refresh of the image (optional)
 */
export default function ProfileAvatar({
  name,
  email,
  profileImage,
  sessionImage,
  size = 'md',
  onClick,
  forceRefresh = false
}: ProfileAvatarProps) {
  // State to track the image URL with timestamp for cache-busting
  const [imageSrc, setImageSrc] = useState<string>('');
  // Use a timestamp to force refresh the image on component mount and when forceRefresh changes
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  
  // Refresh the timestamp when forceRefresh changes
  useEffect(() => {
    if (forceRefresh) {
      setTimestamp(Date.now());
    }
  }, [forceRefresh]);
  
  // Log image sources for debugging
  useEffect(() => {
    if (profileImage) {
      console.log("Profile image source:", profileImage);
    }
    if (sessionImage) {
      console.log("Session image source:", sessionImage);
    }
  }, [profileImage, sessionImage]);
  
  // Determine the image source with priority to profileImage then sessionImage
  useEffect(() => {
    if (profileImage) {
      // Check if it's a data URL (from FileReader preview) which starts with "data:"
      if (profileImage.startsWith('data:')) {
        // Don't add timestamp to data URLs - they're already unique
        setImageSrc(profileImage);
      } else if (isGoogleImageUrl(profileImage)) {
        // Don't add timestamp to Google profile images as they have secure tokens
        console.log("Using Google profile image without modification:", profileImage);
        setImageSrc(profileImage);
      } else {
        // If it's a URL that already has query parameters, use & instead of ?
        const separator = profileImage.includes('?') ? '&' : '?';
        setImageSrc(`${profileImage}${separator}t=${timestamp}`);
      }
    } else if (sessionImage) {
      // For Google images or other session images, we may not need cache busting
      if (isGoogleImageUrl(sessionImage)) {
        // Don't modify Google URLs
        console.log("Using Google session image without modification:", sessionImage);
        setImageSrc(sessionImage);
      } else if (sessionImage.startsWith('/')) {
        // Only add timestamp to local images (ones that don't have http/https)
        setImageSrc(`${sessionImage}?t=${timestamp}`);
      } else {
        setImageSrc(sessionImage);
      }
    } else {
      setImageSrc('');
    }
  }, [profileImage, sessionImage, timestamp]);
  
  // Get user initials for avatar fallback
  const getInitials = (): string => {
    if (!name) {
      return email?.charAt(0)?.toUpperCase() || 'U';
    }
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };
  
  // Determine avatar size class
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };
  
  // Determine the font size for the avatar fallback
  const fallbackFontSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  return (
    <Avatar 
      className={`${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
      onClick={onClick}
    >
      <AvatarImage 
        src={imageSrc} 
        alt={name || email || 'User'} 
        referrerPolicy="no-referrer"
        key={`avatar-${timestamp}`} // Key prop to force re-render
      />
      <AvatarFallback className={`bg-indigo-600 text-white ${fallbackFontSize[size]}`}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
} 