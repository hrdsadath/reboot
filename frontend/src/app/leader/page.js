'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { Crown, Users, Award, CheckCircle2, Phone, Mail, Sparkles, MessageSquare, Save, RefreshCw, CheckSquare, PlusCircle } from 'lucide-react';

export default function LeaderPortal() {
  const [submissions, setSubmissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [evalPoints, setEvalPoints] = useState({}); // { [subId]: { personal: 10, team: 20 } }
  const [actionMsg, setActionMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLeaderData = async () => {
    setLoading(true);

    // Fetch Submissions for Evaluation
    const subRes = await apiRequest('/games/all-submissions');
    if (subRes.success && subRes.submissions) {
      setSubmissions(subRes.submissions);
    }

    // Fetch Groups
    const grpRes = await apiRequest('/groups/all');
    if (grpRes.success && grpRes.groups) {
      setGroups(grpRes.groups);
      if (grpRes.groups.length > 0) {
        setSelectedGroup(grpRes.groups[0]);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderData();
  }, []);

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
      setActionMsg(res.message);
      setTimeout(() => setActionMsg(''), 3000);
      fetchLeaderData();
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 font-black flex items-center justify-center shadow-lg">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Volunteer Judge & Evaluator Portal</h1>
                <span className="text-xs uppercase font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  Volunteer Evaluator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                You are a Volunteer Judge. Review candidate game activities and approve personal & team points!
              </p>
            </div>
          </div>

          <button
            onClick={fetchLeaderData}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Evaluation Data"
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

        {/* SECTION 1: CANDIDATE TASK EVALUATION PANEL */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                Candidate Submissions & Activity Point Approvals
              </h2>
              <p className="text-xs text-slate-400">Review student submissions and award personal & team points</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {submissions.length} Total Submissions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Task Details</th>
                  <th className="px-4 py-3">Submission Content</th>
                  <th className="px-4 py-3">Award Personal Pts</th>
                  <th className="px-4 py-3">Award Team Pts</th>
                  <th className="px-4 py-3 text-right">Approve Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                      No candidate submissions received yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub, idx) => (
                    <tr key={sub._id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        {sub.userId ? sub.userId.name || sub.userId.fullName : 'Student'}
                        <div className="text-xs text-slate-400 font-normal">
                          {sub.userId?.department || 'Department'} • {sub.groupId?.name || 'Group'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-indigo-300 font-semibold">
                        {sub.gameId ? sub.gameId.name : `Game #${sub.gameNumber || '1'}`}
                        {sub.choice && (
                          <div className="text-[11px] text-amber-400 font-bold mt-0.5">Format: {sub.choice}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-300 max-w-xs truncate">
                        {sub.answer || sub.submissionText || 'No text summary'}
                      </td>
                      <td className="px-4 py-3.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={sub.personalPoints || 10}
                          onChange={(e) => handlePointChange(sub._id, 'personal', e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-amber-400 font-black text-center"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={sub.teamPoints || 0}
                          onChange={(e) => handlePointChange(sub._id, 'team', e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-emerald-400 font-black text-center"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleApproveSubmission(sub._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Award</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: CANDIDATE GROUPS ROSTER */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Round-Robin Groups Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {groups.map((grp, idx) => (
              <div key={grp._id || idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-amber-400">{grp.name || `Group ${grp.groupNumber}`}</span>
                  <span className="text-xs font-mono text-emerald-400">{grp.teamPoints || grp.totalTeamPoints || 0} Pts</span>
                </div>
                <div className="text-xs text-slate-400">
                  Total Members: <strong className="text-white">{grp.members ? grp.members.length : grp.memberIds ? grp.memberIds.length : 0}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
