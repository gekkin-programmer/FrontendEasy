import React from 'react';

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Data Deletion Instructions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Platform Compliance</p>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
          <section>
            <p>
              According to the Facebook Platform rules, we provide User Data Deletion Callback URL or Data Deletion Instructions URL. If you want to delete your activities for Eazlypost, you can remove your information by following these steps:
            </p>
          </section>

          <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Method 1: Via Facebook Settings</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Go to your Facebook Account&apos;s &ldquo;Settings &amp; Privacy&rdquo;.</li>
              <li>Click &ldquo;Settings&rdquo;.</li>
              <li>Look for &ldquo;Apps and Websites&rdquo; and you will see all of the apps and websites you linked with your Facebook.</li>
              <li>Search and Click &ldquo;Eazlypost&rdquo; in the search bar.</li>
              <li>Scroll and click &ldquo;Remove&rdquo;.</li>
              <li>Congratulations, you have successfully removed your app activities.</li>
            </ol>
          </section>

          <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Method 2: Permanent Account Deletion</h2>
            <p className="mb-4">To request a full deletion of your Eazlypost account and all associated data from our servers:</p>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Send an email to <strong>support@eazlypost.cm</strong>.</li>
              <li>Subject Line: <strong>&ldquo;Data Deletion Request&rdquo;</strong>.</li>
              <li>Include your registered email address.</li>
            </ol>
            <p className="mt-4 text-sm text-gray-500">We will process your request and permanently delete your data within 48 hours.</p>
          </section>
        </div>
      </div>
    </div>
  );
}