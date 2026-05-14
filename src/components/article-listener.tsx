'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Play, Pause, SkipBack, SkipForward, X, Loader2, ChevronDown, AlertCircle, RotateCcw } from 'lucide-react';

interface ArticleListenerProps {
  title: string;
  content: string;
}

const VOICES = [
  { id: 'aria', name: 'Aria', description: 'Warm & professional' },
  { id: 'david', name: 'David', description: 'Clear & authoritative' },
  { id: 'jenny', name: 'Jenny', description: 'Friendly & natural' },
  { id: 'christopher', name: 'Christopher', description: 'Deep & engaging' },
  { id: 'sonia', name: 'Sonia', description: 'British & elegant' },
  { id: 'ryan', name: 'Ryan', description: 'British & clear' },
];

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/>\s*\*\*(.+?)\*\*:/g, '$1:')
    .replace(/^>\s+/gm, '')
    .replace(/[-*✅❓🚩]\s*/g, '')
    .replace(/\|/g, ' ')
    .replace(/-{3,}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function ArticleListener({ title, content }: ArticleListenerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false); // loading next chunk while playing
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('aria');
  const [error, setError] = useState<string | null>(null);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [ttsEngine, setTtsEngine] = useState<'idle' | 'server' | 'browser'>('idle');
  const [totalTextLength, setTotalTextLength] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const plainTextRef = useRef<string>('');
  const nextOffsetRef = useRef(0);
  const hasMoreRef = useRef(false);

  const getPlainText = useCallback(() => {
    return stripMarkdown(`${title}\n\n${content}`);
  }, [title, content]);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  // Fetch one chunk of audio from the server
  const fetchChunk = useCallback(async (offset: number): Promise<{ audio: HTMLAudioElement; nextOffset: number; hasMore: boolean } | null> => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: plainTextRef.current, voice: selectedVoice, rate, offset }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ fallback: true }));
        if (errData.fallback) return null;
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size < 100) throw new Error('Empty audio');

      const nOff = parseInt(response.headers.get('X-TTS-Next-Offset') || '0', 10);
      const hMore = response.headers.get('X-TTS-Has-More') === 'true';
      const tLen = parseInt(response.headers.get('X-TTS-Total-Length') || '0', 10);

      if (tLen) setTotalTextLength(tLen);

      cleanupAudio();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      audioRef.current = audio;

      await new Promise<void>((resolve) => {
        const done = () => { audio.removeEventListener('canplaythrough', done); audio.removeEventListener('error', done); resolve(); };
        audio.addEventListener('canplaythrough', done);
        audio.addEventListener('error', done);
        setTimeout(done, 10000);
      });

      if (!isMountedRef.current) return null;

      return { audio, nextOffset: nOff, hasMore: hMore };
    } catch (err) {
      console.warn('[TTS] Chunk fetch failed:', err);
      return null;
    }
  }, [selectedVoice, rate, cleanupAudio]);

  // Set up event listeners on current audio element
  const attachAudioListeners = useCallback((audio: HTMLAudioElement) => {
    audio.addEventListener('ended', async () => {
      if (!isMountedRef.current) return;

      // Auto-load next chunk if available
      if (hasMoreRef.current) {
        setIsBuffering(true);
        const result = await fetchChunk(nextOffsetRef.current);
        setIsBuffering(false);

        if (result && isMountedRef.current) {
          nextOffsetRef.current = result.nextOffset;
          hasMoreRef.current = result.hasMore;
          setCurrentOffset(result.nextOffset);
          setHasMore(result.hasMore);
          setDuration(result.audio.duration || 0);
          setCurrentTime(0);

          attachAudioListeners(result.audio);

          try {
            await result.audio.play();
          } catch {
            // autoplay blocked
            setIsPlaying(false);
          }
        } else {
          // Fallback or done
          setIsPlaying(false);
          setProgress(100);
        }
      } else {
        setIsPlaying(false);
        setProgress(100);
      }
    });

    audio.addEventListener('error', () => {
      if (isMountedRef.current) {
        setTtsEngine('browser');
        setIsPlaying(false);
        setError('Audio error — using browser TTS');
      }
    });
  }, [fetchChunk]);

  // Generate first chunk and play
  const generateAndPlay = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    plainTextRef.current = getPlainText();
    setCurrentOffset(0);

    const result = await fetchChunk(0);
    setIsLoading(false);

    if (result && isMountedRef.current) {
      nextOffsetRef.current = result.nextOffset;
      hasMoreRef.current = result.hasMore;
      setCurrentOffset(result.nextOffset);
      setHasMore(result.hasMore);
      setDuration(result.audio.duration || 0);
      setCurrentTime(0);
      setTtsEngine('server');

      attachAudioListeners(result.audio);

      try {
        await result.audio.play();
        setIsPlaying(true);
      } catch {
        // autoplay blocked — fall back to browser TTS
        startBrowserTTS();
      }
    } else if (isMountedRef.current) {
      startBrowserTTS();
    }
  }, [getPlainText, fetchChunk, attachAudioListeners]);

  // Browser TTS fallback
  const startBrowserTTS = useCallback(() => {
    if (!('speechSynthesis' in window)) { setError('TTS not supported.'); return; }
    window.speechSynthesis.cancel();

    const text = getPlainText();
    const chunks = text.match(/.{1,1500}/g) || [text];
    let idx = 0;

    const speakNext = () => {
      if (!isMountedRef.current) return;
      if (idx >= chunks.length) { setIsPlaying(false); setProgress(100); return; }

      const u = new SpeechSynthesisUtterance(chunks[idx]);
      u.rate = rate;
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (v) u.voice = v;

      u.onend = () => { if (!isMountedRef.current) return; idx++; setProgress(Math.round((idx / chunks.length) * 100)); speakNext(); };
      u.onerror = () => { if (isMountedRef.current) { setIsPlaying(false); setError('Browser TTS error.'); } };
      window.speechSynthesis.speak(u);
    };

    speakNext();
    setTtsEngine('browser');
    setIsPlaying(true);
    setError('Using browser text-to-speech');
  }, [getPlainText, rate]);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      if (ttsEngine === 'browser') window.speechSynthesis.pause();
      else if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Resume paused server audio
    if (ttsEngine === 'server' && audioRef.current?.paused && audioRef.current.currentTime > 0) {
      try { await audioRef.current.play(); setIsPlaying(true); return; } catch { startBrowserTTS(); return; }
    }

    // Resume paused browser TTS
    if (ttsEngine === 'browser') {
      window.speechSynthesis.resume(); setIsPlaying(true); return;
    }

    // Start fresh
    await generateAndPlay();
  }, [isPlaying, ttsEngine, generateAndPlay, startBrowserTTS]);

  const handleStop = useCallback(() => {
    cleanupAudio();
    window.speechSynthesis.cancel();
    setIsPlaying(false); setIsBuffering(false); setProgress(0); setCurrentTime(0);
    setTtsEngine('idle'); setCurrentOffset(0); setHasMore(false); setError(null);
  }, [cleanupAudio]);

  // Progress tracking
  useEffect(() => {
    if (isPlaying && ttsEngine === 'server' && audioRef.current) {
      progressInterval.current = setInterval(() => {
        if (audioRef.current && isMountedRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          if (audioRef.current.duration > 0 && isFinite(audioRef.current.duration)) {
            // Overall progress = completed portion + current chunk progress
            const chunkProgress = audioRef.current.currentTime / audioRef.current.duration;
            const overallProgress = totalTextLength > 0
              ? ((currentOffset + chunkProgress * (audioRef.current.duration * 50)) / totalTextLength) * 100 // rough estimate
              : chunkProgress * 100;
            setProgress(Math.min(Math.round(overallProgress), 99));
          }
        }
      }, 500);
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [isPlaying, ttsEngine, currentOffset, totalTextLength]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; cleanupAudio(); window.speechSynthesis.cancel(); };
  }, [cleanupAudio]);

  const formatTime = (s: number) => {
    if (!isFinite(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  if (isDismissed) {
    return (
      <motion.button onClick={() => setIsDismissed(false)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#166f4f]/10 text-[#166f4f] text-sm font-semibold hover:bg-[#166f4f]/20 transition-all border border-[#166f4f]/20">
        <Volume2 className="w-4 h-4" /> Listen to this article
      </motion.button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#166f4f] to-[#1c7352]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            {isLoading || isBuffering ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Volume2 className="w-4 h-4 text-white" />}
          </div>
          <div>
            <span className="text-sm font-bold text-white">Listen to this article</span>
            <span className="block text-[10px] text-white/60">
              {ttsEngine === 'browser' ? 'Browser TTS' : ttsEngine === 'server' ? 'Microsoft TTS' : 'Powered by Microsoft TTS'}
            </span>
          </div>
        </div>
        <button onClick={() => { handleStop(); setIsDismissed(true); }}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors" aria-label="Close">
          <X className="w-4 h-4 text-white/80" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <motion.div className="h-full bg-gradient-to-r from-[#166f4f] to-[#76bf9f] transition-all duration-300"
          style={{ width: `${progress}%` }} />
      </div>

      {/* Info banner */}
      {error && !isLoading && (
        <div className={`px-5 py-2.5 border-b flex items-start gap-2 ${ttsEngine === 'browser' ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
          <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${ttsEngine === 'browser' ? 'text-blue-500' : 'text-amber-500'}`} />
          <p className={`text-xs leading-relaxed ${ttsEngine === 'browser' ? 'text-blue-700' : 'text-amber-700'}`}>{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="px-5 py-4">
        {/* Voice picker */}
        <div className="mb-3">
          <button onClick={() => setShowVoicePicker(!showVoicePicker)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#166f4f] transition-colors">
            <span className="font-medium">Voice: {VOICES.find(v => v.id === selectedVoice)?.name || 'Aria'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showVoicePicker ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showVoicePicker && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-2 grid grid-cols-3 gap-1.5 overflow-hidden">
                {VOICES.map(voice => (
                  <button key={voice.id}
                    onClick={() => { setSelectedVoice(voice.id); setShowVoicePicker(false); handleStop(); }}
                    className={`text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                      selectedVoice === voice.id
                        ? 'bg-[#166f4f]/10 text-[#166f4f] font-semibold border border-[#76bf9f]/30 ring-1 ring-[#166f4f]/20'
                        : 'bg-white/60 text-slate-600 border border-white/30 hover:bg-white/80'
                    }`}>
                    <span className="font-medium block">{voice.name}</span>
                    <span className="block text-[10px] text-slate-400">{voice.description}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Playback */}
        <div className="flex items-center gap-3">
          <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0); }}
            disabled={ttsEngine !== 'server'} title="Skip back 15s"
            className="p-2 rounded-full text-slate-400 hover:text-[#166f4f] hover:bg-[#166f4f]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <SkipBack className="w-4 h-4" />
          </button>

          <button onClick={handlePlay} disabled={isLoading}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#166f4f] to-[#1c7352] text-white flex items-center justify-center shadow-lg shadow-[#166f4f]/30 hover:shadow-xl hover:shadow-[#166f4f]/40 transition-all disabled:opacity-60 active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, audioRef.current.duration || 0); }}
            disabled={ttsEngine !== 'server'} title="Skip forward 15s"
            className="p-2 rounded-full text-slate-400 hover:text-[#166f4f] hover:bg-[#166f4f]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <SkipForward className="w-4 h-4" />
          </button>

          <button onClick={() => {
            const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
            const nextRate = speeds[(speeds.indexOf(rate) + 1) % speeds.length];
            setRate(nextRate);
            if (audioRef.current) audioRef.current.playbackRate = nextRate;
          }}
            className="ml-auto px-3 py-1.5 rounded-lg bg-[#166f4f]/10 text-[#166f4f] text-xs font-bold hover:bg-[#166f4f]/20 transition-colors min-w-[48px] text-center">
            {rate}x
          </button>
        </div>

        {/* Time */}
        {duration > 0 && ttsEngine === 'server' && (
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 font-medium tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}

        {/* Buffering indicator */}
        {isBuffering && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#166f4f] font-medium">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading next part...
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#166f4f] font-medium">
            <Loader2 className="w-3 h-3 animate-spin" /> Generating audio...
          </div>
        )}
      </div>
    </motion.div>
  );
}
