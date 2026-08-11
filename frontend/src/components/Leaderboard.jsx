'use client';

import React, { useState } from 'react';
import { Award, Trophy, Users, Star, Crown, Shield } from 'lucide-react';

export default function Leaderboard({ candidates = [], groups = [] }) {
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'teams'

  const sortedCandidates = [...candidates].sort((a, b) => (b.individualPoints || 0) - (a.individualPoints || 0));
  const sortedGroups = [...groups].sort((a, b) => (b.totalTeamPoints || 0) - (a.totalTeamPoints || 0));

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">IEDC Selection Leaderboard</h3>
            <p className="text-xs text-slate-400">Live points tracking across 6 gamified challenges</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'individual'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Individual Top 10
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'teams'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Group Standings
          </button>
        </div>
      </div>

      {/* INDIVIDUAL CANDIDATES TAB */}
      {activeTab === 'individual' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Target Track</th>
                <th className="px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">
                    No candidate scores recorded yet. Register and complete Game 1!
                  </td>
                </tr>
              ) : (
                sortedCandidates.slice(0, 10).map((cand, idx) => (
                  <tr key={cand._id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold">
                      {idx === 0 ? (
                        <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xs">🥇 1</span>
                      ) : idx === 1 ? (
                        <span className="w-7 h-7 rounded-xl bg-slate-300/20 text-slate-200 border border-slate-400/40 flex items-center justify-center text-xs">🥈 2</span>
                      ) : idx === 2 ? (
                        <span className="w-7 h-7 rounded-xl bg-amber-700/20 text-amber-500 border border-amber-600/40 flex items-center justify-center text-xs">🥉 3</span>
                      ) : (
                        <span className="text-slate-400 font-mono">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        {cand.fullName}
                        {cand.role === 'leader' && (
                          <Crown className="w-3.5 h-3.5 text-amber-400" title="Team Leader" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{cand.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-300">
                      Group #{cand.groupNumber || '1'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                        {cand.preferredLeadTrack || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-amber-400 text-base">
                      {cand.individualPoints || 0} pts
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TEAM STANDINGS TAB */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedGroups.map((grp, idx) => (
            <div key={grp._id || idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Group {grp.groupNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#{idx + 1} Place</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{grp.groupName}</h4>
                <p className="text-xs text-slate-400 mb-3">Leader: {grp.leaderName || 'To be assigned'}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {grp.members ? grp.members.length : 0} members
                </div>
                <div className="text-sm font-black text-emerald-400">
                  {grp.totalTeamPoints || 0} Pts
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
