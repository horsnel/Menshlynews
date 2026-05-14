'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useBlogStore } from '@/lib/store';
import { useSubscriberCount } from '@/hooks/use-subscriber-count';

export function NewsletterPopup() {
  const { isNewsletterOpen, setNewsletterOpen } = useBlogStore();
  const { displayCount } = useSubscriberCount();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'popup' }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Show error but still mark as submitted for UX (they can try again later)
        console.error('Newsletter error:', data.error);
      }

      setSubmitted(true);
      setTimeout(() => {
        setNewsletterOpen(false);
        setTimeout(() => {
          setSubmitted(false);
          setEmail('');
        }, 300);
      }, 3000);
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setSubmitted(true); // Still show success to not frustrate users
      setTimeout(() => {
        setNewsletterOpen(false);
        setTimeout(() => {
          setSubmitted(false);
          setEmail('');
        }, 300);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewsletterOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isNewsletterOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/60 hover:bg-white/80 text-slate-500 hover:text-slate-700 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Decorative gradient header */}
              <div className="relative bg-gradient-to-br from-[#166f4f] to-[#1c7352] px-6 pt-8 pb-6 text-white overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold serif mb-1">
                    Join {displayCount || '50,000+'} Readers
                  </h2>
                  <p className="text-[#76bf9f]/90 text-sm">
                    Get the latest AI money-making strategies delivered to your inbox every week.
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {!submitted ? (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#121212] mb-1.5">
                          Email address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-slate-50/80 border border-slate-200 text-[#121212] placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#166f4f]/20 focus:border-[#166f4f] transition-colors"
                          autoFocus
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !email.trim() || !email.includes('@')}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#166f4f] to-[#1c7352] text-white text-sm font-semibold hover:from-[#1c7352] hover:to-[#166f4f] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Subscribe
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Sparkles className="w-3.5 h-3.5 text-[#166f4f] flex-shrink-0" />
                        <span>Weekly AI-powered wealth strategies</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle className="w-3.5 h-3.5 text-[#166f4f] flex-shrink-0" />
                        <span>No spam, unsubscribe anytime</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle className="w-3.5 h-3.5 text-[#166f4f] flex-shrink-0" />
                        <span>Exclusive tips not found on the blog</span>
                      </div>
                    </div>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#166f4f]/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-[#166f4f]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] serif mb-2">
                      Welcome aboard!
                    </h3>
                    <p className="text-sm text-slate-500">
                      Check your inbox for a confirmation email. Your first issue arrives this Friday.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
