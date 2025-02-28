"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();
  
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [remainingTime, setRemainingTime] = useState(30 * 60); // 30 minutes in seconds
  
  // If no email is provided, redirect to login
  useEffect(() => {
    if (!email) {
      router.push('/auth/login');
    }
  }, [email, router]);
  
  // Countdown timer for code expiration
  useEffect(() => {
    if (!success && remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [remainingTime, success]);
  
  // Format remaining time as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    
    setError(null);
    setVerifying(true);
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }
      
      setSuccess(true);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify your code');
    } finally {
      setVerifying(false);
    }
  };
  
  const handleResendCode = async () => {
    setError(null);
    
    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }
      
      // Reset the countdown timer
      setRemainingTime(30 * 60);
      
      // Show success message
      setError('A new verification code has been sent to your email');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification code');
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a verification code to
            <br />
            <span className="font-medium text-indigo-600">{email}</span>
          </p>
        </div>

        {error && (
          <div className={error.includes('sent') ? "bg-green-50 border border-green-200 text-green-600 rounded-md p-3 text-sm" : "bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm"}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-md p-3 text-sm">
            Verification successful! Redirecting you...
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
              Enter the 6-digit verification code
            </label>
            
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                disabled={verifying || success}
                className="text-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-2">
              Code expires in: <span className="font-medium">{formatTime(remainingTime)}</span>
            </p>
          </div>

          <div>
            <button
              onClick={handleVerify}
              disabled={verifying || success || code.length !== 6}
              className={`group relative flex w-full justify-center rounded-md py-2 px-3 text-sm font-semibold text-white ${
                verifying || success || code.length !== 6
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
            >
              {verifying ? "Verifying..." : "Verify Email"}
            </button>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleResendCode}
              disabled={verifying || success || remainingTime > 29 * 60} // Allow resend after 1 minute
              className={`text-sm text-indigo-600 hover:text-indigo-500 ${
                verifying || success || remainingTime > 29 * 60 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Didn&apos;t receive a code? Resend
            </button>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Return to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 