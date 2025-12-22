import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa6';
import { resetPassword } from '../api';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No reset token found. This link may be invalid.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Cannot reset password without a valid token.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(token, password);
      setSuccessMessage("Your password has been reset successfully! Redirecting to log in...");
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect after 3 seconds
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <a href="/"><img className="mx-auto h-10 w-auto" src="/Wiggle Logo.png" alt="EAsyPost Logo" /></a>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {successMessage ? (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">New Password</label>
                <div className="mt-2">
                  <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-md border-0 py-2.5 text-gray-900 dark:bg-gray-700 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-[#3C48F6]" />
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Confirm New Password</label>
                <div className="mt-2">
                  <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="block w-full rounded-md border-0 py-2.5 text-gray-900 dark:bg-gray-700 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-[#3C48F6]" />
                </div>
              </div>
              {error && (<p className="text-sm font-medium text-red-600">{error}</p>)}
              <div>
                <button type="submit" disabled={isLoading || !token} className="flex w-full justify-center rounded-md bg-[#3C48F6] px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50">
                  {isLoading ? <FaSpinner className="animate-spin h-5 w-5" /> : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;