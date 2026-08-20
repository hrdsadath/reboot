'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { User, Mail, Phone, Rocket, ArrowRight, BookOpen, Hash, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [department, setDepartment] = useState('Computer Science');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isRegister) {
      if (!name || !email || !phone || !admissionNo || !department) {
        setErrorMsg('Please complete all required fields (Name, Email, Phone, Admission No, Department).');
        setLoading(false);
        return;
      }

      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, admissionNo, department })
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Registered successfully!');
        if (typeof window !== 'undefined') {
          localStorage.setItem('iedc_token', res.token);
          localStorage.setItem('iedc_user', JSON.stringify(res.user));
        }
        setTimeout(() => {
          if (res.user.role === 'admin') router.push('/admin');
          else router.push('/dashboard');
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } else {
      if (!email && !phone && !admissionNo) {
        setErrorMsg('Please enter your Email, Phone number, or Admission Number.');
        setLoading(false);
        return;
      }

      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, phone, admissionNo })
      });

      if (res.success) {
        setSuccessMsg('Log in successful! Redirecting...');
        if (typeof window !== 'undefined') {
          localStorage.setItem('iedc_token', res.token);
          localStorage.setItem('iedc_user', JSON.stringify(res.user));
        }
        setTimeout(() => {
          if (res.user.role === 'admin') router.push('/admin');
          else if (res.user.role === 'leader') router.push('/leader');
          else router.push('/dashboard');
        }, 800);
      } else {
        setErrorMsg(res.message || 'Login failed.');
      }
    }
    setLoading(false);
  };

  const handleQuickCandidateLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const testEmail = `candidate_${randomId}@student.edu`;
    const testName = `Candidate #${randomId}`;
    const testPhone = `98000${randomId}`;
    const testAdm = `ADM${randomId}`;

    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        phone: testPhone,
        admissionNo: testAdm,
        department: 'Computer Science'
      })
    });

    if (res.success && res.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('iedc_token', res.token);
        localStorage.setItem('iedc_user', JSON.stringify(res.user));
      }
      setSuccessMsg(`Signed in as fresh student candidate (${testName})! Redirecting...`);
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } else {
      setErrorMsg('Candidate quick sign in failed.');
    }
    setLoading(false);
  };

  const handleQuickAdminLogin = async () => {
    setLoading(true);
    const res = await apiRequest('/auth/create-admin', { method: 'POST' });
    if (res.success) {
      setSuccessMsg('Logged in as Executive Admin!');
      if (typeof window !== 'undefined') {
        localStorage.setItem('iedc_token', res.token);
        localStorage.setItem('iedc_user', JSON.stringify(res.admin));
      }
      setTimeout(() => {
        router.push('/admin');
      }, 800);
    } else {
      setErrorMsg('Admin login failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
              <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isRegister ? 'Candidate Sign Up' : 'Portal Log In'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegister ? 'Enter student details to join 1 of 8 Round-Robin teams' : 'Access your candidate, leader, or admin dashboard'}
            </p>
          </div>

          {/* Feedback */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            {isRegister && (
              <div>
                <label className="text-xs uppercase font-extrabold text-slate-400 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs uppercase font-extrabold text-slate-400 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
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
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Admission No */}
            {isRegister && (
              <div>
                <label className="text-xs uppercase font-extrabold text-slate-400 block mb-1.5">Admission Number</label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    placeholder="e.g. ADM2026_042"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Department */}
            {isRegister && (
              <div>
                <label className="text-xs uppercase font-extrabold text-slate-400 block mb-1.5">Department</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Register & Join Round-Robin Team' : 'Log In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Buttons */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
            <button
              onClick={handleQuickCandidateLogin}
              className="w-full py-2.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Instant Test Candidate Sign-In</span>
            </button>

            <button
              onClick={handleQuickAdminLogin}
              className="w-full py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Log In as Executive Admin</span>
            </button>
          </div>

          {/* Toggle */}
          <div className="text-center mt-4">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isRegister
                ? 'Already registered? Click here to Log In'
                : "Don't have an account? Click here to Register"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
