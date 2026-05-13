'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Scale,
  FileText,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    paragraphs: [
      'By accessing or using the Menshly Wire website (the "Site"), including all content, features, and functionality offered through the Site, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Site.',
      'These Terms constitute a legally binding agreement between you and Menshly Wire ("we," "us," or "our"). By using the Site, you represent that you are at least 18 years of age, or the age of legal majority in your jurisdiction, and have the legal capacity to enter into these Terms.',
      'We reserve the right to modify, update, or replace any part of these Terms at our sole discretion. It is your responsibility to check the Terms periodically for changes. Your continued use of the Site after the posting of any changes constitutes acceptance of those changes.',
    ],
  },
  {
    title: '2. Use of Our Services',
    paragraphs: [
      'Menshly Wire provides an online publication focused on AI-powered money-making strategies, investment insights, wealth-building tips, and related financial content (the "Services"). You may use our Services only for lawful purposes and in accordance with these Terms.',
      'You agree not to use the Site in any way that violates any applicable federal, state, local, or international law or regulation, including without limitation, any laws regarding the export of data or software. You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Site for any commercial purpose without our express written permission.',
      'You agree not to attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Site, the servers on which the Site is hosted, or any server, computer, or database connected to the Site. You must not use any automated system, including but not limited to robots, spiders, or scrapers, to access the Site for any purpose without our express written permission.',
      'We reserve the right to terminate or restrict your access to the Site at any time, without notice, for any conduct that we, in our sole discretion, believe violates these Terms, is harmful to other users of the Site, or is harmful to us, our affiliates, or third parties.',
    ],
  },
  {
    title: '3. Intellectual Property',
    paragraphs: [
      'The Site and its entire contents, features, and functionality — including but not limited to all information, software, source code, text, displays, images, graphics, photographs, video, audio, design, presentation, selection, and arrangement — are owned by Menshly Wire, its licensors, or other providers of such material, and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.',
      'You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Site and its content for your personal, non-commercial use only. This license does not include the right to modify, reproduce, distribute, publicly display, publicly perform, or create derivative works of the content without our prior written consent.',
      'The "Menshly Wire" name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Menshly Wire. You may not use such marks without our prior written permission. All other names, logos, product and service names, designs, and slogans on the Site are the trademarks of their respective owners.',
    ],
  },
  {
    title: '4. User Content',
    paragraphs: [
      'Our Site may allow you to post, submit, publish, display, or transmit content, including but not limited to comments, feedback, suggestions, and other materials ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, sub-licensable, and transferable license to use, reproduce, distribute, adapt, modify, create derivative works from, publicly perform, publicly display, and otherwise exploit your User Content in any form, medium, or technology now known or later developed.',
      'You represent and warrant that you own or control all rights in and to the User Content and that you have the right to grant the license granted herein. You further represent and warrant that your User Content does not violate any applicable law or regulation, infringe any third-party intellectual property or other right, or contain any defamatory, libelous, obscene, or otherwise objectionable material.',
      'We have the right, but not the obligation, to monitor, edit, or remove any User Content that we determine, in our sole discretion, violates these Terms, is harmful to other users, or is otherwise objectionable. We assume no responsibility or liability for any User Content posted or submitted by you or any third party.',
    ],
  },
  {
    title: '5. Disclaimer',
    paragraphs: [
      'The information provided on Menshly Wire is for general informational and educational purposes only. Nothing on this Site should be construed as professional financial, investment, tax, legal, or other advice. You should not act or refrain from acting on the basis of any content included in the Site without seeking the appropriate financial, legal, or other professional advice from a qualified professional.',
      'All content on the Site is provided "as is" and "as available" without any representations or warranties, express or implied. We do not warrant that the Site will be uninterrupted, timely, secure, or error-free, that the results obtained from the use of the Site will be accurate or reliable, or that the quality of any content obtained through the Site will meet your expectations.',
      'Any reliance you place on the information provided on the Site is strictly at your own risk. Past performance, financial projections, and testimonials are not indicative of future results. Individual results may vary based on your specific circumstances, and we make no guarantees regarding the outcomes of any strategies or recommendations discussed on the Site.',
    ],
  },
  {
    title: '6. Limitation of Liability',
    paragraphs: [
      'To the fullest extent permitted by applicable law, in no event shall Menshly Wire, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of, or inability to access or use, the Site; (b) any conduct or content of any third party on the Site; (c) any content obtained from the Site; or (d) unauthorized access, use, or alteration of your transmissions or content.',
      'In no event shall our total liability to you for all claims arising out of or relating to the use of, or inability to use, the Site exceed the amount you have paid to us, if any, during the twelve (12) months preceding the event giving rise to the claim. This limitation of liability applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis, even if we have been advised of the possibility of such damage.',
      'Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities, so the above limitations or exclusions may not apply to you. In such cases, our liability shall be limited to the fullest extent permitted by applicable law.',
    ],
  },
  {
    title: '7. Indemnification',
    paragraphs: [
      'You agree to defend, indemnify, and hold harmless Menshly Wire, its parent company, officers, directors, employees, agents, licensors, suppliers, and any third-party information providers from and against all losses, expenses, damages, costs, claims, and demands, including reasonable attorneys\' fees and related costs and expenses, arising out of or related to: (a) your use of the Site; (b) your violation of these Terms; (c) your violation of any applicable law or regulation; or (d) your User Content or any content you submit or post on the Site.',
      'We reserve the right, at our own expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, and in such case, you agree to cooperate with our defense of such claim. The indemnification obligations under this section shall survive the termination or expiration of these Terms and your use of the Site.',
    ],
  },
  {
    title: '8. Termination',
    paragraphs: [
      'We may terminate or suspend your access to the Site immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Site will immediately cease.',
      'All provisions of these Terms which by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, indemnification clauses, and limitations of liability. Termination of your access to the Site does not affect any rights or obligations that have accrued prior to termination.',
    ],
  },
  {
    title: '9. Governing Law',
    paragraphs: [
      'These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from or relating to these Terms or the use of the Site shall be resolved exclusively in the courts located in the jurisdiction where Menshly Wire is headquartered, and you consent to the personal jurisdiction and venue of such courts.',
      'If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect. The failure of Menshly Wire to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.',
    ],
  },
  {
    title: '10. Changes to Terms',
    paragraphs: [
      'We reserve the right to revise and update these Terms of Service at any time at our sole discretion. All changes are effective immediately when posted and apply to all access to and use of the Site thereafter. We will make reasonable efforts to notify you of material changes, such as by posting a notice on the Site or sending you an email.',
      'Your continued use of the Site following the posting of revised Terms means that you accept and agree to the changes. You are expected to check this page periodically so you are aware of any changes, as they are binding on you. The "Last Updated" date at the top of this page indicates when these Terms were last revised.',
    ],
  },
  {
    title: '11. Contact Information',
    paragraphs: [
      'If you have any questions, concerns, or comments about these Terms of Service, or if you need to report a violation of these Terms, please contact us:',
    ],
    isContact: true,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f0f0f0]">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#166f4f] to-[#1c7352] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-[#121212] leading-tight serif">
                  Menshly Wire
                </h1>
                <p className="text-[10px] text-[#166f4f] font-medium -mt-0.5 tracking-wide">
                  Where AI Meets Revenue
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[#1c7352] hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#166f4f] to-[#1c7352]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#76bf9f] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-[#76bf9f] text-sm font-medium mb-6">
                <Scale className="w-4 h-4" />
                Legal
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white serif leading-tight mb-4"
            >
              Terms of Service
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-white/70 text-sm">
              <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Last Updated: March 4, 2026
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            {/* Introduction */}
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 mb-6"
            >
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Welcome to Menshly Wire. These Terms of Service govern your use
                of the Menshly Wire website and all related services. By
                accessing or using our website, you agree to be bound by these
                Terms. Please read them carefully before using our services. If
                you have any questions, please contact us at{' '}
                <a
                  href="mailto:hello@menshlynews.com"
                  className="text-[#166f4f] hover:underline"
                >
                  hello@menshlynews.com
                </a>
                .
              </p>
            </motion.div>

            {/* Sections */}
            {sections.map((section, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 mb-6"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-[#121212] serif mb-4">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="text-slate-600 leading-relaxed text-sm sm:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {/* Contact block for the last section */}
                  {section.isContact && (
                    <div className="bg-[#f0f0f0] rounded-xl p-5 border border-slate-200">
                      <div className="space-y-2 text-sm text-slate-600">
                        <p>
                          <strong className="text-[#121212]">Menshly Wire</strong>
                        </p>
                        <p>
                          Email:{' '}
                          <a
                            href="mailto:hello@menshlynews.com"
                            className="text-[#166f4f] hover:underline"
                          >
                            hello@menshlynews.com
                          </a>
                        </p>
                        <p>
                          Website:{' '}
                          <Link
                            href="/"
                            className="text-[#166f4f] hover:underline"
                          >
                            menshlynews.com
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* CTA */}
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-[#166f4f] to-[#1c7352] rounded-2xl p-6 sm:p-8 text-center"
            >
              <Scale className="w-8 h-8 text-[#76bf9f] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white serif mb-3">
                Questions About Our Terms?
              </h3>
              <p className="text-white/70 text-sm max-w-lg mx-auto leading-relaxed">
                We want you to feel confident about using Menshly Wire. If
                anything in these Terms is unclear or if you have questions,
                we&apos;re here to help.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-lg bg-white text-[#166f4f] text-sm font-bold hover:bg-white/90 transition-colors"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Menshly Wire. All rights reserved.
            Built with ❤️ by Horsnel John.
          </p>
        </div>
      </footer>
    </div>
  );
}
