'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ShieldCheck, Sparkles, X, Crown, Users } from 'lucide-react';

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

  const leaderDisplayName = group.leader ? (typeof group.leader === 'object' ? group.leader.name : group.leader) : group.leaderName || 'Assigned by Admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 glow-indigo shadow-2xl overflow-hidden">
        
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
            🎉 GAME 2 COMPLETED • GROUP REVEALED!
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Assigned to <span className="text-gradient-gold">{group.name || `Group ${group.groupNumber}`}</span>
          </h2>
        </div>

        {/* Volunteer Leader Highlight Card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Volunteer Leader / Judge</span>
              <h4 className="text-lg font-black text-white">{leaderDisplayName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Assigned to approve activity points for {group.name || `Group ${group.groupNumber}`}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Continue to Selection Challenges 3 to 6!</span>
        </button>

      </div>
    </div>
  );
}
