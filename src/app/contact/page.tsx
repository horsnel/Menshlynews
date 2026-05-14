'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Mail,
  MessageSquare,
  Clock,
  Send,
  Twitter,
  Linkedin,
  Youtube,
  ChevronDown,
  CheckCircle2,
  MapPin,
  Phone,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const subjectOptions = [
  'General Inquiry',
  'Article Suggestion',
  'Advertising & Partnerships',
  'Content Correction',
  'Technical Issue',
  'Newsletter Support',
  'Other',
];

const faqs = [
  {
    question: 'How often do you publish new articles?',
    answer:
      'We publish new articles 3-4 times per week, covering the latest AI-powered money-making strategies, investment insights, and wealth-building tips. Our newsletter subscribers get early access to all new content every Monday morning.',
  },
  {
    question: 'Can I suggest a topic for you to cover?',
    answer:
      'Absolutely! We love hearing from our readers. Use the contact form above and select "Article Suggestion" as the subject. We review all suggestions and frequently write articles based on reader requests. If we cover your topic, we\'ll even give you a shoutout!',
  },
  {
    question: 'Do you offer consulting or one-on-one advice?',
    answer:
      'While we don\'t currently offer personalized financial consulting, our articles are designed to be comprehensive enough to guide your decision-making. We may launch a premium advisory service in the future — subscribe to our newsletter to be the first to know.',
  },
  {
    question: 'How can I advertise or partner with Menshly Wire?',
    answer:
      'We work with select partners whose products and services align with our mission of empowering readers with AI-driven wealth strategies. For advertising inquiries and partnership opportunities, please use the contact form with "Advertising & Partnerships" selected as the subject.',
  },
  {
    question: 'Is the newsletter really free?',
    answer:
      'Yes! Our weekly newsletter is 100% free. We believe financial education should be accessible to everyone. The newsletter includes our top articles, exclusive AI tool recommendations, and market insights. We sustain operations through ethical advertising and affiliate partnerships that we fully disclose.',
  },
];

const socialLinks = [
  { name: 'Twitter / X', icon: Twitter, handle: '@menshlynews', href: '#' },
  { name: 'LinkedIn', icon: Linkedin, handle: 'Menshly Wire', href: '#' },
  { name: 'YouTube', icon: Youtube, handle: 'Menshly Wire', href: '#' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Contact form error:', error);
      setErrorMsg('Failed to send your message. Please try again or email us directly at hello@menshlynews.com');
    } finally {
      setLoading(false);
    }
  };

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
                <MessageSquare className="w-4 h-4" />
                Contact Us
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white serif leading-tight mb-6"
            >
              We&apos;d Love to
              <br />
              <span className="text-[#76bf9f]">Hear From You</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed"
            >
              Got a question, suggestion, or partnership idea? Drop us a line
              and we&apos;ll get back to you as soon as possible.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="lg:col-span-2"
            >
              <motion.div
                variants={fadeInUp}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
              >
                <h2 className="text-2xl font-bold text-[#121212] serif mb-2">
                  Send Us a Message
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  Fill out the form below and we&apos;ll respond within 24-48 hours.
                </p>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#166f4f]/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#166f4f]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] serif mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-slate-600 text-sm max-w-sm mx-auto mb-6">
                      Thank you for reaching out. We&apos;ll get back to you within
                      24-48 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                      }}
                      className="px-5 py-2.5 rounded-lg bg-[#166f4f] text-white text-sm font-medium hover:bg-[#1c7352] transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {errorMsg && (
                      <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                        {errorMsg}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-[#121212] mb-1.5"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="w-full px-4 py-2.5 rounded-lg bg-[#f0f0f0] border border-slate-200 text-sm text-[#121212] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#166f4f]/20 focus:border-[#166f4f] transition-colors"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-[#121212] mb-1.5"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@email.com"
                          className="w-full px-4 py-2.5 rounded-lg bg-[#f0f0f0] border border-slate-200 text-sm text-[#121212] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#166f4f]/20 focus:border-[#166f4f] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-[#121212] mb-1.5"
                      >
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg bg-[#f0f0f0] border border-slate-200 text-sm text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#166f4f]/20 focus:border-[#166f4f] transition-colors appearance-none"
                      >
                        <option value="" disabled>
                          Select a subject...
                        </option>
                        {subjectOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-[#121212] mb-1.5"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Tell us what's on your mind..."
                        className="w-full px-4 py-2.5 rounded-lg bg-[#f0f0f0] border border-slate-200 text-sm text-[#121212] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#166f4f]/20 focus:border-[#166f4f] transition-colors resize-y"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#166f4f] to-[#1c7352] text-white text-sm font-semibold hover:from-[#1c7352] hover:to-[#166f4f] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>

            {/* Sidebar - Direct Contact Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="space-y-6"
            >
              {/* Direct Contact */}
              <motion.div
                variants={fadeInUp}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
              >
                <h3 className="text-lg font-bold text-[#121212] serif mb-4">
                  Direct Contact
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#166f4f]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-[#166f4f]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#121212]">Email</p>
                      <a
                        href="mailto:hello@menshlynews.com"
                        className="text-sm text-[#166f4f] hover:underline"
                      >
                        hello@menshlynews.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#166f4f]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-[#166f4f]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#121212]">Response Time</p>
                      <p className="text-sm text-slate-500">Within 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#166f4f]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#166f4f]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#121212]">Location</p>
                      <p className="text-sm text-slate-500">Remote-first, worldwide</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                variants={fadeInUp}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
              >
                <h3 className="text-lg font-bold text-[#121212] serif mb-4">
                  Follow Us
                </h3>
                <div className="space-y-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f0f0f0] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#166f4f]/10 flex items-center justify-center group-hover:bg-[#166f4f]/20 transition-colors">
                        <social.icon className="w-4 h-4 text-[#166f4f]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#121212]">
                          {social.name}
                        </p>
                        <p className="text-xs text-slate-400">{social.handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Response Promise */}
              <motion.div
                variants={fadeInUp}
                className="bg-gradient-to-br from-[#166f4f] to-[#1c7352] rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-5 h-5 text-[#76bf9f]" />
                </div>
                <h3 className="text-white font-bold serif text-lg mb-2">
                  Our Promise
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  We read every single message. Whether it&apos;s a question,
                  suggestion, or just a hello — you&apos;ll hear back from a real
                  human, not a bot.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <span className="inline-block text-sm font-semibold text-[#166f4f] uppercase tracking-widest mb-3">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#121212] serif">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto">
                Find quick answers to the most common questions about Menshly Wire.
              </p>
            </motion.div>

            <div className="space-y-3 max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-[#f0f0f0] rounded-xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-100/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-semibold text-[#121212] pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#166f4f] flex-shrink-0 transition-transform duration-300 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 pt-0">
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
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
