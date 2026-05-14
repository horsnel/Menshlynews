'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe,
  Bot,
  Zap,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Code2,
  MessageSquare,
  BarChart3,
  Mail,
  Clock,
  Shield,
} from 'lucide-react';

const services = [
  {
    icon: Globe,
    title: 'Website Development',
    description:
      'Custom, high-performance websites built with cutting-edge technology. From landing pages to full-scale web applications, we craft digital experiences that convert visitors into customers and scale with your business growth.',
    features: [
      'Responsive, mobile-first design',
      'Next.js & React development',
      'E-commerce & SaaS platforms',
      'SEO-optimized architecture',
      'Blazing fast page loads',
      'Ongoing maintenance & support',
    ],
    color: 'from-[#166f4f] to-[#1c7352]',
  },
  {
    icon: Bot,
    title: 'AI Automation',
    description:
      'Streamline your operations with intelligent automation. We build custom AI workflows that eliminate repetitive tasks, reduce human error, and free your team to focus on what actually moves the needle for your business.',
    features: [
      'Custom AI chatbots & assistants',
      'Workflow automation & integration',
      'Document processing & analysis',
      'Email & customer support automation',
      'Data extraction & reporting',
      'AI-powered content pipelines',
    ],
    color: 'from-[#1c7352] to-[#166f4f]',
  },
  {
    icon: Zap,
    title: 'AI-Powered Growth',
    description:
      'Combine beautiful technology with intelligent strategy. Our integrated approach pairs stunning web development with AI-driven automation to create growth engines that work around the clock while you sleep.',
    features: [
      'Lead generation systems',
      'Automated marketing funnels',
      'Smart analytics & insights',
      'Conversion rate optimization',
      'Social media automation',
      'Revenue scaling strategies',
    ],
    color: 'from-[#76bf9f] to-[#166f4f]',
  },
];

const stats = [
  { value: '50+', label: 'Projects Delivered' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '3x', label: 'Average ROI' },
  { value: '24/7', label: 'Support Available' },
];

const processSteps = [
  {
    icon: MessageSquare,
    title: 'Discovery Call',
    description: 'We learn about your business, goals, and pain points to craft the perfect solution.',
  },
  {
    icon: Code2,
    title: 'Build & Iterate',
    description: 'Our team designs and develops your solution with weekly check-ins and transparent progress.',
  },
  {
    icon: Zap,
    title: 'Launch & Automate',
    description: 'We deploy your project and set up AI automations that run on autopilot from day one.',
  },
  {
    icon: BarChart3,
    title: 'Scale & Optimize',
    description: 'Continuous improvements based on real data to maximize your return on investment.',
  },
];

