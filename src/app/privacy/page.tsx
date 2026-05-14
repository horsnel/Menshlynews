'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Shield,
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
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you visit Menshly Wire, subscribe to our newsletter, or interact with our services, we may collect the following personal information: your name, email address, and any other information you voluntarily provide when filling out forms or contacting us. We only collect personal information that you actively and knowingly provide to us.',
      },
      {
        subtitle: 'Automatically Collected Information',
        text: 'When you access our website, our servers may automatically log certain technical information, including your IP address, browser type and version, operating system, referring URLs, pages visited, links clicked, time spent on pages, and the date and time of your visit. This information is collected to help us understand how visitors use our site and to improve the user experience.',
      },
      {
        subtitle: 'Cookies and Similar Technologies',
        text: 'We use cookies, web beacons, pixel tags, and similar tracking technologies to collect and store information about your interactions with our website. Cookies are small data files stored on your device that help us remember your preferences, understand how you use our site, and serve relevant content. You can control cookie settings through your browser preferences, but disabling cookies may limit your ability to use certain features of our site.',
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: '',
        text: 'We use the information we collect for a variety of purposes, including:',
      },
      {
        subtitle: 'Providing and Improving Services',
        text: 'We use your information to deliver the content and services you request, personalize your experience, send newsletters and email updates you have subscribed to, respond to your comments, questions, and support requests, and improve our website\'s functionality, design, and content based on user behavior and feedback.',
      },
      {
        subtitle: 'Analytics and Research',
        text: 'We use collected data to analyze trends, track website usage patterns, measure the effectiveness of our content, and conduct research to better understand our audience. This helps us create more relevant and valuable content for our readers.',
      },
      {
        subtitle: 'Communication',
        text: 'We may use your email address to send you newsletters, promotional materials, and other information related to AI money-making strategies and wealth building. You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us directly.',
      },
    ],
  },
  {
    title: '3. Information Sharing',
    content: [
      {
        subtitle: '',
        text: 'We do not sell, trade, or rent your personal information to third parties. However, we may share your information in the following limited circumstances:',
      },
      {
        subtitle: 'Service Providers',
        text: 'We may share information with trusted third-party service providers who assist us in operating our website, sending newsletters, analyzing data, and conducting our business. These providers are contractually obligated to use your information only for the purposes we specify and must maintain the confidentiality and security of your data.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information if required to do so by law or in response to valid requests by public authorities, such as a court order, subpoena, or government investigation. We may also disclose information when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.',
      },
      {
        subtitle: 'Business Transfers',
        text: 'In the event of a merger, acquisition, reorganization, bankruptcy, or sale of all or a portion of our assets, your personal information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our website of any change in ownership or uses of your personal information.',
      },
      {
        subtitle: 'With Your Consent',
        text: 'We may share your information with third parties when you have given us explicit consent to do so, such as when you opt in to promotional offers from our partners.',
      },
    ],
  },
  {
    title: '4. Cookies and Tracking Technologies',
    content: [
      {
        subtitle: 'Types of Cookies We Use',
        text: '',
      },
      {
        subtitle: 'Essential Cookies',
        text: 'These cookies are strictly necessary for the operation of our website. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies as the website cannot function properly without them.',
      },
      {
        subtitle: 'Analytics Cookies',
        text: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous.',
      },
      {
        subtitle: 'Advertising Cookies',
        text: 'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites. They do not store directly personal information but are based on uniquely identifying your browser and internet device.',
      },
      {
        subtitle: 'Managing Cookies',
        text: 'Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies, delete existing cookies, or alert you when a cookie is being set. Please note that if you disable or refuse cookies, some portions of our site may become inaccessible or not function properly.',
      },
    ],
  },
  {
    title: '5. Data Security',
    content: [
      {
        subtitle: '',
        text: 'We take the security of your personal information seriously and implement appropriate technical and organizational measures to protect it against unauthorized access, alteration, disclosure, or destruction. Our security measures include SSL/TLS encryption for data in transit, secure server infrastructure with firewalls and intrusion detection systems, regular security audits and vulnerability assessments, limited access to personal information on a need-to-know basis, and secure data storage with appropriate encryption at rest.',
      },
      {
        subtitle: '',
        text: 'However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. If you have any concerns about the security of your information, please contact us.',
      },
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      {
        subtitle: '',
        text: 'Depending on your jurisdiction, you may have the following rights regarding your personal information:',
      },
      {
        subtitle: 'Access and Portability',
        text: 'You have the right to request access to the personal information we hold about you and to receive a copy of that information in a structured, commonly used, machine-readable format.',
      },
      {
        subtitle: 'Correction and Deletion',
        text: 'You have the right to request correction of inaccurate personal information or deletion of your personal data, subject to certain exceptions such as legal obligations or legitimate business interests.',
      },
      {
        subtitle: 'Objection and Restriction',
        text: 'You have the right to object to the processing of your personal information in certain circumstances, or to request that we restrict the processing of your data.',
      },
      {
        subtitle: 'Withdrawal of Consent',
        text: 'Where processing is based on your consent, you may withdraw that consent at any time without affecting the lawfulness of processing carried out prior to withdrawal.',
      },
      {
        subtitle: '',
        text: 'To exercise any of these rights, please contact us at hello@menshlynews.com. We will respond to your request within 30 days, or as required by applicable law.',
      },
    ],
  },
  {
    title: '7. Children\'s Privacy',
    content: [
      {
        subtitle: '',
        text: 'Menshly Wire is not directed at individuals under the age of 13 (or the applicable age of consent in your jurisdiction). We do not knowingly collect personal information from children. If you are a parent or guardian and become aware that your child has provided us with personal information, please contact us immediately. If we discover that we have collected personal information from a child without verification of parental consent, we will take steps to delete that information from our servers as quickly as possible.',
      },
    ],
  },
  {
    title: '8. Changes to This Privacy Policy',
    content: [
      {
        subtitle: '',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make material changes, we will notify you by updating the "Last Updated" date at the top of this page and, for significant changes, by providing a prominent notice on our website or sending you an email. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.',
      },
      {
        subtitle: '',
        text: 'Your continued use of our website after any changes to this Privacy Policy constitutes your acceptance of the updated terms. If you do not agree with the revised Privacy Policy, you should discontinue your use of our website and services.',
      },
    ],
  },
  {
    title: '9. Contact Us',
    content: [
      {
        subtitle: '',
        text: 'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
      },
      {
        subtitle: '',
        text: '',
      },
    ],
  },
];

