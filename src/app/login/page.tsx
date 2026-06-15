'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { setCookie } from 'cookies-next';

export default function LoginPage() {
  const router = useRouter();

  // STATE
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // CONFIG
  const API_URL =
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
      .replace(/\/$/, '')
      .replace(/\/api$/, '') + '/api';

  // 1. SOCIAL LOGIN
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  // 2. EMAIL LOGIN
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
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
      if (typeof window !== 'undefined') localStorage.removeItem('accessToken');

      setCookie('accessToken', data.accessToken, {
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Force Redirect
      router.push('/dashboard');

    } catch (err) {
      console.error(err);
      const e = err as Error;
      setError(e.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col lg:flex-row relative">
      
      {/* LEFT SIDE: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-20 bg-white h-screen overflow-y-auto">
        <div className="w-full max-w-[596px]">
          
          <h2 className="text-[#174CD2] font-bold text-[32px] md:text-[48px] leading-[57px] font-['Rubik'] mb-12 text-center lg:text-left">
            Connectez-vous
          </h2>

          <div className="space-y-6">
            {/* Email Form */}
            <div>
              <label className="block text-[20px] text-black font-normal font-['Rubik'] mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[70px] bg-white border border-[#174CD2]/10 rounded-[10px] px-6 text-[16px] text-black outline-none placeholder:text-[#D9D9D9] transition-all focus:border-[#174CD2]/30 font-['Inter']" 
                placeholder="exemple@gmail.com" 
              />
            </div>

            {/* Password Form */}
            <div className="relative">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-[20px] text-black font-normal font-['Rubik']">Mot de passe</label>
                <Link href="/forgot-password" className="text-black italic font-light text-[16px] font-['Rubik'] hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[70px] bg-white border border-[#174CD2]/10 rounded-[10px] px-6 text-[16px] text-black outline-none placeholder:text-[#D9D9D9] transition-all focus:border-[#174CD2]/30 pr-12 font-['Inter']" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-[10px] bg-red-50 text-[#174CD2] text-sm font-medium border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  {error}
              </div>
            )}

            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-[70px] bg-[#174CD2] hover:bg-blue-700 text-white font-semibold text-[32px] rounded-[10px] transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-['Inter']"
            >
              {isLoading && <Loader2 className="animate-spin w-8 h-8"/>}
              Connexion
            </button>
          </div>

          <div className="flex items-center justify-center mt-[40px] mb-[40px] gap-4">
            <div className="h-px bg-black/50 w-[80px] sm:w-[250px]" />
            <span className="text-[20px] font-light text-black font-['Inter'] whitespace-nowrap">Continuer avec</span>
            <div className="h-px bg-black/50 w-[80px] sm:w-[250px]" />
          </div>

          <div className="flex flex-col gap-[30px]">
            <button type="button" onClick={handleGoogleLogin} className="w-full h-[70px] bg-[#174CD2]/5 rounded-[10px] hover:bg-[#174CD2]/10 transition-colors flex items-center justify-center gap-4">
              <FcGoogle className="text-3xl" />
              <span className="text-[24px] font-semibold text-black font-['Inter']">Continuer avec google</span>
            </button>
            <button type="button" disabled className="w-full h-[70px] bg-[#174CD2]/5 rounded-[10px] opacity-60 cursor-not-allowed flex items-center justify-center gap-4">
              <FaGithub className="text-3xl text-black" />
              <span className="text-[24px] font-semibold text-black font-['Inter']">Continuer avec github</span>
            </button>
          </div>

          <div className="text-center mt-8 lg:hidden">
            <p className="text-[16px] text-gray-600 font-['Inter']">
              Pas encore de compte?{' '}
              <Link href="/signup" className="font-bold text-[#174CD2] hover:underline">
                Inscription
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: Visual Banner (Desktop Only) */}
      <div 
        className="hidden lg:flex w-full lg:w-[720px] flex-col justify-center items-center relative overflow-hidden h-screen flex-shrink-0" 
        style={{ background: 'linear-gradient(201.28deg, rgba(12, 39, 108, 0.9) 6.99%, #024AFF 36.84%, #0349F9 53.72%, #123A9F 69.69%)' }}
      >
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-white font-bold text-[48px] leading-[57px] font-['Rubik'] mb-4 w-full max-w-[650px]">
            Bienvenue sur EazyPost !
          </h1>
          <h2 className="text-white font-medium text-[32px] leading-[38px] font-['Rubik'] mb-[100px] w-full max-w-[451px]">
            Votre aventure commence ici
          </h2>
          
          <Link href="/signup" className="flex items-center justify-center w-[294px] h-[98px] bg-white rounded-[20px] text-[#174CD2] font-medium text-[32px] leading-[38px] hover:bg-gray-50 transition-colors font-['Rubik']">
            Inscription
          </Link>
        </div>
        
        {/* Floating Facebook Icons Background */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
           <svg className="absolute top-[43px] left-[37px]" width="50" height="50" viewBox="0 0 24 24" fill="#1877F2" stroke="white" strokeWidth="0"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="white" /></svg>
           <svg className="absolute top-[93px] left-[591px]" width="50" height="50" viewBox="0 0 24 24" fill="#1877F2" stroke="white" strokeWidth="0"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="white" /></svg>
           <svg className="absolute top-[396px] left-[631px]" width="50" height="50" viewBox="0 0 24 24" fill="#1877F2" stroke="white" strokeWidth="0"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="white" /></svg>
           <svg className="absolute top-[622px] left-[52px]" width="50" height="50" viewBox="0 0 24 24" fill="#1877F2" stroke="white" strokeWidth="0"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="white" /></svg>
           <svg className="absolute top-[893px] left-[67px]" width="50" height="50" viewBox="0 0 24 24" fill="#1877F2" stroke="white" strokeWidth="0"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="white" /></svg>
           <svg className="absolute top-[918px] left-[606px]" width="50" height="50" viewBox="0 0 24 24" fill="#1877F2" stroke="white" strokeWidth="0"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="white" /></svg>
        </div>
      </div>
    </div>
  );
}
