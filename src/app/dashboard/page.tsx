'use client'
import React from 'react'
import useAuthStore from '@/stores/useAuthStore'

const DashboardPage = () => {
  const { logout } = useAuthStore()
  
  return (
    <section className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Welcome to the dashboard</p>
      <button 
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
      >
        Sign Out
      </button>
    </section>
  )
}

export default DashboardPage