import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 italic mb-8">Last Updated: April 16, 2026</p>

        {/* Development Notice */}
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-8">
          <p className="text-yellow-300 font-semibold">
            ⚠️ Development Version Notice: This is a development/testing privacy policy for localhost use only. 
            A complete privacy policy will be provided for production deployment.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to Twinstitute AI. We are committed to protecting your privacy and ensuring you understand 
              how we collect, use, and protect your personal information. This Privacy Policy explains our practices 
              regarding data collection and use.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">2. Information We Collect</h2>
            <p className="text-gray-300 mb-4">Twinstitute AI collects the following information through OAuth integrations:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>GitHub Data:</strong> Profile information (username, email), repository details, programming languages used, repository stars</li>
              <li><strong>LinkedIn Data:</strong> Profile information (name, email, profile picture), work experience, job titles, skills, endorsements</li>
              <li><strong>LeetCode Data:</strong> Public profile statistics (username, ranking, problems solved, acceptance rate, badges)</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">We use collected information for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Building your personalized capability twin (AI profile)</li>
              <li>Analyzing your skill development and learning progress</li>
              <li>Providing personalized learning recommendations</li>
              <li>Generating capability reports and insights</li>
              <li>Improving the Twinstitute AI platform and user experience</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">4. Data Storage and Security</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li><strong>Encryption:</strong> OAuth access tokens are encrypted before storage in our database</li>
              <li><strong>Database:</strong> All data is stored in MongoDB with standard security measures</li>
              <li><strong>Access:</strong> Only your authenticated account can access your personal data</li>
              <li><strong>Deletion:</strong> Data can be deleted by disconnecting integrations or requesting account deletion</li>
            </ul>
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-300">
                <strong>Security Note:</strong> While we implement standard security measures, no system is 100% secure. 
                We recommend using strong passwords and enabling two-factor authentication where available.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">5. Sharing of Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>No Third-Party Sharing:</strong> We do not share your personal data with third-party services</li>
              <li><strong>Internal Use Only:</strong> Data is used internally to provide and improve Twinstitute AI services</li>
              <li><strong>Legal Compliance:</strong> We may disclose information if required by law</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">6. User Rights and Control</h2>
            <p className="text-gray-300 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>View:</strong> Access all data Twinstitute AI has collected about you</li>
              <li><strong>Disconnect:</strong> Revoke access to your GitHub, LinkedIn, or LeetCode accounts at any time</li>
              <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
              <li><strong>Opt-out:</strong> Disable notifications and data collection features</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">7. OAuth Scopes Explained</h2>
            
            <h3 className="text-xl font-semibold text-gray-200 mt-4 mb-2">GitHub Scopes:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
              <li><code className="bg-slate-700 px-2 py-1 rounded">read:user</code> - Read your public profile information</li>
              <li><code className="bg-slate-700 px-2 py-1 rounded">user:email</code> - Access your email address</li>
              <li><code className="bg-slate-700 px-2 py-1 rounded">public_repo</code> - Access public repositories</li>
              <li><code className="bg-slate-700 px-2 py-1 rounded">read:org</code> - Read organization information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-200 mt-4 mb-2">LinkedIn Scopes:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
              <li><code className="bg-slate-700 px-2 py-1 rounded">openid</code> - OpenID Connect authentication</li>
              <li><code className="bg-slate-700 px-2 py-1 rounded">profile</code> - Access your profile information</li>
              <li><code className="bg-slate-700 px-2 py-1 rounded">email</code> - Access your email address</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">8. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>OAuth tokens are retained for as long as your integration is active</li>
              <li>Profile data is updated when you click "Sync" or during automatic sync</li>
              <li>Historical data may be retained for analytics (anonymized)</li>
              <li>Upon account deletion, all data is permanently removed within 30 days</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">9. Contact Information</h2>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 space-y-2">
              <p className="text-gray-300"><strong>Email:</strong> privacy@twinstitute.ai</p>
              <p className="text-gray-300"><strong>Development Contact:</strong> dev@twinstitute.ai</p>
              <p className="text-gray-300"><strong>Organization:</strong> Twinstitute AI</p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">10. Development Environment Notice</h2>
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
              <p className="text-yellow-300 font-semibold mb-4">This Privacy Policy is for Development/Testing Purposes Only</p>
              <p className="text-yellow-200 mb-4">
                This policy is designed for localhost and testing environments. Before deploying to production:
              </p>
              <ul className="list-disc list-inside space-y-2 text-yellow-200">
                <li>Review and update all sections for your specific use case</li>
                <li>Ensure compliance with GDPR, CCPA, and other relevant regulations</li>
                <li>Update contact information with actual company details</li>
                <li>Have the policy reviewed by legal counsel</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p><strong>Twinstitute AI - Development Version</strong></p>
          <p>Privacy Policy Generated: April 16, 2026</p>
          <p>Environment: Localhost Testing</p>
        </div>
      </div>
    </div>
  )
}
