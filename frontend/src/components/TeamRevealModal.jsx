'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, ShieldCheck, Sparkles, X, Crown, Phone, Mail } from 'lucide-react';

export default function TeamRevealModal({ group, onClose }) {
  useEffect(() => {
    // Launch festive confetti burst on reveal!
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366F1', '#10B981', '#F59E0B', '#EC4899']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366F1', '#10B981', '#F59E0B', '#EC4899']
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  if (!group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 glow-indigo shadow-2xl overflow-hidden">
        
        {/* Shimmer effect background */}
        <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-30"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-xl mb-3 animate-bounce">
            <Trophy className="w-8 h-8 text-slate-950" />
          </div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-2">
            🎉 GAME 2 COMPLETED • TEAM REVEALED!
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            You Belong to <span className="text-gradient-gold">Group {group.groupNumber}</span>
          </h2>
          <p className="text-sm text-slate-300 font-medium mt-1">{group.groupName}</p>
        </div>

        {/* Leader Highlight Card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Group Leader</span>
                <h4 className="text-base font-bold text-white">{group.leaderName || 'To be assigned'}</h4>
              </div>
            </div>
            <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
              Group #{group.groupNumber}
            </span>
          </div>
        </div>

        {/* Team Members Roster */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Teammates ({group.members ? group.members.length : 0} Candidates)
            </h3>
            <span className="text-xs text-indigo-400 font-medium">Round-Robin Team</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {group.members && group.members.map((member, idx) => (
              <div key={member._id || idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{member.fullName}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{member.preferredLeadTrack} Track</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{member.individualPoints || 0} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Enter Team Hub & Begin Games 3 to 6!</span>
        </button>

      </div>
    </div>
  );
}
