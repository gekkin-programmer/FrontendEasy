import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Deletion | EazyPost Africa',
  description: 'How to delete your EazyPost data and revoke Facebook/Instagram access.',
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Data Deletion Instructions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          In compliance with the Meta Platform Terms and applicable privacy laws, this page explains how to remove EazyPost&apos;s access to your Facebook and Instagram data, and how to permanently delete your EazyPost account and all associated data.
        </p>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">

          {/* Method 1 */}
          <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Method 1 — Revoke Facebook / Instagram Access (Recommended)
            </h2>
            <p className="mb-4 text-sm">
              This removes EazyPost&apos;s access to your Facebook and Instagram data. Your EazyPost account will remain active but social accounts will be disconnected.
            </p>
            <ol className="list-decimal pl-5 space-y-3 text-sm">
              <li>Go to <strong>Facebook.com → Settings &amp; Privacy → Settings</strong>.</li>
              <li>In the left sidebar, click <strong>&quot;Apps and Websites&quot;</strong>.</li>
              <li>Find <strong>&quot;EazyPost&quot;</strong> in the list and click it.</li>
              <li>Click <strong>&quot;Remove&quot;</strong> and confirm.</li>
              <li>Facebook will notify EazyPost via our Data Deletion Callback URL, and we will delete all data obtained through those permissions within 48 hours.</li>
            </ol>
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              Alternatively, within the EazyPost dashboard, go to <strong>Settings → Connected Accounts</strong> and click &quot;Disconnect&quot; next to any Facebook or Instagram account.
            </p>
          </section>

          {/* Method 2 */}
          <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Method 2 — Full Account &amp; Data Deletion
            </h2>
            <p className="mb-4 text-sm">
              This permanently deletes your EazyPost account, all your posts, media files, workspace data, and any data we obtained from connected platforms.
            </p>
            <ol className="list-decimal pl-5 space-y-3 text-sm">
              <li>
                <strong>Via the dashboard:</strong> Go to <strong>Settings → Account → Delete Account</strong> and follow the on-screen confirmation steps.
              </li>
              <li>
                <strong>Via email:</strong> Send a request to{' '}
                <a href="mailto:support@eazypost.cm?subject=Data%20Deletion%20Request" className="text-blue-600 hover:underline font-semibold">
                  support@eazypost.cm
                </a>{' '}
                with the subject line <strong>&quot;Data Deletion Request&quot;</strong>. Include your registered email address and, if applicable, the Facebook user ID or Page ID associated with the account.
              </li>
            </ol>
            <p className="mt-4 text-sm">
              We will process all deletion requests within <strong>48 hours</strong> and send a confirmation to your email address.
            </p>
          </section>

          {/* What gets deleted */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What Data Is Deleted</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Your EazyPost account profile (name, email, avatar).</li>
              <li>All posts, drafts, and scheduled content.</li>
              <li>All media files you uploaded to EazyPost.</li>
              <li>Stored OAuth access tokens for Facebook, Instagram, LinkedIn, Twitter/X, and TikTok.</li>
              <li>Workspace memberships and team data associated with your account.</li>
              <li>Analytics data and audience metrics retrieved via platform APIs.</li>
            </ul>
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
              Note: Content already published to your social media pages remains on those platforms and must be deleted directly on those platforms.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <p className="text-sm">
              Questions? Contact our privacy team at{' '}
              <a href="mailto:support@eazypost.cm" className="text-blue-600 hover:underline">
                support@eazypost.cm
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
