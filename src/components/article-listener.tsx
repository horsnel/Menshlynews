'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Play, Pause, SkipBack, SkipForward, X, Loader2, ChevronDown, AlertCircle } from 'lucide-react';

interface ArticleListenerProps {
  title: string;
  content: string;
}

// Voice options — works with both Speechify and Microsoft Edge TTS
const VOICES = [
  { id: 'david', name: 'David', description: 'Clear & authoritative', msVoice: 'en-US-GuyNeural' },
  { id: 'aria', name: 'Aria', description: 'Warm & professional', msVoice: 'en-US-AriaNeural' },
  { id: 'jenny', name: 'Jenny', description: 'Friendly & natural', msVoice: 'en-US-JennyNeural' },
  { id: 'christopher', name: 'Christopher', description: 'Deep & engaging', msVoice: 'en-US-ChristopherNeural' },
  { id: 'sonia', name: 'Sonia', description: 'British & elegant', msVoice: 'en-GB-SoniaNeural' },
  { id: 'ryan', name: 'Ryan', description: 'British & clear', msVoice: 'en-GB-RyanNeural' },
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
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('aria');
  const [error, setError] = useState<string | null>(null);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [ttsEngine, setTtsEngine] = useState<'idle' | 'speechify' | 'microsoft' | 'browser'>('idle');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const ttsChunkIndex = useRef(0);
  const ttsChunks = useRef<string[]>([]);
  const isMountedRef = useRef(true);

  const getPlainText = useCallback(() => {
    return stripMarkdown(`${title}\n\n${content}`);
  }, [title, content]);

  // Clean up audio resources
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

  // Generate audio from server TTS (tries Speechify first, then Microsoft)
  const generateServerAudio = useCallback(async (): Promise<HTMLAudioElement | null> => {
    setIsLoading(true);
    setError(null);
    setStatusMsg('Generating audio with Speechify...');

    try {
      const text = getPlainText();
      console.log(`[ArticleListener] Requesting TTS for ${text.length} chars, voice: ${selectedVoice}`);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          rate,
          engine: 'auto', // Try Speechify first, then Microsoft
        }),
      });

      // Check which engine was used based on response headers or status
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error', fallback: false }));
        console.warn('[ArticleListener] Server TTS error:', response.status, errorData);

        if (errorData.fallback) {
          // Server TTS completely failed — use browser TTS
          throw new Error('server-fallback');
        }
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      console.log(`[ArticleListener] Received blob: type=${audioBlob.type}, size=${audioBlob.size}`);

      // Validate audio response
      if (audioBlob.size < 100) {
        throw new Error('Empty audio response');
      }

      // Clean up previous audio
      cleanupAudio();

      const url = URL.createObjectURL(audioBlob);
      audioUrlRef.current = url;

      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      audioRef.current = audio;

      // Determine which engine was used (Speechify gives larger files typically)
      const usedEngine = 'speechify'; // We'll update this if Speechify fails

      // Wait for audio to be ready to play
      setStatusMsg('Loading audio...');
      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => { cleanup(); resolve(); };
        const onError = () => { cleanup(); reject(new Error('Audio failed to load')); };
        const cleanup = () => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
        };
        audio.addEventListener('canplaythrough', onCanPlay);
        audio.addEventListener('error', onError);
        setTimeout(() => {
          cleanup();
          if (audio.duration > 0) resolve();
          else reject(new Error('Audio loading timed out'));
        }, 15000);
      });

      if (!isMountedRef.current) return null;

      setDuration(audio.duration || 0);
      setTtsEngine(usedEngine);
      setIsLoading(false);
      setStatusMsg(null);

      // Set up event listeners
      audio.addEventListener('ended', () => {
        if (isMountedRef.current) {
          setIsPlaying(false);
          setProgress(100);
        }
      });

      audio.addEventListener('error', () => {
        console.warn('[ArticleListener] Audio playback error');
        if (isMountedRef.current) {
          setError('Audio playback error. Trying browser TTS...');
          setIsPlaying(false);
          setTtsEngine('browser');
        }
      });

      return audio;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      console.warn('[ArticleListener] Server TTS failed:', errMsg);

      if (errMsg === 'server-fallback') {
        // Both Speechify and Microsoft TTS failed — use browser TTS
        setIsLoading(false);
        setStatusMsg(null);
        setTtsEngine('browser');
        return null;
      }

      // Try Microsoft TTS specifically
      setError(null);
      setStatusMsg('Trying Microsoft TTS...');
      try {
        const msResponse = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: getPlainText(),
            voice: selectedVoice,
            rate,
            engine: 'microsoft',
          }),
        });

        if (msResponse.ok) {
          const msBlob = await msResponse.blob();
          if (msBlob.size > 100) {
            cleanupAudio();
            const url = URL.createObjectURL(msBlob);
            audioUrlRef.current = url;
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = url;
            audioRef.current = audio;

            await new Promise<void>((resolve, reject) => {
              const onCanPlay = () => { cleanup(); resolve(); };
              const onError = () => { cleanup(); reject(new Error('Audio load failed')); };
              const cleanup = () => {
                audio.removeEventListener('canplaythrough', onCanPlay);
                audio.removeEventListener('error', onError);
              };
              audio.addEventListener('canplaythrough', onCanPlay);
              audio.addEventListener('error', onError);
              setTimeout(() => { cleanup(); resolve(); }, 15000);
            });

            if (isMountedRef.current) {
              setDuration(audio.duration || 0);
              setTtsEngine('microsoft');
              setIsLoading(false);
              setStatusMsg(null);
              setError(null);

              audio.addEventListener('ended', () => {
                if (isMountedRef.current) { setIsPlaying(false); setProgress(100); }
              });

              return audio;
            }
          }
        }
      } catch (msErr) {
        console.warn('[ArticleListener] Microsoft TTS also failed:', msErr);
      }

      // Everything failed — use browser TTS
      if (isMountedRef.current) {
        setIsLoading(false);
        setStatusMsg(null);
        setTtsEngine('browser');
        setError('Using browser text-to-speech (server TTS unavailable)');
      }
      return null;
    }
  }, [getPlainText, selectedVoice, rate, cleanupAudio]);

  // Browser TTS
  const startBrowserTTS = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const text = getPlainText();
    const rawChunks = text.match(/.{1,1500}/g) || [text];
    ttsChunks.current = rawChunks;
    ttsChunkIndex.current = 0;

    const speakNextChunk = () => {
      if (!isMountedRef.current) return;
      if (ttsChunkIndex.current >= ttsChunks.current.length) {
        setIsPlaying(false);
        setProgress(100);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(ttsChunks.current[ttsChunkIndex.current]);
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                           voices.find(v => v.lang.startsWith('en')) ||
                           voices[0];
      if (englishVoice) utterance.voice = englishVoice;

      utterance.onend = () => {
        if (!isMountedRef.current) return;
        ttsChunkIndex.current++;
        setProgress(Math.round((ttsChunkIndex.current / ttsChunks.current.length) * 100));
        speakNextChunk();
      };

      utterance.onerror = () => {
        if (!isMountedRef.current) return;
        setIsPlaying(false);
        setError('Browser TTS encountered an error.');
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextChunk();
    setTtsEngine('browser');
    setIsPlaying(true);
    setError(null);
  }, [getPlainText, rate]);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      if (ttsEngine === 'browser') {
        window.speechSynthesis.pause();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    // Resume paused server audio
    if ((ttsEngine === 'speechify' || ttsEngine === 'microsoft') && audioRef.current) {
      if (audioRef.current.paused && audioRef.current.currentTime > 0) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          return;
        } catch {
          // Autoplay blocked
          startBrowserTTS();
          return;
        }
      }
    }

    // Resume paused browser TTS
    if (ttsEngine === 'browser' && ttsChunkIndex.current > 0 && ttsChunkIndex.current < ttsChunks.current.length) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    // Start fresh — try server TTS
    const audio = await generateServerAudio();
    if (audio) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Autoplay blocked — try browser TTS
        startBrowserTTS();
      }
    } else if (ttsEngine === 'browser') {
      // Server TTS failed, browser TTS was set as fallback
      startBrowserTTS();
    }
  }, [isPlaying, ttsEngine, generateServerAudio, startBrowserTTS]);

  const handleStop = useCallback(() => {
    cleanupAudio();
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setTtsEngine('idle');
    ttsChunkIndex.current = 0;
    setError(null);
    setStatusMsg(null);
  }, [cleanupAudio]);

  // Progress tracking for server audio
  useEffect(() => {
    if (isPlaying && (ttsEngine === 'speechify' || ttsEngine === 'microsoft') && audioRef.current) {
      progressInterval.current = setInterval(() => {
        if (audioRef.current && isMountedRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          if (audioRef.current.duration > 0 && isFinite(audioRef.current.duration)) {
            setProgress(Math.round((audioRef.current.currentTime / audioRef.current.duration) * 100));
          }
        }
      }, 500);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, ttsEngine]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupAudio();
      window.speechSynthesis.cancel();
    };
  }, [cleanupAudio]);

  const skipForward = () => {
    if (audioRef.current && (ttsEngine === 'speechify' || ttsEngine === 'microsoft')) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, audioRef.current.duration || 0);
    }
  };

  const skipBack = () => {
    if (audioRef.current && (ttsEngine === 'speechify' || ttsEngine === 'microsoft')) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const engineLabel = ttsEngine === 'speechify' ? 'Speechify' :
                     ttsEngine === 'microsoft' ? 'Microsoft TTS' :
                     ttsEngine === 'browser' ? 'Browser TTS' : '';

  if (isDismissed) {
    return (
      <motion.button
        onClick={() => setIsDismissed(false)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#166f4f]/10 text-[#166f4f] text-sm font-semibold hover:bg-[#166f4f]/20 transition-all border border-[#166f4f]/20"
      >
        <Volume2 className="w-4 h-4" />
        Listen to this article
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-xl overflow-hidden"
    >
      {/* Green gradient header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#166f4f] to-[#1c7352]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <span className="text-sm font-bold text-white">Listen to this article</span>
            <span className="block text-[10px] text-white/60">
              {engineLabel || 'Powered by Speechify & Microsoft TTS'}
            </span>
          </div>
        </div>
        <button
          onClick={() => { handleStop(); setIsDismissed(true); }}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close player"
        >
          <X className="w-4 h-4 text-white/80" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <motion.div
          className="h-full bg-gradient-to-r from-[#166f4f] to-[#76bf9f] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Error banner */}
      {error && !isLoading && (
        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="px-5 py-4">
        {/* Voice picker */}
        <div className="mb-3">
          <button
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#166f4f] transition-colors"
          >
            <span className="font-medium">
              Voice: {VOICES.find(v => v.id === selectedVoice)?.name || 'Aria'}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showVoicePicker ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showVoicePicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 grid grid-cols-3 gap-1.5 overflow-hidden"
              >
                {VOICES.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      setSelectedVoice(voice.id);
                      setShowVoicePicker(false);
                      handleStop();
                    }}
                    className={`text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                      selectedVoice === voice.id
                        ? 'bg-[#166f4f]/10 text-[#166f4f] font-semibold border border-[#76bf9f]/30 ring-1 ring-[#166f4f]/20'
                        : 'bg-white/60 text-slate-600 border border-white/30 hover:bg-white/80'
                    }`}
                  >
                    <span className="font-medium block">{voice.name}</span>
                    <span className="block text-[10px] text-slate-400">{voice.description}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={skipBack}
            disabled={ttsEngine === 'browser' || ttsEngine === 'idle'}
            className="p-2 rounded-full text-slate-400 hover:text-[#166f4f] hover:bg-[#166f4f]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Skip back 15s"
            title="Skip back 15s"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlay}
            disabled={isLoading}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#166f4f] to-[#1c7352] text-white flex items-center justify-center shadow-lg shadow-[#166f4f]/30 hover:shadow-xl hover:shadow-[#166f4f]/40 transition-all disabled:opacity-60 active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={skipForward}
            disabled={ttsEngine === 'browser' || ttsEngine === 'idle'}
            className="p-2 rounded-full text-slate-400 hover:text-[#166f4f] hover:bg-[#166f4f]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Skip forward 15s"
            title="Skip forward 15s"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed control */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
                const currentIndex = speeds.indexOf(rate);
                const nextRate = speeds[(currentIndex + 1) % speeds.length];
                setRate(nextRate);
                if (audioRef.current) audioRef.current.playbackRate = nextRate;
              }}
              className="px-3 py-1.5 rounded-lg bg-[#166f4f]/10 text-[#166f4f] text-xs font-bold hover:bg-[#166f4f]/20 transition-colors min-w-[48px] text-center"
            >
              {rate}x
            </button>
          </div>
        </div>

        {/* Time display (server TTS modes) */}
        {duration > 0 && (ttsEngine === 'speechify' || ttsEngine === 'microsoft') && (
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 font-medium tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}

        {/* Browser TTS progress */}
        {ttsEngine === 'browser' && isPlaying && (
          <div className="mt-3 text-[11px] text-slate-400 font-medium">
            Playing chunk {ttsChunkIndex.current + 1} of {ttsChunks.current.length}
          </div>
        )}

        {/* Loading / status message */}
        {(isLoading || statusMsg) && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#166f4f] font-medium">
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            {statusMsg || 'Generating audio...'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
