'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import Leaderboard from '@/components/Leaderboard';
import TeamRevealModal from '@/components/TeamRevealModal';
import { apiRequest } from '@/lib/api';
import { User, Award, Users, Lock, Trophy, Sparkles, CheckCircle2, Crown, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [myGroup, setMyGroup] = useState(null);
  const [isGroupRevealed, setIsGroupRevealed] = useState(false);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    // Get currentUser from localStorage
    let userObj = null;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('iedc_user');
      if (stored) {
        try {
          userObj = JSON.parse(stored);
          setCurrentUser(userObj);
        } catch (e) {}
      }
    }

    if (!userObj) {
      router.push('/login');
      return;
    }

    // 1. Fetch User Info & Group Info
    const groupRes = await apiRequest('/groups/my-group');
    if (groupRes.success) {
      setMyGroup(groupRes.group);
      setIsGroupRevealed(groupRes.isRevealed);
    }

    // 2. Fetch Games List
    const gamesRes = await apiRequest('/games');
    if (gamesRes.success) {
      setGames(gamesRes.games || []);
    }

    // 3. Fetch User Submissions
    const subRes = await apiRequest('/games/my-submissions');
    if (subRes.success) {
      setUserSubmissions(subRes.submissions || []);
    }

    // 4. Fetch Stats for Leaderboard
    const adminRes = await apiRequest('/admin/dashboard');
    if (adminRes.success && adminRes.stats) {
      setCandidates(adminRes.stats.topCandidates || []);
      setAllGroups(adminRes.stats.groups || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskSubmit = async (gameNumber, chosenOption, submissionText, submissionUrl) => {
    const res = await apiRequest('/games/submit', {
      method: 'POST',
      body: JSON.stringify({ gameNumber, chosenOption, submissionText, submissionUrl })
    });

    if (res.success) {
      // Update local points
      if (currentUser) {
        const updated = { ...currentUser, individualPoints: res.updatedPoints };
        setCurrentUser(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem('iedc_user', JSON.stringify(updated));
        }
      }

      // If Game 2 completed -> trigger celebratory reveal modal!
      if (Number(gameNumber) === 2) {
        setIsGroupRevealed(true);
        setShowRevealModal(true);
      }

      fetchData();
    } else {
      alert(res.message || 'Submission failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Top Profile Banner */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{currentUser?.fullName || 'Student Candidate'}</h1>
                <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {currentUser?.role || 'user'}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                <span>{currentUser?.email}</span>
                <span>•</span>
                <span>{currentUser?.phone}</span>
                <span>•</span>
                <span className="text-indigo-300 font-semibold">{currentUser?.preferredLeadTrack} Track</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">My Points</div>
                <div className="text-lg font-black text-amber-400">{currentUser?.individualPoints || 0} PTS</div>
              </div>
            </div>

            <button
              onClick={fetchData}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* TEAM ASSIGNMENT STATUS CARD */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
          {!isGroupRevealed ? (
            /* LOCKED SECRET TEAM VIEW */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Lock className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    Secret Team Assignment
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">Group Details Locked Until Game 2 Completion</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    You are assigned to <strong>Group #{currentUser?.groupNumber || '1'}</strong> via Round-Robin, but teammate names are secret until Game 2!
                  </p>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400">
                🔒 Hidden Stage
              </div>
            </div>
          ) : (
            /* REVEALED TEAM CARD */
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
                    #{myGroup?.groupNumber || currentUser?.groupNumber || '1'}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      🎉 Group Revealed
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{myGroup?.groupName || `Group ${currentUser?.groupNumber}`}</h3>
                    <p className="text-xs text-slate-400">Leader: <strong className="text-amber-400">{myGroup?.leaderName || 'Alex Vance'}</strong></p>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl text-right">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Cumulative Team Score</div>
                  <div className="text-base font-black text-emerald-300">{myGroup?.totalTeamPoints || 0} PTS</div>
                </div>
              </div>

              {/* Members List */}
              {myGroup?.members && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-800/80">
                  {myGroup.members.map((m, i) => (
                    <div key={m._id || i} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                      <div className="font-bold text-white truncate">{m.fullName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                        <span>{m.preferredLeadTrack}</span>
                        <span className="text-amber-400 font-bold">{m.individualPoints || 0} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6 GAMES ARENA GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                6 Selection Challenges
              </h2>
              <p className="text-xs text-slate-400">Complete each task to earn individual & team lead points</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {userSubmissions.length} of {games.length} Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const isSubmitted = userSubmissions.some((s) => s.gameNumber === game.gameNumber);
              return (
                <GameCard
                  key={game._id || game.gameNumber}
                  game={game}
                  isSubmitted={isSubmitted}
                  onSubmit={handleTaskSubmit}
                />
              );
            })}
          </div>
        </div>

        {/* LEADERBOARD SECTION */}
        <Leaderboard candidates={candidates} groups={allGroups} />

      </main>

      {/* TEAM REVEAL MODAL */}
      {showRevealModal && (
        <TeamRevealModal
          group={myGroup}
          onClose={() => setShowRevealModal(false)}
        />
      )}
    </div>
  );
}
