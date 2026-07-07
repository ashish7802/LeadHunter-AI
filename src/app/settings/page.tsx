"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, Laptop, Key, Loader2, Target, LogOut, Save } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  
  // Profile state
  const [name, setName] = useState("John Doe");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => setIsSavingProfile(false), 1000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative">
      {/* Background decorations */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-bold tracking-tight">LeadHunter <span className="text-blue-400">AI</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-300">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              Admin
            </div>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <h1 className="text-2xl font-semibold mb-6">Settings</h1>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "profile" 
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "security" 
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Shield className="w-4 h-4" />
              Security
            </button>
          </nav>
        </aside>

        {/* Main Panel */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "profile" && (
              <div className="flex flex-col gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold mb-1">Profile Information</h2>
                  <p className="text-sm text-gray-400 mb-6">Update your personal details.</p>
                  
                  <form onSubmit={handleSaveProfile} className="max-w-md flex flex-col gap-5">
                    <AuthInput
                      label="Full Name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <AuthInput
                      label="Email Address"
                      type="email"
                      value="john@example.com"
                      disabled
                      title="Email cannot be changed"
                    />
                    
                    <div className="pt-2">
                      <AuthButton type="submit" isLoading={isSavingProfile} icon={<Save className="w-4 h-4" />}>
                        Save changes
                      </AuthButton>
                    </div>
                  </form>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold mb-1">Role & Permissions</h2>
                  <p className="text-sm text-gray-400 mb-4">Your current access level in LeadHunter AI.</p>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 inline-flex">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">Administrator</div>
                      <div className="text-xs text-gray-400">Full access to all features</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="flex flex-col gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold mb-1">Change Password</h2>
                  <p className="text-sm text-gray-400 mb-6">Ensure your account is using a long, random password.</p>
                  
                  <form onSubmit={handleSavePassword} className="max-w-md flex flex-col gap-5">
                    <AuthInput
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <AuthInput
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    
                    <div className="pt-2">
                      <AuthButton type="submit" isLoading={isSavingPassword} icon={<Key className="w-4 h-4" />}>
                        Update password
                      </AuthButton>
                    </div>
                  </form>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold mb-1">Active Sessions</h2>
                  <p className="text-sm text-gray-400 mb-6">Manage and log out your active sessions on other browsers and devices.</p>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
                      <Laptop className="w-8 h-8 text-blue-400" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Mac OS • Chrome</div>
                        <div className="text-xs text-gray-400 flex gap-2">
                          <span>San Francisco, US</span>
                          <span>•</span>
                          <span className="text-green-400 font-medium">Active now</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-transparent opacity-70">
                      <Laptop className="w-8 h-8 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Windows • Firefox</div>
                        <div className="text-xs text-gray-400 flex gap-2">
                          <span>New York, US</span>
                          <span>•</span>
                          <span>Last active 2 days ago</span>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10">
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
