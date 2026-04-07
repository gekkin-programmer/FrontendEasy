import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last Updated: January 4, 2026</p>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to EasyPost (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, profile picture (via Google/Facebook Login).</li>
              <li><strong>Authentication Data:</strong> OAuth tokens and session data to maintain your login state.</li>
              <li><strong>Social Media Data:</strong> We access your Facebook Pages, Instagram Business accounts, and LinkedIn pages strictly to perform actions you authorize (scheduling posts, reading analytics).</li>
              <li><strong>Content:</strong> Images, videos, and text you upload to our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. How We Use Your Data</h2>
            <p>We use your information for the following legitimate business purposes:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>To provide the scheduling and publishing services.</li>
              <li>To generate AI-powered captions and content suggestions.</li>
              <li>To provide customer support and respond to inquiries.</li>
              <li>To improve our platform's security and performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Data Sharing & Third Parties</h2>
            <p>We do not sell your data. We share data only with the following trusted service providers necessary to operate our business:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Cloudinary:</strong> For secure media storage.</li>
              <li><strong>Resend:</strong> For transactional emails (invites, alerts).</li>
              <li><strong>OpenAI / DeepSeek / Groq:</strong> For AI content generation (data is anonymized where possible).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Your Rights</h2>
            <p>Depending on your location, you may have the right to access, rectify, or delete your personal data. You can request data deletion at any time by contacting us.</p>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
            <p className="text-sm">
              If you have questions about this policy, please contact us at <a href="mailto:support@easypost.cm" className="text-blue-600 hover:underline">support@easypost.cm</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}