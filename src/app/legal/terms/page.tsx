import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | EazyPost Africa',
  description: 'Terms and conditions for using the EazyPost platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Updated: February 1, 2026</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Effective Date: February 1, 2026</p>

        <div className="space-y-10 text-gray-600 dark:text-gray-300 leading-relaxed">

          {/* 1. Acceptance */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using EazyPost (&quot;the Service&quot;) operated by EazyPost Inc. (&quot;EazyPost,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you confirm that you are at least 13 years of age, have read and understood these Terms of Service (&quot;Terms&quot;), and agree to be legally bound by them. If you do not agree, you must not use the Service.
            </p>
          </section>

          {/* 2. Description */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
            <p>
              EazyPost provides social media management tools including content scheduling, multi-platform publishing, audience analytics, AI-powered caption generation, and team collaboration features. The Service connects to third-party platforms (Facebook, Instagram, LinkedIn, Twitter/X, TikTok) via their official APIs.
            </p>
            <p className="mt-3">
              We reserve the right to modify, suspend, or discontinue any feature of the Service at any time with reasonable notice where possible.
            </p>
          </section>

          {/* 3. Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Eligibility &amp; Account Registration</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be at least <strong>13 years old</strong> to use EazyPost. Users under 18 must have parental or guardian consent.</li>
              <li>You must provide accurate and complete registration information and keep it up to date.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</li>
              <li>You must notify us immediately at <a href="mailto:support@eazypost.cm" className="text-blue-600 hover:underline">support@eazypost.cm</a> of any unauthorized account access.</li>
            </ul>
          </section>

          {/* 4. Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Acceptable Use Policy</h2>
            <p className="mb-3">You agree to use EazyPost only for lawful purposes. You must NOT:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Upload, publish, or schedule content that is illegal, defamatory, obscene, hateful, harassing, or violates the rights of others.</li>
              <li>Violate the Terms of Service or Community Standards of any connected platform (Meta/Facebook, Instagram, LinkedIn, Twitter/X, TikTok).</li>
              <li>Use the Service to send unsolicited commercial messages (spam) or engage in bulk automated actions that violate platform policies.</li>
              <li>Attempt to gain unauthorized access to, probe, scan, or test the vulnerability of any EazyPost system or network.</li>
              <li>Use any automated means (bots, scrapers) to access the Service outside of our official API.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              <li>Use the Service to infringe any intellectual property rights.</li>
            </ul>
          </section>

          {/* 5. Third-Party Platforms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Third-Party Platform Compliance</h2>
            <p>
              EazyPost integrates with third-party social media platforms. By connecting your accounts, you authorize EazyPost to act on your behalf within the scope of the permissions you grant. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Your use of connected platforms remains subject to those platforms&apos; own terms and policies.</li>
              <li>EazyPost is an independent service and is not endorsed by, affiliated with, or sponsored by Meta, Instagram, LinkedIn, Twitter/X, or TikTok.</li>
              <li>We cannot guarantee uninterrupted API access to third-party platforms, as access may be modified or revoked by those platforms at any time.</li>
              <li>You are solely responsible for the content you publish through EazyPost and for ensuring it complies with applicable platform rules.</li>
            </ul>
          </section>

          {/* 6. Content Ownership */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Content Ownership &amp; License</h2>
            <p>
              You retain all ownership rights to content you create and upload to EazyPost. By uploading content, you grant EazyPost a limited, non-exclusive, royalty-free license to store, process, and transmit that content solely for the purpose of providing the Service to you. We do not claim ownership of your content and will not use it for advertising or any purpose beyond the Service.
            </p>
          </section>

          {/* 7. Subscription & Billing */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Subscription &amp; Billing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>EazyPost offers free and paid subscription tiers. Paid features are described on our <a href="/pricing" className="text-blue-600 hover:underline">Pricing page</a>.</li>
              <li>Paid subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable except where required by applicable law.</li>
              <li>We reserve the right to modify pricing with 30 days&apos; notice to existing subscribers.</li>
              <li>Free tier usage is subject to monthly limits (e.g., number of posts per month) as displayed in the dashboard.</li>
            </ul>
          </section>

          {/* 8. Termination */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Account Suspension &amp; Termination</h2>
            <p>
              We may suspend or permanently terminate your account without prior notice if you breach these Terms, engage in fraudulent activity, or act in a manner harmful to EazyPost, its users, or third-party platforms. Upon termination, your right to use the Service ceases immediately and your data will be deleted in accordance with our Privacy Policy.
            </p>
            <p className="mt-3">
              You may delete your account at any time from the Settings page or by contacting <a href="mailto:support@eazypost.cm" className="text-blue-600 hover:underline">support@eazypost.cm</a>.
            </p>
          </section>

          {/* 9. Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT PUBLISHED CONTENT WILL REACH ITS INTENDED AUDIENCE ON THIRD-PARTY PLATFORMS.
            </p>
          </section>

          {/* 10. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, EAZYPOST SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO EAZYPOST IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          {/* 11. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the Republic of Cameroon. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Cameroon.
            </p>
          </section>

          {/* 12. Changes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by email or via a prominent notice in the Service at least 14 days before the changes take effect. Continued use of the Service after the effective date of changes constitutes your acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13. Contact</h2>
            <p>For questions about these Terms:</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li><strong>Email:</strong> <a href="mailto:support@eazypost.cm" className="text-blue-600 hover:underline">support@eazypost.cm</a></li>
              <li><strong>Company:</strong> EazyPost Inc., Cameroon</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
