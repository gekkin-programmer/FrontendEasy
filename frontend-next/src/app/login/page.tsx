'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      router.push('/workspaces');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      
      {/* Left Side: Visual / Testimonial */}
      <div className="hidden lg:flex w-1/2 bg-[#050505] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="relative z-10">
          
          {/* --- BRAND LOGO (Desktop) --- */}
          {/* Make sure your image is in the public folder */}
          <img 
            src="/assets/WiggleLogo.png" 
            alt="Brand Logo" 
            className="w-12 h-12 object-contain mb-8" 
          />

          <h1 className="text-4xl font-bold leading-tight mb-4">Manage your social empire from one command center.</h1>
          <p className="text-gray-400 text-lg">Join 12,000+ creators and teams.</p>
        </div>

        {/* Abstract Visual */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3C48F6]/20 rounded-full blur-[120px]" />

        <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400">★</span>)}
          </div>
          <p className="text-gray-200 mb-4">"The workspace feature changed how we handle multiple clients. It's simply the best tool out there."</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full ">
                <img 
                    src="/assets/3.jpg" 
                    alt="User Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20" 
                />
            </div>
            <div>
              <p className="font-bold text-sm">Alex Rivera</p>
              <p className="text-xs text-gray-400">Director at Acme Corp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center flex flex-col items-center">
            
            {/* --- BRAND LOGO (Mobile Only) --- */}
            <img 
              src="/assets/WiggleLogo.png" 
              alt="Brand Logo" 
              className="lg:hidden w-12 h-12 object-contain mb-6" 
            />

            <h2 className="text-3xl font-bold tracking-tight">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {isSignUp ? 'Start your 14-day free trial.' : 'Please enter your details.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiMail />
                </div>
                <input type="email" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-[#3C48F6] focus:border-[#3C48F6] sm:text-sm outline-none transition-colors" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiLock />
                </div>
                <input type="password" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-[#3C48F6] focus:border-[#3C48F6] sm:text-sm outline-none transition-colors" placeholder="••••••••" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-[#3C48F6] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-wait"
            >
              {isLoading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
              {!isLoading && <FiArrowRight />}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"} {' '}
              <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-[#3C48F6] hover:text-blue-700">
                {isSignUp ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}