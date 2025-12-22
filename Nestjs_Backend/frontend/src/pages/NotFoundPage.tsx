import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900 text-center px-4">
      <FaExclamationTriangle className="text-yellow-400 h-16 w-16 mb-4" />
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <h2 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-200">
        Page Not Found
      </h2>
      <p className="mt-4 max-w-sm text-gray-600 dark:text-gray-400">
        Sorry, we couldn’t find the page you’re looking for. Maybe you mistyped the URL?
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#3C48F6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <FaHome />
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;