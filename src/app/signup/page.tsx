'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc'; 
import { FaGithub, FaCheck, FaStar } from 'react-icons/fa6';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CAROUSEL DATA ---
const TESTIMONIALS = [
  {
    id: 1,
    quote: "The category-specific features saved us hours. Being able to choose the 'Agency' workflow from day one was a game changer.",
    author: "Sarah Jenkins",
    role: "Marketing Director @ TechFlow",
    image: "/assets/Sarah.jpg", 
  },
  {
    id: 2,
    quote: "Finally, a tool that understands the African market. The mobile money integration doubled our conversion rate in a week.",
    author: "David Okonjo",
    role: "CEO @ Lagos Ventures",
    image: "/assets/3.jpg", 
  },
  {
    id: 3,
    quote: "The AI assistant speaks Nouchi perfectly. Our engagement on Instagram exploded because the captions actually feel real.",
    author: "Aïcha Diallo",
    role: "Content Creator @ AbidjanStyle",
    image: "/assets/PBD.jpg", 
  }
];

const SignupPage = () => {
  const router = useRouter();

  // --- FORM STATE ---
  const [step, setStep] = React.useState<'FORM' | 'VERIFY'>('FORM');
  const [formData, setFormData] = React.useState({ firstName: '', lastName: '', email: '', password: '' });
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // --- CAROUSEL STATE ---
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Auto-scroll logic
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, []);

  // API Config
  const API_URL =
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
      .replace(/\/$/, '')
      .replace(/\/api$/, '') + '/api';

  // --- AUTH HANDLERS ---
  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/email/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send code');
      setStep('VERIFY');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      
      localStorage.setItem('accessToken', data.accessToken);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 lg:grid lg:grid-cols-2 relative font-sans">
      
      {/* LEFT COLUMN: FORM */}
        <div className="relative hidden lg:flex flex-col h-screen w-full bg-[#FFFFFF] overflow-hidden sticky top-0">
        <div className="mx-auto w-full max-w-[480px]">

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {step === 'FORM' ? 'Create an account' : 'Check your email'}
            </h1>
            <p className="mt-2 text-base text-gray-600">
              {step === 'FORM' 
                ? 'Start your 14-day free trial. No credit card required.' 
                : <span>We sent a verification code to <strong>{formData.email}</strong></span>
              }
            </p>
          </div>

          {error && (
              <div className="p-4 mb-6 rounded-xl bg-[#3C48F6] text-white text-sm font-medium border border-red-100 flex items-center gap-2">
                  {error}
              </div>
          )}

          {step === 'FORM' ? (
            <>
              {/* SOCIALS */}
              <div className="flex gap-4 mb-8">
                <button type="button" onClick={handleGoogleSignup} className="flex-1 flex items-center justify-center gap-2 h-12 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 shadow-sm">
                  <FcGoogle className="text-xl" /> Google
                </button>
                <button type="button" disabled className="flex-1 flex items-center justify-center gap-2 h-12 border border-gray-200 bg-gray-50 rounded-xl text-gray-400 cursor-not-allowed font-semibold opacity-60">
                  <FaGithub /> GitHub
                </button>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs font-bold uppercase text-gray-400">
                  <span className="bg-white px-3">Or continue with email</span>
                </div>
              </div>

              {/* INPUTS */}
              <form onSubmit={handleRequestCode} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                    <input type="text" required onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3 px-4 outline-none transition-all" placeholder="First" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                    <input type="text" required onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3 px-4 outline-none transition-all" placeholder="Last" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
                  <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3 px-4 outline-none transition-all" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                  <input type="password" required minLength={6} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3 px-4 outline-none transition-all" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#3C48F6] hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            /* VERIFICATION FORM */
            <form onSubmit={handleFinalRegister} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Verification Code</label>
                  <input type="text" placeholder="123456" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-white border border-gray-300 text-center text-3xl tracking-[0.5em] font-mono font-bold rounded-xl py-4 px-4 outline-none focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 shadow-sm transition-all" autoFocus />
                  <p className="text-xs text-gray-500 mt-2 text-center">Enter the 6-digit code sent to your email.</p>
               </div>
               <button type="submit" disabled={isLoading} className="w-full bg-[#3C48F6] hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <><FaCheck /> Verify & Create Account</>}
               </button>
               <button type="button" onClick={() => setStep('FORM')} className="w-full text-sm text-gray-500 hover:text-gray-900 mt-4 underline decoration-gray-300 underline-offset-4">Change email address</button>
            </form>
          )}
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">Already have an account? <Link href="/login" className="font-bold text-[#3C48F6] hover:text-blue-700 transition-colors">Log in</Link></p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: HIGH-END CAROUSEL */}
      <div className="relative hidden lg:flex flex-col h-full w-full bg-[#050505] overflow-hidden">
        
        {/* Background Image Carousel */}
        <AnimatePresence mode='popLayout'>
            <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.6, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
            >
                <Image 
                    src={TESTIMONIALS[currentSlide].image} 
                    alt="Background" 
                    fill 
                    className="object-cover" 
                    priority 
                />
            </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3C48F6]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 mt-auto p-16">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <div className="flex gap-1 mb-6">
                        {[1,2,3,4,5].map(i => <FaStar key={i} className="text-yellow-400 text-lg" />)}
                    </div>
                    
                    <blockquote className="text-3xl lg:text-4xl font-medium leading-snug text-white mb-8 tracking-tight">
                        &ldquo;{TESTIMONIALS[currentSlide].quote}&rdquo;
                    </blockquote>

                    <div className="flex items-center gap-5 border-t border-white/10 pt-8">
                        <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#3C48F6] to-purple-500">
                           <img src={TESTIMONIALS[currentSlide].image} alt="User" className="w-full h-full rounded-full object-cover border-2 border-black" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-white">{TESTIMONIALS[currentSlide].author}</p>
                            <p className="text-base text-gray-400">{TESTIMONIALS[currentSlide].role}</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress Bars */}
            <div className="flex gap-2 mt-10">
                {TESTIMONIALS.map((_, index) => (
                    <div key={index} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        {index === currentSlide && (
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 6, ease: "linear" }}
                                className="h-full bg-white"
                            />
                        )}
                        {index < currentSlide && <div className="h-full w-full bg-white" />}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;