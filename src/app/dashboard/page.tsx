'use client'
import { signOut } from 'next-auth/react'
import React from 'react'

const page = () => {
  return (
    <section>
        <h1>Dashboard</h1>
        <p>Welcome to the dashboard</p>
        <button onClick={() => signOut()}>Sign Out</button>
        
    </section>
  )
}

export default page