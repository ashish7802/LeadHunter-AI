"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordMatch = password !== "" && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordMatch || password.length < 8) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        const data = await res.json();
        console.error("Failed to reset password:", data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6">
        <p className="text-red-400 text-sm">Invalid or missing reset token.</p>
        <AuthButton 
          variant="secondary" 
          className="mt-6" 
          onClick={() => router.push("/forgot-password")}
        >
          Request new link
        </AuthButton>
      </div>
    );
  }

  return (
    <>
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AuthInput
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={password.length > 0 && password.length < 8 ? "Must be at least 8 characters" : undefined}
          />
          <AuthInput
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={confirmPassword.length > 0 && !passwordMatch ? "Passwords do not match" : undefined}
          />

          <AuthButton 
            type="submit" 
            isLoading={isLoading} 
            disabled={!passwordMatch || password.length < 8}
          >
            Reset password
          </AuthButton>
        </form>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-4 py-4"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30 mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-medium text-white">Password reset complete</h3>
          <p className="text-gray-400 text-sm">
            Your password has been successfully updated. Redirecting you to login...
          </p>
        </motion.div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter your new password below"
    >
      <Suspense fallback={<div className="h-40 flex items-center justify-center"><p className="text-gray-500 animate-pulse">Loading...</p></div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
