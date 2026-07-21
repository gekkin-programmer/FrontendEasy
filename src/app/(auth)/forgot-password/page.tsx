'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_MS = 60000;
const MAX_ATTEMPTS = 3;

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
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
      setError(t('Please enter a valid email address.', 'Veuillez saisir une adresse e-mail valide.'));
      return;
    }

    const now = Date.now();
    if (now - lastAttemptTime < RATE_LIMIT_MS) {
      const waitSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastAttemptTime)) / 1000);
      setError(t('Please wait', 'Veuillez patienter') + ` ${waitSeconds} ` + t('seconds before trying again.', 'secondes avant de réessayer.'));
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      setError(t('Too many attempts. Please try again later.', 'Trop de tentatives. Veuillez réessayer plus tard.'));
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
        throw new Error(data.message || t('Something went wrong', 'Une erreur est survenue'));
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || t('Something went wrong', 'Une erreur est survenue'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 relative">

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center items-center px-6 py-12 h-screen overflow-y-auto">
        <div className="w-full max-w-[480px]">

          {sent ? (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-[#174CD2]" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">{t('Check your inbox', 'Vérifiez votre boîte mail')}</h2>
              <p className="text-gray-600 mb-8">
                {t('If', 'Si')} <span className="font-semibold text-gray-900">{email}</span> {t("is registered, you'll receive a reset link within a few minutes.", 'est enregistrée, vous recevrez un lien de réinitialisation dans quelques minutes.')}
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#174CD2] hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> {t('Back to sign in', 'Retour à la connexion')}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t('Forgot password?', 'Mot de passe oublié ?')}</h2>
                <p className="mt-2 text-base text-gray-600">{t("Enter your email and we'll send you a reset link.", 'Saisissez votre e-mail et nous vous enverrons un lien de réinitialisation.')}</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('Email address', 'Adresse e-mail')}</label>
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
                  {isLoading ? t('Sending...', 'Envoi...') : t('Send reset link', 'Envoyer le lien de réinitialisation')}
                </button>
              </div>

              <div className="text-center mt-8">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#174CD2] hover:text-blue-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t('Back to sign in', 'Retour à la connexion')}
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
