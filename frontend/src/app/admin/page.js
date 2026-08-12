'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { ShieldAlert, Users, Trophy, Lock, Unlock, Sparkles, Award, Database, RefreshCw, AlertTriangle, ArrowLeft, Link as LinkIcon, Copy, CheckCircle2, Tv, XCircle, Check, UserCheck, Activity, Eye, ChevronDown, ChevronUp, Crown, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [stageClaims, setStageClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('participants');
  const [expandedCandidateId, setExpandedCandidateId] = useState(null);

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
    }

    const gamesRes = await apiRequest('/games');
    if (gamesRes.success) {
      setGames(gamesRes.games || []);
    }

    // Fetch Submissions for Stage Claims & Participant Activity Monitoring
    const subRes = await apiRequest('/games/all-submissions');
    if (subRes.success && subRes.submissions) {
      setAllSubmissions(subRes.submissions);
      const pendingClaims = subRes.submissions.filter(s => {
        const isStageChoice = s.choice && (s.choice === 'On Stage' || s.choice === 'stage' || s.choice.toLowerCase().includes('stage'));
        const isPendingStatus = s.status === 'pending' || s.personalPoints === 0;
        const isGame1 = s.gameNumber === 1 || (s.gameId && (s.gameId.gameNumber === 1 || s.gameId.name?.includes('Game 1')));
        return (isStageChoice || isGame1) && isPendingStatus;
      });
      setStageClaims(pendingClaims);
    } else {
      setAllSubmissions([]);
      setStageClaims([]);
    }

    setLoading(false);
  };

  const handleStageClaimDecision = async (submissionId, decisionStatus) => {
    const res = await apiRequest('/games/approve-stage-claim', {
      method: 'POST',
      body: JSON.stringify({ submissionId, status: decisionStatus })
    });

    if (res.success) {
      setActionMsg(res.message);
      setTimeout(() => setActionMsg(''), 3500);
      fetchAdminData();
    } else {
      alert(res.message || 'Action failed');
    }
  };

  const handleResetSubmissions = async () => {
    if (!confirm('Are you sure you want to reset all candidate submissions, points, and activity logs across database & memory?')) return;
    const res = await apiRequest('/admin/reset-submissions', { method: 'POST' });
    if (res.success) {
      setActionMsg(res.message);
      setTimeout(() => setActionMsg(''), 3500);
      fetchAdminData();
    } else {
      alert(res.message || 'Reset failed');
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

  const candidates = stats?.topCandidates || [];
  const groups = stats?.groups || [];

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
                  Admin Master Control
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Full monitoring oversight across all Candidate Participants & Volunteer Leaders</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <button
              onClick={handleResetSubmissions}
              className="px-3.5 py-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Reset All Submissions & Points"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Submissions</span>
            </button>

            <button
              onClick={handleSeedData}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Seed Atlas</span>
            </button>

            <button
              onClick={fetchAdminData}
              className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Data"
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

        {/* GAME 1: ON STAGE POINT CLAIM APPROVALS (+20 PTS) */}
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 glow-amber">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Game 1 Stage Verification
              </span>
              <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                <Tv className="w-5 h-5 text-amber-400" />
                Game 1: On Stage Point Claims (+20 PTS) ({stageClaims.length} Pending)
              </h2>
              <p className="text-xs text-slate-400">
                Verify live stage pitches and click Approve (+20 PTS) or Reject (0 PTS).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Intro Summary</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3 text-center">Reward</th>
                  <th className="px-4 py-3 text-right">Admin Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stageClaims.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500 italic text-xs">
                      No pending &quot;On Stage&quot; claims to verify.
                    </td>
                  </tr>
                ) : (
                  stageClaims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        {claim.userId ? (typeof claim.userId === 'object' ? claim.userId.name : claim.userId) : 'Candidate'}
                        <div className="text-xs text-slate-400 font-normal">
                          {claim.userId && typeof claim.userId === 'object' ? claim.userId.department : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-300 max-w-xs truncate">
                        {claim.answer || claim.submissionText || 'Submitted stage pitch'}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          On Stage
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-amber-400">
                        +20 PTS
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleStageClaimDecision(claim._id, 'approved')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve (+20 PTS)</span>
                          </button>

                          <button
                            onClick={() => handleStageClaimDecision(claim._id, 'rejected')}
                            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-bold text-xs transition-all flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject (0 PTS)</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADMIN LEADER INVITE LINK GENERATOR */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                Volunteer Judge Invitation
              </span>
              <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-indigo-400" />
                Share Volunteer Leader / Judge Invitation Link
              </h2>
              <p className="text-xs text-slate-400">
                Generate & share access links for volunteer judges to evaluate tasks and approve points.
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
          </div>
        </div>

        {/* MASTER OVERVIEW TABS: 1. PARTICIPANTS (CANDIDATES) | 2. LEADERS (VOLUNTEER JUDGES) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === 'participants'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>1. Candidates & Activity Submissions ({candidates.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('leaders')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === 'leaders'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>2. Volunteer Leaders & Point Approvals ({groups.length})</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: PARTICIPANTS (STUDENT CANDIDATES) ACTIVITIES */}
          {activeTab === 'participants' && (
            <div className="glass-card rounded-3xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    All Candidate Activities & Submissions
                  </h2>
                  <p className="text-xs text-slate-400">Admin can monitor every candidate&apos;s submitted answers, choices & points</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Candidate</th>
                      <th className="px-4 py-3">Admission No</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3 text-center">Submissions</th>
                      <th className="px-4 py-3 text-right">Personal Points</th>
                      <th className="px-4 py-3 text-right">View Activities</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {candidates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                          No candidates found. Click &quot;Seed Atlas Candidates&quot; above to populate sample candidates!
                        </td>
                      </tr>
                    ) : (
                      candidates.map((cand) => {
                        const candId = cand._id;
                        const candSubmissions = allSubmissions.filter(s =>
                          s.userId && (s.userId._id === candId || s.userId === candId || s.userId.email === cand.email)
                        );
                        const isExpanded = expandedCandidateId === candId;

                        return (
                          <React.Fragment key={candId}>
                            <tr className="hover:bg-slate-800/40 transition-colors">
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
                              <td className="px-4 py-3.5 text-center font-bold text-indigo-400">
                                {candSubmissions.length} Tasks
                              </td>
                              <td className="px-4 py-3.5 text-right font-black text-amber-400">
                                {cand.personalPoints || 0} pts
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  onClick={() => setExpandedCandidateId(isExpanded ? null : candId)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors inline-flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                            </tr>

                            {/* EXPANDABLE ACTIVITIES DETAILS */}
                            {isExpanded && (
                              <tr className="bg-slate-950/60">
                                <td colSpan={7} className="px-6 py-4">
                                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-3">
                                    <h4 className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider flex items-center gap-2">
                                      <Activity className="w-4 h-4" />
                                      Activity Submissions Log for {cand.name}
                                    </h4>

                                    {candSubmissions.length === 0 ? (
                                      <div className="text-xs text-slate-500 italic">No activity submissions logged for this candidate yet.</div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {candSubmissions.map((sub, idx) => (
                                          <div key={sub._id || idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="font-bold text-white">
                                                {sub.gameId ? sub.gameId.name : `Game #${sub.gameNumber || '1'}`}
                                              </span>
                                              <span className="font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                                +{sub.personalPoints || 0} PTS
                                              </span>
                                            </div>
                                            {sub.choice && (
                                              <div className="text-[11px] text-amber-300 font-semibold mb-1">Format: {sub.choice}</div>
                                            )}
                                            <p className="text-slate-300 truncate">{sub.answer || sub.submissionText || 'Submission completed'}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 2: VOLUNTEER LEADERS (JUDGES) & POINT EVALUATIONS OVERVIEW */}
          {activeTab === 'leaders' && (
            <div className="glass-card rounded-3xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    Volunteer Leaders & Point Evaluation History
                  </h2>
                  <p className="text-xs text-slate-400">Admin can monitor assigned group leaders and point approvals granted to candidates</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Group Assigned</th>
                      <th className="px-4 py-3">Volunteer Leader / Judge</th>
                      <th className="px-4 py-3 text-center">Group Candidates</th>
                      <th className="px-4 py-3 text-right">Cumulative Team Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {groups.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">
                          No groups configured yet.
                        </td>
                      </tr>
                    ) : (
                      groups.map((group, idx) => (
                        <tr key={group._id || idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-white">
                            {group.groupName || group.name || `Group ${idx + 1}`}
                          </td>
                          <td className="px-4 py-3.5 text-slate-200">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-amber-400" />
                              <span className="font-bold text-amber-300">
                                {group.leader ? (typeof group.leader === 'object' ? group.leader.name : group.leader) : group.leaderName || 'Assigned by Admin via Invite Link'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-indigo-400">
                            {group.members ? group.members.length : 8} Members
                          </td>
                          <td className="px-4 py-3.5 text-right font-black text-emerald-400">
                            {group.totalTeamPoints || group.teamPoints || 0} PTS
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
