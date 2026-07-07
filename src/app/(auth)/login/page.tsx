"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { Github, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        // TODO: show toast error
        console.error("Login failed", result.error);
        setIsLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your details to access your account"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthInput
          label="Email address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="flex items-center justify-between mt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-4 h-4 rounded border border-white/20 bg-white/5 group-hover:border-blue-500/50 transition-colors">
              <input 
                type="checkbox" 
                className="absolute opacity-0 w-full h-full cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              {rememberMe && (
                <svg className="w-3 h-3 text-blue-500 pointer-events-none" viewBox="0 0 14 14" fill="none">
                  <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-400 select-none group-hover:text-gray-300 transition-colors">Remember me</span>
          </label>
          <Link 
            href="/forgot-password"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <AuthButton type="submit" isLoading={isLoading}>
          Sign in
        </AuthButton>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Or continue with</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AuthButton 
          variant="social" 
          icon={<Github className="w-4 h-4" />}
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          type="button"
        >
          GitHub
        </AuthButton>
        <AuthButton variant="social" icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        }
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        type="button"
        >
          Google
        </AuthButton>
      </div>

      <p className="text-center mt-8 text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-white hover:text-blue-400 transition-colors font-medium">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
