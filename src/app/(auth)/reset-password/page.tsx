'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(false);

  const API_URL =
    (process.env.NEXT_PUBLIC_API_URL || 'https://backend-eazypost.mbokofit.com')
      .replace(/\/$/, '')
      .replace(/\/api$/, '') + '/api';

  const handleSubmit = async () => {
    if (!password || !confirm) return;
    if (password !== confirm) {
      setError(t('Passwords do not match.', 'Les mots de passe ne correspondent pas.'));
      return;
    }
    if (password.length < 8) {
      setError(t('Password must be at least 8 characters.', 'Le mot de passe doit contenir au moins 8 caractères.'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t('Something went wrong', 'Une erreur est survenue'));
      }

      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || t('Something went wrong', 'Une erreur est survenue'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <div className="text-center max-w-sm px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('Invalid link', 'Lien invalide')}</h2>
          <p className="text-gray-600 mb-6">{t('This reset link is missing or malformed.', 'Ce lien de réinitialisation est manquant ou incorrect.')}</p>
          <Link href="/forgot-password" className="font-bold text-[#174CD2] hover:text-blue-700">
            {t('Request a new one', 'Demander un nouveau lien')} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 lg:grid lg:grid-cols-2 relative">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col justify-between bg-[#050505] p-12 text-white relative overflow-hidden h-screen">
        <div className="relative z-10">
          <Link href="/" className="inline-block mb-8 opacity-90 hover:opacity-100 transition-opacity">
            <Image src="/assets/WiggleLogo.png" alt="EazyPost Logo" width={48} height={48} className="object-contain" priority />
          </Link>
          <h1 className="text-4xl font-bold leading-tight mb-4 tracking-tight">{t("Choose a strong password you'll actually remember.", 'Choisissez un mot de passe fort dont vous vous souviendrez.')}</h1>
          <p className="text-gray-400 text-lg">{t('Min. 8 characters. Mix letters, numbers, and symbols.', 'Min. 8 caractères. Mélangez lettres, chiffres et symboles.')}</p>
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

          {done ? (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-[#174CD2]" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">{t('Password updated!', 'Mot de passe mis à jour !')}</h2>
              <p className="text-gray-600">{t('Redirecting you to sign in...', 'Redirection vers la connexion...')}</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t('Set new password', 'Définir un nouveau mot de passe')}</h2>
                <p className="mt-2 text-base text-gray-600">{t('Must be at least 8 characters.', 'Au moins 8 caractères.')}</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('New password', 'Nouveau mot de passe')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-gray-300 focus:border-[#174CD2] focus:ring-4 focus:ring-[#174CD2]/10 rounded-xl py-3.5 px-4 pr-12 text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('Confirm password', 'Confirmer le mot de passe')}</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full bg-white border border-gray-300 focus:border-[#174CD2] focus:ring-4 focus:ring-[#174CD2]/10 rounded-xl py-3.5 px-4 text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
                    placeholder="••••••••"
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
                  disabled={isLoading || !password || !confirm}
                  className="w-full bg-[#174CD2] hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                  {isLoading ? t('Updating...', 'Mise à jour...') : t('Update password', 'Mettre à jour le mot de passe')}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
