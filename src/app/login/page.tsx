'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaGithub } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { Loader2 } from 'lucide-react';
import { setCookie } from 'cookies-next';

export default function LoginPage() {
  const router = useRouter();

  // STATE
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // CONFIG
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // 1. SOCIAL LOGIN
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  // 2. EMAIL LOGIN
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Use your new 'api' instance instead of 'fetch' if possible, 
      // but 'fetch' is fine here since it's a public endpoint.
      // If using 'api' instance, it handles the baseURL automatically.
      
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      // SUCCESS
      // Clean up legacy local storage if present
      if (typeof window !== 'undefined') localStorage.removeItem('accessToken');

      setCookie('accessToken', data.accessToken, {
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // The refreshToken is automatically saved by the browser as a secure Cookie 
      // No need to save it manually.

      // Force Redirect
      router.push('/dashboard');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 lg:grid lg:grid-cols-2 relative">
      
      {/* LEFT SIDE: Visual (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#050505] p-12 text-white relative overflow-hidden h-screen">
        <div className="relative z-10">
          <Link href="/" className="inline-block mb-8 opacity-90 hover:opacity-100 transition-opacity">
            <Image 
              src="/assets/WiggleLogo.png" 
              alt="EazyPost Logo" 
              width={48} 
              height={48} 
              className="object-contain"
              priority
            />
          </Link>
          <h1 className="text-4xl font-bold leading-tight mb-4 tracking-tight">Manage your social empire from one command center.</h1>
          <p className="text-gray-400 text-lg">Join 12,000+ creators and teams.</p>
        </div>
        
        {/* Background Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3C48F6]/20 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Testimonial Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}
          </div>
          <p className="text-gray-200 mb-6 leading-relaxed">&ldquo;The workspace feature changed how we handle multiple clients. It&apos;s simply the best tool out there.&rdquo;</p>
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full bg-gray-700 overflow-hidden border-2 border-white/20">
                <Image 
                  src="/assets/3.jpg" 
                  alt="User Profile" 
                  fill 
                  className="object-cover"
                  sizes="48px"
                />
            </div>
            <div>
              <p className="font-bold text-sm">Alex Rivera</p>
              <p className="text-xs text-gray-400">Director at Acme Corp</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24 bg-white h-screen overflow-y-auto">
        <div className="mx-auto w-full max-w-[480px]">
          
          {/* Mobile Logo Link */}
          <div className="mb-10 lg:hidden">
             <Link href="/" className="inline-block">
               <div className="relative w-10 h-10">
                 <Image 
                   src="/assets/WiggleLogo.png" 
                   alt="EazyPost Logo" 
                   fill
                   className="object-contain"
                   priority
                 />
                 asyPost
               </div>
             </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
            <p className="mt-2 text-base text-gray-600">Please enter your details to sign in.</p>
          </div>

          {/* Social Buttons */}
          <div className="flex gap-4 mb-8">
            <button type="button" onClick={handleGoogleLogin} className="flex-1 flex items-center justify-center gap-2 h-12 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 shadow-sm">
              <FcGoogle className="text-xl" /> Google
            </button>
            <button type="button" disabled className="flex-1 flex items-center justify-center gap-2 h-12 border border-gray-200 bg-gray-50 rounded-xl text-gray-400 cursor-not-allowed font-semibold shadow-none opacity-60">
              <FaGithub /> GitHub
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs font-bold uppercase text-gray-400">
              <span className="bg-white px-3">Or sign in with email</span>
            </div>
          </div>

          {/* Email Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm" 
                placeholder="you@example.com" 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <Link href="#" className="text-xs font-semibold text-[#3C48F6] hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm" 
                placeholder="••••••••" 
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-[#3C48F6] text-sm font-medium border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  {error}
              </div>
            )}

            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-[#3C48F6] hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin w-4 h-4"/>}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-bold text-[#3C48F6] hover:text-blue-700 transition-colors">
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
