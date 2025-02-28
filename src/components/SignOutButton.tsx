"use client"

import useAuthStore from "@/stores/useAuthStore"

const SignOutButton = () => {
  const { logout } = useAuthStore()

  return (
    <button 
      onClick={logout} 
      className="text-gray-700 hover:text-indigo-600 font-medium"
    >
      Logout
    </button>
  )
}

export default SignOutButton 