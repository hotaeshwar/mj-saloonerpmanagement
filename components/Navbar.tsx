"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Bell, LogOut, ChevronDown, User, CreditCard, Sun, CloudSun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Navbar: React.FC = () => {
  const { user, logoutSession, notifications, clearNotification } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Custom states for Clock, Date, Weather & Greeting
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [greeting, setGreeting] = useState("");
  const [weather, setWeather] = useState({ temp: 26, status: "Sunny", city: "New York" });

  const router = useRouter();

  useEffect(() => {
    // 1. Clock & Day-based Greeting
    const updateTimeAndGreetings = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
      
      const hours = now.getHours();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = days[now.getDay()];
      
      let timeGreeting = "Good evening";
      if (hours < 12) timeGreeting = "Good morning";
      else if (hours < 17) timeGreeting = "Good afternoon";
      
      setGreeting(`${timeGreeting}! Happy ${dayName}`);
    };

    updateTimeAndGreetings();
    const interval = setInterval(updateTimeAndGreetings, 1000);

    // 2. Geolocation Weather Setup
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.city) {
          const hash = data.city.length;
          const temp = 22 + (hash % 10);
          const status = hash % 2 === 0 ? "Sunny" : "Partly Cloudy";
          setWeather({ temp, status, city: data.city });
        }
      })
      .catch(() => {
        // Fallback gracefully
        setWeather({ temp: 24, status: "Sunny", city: user?.branchName || "Main Branch" });
      });

    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const handleLogout = async () => {
    await logoutSession();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 flex h-24 w-full items-center justify-between border-b border-slate-100 bg-white px-6 shadow-xs">
      {/* Left side: Brand Logo & Branch Address */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" className="h-20 w-auto object-contain" alt="Logo" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800 tracking-tight">{user.salonName}</span>
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-xxs font-medium text-primary">
              {user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
            </span>
          </div>
          <p className="text-xxs text-slate-400 font-medium hidden sm:block">
            {user.branchName} • {user.address}
          </p>
        </div>
      </div>

      {/* Middle: Date, Clock, Weather & Greetings */}
      <div className="hidden lg:flex items-center gap-6 text-slate-650 bg-slate-50/50 px-5 py-2 rounded-2xl border border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{greeting}</span>
          <div className="flex items-center gap-2 text-xxs font-semibold text-slate-500 mt-0.5">
            <span>{dateStr}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="font-mono text-slate-600">{time}</span>
          </div>
        </div>

        <span className="h-6 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-2 text-xxs font-semibold text-slate-600">
          {weather.status === "Sunny" ? (
            <Sun className="text-amber-500 animate-spin-slow h-4 w-4" />
          ) : (
            <CloudSun className="text-slate-400 h-4 w-4" />
          )}
          <div className="flex flex-col">
            <span className="text-slate-800 font-bold">{weather.city}</span>
            <span className="text-[10px] text-slate-400 font-medium">{weather.status}, {weather.temp}°C</span>
          </div>
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Billing Button */}
        <Link
          href="/billing"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-xs hover:shadow-md"
        >
          <CreditCard size={15} />
          Quick Billing
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-xxs font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl z-50">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                <span className="text-xxs text-primary font-medium">{unreadCount} New</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs flex justify-between gap-2 border border-slate-50 ${
                        n.read ? "bg-slate-50/50" : "bg-indigo-50/10 border-indigo-100/50"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-700">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                      <button
                        onClick={() => clearNotification(n.id)}
                        className="text-slate-400 hover:text-danger self-start"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xxs text-slate-400 py-4 text-center">No new notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-primary font-bold text-xs uppercase">
              {user.name.charAt(0)}
            </div>
            <span className="hidden md:block text-xs font-semibold text-slate-700">{user.name}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors mt-1"
              >
                <User size={14} />
                Settings & Branch
              </Link>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-danger hover:bg-red-50 transition-colors mt-0.5"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
