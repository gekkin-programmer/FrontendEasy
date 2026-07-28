'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';
import { setCookie } from 'cookies-next';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // --- FORM STATE ---
  const [formData, setFormData] = React.useState({ email: '', password: '' });
  // Error state stores a code, not text — the message is translated at render
  // time so it always matches the current language.
  const [authError, setAuthError] = React.useState<null | { kind: 'oauth' } | { kind: 'signin'; status?: number }>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Every failure shown to the user is a plain, human message — technical
  // details are logged to the console for diagnostics, never displayed.
  const friendlyAuthError = (status?: number) => {
    if (status === 400 || status === 401) {
      return t(
        'Incorrect email or password. Please check your details and try again.',
        'E-mail ou mot de passe incorrect. Vérifiez vos informations et réessayez.'
      );
    }
    if (status === 429) {
      return t(
        'Too many attempts. Please wait a moment and try again.',
        'Trop de tentatives. Veuillez patienter un instant avant de réessayer.'
      );
    }
    return t(
      'We couldn’t sign you in right now. Please try again in a few minutes.',
      'Connexion impossible pour le moment. Veuillez réessayer dans quelques minutes.'
    );
  };

  // Surface social sign-in failures (the OAuth callback redirects here with ?error=...)
  React.useEffect(() => {
    const errParam = new URLSearchParams(window.location.search).get('error');
    if (errParam) {
      console.error('[Auth] Social sign-in failed', { code: errParam, at: new Date().toISOString() });
      setAuthError({ kind: 'oauth' });
      // Clean the URL so the message doesn't reappear on refresh
      window.history.replaceState(null, '', '/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API Config
  const API_URL =
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
      .replace(/\/$/, '')
      .replace(/\/api$/, '') + '/api';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Structured diagnostic log — safe details only, no credentials.
        console.error('[Auth] Sign-in failed', {
          status: res.status,
          message: data?.message,
          at: new Date().toISOString(),
        });
        setAuthError({ kind: 'signin', status: res.status });
        return;
      }

      if (typeof window !== 'undefined') localStorage.removeItem('accessToken');

      setCookie('accessToken', data.accessToken, {
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      // Honor ?redirect= (e.g. back to /checkout) — only same-site paths to avoid open redirects
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect && redirect.startsWith('/') ? redirect : '/dashboard');
    } catch (err: any) {
      // Network failure or unexpected error — log the detail, show a human message.
      console.error('[Auth] Sign-in error', { error: err?.message, at: new Date().toISOString() });
      setAuthError({ kind: 'signin' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] md:h-screen flex flex-col lg:flex-row bg-[#FFFFFF] font-sans overflow-hidden">
      
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center p-6 sm:p-12 lg:p-20 relative overflow-y-auto">
        <div className="w-full max-w-[404px] xl:max-w-[480px] 2xl:max-w-[560px] 3xl:max-w-[640px] flex flex-col justify-center min-h-full my-auto py-8">
          
          {authError && (
            <div className="p-3 mb-6 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
                {authError.kind === 'oauth'
                  ? t(
                      'Google sign-in didn’t complete. Please try again, or sign in with your email and password.',
                      'La connexion avec Google n’a pas abouti. Réessayez ou connectez-vous avec votre e-mail et votre mot de passe.'
                    )
                  : friendlyAuthError(authError.status)}
            </div>
          )}

          <div className="flex flex-col">
            
            {/* Header Texts */}
            <div className="flex flex-col gap-[5px] mb-[24px] xl:mb-[40px] 2xl:mb-[58px]">
              <Link href="/">
                <img src="/assets/logomark-monogram-royal-blue.svg" alt="Eazlypost Logo" className="w-[36px] h-[36px] lg:w-[48px] lg:h-[48px] object-contain mb-[10px] lg:mb-[15px] cursor-pointer" />
              </Link>
              <h1 className="font-sans font-medium text-[24px] lg:text-[28px] xl:text-[32px] leading-[32px] lg:leading-[40px] xl:leading-[48px] text-[#000000]">
                {t('Welcome Back', 'Bon retour')}
              </h1>
              <p className="font-sans font-medium text-[14px] lg:text-[16px] leading-[20px] lg:leading-[24px] text-[#000000]">
                {t('Enter your Credentials to access your account', 'Entrez vos identifiants pour accéder à votre compte')}
              </p>
            </div>

            {/* Form Fields */}
            <form className="flex flex-col gap-[16px] lg:gap-[20px] xl:gap-[25px]" onSubmit={handleLogin}>
              
              {/* Email */}
              <div className="flex flex-col gap-[5px]">
                <label className="font-sans font-medium text-[14px] leading-[21px] text-[#000000]">
                  {t('Email address', 'Adresse e-mail')}
                </label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={t('Enter your email', 'Entrez votre e-mail')}
                  className="w-full h-[40px] lg:h-[44px] xl:h-[48px] bg-white border border-[#D9D9D9] rounded-[10px] pl-[10px] pr-[10px] font-sans font-medium text-[14px] text-[#000000] outline-none focus:border-[#174CD2] transition-colors placeholder:text-[#8E8E8E] placeholder:font-medium placeholder:text-[14px] placeholder:leading-[21px] [&:-webkit-autofill]:[box-shadow:0_0_0_30px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]" 
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-[5px]">
                <div className="flex justify-between items-center">
                  <label className="font-sans font-medium text-[14px] leading-[21px] text-[#000000]">
                    {t('Password', 'Mot de passe')}
                  </label>
                  <Link href="/forgot-password" className="text-[#174CD2] font-sans font-medium text-[12px] hover:underline">
                    {t('Forgot Password?', 'Mot de passe oublié ?')}
                  </Link>
                </div>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={t('Enter your password', 'Entrez votre mot de passe')}
                  className="w-full h-[40px] lg:h-[44px] xl:h-[48px] bg-white border border-[#D9D9D9] rounded-[10px] pl-[10px] pr-[10px] font-sans font-medium text-[14px] text-[#000000] outline-none focus:border-[#174CD2] transition-colors placeholder:text-[#8E8E8E] placeholder:font-medium placeholder:text-[14px] placeholder:leading-[21px] [&:-webkit-autofill]:[box-shadow:0_0_0_30px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]" 
                />
              </div>

              {/* Sign In Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-[40px] lg:h-[44px] xl:h-[48px] bg-[#174CD2] border border-[#174CD2] rounded-[10px] flex items-center justify-center mt-[4px] lg:mt-[10px] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-[20px] h-[20px] text-white" />
                ) : (
                  <span className="font-sans font-bold text-[14px] lg:text-[16px] leading-[20px] text-[#FFFFFF]">
                    {t('Sign In', 'Se connecter')}
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative w-full flex items-center justify-center my-[24px] lg:my-[32px] xl:my-[45px]">
              <div className="absolute w-full h-[2px] bg-[#F5F5F5] z-0"></div>
              <div className="bg-[#FFFFFF] px-[12px] z-10">
                <span className="font-sans font-medium text-[10px] md:text-[12px] text-[#000000]">
                  {t('Or', 'Ou')}
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-[15px] mt-[10px] w-full">
              <button type="button" className="flex-1 h-[40px] lg:h-[44px] xl:h-[48px] bg-white border border-[#000000] rounded-[10px] flex items-center justify-center gap-[10px] transition-colors">
                {/* Apple */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_1_155)">
                    <path d="M17.4863 -7.05128e-06C16.125 0.0918678 14.6681 0.901868 13.7663 1.99499C12.9769 2.95687 12.315 4.36874 12.5663 5.83499C12.3413 5.76562 12.1369 5.75812 11.8913 5.66999C11.2219 5.43187 10.4569 5.17499 9.50625 5.17499C7.61813 5.17499 5.685 6.29812 4.46625 8.17499C2.6925 10.9012 3.04875 15.6994 5.74125 19.8C6.21563 20.52 6.76875 21.3056 7.45125 21.93C8.13375 22.5544 8.95875 23.0306 9.92625 23.04C10.7531 23.0494 11.3288 22.7737 11.8463 22.545C12.3638 22.3162 12.8456 22.1137 13.7513 22.11C13.7569 22.11 13.7606 22.11 13.7663 22.11C14.6681 22.1025 15.135 22.3012 15.6413 22.53C16.1475 22.7587 16.7175 23.0475 17.5463 23.04C18.5325 23.0325 19.3706 22.4925 20.0663 21.825C20.7619 21.1575 21.3338 20.3381 21.8063 19.62C22.4831 18.5887 22.755 18.0262 23.2763 16.875C23.3306 16.755 23.3325 16.6162 23.28 16.4944C23.2294 16.3725 23.13 16.2769 23.0063 16.23C21.3 15.585 20.3269 14.0756 20.1863 12.48C20.0456 10.8844 20.7206 9.24187 22.4213 8.30999C22.5469 8.24249 22.635 8.12437 22.665 7.98562C22.6931 7.84687 22.6594 7.70062 22.5713 7.58999C21.3506 6.07312 19.6331 5.17499 17.9513 5.17499C16.8788 5.17499 16.0913 5.42812 15.4463 5.66999C15.3394 5.71124 15.2606 5.70749 15.1613 5.74499C15.8156 5.39999 16.3931 4.92187 16.8263 4.36499C17.6138 3.35437 18.2213 1.91624 17.9963 0.404993C17.9588 0.157493 17.7356 -0.0187571 17.4863 -7.05128e-06ZM16.9763 1.13999C16.9444 2.10937 16.6125 3.05812 16.0613 3.76499C15.4838 4.50749 14.5125 5.02124 13.5713 5.17499C13.5881 4.24312 13.9556 3.27749 14.5163 2.59499C15.105 1.88249 16.08 1.36874 16.9763 1.13999ZM9.50625 6.13499C9.92625 6.13499 10.9013 6.33562 11.5613 6.56999C12.2213 6.80437 12.9169 7.07999 13.7363 7.07999C14.5369 7.07999 15.1706 6.80249 15.7913 6.56999C16.4119 6.33749 17.0306 6.13499 17.9513 6.13499C19.1531 6.13499 20.4525 6.75937 21.4763 7.84499C19.8375 9.00187 19.0706 10.8056 19.2263 12.555C19.3819 14.3231 20.4469 16.0012 22.1963 16.875C22.1937 16.8805 22.1912 16.8859 22.1888 16.8913C21.8142 17.7072 21.5644 18.2512 21.0113 19.095C20.5519 19.7944 20.0063 20.5594 19.4063 21.135C18.8063 21.7106 18.1706 22.0744 17.5313 22.08C16.9144 22.0856 16.5638 21.9019 16.0313 21.66C15.4988 21.4181 14.8106 21.1406 13.7513 21.15C12.6938 21.1556 11.9963 21.4219 11.4563 21.66C10.9163 21.8981 10.5619 22.0856 9.94125 22.08C9.285 22.0744 8.67563 21.7556 8.09625 21.225C7.51688 20.6944 6.99375 19.9706 6.53625 19.275C4.01625 15.435 3.81375 10.9237 5.26125 8.69999C6.3225 7.06687 9.08625 6.13499 9.50625 6.13499Z" fill="black"/>
                    <path d="M9.50625 6.13499C9.92625 6.13499 10.9013 6.33562 11.5613 6.56999C12.2213 6.80437 12.9169 7.07999 13.7363 7.07999C14.5369 7.07999 15.1706 6.80249 15.7913 6.56999C16.4119 6.33749 17.0306 6.13499 17.9513 6.13499C19.1531 6.13499 20.4525 6.75937 21.4763 7.84499C19.8375 9.00187 19.0706 10.8056 19.2263 12.555C19.3819 14.3231 20.4469 16.0012 22.1963 16.875L22.1888 16.8913C21.8142 17.7072 21.5644 18.2512 21.0113 19.095C20.5519 19.7944 20.0063 20.5594 19.4063 21.135C18.8063 21.7106 18.1706 22.0744 17.5313 22.08C16.9144 22.0856 16.5638 21.9019 16.0313 21.66C15.4988 21.4181 14.8106 21.1406 13.7513 21.15C12.6938 21.1556 11.9963 21.4219 11.4563 21.66C10.9163 21.8981 10.5619 22.0856 9.94125 22.08C9.285 22.0744 8.67563 21.7556 8.09625 21.225C7.51688 20.6944 6.99375 19.9706 6.53625 19.275C4.01625 15.435 3.81375 10.9237 5.26125 8.69999C6.3225 7.06687 9.08625 6.13499 9.50625 6.13499Z" fill="black"/>
                    <path d="M16.9763 1.13999C16.9444 2.10937 16.6125 3.05812 16.0613 3.76499C15.4838 4.50749 14.5125 5.02124 13.5713 5.17499C13.5881 4.24312 13.9556 3.27749 14.5163 2.59499C15.105 1.88249 16.08 1.36874 16.9763 1.13999Z" fill="black"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_1_155">
                      <rect width="24" height="24" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span className="font-sans font-medium text-[14px] lg:text-[16px] leading-[24px] text-[#000000] whitespace-nowrap">
                  {t('Sign in with Apple', 'Apple')}
                </span>
              </button>
              <button type="button" onClick={handleGoogleLogin} className="flex-1 h-[40px] lg:h-[44px] xl:h-[48px] bg-white border border-[#000000] rounded-[10px] flex items-center justify-center gap-[10px] transition-colors">
                {/* Google */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
                  <path d="M3.15302 7.3455L6.43851 9.755C7.3275 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z" fill="#FF3D00"/>
                  <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.6055 17.5455 13.3575 18 12 18C9.399 18 7.1905 16.3415 6.3585 14.027L3.0975 16.5395C4.7525 19.778 8.1135 22 12 22Z" fill="#4CAF50"/>
                  <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
                </svg>
                <span className="font-sans font-medium text-[14px] lg:text-[16px] leading-[24px] text-[#000000] whitespace-nowrap">
                  {t('Sign in with Google', 'Google')}
                </span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="w-full flex justify-center mt-[24px] lg:mt-[32px] xl:mt-[40px]">
              <Link href="/signup" className="font-sans font-medium text-[14px] transition-colors">
                <span className="text-[#000000]">{t("Don't have an account?", "Vous n'avez pas de compte ?")} </span>
                <span className="text-[#174CD2] hover:underline">{t('Sign Up', 'S\'inscrire')}</span>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Right Side: Visuals */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-[#174CD2] flex-col items-center justify-center">
        
        {/* Background Vectors */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] aspect-square bg-[#174CD2] bg-opacity-50 rounded-full blur-[80px]"></div>
        <div className="absolute top-[20%] left-[60%] w-[52%] h-[41%] bg-[#174CD2] bg-opacity-50"></div>
        <div className="absolute top-[23%] left-[0%] w-[44%] h-[36%] bg-[#FFFFFF] rounded-tr-[40px]"></div>
        <svg className="absolute top-[30%] -right-[20%] w-[120%] max-w-[900px] h-auto opacity-80 pointer-events-none" viewBox="0 0 763 616" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M466.793 132.299C583.258 79.7038 685.136 -14.9811 811.792 2.01323C960.42 21.9559 1114.97 93.3614 1180.8 228.102C1246.36 362.31 1188.92 518.451 1131.44 656.315C1079.01 782.065 998.699 894.574 877.204 956.226C754.811 1018.33 617.123 1011.07 482.227 985.758C317.378 954.826 116.407 945.538 35.9427 798.372C-45.3184 649.75 24.1243 458.399 116.123 316.173C190.644 200.967 341.746 188.769 466.793 132.299Z" fill="#174CD2"/>
        </svg>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-[837px] flex justify-center p-8 2xl:p-12">
          
          {/* Illustration Image */}
          <div className="w-full flex justify-center">
            <img 
              src="/assets/svg-login-page.svg" 
              alt="Login Scene Illustration" 
              className="w-full h-auto max-h-[80vh] object-contain scale-110 2xl:scale-125"
            />
          </div>

        </div>
      </div>

    </div>
  );
}
