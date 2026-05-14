'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Play, Pause, SkipBack, SkipForward, X, Loader2, ChevronDown } from 'lucide-react';

interface ArticleListenerProps {
  title: string;
  content: string;
}

// Voice options for Speechify
const VOICES = [
  { id: 'david', name: 'David', description: 'Clear & authoritative' },
  { id: 'gwyneth', name: 'Gwyneth', description: 'Warm & professional' },
  { id: 'mrbeast', name: 'MrBeast', description: 'Energetic & engaging' },
  { id: 'snoop', name: 'Snoop Dogg', description: 'Chill & smooth' },
  { id: 'emma', name: 'Emma', description: 'Friendly & natural' },
  { id: 'kimberly', name: 'Kimberly', description: 'Sophisticated & clear' },
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
  const [selectedVoice, setSelectedVoice] = useState('david');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [useBrowserTTS, setUseBrowserTTS] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const ttsChunkIndex = useRef(0);
  const ttsChunks = useRef<string[]>([]);

  const plainText = useCallback(() => {
    return stripMarkdown(`${title}\n\n${content}`);
  }, [title, content]);

  // Generate audio using Speechify API
  const generateAudio = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: plainText(),
          voice: selectedVoice,
          rate,
        }),
      });

      if (!response.ok) {
        throw new Error('Speechify API error — falling back to browser TTS');
      }

      const audioBlob = await response.blob();

      // Check if the response is actually audio (not an error JSON)
      if (audioBlob.type && !audioBlob.type.startsWith('audio/')) {
        throw new Error('Invalid audio response — falling back to browser TTS');
      }

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(100);
      });

      audio.addEventListener('error', () => {
        console.warn('Audio playback error — falling back to browser TTS');
        setUseBrowserTTS(true);
        setIsPlaying(false);
      });

      setIsLoading(false);
      setUseBrowserTTS(false);
      return audio;
    } catch (err) {
      console.warn('Speechify TTS failed, using browser fallback:', err);
      setIsLoading(false);
      setUseBrowserTTS(true);
      return null;
    }
  }, [plainText, selectedVoice, rate]);

  // Browser TTS — speak chunks sequentially
  const startBrowserTTS = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const text = plainText();
    ttsChunks.current = text.match(/.{1,2000}/g) || [text];
    ttsChunkIndex.current = 0;

    const speakNextChunk = () => {
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
        ttsChunkIndex.current++;
        setProgress(Math.round((ttsChunkIndex.current / ttsChunks.current.length) * 100));
        speakNextChunk();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setError('Browser TTS failed.');
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextChunk();
    setIsPlaying(true);
  }, [plainText, rate]);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      // Pause
      if (useBrowserTTS) {
        window.speechSynthesis.pause();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    // Resume paused audio
    if (!useBrowserTTS && audioRef.current && audioUrl) {
      if (audioRef.current.paused && audioRef.current.currentTime > 0) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }
    }

    // Resume paused browser TTS
    if (useBrowserTTS && ttsChunkIndex.current > 0 && ttsChunkIndex.current < ttsChunks.current.length) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    // Start fresh — try Speechify first, then fallback
    const audio = await generateAudio();
    if (audio) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        startBrowserTTS();
      }
    } else {
      startBrowserTTS();
    }
  }, [isPlaying, audioUrl, useBrowserTTS, generateAudio, startBrowserTTS]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    ttsChunkIndex.current = 0;
  }, []);

  // Progress tracking for audio element
  useEffect(() => {
    if (isPlaying && !useBrowserTTS && audioRef.current) {
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          if (audioRef.current.duration > 0) {
            setProgress(Math.round((audioRef.current.currentTime / audioRef.current.duration) * 100));
          }
        }
      }, 500);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, useBrowserTTS]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioUrl) URL.revokeObjectURL(audioUrl);
      }
      window.speechSynthesis.cancel();
    };
  }, [audioUrl]);

  const skipForward = () => {
    if (audioRef.current && !useBrowserTTS) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, audioRef.current.duration);
    }
  };

  const skipBack = () => {
    if (audioRef.current && !useBrowserTTS) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isDismissed) {
    return (
      <motion.button
        onClick={() => setIsDismissed(false)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#166f4f]/10 text-[#166f4f] text-sm font-medium hover:bg-[#166f4f]/20 transition-all"
      >
        <Volume2 className="w-4 h-4" />
        Listen
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
            <Volume2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Listen to this article</span>
            <span className="block text-[10px] text-white/60">Powered by Speechify</span>
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

      {/* Controls */}
      <div className="px-5 py-4">
        {/* Voice picker */}
        <div className="mb-3">
          <button
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#166f4f] transition-colors"
          >
            <span className="font-medium">Voice: {VOICES.find(v => v.id === selectedVoice)?.name || 'David'}</span>
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
                      setUseBrowserTTS(false);
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
            disabled={useBrowserTTS}
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
            disabled={useBrowserTTS}
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

        {/* Time display */}
        {duration > 0 && !useBrowserTTS && (
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 font-medium tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}

        {/* Browser TTS indicator */}
        {useBrowserTTS && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
            Using browser TTS (Speechify unavailable)
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-xs text-amber-600 mt-2">{error}</p>
        )}
      </div>
    </motion.div>
  );
}
