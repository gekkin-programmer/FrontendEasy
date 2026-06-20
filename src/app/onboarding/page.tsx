'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaArrowLeft, FaUser, FaBriefcase, FaCamera, FaGlobe, FaBuilding, FaCheck } from 'react-icons/fa6';
import SpinningLoader from '@/components/common/SpinningLoader'; 

// --- 1. DATA CONFIGURATION (Unchanged) ---

type CategoryType = 'personal' | 'business' | 'creator' | 'agency' | 'enterprise';

const CATEGORIES = [
  { id: 'personal', name: 'Personal', icon: FaUser, desc: 'Individual users & hobbyists' },
  { id: 'business', name: 'Business', icon: FaBriefcase, desc: 'Shops & companies' },
  { id: 'creator', name: 'Creator', icon: FaCamera, desc: 'Influencers & content creators' },
  { id: 'agency', name: 'Agency', icon: FaGlobe, desc: 'Marketing agencies managing clients' },
  { id: 'enterprise', name: 'Enterprise', icon: FaBuilding, desc: 'Large organizations' },
];

const PLANS: Record<string, any[]> = {
  personal: [
    { id: 'FREE', name: 'Gratuit', price: '0 FCFA', period: '/mois', features: ['1 Workspace', '2 Social Accounts', '10 Posts/mois'] },
    { id: 'STARTER', name: 'Starter', price: '4,900 FCFA', period: '/mois', features: ['3 Workspaces', '5 Social Accounts', '100 Posts/mois'] },
  ],
  business: [
    { id: 'STARTER', name: 'Starter', price: '4,900 FCFA', period: '/mois', features: ['3 Workspaces', '5 Social Accounts', '100 Posts/mois'] },
    { id: 'PROFESSIONAL', name: 'Pro', price: '14,900 FCFA', period: '/mois', isPopular: true, features: ['10 Workspaces', '15 Social Accounts', 'Unlimited Posts'] },
  ],
  creator: [
    { id: 'STARTER', name: 'Starter', price: '4,900 FCFA', period: '/mois', features: ['3 Workspaces', '5 Social Accounts', '100 Posts/mois'] },
    { id: 'PROFESSIONAL', name: 'Pro', price: '14,900 FCFA', period: '/mois', features: ['10 Workspaces', '15 Social Accounts', 'Unlimited Posts'] },
  ],
  agency: [
    { id: 'PROFESSIONAL', name: 'Pro', price: '14,900 FCFA', period: '/mois', features: ['10 Workspaces', '15 Social Accounts', 'Unlimited Posts'] },
    { id: 'ENTERPRISE', name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited Everything', 'White-label', 'Dedicated Support'] },
  ],
  enterprise: [
    { id: 'ENTERPRISE', name: 'Enterprise', price: 'Sur devis', period: '', features: ['Unlimited Everything', 'Custom Integrations', 'SLA Support'] }
  ]
};

// --- 2. COMPONENT ---

export default function OnboardingPage() {
  const router = useRouter();

  // State
  const [step, setStep] = useState(1); // 1 = Category, 2 = Plan
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 🌍 Config
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // --- AUTH CHECK ---
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthChecking(false);
    }
  }, [router]);

  // --- HANDLERS ---

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId as CategoryType);
    setStep(2);
  };

  const handleFinalSubmit = async (planId: string) => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');

    try {
      // 1. Update User Plan in Backend
      await fetch(`${API_URL}/users/upgrade-pro`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType: planId }) 
      });

      // 2. Determine Workspace Creation
      // Agencies/Businesses ALWAYS get a professional workspace.
      const safeCategory = selectedCategory || 'personal';
      const isProfessional = ['business', 'agency', 'enterprise', 'creator'].includes(safeCategory);

      if (isProfessional) {
        const workspaceName = `${safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1)} Workspace`;
        const res = await fetch(`${API_URL}/workspaces`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: workspaceName }),
        });

        if (!res.ok) throw new Error('Failed to create workspace');
        const workspaceData = await res.json();
        const workspace = workspaceData.data || workspaceData;
        
        // Success: Redirect to that professional workspace
        router.push(`/dashboard/${workspace.id}`); 
      } else {
        // Individual flow: Redirect to root dashboard which will pick their default workspace
        router.push('/dashboard');
      }

    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER STEPS ---

  if (isAuthChecking) return <SpinningLoader fullScreen={true} />;

  const renderCategoryStep = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">How will you use EasyPost?</h1>
        <p className="text-gray-500 mt-2">We&apos;ll customize your experience based on your needs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
                <button 
                    key={cat.id} 
                    onClick={() => handleCategorySelect(cat.id)}
                    className="flex items-center gap-5 p-5 rounded-2xl border border-gray-200 hover:border-[#174CD2] hover:bg-blue-50/50 transition-all text-left group bg-white shadow-sm hover:shadow-md"
                >
                    <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-[#174CD2] group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{cat.name}</h3>
                        <p className="text-sm text-gray-500">{cat.desc}</p>
                    </div>
                </button>
            )
        })}
      </div>
    </div>
  );

  const renderPlanStep = () => {
    const plans = selectedCategory ? PLANS[selectedCategory] : [];
    
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => setStep(1)} 
          className="mb-6 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors"
        >
          <FaArrowLeft /> Back to categories
        </button>
        
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Choose your {selectedCategory} plan</h1>
            <p className="text-gray-500 mt-2">You can change this anytime. 14-day free trial included.</p>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div 
                key={plan.id}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all bg-white ${plan.isPopular ? 'border-[#174CD2] shadow-lg shadow-blue-500/10' : 'border-gray-100 hover:border-gray-300 shadow-sm'}`}
            >
                {plan.isPopular && (
                    <span className="absolute -top-3 right-6 bg-[#174CD2] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        POPULAR
                    </span>
                )}
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h3 className="font-bold text-xl text-gray-900">{plan.name}</h3>
                        <div className="flex items-baseline mt-1">
                            <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                            <span className="text-sm text-gray-500 font-medium ml-1">{plan.period}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleFinalSubmit(plan.id)}
                        disabled={isLoading}
                        className="bg-[#174CD2] text-white hover:bg-blue-700 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Setting up...' : 'Select Plan'}
                    </button>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                    <ul className="grid sm:grid-cols-2 gap-3">
                        {plan.features.map((feat: string, i: number) => (
                            <li key={i} className="flex items-center text-sm text-gray-600 gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaCheck className="text-[#174CD2] w-2.5 h-2.5" />
                                </div>
                                {feat}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 flex min-h-[700px]">
         
         {/* LEFT SIDE: Content */}
         <div className="w-full lg:w-3/5 p-8 sm:p-12 overflow-y-auto">
            <div className="mb-8">
               <Image src="/assets/WiggleLogo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
            </div>

            {step === 1 && renderCategoryStep()}
            {step === 2 && renderPlanStep()}
         </div>

         {/* RIGHT SIDE: Visual */}
         <div className="hidden lg:block w-2/5 bg-gray-900 relative">
            <div className="absolute inset-0">
                <Image 
                    src="/assets/Sarah.jpg" 
                    alt="Onboarding Visual" 
                    fill 
                    className="object-cover opacity-60" 
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />
            
            <div className="relative h-full flex flex-col justify-end p-10 text-white z-10">
                <div className="mb-6">
                    <div className="flex gap-1 mb-2">
                        {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                    </div>
                    <p className="text-lg font-medium leading-relaxed opacity-90">
                        &ldquo;Setting up my workspace took less than 2 minutes. The onboarding experience is seamless.&rdquo;
                    </p>
                </div>
                
                <div className="flex items-center gap-3 pt-6 border-t border-white/20">
                    <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm">
                        <Image src="/assets/3.jpg" alt="User" width={40} height={40} className="object-cover" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Marcus Chen</p>
                        <p className="text-xs text-gray-400">Content Creator</p>
                    </div>
                </div>
            </div>
         </div>

      </div>
    </div>
  );
}