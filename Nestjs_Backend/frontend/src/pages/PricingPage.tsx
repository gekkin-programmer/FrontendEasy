import React, { useState } from 'react';
import Logo from '../assets/Wiggle Logo.png';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

// --- DATA for our pricing plans ---
const plans = [
  {
    name: 'Free',
    price: { monthly: 0, annually: 0 },
    description: 'For individuals starting out.',
    features: [
      '1 Social Channel',
      '10 Scheduled Posts',
      'Core Analytics',
      'Basic Support',
    ],
    isMostPopular: false,
    cta: 'Get started for free',
  },
  {
    name: 'Pro',
    price: { monthly: 15, annually: 12 },
    description: 'For professionals and growing brands.',
    features: [
      '10 Social Channels',
      'Unlimited Scheduled Posts',
      'Advanced Analytics & Reporting',
      'Engagement Tools',
      'Priority Support',
    ],
    isMostPopular: true,
    cta: 'Start your free trial',
  },
  {
    name: 'Business',
    price: { monthly: 100, annually: 80 },
    description: 'For teams and agencies managing multiple brands.',
    features: [
      'Unlimited Social Channels',
      'Advanced Collaboration Tools',
      'Custom Branding',
      'API Access',
      'Dedicated Account Manager',
    ],
    isMostPopular: false,
    cta: 'Contact Sales',
  },
];

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  return (
    <div className="bg-white dark:bg-gray-900 pt-24 sm:pt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Choose the perfect plan for your needs. Grow your brand with EAsyPost.
          </p>
        </div>

        {/* Monthly/Annually Toggle */}
        <div className="mt-16 flex justify-center">
          <div className="relative rounded-full p-1 bg-gray-100 dark:bg-gray-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 w-32 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                billingCycle === 'monthly' ? 'text-white' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annually')}
              className={`relative z-10 w-32 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                billingCycle === 'annually' ? 'text-white' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Annually
            </button>
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 z-0 p-1"
              animate={{ x: billingCycle === 'monthly' ? 0 : '100%' }}
            >
              <div className="h-full w-32 rounded-full bg-[#3C48F6]" />
            </motion.div>
             <span className="absolute -top-2 -right-14 -rotate-12 rounded-full bg-indigo-200 dark:bg-indigo-900 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                Save 20%
              </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <motion.div 
          className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.2 }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 }}}
              className={`relative rounded-2xl p-8 ring-1 ${
                plan.isMostPopular ? 'bg-gray-900 dark:bg-gray-900/80 ring-2 ring-[#3C48F6]' : 'bg-white dark:bg-gray-800 ring-gray-200 dark:ring-gray-700'
              }`}
            >
              {plan.isMostPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <p className="rounded-full bg-[#3C48F6] px-3 py-1 text-xs font-semibold leading-6 text-white">
                    Most Popular
                  </p>
                </div>
              )}

              <h3 className={`text-2xl font-bold ${plan.isMostPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
              <p className={`mt-4 text-sm ${plan.isMostPopular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className={`text-4xl font-bold tracking-tight ${plan.isMostPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  ${plan.price[billingCycle]}
                </span>
                <span className={`text-sm font-semibold ${plan.isMostPopular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                  /month
                </span>
              </p>
              <a href="/signup" className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 shadow-sm ${
                  plan.isMostPopular ? 'bg-white text-[#3C48F6] hover:bg-gray-100' : 'bg-[#3C48F6] text-white hover:bg-blue-500'
              }`}>
                {plan.cta}
              </a>
              <ul className={`mt-8 space-y-3 text-sm leading-6 ${plan.isMostPopular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3 items-center">
                    <FaCheckCircle className={`h-5 w-5 flex-none ${plan.isMostPopular ? 'text-white' : 'text-[#3C48F6]'}`} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;