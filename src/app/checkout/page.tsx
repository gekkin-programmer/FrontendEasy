'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Smartphone } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import { useLanguage } from '@/context/LanguageContext';

// Same pricing model as /tarifs: FCFA base × accounts, -20% yearly, converted
// to the selected currency (EUR = fixed CFA peg, USD approximate).
const FCFA_RATES: Record<string, number> = { FCFA: 1, EUR: 655.957, USD: 600 };
const CURRENCIES = ['FCFA', 'EUR', 'USD'];
const PLAN_BASES: Record<string, number> = { GRATUIT: 0, ESSENTIEL: 1500, AVANCE: 5000 };

function StepDot({ state }: { state: 'done' | 'active' | 'upcoming' }) {
  if (state === 'active') {
    return (
      <span className="w-[31px] h-[31px] rounded-full border-2 border-[#184CD1] flex items-center justify-center flex-shrink-0">
        <span className="w-[15px] h-[15px] rounded-full bg-[#184CD1]" />
      </span>
    );
  }
  return (
    <span
      className={`w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 ${
        state === 'done' ? 'border-[#184CD1]' : 'border-[#184CD1]/50'
      }`}
    />
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  // Checkout requires an account — bounce to login and come back with the same plan params.
  // ➤ TEMPORARILY DISABLED for presentation/demo. Re-enable by removing the `if (false)` guard.
  useEffect(() => {
    const token = getCookie('accessToken');
    if (!token) {
      toast.error(t('Please log in to proceed with payment.', 'Veuillez vous connecter pour procéder au paiement.'));
      router.replace(`/login?redirect=${encodeURIComponent(`/checkout?${searchParams.toString()}`)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planParam = (searchParams.get('plan') || 'ESSENTIEL').toUpperCase();
  const plan = planParam in PLAN_BASES ? planParam : 'ESSENTIEL';
  const accounts = Math.min(50, Math.max(1, parseInt(searchParams.get('accounts') || '1', 10) || 1));
  const isYearly = searchParams.get('billing') === 'yearly';
  const currencyParam = searchParams.get('currency') || 'FCFA';
  const currency = CURRENCIES.includes(currencyParam) ? currencyParam : 'FCFA';

  const planLabels: Record<string, string> = {
    GRATUIT: t('FREE', 'Gratuit'),
    ESSENTIEL: t('ESSENTIAL', 'Essentiel'),
    AVANCE: t('ADVANCED', 'AVANCÉ'),
  };

  const monthlyFcfa = PLAN_BASES[plan] * accounts * (isYearly ? 0.8 : 1);
  // Yearly plans are charged 12 discounted months up front.
  const dueFcfa = monthlyFcfa * (isYearly ? 12 : 1);

  const fmt = (fcfa: number) => {
    const amount = fcfa / FCFA_RATES[currency];
    if (currency === 'EUR') {
      return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    }
    if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${Math.round(fcfa).toLocaleString('fr-FR')} FCFA`;
  };

  const [method, setMethod] = useState<'card' | 'momo' | 'paypal'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState('MTN_MOMO_CMR');
  const [loading, setLoading] = useState(false);
  const [step, setStatus] = useState<'form' | 'processing' | 'success' | 'failed'>('form');

  // After a successful payment, send the user to their dashboard.
  useEffect(() => {
    if (step !== 'success') return;
    const timer = setTimeout(() => router.push('/dashboard'), 5000);
    return () => clearTimeout(timer);
  }, [step, router]);

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  // Poll transaction status until COMPLETED/FAILED or timeout (5 min)
  const pollStatus = (transactionId: string) => {
    const INTERVAL = 3000;
    const TIMEOUT = 5 * 60 * 1000;
    const start = Date.now();

    const interval = setInterval(async () => {
      try {
        const { status, failureCode } = await api.get<{ status: string; failureCode?: string }>(`/payments/status/${transactionId}`);

        if (status === 'COMPLETED') {
          clearInterval(interval);
          setStatus('success');
        } else if (status === 'FAILED' || status === 'REJECTED') {
          clearInterval(interval);
          const reason = failureCode ? ` (${failureCode})` : '';
          toast.error(t(`Payment failed${reason}. Please try again.`, `Paiement échoué${reason}. Veuillez réessayer.`));
          setStatus('form');
        } else if (Date.now() - start > TIMEOUT) {
          clearInterval(interval);
          toast.error("Le paiement a expiré. Veuillez réessayer.");
          setStatus('form');
        }
      } catch {
        // ignore transient errors, keep polling
      }
    }, INTERVAL);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (method === 'card') {
      toast.error(t(
        'Card payments are coming soon. Please use Mobile Money.',
        'Le paiement par carte arrive bientôt. Veuillez utiliser Mobile Money.'
      ));
      return;
    }

    if (method === 'paypal') {
      toast.error(t(
        'PayPal payments are coming soon. Please use Mobile Money.',
        'Le paiement PayPal arrive bientôt. Veuillez utiliser Mobile Money.'
      ));
      return;
    }

    if (phone.length < 9) {
      toast.error("Veuillez entrer un numéro de téléphone valide.");
      return;
    }

    setLoading(true);
    setStatus('processing');

    try {
      const cleanPhone = phone.startsWith('237') ? phone : `237${phone}`;

      const { transactionId } = await api.post<{ transactionId: string }>('/payments/initiate', {
        planType: plan,
        amount: Math.round(dueFcfa),
        phone: cleanPhone,
        billingCycle: isYearly ? 'YEARLY' : 'MONTHLY',
        operator,
      });

      toast.success("Paiement initié ! Validez le prompt PIN sur votre téléphone.");
      pollStatus(transactionId);
    } catch (error: any) {
      toast.error(error.message || "Échec de l'initiation du paiement");
      setStatus('form');
    } finally {
      setLoading(false);
    }
  };

  const steps: { label: string; state: 'done' | 'active' | 'upcoming' }[] = [
    { label: t('Plan', 'Offre'), state: 'done' },
    { label: t('Billing', 'Facturation'), state: step === 'success' ? 'done' : 'active' },
    { label: t('Confirmation', 'Confirmation'), state: step === 'success' ? 'active' : 'upcoming' },
  ];

  return (
    // Negative top margin cancels the root layout's page padding — checkout has no navbar
    <div className="min-h-screen bg-white font-sans flex flex-col lg:flex-row -mt-16 md:-mt-1">
      {/* Left column — steps + payment form */}
      <div className="flex-1 px-6 md:px-[71px] pt-[54px] pb-[60px]">
        {/* Stepper */}
        <div className="flex items-center w-full max-w-[770px]">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && (
                <span
                  className={`flex-1 h-0 border-t mx-[10px] ${
                    s.state === 'upcoming' ? 'border-black/30' : 'border-black'
                  }`}
                />
              )}
              <span className="flex items-center gap-[12px]">
                <StepDot state={s.state} />
                <span
                  className={`text-[22px] leading-[31px] tracking-[0.01em] ${
                    s.state === 'upcoming' ? 'text-black/40' : 'text-black'
                  }`}
                >
                  {s.label}
                </span>
              </span>
            </React.Fragment>
          ))}
        </div>

        {step === 'form' && (
          <form onSubmit={handlePayment}>
            {/* Payment method */}
            <h2 className="text-[22px] leading-[31px] tracking-[0.01em] text-black mt-[72px]">
              {t('Payment Method', 'Méthode de paiement')}
            </h2>
            <div className="flex flex-wrap items-center gap-x-[56px] gap-y-[20px] mt-[30px]">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className="flex items-center gap-[16px]"
                aria-pressed={method === 'card'}
              >
                <span className="w-[18px] h-[18px] rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                  {method === 'card' && <span className="w-[10px] h-[10px] rounded-full bg-black" />}
                </span>
                <svg width="33" height="33" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="1.5" y="4.5" width="21" height="15" rx="2.5" stroke="#000000" strokeWidth="2" />
                  <rect x="1.5" y="7.8" width="21" height="3.4" fill="#000000" />
                  <path d="M5.5 15.5H11" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="flex items-center gap-[12px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/pay-visa.webp" alt="Visa" className="h-[16px] w-auto" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/pay-mastercard.webp" alt="Mastercard" className="h-[24px] w-auto" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('momo')}
                className="flex items-center gap-[16px]"
                aria-pressed={method === 'momo'}
              >
                <span className="w-[18px] h-[18px] rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                  {method === 'momo' && <span className="w-[10px] h-[10px] rounded-full bg-black" />}
                </span>
                <span className="text-[15px] leading-[21px] text-black">Mobile Money</span>
                <span className="flex items-center gap-[12px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/pay-orange.webp" alt="Orange Money" className="h-[28px] w-auto" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/pay-mtn.webp" alt="MTN Mobile Money" className="h-[28px] w-auto" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('paypal')}
                className="flex items-center gap-[16px]"
                aria-pressed={method === 'paypal'}
              >
                <span className="w-[18px] h-[18px] rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                  {method === 'paypal' && <span className="w-[10px] h-[10px] rounded-full bg-black" />}
                </span>
                <span className="text-[15px] leading-[21px] text-black">PayPal</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/pay-paypal.webp" alt="PayPal" className="h-[28px] w-auto" />
              </button>
            </div>

            {/* Payment details */}
            <h2 className="text-[22px] leading-[31px] tracking-[0.01em] text-black mt-[64px]">
              {t('Payment Details', 'Détails de paiement')}
            </h2>

            {method === 'card' ? (
              <div className="mt-[40px] max-w-[574px] flex flex-col gap-[46px]">
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder={t('Enter Name on Card', 'Nom inscrit sur la carte')}
                  autoComplete="cc-name"
                  className="w-full bg-transparent border-0 border-b border-black/40 pb-[10px] text-[15px] leading-[21px] tracking-[0.01em] text-black placeholder:text-black/40 focus:outline-none focus:border-[#184CD1]"
                />
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder={t('Card Number', 'Numéro de carte')}
                    autoComplete="cc-number"
                    className="w-full bg-transparent border-0 border-b border-black/40 pb-[10px] pr-[100px] text-[15px] leading-[21px] tracking-[0.01em] text-black placeholder:text-black/40 focus:outline-none focus:border-[#184CD1]"
                  />
                  <span className="absolute right-0 bottom-[10px] flex items-center gap-[10px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/pay-visa.webp" alt="Visa" className="h-[13px] w-auto" />
                    <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M5.19617 5.4L1.52588e-05 1.90735e-06L10.3923 1.90735e-06L5.19617 5.4Z" fill="#C4C4C4" />
                    </svg>
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-[78px] gap-y-[46px]">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder={t('Expiration', 'Expiration')}
                    autoComplete="cc-exp"
                    className="w-[252px] bg-transparent border-0 border-b border-black/40 pb-[10px] text-[15px] leading-[21px] tracking-[0.01em] text-black placeholder:text-black/40 focus:outline-none focus:border-[#184CD1]"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="CVV"
                    autoComplete="cc-csc"
                    className="w-[244px] bg-transparent border-0 border-b border-black/40 pb-[10px] text-[15px] leading-[21px] tracking-[0.01em] text-black placeholder:text-black/40 focus:outline-none focus:border-[#184CD1]"
                  />
                </div>
              </div>
            ) : method === 'paypal' ? (
              <p className="mt-[40px] max-w-[574px] text-[15px] leading-[21px] tracking-[0.01em] text-black/60">
                {t(
                  'You will be redirected to PayPal to complete your payment.',
                  'Vous serez redirigé vers PayPal pour finaliser votre paiement.'
                )}
              </p>
            ) : (
              <div className="mt-[40px] max-w-[574px] flex flex-col gap-[40px]">
                <div className="flex flex-wrap items-center gap-x-[56px] gap-y-[20px]">
                  <button
                    type="button"
                    onClick={() => setOperator('MTN_MOMO_CMR')}
                    className="flex items-center gap-[14px]"
                    aria-pressed={operator === 'MTN_MOMO_CMR'}
                  >
                    <span className="w-[18px] h-[18px] rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                      {operator === 'MTN_MOMO_CMR' && <span className="w-[10px] h-[10px] rounded-full bg-black" />}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/pay-mtn.webp" alt="MTN Mobile Money" className="h-[28px] w-auto" />
                    <span className="text-[15px] leading-[21px] text-black">MTN MoMo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperator('ORANGE_CMR')}
                    className="flex items-center gap-[14px]"
                    aria-pressed={operator === 'ORANGE_CMR'}
                  >
                    <span className="w-[18px] h-[18px] rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                      {operator === 'ORANGE_CMR' && <span className="w-[10px] h-[10px] rounded-full bg-black" />}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/pay-orange.webp" alt="Orange Money" className="h-[28px] w-auto" />
                    <span className="text-[15px] leading-[21px] text-black">Orange Money</span>
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-0 bottom-[10px] text-[15px] leading-[21px] text-black/60">+237</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder={t('Phone Number', 'Numéro de téléphone')}
                    className="w-full bg-transparent border-0 border-b border-black/40 pb-[10px] pl-[48px] text-[15px] leading-[21px] tracking-[0.01em] text-black placeholder:text-black/40 focus:outline-none focus:border-[#184CD1]"
                  />
                </div>
              </div>
            )}

            {/* Terms + actions */}
            <p className="mt-[52px] max-w-[453px] text-[15px] leading-[21px] tracking-[0.01em] text-black/40">
              {t(
                'By clicking “Confirm Payment” I agree to the ',
                'En cliquant sur « Confirmer le paiement », j’accepte les '
              )}
              <a href="/legal/terms" target="_blank" rel="noopener" className="underline hover:text-black/70">
                {t('Terms of Service', "Conditions d'utilisation")}
              </a>
            </p>
            <div className="flex flex-wrap items-center gap-[24px] lg:gap-[71px] mt-[42px]">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-[193px] h-[54px] rounded-[4px] border border-black font-bold text-[16px] leading-[23px] tracking-[0.01em] text-black"
              >
                {t('Back', 'Retour')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="min-w-[338px] h-[54px] px-[30px] rounded-[4px] bg-[#184CD1] text-white font-bold text-[16px] leading-[23px] tracking-[0.01em] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>{t('Confirm Payment', 'Confirmer le paiement')} : {fmt(dueFcfa)}</>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'processing' && (
          <div className="mt-[120px] max-w-[574px] text-center flex flex-col items-center gap-[24px]">
            <div className="relative w-[96px] h-[96px]">
              <Loader2 className="w-full h-full text-[#184CD1] animate-spin" strokeWidth={1.2} />
              <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#184CD1]" />
            </div>
            <h2 className="text-[22px] leading-[31px] tracking-[0.01em] text-black">
              {t('Validating...', 'Validation en cours...')}
            </h2>
            <p className="text-[15px] leading-[21px] text-black/60">
              {t('A PIN prompt has been sent to your phone.', 'Un prompt PIN a été envoyé sur votre téléphone.')}<br />
              {t('Enter your secret code to confirm.', 'Saisissez votre code secret pour confirmer.')}
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="mt-[110px] max-w-[574px] text-center flex flex-col items-center gap-[24px]">
            {/* Secured payment illustration, in brand blue */}
            <svg width="181" height="152" viewBox="0 0 181 152" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M157.014 70.1098V52.335C157.014 49.5735 154.776 47.335 152.014 47.335H67.9782C65.2168 47.335 62.9782 49.5735 62.9782 52.335V107.126C62.9782 109.887 65.2168 112.126 67.9782 112.126H117.865" stroke="#184CD1" strokeWidth="2" strokeLinecap="round" />
              <path d="M73.995 95.6333H92.8809" stroke="#184CD1" strokeWidth="2" strokeLinecap="round" />
              <path d="M99.1761 95.6333H101.93" stroke="#184CD1" strokeWidth="2" strokeLinecap="round" />
              <rect x="64.1586" y="55.9739" width="91.6755" height="10.9948" fill="#184CD1" />
              <ellipse cx="141.67" cy="97.5969" rx="11.4103" ry="11.3874" fill="#184CD1" />
              <path fillRule="evenodd" clipRule="evenodd" d="M0.488637 81.679C-0.197381 91.323 3.85662 112.706 25.5595 124.142C25.6803 124.206 25.8203 124.215 25.9454 124.161C35.0514 120.188 52.609 106.309 51.8161 81.6723C51.8096 81.4693 51.663 81.2906 51.4657 81.2423C50.7744 81.0732 50.1127 80.9138 49.4765 80.7606C40.2413 78.5359 36.3997 77.6106 26.1023 67.2382C25.9163 67.0509 25.6061 67.0519 25.4277 67.2464C21.5572 71.4683 11.8063 79.5878 0.875657 81.2722C0.6657 81.3046 0.50371 81.4671 0.488637 81.679ZM34.8104 89.6905C35.4567 88.7948 35.2544 87.5447 34.3586 86.8984C33.4629 86.2522 32.2128 86.4545 31.5665 87.3502L24.1032 97.6952L20.6869 93.0209C20.0351 92.1291 18.7838 91.9346 17.8921 92.5863C17.0003 93.2381 16.8057 94.4894 17.4575 95.3812L22.1287 101.772C23.1135 103.12 25.1265 103.114 26.1029 101.76L34.8104 89.6905Z" fill="#184CD1" />
              <path d="M149.958 87.3828C151.078 87.004 152.28 86.7983 153.531 86.7983C159.598 86.7983 164.515 91.633 164.515 97.5968C164.515 103.561 159.598 108.395 153.531 108.395C152.28 108.395 151.078 108.19 149.958 107.811" stroke="#184CD1" strokeWidth="2" strokeLinecap="round" />
              <path d="M31.7959 56.1702C40.5087 24.3715 69.6652 1 104.291 1C145.796 1 179.442 34.5786 179.442 76C179.442 117.421 145.796 151 104.291 151C81.2226 151 60.5815 140.626 46.7961 124.298" stroke="#184CD1" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h2 className="text-[30px] leading-[140.8%] tracking-[0.01em] text-black">
              {t('Payment successful!', 'Paiement réussi !')}
            </h2>
            <p className="text-[15px] leading-[21px] text-black/60">
              {t(
                'Your payment has been processed. Your account will be updated shortly.',
                'Votre paiement a été traité. Votre compte sera mis à jour dans quelques instants.'
              )}<br />
              {t('Redirecting to your dashboard…', 'Redirection vers votre tableau de bord…')}
            </p>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-[338px] h-[54px] rounded-[4px] bg-[#184CD1] text-white font-bold text-[16px] leading-[23px] tracking-[0.01em]"
            >
              {t('Go to Dashboard', 'Aller au Dashboard')}
            </button>
          </div>
        )}
      </div>

      {/* Right column — order summary panel */}
      <aside className="relative overflow-hidden w-full lg:w-[795px] flex-shrink-0 bg-[#184CD1] px-6 md:px-[67px] pt-[54px] pb-[60px]">
        {/* Decorative curve — anchored in the empty bottom-right corner so it never crosses the summary content */}
        <svg
          width="460"
          height="940"
          viewBox="0 0 460 940"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-[-130px] bottom-[-170px] opacity-50 pointer-events-none hidden lg:block"
          aria-hidden="true"
        >
          <path
            d="M73.7567 915.927C117.689 860.302 179.027 792.089 153.92 664.157C122.535 504.243 -42.7435 421.804 11.2567 204.302C54.4569 30.3004 329.766 -16.884 459.459 5.80219M438.756 166.302C372.032 164.424 278.033 189.342 224.757 241.802C171.48 294.262 167.058 414.866 189.257 476.302C196.18 503.43 216.526 583.669 207.756 689.802C200.741 774.709 137.304 876.424 96.6887 915.927L126.756 939.302C244.172 798.045 255.257 710.802 274.257 664.157C292.757 593.802 299.606 468.936 336.256 417.802C381.053 355.302 420.59 361.969 438.756 361.302"
            stroke="white"
          />
        </svg>
        <h1 className="relative max-w-[453px] text-[30px] leading-[140.8%] tracking-[0.01em] text-white">
          {t('EazyPost subscription', 'Abonnement EazyPost')} {planLabels[plan]}
        </h1>
        <div className="mt-[26px] w-full max-w-[410px] h-[101px] border-2 border-white flex items-center justify-center gap-[12px] px-[16px]">
          <span className="text-[42px] leading-[59px] tracking-[0.085em] text-white whitespace-nowrap">{fmt(monthlyFcfa)}</span>
          <span className="text-[20px] leading-[28px] text-white/70">{t('per month', 'par mois')}</span>
        </div>
        <ul className="mt-[48px] flex flex-col gap-[18px] text-[18px] leading-[140.8%] tracking-[0.01em] text-white max-w-[453px]">
          <li className="flex items-center justify-between gap-[20px]">
            <span>{t('Social accounts', 'Comptes sociaux')}</span>
            <span className="font-medium">{accounts}</span>
          </li>
          <li className="flex items-center justify-between gap-[20px]">
            <span>{t('Billing cycle', 'Cycle de facturation')}</span>
            <span className="font-medium">
              {isYearly ? t('Yearly (-20%)', 'Annuel (-20%)') : t('Monthly', 'Mensuel')}
            </span>
          </li>
          <li className="flex items-center justify-between gap-[20px]">
            <span>{t('Currency', 'Devise')}</span>
            <span className="font-medium">{currency}</span>
          </li>
          <li className="flex items-center justify-between gap-[20px] border-t border-white/40 pt-[18px] mt-[6px]">
            <span>{t('Total due today', 'Total dû aujourd’hui')}</span>
            <span className="font-semibold">{fmt(dueFcfa)}</span>
          </li>
        </ul>
        <p className="mt-[30px] max-w-[453px] text-[15px] leading-[21px] text-white/70">
          {isYearly
            ? t(
                'Yearly plans are billed for 12 months upfront with a 20% discount.',
                'Les offres annuelles sont facturées 12 mois d’avance avec 20% de réduction.'
              )
            : t(
                'Monthly plans renew automatically. Cancel anytime.',
                'Les offres mensuelles se renouvellent automatiquement. Annulez à tout moment.'
              )}
        </p>
        <Link
          href="/tarifs"
          className="inline-block mt-[24px] text-[15px] leading-[21px] text-white underline hover:opacity-80"
        >
          {t('Change plan', "Changer d'offre")}
        </Link>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-[#184CD1]" size={48} />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
