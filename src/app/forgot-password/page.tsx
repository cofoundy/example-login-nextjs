"use client"
import { useState, useEffect } from "react";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PasswordInput } from "@/components/auth/PasswordInput";
import useAuthStore from "@/stores/useAuthStore";

// Define the form schema for email step
const emailSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

// Define the form schema for the OTP step
const otpSchema = z.object({
  code: z.string().length(6, "Please enter the complete 6-digit code"),
});

// Combine schemas for all steps
const formSchema = z.object({
  email: emailSchema.shape.email,
  code: otpSchema.shape.code,
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

// Steps in the password reset flow
enum Step {
  EMAIL = 0,
  OTP = 1,
  NEW_PASSWORD = 2,
  SUCCESS = 3,
}

const ForgotPasswordPage = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.EMAIL);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [remainingTime, setRemainingTime] = useState(30 * 60); // 30 minutes in seconds
  const router = useRouter();
  
  // Use the auth store for Google sign-in
  const { loginWithGoogle } = useAuthStore();
  
  // Initialize form with Zod schema
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      code: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const { setValue, getValues, handleSubmit, formState: { errors } } = methods;
  
  // Update form value when OTP changes
  useEffect(() => {
    setValue("code", code);
  }, [code, setValue]);
  
  // Countdown timer for code expiration
  useEffect(() => {
    if (currentStep >= Step.OTP && currentStep < Step.SUCCESS && remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [remainingTime, currentStep]);
  
  // Format remaining time as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle email step submission
  const handleEmailSubmit = async () => {
    console.log("handleEmailSubmit function called"); // Debug log
    
    try {
      const email = getValues("email");
      
      // Basic validation
      if (!email || !email.includes('@')) {
        console.log("Invalid email format:", email);
        setErrorMessage("Please enter a valid email address");
        return;
      }
      
      console.log("Email validation passed, submitting:", email);
      setIsLoading(true);
      setErrorMessage(null);
      
      // First check if user exists
      console.log("Checking if user exists");
      const checkResponse = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          checkUserExists: true
        }),
      });
      
      console.log("User check response received, status:", checkResponse.status);
      const checkResult = await checkResponse.json();
      console.log("User check result:", checkResult);
      
      if (!checkResponse.ok) {
        throw new Error(checkResult.message || "Failed to process request");
      }
      
      // Save if user exists (will be true or false)
      const userExistsValue = checkResult.userExists || false;
      console.log("Setting userExists to:", userExistsValue);
      setUserExists(userExistsValue);
      
      // Now actually send the verification code
      if (userExistsValue) {
        console.log("User exists, sending verification code");
        const sendCodeResponse = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        console.log("Send code response received, status:", sendCodeResponse.status);
        const sendCodeResult = await sendCodeResponse.json();
        console.log("Send code result:", sendCodeResult);
        
        if (!sendCodeResponse.ok) {
          throw new Error(sendCodeResult.message || "Failed to send verification code");
        }
      } else {
        console.log("User doesn't exist, skipping code sending but advancing flow for security");
      }
      
      // Proceed to OTP step regardless of user existence (for security)
      console.log("Moving to OTP step");
      setCurrentStep(Step.OTP);
    } catch (err) {
      console.error("Error in handleEmailSubmit:", err);
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle OTP verification
  const handleOtpSubmit = () => {
    console.log("handleOtpSubmit called, code:", code);
    
    // Skip actual verification if user doesn't exist (security feature)
    if (userExists === false) {
      console.log("User doesn't exist, pretending verification worked");
      // For security, pretend it worked but will fail at password reset
      setCurrentStep(Step.NEW_PASSWORD);
      return;
    }
    
    if (code.length !== 6) {
      console.log("Invalid code length:", code.length);
      setErrorMessage("Please enter the complete 6-digit code");
      return;
    }
    
    console.log("Code verification passed, moving to password reset step");
    setErrorMessage(null);
    setCurrentStep(Step.NEW_PASSWORD);
  };
  
  // Handle password reset
  const handlePasswordSubmit = async () => {
    // Skip if user doesn't exist (security feature)
    if (userExists === false) {
      setErrorMessage("Invalid or expired code");
      return;
    }
    
    const { email, password } = getValues();
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          code,
          password
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Password reset failed");
      }
      
      setCurrentStep(Step.SUCCESS);
      
      // Redirect to login page after delay
      setTimeout(() => {
        router.push('/auth/login');
        router.refresh();
      }, 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to reset your password");
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Form submitted", { data, currentStep }); // Debug log
    
    switch (currentStep) {
      case Step.EMAIL:
        await handleEmailSubmit();
        break;
      case Step.OTP:
        handleOtpSubmit();
        break;
      case Step.NEW_PASSWORD:
        await handlePasswordSubmit();
        break;
      default:
        break;
    }
  };
  
  const handleResendCode = async () => {
    // Skip if user doesn't exist
    if (userExists === false) {
      // Fake delay for security
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setErrorMessage("A new reset code has been sent to your email");
      }, 1500);
      return;
    }
    
    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      const email = getValues("email");
      const response = await fetch('/api/auth/forgot-password', {
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
      setErrorMessage('A new reset code has been sent to your email');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to resend reset code');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case Step.EMAIL:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${
                  errors.email ? 'ring-red-500' : 'ring-gray-300'
                } placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                placeholder="Email address"
                {...methods.register("email")}
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.email.message?.toString()}
                </span>
              )}
            </div>
            
            <button
              type="button" 
              onClick={handleEmailSubmit}
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-md py-2 px-3 text-sm font-semibold text-white ${
                isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </button>
          </div>
        );
        
      case Step.OTP:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-center text-sm text-gray-600 mb-4">
                We&apos;ve sent a verification code to <span className="font-medium text-indigo-600">{getValues("email")}</span>
              </p>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                  Enter the 6-digit verification code
                </label>
                
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={setCode}
                    disabled={isLoading}
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
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={handleOtpSubmit}
                disabled={isLoading || code.length !== 6}
                className={`group relative flex w-full justify-center rounded-md py-2 px-3 text-sm font-semibold text-white ${
                  isLoading || code.length !== 6 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
                } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
              
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading || remainingTime > 29 * 60} // Allow resend after 1 minute
                className={`text-sm text-indigo-600 hover:text-indigo-500 ${
                  isLoading || remainingTime > 29 * 60 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Didn&apos;t receive a code? Resend
              </button>
              
              <button
                type="button"
                onClick={() => setCurrentStep(Step.EMAIL)}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Use a different email
              </button>
            </div>
          </div>
        );
        
      case Step.NEW_PASSWORD:
        return (
          <div className="space-y-6">
            <PasswordInput 
              label="New Password" 
              confirmLabel="Confirm New Password" 
              showRequirements={true}
            />
            
            <button
              type="button"
              onClick={handlePasswordSubmit}
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-md py-2 px-3 text-sm font-semibold text-white ${
                isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </button>
            
            <button
              type="button"
              onClick={() => setCurrentStep(Step.OTP)}
              className="text-sm text-gray-600 hover:text-gray-500 w-full text-center"
            >
              Back to verification code
            </button>
          </div>
        );
        
      case Step.SUCCESS:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-600 rounded-md p-4">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <p className="text-sm">
                Your password has been reset successfully. You will be redirected to the login page.
              </p>
            </div>
            
            <Link href="/auth/login" className="group relative flex w-full justify-center rounded-md py-2 px-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Go to Login
            </Link>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {currentStep === Step.SUCCESS
              ? "Password Reset Complete"
              : "Forgot your password?"}
          </h2>
          {currentStep === Step.EMAIL && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email and we&apos;ll send you a code to reset your password
            </p>
          )}
        </div>
        
        {/* Error message */}
        {errorMessage && (
          <div className={errorMessage.includes('sent') ? "bg-green-50 border border-green-200 text-green-600 rounded-md p-3 text-sm" : "bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm"}>
            {errorMessage}
          </div>
        )}
        
        {/* Form */}
        <FormProvider {...methods}>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}
            
            {currentStep !== Step.SUCCESS && (
              <div className="text-sm text-center">
                <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Back to login
                </Link>
              </div>
            )}
          </form>
        </FormProvider>
        
        {currentStep === Step.EMAIL && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-50 px-2 text-gray-500">Or sign in with</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => loginWithGoogle()}
                disabled={isLoading}
                className={`flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                type="button"
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
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 