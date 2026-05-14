'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, X, Loader2 } from 'lucide-react';

interface ArticleListenerProps {
  title: string;
  content: string;
}

// Speechify API configuration
const SPEECHIFY_API_KEY = 'I1YSNWxfj8CTUPuhq6xpMRhK0aD_ttpqbcyI37Vz1lA=';
const SPEECHIFY_API_URL = 'https://api.speechify.com/v1/audio/stream';

// Voice options
const VOICES = [
  { id: 'mrbeast', name: 'MrBeast', description: 'Energetic & engaging' },
  { id: 'snoop', name: 'Snoop Dogg', description: 'Chill & smooth' },
  { id: 'gwyneth', name: 'Gwyneth', description: 'Warm & professional' },
  { id: 'david', name: 'David', description: 'Clear & authoritative' },
  { id: 'amber', name: 'Amber', description: 'Friendly & natural' },
  { id: 'hugh', name: 'Hugh', description: 'British & sophisticated' },
];

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '') // Remove headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
    .replace(/>\s*\*\*(.+?)\*\*:/g, '$1:') // Remove blockquote bold
    .replace(/^>\s+/gm, '') // Remove blockquotes
    .replace(/[-*✅❓🚩]\s*/g, '') // Remove list markers
    .replace(/\|/g, ' ') // Replace table pipes with space
    .replace(/-{3,}/g, '') // Remove horizontal rules
    .replace(/\n{3,}/g, '\n\n') // Normalize newlines
    .trim();
}

export function ArticleListener({ title, content }: ArticleListenerProps) {
  const [isOpen, setIsOpen] = useState(false);
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

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
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `TTS API error: ${response.status}`);
      }

      // Get audio as blob
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Create and setup audio element
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
        setError('Audio playback failed. Trying browser TTS fallback.');
        setIsPlaying(false);
      });

      setIsLoading(false);
      return audio;
    } catch (err) {
      console.error('Speechify TTS failed:', err);
      setError('Speechify TTS failed. Using browser TTS fallback.');
      setIsLoading(false);
      return null;
    }
  }, [plainText, selectedVoice, rate]);

  // Browser TTS fallback
  const browserTTS = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech not supported in this browser.');
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const text = plainText();
    // Split into chunks for better performance
    const chunks = text.match(/.{1,3000}/g) || [text];
    let chunkIndex = 0;

    const speakChunk = () => {
      if (chunkIndex >= chunks.length) {
        setIsPlaying(false);
        setProgress(100);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find a good English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                           voices.find(v => v.lang.startsWith('en')) ||
                           voices[0];
      if (englishVoice) utterance.voice = englishVoice;

      utterance.onend = () => {
        chunkIndex++;
        setProgress(Math.round((chunkIndex / chunks.length) * 100));
        speakChunk();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setError('Browser TTS failed.');
      };

      window.speechSynthesis.speak(utterance);
    };

    speakChunk();
    setIsPlaying(true);
  }, [plainText, rate]);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      } else {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
      return;
    }

    // Resume or start
    if (audioRef.current && audioUrl) {
      if (audioRef.current.paused && audioRef.current.currentTime > 0) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }
    }

    // Generate new audio
    const audio = await generateAudio();
    if (audio) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Fallback to browser TTS
        browserTTS();
      }
    } else {
      browserTTS();
    }
  }, [isPlaying, audioUrl, generateAudio, browserTTS]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  // Progress tracking
  useEffect(() => {
    if (isPlaying && audioRef.current) {
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
  }, [isPlaying]);

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

  // Skip forward/back 15 seconds
  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, audioRef.current.duration);
    }
  };

  const skipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Floating listen button
  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#166f4f] to-[#1c7352] text-white text-sm font-semibold shadow-lg shadow-[#166f4f]/25 hover:shadow-xl hover:shadow-[#166f4f]/30 transition-all"
      >
        <Volume2 className="w-4 h-4" />
        Listen to Article
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/30 bg-gradient-to-r from-[#166f4f]/5 to-[#76bf9f]/5">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#166f4f]" />
          <span className="text-sm font-semibold text-[#121212]">Article Reader</span>
        </div>
        <button
          onClick={() => { handleStop(); setIsOpen(false); }}
          className="p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <motion.div
          className="h-full bg-gradient-to-r from-[#166f4f] to-[#76bf9f]"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Controls */}
      <div className="px-4 py-3">
        {/* Voice picker */}
        <div className="mb-3">
          <button
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            className="text-xs text-slate-500 hover:text-[#166f4f] transition-colors"
          >
            Voice: {VOICES.find(v => v.id === selectedVoice)?.name || 'David'} ▾
          </button>
          <AnimatePresence>
            {showVoicePicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 grid grid-cols-2 gap-1.5 overflow-hidden"
              >
                {VOICES.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => { setSelectedVoice(voice.id); setShowVoicePicker(false); handleStop(); }}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      selectedVoice === voice.id
                        ? 'bg-[#166f4f]/10 text-[#166f4f] font-semibold border border-[#76bf9f]/30'
                        : 'bg-white/50 text-slate-600 border border-white/30 hover:bg-white/80'
                    }`}
                  >
                    <span className="font-medium">{voice.name}</span>
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
            className="p-1.5 rounded-full text-slate-400 hover:text-[#166f4f] hover:bg-[#166f4f]/10 transition-all"
            aria-label="Skip back 15s"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlay}
            disabled={isLoading}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#166f4f] to-[#1c7352] text-white flex items-center justify-center shadow-md shadow-[#166f4f]/25 hover:shadow-lg hover:shadow-[#166f4f]/30 transition-all disabled:opacity-50"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <button
            onClick={skipForward}
            className="p-1.5 rounded-full text-slate-400 hover:text-[#166f4f] hover:bg-[#166f4f]/10 transition-all"
            aria-label="Skip forward 15s"
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
              className="px-2 py-0.5 rounded-md bg-[#166f4f]/10 text-[#166f4f] text-xs font-semibold hover:bg-[#166f4f]/20 transition-colors"
            >
              {rate}x
            </button>
          </div>
        </div>

        {/* Time display */}
        {duration > 0 && (
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
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
