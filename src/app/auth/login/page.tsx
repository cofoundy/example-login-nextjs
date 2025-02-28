"use client"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import useAuthStore from "@/stores/useAuthStore"
import Link from "next/link"

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors }, getValues } = useForm()
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorType = searchParams.get("error")
  
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  // Use Zustand store
  const { loginWithCredentials, loginWithGoogle, isLoading, error, clearErrors } = useAuthStore()
  
  // Handle NextAuth error parameters from URL
  useEffect(() => {
    if (errorType === "UNVERIFIED_USER") {
      const email = searchParams.get("email")
      if (email) {
        setUnverifiedEmail(email)
      }
    }
  }, [errorType, searchParams])
  
  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearErrors()
    }
  }, [clearErrors])
  
  const onSubmit = handleSubmit(async (data) => {
    // Save email in case we need to redirect to verification
    setUnverifiedEmail(data.email)
    
    await loginWithCredentials(data.email, data.password)
    
    // Handle redirection after successful login
    if (!error) {
      router.push("/dashboard")
      router.refresh()
    }
  })
  
  const handleResendVerification = async () => {
    const email = unverifiedEmail || getValues("email")
    
    if (!email) {
      return
    }
    
    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      if (response.ok) {
        router.push(`/verify?email=${encodeURIComponent(email)}`)
      } else {
        const data = await response.json()
        throw new Error(data.message || "Failed to resend verification code")
      }
    } catch (err) {
      console.error("Error resending verification:", err)
    }
  }

  // Check if we're handling an unverified user error
  const isUnverifiedError = errorType === "UNVERIFIED_USER" || error?.includes("not verified") || error?.includes("unverified")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Create an account
            </a>
          </p>
        </div>

        {isUnverifiedError ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 text-sm">
            <p className="font-medium">Email verification required</p>
            <p className="mt-1">Please verify your email address to continue.</p>
            <button
              onClick={handleResendVerification}
              className="mt-2 px-3 py-1.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            >
              Resend verification code
            </button>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
            {error}
          </div>
        ) : null}

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={`relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${errors.email ? 'ring-red-500' : 'ring-gray-300'} placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                placeholder="Email address"
                {...register("email", {
                  required: {
                    value: true,
                    message: "Email is required"
                  },
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.email.message?.toString()}
                </span>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${errors.password ? 'ring-red-500' : 'ring-gray-300'} placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                  placeholder="Password"
                  {...register("password", {
                    required: {
                      value: true,
                      message: "Password is required"
                    }
                  })}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.password.message?.toString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-md py-2 px-3 text-sm font-semibold text-white ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => loginWithGoogle()}
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage