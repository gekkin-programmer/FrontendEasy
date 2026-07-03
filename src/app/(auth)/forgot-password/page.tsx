'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_MS = 60000;
const MAX_ATTEMPTS = 3;

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [lastAttemptTime, setLastAttemptTime] = React.useState(0);

  const API_URL =
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
      .replace(/\/$/, '')
      .replace(/\/api$/, '') + '/api';

  const isValidEmail = EMAIL_REGEX.test(email);

  const handleSubmit = async () => {
    if (!isValidEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    const now = Date.now();
    if (now - lastAttemptTime < RATE_LIMIT_MS) {
      const waitSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastAttemptTime)) / 1000);
      setError(`Please wait ${waitSeconds} seconds before trying again.`);
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      setError('Too many attempts. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLastAttemptTime(Date.now());
    setAttempts((prev) => prev + 1);

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
    <div className="min-h-screen bg-white font-sans text-gray-900 relative">

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center items-center px-6 py-12 h-screen overflow-y-auto">
        <div className="w-full max-w-[480px]">

          <div className="mb-10 lg:hidden flex justify-center">
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
                    className="w-full bg-white border-2 border-gray-300  rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-colors duration-200 placeholder:text-gray-400 shadow-sm"
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
                  disabled={isLoading}
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
