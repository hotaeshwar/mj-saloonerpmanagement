"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useLogin } from "../../firebase/hooks";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Loader } from "../../components/Loader";
import { toast } from "react-hot-toast";

const loginSchema = zod.object({
  email: zod.string().min(1, "Email is required").email("Invalid email format"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading: loginLoading } = useLogin();
  const { loginSession } = useAuth();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: LoginFormValues) => {
    try {
      const admin = await login(data.email, data.password);
      loginSession(admin);
    } catch (err: any) {
      console.error("Login Page Submit Error:", err);
      toast.error(err.message || "An unexpected error occurred during login routing.");
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-pulse" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-100 p-8 sm:p-10 rounded-2xl shadow-lg flex flex-col relative z-10">
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <img src="/logo.png" className="h-44 w-auto object-contain mb-2" alt="Logo" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            <span>MJ-creationERP</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xs">
            Access your dashboard to manage appointments, billing, and academy records.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="email"
                placeholder="admin@erpsaloon.com"
                {...registerLogin("email")}
                className={`w-full pl-9 pr-4 py-2.5 text-sm bg-white border ${
                  loginErrors.email ? "border-danger focus:border-danger" : "border-slate-200 focus:border-primary"
                } rounded-xl focus:outline-hidden text-slate-800 transition-colors`}
              />
            </div>
            {loginErrors.email && (
              <p className="text-xxs font-medium text-danger">{loginErrors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...registerLogin("password")}
                className={`w-full pl-9 pr-10 py-2.5 text-sm bg-white border ${
                  loginErrors.password ? "border-danger focus:border-danger" : "border-slate-200 focus:border-primary"
                } rounded-xl focus:outline-hidden text-slate-800 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {loginErrors.password && (
              <p className="text-xxs font-medium text-danger">{loginErrors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full flex items-center justify-center py-2.5 bg-primary hover:opacity-40 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-xs transition-all duration-300"
          >
            {loginLoading ? <Loader size="sm" className="border-t-white" /> : "Sign In"}
          </button>

          <div className="pt-2" />
        </form>
      </div>
    </main>
  );
}
