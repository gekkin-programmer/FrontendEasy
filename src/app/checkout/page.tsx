'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Smartphone, ShieldCheck, 
  Loader2, CheckCircle2, AlertCircle, CreditCard
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { toast } from 'sonner';
import Navbar from '@/src/components/Navbar';
import Image from 'next/image';
import { getCookie } from 'cookies-next';
import { useLanguage } from '@/src/context/LanguageContext';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ➤ AUTH CHECK (disabled for design tweaking)
  // useEffect(() => {
  //   const token = getCookie('accessToken');
  //   if (!token) {
  //     toast.error("Veuillez vous connecter pour procéder au paiement.");
  //     router.push('/login?redirect=/checkout');
  //   }
  // }, [router]);
  
  const plan = searchParams.get('plan') || 'PRO';
  const price = searchParams.get('price') || '14900';
  const cycle = searchParams.get('cycle') || 'MONTHLY';

  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState('MTN_MOMO_CMR');
  const [loading, setLoading] = useState(false);
  const [step, setStatus] = useState<'form' | 'processing' | 'success' | 'failed'>('form');

  // Poll transaction status until COMPLETED/FAILED or timeout (5 min)
  const pollStatus = (transactionId: string) => {
    const INTERVAL = 3000;
    const TIMEOUT = 5 * 60 * 1000;
    const start = Date.now();

    const interval = setInterval(async () => {
      try {
        const { status } = await api.get<{ status: string }>(`/payments/status/${transactionId}`);

        if (status === 'COMPLETED') {
          clearInterval(interval);
          setStatus('success');
        } else if (status === 'FAILED' || status === 'REJECTED') {
          clearInterval(interval);
          toast.error("Paiement refusé ou échoué. Veuillez réessayer.");
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
        amount: parseInt(price),
        phone: cleanPhone,
        billingCycle: cycle,
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

  return (
    <div className="max-w-4xl mx-auto pt-32 pb-20 px-4">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 font-black uppercase text-xs mb-8 hover:text-[#3C48F5] transition-colors"
      >
        <ArrowLeft size={16} /> {t('Back to pricing', 'Retour aux tarifs')}
      </button>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        
        {/* LEFT: PLAN SUMMARY */}
        <div className="space-y-8">
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none text-black dark:text-white">
                {t('Finalize your', 'Finalisez votre')}<br/>
                <span className="text-[#3C48F5]">{t('Subscription.', 'Abonnement.')}</span>
            </h1>
            
            <div className="bg-black dark:bg-black border-4 border-black dark:border-white p-8 shadow-[12px_12px_0px_0px_#3C48F5]">
                <div className="flex justify-between items-center mb-6 border-b-2 border-zinc-700 dark:border-zinc-800 pb-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('Selected Plan', 'Plan Sélectionné')}</p>
                        <h3 className="text-2xl font-black uppercase text-white">{plan}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('Cycle', 'Cycle')}</p>
                        <h3 className="text-sm font-black uppercase text-white">{cycle === 'YEARLY' ? t('Yearly', 'Annuel') : t('Monthly', 'Mensuel')}</h3>
                    </div>
                </div>

                <div className="flex justify-between items-center text-3xl font-black text-white">
                    <span>TOTAL</span>
                    <span className="text-white">{parseInt(price).toLocaleString()} FCFA</span>
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white">
                <ShieldCheck size={20} />
                <p className="text-[10px] font-black uppercase tracking-wider">{t('100% secure payment via Mobile Money', 'Paiement 100% sécurisé via Mobile Money')}</p>
            </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="bg-white dark:bg-black text-black dark:text-white border-4 border-black dark:border-white p-10 shadow-[16px_16px_0px_0px_#000] dark:shadow-[16px_16px_0px_0px_#fff]">
            {step === 'form' && (
                <form onSubmit={handlePayment} className="space-y-8">
                    <h2 className="text-2xl font-black uppercase border-b-4 border-black dark:border-white pb-4">{t('Payment Info', 'Infos de Paiement')}</h2>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">{t('Operator', 'Opérateur')}</label>
                        <div className="grid grid-cols-2 gap-4">
                            <OperatorBtn
                                active={operator === 'MTN_MOMO_CMR'}
                                onClick={() => setOperator('MTN_MOMO_CMR')}
                                label="MTN MoMo"
                                icon="/assets/MTNmoney.png"
                                color="bg-yellow-400"
                            />
                            <OperatorBtn
                                active={operator === 'ORANGE_CMR'}
                                onClick={() => setOperator('ORANGE_CMR')}
                                label="Orange Money"
                                icon="/assets/Orangemoney.png"
                                color="bg-orange-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">{t('Phone Number', 'Numéro de Téléphone')}</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm text-gray-400">+237</div>
                            <input 
                                type="tel" 
                                required 
                                placeholder="6XX XXX XXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pl-16 pr-4 py-4 bg-gray-50 dark:bg-black border-4 border-black dark:border-white font-black text-lg focus:bg-blue-50 dark:focus:bg-zinc-800 outline-none text-black dark:text-white transition-all"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#3C48F5] text-white py-6 font-black uppercase text-xl border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>{t('Pay', 'Payer')} {parseInt(price).toLocaleString()} FCFA</>}
                    </button>
                </form>
            )}

            {step === 'processing' && (
                <div className="py-20 text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                        <Loader2 className="w-full h-full text-[#3C48F5] animate-spin" />
                        <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#3C48F5]" />
                    </div>
                    <h2 className="text-2xl font-black uppercase">{t('Validating...', 'Validation en cours...')}</h2>
                    <p className="text-sm font-bold text-gray-500 leading-relaxed">
                        {t('A PIN prompt has been sent to your phone.', 'Un prompt PIN a été envoyé sur votre téléphone.')}<br/>
                        {t('Enter your secret code to confirm.', 'Saisissez votre code secret pour confirmer.')}
                    </p>
                </div>
            )}

            {step === 'success' && (
                <div className="py-20 text-center space-y-8">
                    <div className="w-24 h-24 bg-green-500 border-4 border-black dark:border-white mx-auto flex items-center justify-center shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff]">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase mb-2">{t('Success!', 'Succès !')}</h2>
                        <p className="text-sm font-bold text-gray-500">
                            {t('Your payment has been processed. Your account will be updated shortly.', 'Votre paiement a été traité. Votre compte sera mis à jour dans quelques instants.')}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#3C48F5]"
                    >
                        {t('Go to Dashboard', 'Aller au Dashboard')}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function OperatorBtn({ active, onClick, label, icon, color }: any) {
    return (
        <button 
            type="button"
            onClick={onClick}
            className={`p-4 border-4 transition-all flex flex-col items-center gap-2 ${
                active ? 'border-black dark:border-white bg-white dark:bg-black shadow-none translate-x-1 translate-y-1' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:border-black dark:hover:border-white'
            }`}
        >
            <div className="relative w-10 h-10">
                <Image src={icon} alt={label} fill className="object-contain" />
            </div>
            <span className="text-[10px] font-black uppercase text-black dark:text-white">{label}</span>
        </button>
    )
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-[#3C48F5] transition-colors duration-300">
      <Navbar />
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#3C48F5]" size={48} /></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
