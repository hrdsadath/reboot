'use client';

import React, { useState } from 'react';
import { Play, Lock, CheckCircle2, Award, Tv, Smartphone, Send, Sparkles, ChevronRight } from 'lucide-react';

export default function GameCard({ game, onStart, onSubmit, isSubmitted }) {
  const [selectedOption, setSelectedOption] = useState(null); // 'stage' | 'app'
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTrackBadgeColor = (track) => {
    switch (track) {
      case 'Tech': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Creative': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Marketing': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'Operating': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'IPR & Research': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (game.gameNumber === 1 && !selectedOption) {
      alert('Please choose either "On Stage Pitch" or "On App Submission"');
      return;
    }
    setIsSubmitting(true);
    await onSubmit(game.gameNumber, selectedOption, submissionText, submissionUrl);
    setIsSubmitting(false);
  };

  return (
    <div className={`glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden transition-all border ${
      game.status === 'active' ? 'border-indigo-500/40 glow-indigo' : 'border-slate-800'
    }`}>
      
      {/* Top Bar: Game Number & Track Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 font-extrabold flex items-center justify-center text-sm border border-slate-700">
            #{game.gameNumber}
          </span>
          <span className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full border ${getTrackBadgeColor(game.targetLeadTrack)}`}>
            {game.targetLeadTrack} Lead Track
          </span>
        </div>

        {/* Status Indicator */}
        <div>
          {isSubmitted ? (
            <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          ) : game.status === 'active' ? (
            <span className="flex items-center gap-1.5 text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Active Challenge
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5" /> Locked
            </span>
          )}
        </div>
      </div>

      {/* Game Title & Description */}
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{game.title}</h3>
      <p className="text-sm text-slate-300 mb-6 leading-relaxed">{game.description}</p>

      {/* SPECIAL GAME 1 OPTIONS: STAGE (+20 PTS) VS APP (+5 PTS) */}
      {game.gameNumber === 1 && !isSubmitted && game.status === 'active' && (
        <div className="mb-6 space-y-3">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
            Select Pitch Format:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Option A: On Stage */}
            <div
              onClick={() => setSelectedOption('stage')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                selectedOption === 'stage'
                  ? 'bg-indigo-600/20 border-indigo-500 glow-indigo'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Tv className="w-4 h-4" /> On Stage Pitch
                </div>
                <span className="text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  +20 Pts
                </span>
              </div>
              <p className="text-xs text-slate-400">Present live in front of the IEDC evaluation jury. Highest courage reward!</p>
            </div>

            {/* Option B: On App */}
            <div
              onClick={() => setSelectedOption('app')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                selectedOption === 'app'
                  ? 'bg-purple-600/20 border-purple-500 glow-indigo'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Smartphone className="w-4 h-4" /> On App Submission
                </div>
                <span className="text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full">
                  +5 Pts
                </span>
              </div>
              <p className="text-xs text-slate-400">Submit a text/video link summary directly via the app.</p>
            </div>

          </div>
        </div>
      )}

      {/* Task Submission Form */}
      {game.status === 'active' && !isSubmitted && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={3}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder={
                game.gameNumber === 1
                  ? 'Write a short intro summary (or notes for your stage pitch)...'
                  : `Enter your solution/concept details for ${game.title}...`
              }
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <input
              type="url"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              placeholder="Optional submission link (Google Drive / GitHub / Figma)..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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
      )}

      {/* Submitted Banner */}
      {isSubmitted && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-bold text-emerald-300">Task Completed</div>
              <div className="text-xs text-slate-400">Submission received & points awarded.</div>
            </div>
          </div>
          <Award className="w-6 h-6 text-amber-400" />
        </div>
      )}

    </div>
  );
}
