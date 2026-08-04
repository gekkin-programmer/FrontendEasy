import React from 'react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-950 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last Updated: April 25, 2026</p>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. They allow the site to remember your preferences, keep you logged in, and understand how you interact with the service. Eazlypost uses cookies and similar technologies to provide, improve, and secure the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Cookies We Use</h2>
            <div className="space-y-4 mt-2">
              <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Essential Cookies</h3>
                <p className="text-sm">
                  Required for the platform to function. These include session tokens, authentication cookies, and CSRF protection tokens. You cannot opt out of these — without them, the service cannot operate.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Preference Cookies</h3>
                <p className="text-sm">
                  Remember your settings such as language selection (English / French) and dark/light theme. These improve your experience across sessions.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Analytics Cookies</h3>
                <p className="text-sm">
                  Help us understand how users navigate Eazlypost so we can improve performance and usability. We use Sentry for error tracking. No personally identifiable information is shared with analytics providers.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Third-Party Cookies</h2>
            <p>
              Some features on Eazlypost may set cookies from third-party services:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong className="text-gray-900 dark:text-gray-100">Google OAuth</strong> — sets a session cookie during sign-in to identify your Google account.</li>
              <li><strong className="text-gray-900 dark:text-gray-100">Sentry</strong> — sets a session identifier for error tracking and performance monitoring.</li>
            </ul>
            <p className="mt-3">
              We do not use advertising cookies or share cookie data with advertisers or data brokers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. How to Manage Cookies</h2>
            <p>
              You can control cookies through your browser settings. Most browsers allow you to view, delete, and block cookies. Note that disabling essential cookies will prevent you from using Eazlypost.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong className="text-gray-900 dark:text-gray-100">Chrome:</strong>{' '}
                Settings → Privacy and Security → Cookies and other site data
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-100">Firefox:</strong>{' '}
                Settings → Privacy &amp; Security → Cookies and Site Data
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-100">Safari:</strong>{' '}
                Preferences → Privacy → Manage Website Data
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be reflected on this page with an updated date. Continued use of Eazlypost after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8">
            <p className="text-sm">
              Questions about our cookie practices? Contact us at{' '}
              <a href="mailto:support@eazypost.cm" className="text-blue-600 dark:text-blue-400 hover:underline">
                support@eazypost.cm
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
