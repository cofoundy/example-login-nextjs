import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import SignOutButton from "./SignOutButton"

async function Navbar(){
    const session = await getServerSession(authOptions)
    
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
                        <ul className="flex space-x-6">
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
                                        <SignOutButton />
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