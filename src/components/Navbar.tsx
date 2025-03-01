'use client';

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import SignOutButton from "./SignOutButton"
import ProfileAvatar from "./profile/ProfileAvatar"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"

export default function Navbar() {
    const { data: session, status } = useSession();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Fetch user profile image when session changes
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (session?.user?.email) {
                try {
                    setIsLoading(true);
                    const response = await fetch('/api/user/profile');
                    if (response.ok) {
                        const data = await response.json();
                        setProfileImage(data.user.profileImage);
                    }
                } catch (error) {
                    console.error('Error fetching profile data:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setProfileImage(null);
                setIsLoading(false);
            }
        };
        
        if (status !== 'loading') {
            fetchUserProfile();
        }
    }, [session, status]);
    
    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-indigo-600 font-bold text-xl">
                            MyApp
                        </Link>
                    </div>
                    
                    <div className="flex items-center">
                        <ul className="flex space-x-6 items-center">
                            <li>
                                <Link href="/" className="text-gray-700 hover:text-indigo-600 font-medium">
                                    Home
                                </Link>
                            </li>
                            
                            {session ? (
                                <>
                                    <li>
                                        <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="focus:outline-none">
                                                <ProfileAvatar 
                                                    name={session.user?.name}
                                                    email={session.user?.email}
                                                    profileImage={profileImage}
                                                    sessionImage={session.user?.image}
                                                    size="sm"
                                                    forceRefresh={!isLoading}
                                                />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuLabel>
                                                    <div className="flex flex-col space-y-1">
                                                        <p className="text-sm font-medium leading-none">
                                                            {session.user?.name || 'User'}
                                                        </p>
                                                        <p className="text-xs leading-none text-muted-foreground">
                                                            {session.user?.email}
                                                        </p>
                                                    </div>
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href="/profile" className="flex items-center cursor-pointer">
                                                        <User className="mr-2 h-4 w-4" />
                                                        <span>Profile</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href="/settings" className="flex items-center cursor-pointer">
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        <span>Settings</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <div className="flex items-center w-full">
                                                        <LogOut className="mr-2 h-4 w-4" />
                                                        <SignOutButton />
                                                    </div>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link href="/auth/login" className="text-gray-700 hover:text-indigo-600 font-medium">
                                            Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/register" className="text-gray-700 hover:text-indigo-600 font-medium">
                                            Register
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    )
}