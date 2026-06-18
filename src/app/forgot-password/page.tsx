'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const API_URL =
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
      .replace(/\/$/, '')
      .replace(/\/api$/, '') + '/api';

  const handleSubmit = async () => {
    if (!email) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Something went wrong');
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-white font-sans text-gray-900 relative ${!sent ? 'lg:grid lg:grid-cols-2' : ''}`}>

      {/* LEFT SIDE — hidden on sent state */}
      <div className={`flex-col justify-between bg-[#050505] p-12 text-white relative overflow-hidden h-screen ${!sent ? 'hidden lg:flex' : 'hidden'}`}>
        <div className="relative z-10">
          <Link href="/" className="inline-block mb-8 opacity-90 hover:opacity-100 transition-opacity">
            <Image src="/assets/WiggleLogo.png" alt="EazyPost Logo" width={48} height={48} className="object-contain" priority />
          </Link>
          <h1 className="text-4xl font-bold leading-tight mb-4 tracking-tight">It happens to everyone. We&apos;ve got you covered.</h1>
          <p className="text-gray-400 text-lg">Enter your email and we&apos;ll send a reset link instantly.</p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#174CD2]/20 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24 bg-white h-screen overflow-y-auto">
        <div className="mx-auto w-full max-w-[480px]">

          <div className="mb-10 lg:hidden">
            <Link href="/" className="inline-block">
              <div className="relative w-10 h-10">
                <Image src="/assets/WiggleLogo.png" alt="EazyPost Logo" fill className="object-contain" priority />
              </div>
            </Link>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-[#174CD2]" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">Check your inbox</h2>
              <p className="text-gray-600 mb-8">
                If <span className="font-semibold text-gray-900">{email}</span> is registered, you&apos;ll receive a reset link within a few minutes.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#174CD2] hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Forgot password?</h2>
                <p className="mt-2 text-base text-gray-600">Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full bg-white border border-gray-300 focus:border-[#174CD2] focus:ring-4 focus:ring-[#174CD2]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !email}
                  className="w-full bg-[#174CD2] hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>

              <div className="text-center mt-8">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#174CD2] hover:text-blue-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
