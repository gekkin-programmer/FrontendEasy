'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaGoogle, FaEye, FaEyeSlash, FaArrowLeft, 
  FaUser, FaBriefcase, FaCamera, FaGlobe, FaBuilding, FaCheck 
} from 'react-icons/fa6';

// Import your custom loader
import SpinningLoader from '@/src/component/SpinningLoader';

// --- DATA CONFIGURATION ---

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
    { id: 'p_free', name: 'Free', price: '$0', period: '/mo', features: ['1 Workspace', '2 Social Accounts', '10 Posts/month'] },
    { id: 'p_basic', name: 'Basic', price: '$9', period: '/mo', features: ['1 Workspace', '5 Social Accounts', '50 Posts/month'] },
  ],
  business: [
    { id: 'b_starter', name: 'Starter', price: '$29', period: '/mo', features: ['2 Workspaces', '10 Social Accounts', '100 Posts/month'] },
    { id: 'b_pro', name: 'Pro', price: '$79', period: '/mo', isPopular: true, features: ['5 Workspaces', '25 Social Accounts', '500 Posts/month'] },
    { id: 'b_prem', name: 'Premium', price: '$199', period: '/mo', features: ['10 Workspaces', '50 Social Accounts', 'Unlimited Posts'] },
  ],
  creator: [
    { id: 'c_start', name: 'Starter', price: '$19', period: '/mo', features: ['1 Workspace', 'Multi-platform', 'Analytics'] },
    { id: 'c_pro', name: 'Pro', price: '$49', period: '/mo', features: ['Audience Insights', 'Collab Tools', 'Unlimited Posts'] },
  ],
  agency: [
    { id: 'a_team', name: 'Team', price: '$149', period: '/mo', features: ['Unlimited Clients', 'White-label Reports', '5 Seats'] },
    { id: 'a_agency', name: 'Agency', price: '$399', period: '/mo', features: ['API Access', 'Priority Support', '15 Seats'] },
  ],
  enterprise: [
    { id: 'ent_custom', name: 'Custom', price: 'Contact', period: '', features: ['Custom Limits', 'SLA Support', 'Dedicated Manager'] }
  ]
};

// --- COMPONENT ---

