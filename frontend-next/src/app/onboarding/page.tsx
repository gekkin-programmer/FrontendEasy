'use client';

import React, { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api"; 
import { useRouter } from 'next/navigation';
import { useMutation, useConvexAuth } from "convex/react";
import Image from 'next/image';
import { FaArrowLeft, FaUser, FaBriefcase, FaCamera, FaGlobe, FaBuilding, FaCheck } from 'react-icons/fa6';
import { Loader2 } from "lucide-react"; 

// --- 1. DATA CONFIGURATION ---

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
    { id: 'personal-free', name: 'Free', price: '$0', period: '/mo', features: ['1 Workspace', '2 Social Accounts', '10 Posts/month'] },
    { id: 'personal-pro', name: 'Basic', price: '$9', period: '/mo', features: ['1 Workspace', '5 Social Accounts', '50 Posts/month'] },
  ],
  business: [
    { id: 'business-starter', name: 'Starter', price: '$29', period: '/mo', features: ['2 Workspaces', '10 Social Accounts', '100 Posts/month'] },
    { id: 'business-pro', name: 'Pro', price: '$79', period: '/mo', isPopular: true, features: ['5 Workspaces', '25 Social Accounts', '500 Posts/month'] },
  ],
  creator: [
    { id: 'creator-starter', name: 'Starter', price: '$19', period: '/mo', features: ['1 Workspace', 'Multi-platform', 'Analytics'] },
    { id: 'creator-pro', name: 'Pro', price: '$49', period: '/mo', features: ['Audience Insights', 'Collab Tools', 'Unlimited Posts'] },
  ],
  agency: [
    { id: 'agency-team', name: 'Team', price: '$149', period: '/mo', features: ['Unlimited Clients', 'White-label Reports', '5 Seats'] },
    { id: 'agency-pro', name: 'Agency', price: '$399', period: '/mo', features: ['API Access', 'Priority Support', '15 Seats'] },
  ],
  enterprise: [
    { id: 'enterprise-custom', name: 'Custom', price: 'Contact', period: '', features: ['Custom Limits', 'SLA Support', 'Dedicated Manager'] }
  ]
};

// --- 2. COMPONENT ---

export default function OnboardingPage() {
  const { isAuthenticated } = useConvexAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Convex Mutations
  const createWorkspace = useMutation(api.workspaces.create);
  const storeUser = useMutation(api.users.store);

  // State
  const [step, setStep] = useState(1); // 1 = Category, 2 = Plan
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- HANDLERS ---

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId as CategoryType);
    setStep(2);
  };

  const handleFinalSubmit = async (planId: string) => {
    if (!isAuthenticated || !user) {
      console.error("Not authenticated with Convex yet");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Ensure User is synced to Convex DB
      await storeUser();

      // 2. Create the Workspace
      // We default the name to "[Name]'s Workspace"
      const workspaceName = user.firstName 
        ? `${user.firstName}'s Workspace` 
        : "My Workspace";

      const workspaceId = await createWorkspace({ 
        name: workspaceName,
        plan: planId
        // Note: Ensure your backend mutation accepts 'plan' if you want to store it
        // For now, we mainly need the workspace created.
      });

      // 3. Redirect to Dashboard
      router.push(`/dashboard/${workspaceId}`);

    } catch (err) {
      console.error("Onboarding failed:", err);
      setIsLoading(false);
      // Optional: Add a toast.error("Something went wrong") here
    }
  };

  // --- RENDER STEPS ---

  if (!isLoaded) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  const renderCategoryStep = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">How will you use EasyPost?</h1>
        <p className="text-gray-500 mt-2">We'll customize your experience based on your needs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
                <button 
                    key={cat.id} 
                    onClick={() => handleCategorySelect(cat.id)}
                    className="flex items-center gap-5 p-5 rounded-2xl border border-gray-200 hover:border-[#3C48F6] hover:bg-blue-50/50 transition-all text-left group bg-white shadow-sm hover:shadow-md"
                >
                    <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-[#3C48F6] group-hover:text-white transition-colors">
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
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all bg-white ${plan.isPopular ? 'border-[#3C48F6] shadow-lg shadow-blue-500/10' : 'border-gray-100 hover:border-gray-300 shadow-sm'}`}
            >
                {plan.isPopular && (
                    <span className="absolute -top-3 right-6 bg-[#3C48F6] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
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
                        className="bg-[#3C48F6] text-white hover:bg-blue-700 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Setting up...' : 'Select Plan'}
                    </button>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                    <ul className="grid sm:grid-cols-2 gap-3">
                        {plan.features.map((feat: string, i: number) => (
                            <li key={i} className="flex items-center text-sm text-gray-600 gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaCheck className="text-[#3C48F6] w-2.5 h-2.5" />
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
                        "Setting up my workspace took less than 2 minutes. The onboarding experience is seamless."
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