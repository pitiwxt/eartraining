import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useTrainingStats } from '../hooks/useTrainingStats';
import { frequencies, songs } from '../data/frequencies';
import { FrequencyChart } from '../components/FrequencyChart';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { Play, Pause, HelpCircle, CheckCircle2, XCircle, ArrowRight, Music } from 'lucide-react';

type TestState = 'config' | 'playing' | 'revealed';

export const TestMode: React.FC = () => {
  const {
    isPlaying,
    activeSource,
    isLoading,
    currentTime,
    duration,
    currentSongId,
    pause,
    togglePlay,
    setActiveSource,
    seek,
    setSong,
    setFrequency,
    loadTrack
  } = useAudio();

  const { stats, recordRound } = useTrainingStats();

  // Test setup states
  const [testState, setTestState] = useState<TestState>('config');
  const [selectedFreqsList, setSelectedFreqsList] = useState<number[]>(frequencies.map(f => f.value));
  const [randomizeSong, setRandomizeSong] = useState<boolean>(true);
  
  // Active round states
  const [targetFreq, setTargetFreq] = useState<number>(40);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isUserCorrect, setIsUserCorrect] = useState<boolean>(false);

  const activeFreqData = frequencies.find(f => f.value === targetFreq);

  // Setup options preset selection
  const applyPreset = (preset: 'all' | 'bass' | 'mids' | 'highs') => {
    if (preset === 'all') {
      setSelectedFreqsList(frequencies.map(f => f.value));
    } else if (preset === 'bass') {
      setSelectedFreqsList([40, 70, 110, 160]);
    } else if (preset === 'mids') {
      setSelectedFreqsList([250, 400, 700, 1000]);
    } else if (preset === 'highs') {
      setSelectedFreqsList([2500, 4500, 8000, 12000]);
    }
  };

  const toggleFreqSelection = (freqValue: number) => {
    setSelectedFreqsList(prev => {
      if (prev.includes(freqValue)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter(f => f !== freqValue);
      } else {
        return [...prev, freqValue].sort((a, b) => a - b);
      }
    });
  };

  // Keyboard shortcut listener for active test
  useEffect(() => {
    if (testState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space for play/pause
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
      }
      // 'A' to switch to clean
      if (e.key === 'A' || e.key === 'a') {
        setActiveSource('original');
      }
      // 'B' to switch to boosted
      if (e.key === 'B' || e.key === 'b') {
        setActiveSource('boosted');
      }

      // Keyboard choices matching keys 1-9, 0, -, =
      const choiceKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
      const index = choiceKeys.indexOf(e.key);
      if (index !== -1 && index < frequencies.length) {
        setSelectedAnswer(frequencies[index].value);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [testState, togglePlay, setActiveSource]);

  // Start new round
  const startNewRound = () => {
    let nextSongId = currentSongId;
    
    // 1. Pick randomized song if toggled
    if (randomizeSong) {
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      nextSongId = randomSong.id;
    }

    // 2. Select random frequency from checked frequencies
    const randomIndex = Math.floor(Math.random() * selectedFreqsList.length);
    const chosenFreq = selectedFreqsList[randomIndex];
    
    setTargetFreq(chosenFreq);
    
    // Load track synchronously with both arguments to prevent React state race condition!
    loadTrack(nextSongId, chosenFreq);
    
    // 3. Reset round states
    setSelectedAnswer(null);
    setActiveSource('original'); // start with clean (Original)
    setTestState('playing');
  };

  // Submit Answer
  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const correct = selectedAnswer === targetFreq;
    setIsUserCorrect(correct);
    
    // Save to statistics hook
    recordRound(currentSongId, targetFreq, selectedAnswer);
    
    setTestState('revealed');
  };

  const handleNextRound = () => {
    startNewRound();
  };

  const quitTest = () => {
    pause();
    // Return frequency context back to standard practice mode setting
    setFrequency(40);
    setTestState('config');
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- CONFIG VIEW ---
  if (testState === 'config') {
    return (
      <div className="space-y-6 text-left max-w-4xl mx-auto animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white m-0">Test Mode</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">ทดสอบหูระดับโปร: ค้นหาย่านความถี่ลึกลับที่สุ่มบูสต์ +7 dB เพื่อสะสมคะแนน</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Frequencies checkbox matrix */}
          <div className="md:col-span-2 bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-5 shadow-sm transition-colors duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <span className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider block">
                เลือกความถี่ที่จะใช้ทดสอบ (Tested Frequencies)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => applyPreset('all')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition border border-slate-200 dark:border-white/5 cursor-pointer"
                >
                  ทั้งหมด (All 12)
                </button>
                <button
                  onClick={() => applyPreset('bass')}
                  className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg transition border border-blue-500/20 cursor-pointer"
                >
                  เบสต่ำ (Bass)
                </button>
                <button
                  onClick={() => applyPreset('mids')}
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg transition border border-emerald-500/20 cursor-pointer"
                >
                  เสียงกลาง (Mids)
                </button>
                <button
                  onClick={() => applyPreset('highs')}
                  className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-lg transition border border-purple-500/20 cursor-pointer"
                >
                  เสียงแหลม (Highs)
                </button>
              </div>
            </div>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {frequencies.map(f => {
                const isChecked = selectedFreqsList.includes(f.value);
                return (
                  <button
                    key={f.value}
                    onClick={() => toggleFreqSelection(f.value)}
                    className={`
                      px-4 py-3 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between cursor-pointer
                      ${isChecked
                        ? 'bg-violet-500/10 border-violet-500/35 text-slate-800 dark:text-white'
                        : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-500 hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-600 dark:hover:text-gray-400'
                      }
                    `}
                  >
                    <span>{f.label}</span>
                    <span 
                      className={`w-2 h-2 rounded-full`}
                      style={{ backgroundColor: isChecked ? f.color : '#cbd5e1' }}
                    />
                  </button>
                );
              })}
            </div>
            
            <span className="text-xs text-slate-400 dark:text-gray-500 block">
              หมายเหตุ: การเลือกย่านน้อยลงช่วยในการแยกย่านย่อยๆ (เช่น เลือกแค่เบสเพื่อซ้อมความต่างระหว่าง 40Hz / 70Hz / 110Hz / 160Hz)
            </span>
          </div>

          {/* Test Session settings */}
          <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm transition-colors duration-300">
            <div className="space-y-4">
              <span className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider block">
                ตั้งค่าเซสชั่น (Session Settings)
              </span>
              
              {/* Randomize song switch */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">สุ่มเพลงกลอง/ร้องแต่ละรอบ</span>
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 block">เปลี่ยนเพลงเพื่อหลีกเลี่ยงความจำเพลงเดี่ยว</span>
                </div>
                <button
                  onClick={() => setRandomizeSong(!randomizeSong)}
                  className={`
                    w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer
                    ${randomizeSong ? 'bg-violet-600' : 'bg-slate-200 dark:bg-gray-800'}
                  `}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full transition-transform ${randomizeSong ? 'translate-x-5.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Locked song select if randomize is off */}
              {!randomizeSong && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 block uppercase font-bold tracking-wider">เลือกเพลงที่จะล็อกไว้</span>
                  <select
                    value={currentSongId}
                    onChange={(e) => setSong(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-white/5 text-xs text-slate-900 dark:text-white rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {songs.map(s => (
                      <option key={s.id} value={s.id}>{s.labelTh}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={startNewRound}
              disabled={selectedFreqsList.length === 0}
              className="w-full bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-850 dark:hover:bg-white/95 disabled:bg-slate-100 dark:disabled:bg-gray-800 disabled:text-slate-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-900/10 dark:shadow-white/5"
            >
              <Play className="w-4 h-4 fill-current" />
              เริ่มทำแบบทดสอบ (Start Test)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE TEST & REVEALED VIEW ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left relative animate-fade-in">
      {/* Main HUD Panel (Left 2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header HUD */}
        <div className="flex justify-between items-center bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-violet-600 dark:text-violet-400 font-bold">Test Mode</span>
            <span className="text-xs text-slate-300 dark:text-gray-500">|</span>
            <span className="text-xs text-slate-700 dark:text-gray-300 font-medium flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-slate-400 dark:text-gray-505" />
              {songs.find(s => s.id === currentSongId)?.labelTh.split(' (')[0]}
            </span>
          </div>

          <button
            onClick={quitTest}
            className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 font-semibold cursor-pointer"
          >
            ออกจากการทดสอบ (Quit)
          </button>
        </div>

        {/* Audio Visualizer */}
        {testState === 'playing' ? (
          <AudioVisualizer
            isPlaying={isPlaying}
            activeSource={activeSource}
            selectedFreq={undefined} // Hide freq band from visualizer during active play!
          />
        ) : (
          <AudioVisualizer
            isPlaying={isPlaying}
            activeSource={activeSource}
            selectedFreq={targetFreq} // Reveal bump once answer submitted!
          />
        )}

        {/* Spectrum Chart (Flat during test, revealed after submit) */}
        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider block">
            {testState === 'revealed' ? 'เฉลยการตอบสนองความถี่ (EQ Response)' : 'ชาร์ตการตอบสนองความถี่ (Locked during test)'}
          </span>
          <FrequencyChart
            selectedFreq={testState === 'revealed' ? targetFreq : undefined}
            activeSource={activeSource}
            isPlaying={isPlaying}
            interactive={false} // Click disabled in test
            wrongAnswerFreq={testState === 'revealed' && !isUserCorrect ? selectedAnswer || undefined : undefined}
          />
        </div>

        {/* Sync Player HUD */}
        <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-6 relative shadow-sm transition-colors duration-300">
          {isLoading && (
            <div className="absolute inset-0 bg-white/90 dark:bg-[#11131a]/85 backdrop-blur-sm z-30 flex flex-col justify-center items-center rounded-3xl">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-600 dark:text-gray-400 mt-3 font-medium">กำลังโหลดไฟล์สุ่มความถี่เสียง...</span>
            </div>
          )}

          {/* Sync Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-white/90 transition flex items-center justify-center shadow-xl shadow-slate-900/10 dark:shadow-white/5 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
              </button>
              <div className="text-left">
                <span className="text-xs text-slate-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Status</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">
                  {isPlaying ? 'กำลังทดสอบเปรียบเทียบ...' : 'หยุดเล่นชั่วคราว'}
                </span>
              </div>
            </div>

            {/* A/B test source buttons */}
            <div className="flex bg-slate-100 dark:bg-gray-950 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 w-full sm:w-auto max-w-sm transition-colors duration-300">
              <button
                onClick={() => setActiveSource('original')}
                className={`
                  flex-1 px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer
                  ${activeSource === 'original'
                    ? 'bg-white dark:bg-[#181a24] text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 shadow-sm'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                  }
                `}
              >
                <span className="text-xs bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400 px-1.5 py-0.5 rounded font-mono transition-colors">A</span>
                Original (เสียงคลีน)
              </button>
              <button
                onClick={() => setActiveSource('boosted')}
                className={`
                  flex-1 px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer
                  ${activeSource === 'boosted'
                    ? 'bg-violet-600/10 border border-violet-500/25 text-violet-600 dark:text-violet-400 shadow-lg shadow-violet-500/5'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                  }
                `}
              >
                <span className="text-xs bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded font-mono transition-colors">B</span>
                Boosted (ความถี่สุ่ม)
              </button>
            </div>
          </div>

          {/* Timeline slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500 dark:text-gray-500 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-gray-950 rounded-lg appearance-none cursor-pointer accent-violet-500 outline-none transition-colors"
            />
          </div>

          {/* Shortcuts note */}
          <div className="flex justify-end text-xs text-slate-400 dark:text-gray-500 font-mono">
            <span className="flex items-center gap-1">
              <span>ลัด A/B:</span>
              <kbd className="bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/5 px-1.5 py-0.5 rounded text-[10px] text-slate-500 dark:text-gray-400 font-mono">A</kbd>
              <span>และ</span>
              <kbd className="bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/5 px-1.5 py-0.5 rounded text-[10px] text-slate-500 dark:text-gray-400 font-mono">B</kbd>
            </span>
          </div>
        </div>

        {/* 12-Button Matrix Choices */}
        <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-4 shadow-sm transition-colors duration-300">
          <span className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider block">
            คุณได้ยินเสียงบูสต์ที่ย่านความถี่ใด? (Select Choice)
          </span>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {frequencies.map((f, idx) => {
              const isSelected = selectedAnswer === f.value;
              const isCorrect = f.value === targetFreq;
              const wasTested = selectedFreqsList.includes(f.value);
              
              // Key shortcut helper string
              const keyShortcut = idx === 9 ? '0' : idx === 10 ? '-' : idx === 11 ? '=' : `${idx + 1}`;

              // Determine color themes
              let btnStyle = 'bg-transparent border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/10';

              if (testState === 'playing') {
                if (isSelected) {
                  btnStyle = 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/10';
                } else if (!wasTested) {
                  // Muted / disabled look for excluded frequencies
                  btnStyle = 'bg-transparent border-slate-100 dark:border-white/5 text-slate-300 dark:text-gray-600 hover:bg-slate-50 dark:hover:bg-white/5';
                }
              } else if (testState === 'revealed') {
                if (isCorrect) {
                  // Correct answer is always green
                  btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-lg shadow-emerald-500/5';
                } else if (isSelected) {
                  // User chose this, but it was wrong
                  btnStyle = 'bg-red-500/20 border-red-500 text-red-650 dark:text-red-400 font-bold';
                } else {
                  // Other options
                  btnStyle = 'bg-transparent border-slate-100 dark:border-white/5 text-slate-350 dark:text-gray-500 opacity-40';
                }
              }

              return (
                <button
                  key={f.value}
                  disabled={testState === 'revealed'}
                  onClick={() => setSelectedAnswer(f.value)}
                  className={`
                    py-3.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 relative cursor-pointer
                    ${btnStyle}
                  `}
                >
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono absolute top-1 left-2">{keyShortcut}</span>
                  <span className="text-sm font-bold block pt-1.5">{f.label}</span>
                  <span className="text-[9px] block text-slate-400 dark:text-gray-400 font-medium">{f.nameEn.split(' (')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Submit/Next Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
            {testState === 'playing' ? (
              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-white/90 disabled:bg-slate-100 dark:disabled:bg-gray-800 disabled:text-slate-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition font-bold px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg shadow-slate-900/5 dark:shadow-white/5"
              >
                <span>ส่งคำตอบ (Submit Answer)</span>
              </button>
            ) : (
              <button
                onClick={handleNextRound}
                className="bg-violet-600 hover:bg-violet-500 text-white transition font-bold px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-500/10 animate-bounce-short"
              >
                <span>รอบถัดไป (Next Round)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Side Score HUD / Reveal Card (Right Column) */}
      <div className="space-y-6">
        {/* Streak HUD */}
        <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-5 rounded-3xl flex justify-between items-center shadow-sm transition-colors duration-300">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-gray-500 block uppercase font-bold tracking-widest">Accuracy</span>
            <span className="text-xl font-bold text-slate-800 dark:text-white block mt-0.5">
              {stats.totalRounds > 0 ? Math.round((stats.correctRounds / stats.totalRounds) * 100) : 0}%
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-white/5" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 dark:text-gray-500 block uppercase font-bold tracking-widest">Streak</span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 block mt-0.5 flex items-center justify-center gap-1">
              {stats.currentStreak}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-white/5" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 dark:text-gray-500 block uppercase font-bold tracking-widest">Best Streak</span>
            <span className="text-xl font-bold text-violet-600 dark:text-violet-400 block mt-0.5">
              {stats.bestStreak}
            </span>
          </div>
        </div>

        {/* Reveal detail info card */}
        {testState === 'revealed' ? (
          <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-6 relative overflow-hidden animate-fade-in shadow-sm transition-colors duration-300">
            {/* Glowing top border based on correct/wrong */}
            <div className={`absolute top-0 inset-x-0 h-1.5 ${isUserCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />

            {/* Answer title card */}
            <div className="flex items-start gap-3">
              {isUserCorrect ? (
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-3 bg-red-500/10 text-red-650 dark:text-red-400 rounded-2xl">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              
              <div className="text-left">
                <span className="text-xs text-slate-400 dark:text-gray-500 block uppercase font-bold tracking-widest">
                  {isUserCorrect ? 'ยินดีด้วย! คุณตอบถูก' : 'ตอบผิด! ความถี่ที่ถูกต้องคือ'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0 mt-0.5">
                  {activeFreqData?.label}
                </h3>
              </div>
            </div>

            {/* Detail explanation */}
            {activeFreqData && (
              <div className="space-y-5 text-xs text-left">
                {/* Names */}
                <div className="space-y-1">
                  <div className="text-slate-400 dark:text-gray-500 font-mono uppercase tracking-wider">ชื่อย่านเสียง</div>
                  <div className="text-slate-800 dark:text-white font-semibold text-sm">
                    {activeFreqData.nameTh} ({activeFreqData.nameEn})
                  </div>
                </div>

                {/* Characteristics Description */}
                <div className="space-y-1">
                  <div className="text-slate-400 dark:text-gray-500 font-mono uppercase tracking-wider">ลักษณะเสียงย่านนี้</div>
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-xs">
                    {activeFreqData.descriptionTh}
                  </p>
                </div>

                {/* Instruments */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                  <div className="text-slate-400 dark:text-gray-500 font-mono uppercase tracking-wider">เครื่องดนตรีที่พบบ่อย</div>
                  <div className="flex flex-wrap gap-1">
                    {activeFreqData.instrumentsTh.map((inst, index) => (
                      <span 
                        key={index} 
                        className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-300 px-2 py-0.5 rounded text-[10px]"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl text-center py-14 space-y-4 shadow-sm transition-colors duration-300">
            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-gray-400">
              <HelpCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-800 dark:text-white block">รอเฉลยคำตอบ (Awaiting Answer)</span>
              <span className="text-xs text-slate-500 dark:text-gray-400 block mt-1 leading-relaxed">
                สลับฟังระหว่างเสียงดั้งเดิม (A) และเสียงสุ่มบูสต์ (B) เพื่อจับความแตกต่าง จากนั้นกดเลือกช้อยส์แล้วส่งคำตอบด้านล่าง
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
