'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Lightbulb,
  Users,
  Globe,
  BookOpen,
  Award,
  Mail,
  CheckCircle2,
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

const stats = [
  { label: 'Readers', value: '50K+', icon: Users },
  { label: 'Articles Published', value: '200+', icon: BookOpen },
  { label: 'Categories', value: '12', icon: Target },
  { label: 'Continents Reached', value: '6', icon: Globe },
];

const values = [
  {
    icon: Lightbulb,
    title: 'Insight Over Hype',
    description:
      'We cut through the noise and deliver actionable AI strategies that actually make money. No fluff, no empty promises — just proven frameworks and real-world case studies that you can implement today.',
  },
  {
    icon: Target,
    title: 'Accessibility First',
    description:
      'Financial wisdom should not be locked behind paywalls or written in jargon only MBAs understand. We break down complex AI-powered money-making strategies so anyone — from beginners to seasoned investors — can benefit.',
  },
  {
    icon: TrendingUp,
    title: 'Data-Driven Decisions',
    description:
      'Every recommendation we make is backed by research, data, and real outcomes. We track AI trends, analyze market signals, and verify claims so you don\'t have to gamble on unproven strategies.',
  },
  {
    icon: Award,
    title: 'Integrity Always',
    description:
      'We are transparent about what works and what doesn\'t. If an AI tool or strategy has limitations, we tell you. Our readers\' trust is our most valuable asset, and we work every day to earn it.',
  },
];

export default function AboutPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#166f4f] to-[#1c7352]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#76bf9f] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-[#76bf9f] text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                About Menshly Wire
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white serif leading-tight mb-6"
            >
              Empowering You to Build Wealth
              <br />
              <span className="text-[#76bf9f]">with AI</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
            >
              We believe everyone deserves access to smart money strategies.
              Menshly Wire is your trusted guide to leveraging artificial
              intelligence for financial growth — from side hustles to
              investments.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <span className="inline-block text-sm font-semibold text-[#166f4f] uppercase tracking-widest mb-3">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#121212] serif">
                From Curiosity to Mission
              </h2>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10"
            >
              <div className="prose-content">
                <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                  Menshly Wire was born from a simple observation: the AI
                  revolution is creating unprecedented opportunities for ordinary
                  people to build wealth — but most of the information out there
                  is either too technical, too vague, or just plain hype.
                </p>
                <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                  <strong className="text-[#121212]">Horsnel John</strong>,
                  our founder, experienced this firsthand. As someone who
                  spent years navigating the intersection of technology and
                  finance, he saw how AI tools were quietly transforming side
                  hustles, investment strategies, and career trajectories. But
                  the insights were scattered across forums, buried in academic
                  papers, or hidden behind expensive paywalls.
                </p>
                <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                  In early 2024, Horsnel decided to bridge that gap. He launched
                  Menshly Wire with one clear mission: <strong className="text-[#121212]">make AI-powered
                  wealth-building strategies accessible, practical, and honest</strong>.
                  What started as a weekly newsletter sent to 50 curious readers
                  has grown into a thriving community of over 50,000 readers
                  across six continents.
                </p>
                <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                  Today, Menshly Wire covers everything from AI-driven investing
                  and automated side hustles to cryptocurrency analysis and
                  smart retirement planning. Every article is written with one
                  question in mind: <em>&ldquo;Can our reader take this insight and
                  actually use it to improve their financial situation today?&rdquo;</em>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What We Believe */}
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
                What We Believe
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#121212] serif">
                Our Core Values
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((value) => (
                <motion.div
                  key={value.title}
                  variants={fadeInUp}
                  className="group bg-[#f0f0f0] rounded-2xl p-6 sm:p-8 border border-transparent hover:border-[#76bf9f] hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#166f4f] to-[#1c7352] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#121212] serif mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* By The Numbers */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <span className="inline-block text-sm font-semibold text-[#166f4f] uppercase tracking-widest mb-3">
                By The Numbers
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#121212] serif">
                Growing Every Day
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center hover:border-[#76bf9f] hover:shadow-md transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#166f4f]/10 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-5 h-5 text-[#166f4f]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-[#166f4f] serif">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
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
                The Team
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#121212] serif">
                Meet the Founder
              </h2>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="max-w-lg mx-auto"
            >
              <div className="bg-[#f0f0f0] rounded-2xl p-8 sm:p-10 text-center border border-slate-200">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#166f4f] to-[#1c7352] flex items-center justify-center mx-auto mb-6 ring-4 ring-white shadow-lg">
                  <span className="text-3xl font-bold text-white serif">HJ</span>
                </div>
                <h3 className="text-2xl font-bold text-[#121212] serif mb-1">
                  Horsnel John
                </h3>
                <p className="text-[#166f4f] font-semibold text-sm mb-4">
                  Founder &amp; Editor-in-Chief
                </p>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Horsnel is a technology and finance enthusiast with over a
                  decade of experience at the intersection of AI and wealth
                  creation. He founded Menshly Wire to democratize access to
                  AI-powered financial strategies, believing that the next wave
                  of wealth creation belongs to those who understand how to
                  harness artificial intelligence. When he&apos;s not writing or
                  researching, Horsnel mentors aspiring entrepreneurs and
                  contributes to open-source AI projects.
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <a
                    href="mailto:hello@menshlynews.com"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#166f4f] text-white text-sm font-medium hover:bg-[#1c7352] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Get in Touch
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA - Subscribe */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#166f4f] to-[#1c7352] p-8 sm:p-12 text-center"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#76bf9f] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
              </div>
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold text-white serif mb-4">
                  Join 50,000+ Smart Readers
                </h2>
                <p className="text-white/80 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
                  Get weekly AI money-making strategies delivered straight to
                  your inbox. No spam, no fluff — just actionable insights that
                  can help you build real wealth.
                </p>

                {subscribed ? (
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 text-white text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    You&apos;re subscribed! Welcome aboard.
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubscribe}
                    className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-[#166f4f] text-sm font-bold hover:bg-white/90 transition-colors shadow-lg"
                    >
                      Subscribe Free
                    </button>
                  </form>
                )}
              </div>
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
