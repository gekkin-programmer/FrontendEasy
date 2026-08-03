'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaCheck } from 'react-icons/fa6';
import { setCookie } from 'cookies-next';

// WebGL (react-three-fiber) — must never run during SSR.
const Silk = dynamic(() => import('@/components/Silk'), { ssr: false });

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // --- FORM STATE ---
  const [step, setStep] = React.useState<'FORM' | 'VERIFY'>('FORM');
  const [formData, setFormData] = React.useState({ firstName: '', lastName: '', email: '', password: '', agreeTerms: false });
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  // Password requirement hints only show once the user has tried to submit,
  // not live while they're still typing.
  const [submitAttempted, setSubmitAttempted] = React.useState(false);

  // API Config
  const API_URL =
    (process.env.NEXT_PUBLIC_API_URL || 'https://backend-eazypost.mbokofit.com')
      .replace(/\/$/, '')
      .replace(/\/api$/, '') + '/api';

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleFacebookSignup = () => {
    window.location.href = `${API_URL}/auth/facebook`;
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (formData.password.length < 7 || !/[A-Z]/.test(formData.password)) {
      setError(t('Password must be at least 7 characters and contain at least one capital letter.', 'Le mot de passe doit contenir au moins 7 caractères et une lettre majuscule.'));
      return;
    }
    if (!formData.agreeTerms) {
      setError(t('You must agree to the terms and policy', 'Vous devez accepter les conditions et la politique'));
      return;
    }
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
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          code,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
      setCookie('accessToken', data.accessToken, {
        maxAge: 60 * 60 * 24,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] md:h-screen flex flex-col lg:flex-row bg-[#FFFFFF] font-sans overflow-hidden">
      
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center p-4 sm:p-6 lg:p-10 3xl:p-20 relative overflow-y-auto">
        <div className="w-full max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px] 3xl:max-w-[720px] flex flex-col justify-center min-h-full my-auto py-8 lg:py-12">
          
          {error && (
            <div className="p-3 mb-6 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
                {error}
            </div>
          )}

          {step === 'FORM' ? (
            <div className="flex flex-col">
              
              {/* Header Texts */}
              <div className="flex flex-col gap-[2px] mb-[10px] [@media(min-height:740px)]:mb-[16px] [@media(min-height:840px)]:mb-[24px] lg:mb-[16px] 3xl:mb-[40px]">
                <Link href="/" className="hidden md:block p-0 m-0 w-fit">
                  <img src="/assets/eazypost-logo-primary-lockup-black.png" alt="Eazlypost Logo" className="w-auto h-[64px] lg:h-[88px] object-contain cursor-pointer" />
                </Link>
                <h1 className="font-sans font-bold text-[clamp(24px,4vw,32px)] leading-[clamp(32px,5vw,48px)] text-[#000000]">
                  {t('Get Started Now', 'Commencer maintenant')}
                </h1>
                <p className="font-sans font-normal text-[14px] lg:text-[16px] leading-[20px] lg:leading-[24px] text-[#000000]">
                  {t('Enter your Credentials to create your account', 'Entrez vos identifiants pour créer votre compte')}
                </p>
              </div>

              {/* Form Fields */}
              <form className="flex flex-col gap-[8px] [@media(min-height:740px)]:gap-[12px] [@media(min-height:840px)]:gap-[16px] lg:gap-[12px] 3xl:gap-[20px]" onSubmit={handleRequestCode}>
                
                {/* Name */}
                <div className="flex flex-col sm:flex-row gap-[8px]">
                  <div className="flex flex-col gap-[5px] flex-1">
                    <label className="font-sans font-medium text-[14px] leading-[21px] text-[#000000]">
                      {t('First name', 'Prénom')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      placeholder={t('First name', 'Prénom')}
                      className="w-full h-[40px] [@media(min-height:740px)]:h-[44px] [@media(min-height:840px)]:h-[48px] lg:h-[48px] bg-white border border-[#D9D9D9] rounded-[10px] pl-[10px] pr-[10px] font-sans font-medium text-[14px] text-[#000000] outline-none focus:border-[#174CD2] transition-colors placeholder:text-[#8E8E8E] placeholder:font-medium placeholder:text-[14px] placeholder:leading-[21px] [&:-webkit-autofill]:[box-shadow:0_0_0_30px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                    />
                  </div>
                  <div className="flex flex-col gap-[5px] flex-1">
                    <label className="font-sans font-medium text-[14px] leading-[21px] text-[#000000]">
                      {t('Last name', 'Nom')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      placeholder={t('Last name', 'Nom')}
                      className="w-full h-[40px] [@media(min-height:740px)]:h-[44px] [@media(min-height:840px)]:h-[48px] lg:h-[48px] bg-white border border-[#D9D9D9] rounded-[10px] pl-[10px] pr-[10px] font-sans font-medium text-[14px] text-[#000000] outline-none focus:border-[#174CD2] transition-colors placeholder:text-[#8E8E8E] placeholder:font-medium placeholder:text-[14px] placeholder:leading-[21px] [&:-webkit-autofill]:[box-shadow:0_0_0_30px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                    />
                  </div>
                </div>

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
                    className="w-full h-[40px] [@media(min-height:740px)]:h-[44px] [@media(min-height:840px)]:h-[48px] lg:h-[48px] bg-white border border-[#D9D9D9] rounded-[10px] pl-[10px] pr-[10px] font-sans font-medium text-[14px] text-[#000000] outline-none focus:border-[#174CD2] transition-colors placeholder:text-[#8E8E8E] placeholder:font-medium placeholder:text-[14px] placeholder:leading-[21px] [&:-webkit-autofill]:[box-shadow:0_0_0_30px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]" 
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-[5px]">
                  <label className="font-sans font-medium text-[14px] leading-[21px] text-[#000000]">
                    {t('Password', 'Mot de passe')}
                  </label>
                  <input 
                    type="password" 
                    required
                    minLength={7}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={t('Enter your password', 'Entrez votre mot de passe')}
                    className={`w-full h-[40px] [@media(min-height:740px)]:h-[44px] [@media(min-height:840px)]:h-[48px] lg:h-[48px] bg-white border rounded-[10px] pl-[10px] pr-[10px] font-sans font-medium text-[14px] text-[#000000] outline-none focus:border-[#174CD2] transition-colors placeholder:text-[#8E8E8E] placeholder:font-medium placeholder:text-[14px] placeholder:leading-[21px] [&:-webkit-autofill]:[box-shadow:0_0_0_30px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black] ${submitAttempted && (formData.password.length < 7 || !/[A-Z]/.test(formData.password)) ? 'border-red-400' : 'border-[#D9D9D9]'}`}
                  />
                  {submitAttempted && formData.password.length > 0 && (
                    <div className="flex flex-col gap-[2px] mt-[2px]">
                      {formData.password.length < 7 && (
                        <span className="text-[11px] font-sans text-red-400">
                          {t('At least 7 characters', 'Au moins 7 caractères')}
                        </span>
                      )}
                      {!/[A-Z]/.test(formData.password) && (
                        <span className="text-[11px] font-sans text-red-400">
                          {t('At least one capital letter', 'Au moins une lettre majuscule')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <label className="group flex flex-row items-center gap-[10px] cursor-pointer mt-[5px] select-none">
                  <div className={`w-[14px] h-[14px] border border-[#000000] rounded-[2px] flex items-center justify-center transition-all duration-150 group-active:scale-75 flex-shrink-0 ${formData.agreeTerms ? 'bg-[#174CD2] border-[#174CD2]' : 'bg-transparent'}`}>
                    {formData.agreeTerms && <FaCheck className="text-white text-[8px]" />}
                  </div>
                  <span className="font-sans font-medium text-[clamp(10px,1.5vw,12px)] leading-[14px] text-[#000000] flex-1">
                    {t("I agree to the ", "J'accepte les ")}
                    <a href="/legal/terms" target="_blank" rel="noopener" className="font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>{t('Terms of Service', "Conditions d'utilisation")}</a>
                    {t(" and ", " et la ")}
                    <a href="/legal/privacy" target="_blank" rel="noopener" className="font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>{t('Privacy Policy', 'Politique de confidentialité')}</a>
                  </span>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({...formData, agreeTerms: e.target.checked})}
                  />
                </label>

                {/* Sign Up Button */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-[40px] [@media(min-height:740px)]:h-[44px] [@media(min-height:840px)]:h-[48px] lg:h-[48px] bg-[#174CD2] border border-[#174CD2] rounded-[10px] flex items-center justify-center mt-[4px] [@media(min-height:840px)]:mt-[8px] 3xl:mt-[10px] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin w-[20px] h-[20px] text-white" />
                  ) : (
                    <span className="font-sans font-bold text-[clamp(14px,2vw,16px)] leading-[20px] text-[#FFFFFF]">
                      {t('Sign Up', 'S\'inscrire')}
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative w-full flex items-center justify-center my-[12px] [@media(min-height:740px)]:my-[16px] [@media(min-height:840px)]:my-[24px] lg:my-[16px] 3xl:my-[32px]">
                <div className="absolute w-full h-[2px] bg-[#F5F5F5] z-0"></div>
                <div className="bg-[#FFFFFF] px-[12px] z-10">
                  <span className="font-sans font-medium text-[10px] md:text-[12px] text-[#000000]">
                    {t('Or', 'Ou')}
                  </span>
                </div>
              </div>

                {/* Social Logins */}
                <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-[15px] mt-[10px] [@media(min-height:740px)]:mt-[16px] [@media(min-height:840px)]:mt-[20px] w-full">
                  <button type="button" onClick={handleFacebookSignup} className="w-full sm:flex-1 h-[40px] [@media(min-height:740px)]:h-[44px] [@media(min-height:840px)]:h-[48px] lg:h-[48px] bg-white border border-[#D9D9D9] rounded-[10px] flex items-center justify-center gap-[10px] transition-colors">
                    {/* Facebook */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.0733C24 5.40546 18.6274 0 12 0C5.37258 0 0 5.40546 0 12.0733C0 18.0995 4.3882 23.0942 10.125 23.9994V15.5636H7.07813V12.0733H10.125V9.41306C10.125 6.38751 11.9165 4.71627 14.6576 4.71627C15.9705 4.71627 17.3438 4.95189 17.3438 4.95189V7.92146H15.8306C14.34 7.92146 13.875 8.85225 13.875 9.80723V12.0733H17.2031L16.6711 15.5636H13.875V23.9994C19.6118 23.0942 24 18.0995 24 12.0733Z" fill="#1877F2"/>
                      <path d="M16.6711 15.5636L17.2031 12.0733H13.875V9.80723C13.875 8.85225 14.34 7.92146 15.8306 7.92146H17.3438V4.95189C17.3438 4.95189 15.9705 4.71627 14.6576 4.71627C11.9165 4.71627 10.125 6.38751 10.125 9.41306V12.0733H7.07813V15.5636H10.125V23.9994C10.7359 24.0942 11.3623 24.1466 12 24.1466C12.6377 24.1466 13.2641 24.0942 13.875 23.9994V15.5636H16.6711Z" fill="white"/>
                    </svg>
                    <span className="font-sans font-medium text-[14px] sm:text-[16px] leading-[24px] text-[#000000] whitespace-nowrap">
                      {t('Sign in with Facebook', 'Facebook')}
                    </span>
                  </button>
                  <button type="button" onClick={handleGoogleSignup} className="w-full sm:flex-1 h-[40px] [@media(min-height:740px)]:h-[44px] [@media(min-height:840px)]:h-[48px] lg:h-[48px] bg-white border border-[#D9D9D9] rounded-[10px] flex items-center justify-center gap-[10px] transition-colors hover:bg-gray-50">
                    {/* Google */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
                      <path d="M3.15302 7.3455L6.43851 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z" fill="#FF3D00"/>
                      <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.6055 17.5455 13.3575 18 12 18C9.399 18 7.1905 16.3415 6.3585 14.027L3.0975 16.5395C4.7525 19.778 8.1135 22 12 22Z" fill="#4CAF50"/>
                      <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
                    </svg>
                    <span className="font-sans font-medium text-[14px] sm:text-[16px] leading-[24px] text-[#000000] whitespace-nowrap">
                      {t('Sign in with Google', 'Google')}
                    </span>
                  </button>
                </div>

              {/* Sign In Link */}
              <div className="w-full flex justify-center mt-[16px] [@media(min-height:740px)]:mt-[24px] [@media(min-height:840px)]:mt-[32px] 3xl:mt-[32px]">
                <Link href="/login" className="font-sans font-medium text-[14px] transition-colors">
                  <span className="text-[#000000]">{t('Have an account?', 'Vous avez déjà un compte ?')} </span>
                  <span className="text-[#174CD2]">{t('Sign In', 'Se connecter')}</span>
                </Link>
              </div>

            </div>
          ) : (
            /* VERIFICATION STEP */
            <form onSubmit={handleFinalRegister} className="flex flex-col gap-[28px] animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col gap-[20px]">
                  <h3 className="font-sans font-medium text-[24px] text-[#000000] mb-[20px]">
                    {t('Enter Verification Code', 'Entrez le code de vérification')}
                  </h3>
                  <div className="w-full border border-[#D9D9D9] rounded-[10px] overflow-hidden">
                    <input 
                      type="text" 
                      placeholder="123456" 
                      maxLength={6} 
                      value={code} 
                      onChange={(e) => setCode(e.target.value)} 
                      className="w-full h-[60px] bg-transparent text-center text-3xl tracking-[0.5em] font-mono font-bold outline-none text-[#000000] focus:bg-gray-50 transition-colors" 
                      autoFocus 
                    />
                  </div>
                  <p className="font-sans text-[14px] text-[#555C60] text-center">
                    {t('We sent a verification code to your email.', 'Nous avons envoyé un code à votre e-mail.')}
                  </p>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-[32px] bg-[#174CD2] rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin w-[20px] h-[20px] text-white"/> : <><FaCheck className="text-white"/> <span className="text-white font-sans font-bold">{t('Verify & Create Account', 'Vérifier & Créer le compte')}</span></>}
                </button>
                <button type="button" onClick={() => setStep('FORM')} className="text-[#000000] hover:underline hover:text-[#174CD2] text-[14px] font-sans">
                  {t('Change email address', 'Changer d\'adresse e-mail')}
                </button>
            </form>
          )}

        </div>
      </div>

      {/* Right Side: Visuals */}
      <div className="hidden lg:flex lg:w-1/2 mt-6 mb-6 mr-6 relative overflow-hidden rounded-[24px] bg-[#174CD2] flex-col items-center justify-center">
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Silk
            speed={3.9}
            scale={1}
            color="#174CD2"
            noiseIntensity={1.5}
            rotation={0}
          />
          <p className="absolute bottom-8 right-8 z-10 max-w-[380px] text-right font-sans font-extrabold text-[33px] leading-[36px] text-white">
            {t('Join our active users and boost your online presence', 'Rejoignez nos utilisateurs actifs et boostez votre présence en ligne')}
          </p>
        </div>
      </div>

    </div>
  );
}
