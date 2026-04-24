import React from 'react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">Terms of Service</h1>
        <p className="text-gray-400 italic mb-8">Last Updated: April 19, 2026</p>

        {/* Development Notice */}
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-8">
          <p className="text-yellow-300 font-semibold">
            ⚠️ Development Version Notice: This is a development/testing terms of service for localhost use only. 
            A complete terms of service will be provided for production deployment.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using Twinstitute AI (the "Service"), you agree to be bound by these Terms of Service 
              ("Terms"). If you do not agree to abide by the above, please do not use this service. We reserve the right, 
              at our sole discretion, to modify these terms and conditions at any time by updating this page.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">2. Use License</h2>
            <p className="text-gray-300 mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on 
              Twinstitute AI for personal, non-commercial transitory viewing only. This is the grant of a license, 
              not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to reverse engineer any software contained on Twinstitute AI</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Using any tools, software, or utilities to bypass, remove, or circumvent any security measures</li>
              <li>Accessing or searching the Service by any means other than our publicly supported interfaces</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">3. Disclaimer</h2>
            <p className="text-gray-300 leading-relaxed">
              The materials on Twinstitute AI are provided on an 'as is' basis. Twinstitute AI makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
              of intellectual property or other violation of rights. Further, Twinstitute AI does not warrant or make any 
              representations concerning the accuracy, likely results, or reliability of the use of the materials on its 
              Internet web site or otherwise relating to such materials or on any sites linked to this site.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">4. Limitations</h2>
            <p className="text-gray-300 leading-relaxed">
              In no event shall Twinstitute AI or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to 
              use the materials on Twinstitute AI, even if Twinstitute AI or a Twinstitute AI authorized representative has 
              been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">5. Accuracy of Materials</h2>
            <p className="text-gray-300 leading-relaxed">
              The materials appearing on Twinstitute AI could include technical, typographical, or photographic errors. 
              Twinstitute AI does not warrant that any of the materials on Twinstitute AI are accurate, complete, or current. 
              Twinstitute AI may make changes to the materials contained on Twinstitute AI at any time without notice.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">6. Links</h2>
            <p className="text-gray-300 leading-relaxed">
              Twinstitute AI has not reviewed all of the sites linked to its Internet web site and is not responsible for 
              the contents of any such linked site. The inclusion of any link does not imply endorsement by Twinstitute AI 
              of the site. Use of any such linked web site is at the user's own risk.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">7. Modifications</h2>
            <p className="text-gray-300 leading-relaxed">
              Twinstitute AI may revise these terms of service for Twinstitute AI at any time without notice. By using this 
              web site, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">8. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which 
              Twinstitute AI is operated, and you irrevocably submit to the exclusive jurisdiction of the courts located in that location.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">9. User Accounts</h2>
            <p className="text-gray-300 mb-4">
              If you create an account on Twinstitute AI, you are responsible for maintaining the confidentiality of your account 
              information and password and for restricting access to your computer. You agree to accept responsibility for all 
              activities that occur under your account or password. You must notify us immediately of any unauthorized uses of 
              your account or any other breaches of security.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">10. Prohibited Activities</h2>
            <p className="text-gray-300 mb-4">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Harassing, threatening, abusing, or otherwise violating the legal rights of others</li>
              <li>Publishing, posting, uploading, or distributing any unlawful content</li>
              <li>Engaging in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
              <li>Attempting to gain unauthorized access to any portion of the Service</li>
              <li>Collecting or tracking personal information of others without consent</li>
              <li>Interfering with the normal operation of the Service</li>
              <li>Spamming, flooding, or bombarding the Service with unsolicited communications</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">11. Intellectual Property Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              All content included as part of the Service, such as text, graphics, logos, images, and software, is the property 
              of Twinstitute AI or its content suppliers and is protected by international copyright laws. The compilation of all 
              content on Twinstitute AI is the exclusive property of Twinstitute AI and is protected by international copyright laws. 
              All software used on Twinstitute AI is the property of Twinstitute AI or its software suppliers and is protected by 
              international copyright laws.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">12. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at support@twinstitute.ai or through the 
              contact information provided on our website. We are committed to resolving any concerns you may have regarding our terms 
              and conditions.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-gray-400 text-sm">
            © 2026 Twinstitute AI. All rights reserved. By using this service, you agree to comply with these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}
