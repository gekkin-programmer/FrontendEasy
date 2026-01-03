import React, { useState } from 'react';
import { motion } from 'framer-motion';
import User from '../assets/3.jpg'
import PBD from '../assets/PBD.jpg';
import { FaInstagram, FaLinkedinIn, FaTwitter, FaCheckCircle } from "react-icons/fa";
import Logo from '../assets/Wiggle Logo.png';
// --- 1. IMPORT Link from react-router-dom ---
import { Link } from 'react-router-dom'; 
import { FaGoogle, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa6';
import { login } from '../api';

const LoginPage: React.FC = () => {
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
      await login(email, password);
      alert("Login successful! Redirecting to dashboard...");
      window.location.href = '/'; 
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
            {/* Using Link for the logo as well is good practice */}
            <Link to="/"><img className="h-10 w-auto" src={Logo} alt="EAsyPost Logo" /></Link>
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to continue to EAsyPost.</p>
          </div>
          <div className="mt-10">
            <div>
              <button type="button" className="w-full flex items-center justify-center gap-3 rounded-md bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FaGoogle className="w-5 h-5" /> Continue with Google
              </button>
            </div>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">OR</span></div>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Email Address</label>
                <div className="mt-2">
                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-md border-0 py-2.5 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#3C48F6] sm:text-sm sm:leading-6 transition-all" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Password</label>
                <div className="relative mt-2">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-md border-0 py-2.5 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#3C48F6] sm:text-sm sm:leading-6 transition-all pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && (<div className="rounded-md bg-red-50 p-4"><div className="flex"><div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div></div></div>)}
              
              {/* --- 2. THE FIX: Replace <a> with <Link> and href="#" with to="/forgot-password" --- */}
              <div className="text-sm text-right">
                <Link to="/forgot-password" className="font-semibold text-[#3C48F6] hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>

              <div>
                <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md bg-[#3C48F6] px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <FaSpinner className="animate-spin h-5 w-5" /> : 'Sign in'}
                </button>
              </div>
            </form>
            <p className="mt-10 text-center text-sm text-gray-500">Don't have an account?{' '}
              <Link to="/signup" className="font-semibold leading-6 text-[#3C48F6] hover:text-blue-500">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* The right-side visual panel remains the same */}
      <div className="relative hidden lg:flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900">
  {/* 1. The Background Image */}
  <img 
    src={User}
    alt="Office Workspace" 
    className="absolute inset-0 w-full h-full object-cover"
  />
  
  {/* 2. The Overlay (Gradient) to make text readable */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

  {/* 3. The Text at the bottom */}
  <div className="relative z-10 mt-auto p-12 text-white">
    <blockquote className="text-2xl font-medium leading-relaxed mb-6">
      "EasyPost completely changed how our agency manages content. We save about 15 hours a week."
    </blockquote>
    <div className="flex items-center gap-4">
      <img 
        src={PBD}
        alt="User" 
        className="w-12 h-12 rounded-full border-2 border-white"
      />
      <div>
        <p className="font-bold">Dr Ahmed Abdullah</p>
        <p className="text-sm text-gray-300">Social Media Manager @ PBD</p>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default LoginPage;