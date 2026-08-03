'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';
import { setCookie } from 'cookies-next';
import GridMotion from '@/components/GridMotion';

// Images for the login page's background grid — cycled to fill the grid's 28 cells.
const GRID_MOTION_IMAGES = [
  '/assets/magnific__background__70466.png',
  '/assets/magnific_l7uVXlugv9.png',
  '/assets/magnific_swEz1K6l8e.png',
  '/assets/rainbow.png',
  '/assets/Rosine 3.jpg',
  '/assets/selena.png',
  '/assets/blanche-bailey.png',
  '/assets/JDK.jpg',
];
const GRID_MOTION_ITEMS = Array.from({ length: 28 }, (_, i) => GRID_MOTION_IMAGES[i % GRID_MOTION_IMAGES.length]);

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
    (process.env.NEXT_PUBLIC_API_URL || 'https://backend-eazypost.mbokofit.com')
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

  const handleFacebookLogin = () => {
    window.location.href = `${API_URL}/auth/facebook`;
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] md:h-screen flex flex-col lg:flex-row bg-[#FFFFFF] font-sans overflow-hidden">
      
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center px-8 sm:px-16 lg:px-24 py-6 sm:py-12 lg:py-20 relative overflow-y-auto">
        <div className="w-full max-w-[480px] xl:max-w-[560px] 2xl:max-w-[640px] 3xl:max-w-[720px] flex flex-col justify-center min-h-full my-auto py-8">
          
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
            <div className="flex flex-col gap-[5px] mb-[16px] xl:mb-[24px] 2xl:mb-[42px]">
              <h1 className="font-sans font-bold text-[24px] lg:text-[28px] xl:text-[32px] leading-[32px] lg:leading-[40px] xl:leading-[48px] text-[#000000]">
                {t('Welcome Back', 'Bon retour')}
              </h1>
              <p className="font-sans font-normal text-[14px] lg:text-[16px] leading-[20px] lg:leading-[24px] text-[#8E8E8E]">
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
              <button type="button" onClick={handleFacebookLogin} className="flex-1 h-[40px] lg:h-[44px] xl:h-[48px] bg-white border border-[#D9D9D9] rounded-[10px] flex items-center justify-center gap-[10px] transition-colors">
                {/* Facebook */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.0733C24 5.40546 18.6274 0 12 0C5.37258 0 0 5.40546 0 12.0733C0 18.0995 4.3882 23.0942 10.125 23.9994V15.5636H7.07813V12.0733H10.125V9.41306C10.125 6.38751 11.9165 4.71627 14.6576 4.71627C15.9705 4.71627 17.3438 4.95189 17.3438 4.95189V7.92146H15.8306C14.34 7.92146 13.875 8.85225 13.875 9.80723V12.0733H17.2031L16.6711 15.5636H13.875V23.9994C19.6118 23.0942 24 18.0995 24 12.0733Z" fill="#1877F2"/>
                  <path d="M16.6711 15.5636L17.2031 12.0733H13.875V9.80723C13.875 8.85225 14.34 7.92146 15.8306 7.92146H17.3438V4.95189C17.3438 4.95189 15.9705 4.71627 14.6576 4.71627C11.9165 4.71627 10.125 6.38751 10.125 9.41306V12.0733H7.07813V15.5636H10.125V23.9994C10.7359 24.0942 11.3623 24.1466 12 24.1466C12.6377 24.1466 13.2641 24.0942 13.875 23.9994V15.5636H16.6711Z" fill="white"/>
                </svg>
                <span className="font-sans font-medium text-[14px] lg:text-[16px] leading-[24px] text-[#000000] whitespace-nowrap">
                  {t('Sign in with Facebook', 'Facebook')}
                </span>
              </button>
              <button type="button" onClick={handleGoogleLogin} className="flex-1 h-[40px] lg:h-[44px] xl:h-[48px] bg-white border border-[#D9D9D9] rounded-[10px] flex items-center justify-center gap-[10px] transition-colors">
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
      <div className="hidden lg:flex lg:w-1/2 mt-3 mb-3 mr-3 relative overflow-hidden rounded-[24px] flex-col items-center justify-center">
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <GridMotion gradientColor="transparent" items={GRID_MOTION_ITEMS} />
        </div>
      </div>

    </div>
  );
}
