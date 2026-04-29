import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#000000] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-[#000000] p-8 md:p-12 rounded-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Effective Date: January 4, 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using EazyPost, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              EazyPost provides social media management tools, including scheduling, analytics, and AI content generation. We reserve the right to modify or discontinue features at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Responsibilities</h2>
            <p>You agree NOT to use the platform to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Upload illegal, harmful, or offensive content.</li>
              <li>Violate the Terms of Service of supported platforms (Facebook, Instagram, LinkedIn, Twitter/X, TikTok, YouTube, Threads).</li>
              <li>Attempt to reverse engineer or hack the EazyPost infrastructure.</li>
              <li>Spam or harass other users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3a. TikTok Platform Terms</h2>
            <p>
              When you connect your TikTok account and publish content through EazyPost, you additionally agree to comply with{' '}
              <a
                href="https://www.tiktok.com/legal/page/row/terms-of-service/en"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok&apos;s Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="https://www.tiktok.com/legal/page/row/community-guidelines/en"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok&apos;s Community Guidelines
              </a>. By using TikTok publishing features you acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>You are the rightful owner of, or have full rights to publish, any video content you submit to TikTok via EazyPost.</li>
              <li>EazyPost accesses your TikTok account using the <strong className="text-gray-100">video.publish</strong> and <strong className="text-gray-100">user.info.basic</strong> scopes solely to post content you explicitly authorize.</li>
              <li>You may revoke EazyPost&apos;s access to your TikTok account at any time through TikTok&apos;s app settings under <em>Settings &amp; Privacy → Security → Manage Account Access</em>.</li>
              <li>EazyPost is not affiliated with, endorsed by, or sponsored by TikTok or ByteDance Ltd.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Account Termination</h2>
            <p>
              We may suspend or terminate your account immediately, without prior notice, if you breach these Terms. Upon termination, your right to use the Service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Limitation of Liability</h2>
            <p>
              EazyPost is provided &ldquo;AS IS&rdquo;. We are not liable for any indirect damages, loss of data, or loss of business revenue resulting from the use or inability to use our service.
            </p>
          </section>

          <section className="border-t border-gray-700 pt-8 mt-8">
            <p className="text-sm">
              If you have questions about these terms, please contact us at{' '}
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
