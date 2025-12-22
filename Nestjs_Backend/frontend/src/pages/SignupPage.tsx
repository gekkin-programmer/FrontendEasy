import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa6';
import { signup } from '../api';

const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signup(fullName, email, password);
      alert("Account created successfully! Please log in.");
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 lg:grid lg:grid-cols-2">
      
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <a href="/"><img className="h-10 w-auto" src="/Wiggle Logo.png" alt="EAsyPost Logo" /></a>
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create your free account</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Join thousands of creators and start growing your brand today.</p>
          </div>
          <div className="mt-10">
            <div>
              <button type="button" className="w-full flex items-center justify-center gap-3 rounded-md bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FaGoogle className="w-5 h-5" /> Sign up with Google
              </button>
            </div>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">OR</span></div>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Full Name</label>
                <div className="mt-2">
                  <input id="full-name" name="full-name" type="text" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="block w-full rounded-md border-0 py-2.5 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#3C48F6] sm:text-sm sm:leading-6 transition-all" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Email Address</label>
                <div className="mt-2">
                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-md border-0 py-2.5 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#3C48F6] sm:text-sm sm:leading-6 transition-all" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Password</label>
                <div className="relative mt-2">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-md border-0 py-2.5 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#3C48F6] sm:text-sm sm:leading-6 transition-all pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && (<div className="rounded-md bg-red-50 p-4"><div className="flex"><div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div></div></div>)}
              <div className="text-xs text-gray-500">By signing up, you agree to our <a href="/terms" className="font-medium text-[#3C48F6] hover:underline">Terms of Service</a>.</div>
              <div>
                <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md bg-[#3C48F6] px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <FaSpinner className="animate-spin h-5 w-5" /> : 'Sign up for free'}
                </button>
              </div>
            </form>
            <p className="mt-10 text-center text-sm text-gray-500">Already have an account?{' '}<a href="/login" className="font-semibold leading-6 text-[#3C48F6] hover:text-blue-500">Log in</a></p>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-[#111111] overflow-hidden">
        <div className="w-full max-w-md text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 leading-tight">Start your growth journey</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">See your audience and engagement take off.</p>
        </div>
        <div className="w-full max-w-lg">
          <motion.svg viewBox="0 0 400 200" className="w-full h-auto" initial="hidden" animate="visible">
            <defs><linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3C48F6" stopOpacity="0.5" /><stop offset="100%" stopColor="#3C48F6" stopOpacity="0" /></linearGradient></defs>
            <motion.path d="M 20 180 C 80 150, 150 50, 250 80 S 380 10, 380 10" fill="url(#chartGradient)" initial={{ pathLength: 0, opacity: 0 }} variants={{ visible: { pathLength: 1, opacity: 1, transition: { duration: 1.5, delay: 0.5, ease: "easeOut" }}}} />
            <motion.path d="M 20 180 C 80 150, 150 50, 250 80 S 380 10, 380 10" fill="none" stroke="#3C48F6" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} variants={{ visible: { pathLength: 1, transition: { duration: 1.5, ease: "easeInOut" }}}} />
            {[ { cx: 150, cy: 50, delay: 0.8 }, { cx: 250, cy: 80, delay: 1.2 }, { cx: 380, cy: 10, delay: 1.5 }, ].map((dot, i) => (
              <motion.circle key={i} cx={dot.cx} cy={dot.cy} r="6" fill="#3C48F6" stroke="white" strokeWidth="2" initial={{ scale: 0, opacity: 0 }} variants={{ visible: { scale: 1, opacity: 1, transition: { delay: dot.delay }}}}>
                {i === 2 && (<animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />)}
              </motion.circle>
            ))}
            <path d="M 20 10 L 20 180 L 380 180" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" />
          </motion.svg>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;