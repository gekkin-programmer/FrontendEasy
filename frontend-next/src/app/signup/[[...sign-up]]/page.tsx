'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaGoogle, FaGithub } from 'react-icons/fa6';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  // STATE
  const [formData, setFormData] = React.useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // 🌍 Config
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // 1. SOCIAL SIGNUP
  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  // 2. EMAIL SIGNUP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // ✅ SUCCESS: Save Token & Redirect
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Go to Onboarding to pick a plan
      router.push('/onboarding');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 lg:grid lg:grid-cols-2 relative font-sans">
      
      {/* LEFT COLUMN: Form */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24 bg-white h-screen overflow-y-auto">
        
        <div className="mx-auto w-full max-w-[480px]">
          
          <div className="mb-10">
             <Link href="/" className="inline-block">
               <img className="h-10 w-auto object-contain" src="/assets/WiggleLogo.png" alt="Logo" />
             </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h1>
            <p className="mt-2 text-base text-gray-600">Start your 14-day free trial.</p>
          </div>

          {/* SOCIAL BUTTONS */}
          <div className="flex gap-4 mb-8">
            <button 
              onClick={handleGoogleSignup}
              className="flex-1 flex items-center justify-center gap-2 h-12 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 shadow-sm"
            >
              <FaGoogle className="text-red-500" /> Google
            </button>
            <button 
              disabled
              className="flex-1 flex items-center justify-center gap-2 h-12 border border-gray-200 bg-gray-50 rounded-xl text-gray-400 cursor-not-allowed font-semibold opacity-60"
            >
              <FaGithub /> GitHub
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs font-bold uppercase text-gray-400">
              <span className="bg-white px-3">Or continue with email</span>
            </div>
          </div>

          {/* CUSTOM FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                 ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3C48F6] hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin w-4 h-4"/>}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#3C48F6] hover:text-blue-700 transition-colors">
                Log in
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: Visual (Preserved) */}
      <div className="relative hidden lg:flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900">
        <div className="absolute inset-0 w-full h-full">
          <Image src="/assets/Sarah.jpg" alt="Office Workspace" fill className="object-cover" priority quality={90} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="relative z-10 mt-auto p-16 text-white">
          <blockquote className="text-3xl font-medium leading-relaxed mb-8">
            "The category-specific features saved us hours. Being able to choose the 'Agency' workflow from day one was a game changer."
          </blockquote>
          <div className="flex items-center gap-5">
            <div className="relative w-14 h-14">
               <img src="/assets/PBD.jpg" alt="User" className="w-full h-full rounded-full border-2 border-white object-cover" />
            </div>
            <div>
              <p className="font-bold text-lg">Sarah Jenkins</p>
              <p className="text-base text-gray-300">Marketing Director @ TechFlow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}