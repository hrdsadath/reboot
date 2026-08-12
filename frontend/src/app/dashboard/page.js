'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import Leaderboard from '@/components/Leaderboard';
import TeamRevealModal from '@/components/TeamRevealModal';
import { apiRequest } from '@/lib/api';
import { User, Award, Lock, Trophy, Sparkles, CheckCircle2, Crown, RefreshCw, CheckSquare } from 'lucide-react';

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
      router.push('/');
      return;
    }

    // 1. Fetch Group Info
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

    // 3. Fetch User Submissions & Activities
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
      if (currentUser) {
        const updated = { ...currentUser, personalPoints: res.updatedPoints, individualPoints: res.updatedPoints };
        setCurrentUser(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem('iedc_user', JSON.stringify(updated));
        }
      }

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
        
        {/* Top Student Profile & Leader Summary */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
              {currentUser?.name?.charAt(0) || currentUser?.fullName?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{currentUser?.name || currentUser?.fullName || 'Student Candidate'}</h1>
                <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Candidate
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                <span>{currentUser?.email}</span>
                <span>•</span>
                <span>{currentUser?.phone}</span>
                <span>•</span>
                <span className="text-indigo-300 font-semibold">{currentUser?.department || 'CS'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end">
            
            {/* Volunteer Leader Display */}
            <div className="bg-slate-900/90 border border-amber-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Group Leader</div>
                <div className="text-sm font-bold text-white">
                  {myGroup?.leader ? (typeof myGroup.leader === 'object' ? myGroup.leader.name : myGroup.leader) : myGroup?.leaderName || 'Assigned by Admin'}
                </div>
              </div>
            </div>

            {/* Student Personal Points */}
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">My Points</div>
                <div className="text-lg font-black text-amber-400">{currentUser?.personalPoints || currentUser?.individualPoints || 0} PTS</div>
              </div>
            </div>

            <button
              onClick={fetchData}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* GROUP STATUS CARD */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
          {!isGroupRevealed ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Lock className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    Secret Team Assignment
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">Team Details Secret Until Game 2</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assigned to <strong>{myGroup?.name || `Group #${currentUser?.groupNumber || '1'}`}</strong> via Round-Robin. Finish Game 1 & Game 2 to reveal!
                  </p>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400">
                🔒 Hidden Stage
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
                  #{myGroup?.name ? myGroup.name.replace('Group ', '') : currentUser?.groupNumber || '1'}
                </div>
                <div>
                  <span className="text-xs uppercase font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    🎉 Group Unlocked
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{myGroup?.name || `Group ${currentUser?.groupNumber}`}</h3>
                  <p className="text-xs text-slate-400">
                    Volunteer Judge / Leader: <strong className="text-amber-400">{myGroup?.leader ? (typeof myGroup.leader === 'object' ? myGroup.leader.name : myGroup.leader) : myGroup?.leaderName || 'Assigned by Admin'}</strong>
                  </p>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl text-right">
                <div className="text-[10px] uppercase font-bold text-emerald-400">Cumulative Team Score</div>
                <div className="text-base font-black text-emerald-300">{myGroup?.teamPoints || myGroup?.totalTeamPoints || 0} PTS</div>
              </div>
            </div>
          )}
        </div>

        {/* STUDENT'S ACTIVITIES & SUBMISSIONS SUMMARY */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            My Activities & Submission Points
          </h2>
          <p className="text-xs text-slate-400 mb-4">View your completed tasks and volunteer judge point approvals</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSubmissions.length === 0 ? (
              <div className="col-span-full text-center py-6 text-slate-500 italic text-sm">
                You have not submitted any game activities yet. Complete Game 1 below to get started!
              </div>
            ) : (
              userSubmissions.map((sub, i) => (
                <div key={sub._id || i} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-400">
                      {sub.gameId ? sub.gameId.name : `Game #${sub.gameNumber || '1'}`}
                    </span>
                    <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      +{sub.personalPoints || sub.individualPointsAwarded || 0} PTS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate mb-2">{sub.answer || sub.submissionText || 'Submission completed'}</p>
                  {sub.choice && (
                    <div className="text-[11px] text-slate-400">Format: <strong className="text-white">{sub.choice}</strong></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6 GAMES ARENA GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                6 Selection Challenges
              </h2>
              <p className="text-xs text-slate-400">Complete each challenge to earn points</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {userSubmissions.length} of {games.length} Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const isSubmitted = userSubmissions.some((s) => (s.gameNumber === game.gameNumber || (s.gameId && s.gameId._id === game._id)));
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
