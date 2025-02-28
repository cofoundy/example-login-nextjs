"use client"
import {useForm} from "react-hook-form"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

function RegisterPage() {
    const {register, handleSubmit, formState: {errors}, watch} = useForm()
    const router = useRouter()
    const [apiError, setApiError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    
    const onSubmit = handleSubmit(async (data) => {
        if(data.password !== data.confirmPassword) {
            return setApiError("Passwords do not match")
        }
        
        setIsLoading(true)
        setApiError("")
        
        try {
            const res = await fetch('/api/auth/register', {
                method: "POST",
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            const resJson = await res.json()
            
            if (!res.ok) {
                // Handle API error
                setApiError(resJson.message || "Registration failed. Please try again.")
                setIsLoading(false)
                return
            }
            
            // If registration successful, automatically log in
            const loginResult = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false
            })
            
            if (loginResult?.error) {
                setApiError("Registration successful but auto-login failed. Please try logging in manually.")
                setIsLoading(false)
                return
            }
            
            // Redirect to dashboard after successful login
            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            console.error("Registration error:", error)
            setApiError("An unexpected error occurred. Please try again.")
            setIsLoading(false)
        }
    })
    
    const password = watch("password", "");
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </a>
                    </p>
                </div>
                
                {apiError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{apiError}</span>
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className={`relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${errors.username ? 'ring-red-500' : 'ring-gray-300'} placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                                placeholder="Username"
                                {...register("username", {
                                    required: {
                                        value: true,
                                        message: "Username is required"
                                    },
                                    minLength: {
                                        value: 3,
                                        message: "Username must be at least 3 characters"
                                    }
                                })}
                            />
                            {errors.username && (
                                <span className="text-red-500 text-sm mt-1 block">
                                    {errors.username.message?.toString()}
                                </span>
                            )}
                        </div>
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
                            <input
                                id="password"
                                type="password"
                                className={`relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${errors.password ? 'ring-red-500' : 'ring-gray-300'} placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                                placeholder="Password"
                                {...register("password", {
                                    required: {
                                        value: true,
                                        message: "Password is required"
                                    },
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                            />
                            {errors.password && (
                                <span className="text-red-500 text-sm mt-1 block">
                                    {errors.password.message?.toString()}
                                </span>
                            )}
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                className={`relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${errors.confirmPassword ? 'ring-red-500' : 'ring-gray-300'} placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                                placeholder="Confirm Password"
                                {...register("confirmPassword", {
                                    required: {
                                        value: true,
                                        message: "Please confirm your password"
                                    },
                                    validate: value => 
                                        value === password || "Passwords do not match"
                                })}
                            />
                            {errors.confirmPassword && (
                                <span className="text-red-500 text-sm mt-1 block">
                                    {errors.confirmPassword.message?.toString()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative flex w-full justify-center rounded-md py-2 px-3 text-sm font-semibold text-white ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage;