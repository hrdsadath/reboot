'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { Crown, Mail, Phone, User, BookOpen, Hash, ArrowRight } from 'lucide-react';

function LeaderJoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const groupFromUrl = searchParams.get('group') || 'Group 1';
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [department, setDepartment] = useState('IEDC Faculty / Senior Volunteer');

  const handleJoin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        phone,
        admissionNo,
        department,
        role: 'leader'
      })
    });

    if (res.success) {
      setSuccessMsg(`Welcome Volunteer Judge ${name}! Redirecting to Leader Portal...`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('iedc_token', res.token);
        localStorage.setItem('iedc_user', JSON.stringify(res.user));
      }
      setTimeout(() => {
        router.push('/leader');
      }, 1000);
    } else {
      setErrorMsg(res.message || 'Invitation registration failed.');
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 glow-amber shadow-2xl relative">
      
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black mx-auto mb-3 shadow-lg">
          <Crown className="w-7 h-7" />
        </div>
        <span className="text-[11px] uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
          🏆 Official Admin Invitation Link
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight mt-2">
          Volunteer Judge Registration
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          You are invited by Admin to judge candidate activities for <strong>{groupFromUrl}</strong>
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="text-xs uppercase font-extrabold text-slate-400 block mb-1.5">Volunteer Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Alex Vance"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase font-extrabold text-slate-400 block mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="judge@college.edu"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase font-extrabold text-slate-400 block mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase font-extrabold text-slate-400 block mb-1.5">Faculty / ID Number</label>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              placeholder="e.g. JUDGE_2026_01"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase font-extrabold text-slate-400 block mb-1.5">Department / Role</label>
          <div className="relative">
            <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. IEDC Faculty Mentor"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 mt-6"
        >
          {loading ? (
            <span>Joining as Judge...</span>
          ) : (
            <>
              <span>Accept Invitation & Enter Evaluator Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

    </div>
  );
}

export default function LeaderJoinPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Suspense fallback={<div className="text-slate-400 text-sm font-semibold">Loading Volunteer Invitation...</div>}>
          <LeaderJoinForm />
        </Suspense>
      </div>
    </div>
  );
}
