"use client";

import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "social";
  icon?: React.ReactNode;
}

export function AuthButton({ 
  children, 
  isLoading, 
  variant = "primary", 
  icon,
  className,
  ...props 
}: AuthButtonProps) {
  return (
    <button
      disabled={isLoading || props.disabled}
      className={cn(
        "relative flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] border border-blue-500/50",
        variant === "secondary" && "bg-white/5 text-white hover:bg-white/10 border border-white/10",
        variant === "social" && "bg-white/5 text-white hover:bg-white/10 border border-white/10",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
