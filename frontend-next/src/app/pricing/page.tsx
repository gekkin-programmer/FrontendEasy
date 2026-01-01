'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';

const PLANS = [
  {
    name: "Starter",
    price: 0,
    desc: "Perfect for individuals just getting started.",
    features: ["1 Workspace", "3 Social Accounts", "10 Scheduled Posts", "Basic Analytics"],
    missing: ["Team Members", "AI Assistant", "Approval Workflows"],
    cta: "Start for Free",
    popular: false
  },
  {
    name: "Pro",
    price: 29,
    desc: "For creators and small businesses growing fast.",
    features: ["5 Workspaces", "10 Social Accounts", "Unlimited Posts", "Advanced Analytics", "AI Assistant (GPT-4)", "Priority Support"],
    missing: ["Approval Workflows"],
    cta: "Get Started",
    popular: true
  },
  {
    name: "Agency",
    price: 99,
    desc: "For agencies managing multiple brands.",
    features: ["Unlimited Workspaces", "Unlimited Accounts", "Unlimited Posts", "White-label Reports", "Team Roles & Approvals", "Dedicated Manager"],
    missing: [],
    cta: "Contact Sales",
    popular: false
  }
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-gray-900 dark:text-white font-sans selection:bg-[#314BEC] selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            Simple pricing for <span className="text-[#314BEC]">everyone.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 dark:text-gray-400"
          >
            Choose the plan that fits your growth. No hidden fees. Cancel anytime.
          </motion.p>

          {/* Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <span className={`text-sm font-medium ${!annual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Monthly</span>
            <button 
              onClick={() => setAnnual(!annual)}
              className="w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-1 relative transition-colors"
            >
              <div className={`w-5 h-5 bg-[#314BEC] rounded-full shadow-md transition-transform ${annual ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Yearly <span className="text-[#314BEC] text-xs font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-1">-20%</span>
            </span>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className={`relative p-8 rounded-2xl border ${plan.popular ? 'border-[#314BEC] ring-4 ring-[#314BEC]/10 shadow-xl' : 'border-gray-200 dark:border-gray-800 shadow-sm'} bg-white dark:bg-gray-900 flex flex-col`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#314BEC] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[40px]">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-extrabold">${annual ? Math.round(plan.price * 0.8) : plan.price}</span>
                <span className="text-gray-500 text-sm">/month</span>
                {annual && plan.price > 0 && (
                  <p className="text-xs text-[#314BEC] font-medium mt-1">Billed ${Math.round(plan.price * 0.8) * 12} yearly</p>
                )}
              </div>

              <Link 
                href="/signup" 
                className={`w-full py-3 rounded-xl font-bold text-center transition-all ${
                  plan.popular 
                    ? 'bg-[#314BEC] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {plan.cta}
              </Link>

              <div className="mt-8 space-y-4 flex-1">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="p-0.5 bg-green-100 dark:bg-green-900/30 rounded-full mt-0.5">
                      <Check size={12} className="text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="flex items-start gap-3 opacity-50">
                    <div className="p-0.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-0.5">
                      <X size={12} className="text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-500">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}