export default function PrivacyPage() {
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
                <Shield className="w-4 h-4" />
                Legal
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white serif leading-tight mb-4"
            >
              Privacy Policy
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
                At Menshly Wire (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), we are committed
                to protecting your privacy and ensuring the security of your
                personal information. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                visit our website menshlynews.com (the &ldquo;Site&rdquo;), use our
                services, or engage with our content. Please read this Privacy
                Policy carefully. By accessing or using our Site, you
                acknowledge that you have read, understood, and agree to be
                bound by the terms of this Privacy Policy. If you do not agree
                with the terms of this Privacy Policy, please do not access the
                Site.
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
                  {section.content.map((item, idx) => {
                    // Special handling for Contact Us section
                    if (section.title === '9. Contact Us' && idx === 1) {
                      return (
                        <div key={idx} className="bg-[#f0f0f0] rounded-xl p-5 border border-slate-200">
                          <div className="space-y-2 text-sm text-slate-600">
                            <p>
                              <strong className="text-[#121212]">Menshly Wire</strong>
                            </p>
                            <p>Email: <a href="mailto:hello@menshlynews.com" className="text-[#166f4f] hover:underline">hello@menshlynews.com</a></p>
                            <p>Website: <Link href="/" className="text-[#166f4f] hover:underline">menshlynews.com</Link></p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={idx}>
                        {item.subtitle && (
                          <h3 className="text-base sm:text-lg font-semibold text-[#121212] mb-2">
                            {item.subtitle}
                          </h3>
                        )}
                        {item.text && (
                          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                            {item.text}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {/* Table of Contents / Quick Nav */}
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-[#166f4f] to-[#1c7352] rounded-2xl p-6 sm:p-8 text-center"
            >
              <Shield className="w-8 h-8 text-[#76bf9f] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white serif mb-3">
                Your Privacy Matters to Us
              </h3>
              <p className="text-white/70 text-sm max-w-lg mx-auto leading-relaxed">
                We are committed to transparency about how we handle your data.
                If you have any questions about this policy or our practices,
                please don&apos;t hesitate to reach out.
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
            Product of O.L.H.M.E.S
          </p>
        </div>
      </footer>
    </div>
  );
}
