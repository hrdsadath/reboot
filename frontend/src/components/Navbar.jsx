'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Rocket, ShieldAlert, Users, Award, LogOut, User, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('iedc_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('iedc_token');
      localStorage.removeItem('iedc_user');
      setCurrentUser(null);
      router.push('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Rocket className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-gradient-iedc">IEDC SELECTION</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                2026 Drive
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Innovation & Entrepreneurship Development Cell</p>
          </div>
        </Link>

        {/* Navigation Portals */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              pathname === '/dashboard'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Student Arena</span>
          </Link>

          <Link
            href="/leader"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              pathname === '/leader'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Leader Portal</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              pathname === '/admin'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Console</span>
          </Link>
        </div>

        {/* User Info / Auth State */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-200">{currentUser.fullName}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" /> {currentUser.individualPoints || 0} pts
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Student Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
