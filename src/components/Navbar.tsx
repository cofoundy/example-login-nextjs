import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import SignOutButton from "./SignOutButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import prisma from "@/libs/db"

async function Navbar(){
    const session = await getServerSession(authOptions)
    
    // Get user profile data if session exists
    let profileImage = null;
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { profileImage: true }
        });
        profileImage = user?.profileImage;
    }
    
    // Add cache-busting timestamp to profile image URL
    const profileImageWithTimestamp = profileImage 
        ? `${profileImage}?t=${Date.now()}`
        : null;
    
    // Get user initials for avatar fallback
    const getInitials = () => {
        if (!session?.user?.name) {
            return session?.user?.email?.charAt(0).toUpperCase() || 'U';
        }
        
        const nameParts = session.user.name.split(' ');
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }
        
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    };
    
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
                                                <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition">
                                                    <AvatarImage 
                                                        src={session.user?.image || profileImageWithTimestamp || ''} 
                                                        alt={session.user?.name || session.user?.email || 'User'} 
                                                    />
                                                    <AvatarFallback className="bg-indigo-600 text-white">
                                                        {getInitials()}
                                                    </AvatarFallback>
                                                </Avatar>
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

export default Navbar;