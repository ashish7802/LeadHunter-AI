"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { Check, X } from "lucide-react";
import { clsx } from "clsx";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordRules = [
    { label: "At least 8 characters", regex: /.{8,}/ },
    { label: "One uppercase letter", regex: /[A-Z]/ },
    { label: "One lowercase letter", regex: /[a-z]/ },
    { label: "One number", regex: /[0-9]/ },
    { label: "One special character", regex: /[^A-Za-z0-9]/ },
  ];

  const getPasswordStrength = () => {
    let score = 0;
    passwordRules.forEach(rule => {
      if (rule.regex.test(password)) score++;
    });
    return score;
  };

  const strengthScore = getPasswordStrength();
  
  const strengthColor = 
    strengthScore <= 2 ? "bg-red-500" :
    strengthScore <= 4 ? "bg-yellow-500" :
    "bg-green-500";

  const passwordMatch = password !== "" && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strengthScore < 5 || !passwordMatch) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        // TODO: show success toast (check email)
        router.push("/login");
      } else {
        // TODO: show error toast
        console.error("Registration failed", data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Get started with LeadHunter AI today"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <AuthInput
          label="Email address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <div className="flex flex-col gap-2">
          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {/* Password Strength Meter */}
          {password.length > 0 && (
            <div className="flex flex-col gap-2 mt-2 bg-black/20 p-3 rounded-xl border border-white/5">
              <div className="flex gap-1 h-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={clsx(
                      "flex-1 rounded-full transition-colors duration-300",
                      strengthScore >= level ? strengthColor : "bg-white/10"
                    )}
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-2 mt-1">
                {passwordRules.map((rule, idx) => {
                  const passed = rule.regex.test(password);
                  return (
                    <div key={idx} className="flex items-center gap-1.5 text-xs">
                      {passed ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-gray-500" />
                      )}
                      <span className={passed ? "text-gray-300" : "text-gray-500"}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword.length > 0 && (
            <p className={clsx("text-xs mt-1", passwordMatch ? "text-green-400" : "text-red-400")}>
              {passwordMatch ? "Passwords match" : "Passwords do not match"}
            </p>
          )}
        </div>

        <AuthButton 
          type="submit" 
          className="mt-2"
          disabled={strengthScore < 5 || !passwordMatch}
          isLoading={isLoading}
        >
          Create account
        </AuthButton>
      </form>

      <p className="text-center mt-6 text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-white hover:text-blue-400 transition-colors font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
