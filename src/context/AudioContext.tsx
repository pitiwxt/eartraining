import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getAudioPaths, songs } from '../data/frequencies';

export type AudioSource = 'original' | 'boosted';

interface AudioContextProps {
  isPlaying: boolean;
  activeSource: AudioSource;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentSongId: string;
  currentFreqValue: number | undefined; // undefined means no boost loaded
  isMuted: boolean;
  
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setActiveSource: (source: AudioSource) => void;
  toggleSource: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setSong: (songId: string) => void;
  setFrequency: (freqValue: number | undefined) => void;
  loadTrack: (songId: string, freqValue: number | undefined) => void;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined);

const safeSetCurrentTime = (audio: HTMLAudioElement | null, time: number) => {
  if (!audio) return;
  try {
    if (audio.readyState >= 1) {
      audio.currentTime = time;
    } else {
      const handleMetadata = () => {
        try {
          audio.currentTime = time;
        } catch (e) {
          console.log('Error setting currentTime in loadedmetadata event:', e);
        }
        audio.removeEventListener('loadedmetadata', handleMetadata);
      };
      audio.addEventListener('loadedmetadata', handleMetadata);
    }
  } catch (err) {
    console.log('Error in safeSetCurrentTime:', err);
  }
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSongId, setCurrentSongId] = useState<string>(songs[0].id);
  const [currentFreqValue, setCurrentFreqValue] = useState<number | undefined>(40); // default to 40 Hz for practice
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSource, setActiveSourceState] = useState<AudioSource>('original');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioOriginalRef = useRef<HTMLAudioElement | null>(null);
  const audioBoostedRef = useRef<HTMLAudioElement | null>(null);
  const activeSourceRef = useRef<AudioSource>('original');

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceOrigRef = useRef<MediaElementAudioSourceNode | null>(null);
  const sourceBoostRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainOrigRef = useRef<GainNode | null>(null);
  const gainBoostRef = useRef<GainNode | null>(null);
  const gainMasterRef = useRef<GainNode | null>(null);

  // Keep activeSourceRef updated
  useEffect(() => {
    activeSourceRef.current = activeSource;
  }, [activeSource]);

  // Lazily initialize AudioContext on user gesture
  const initAudio = () => {
    if (audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(e => console.log('Error resuming AudioContext:', e));
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      // Set to 48kHz to match our WAV sample rate exactly (avoids double resampling)
      // and use 'playback' latencyHint for higher quality interpolation
      const audioCtx = new AudioContextClass({
        latencyHint: 'playback',
        sampleRate: 48000
      });

      const orig = audioOriginalRef.current;
      const boost = audioBoostedRef.current;

      if (orig && boost) {
        orig.crossOrigin = 'anonymous';
        boost.crossOrigin = 'anonymous';

        const srcOrig = audioCtx.createMediaElementSource(orig);
        const srcBoost = audioCtx.createMediaElementSource(boost);

        const gOrig = audioCtx.createGain();
        const gBoost = audioCtx.createGain();
        const gMaster = audioCtx.createGain();

        srcOrig.connect(gOrig);
        srcBoost.connect(gBoost);

        gOrig.connect(gMaster);
        gBoost.connect(gMaster);

        gMaster.connect(audioCtx.destination);

        audioContextRef.current = audioCtx;
        sourceOrigRef.current = srcOrig;
        sourceBoostRef.current = srcBoost;
        gainOrigRef.current = gOrig;
        gainBoostRef.current = gBoost;
        gainMasterRef.current = gMaster;

        // Bypasses HTMLMediaElement internal volume scaling to avoid resolution loss
        orig.volume = 1.0;
        boost.volume = 1.0;

        // Apply current volume & mute states to Web Audio Graph
        const targetVolume = isMuted ? 0 : volume;
        gMaster.gain.setValueAtTime(targetVolume, audioCtx.currentTime);

        // Sync initial routing states
        if (currentFreqValue === undefined) {
          gOrig.gain.setValueAtTime(1.0, audioCtx.currentTime);
          gBoost.gain.setValueAtTime(0.0, audioCtx.currentTime);
        } else if (activeSourceRef.current === 'original') {
          gOrig.gain.setValueAtTime(1.0, audioCtx.currentTime);
          gBoost.gain.setValueAtTime(0.0, audioCtx.currentTime);
        } else {
          gOrig.gain.setValueAtTime(0.0, audioCtx.currentTime);
          gBoost.gain.setValueAtTime(1.0, audioCtx.currentTime);
        }
      }
    } catch (err) {
      console.log('Failed to create AudioContext:', err);
    }
  };

  const syncGains = (
    ctx = audioContextRef.current,
    gOrig = gainOrigRef.current,
    gBoost = gainBoostRef.current,
    gMaster = gainMasterRef.current
  ) => {
    if (!ctx || !gOrig || !gBoost || !gMaster) return;

    const targetVolume = isMuted ? 0 : volume;
    const time = ctx.currentTime;

    // Smooth gain change over 10ms to prevent clicks
    gMaster.gain.setTargetAtTime(targetVolume, time, 0.01);

    if (currentFreqValue === undefined) {
      gOrig.gain.setTargetAtTime(1.0, time, 0.005);
      gBoost.gain.setTargetAtTime(0.0, time, 0.005);
    } else if (activeSourceRef.current === 'original') {
      gOrig.gain.setTargetAtTime(1.0, time, 0.005);
      gBoost.gain.setTargetAtTime(0.0, time, 0.005);
    } else {
      gOrig.gain.setTargetAtTime(0.0, time, 0.005);
      gBoost.gain.setTargetAtTime(1.0, time, 0.005);
    }
  };

  // Initialize audio elements and events on mount
  useEffect(() => {
    const audioOrig = new Audio();
    const audioBoost = new Audio();

    audioOrig.preload = 'auto';
    audioBoost.preload = 'auto';
    audioOrig.crossOrigin = 'anonymous';
    audioBoost.crossOrigin = 'anonymous';

    audioOriginalRef.current = audioOrig;
    audioBoostedRef.current = audioBoost;

    // Track loading state via native media events
    const handleWaiting = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      const currentActive = activeSourceRef.current;
      if (currentActive === 'original' && target === audioOriginalRef.current) {
        setIsLoading(true);
      } else if (currentActive === 'boosted' && target === audioBoostedRef.current) {
        setIsLoading(true);
      }
    };

    const handleCanPlay = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      const currentActive = activeSourceRef.current;
      if (currentActive === 'original' && target === audioOriginalRef.current) {
        setIsLoading(false);
      } else if (currentActive === 'boosted' && target === audioBoostedRef.current) {
        setIsLoading(false);
      }
    };

    const handleDurationChange = () => {
      setDuration(audioOrig.duration || 0);
    };

    const handleTimeUpdate = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      const currentActive = activeSourceRef.current;
      if (currentActive === 'original' && target === audioOriginalRef.current) {
        setCurrentTime(audioOriginalRef.current.currentTime);
      } else if (currentActive === 'boosted' && target === audioBoostedRef.current) {
        setCurrentTime(audioBoostedRef.current.currentTime);
      }

      // Keep playheads strictly synchronized during playback
      const orig = audioOriginalRef.current;
      const boost = audioBoostedRef.current;
      if (orig && boost && currentFreqValue !== undefined && !orig.paused && !boost.paused) {
        const diff = Math.abs(orig.currentTime - boost.currentTime);
        if (diff > 0.05) { // If they drift by more than 50ms, force sync
          if (activeSourceRef.current === 'original') {
            safeSetCurrentTime(boost, orig.currentTime);
          } else {
            safeSetCurrentTime(orig, boost.currentTime);
          }
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (audioOriginalRef.current) audioOriginalRef.current.currentTime = 0;
      if (audioBoostedRef.current) audioBoostedRef.current.currentTime = 0;
      setCurrentTime(0);
    };

    // Attach listeners
    audioOrig.addEventListener('waiting', handleWaiting);
    audioOrig.addEventListener('playing', handleCanPlay);
    audioOrig.addEventListener('canplay', handleCanPlay);
    audioOrig.addEventListener('durationchange', handleDurationChange);
    audioOrig.addEventListener('timeupdate', handleTimeUpdate);
    audioOrig.addEventListener('ended', handleEnded);

    audioBoost.addEventListener('waiting', handleWaiting);
    audioBoost.addEventListener('playing', handleCanPlay);
    audioBoost.addEventListener('canplay', handleCanPlay);
    audioBoost.addEventListener('timeupdate', handleTimeUpdate);
    audioBoost.addEventListener('ended', handleEnded);

    // Initial source load
    const paths = getAudioPaths(songs[0].id, 40);
    audioOrig.src = paths.original;
    audioOrig.load();
    audioBoost.src = paths.boosted;
    audioBoost.load();

    return () => {
      audioOrig.pause();
      audioBoost.pause();

      audioOrig.removeEventListener('waiting', handleWaiting);
      audioOrig.removeEventListener('playing', handleCanPlay);
      audioOrig.removeEventListener('canplay', handleCanPlay);
      audioOrig.removeEventListener('durationchange', handleDurationChange);
      audioOrig.removeEventListener('timeupdate', handleTimeUpdate);
      audioOrig.removeEventListener('ended', handleEnded);

      audioBoost.removeEventListener('waiting', handleWaiting);
      audioBoost.removeEventListener('playing', handleCanPlay);
      audioBoost.removeEventListener('canplay', handleCanPlay);
      audioBoost.removeEventListener('timeupdate', handleTimeUpdate);
      audioBoost.removeEventListener('ended', handleEnded);

      // Clean up AudioContext if it exists
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => console.log('Error closing AudioContext on unmount:', err));
      }

      audioOriginalRef.current = null;
      audioBoostedRef.current = null;
    };
  }, []);

  // Synchronize audio channels volume and source
  useEffect(() => {
    if (audioContextRef.current) {
      syncGains();
    } else {
      // Fallback: direct volume control before AudioContext is initialized
      const orig = audioOriginalRef.current;
      const boost = audioBoostedRef.current;
      if (orig && boost) {
        const targetVolume = isMuted ? 0 : volume;
        if (currentFreqValue === undefined) {
          orig.volume = targetVolume;
          boost.volume = 0;
        } else if (activeSource === 'original') {
          orig.volume = targetVolume;
          boost.volume = 0;
        } else {
          orig.volume = 0;
          boost.volume = targetVolume;
        }
      }
    }
  }, [activeSource, volume, isMuted, currentFreqValue]);

  // Synchronize playback play/pause state
  useEffect(() => {
    const orig = audioOriginalRef.current;
    const boost = audioBoostedRef.current;
    if (!orig || !boost) return;

    if (isPlaying) {
      if (orig.paused) {
        orig.play().catch(err => console.log('Original play error in isPlaying effect:', err));
      }
      if (currentFreqValue !== undefined) {
        // Sync boosted playhead to match original before trigger
        safeSetCurrentTime(boost, orig.currentTime);
        if (boost.paused) {
          boost.play().catch(err => console.log('Boosted play error in isPlaying effect:', err));
        }
      }
    } else {
      if (!orig.paused) orig.pause();
      if (!boost.paused) boost.pause();
    }
  }, [isPlaying, currentFreqValue]);

  const play = () => {
    initAudio();
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const togglePlay = () => {
    initAudio();
    setIsPlaying(prev => !prev);
  };

  const setActiveSource = (source: AudioSource) => {
    initAudio();
    setActiveSourceState(source);
  };

  const toggleSource = () => {
    initAudio();
    setActiveSourceState(prev => (prev === 'original' ? 'boosted' : 'original'));
  };

  const seek = (time: number) => {
    initAudio();
    const orig = audioOriginalRef.current;
    const boost = audioBoostedRef.current;
    if (!orig || !boost) return;

    safeSetCurrentTime(orig, time);
    safeSetCurrentTime(boost, time);
    setCurrentTime(time);
  };

  const setVolume = (vol: number) => {
    initAudio();
    const cleanVol = Math.max(0, Math.min(1, vol));
    setVolumeState(cleanVol);
  };

  const loadTrack = (songId: string, freqValue: number | undefined) => {
    setCurrentSongId(songId);
    setCurrentFreqValue(freqValue);
    setCurrentTime(0); // reset playback timer UI
    
    const orig = audioOriginalRef.current;
    const boost = audioBoostedRef.current;
    if (!orig || !boost) return;

    const paths = getAudioPaths(songId, freqValue);
    
    setIsLoading(true);
    orig.src = paths.original;
    orig.load();

    if (freqValue === undefined) {
      boost.removeAttribute('src');
      boost.load();
      return;
    }

    boost.src = paths.boosted;
    boost.load();
  };

  const setSong = (songId: string) => {
    loadTrack(songId, currentFreqValue);
  };

  const setFrequency = (freqValue: number | undefined) => {
    loadTrack(currentSongId, freqValue);
  };

  const toggleMute = () => {
    initAudio();
    setIsMuted(prev => !prev);
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        activeSource,
        isLoading,
        currentTime,
        duration,
        volume,
        currentSongId,
        currentFreqValue,
        isMuted,
        play,
        pause,
        togglePlay,
        setActiveSource,
        toggleSource,
        seek,
        setVolume,
        setSong,
        setFrequency,
        loadTrack,
        toggleMute,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
