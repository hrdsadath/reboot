'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { Crown, Users, Award, CheckCircle2, Phone, Mail, Sparkles, MessageSquare, Save, RefreshCw, CheckSquare, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function LeaderPortal() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLeaderAuthorized, setIsLeaderAuthorized] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [evalPoints, setEvalPoints] = useState({});
  const [actionMsg, setActionMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('iedc_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setCurrentUser(u);
          if (u && (u.role === 'leader' || u.role === 'admin')) {
            setIsLeaderAuthorized(true);
            fetchLeaderData();
          } else {
            setIsLeaderAuthorized(false);
            setLoading(false);
          }
        } catch (e) {
          setIsLeaderAuthorized(false);
          setLoading(false);
        }
      } else {
        setIsLeaderAuthorized(false);
        setLoading(false);
      }
    }
  }, []);

  const fetchLeaderData = async () => {
    setLoading(true);

    const subRes = await apiRequest('/games/all-submissions');
    if (subRes.success && subRes.submissions) {
      setSubmissions(subRes.submissions);
    }

    const grpRes = await apiRequest('/groups/all');
    if (grpRes.success && grpRes.groups) {
      setGroups(grpRes.groups);
      if (grpRes.groups.length > 0) {
        setSelectedGroup(grpRes.groups[0]);
      }
    }

    setLoading(false);
  };

  const handlePointChange = (subId, field, val) => {
    setEvalPoints(prev => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [field]: Number(val) || 0
      }
    }));
  };

  const handleApproveSubmission = async (subId) => {
    const pts = evalPoints[subId] || { personal: 10, team: 15 };
    const res = await apiRequest('/games/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        submissionId: subId,
        personalPoints: pts.personal || 10,
        teamPoints: pts.team || 15
      })
    });

    if (res.success) {
      setActionMsg(`Points approved! Granted +${pts.personal || 10} personal & +${pts.team || 15} team points.`);
      setTimeout(() => setActionMsg(''), 3000);
      fetchLeaderData();
    } else {
      alert(res.message || 'Evaluation failed.');
    }
  };

  if (!loading && !isLeaderAuthorized) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-amber-500/30 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">403 - Access Denied</h2>
            <p className="text-sm text-slate-300">
              The Volunteer Judge Portal is restricted to assigned Leaders & Evaluators only. Candidates can view their points on their personal Student Arena page.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to My Student Arena</span>
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
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 glow-amber flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 font-black flex items-center justify-center shadow-lg">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Volunteer Judge & Evaluator Portal</h1>
                <span className="text-xs uppercase font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  Leader / Judge Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Review candidate activity submissions & approve personal & team points</p>
            </div>
          </div>

          <button
            onClick={fetchLeaderData}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Submissions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Action Alert */}
        {actionMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* SUBMISSIONS EVALUATION TABLE */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                Candidate Task Submissions for Approval
              </h2>
              <p className="text-xs text-slate-400">Award custom personal & team points for candidate stage and app activities</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Game / Challenge</th>
                  <th className="px-4 py-3">Choice / Submission</th>
                  <th className="px-4 py-3 text-center">Award Personal Pts</th>
                  <th className="px-4 py-3 text-center">Award Team Pts</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                      No candidate submissions pending evaluation.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => {
                    const subId = sub._id;
                    const personalVal = evalPoints[subId]?.personal ?? (sub.personalPoints || 10);
                    const teamVal = evalPoints[subId]?.team ?? (sub.teamPoints || 15);

                    return (
                      <tr key={subId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-white">
                          {sub.userId ? sub.userId.name : 'Student Candidate'}
                          <div className="text-xs text-slate-400 font-normal">
                            {sub.userId ? sub.userId.department : 'CSE'}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-xs text-indigo-300 font-semibold">
                          {sub.gameId ? sub.gameId.name : `Game #${sub.gameNumber || '1'}`}
                        </td>

                        <td className="px-4 py-3.5 text-xs max-w-xs">
                          {sub.choice && (
                            <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mr-2">
                              {sub.choice}
                            </span>
                          )}
                          <span className="text-slate-300">{sub.submissionText || sub.answer || 'Submitted'}</span>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <input
                            type="number"
                            value={personalVal}
                            onChange={(e) => handlePointChange(subId, 'personal', e.target.value)}
                            className="w-16 bg-slate-900 border border-slate-700 text-center text-amber-400 font-black text-xs rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-500"
                          />
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <input
                            type="number"
                            value={teamVal}
                            onChange={(e) => handlePointChange(subId, 'team', e.target.value)}
                            className="w-16 bg-slate-900 border border-slate-700 text-center text-emerald-400 font-black text-xs rounded-xl px-2 py-1.5 focus:outline-none focus:border-emerald-500"
                          />
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleApproveSubmission(subId)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Points</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
