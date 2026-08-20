'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Rocket, Sparkles, ArrowRight, Trophy, Users, CheckCircle2, Zap, Target, Cpu, Palette, Megaphone, Settings, Search, Globe, ChevronRight, ShieldCheck, Award } from 'lucide-react';

export default function LandingPage() {
  const leadTracks = [
    {
      number: 1,
      title: 'Game 1: Icebreaker Spotlight Pitch',
      category: 'Self Introduction & Public Pitch',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
      badge: '+20 PTS On Stage / +5 PTS On App',
      description: 'Introduce yourself to the cohort. Choose "On Stage" (+20 PTS pending Admin approval) or "On App" (+5 PTS instant points).'
    },
    {
      number: 2,
      title: 'Game 2: College Campus Innovation Hub Pitch',
      category: 'Campus Innovation Track',
      icon: Cpu,
      color: 'from-indigo-500 to-cyan-500',
      badge: '+30 Personal PTS',
      description: 'Describe your college campus and share 2 innovative ideas to improve student developer culture and campus startup ecosystem! (Dummy testing challenge).'
    },
    {
      number: 3,
      title: 'Game 3: Brand & Identity',
      category: 'Creative Lead Role',
      icon: Palette,
      color: 'from-purple-500 to-pink-500',
      badge: '+50 Team PTS',
      description: 'Craft compelling brand visual identities, pitch decks, and creative multimedia assets.'
    },
    {
      number: 4,
      title: 'Game 4: Viral Surge',
      category: 'Marketing Lead Role',
      icon: Megaphone,
      color: 'from-emerald-500 to-teal-500',
      badge: '+50 Team PTS',
      description: 'Design viral marketing campaigns, growth loops, and social media engagement strategies.'
    },
    {
      number: 5,
      title: 'Game 5: Crisis & Execution Ops',
      category: 'Operating Lead Role',
      icon: Settings,
      color: 'from-blue-500 to-indigo-600',
      badge: '+50 Team PTS',
      description: 'Manage event operations, emergency logistics, and high-pressure organizational execution.'
    },
    {
      number: 6,
      title: 'Game 6: Patents & Deep Research',
      category: 'IPR & Research Lead Role',
      icon: Search,
      color: 'from-rose-500 to-red-600',
      badge: '+50 Personal PTS',
      description: 'Analyze deep tech patents, conduct market research, and draft intellectual property proposals.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        
        {/* Ambient Gradient Glow Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-pink-500/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-400 text-xs font-extrabold uppercase tracking-widest shadow-xl animate-fadeIn">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Official IEDC Selection Drive 2026</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Gamified Innovation & <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Leadership Selection Drive
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Step into the arena, complete 6 specialized lead challenges, collaborate with 8 round-robin teams, and earn points to claim your position in IEDC!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-base shadow-2xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Register / Sign In Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Explore Round-Robin Groups</span>
            </Link>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12">
            <div className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="text-2xl font-black text-indigo-400">6</div>
              <div className="text-xs text-slate-400 mt-0.5">Lead Challenges</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="text-2xl font-black text-purple-400">8</div>
              <div className="text-xs text-slate-400 mt-0.5">Round-Robin Groups</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="text-2xl font-black text-amber-400">200+</div>
              <div className="text-xs text-slate-400 mt-0.5">Candidate Pool</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Fair Leader Scoring</div>
            </div>
          </div>

        </div>
      </section>

      {/* 6 LEAD TRACKS DISPLAY SECTION */}
      <section className="py-16 md:py-24 border-t border-slate-800/80 bg-slate-950/50 relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              6 Specialized Selection Challenges
            </h2>
            <p className="text-sm text-slate-400">
              Every candidate participates in 6 progressive lead tracks designed to evaluate creativity, technical execution, leadership, and crisis management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadTracks.map((track) => {
              const IconComponent = track.icon;
              return (
                <div
                  key={track.number}
                  className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-6"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${track.color} text-slate-950 font-black flex items-center justify-center shadow-lg`}>
                        <IconComponent className="w-6 h-6" />
                      </div>

                      <span className="text-xs font-bold bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1 rounded-full">
                        {track.badge}
                      </span>
                    </div>

                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                      Challenge #{track.number} • {track.category}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{track.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{track.description}</p>
                  </div>

                  <Link
                    href="/login"
                    className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Challenge Arena</span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 py-8 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 <strong>IEDC Executive Cell</strong>. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">Candidate Login</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