export default function ServicesPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/services', {
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
      console.error('Service inquiry error:', error);
      setErrorMsg('Failed to send your inquiry. Please try again or email us directly at hello@menshlynews.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#166f4f] to-[#1c7352] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm mb-6">
              <TrendingUp className="w-4 h-4 text-[#76bf9f]" />
              <span className="text-[#76bf9f] font-medium">By the team behind Menshly Wire</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold serif mb-6 leading-tight">
              We Build Websites &<br />
              Automate with AI
            </h1>
            <p className="text-lg md:text-xl text-[#76bf9f]/80 mb-8 leading-relaxed max-w-2xl">
              From stunning websites to intelligent automation workflows — we help businesses grow faster with technology that works as hard as you do. Our AI-powered solutions save you time, reduce costs, and unlock revenue you didn&apos;t know existed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#166f4f] font-semibold hover:bg-[#f0f0f0] transition-colors shadow-lg"
              >
                Get a Free Consultation
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors"
              >
                View Our Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white/90 backdrop-blur-xl rounded-xl p-5 text-center shadow-lg border border-white/40"
            >
              <p className="text-3xl md:text-4xl font-bold text-[#166f4f]">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#121212] serif mb-4">
            What We Do
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We specialize in two things that matter most for modern businesses: building digital experiences that impress, and creating AI systems that automate growth. Together, they form an unstoppable engine for your success.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className={`bg-gradient-to-r ${service.color} p-6`}>
                <service.icon className="w-10 h-10 text-white mb-3" />
                <h3 className="text-xl font-bold text-white serif">{service.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  {service.description}
                </p>
                <ul className="space-y-2.5">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#166f4f] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-white/80 backdrop-blur-xl border-y border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#121212] serif mb-4">
              How We Work
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A clear, proven process that takes you from idea to launch — and keeps delivering results long after. No surprises, no jargon, just transparent collaboration every step of the way.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="relative text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#166f4f]/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-[#166f4f]" />
                </div>
                <h3 className="text-lg font-bold text-[#121212] serif mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#121212] serif mb-6">
              Why Businesses Choose Us
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              We&apos;re not just developers — we&apos;re entrepreneurs who understand that technology must serve the bottom line. Every solution we build is designed with one question in mind: how does this make you more money, save you time, or both?
            </p>
            <div className="space-y-5">
              {[
                {
                  icon: Clock,
                  title: 'Fast Delivery',
                  desc: 'Most projects launch in 2-4 weeks, not months. We use AI-assisted workflows to move faster without sacrificing quality.',
                },
                {
                  icon: Shield,
                  title: 'Reliable & Secure',
                  desc: 'Enterprise-grade security and 99.9% uptime. Your business deserves technology that never sleeps and never breaks.',
                },
                {
                  icon: TrendingUp,
                  title: 'ROI-Focused',
                  desc: 'Every feature, every design choice, every automation is tied to a measurable outcome. Beautiful is good — profitable is better.',
                },
                {
                  icon: Bot,
                  title: 'AI-Native Approach',
                  desc: 'We don\'t just add AI as an afterthought. Our solutions are built from the ground up to leverage artificial intelligence at every layer.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#166f4f]/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#166f4f]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#121212] mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-[#166f4f] to-[#1c7352] rounded-2xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold serif mb-6">Free Strategy Call</h3>
            <p className="text-[#76bf9f]/80 mb-6 leading-relaxed">
              Book a 30-minute call with our team. We&apos;ll analyze your current setup, identify automation opportunities, and give you a clear roadmap — completely free, no strings attached.
            </p>
            <div className="space-y-4 mb-8">
              {[
                'Full audit of your current tech stack',
                'Custom automation opportunity report',
                'Estimated ROI projections',
                'Priority recommendations for quick wins',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#76bf9f] flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#166f4f] font-semibold hover:bg-[#f0f0f0] transition-colors shadow-lg"
            >
              Book Your Free Call
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="bg-white/80 backdrop-blur-xl border-y border-white/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#121212] serif mb-4">
              Let&apos;s Build Something Great
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Tell us about your project and we&apos;ll get back to you within 24 hours with a custom proposal. No generic templates — just real solutions tailored to your business.
            </p>
          </motion.div>

          {!submitted ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {errorMsg && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {errorMsg}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#121212] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-[#121212] placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#166f4f]/20 focus:border-[#166f4f] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#121212] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-[#121212] placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#166f4f]/20 focus:border-[#166f4f] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#121212] mb-1.5">
                  Service Interested In
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-[#121212] text-sm focus:outline-none focus:ring-2 focus:ring-[#166f4f]/20 focus:border-[#166f4f] transition-colors"
                >
                  <option value="">Select a service...</option>
                  <option value="website">Website Development</option>
                  <option value="automation">AI Automation</option>
                  <option value="both">Website + AI Automation</option>
                  <option value="other">Other / Not Sure Yet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#121212] mb-1.5">
                  Tell Us About Your Project
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="What are you looking to build? What problems are you trying to solve?"
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-[#121212] placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#166f4f]/20 focus:border-[#166f4f] transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#166f4f] to-[#1c7352] text-white font-semibold hover:from-[#1c7352] hover:to-[#166f4f] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 rounded-full bg-[#166f4f]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#166f4f]" />
              </div>
              <h3 className="text-2xl font-bold text-[#121212] serif mb-2">Message Sent!</h3>
              <p className="text-slate-500 mb-6">
                We&apos;ll review your project details and get back to you within 24 hours.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[#166f4f] font-medium hover:text-[#1c7352] transition-colors"
              >
                Back to Blog
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#166f4f] to-[#1c7352] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white serif">
                Menshly Wire
              </span>
            </div>
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Menshly Wire. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
