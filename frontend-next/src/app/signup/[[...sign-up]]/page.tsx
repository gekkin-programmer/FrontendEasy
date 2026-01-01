'use client';

import * as React from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaGoogle, FaGithub } from 'react-icons/fa6'; // Make sure you have react-icons
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // 1. SUBMIT REGISTRATION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send the magic code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors[0]?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. VERIFY EMAIL CODE
  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== 'complete') {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. SOCIAL LOGIN
  const signUpWith = (strategy: 'oauth_google' | 'oauth_github') => {
    return signUp?.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/onboarding',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 lg:grid lg:grid-cols-2 relative font-sans">
      
      {/* LEFT COLUMN */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24 bg-white h-screen overflow-y-auto">
        
        <div className="mx-auto w-full max-w-[480px]">
          
          <div className="mb-10">
             <Link href="/" className="inline-block">
               <img className="h-10 w-auto object-contain" src="/assets/WiggleLogo.png" alt="Logo" />
             </Link>
          </div>

          {!pendingVerification ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h1>
                <p className="mt-2 text-base text-gray-600">Start your 14-day free trial.</p>
              </div>

              {/* SOCIAL BUTTONS */}
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={() => signUpWith('oauth_google')}
                  className="flex-1 flex items-center justify-center gap-2 h-12 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                >
                  <FaGoogle /> Google
                </button>
                <button 
                  onClick={() => signUpWith('oauth_github')}
                  className="flex-1 flex items-center justify-center gap-2 h-12 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                >
                  <FaGithub /> GitHub
                </button>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs font-bold uppercase text-gray-400">
                  <span className="bg-white px-3">Or continue with</span>
                </div>
              </div>

              {/* CUSTOM FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all placeholder:text-gray-400"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div id="clerk-captcha"></div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#3C48F6] hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="animate-spin w-4 h-4"/>}
                  Create account
                </button>
              </form>
            </>
          ) : (
            // VERIFICATION STEP
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Check your email</h1>
               <p className="text-gray-600 mb-8">We sent a verification code to <strong>{email}</strong></p>

               <form onSubmit={onPressVerify} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Verification Code</label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-white border border-gray-300 focus:border-[#3C48F6] focus:ring-4 focus:ring-[#3C48F6]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all tracking-widest text-center font-mono text-xl"
                      placeholder="123456"
                    />
                  </div>
                  
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#3C48F6] hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </button>
               </form>
            </div>
          )}
          
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

      {/* RIGHT COLUMN (Same as before) */}
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