import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#000000] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-[#000000] p-8 md:p-12 rounded-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: April 25, 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to EazyPost (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it. Our use of information received from Google APIs adheres to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-gray-100">Personal Information:</strong> Name, email address, and profile picture (via Google Sign-In).</li>
              <li><strong className="text-gray-100">Authentication Data:</strong> OAuth tokens and session data to maintain your login state.</li>
              <li><strong className="text-gray-100">Social Media Data:</strong> We access your connected social accounts (Facebook Pages, Instagram Business, LinkedIn, etc.) strictly to perform actions you authorize (scheduling posts, reading analytics).</li>
              <li><strong className="text-gray-100">Content:</strong> Images, videos, and text you upload to our platform.</li>
            </ul>
          </section>

          {/* ─── Google API Services — required by Google verification ─── */}
          <section className="border border-blue-800 bg-blue-950/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              3. Google API Services &amp; User Data
            </h2>
            <p className="mb-4">
              EazyPost uses Google Sign-In (OAuth 2.0) solely to authenticate users. The following sections describe exactly how we interact with Google user data.
            </p>

            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-gray-100 mb-1">3a. Data Accessed</h3>
                <p>When you sign in with Google, we request the following OAuth 2.0 scopes:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong className="text-gray-100">email</strong> — your primary Google account email address.</li>
                  <li><strong className="text-gray-100">profile</strong> — your display name (given and family name) and profile photo URL.</li>
                </ul>
                <p className="mt-2">
                  We do not request access to Gmail, Google Drive, Google Calendar, Google Contacts, or any other Google service beyond basic identity information.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-100 mb-1">3b. Data Usage</h3>
                <p>Google user data is used exclusively for the following purposes:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Creating or identifying your EazyPost account (account registration and login).</li>
                  <li>Pre-filling your display name and avatar in the application.</li>
                  <li>Sending transactional emails (password resets, workspace invitations) to your Google email address.</li>
                </ul>
                <p className="mt-2">
                  We do <strong className="text-gray-100">not</strong> use Google user data to train AI or machine-learning models, serve advertisements, or transfer data to data brokers or advertisers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-100 mb-1">3c. Data Sharing</h3>
                <p>
                  We do not sell or share your Google user data with any third party except as strictly necessary to operate the service:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>
                    <strong className="text-gray-100">Resend</strong> — receives your email address solely to deliver transactional emails you have requested (e.g., OTP codes, workspace invitations).
                  </li>
                  <li>
                    <strong className="text-gray-100">Neon (PostgreSQL)</strong> — your account data (name, email, profile photo URL, Google account ID) is stored in our cloud database to maintain your account.
                  </li>
                </ul>
                <p className="mt-2">
                  Your Google user data is never shared with AI content-generation providers (OpenAI, DeepSeek, Groq), analytics platforms, or any other third party.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-100 mb-1">3d. Data Storage &amp; Protection</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>All data is transmitted over encrypted HTTPS/TLS connections.</li>
                  <li>Account data is stored in a Neon PostgreSQL serverless database with access restricted to authenticated backend services only.</li>
                  <li>Google OAuth access tokens are used transiently during sign-in and are <strong className="text-gray-100">not</strong> persisted to our database after your session is established.</li>
                  <li>Our backend infrastructure is hosted on hardened Docker containers with network-level firewall rules and no direct public database access.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-100 mb-1">3e. Data Retention &amp; Deletion</h3>
                <p>
                  Google user data (name, email, profile photo URL, Google account ID) is retained for as long as your EazyPost account is active. If you delete your account or submit a deletion request:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>All personal data associated with your account is permanently deleted from our database within <strong className="text-gray-100">48 hours</strong>.</li>
                  <li>Backups containing your data are purged within <strong className="text-gray-100">30 days</strong>.</li>
                </ul>
                <p className="mt-2">
                  To request deletion, email{' '}
                  <a href="mailto:support@eazypost.cm" className="text-blue-400 hover:underline">
                    support@eazypost.cm
                  </a>{' '}
                  with the subject line <strong className="text-gray-100">&ldquo;Data Deletion Request&rdquo;</strong> and your registered email address, or follow the steps at{' '}
                  <a href="/legal/data-deletion" className="text-blue-400 hover:underline">
                    eazypost.cm/legal/data-deletion
                  </a>.
                </p>
              </div>
            </div>
          </section>
          {/* ─────────────────────────────────────────────────────────── */}

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. How We Use Your Data</h2>
            <p>We use your information for the following legitimate business purposes:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>To provide the scheduling and publishing services.</li>
              <li>To generate AI-powered captions and content suggestions.</li>
              <li>To provide customer support and respond to inquiries.</li>
              <li>To improve our platform&apos;s security and performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Sharing &amp; Third Parties</h2>
            <p>We do not sell your data. We share data only with the following trusted service providers necessary to operate our business:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong className="text-gray-100">Cloudinary:</strong> For secure media storage.</li>
              <li><strong className="text-gray-100">Resend:</strong> For transactional emails (invites, alerts).</li>
              <li><strong className="text-gray-100">OpenAI / DeepSeek / Groq:</strong> For AI content generation (content only — Google user data is never sent to these providers).</li>
              <li><strong className="text-gray-100">Neon:</strong> Serverless PostgreSQL hosting for all account and application data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p>
              Depending on your location, you may have the right to access, rectify, or delete your personal data at any time. To exercise these rights, contact us at{' '}
              <a href="mailto:support@eazypost.cm" className="text-blue-400 hover:underline">
                support@eazypost.cm
              </a>{' '}
              or visit our{' '}
              <a href="/legal/data-deletion" className="text-blue-400 hover:underline">
                Data Deletion page
              </a>.
            </p>
          </section>

          <section className="border-t border-gray-700 pt-8 mt-8">
            <p className="text-sm">
              If you have questions about this policy, please contact us at{' '}
              <a href="mailto:support@eazypost.cm" className="text-blue-400 hover:underline">
                support@eazypost.cm
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
