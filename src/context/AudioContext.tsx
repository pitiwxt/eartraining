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

  // Keep activeSourceRef updated
  useEffect(() => {
    activeSourceRef.current = activeSource;
  }, [activeSource]);

  // Initialize audio elements and events on mount
  useEffect(() => {
    const audioOrig = new Audio();
    const audioBoost = new Audio();

    audioOrig.preload = 'auto';
    audioBoost.preload = 'auto';

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

      audioOriginalRef.current = null;
      audioBoostedRef.current = null;
    };
  }, []);

  // Synchronize audio channels volume and source
  useEffect(() => {
    updateVolumes();
  }, [activeSource, volume, isMuted, currentFreqValue, isPlaying]);

  const updateVolumes = () => {
    const orig = audioOriginalRef.current;
    const boost = audioBoostedRef.current;
    if (!orig || !boost) return;

    const targetVolume = isMuted ? 0 : volume;

    if (currentFreqValue === undefined) {
      orig.volume = targetVolume;
      boost.volume = 0;
      return;
    }

    if (activeSource === 'original') {
      orig.volume = targetVolume;
      boost.volume = 0;
    } else {
      orig.volume = 0;
      boost.volume = targetVolume;
    }

    // Play active track / pause inactive track
    if (isPlaying) {
      if (activeSource === 'original') {
        if (orig.paused) {
          orig.play().catch(err => console.log('Original play error in volume sync:', err));
        }
        if (!boost.paused) boost.pause();
      } else {
        if (boost.paused && currentFreqValue !== undefined) {
          boost.play().catch(err => console.log('Boosted play error in volume sync:', err));
        }
        if (!orig.paused) orig.pause();
      }
    } else {
      if (!orig.paused) orig.pause();
      if (!boost.paused) boost.pause();
    }
  };

  const playAudio = () => {
    const orig = audioOriginalRef.current;
    const boost = audioBoostedRef.current;
    if (!orig || !boost) return;

    setIsPlaying(true);

    const targetVolume = isMuted ? 0 : volume;
    orig.volume = activeSource === 'original' ? targetVolume : 0;
    boost.volume = activeSource === 'boosted' ? targetVolume : 0;

    if (activeSource === 'original') {
      orig.play()
        .then(() => {
          boost.pause();
        })
        .catch(err => console.log('Original playback error:', err));
    } else {
      if (currentFreqValue !== undefined) {
        safeSetCurrentTime(boost, orig.currentTime);
        boost.play()
          .then(() => {
            orig.pause();
          })
          .catch(err => console.log('Boosted playback error:', err));
      } else {
        orig.play()
          .then(() => {
            boost.pause();
          })
          .catch(err => console.log('Original play fallback error:', err));
      }
    }
  };

  const pauseAudio = () => {
    if (audioOriginalRef.current) audioOriginalRef.current.pause();
    if (audioBoostedRef.current) audioBoostedRef.current.pause();
    setIsPlaying(false);
  };

  const play = () => {
    playAudio();
  };

  const pause = () => {
    pauseAudio();
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const setActiveSource = (source: AudioSource) => {
    setActiveSourceState(source);
    
    const orig = audioOriginalRef.current;
    const boost = audioBoostedRef.current;
    if (!orig || !boost) return;

    const targetVolume = isMuted ? 0 : volume;
    orig.volume = source === 'original' ? targetVolume : 0;
    boost.volume = source === 'boosted' ? targetVolume : 0;

    if (isPlaying) {
      if (source === 'original') {
        safeSetCurrentTime(orig, boost.currentTime);
        orig.play()
          .then(() => {
            boost.pause();
          })
          .catch(err => console.log('Original play error in setActiveSource:', err));
      } else {
        if (currentFreqValue !== undefined) {
          safeSetCurrentTime(boost, orig.currentTime);
          boost.play()
            .then(() => {
              orig.pause();
            })
            .catch(err => console.log('Boosted play error in setActiveSource:', err));
        }
      }
    }
  };

  const toggleSource = () => {
    setActiveSourceState(prev => {
      const next = prev === 'original' ? 'boosted' : 'original';
      
      const orig = audioOriginalRef.current;
      const boost = audioBoostedRef.current;
      if (orig && boost) {
        const targetVolume = isMuted ? 0 : volume;
        orig.volume = next === 'original' ? targetVolume : 0;
        boost.volume = next === 'boosted' ? targetVolume : 0;

        if (isPlaying) {
          if (next === 'original') {
            safeSetCurrentTime(orig, boost.currentTime);
            orig.play()
              .then(() => {
                boost.pause();
              })
              .catch(err => console.log('Original play error in toggleSource:', err));
          } else {
            if (currentFreqValue !== undefined) {
              safeSetCurrentTime(boost, orig.currentTime);
              boost.play()
                .then(() => {
                  orig.pause();
                })
                .catch(err => console.log('Boosted play error in toggleSource:', err));
            }
          }
        }
      }
      return next;
    });
  };

  const seek = (time: number) => {
    const orig = audioOriginalRef.current;
    const boost = audioBoostedRef.current;
    if (!orig || !boost) return;

    safeSetCurrentTime(orig, time);
    safeSetCurrentTime(boost, time);
    setCurrentTime(time);
  };

  const setVolume = (vol: number) => {
    const cleanVol = Math.max(0, Math.min(1, vol));
    setVolumeState(cleanVol);
  };

  const loadTrack = (songId: string, freqValue: number | undefined) => {
    setCurrentSongId(songId);
    setCurrentFreqValue(freqValue);
    
    const orig = audioOriginalRef.current;
    const boost = audioBoostedRef.current;
    if (!orig || !boost) return;

    const paths = getAudioPaths(songId, freqValue);
    
    setIsLoading(true);
    orig.src = paths.original;
    orig.load();

    // If frequency is undefined, pause boost
    if (freqValue === undefined) {
      boost.pause();
      if (isPlaying) {
        orig.play().catch(e => console.log(e));
      }
      return;
    }

    boost.src = paths.boosted;
    boost.load();

    if (isPlaying) {
      if (activeSource === 'original') {
        orig.play()
          .then(() => {
            boost.pause();
          })
          .catch(e => console.log(e));
      } else {
        safeSetCurrentTime(boost, orig.currentTime);
        boost.play()
          .then(() => {
            orig.pause();
          })
          .catch(e => console.log(e));
      }
    }
  };

  const setSong = (songId: string) => {
    loadTrack(songId, currentFreqValue);
  };

  const setFrequency = (freqValue: number | undefined) => {
    loadTrack(currentSongId, freqValue);
  };

  const toggleMute = () => {
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
