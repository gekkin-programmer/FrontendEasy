'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

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
    (process.env.NEXT_PUBLIC_API_URL || 'https://backend-eazypost.mbokofit.com')
      .replace(/\/$/, '')
      .replace(/\/api$/, '') + '/api';

  const isValidEmail = EMAIL_REGEX.test(email);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValidEmail) {
      setError(t('Please enter a valid email address.', 'Veuillez entrer une adresse e-mail valide.'));
      return;
    }

    const now = Date.now();
    if (now - lastAttemptTime < RATE_LIMIT_MS) {
      const waitSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastAttemptTime)) / 1000);
      setError(t(`Please wait ${waitSeconds} seconds before trying again.`, `Veuillez patienter ${waitSeconds} secondes avant de réessayer.`));
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
    <div className="fixed inset-0 z-50 w-full h-[100dvh] md:h-screen flex flex-col lg:flex-row bg-[#FFFFFF] font-sans overflow-hidden">
      
      {/* Left Side: Visuals (Image Block on the Left) */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-[#174CD2] flex-col items-center justify-center">
        
        {/* Background Vectors (Flipped for Left Side) */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] aspect-square bg-[#174CD2] bg-opacity-50 rounded-full blur-[80px]"></div>
        <div className="absolute top-[20%] right-[60%] w-[52%] h-[41%] bg-[#174CD2] bg-opacity-50"></div>
        <svg className="absolute top-[30%] -left-[20%] w-[120%] max-w-[900px] h-auto opacity-80 pointer-events-none" viewBox="0 0 763 616" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M466.793 132.299C583.258 79.7038 685.136 -14.9811 811.792 2.01323C960.42 21.9559 1114.97 93.3614 1180.8 228.102C1246.36 362.31 1188.92 518.451 1131.44 656.315C1079.01 782.065 998.699 894.574 877.204 956.226C754.811 1018.33 617.123 1011.07 482.227 985.758C317.378 954.826 116.407 945.538 35.9427 798.372C-45.3184 649.75 24.1243 458.399 116.123 316.173C190.644 200.967 341.746 188.769 466.793 132.299Z" fill="#174CD2"/>
        </svg>
        {/* White box touching the right edge (center split line) - Rendered after SVG to stay on top */}
        <div className="absolute top-[23%] right-[0%] w-[44%] h-[36%] bg-[#FFFFFF] rounded-tl-[40px] z-[5]"></div>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-[837px] flex justify-center p-8 2xl:p-12">

          {/* Illustration Image */}
          <div className="w-full flex justify-center">
            <img
              src="/assets/Forgot%20password-pana.svg"
              alt="Forgot Password Illustration"
              className="w-full h-auto max-h-[80vh] object-contain scale-110 2xl:scale-125"
            />
          </div>

        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center p-6 sm:p-12 lg:p-20 relative overflow-y-auto">
        <div className="w-full max-w-[404px] xl:max-w-[480px] 2xl:max-w-[560px] 3xl:max-w-[640px] flex flex-col justify-center min-h-full my-auto py-8">
          
          {error && (
            <div className="p-3 mb-6 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
                {error}
            </div>
          )}

          <div className="flex flex-col">
            
            {sent ? (
              <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-[#174CD2]" />
                </div>
                <h2 className="font-sans font-medium text-[24px] lg:text-[28px] xl:text-[32px] leading-[32px] lg:leading-[40px] text-[#000000] mb-[15px]">
                  {t('Check your inbox', 'Vérifiez votre boîte de réception')}
                </h2>
                <p className="font-sans font-medium text-[14px] lg:text-[16px] leading-[24px] text-[#000000] mb-[30px]">
                  {t('If', 'Si')} <span className="font-bold">{email}</span> {t('is registered, you\'ll receive a reset link within a few minutes.', 'est enregistré, vous recevrez un lien de réinitialisation dans quelques minutes.')}
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 font-sans font-bold text-[14px] lg:text-[16px] text-[#174CD2] hover:underline transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t('Back to sign in', 'Retour à la connexion')}
                </Link>
              </div>
            ) : (
              <>
                {/* Header Texts */}
                <div className="flex flex-col gap-[5px] mb-[24px] xl:mb-[40px] 2xl:mb-[58px]">
                  <Link href="/">
                    <img src="/assets/WiggleLogo.png" alt="Eazlypost Logo" className="w-[36px] h-[36px] lg:w-[48px] lg:h-[48px] object-contain mb-[10px] lg:mb-[15px] cursor-pointer" />
                  </Link>
                  <h1 className="font-sans font-medium text-[24px] lg:text-[28px] xl:text-[32px] leading-[32px] lg:leading-[40px] xl:leading-[48px] text-[#000000]">
                    {t('Forgot password?', 'Mot de passe oublié ?')}
                  </h1>
                  <p className="font-sans font-medium text-[14px] lg:text-[16px] leading-[20px] lg:leading-[24px] text-[#000000]">
                    {t('Enter your email and we\'ll send you a reset link.', 'Entrez votre e-mail et nous vous enverrons un lien de réinitialisation.')}
                  </p>
                </div>

                {/* Form Fields */}
                <form className="flex flex-col gap-[16px] lg:gap-[20px] xl:gap-[25px]" onSubmit={handleSubmit}>
                  
                  {/* Email */}
                  <div className="flex flex-col gap-[5px]">
                    <label className="font-sans font-medium text-[14px] leading-[21px] text-[#000000]">
                      {t('Email address', 'Adresse e-mail')}
                    </label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('Enter your email', 'Entrez votre e-mail')}
                      className="w-full h-[40px] lg:h-[44px] xl:h-[48px] bg-white border border-[#D9D9D9] rounded-[10px] pl-[10px] pr-[10px] font-sans font-medium text-[14px] text-[#000000] outline-none focus:border-[#174CD2] transition-colors placeholder:text-[#8E8E8E] placeholder:font-medium placeholder:text-[14px] placeholder:leading-[21px] [&:-webkit-autofill]:[box-shadow:0_0_0_30px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]" 
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={isLoading || !email}
                    className="w-full h-[40px] lg:h-[44px] xl:h-[48px] bg-[#174CD2] border border-[#174CD2] rounded-[10px] flex items-center justify-center mt-[4px] lg:mt-[10px] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin w-[20px] h-[20px] text-white" />
                    ) : (
                      <span className="font-sans font-bold text-[14px] lg:text-[16px] leading-[20px] text-[#FFFFFF]">
                        {t('Send reset link', 'Envoyer le lien de réinitialisation')}
                      </span>
                    )}
                  </button>
                </form>

                {/* Back to Sign In Link */}
                <div className="w-full flex justify-center mt-[24px] lg:mt-[32px] xl:mt-[40px]">
                  <Link href="/login" className="font-sans font-medium text-[14px] transition-colors flex items-center gap-2 text-[#174CD2] hover:underline">
                    <ArrowLeft className="w-4 h-4" /> {t('Back to sign in', 'Retour à la connexion')}
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
