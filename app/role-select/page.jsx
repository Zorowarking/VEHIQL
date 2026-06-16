"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useApp } from "@/components/AppContext";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, User, Store, KeyRound, ArrowRight } from "lucide-react";
import { toast } from "sonner";

function RoleSelectContent() {
  const { user, isLoaded } = useUser();
  const { dbUser, registerUserRole, appLoading } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hidden admin panel activation state
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [adminPasskey, setAdminPasskey] = useState("");
  const [showPasskeyField, setShowPasskeyField] = useState(false);

  // Check query parameters for override (e.g. ?admin=true or ?passkey=...)
  useEffect(() => {
    const adminParam = searchParams.get("admin") === "true";
    const passkeyParam = searchParams.get("passkey");
    if (adminParam || passkeyParam) {
      setShowAdminOption(true);
      if (passkeyParam) {
        setShowPasskeyField(true);
        setAdminPasskey(passkeyParam);
      }
    }
  }, [searchParams]);

  // If user already has a registered role in AppContext, redirect them
  useEffect(() => {
    const isOverride = searchParams.get("admin") === "true" || searchParams.get("force") === "true" || !!searchParams.get("passkey");
    if (isOverride) return;

    if (dbUser && !appLoading) {
      if (dbUser.role === "admin") {
        router.push("/admin");
      } else if (dbUser.role === "seller") {
        router.push("/seller");
      } else {
        router.push("/");
      }
    }
  }, [dbUser, appLoading, router, searchParams]);

  // Click handler to reveal secret admin login
  const handleHeaderClick = () => {
    const nextCount = adminClickCount + 1;
    setAdminClickCount(nextCount);
    if (nextCount >= 5) {
      setShowAdminOption(true);
      setShowPasskeyField(true);
      toast.success("Secret Admin portal unlocked! Enter credentials below.");
      setAdminClickCount(0);
    }
  };

  const handleRoleSelection = async (role) => {
    if (role === "admin") {
      // Validate secret admin key
      const correctKey = process.env.NEXT_PUBLIC_ADMIN_PASSKEY || "admin123";
      if (adminPasskey !== correctKey) {
        toast.error("Invalid Admin Passkey. Access Denied.");
        return;
      }
    }

    toast.loading(`Registering profile as ${role}...`);
    const success = await registerUserRole(role);
    toast.dismiss();
    if (success) {
      toast.success(`Welcome to VEHIQL! Registered as ${role}`);
    }
  };

  if (!isLoaded || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-slate-400">Loading Account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur text-center p-8">
          <CardHeader>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Authentication Required</CardTitle>
            <CardDescription className="mt-2 text-slate-500">
              Please sign in to select a platform role and access the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <Button onClick={() => router.push("/sign-in")} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 font-semibold">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950/40 py-16 px-4 flex items-center justify-center">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        {/* Title */}
        <div className="space-y-3 cursor-default select-none">
          <div onClick={handleHeaderClick} className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl shadow-lg shadow-indigo-600/20">
            V
          </div>
          <h1 onClick={handleHeaderClick} className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Choose Your VEHIQL Experience
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Welcome, <span className="font-bold text-slate-800 dark:text-slate-200">{user.fullName || user.username}</span>. Select how you would like to participate in the marketplace.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch max-w-2xl mx-auto">
          
          {/* Buyer Role */}
          <div 
            onClick={() => handleRoleSelection("buyer")}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between text-left space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  I am a Buyer
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Browse verified listings, filter vehicles by brand or type, save favorites, and connect directly with sellers to rent/purchase.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <span>Enter Buyer Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Seller Role */}
          <div 
            onClick={() => handleRoleSelection("seller")}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between text-left space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  I am a Seller
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  For dealerships, showrooms, and companies. List inventory, upload high-quality specs, manage customer inquiries, and track sales.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <span>Enter Seller Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Hidden Admin Section */}
        {showAdminOption && (
          <div className="max-w-md mx-auto mt-10 p-6 bg-slate-900/90 dark:bg-slate-900 border border-slate-850 rounded-3xl shadow-xl text-left space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>VEHIQL Administrator Portal Gateway</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              You have uncovered the administrative registration gate. Please enter the secure administrator passkey to assign this user role.
            </p>

            <div className="space-y-2">
              <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Security Passkey</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="Enter admin passcode"
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-white rounded-xl focus:border-indigo-500"
                  />
                </div>
                <Button 
                  onClick={() => handleRoleSelection("admin")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4"
                >
                  Verify
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subtle hint */}
        <p className="text-[10px] text-slate-400 dark:text-slate-600">
          VEHIQL &bull; Secure Multi-Role Portal &bull; Double click logo for Staff Access
        </p>

      </div>
    </div>
  );
}

export default function RoleSelectPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-sm font-semibold">Loading portal...</div>}>
      <RoleSelectContent />
    </Suspense>
  );
}
