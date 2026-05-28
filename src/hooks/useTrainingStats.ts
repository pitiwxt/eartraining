import { useState, useEffect } from 'react';
import { frequencies } from '../data/frequencies';

export interface TrainingStats {
  totalRounds: number;
  correctRounds: number;
  currentStreak: number;
  bestStreak: number;
  frequencyStats: {
    [freq: number]: {
      tested: number;
      correct: number;
    }
  };
  // confusion[actual][selected] = count
  confusionMatrix: {
    [actual: number]: {
      [selected: number]: number;
    }
  };
  history: Array<{
    timestamp: number;
    songId: string;
    actualFreq: number;
    selectedFreq: number;
    isCorrect: boolean;
  }>;
}

const STORAGE_KEY = 'eq-ear-training-stats-v1';

const defaultStats = (): TrainingStats => {
  const freqStats: TrainingStats['frequencyStats'] = {};
  const confusion: TrainingStats['confusionMatrix'] = {};

  frequencies.forEach(f => {
    freqStats[f.value] = { tested: 0, correct: 0 };
    confusion[f.value] = {};
    frequencies.forEach(f2 => {
      confusion[f.value][f2.value] = 0;
    });
  });

  return {
    totalRounds: 0,
    correctRounds: 0,
    currentStreak: 0,
    bestStreak: 0,
    frequencyStats: freqStats,
    confusionMatrix: confusion,
    history: []
  };
};

export const useTrainingStats = () => {
  const [stats, setStats] = useState<TrainingStats>(defaultStats);

  // Load stats from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TrainingStats;
        // Merge with default stats to ensure structure in case of older version data
        const merged = defaultStats();
        
        merged.totalRounds = parsed.totalRounds ?? 0;
        merged.correctRounds = parsed.correctRounds ?? 0;
        merged.currentStreak = parsed.currentStreak ?? 0;
        merged.bestStreak = parsed.bestStreak ?? 0;
        merged.history = parsed.history ?? [];

        if (parsed.frequencyStats) {
          Object.keys(parsed.frequencyStats).forEach(key => {
            const freq = Number(key);
            if (merged.frequencyStats[freq]) {
              merged.frequencyStats[freq] = parsed.frequencyStats[freq];
            }
          });
        }

        if (parsed.confusionMatrix) {
          Object.keys(parsed.confusionMatrix).forEach(actualKey => {
            const actual = Number(actualKey);
            if (merged.confusionMatrix[actual]) {
              Object.keys(parsed.confusionMatrix[actual]).forEach(selectedKey => {
                const selected = Number(selectedKey);
                merged.confusionMatrix[actual][selected] = parsed.confusionMatrix[actual][selected] || 0;
              });
            }
          });
        }

        setStats(merged);
      } catch (e) {
        console.error('Failed to parse saved stats, resetting', e);
        setStats(defaultStats());
      }
    }
  }, []);

  const saveStats = (newStats: TrainingStats) => {
    setStats(newStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  };

  const recordRound = (songId: string, actualFreq: number, selectedFreq: number) => {
    const isCorrect = actualFreq === selectedFreq;
    const newStats = { ...stats };

    // Update totals
    newStats.totalRounds += 1;
    if (isCorrect) {
      newStats.correctRounds += 1;
      newStats.currentStreak += 1;
      if (newStats.currentStreak > newStats.bestStreak) {
        newStats.bestStreak = newStats.currentStreak;
      }
    } else {
      newStats.currentStreak = 0;
    }

    // Update specific frequency stats
    if (!newStats.frequencyStats[actualFreq]) {
      newStats.frequencyStats[actualFreq] = { tested: 0, correct: 0 };
    }
    newStats.frequencyStats[actualFreq].tested += 1;
    if (isCorrect) {
      newStats.frequencyStats[actualFreq].correct += 1;
    }

    // Update confusion matrix
    if (!newStats.confusionMatrix[actualFreq]) {
      newStats.confusionMatrix[actualFreq] = {};
    }
    const currentConfusionCount = newStats.confusionMatrix[actualFreq][selectedFreq] || 0;
    newStats.confusionMatrix[actualFreq][selectedFreq] = currentConfusionCount + 1;

    // Update history (cap at 100 entries)
    newStats.history = [
      {
        timestamp: Date.now(),
        songId,
        actualFreq,
        selectedFreq,
        isCorrect
      },
      ...newStats.history
    ].slice(0, 100);

    saveStats(newStats);
  };

  const resetStats = () => {
    saveStats(defaultStats());
  };

  return {
    stats,
    recordRound,
    resetStats
  };
};