const SignupPage = () => {
  const router = useRouter();
  
  // STEPS: 1 = Account, 2 = Category, 3 = Plan
  const [step, setStep] = useState(1);
  
  // FORM STATE
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  
  // UI STATE
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HANDLERS ---

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.password.length >= 6) {
      setStep(2);
      setError(null);
    } else {
      setError("Password must be at least 6 characters");
    }
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId as CategoryType);
    setStep(3);
  };

  const handleFinalSubmit = async (planId: string) => {
    setIsLoading(true);

    try {
                   // 1. Create the User Payload
      const userData = {
        ...formData,
        category: selectedCategory,
        plan: planId,
        joinedAt: new Date().toISOString()
      };

      console.log("Registering user:", userData);
      
      // 2. SIMULATE API & SAVE TO LOCAL STORAGE
      // In real app: await api.register(userData)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for animation
      
      if (typeof window !== 'undefined') {
        // Save to storage so Workspace Manager can read it
        localStorage.setItem('user_session', JSON.stringify(userData));
        
        // Clear any old workspaces to simulate a fresh account
        // (Optional: Remove this line if you want to keep old data)
        localStorage.removeItem('workspaces_db'); 
      }
      
      // 3. Redirect
      router.push('/workspaces'); 
    } catch (err: any) {
      setError("Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderStep1_Account = () => (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create an account</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Start your 14-day free trial.</p>
      </div>

      <button type="button" className="w-full flex items-center justify-center gap-3 rounded-md bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <FaGoogle className="w-5 h-5" /> Sign up with Google
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
        <div className="relative flex justify-center text-sm"><span className="bg-white dark:bg-gray-900 px-2 text-gray-500">OR</span></div>
      </div>

      <form onSubmit={handleAccountSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Email Address</label>
          <input 
            type="email" required 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            className="mt-2 block w-full rounded-md border-0 py-2.5 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-[#3C48F6]" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Password</label>
          <div className="relative mt-2">
            <input 
              type={showPassword ? 'text' : 'password'} required 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              className="block w-full rounded-md border-0 py-2.5 pr-10 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-[#3C48F6]" 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

        <button type="submit" className="w-full flex justify-center rounded-md bg-[#3C48F6] px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
          Continue
        </button>
      </form>
    </>
  );

  const renderStep2_Category = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <button onClick={() => setStep(1)} className="mb-6 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2"><FaArrowLeft /> Back</button>
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">How will you use EasyPost?</h1>
      <p className="text-gray-500 mb-8">We'll customize your experience based on your needs.</p>

      <div className="grid gap-4">
        {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
                <button 
                    key={cat.id} 
                    onClick={() => handleCategorySelect(cat.id)}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#3C48F6] hover:bg-blue-50/50 dark:hover:bg-gray-800 transition-all text-left group"
                >
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-[#3C48F6] group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{cat.desc}</p>
                    </div>
                </button>
            )
        })}
      </div>
    </div>
  );

  const renderStep3_Plans = () => {
    const plans = selectedCategory ? PLANS[selectedCategory] : [];
    
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setStep(2)} className="mb-6 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2"><FaArrowLeft /> Back</button>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose your {selectedCategory} plan</h1>
        <p className="text-gray-500 mb-8">You can change this anytime. 14-day free trial included.</p>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div 
                key={plan.id}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${plan.isPopular ? 'border-[#3C48F6] bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
            >
                {plan.isPopular && <span className="absolute -top-3 right-4 bg-[#3C48F6] text-white text-xs font-bold px-2 py-1 rounded-full">POPULAR</span>}
                
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h3>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}<span className="text-sm font-normal text-gray-500">{plan.period}</span></div>
                    </div>
                    <button 
                        onClick={() => handleFinalSubmit(plan.id)}
                        disabled={isLoading}
                        className="bg-white text-[#3C48F6] border border-[#3C48F6] hover:bg-[#3C48F6] hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                        Select
                    </button>
                </div>
                
                <ul className="space-y-2">
                    {plan.features.map((feat: string, i: number) => (
                        <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300 gap-2">
                            <FaCheck className="text-[#3C48F6] w-4 h-4" /> {feat}
                        </li>
                    ))}
                </ul>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 lg:grid lg:grid-cols-2 relative">
      
      {/* 
        ✅ BRANDED LOADING OVERLAY 
        This will block the entire screen when isLoading is true
      */}
      {isLoading && <SpinningLoader fullScreen={true} size={80} />}

      {/* LEFT COLUMN: DYNAMIC STEPS */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 overflow-y-auto max-h-screen">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
             <Link href="/" className="inline-block">
               <Image className="h-10 w-auto" src="/assets/Wiggle-Logo.png" alt="Logo" width={150} height={40} />
             </Link>
          </div>

          {/* STEP RENDERER */}
          {step === 1 && renderStep1_Account()}
          {step === 2 && renderStep2_Category()}
          {step === 3 && renderStep3_Plans()}
          
          {step === 1 && (
            <p className="mt-10 text-center text-sm text-gray-500">
              Already have an account? <Link href="/login" className="font-semibold text-[#3C48F6] hover:text-blue-500">Log in</Link>
            </p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: STATIC VISUAL */}
      <div className="relative hidden lg:flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900">
        <div className="absolute inset-0 w-full h-full">
          <Image src="/assets/Sarah.jpg" alt="Office Workspace" fill className="object-cover" priority quality={90} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="relative z-10 mt-auto p-12 text-white">
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            "The category-specific features saved us hours. Being able to choose the 'Agency' workflow from day one was a game changer."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
               <Image src="/assets/PBD.jpg" alt="User" fill className="rounded-full border-2 border-white object-cover" />
            </div>
            <div>
              <p className="font-bold">Sarah Jenkins</p>
              <p className="text-sm text-gray-300">Marketing Director @ TechFlow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;