'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { ShieldAlert, Users, Trophy, Lock, Unlock, Sparkles, Award, Database, RefreshCw, AlertTriangle, ArrowLeft, Link as LinkIcon, Copy, CheckCircle2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // Leader Invite Link Generator State
  const [selectedInviteGroup, setSelectedInviteGroup] = useState('Group 1');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('iedc_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setCurrentUser(u);
          if (u && u.role === 'admin') {
            setIsAdminAuthorized(true);
            fetchAdminData();
          } else {
            setIsAdminAuthorized(false);
            setLoading(false);
          }
        } catch (e) {
          setIsAdminAuthorized(false);
          setLoading(false);
        }
      } else {
        setIsAdminAuthorized(false);
        setLoading(false);
      }
    }
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);

    const statsRes = await apiRequest('/admin/dashboard');
    if (statsRes.success && statsRes.stats) {
      setStats(statsRes.stats);
      if (statsRes.stats.groups && statsRes.stats.groups.length > 0) {
        setIsRevealed(statsRes.stats.groups[0].visibleAfterGame === 0);
      }
    }

    const gamesRes = await apiRequest('/games');
    if (gamesRes.success) {
      setGames(gamesRes.games || []);
    }

    setLoading(false);
  };

  const handleToggleReveal = async () => {
    const nextGameNum = isRevealed ? 2 : 0; // 0 = reveal immediately
    const res = await apiRequest('/groups/toggle-reveal', {
      method: 'POST',
      body: JSON.stringify({ visibleAfterGame: nextGameNum })
    });

    if (res.success) {
      setIsRevealed(!isRevealed);
      setActionMsg(res.message);
      setTimeout(() => setActionMsg(''), 3000);
      fetchAdminData();
    }
  };

  const handleCopyLeaderInvite = () => {
    const inviteUrl = `${window.location.origin}/leader/join?group=${encodeURIComponent(selectedInviteGroup)}&role=leader`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSeedData = async () => {
    const res = await apiRequest('/admin/seed', { method: 'POST' });
    if (res.success) {
      setActionMsg(res.message);
      setTimeout(() => setActionMsg(''), 3500);
      fetchAdminData();
    }
  };

  if (!loading && !isAdminAuthorized) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-red-500/30 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">403 - Access Denied</h2>
            <p className="text-sm text-slate-300">
              The Admin Executive Console is strictly restricted to administrator accounts.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 font-black flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">IEDC Admin Executive Console</h1>
                <span className="text-xs uppercase font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Manage MongoDB Atlas dataset, game visibility & volunteer judge links</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <button
              onClick={handleSeedData}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>Seed Atlas Candidates</span>
            </button>

            <button
              onClick={fetchAdminData}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action Alert */}
        {actionMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* ADMIN LEADER INVITE LINK GENERATOR */}
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 glow-amber">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Volunteer Judge Invitation
              </span>
              <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-amber-400" />
                Share Volunteer Leader / Judge Invitation Link
              </h2>
              <p className="text-xs text-slate-400">
                Only Admins can generate & share access links for volunteer judges to evaluate tasks and approve points.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <select
              value={selectedInviteGroup}
              onChange={(e) => setSelectedInviteGroup(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={`Group ${i + 1}`}>Assign to Group #{i + 1}</option>
              ))}
            </select>

            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/leader/join?group=${encodeURIComponent(selectedInviteGroup)}&role=leader` : ''}
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3.5 py-2.5 font-mono select-all"
            />

            <button
              onClick={handleCopyLeaderInvite}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
          </div>
        </div>

        {/* CANDIDATES TABLE */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">Registered Candidates Overview</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Admission No</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-right">Personal Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(!stats?.topCandidates || stats.topCandidates.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">
                      No candidates found. Click &quot;Seed Atlas Candidates&quot; above to populate sample candidates!
                    </td>
                  </tr>
                ) : (
                  stats.topCandidates.map((cand, idx) => (
                    <tr key={cand._id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        {cand.name}
                        <div className="text-xs text-slate-400 font-normal">{cand.email}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {cand.admissionNo}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-indigo-300 font-semibold">
                        {cand.department}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">
                        {cand.phone}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-amber-400">
                        {cand.personalPoints || 0} pts
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
