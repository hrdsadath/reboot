'use client';

import React, { useState } from 'react';
import { Lock, CheckCircle2, Award, Tv, Smartphone, Send, Sparkles, KeyRound, Clock, ShieldAlert } from 'lucide-react';

export default function GameCard({
  game,
  onSubmit,
  isSubmitted,
  isLocked,
  isUnlockPending,
  canRequestUnlock,
  onRequestUnlock
}) {
  const [selectedOption, setSelectedOption] = useState(null); // 'On Stage' | 'On App'
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const isGame1 = game.gameNumber === 1 || (game.name && game.name.includes('Game 1'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGame1 && !selectedOption) {
      alert('Please select your introduction format: "On Stage" (+20 Pts pending Admin approval) or "On App" (+5 Pts automatic).');
      return;
    }
    setIsSubmitting(true);
    await onSubmit(game.gameNumber || 1, selectedOption, submissionText, submissionUrl);
    setIsSubmitting(false);
  };

  const handleRequestUnlockClick = async () => {
    setIsRequesting(true);
    await onRequestUnlock(game.gameNumber);
    setIsRequesting(false);
  };

  // RENDER LOCKED GAME CARD STATE
  if (isLocked) {
    return (
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all border border-slate-800 bg-slate-950/80 flex flex-col justify-between space-y-6">
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-slate-500 font-extrabold flex items-center justify-center text-sm border border-slate-800">
                #{game.gameNumber || '2'}
              </span>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full border bg-slate-900 text-slate-400 border-slate-800">
                {game.category || 'Lead Track'}
              </span>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800 px-3 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Locked Game
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-bold text-slate-300 mb-2 tracking-tight">
            {game.name || `Challenge #${game.gameNumber}`}
          </h3>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            {game.description || 'This lead track is locked by Admin for your Group.'}
          </p>
        </div>

        {/* Locking Action / Status Panel */}
        <div className="space-y-3">
          {isUnlockPending ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
              <div>
                <div>Unlock Request Pending Admin Approval</div>
                <div className="text-[11px] font-normal text-amber-300/80">Admin will unlock Game #{game.gameNumber} for your Group shortly!</div>
              </div>
            </div>
          ) : canRequestUnlock ? (
            <button
              onClick={handleRequestUnlockClick}
              disabled={isRequesting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isRequesting ? (
                <span>Sending Request...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Request Admin to Unlock Game #{game.gameNumber} for Group</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-slate-600" />
              <span>Complete Game #{game.gameNumber - 1} first to request unlock</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER UNLOCKED GAME CARD STATE
  return (
    <div className="glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden transition-all border border-indigo-500/40 glow-indigo flex flex-col justify-between">
      
      <div>
        {/* Top Bar: Game Number & Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 font-extrabold flex items-center justify-center text-sm border border-slate-700">
              #{game.gameNumber || '1'}
            </span>
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full border bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              {game.category || 'Creative'} Lead Track
            </span>
          </div>

          {/* Status Indicator */}
          <div>
            {isSubmitted ? (
              <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> Active Challenge
              </span>
            )}
          </div>
        </div>

        {/* Game Title & Description */}
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          {isGame1 ? 'Game 1: Icebreaker Spotlight Pitch' : (game.name || `Challenge #${game.gameNumber}`)}
        </h3>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {isGame1
            ? 'Introduce yourself to the IEDC community! Pitch live on stage for +20 PTS (requires Admin stage verification) or submit on app for +5 PTS automatically.'
            : (game.description || 'Complete this challenge to earn personal & team lead points.')}
        </p>

        {/* SPECIAL GAME 1 OPTIONS: ON STAGE (+20 PTS) VS ON APP (+5 PTS) */}
        {isGame1 && !isSubmitted && (
          <div className="mb-6 space-y-3">
            <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
              Select Intro Format:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: On Stage */}
              <div
                onClick={() => setSelectedOption('On Stage')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  selectedOption === 'On Stage'
                    ? 'bg-amber-500/20 border-amber-500 glow-amber'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Tv className="w-4 h-4" /> Option 1: On Stage
                  </div>
                  <span className="text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    +20 PTS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pitch live on stage! Admin will verify & approve +20 PTS when you perform.
                </p>
              </div>

              {/* Option 2: On App */}
              <div
                onClick={() => setSelectedOption('On App')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  selectedOption === 'On App'
                    ? 'bg-purple-600/20 border-purple-500 glow-indigo'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Smartphone className="w-4 h-4" /> Option 2: On App
                  </div>
                  <span className="text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                    +5 PTS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Submit a text introduction directly on the app. Earn +5 PTS automatically!
                </p>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Task Submission Form */}
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={3}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder={
                isGame1
                  ? 'Write your introduction pitch summary...'
                  : `Enter your solution details for ${game.name || 'Challenge'}...`
              }
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Submitting Task...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Task & Claim Points</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-bold text-emerald-300">Task Completed</div>
              <div className="text-xs text-slate-400">Submission received for evaluation.</div>
            </div>
          </div>
          <Award className="w-6 h-6 text-amber-400" />
        </div>
      )}

    </div>
  );
}
