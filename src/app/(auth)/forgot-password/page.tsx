"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { ArrowLeft, MailCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setIsSubmitted(true);
      } else {
        console.error("Failed to request password reset");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email to receive a reset link"
    >
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AuthInput
            label="Email address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <AuthButton type="submit" isLoading={isLoading}>
            Send reset link
          </AuthButton>
          
          <Link 
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
        </form>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-4 py-4"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30 mb-2">
            <MailCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-medium text-white">Check your email</h3>
          <p className="text-gray-400 text-sm">
            We sent a password reset link to <br/>
            <span className="text-white font-medium">{email}</span>
          </p>
          
          <div className="mt-4 w-full">
            <Link href="/login" className="block">
              <AuthButton variant="secondary">
                Return to login
              </AuthButton>
            </Link>
          </div>
        </motion.div>
      )}
    </AuthLayout>
  );
}
