"use client"

import { signOut } from "next-auth/react"

const SignOutButton = () => {
  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  return (
    <button 
      onClick={handleSignOut} 
      className="text-gray-700 hover:text-indigo-600 font-medium"
    >
      Logout
    </button>
  )
}

export default SignOutButton 