import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | EazyPost Africa',
  description: 'How EazyPost collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Updated: February 1, 2026</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Effective Date: February 1, 2026</p>

        <div className="space-y-10 text-gray-600 dark:text-gray-300 leading-relaxed">

          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p>
              EazyPost ("EazyPost," "we," "our," or "us") is a social media management platform operated by EazyPost Inc., headquartered in Cameroon. We are committed to protecting your personal information and your right to privacy.
            </p>
            <p className="mt-3">
              This Privacy Policy applies to all information collected through our website at <strong>https://eazyposttio.vercel.app</strong>, our mobile applications, and any related services (collectively, the "Service"). By using the Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly to us and information generated automatically when you use the Service:</p>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Account Information:</strong> Full name, email address, and profile picture when you register via email or social login (Google, Facebook).
              </li>
              <li>
                <strong>Social Media Platform Data:</strong> When you connect a social account, we access only the permissions you explicitly grant. For Facebook and Instagram, this may include your Pages, Business accounts, post metrics, and audience data. We access this data solely to provide the scheduling, publishing, and analytics features of EazyPost.
              </li>
              <li>
                <strong>Content You Create:</strong> Text captions, images, videos, and scheduled posts you create or upload inside the platform.
              </li>
              <li>
                <strong>Usage Data:</strong> Log data, IP address, browser type, pages visited, and timestamps — used solely for security and performance monitoring.
              </li>
              <li>
                <strong>Communications:</strong> Support emails and feedback you send us.
              </li>
            </ul>
          </section>

          {/* 3. Facebook Platform Data */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Facebook &amp; Instagram Platform Data</h2>
            <p className="mb-3">
              EazyPost integrates with the Meta (Facebook) Platform APIs. Our use of data obtained through these APIs is strictly governed by the <a href="https://developers.facebook.com/policy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Meta Platform Terms</a> and <a href="https://developers.facebook.com/devpolicy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Meta Developer Policies</a>.
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li>We request only the minimum permissions necessary to deliver the functionality you use (e.g., <code>pages_manage_posts</code>, <code>instagram_content_publish</code>).</li>
              <li>We use Facebook Platform Data only to provide and improve the EazyPost service to you — not for advertising, data brokering, or any other secondary purpose.</li>
              <li><strong>We do not sell, license, or transfer Facebook Platform Data to any third party.</strong></li>
              <li><strong>We do not use Facebook Platform Data to train machine learning or artificial intelligence models.</strong></li>
              <li>Facebook-sourced data is retained only as long as needed to operate the Service (see Section 7). You may revoke our access at any time via your Facebook account settings.</li>
            </ul>
          </section>

          {/* 4. How We Use Your Data */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. How We Use Your Data</h2>
            <p className="mb-3">We use your information for these legitimate business purposes only:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To authenticate your identity and maintain your session.</li>
              <li>To publish, schedule, and manage content on your connected social accounts.</li>
              <li>To display analytics and audience insights within the dashboard.</li>
              <li>To generate AI-powered caption suggestions (your content is not stored by AI providers beyond the immediate request).</li>
              <li>To send transactional notifications (team invites, publishing alerts).</li>
              <li>To investigate security incidents and prevent abuse.</li>
            </ul>
          </section>

          {/* 5. Data Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Data Sharing &amp; Third-Party Services</h2>
            <p className="mb-3">
              <strong>We do not sell your personal data.</strong> We share data only with the following service providers who process it on our behalf:
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Neon / PostgreSQL:</strong> Secure database hosting for your account and post data.</li>
              <li><strong>Cloudinary:</strong> Media file storage for images and videos you upload.</li>
              <li><strong>Resend:</strong> Transactional email delivery (invites, alerts).</li>
              <li><strong>Google Gemini AI:</strong> AI caption and content generation. Requests are processed in real time; no user data is stored or used for model training by this provider under our agreement.</li>
              <li><strong>Vercel / Render:</strong> Cloud hosting infrastructure.</li>
            </ul>
            <p className="mt-3">
              All third-party providers are bound by data processing agreements and are prohibited from using your data for any purpose beyond providing their service to EazyPost.
            </p>
          </section>

          {/* 6. Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> Ask us to correct inaccurate or incomplete data.</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data (see our <a href="/legal/data-deletion" className="text-blue-600 hover:underline">Data Deletion page</a>).</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to certain types of processing.</li>
              <li><strong>Withdraw Consent:</strong> You may disconnect your social accounts at any time from within the EazyPost dashboard.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at <a href="mailto:support@eazypost.cm" className="text-blue-600 hover:underline">support@eazypost.cm</a>. We will respond within 30 days.
            </p>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Data Retention</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account data</strong> is retained for the duration of your account. Upon deletion, we remove your data within 48 hours.</li>
              <li><strong>Published post records</strong> are retained for 12 months to support analytics, then automatically purged.</li>
              <li><strong>Access tokens</strong> (OAuth tokens from social platforms) are stored encrypted and deleted immediately when you disconnect an account.</li>
              <li><strong>Log files</strong> are retained for a maximum of 90 days for security purposes.</li>
            </ul>
          </section>

          {/* 8. Security */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Data Security</h2>
            <p>
              We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest for sensitive credentials, and role-based access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* 9. Children */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Children's Privacy</h2>
            <p>
              EazyPost is not directed to individuals under the age of 13. We do not knowingly collect personal data from children under 13. If you believe we have inadvertently collected such data, please contact us immediately at <a href="mailto:support@eazypost.cm" className="text-blue-600 hover:underline">support@eazypost.cm</a> and we will delete it promptly.
            </p>
          </section>

          {/* 10. Cookie Policy */}
          <section id="cookie-policy">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Cookie Policy</h2>
            <p className="mb-3">We use the following types of cookies:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Essential cookies:</strong> The <code>accessToken</code> cookie is required to keep you logged in. The Service cannot function without it.</li>
              <li><strong>Preference cookies:</strong> Theme (light/dark mode) and language preference.</li>
            </ul>
            <p className="mt-3">
              We do not use advertising cookies, third-party tracking cookies, or analytics cookies. You may clear all cookies via your browser settings, which will log you out of EazyPost.
            </p>
          </section>

          {/* 11. International Transfers */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. International Data Transfers</h2>
            <p>
              EazyPost operates from Cameroon. Your data may be processed and stored in servers located in the United States or European Union via our hosting providers (Vercel, Render, Neon). By using the Service, you consent to the transfer of your information to countries outside your country of residence.
            </p>
          </section>

          {/* 12. Changes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last Updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13. Contact Us</h2>
            <p>For privacy-related questions, data requests, or concerns:</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li><strong>Email:</strong> <a href="mailto:support@eazypost.cm" className="text-blue-600 hover:underline">support@eazypost.cm</a></li>
              <li><strong>Company:</strong> EazyPost Inc., Cameroon</li>
              <li><strong>Website:</strong> <a href="https://eazyposttio.vercel.app" className="text-blue-600 hover:underline">https://eazyposttio.vercel.app</a></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
