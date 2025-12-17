'use client';

import * as React from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaGithub } from 'react-icons/fa6';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  // STATE
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // 1. SOCIAL LOGIN
  const signInWith = (strategy: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;
    
    return signIn.authenticateWithRedirect({
      strategy,
      // IMPORTANT: This must match the folder 'src/app/sso-callback/page.tsx'
      redirectUrl: '/sso-callback', 
      redirectUrlComplete: '/dashboard', 
    });
  };

  // 2. EMAIL/PASS LOGIN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Force router push to ensure client-side navigation works immediately
        router.push('/dashboard');
      } else {
        console.log(result);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 lg:grid lg:grid-cols-2 relative">
      
      {/* --- LEFT SIDE: Visual / Testimonial --- */}
      <div className="hidden lg:flex flex-col justify-between bg-[#050505] p-12 text-white relative overflow-hidden h-screen">
        <div className="relative z-10">
          <Link href="/">
            {/* Ensure path exists or change to text */}
            <img 
              src="/assets/WiggleLogo.png" 
              alt="Brand Logo" 
              className="w-12 h-12 object-contain mb-8 cursor-pointer opacity-90 hover:opacity-100 transition-opacity" 
            />
          </Link>
          <h1 className="text-4xl font-bold leading-tight mb-4 tracking-tight">Manage your social empire from one command center.</h1>
          <p className="text-gray-400 text-lg">Join 12,000+ creators and teams.</p>
        </div>

        {/* Abstract Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3C48F6]/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}
          </div>
          <p className="text-gray-200 mb-6 leading-relaxed">"The workspace feature changed how we handle multiple clients. It's simply the best tool out there."</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border-2 border-white/20">
                <img 
                    src="/assets/3.jpg" 
                    alt="User Profile" 
                    className="w-full h-full object-cover" 
                />
            </div>
            <div>
              <p className="font-bold text-sm">Alex Rivera</p>
              <p className="text-xs text-gray-400">Director at Acme Corp</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Custom Login Form --- */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24 bg-white h-screen overflow-y-auto">
        
        <div className="mx-auto w-full max-w-[480px]">
          
          <div className="mb-10 lg:hidden">
             <Link href="/" className="inline-block">
               <span className="text-2xl font-bold text-[#3C48F6]">EasyPost</span>
             </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
            <p className="mt-2 text-base text-gray-600">Please enter your details to sign in.</p>
          </div>

          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => signInWith('oauth_google')}
              className="flex-1 flex items-center justify-center gap-2 h-12 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 shadow-sm"
            >
              <FaGoogle className="text-red-500" /> Google
            </button>
            <button 
              onClick={() => signInWith('oauth_github')}
              className="flex-1 flex items-center justify-center gap-2 h-12 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 shadow-sm"
            >
              <FaGithub /> GitHub
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs font-bold uppercase text-gray-400">
              <span className="bg-white px-3">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
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
                required 
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
              Sign In
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
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