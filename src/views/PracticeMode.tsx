import React, { useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { frequencies, songs } from '../data/frequencies';
import { FrequencyChart } from '../components/FrequencyChart';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { Play, Pause, Music, Volume2, Info, ChevronRight } from 'lucide-react';

export const PracticeMode: React.FC = () => {
  const {
    isPlaying,
    activeSource,
    isLoading,
    currentTime,
    duration,
    volume,
    currentSongId,
    currentFreqValue,
    togglePlay,
    setActiveSource,
    seek,
    setVolume,
    setSong,
    setFrequency
  } = useAudio();

  // Listen to keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to play/pause (ignore if focused on an input or slider)
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
      }
      // 'A' or 'a' to switch to clean
      if (e.key === 'A' || e.key === 'a') {
        setActiveSource('original');
      }
      // 'B' or 'b' to switch to boosted
      if (e.key === 'B' || e.key === 'b') {
        setActiveSource('boosted');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, setActiveSource]);

  // Set default frequency if none loaded (e.g. if we came from test mode flat state)
  useEffect(() => {
    if (currentFreqValue === undefined) {
      setFrequency(40);
    }
  }, [currentFreqValue, setFrequency]);

  const activeFreqData = frequencies.find(f => f.value === currentFreqValue);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-fade-in">
      {/* Main Controls Panel (Left 2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white m-0">Practice Mode</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">โหมดฝึกซ้อม: เลือกความถี่เสียงที่ต้องการศึกษา และเปรียบเทียบความต่างแบบเรียลไทม์</p>
        </div>

        {/* Song Select & Audio Visualizer */}
        <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-5 shadow-sm transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <span className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Music className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              เลือกเพลงฝึกซ้อม (Select Song)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:flex gap-2">
              {songs.map(song => (
                <button
                  key={song.id}
                  onClick={() => setSong(song.id)}
                  className={`
                    px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer
                    ${currentSongId === song.id
                      ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/10'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white'
                    }
                  `}
                >
                  {song.labelTh.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Visualizer widget */}
          <AudioVisualizer
            isPlaying={isPlaying}
            activeSource={activeSource}
            selectedFreq={currentFreqValue}
          />
        </div>

        {/* Interactive EQ Spectrum Chart */}
        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider block">
            คลิกเลือกย่านความถี่ (Interactive EQ Board)
          </span>
          <FrequencyChart
            selectedFreq={currentFreqValue}
            activeSource={activeSource}
            isPlaying={isPlaying}
            onSelectFreq={setFrequency}
            interactive={true}
          />
        </div>

        {/* Audio Player Core HUD */}
        <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-6 relative shadow-sm transition-colors duration-300">
          {isLoading && (
            <div className="absolute inset-0 bg-white/90 dark:bg-[#11131a]/85 backdrop-blur-sm z-30 flex flex-col justify-center items-center rounded-3xl">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-600 dark:text-gray-400 mt-3 font-medium">กำลังโหลดไฟล์เสียงความละเอียดสูง...</span>
            </div>
          )}

          {/* Player controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Play/Pause Button */}
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
                  {isPlaying ? 'กำลังเล่นไฟล์เสียง...' : 'หยุดเล่นชั่วคราว'}
                </span>
              </div>
            </div>

            {/* A/B Switcher */}
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
                Boosted (+7 dB)
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

          {/* Volume slider & Keyboard guide */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-white/5">
            {/* Volume slider */}
            <div className="flex items-center gap-3 w-full sm:w-1/3">
              <Volume2 className="w-4 h-4 text-slate-400 dark:text-gray-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-gray-900 rounded-lg appearance-none cursor-pointer accent-slate-400 dark:accent-gray-400 outline-none transition-colors"
              />
              <span className="text-xs text-slate-500 dark:text-gray-500 font-mono w-8">{Math.round(volume * 100)}%</span>
            </div>

            {/* Keyboard shortcut tips */}
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-500 font-mono justify-end w-full sm:w-auto">
              <span>ลัด:</span>
              <span className="bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded text-[10px] text-slate-600 dark:text-gray-400">Space</span>
              <span>เล่น/หยุด</span>
              <span className="bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/5 px-1.5 py-0.5 rounded text-[10px] text-slate-600 dark:text-gray-400">A</span>
              <span>เสียงดั้งเดิม</span>
              <span className="bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/5 px-1.5 py-0.5 rounded text-[10px] text-slate-600 dark:text-gray-400">B</span>
              <span>เสียงบูสต์</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card (Right Column) */}
      <div className="space-y-6">
        {/* Detail Card header */}
        <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-6 relative overflow-hidden group shadow-sm transition-colors duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-radial-gradient from-violet-500/5 dark:from-violet-500/10 to-transparent pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div 
              className="p-3.5 rounded-2xl"
              style={{ 
                backgroundColor: activeFreqData ? `${activeFreqData.color}15` : 'rgba(128,128,128,0.05)',
                color: activeFreqData ? activeFreqData.color : '#666' 
              }}
            >
              <Info className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-gray-500 block uppercase font-bold tracking-widest">Selected Band</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white block m-0 mt-0.5">
                {activeFreqData ? activeFreqData.label : 'N/A'}
              </h2>
            </div>
          </div>

          {activeFreqData ? (
            <div className="space-y-5">
              {/* Band Names */}
              <div className="space-y-1">
                <div className="text-xs text-slate-400 dark:text-gray-500 font-mono uppercase tracking-wider">Band Name / ชื่อย่าน</div>
                <div className="text-slate-800 dark:text-white text-sm font-semibold flex items-center gap-1.5 flex-wrap">
                  <span>{activeFreqData.nameEn}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-gray-600 shrink-0" />
                  <span className="text-violet-600 dark:text-violet-400 font-bold">{activeFreqData.nameTh}</span>
                </div>
              </div>

              {/* Description Thai */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400 dark:text-gray-500 font-mono uppercase tracking-wider">Description (ภาษาไทย)</div>
                <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed">
                  {activeFreqData.descriptionTh}
                </p>
              </div>

              {/* Description English */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400 dark:text-gray-500 font-mono uppercase tracking-wider">Description (English)</div>
                <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed italic">
                  {activeFreqData.descriptionEn}
                </p>
              </div>

              {/* Instrument tags */}
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-white/5">
                <div className="text-xs text-slate-400 dark:text-gray-500 font-mono uppercase tracking-wider">Common Instruments / เครื่องดนตรีเด่น</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeFreqData.instrumentsTh.map((inst, index) => (
                    <span 
                      key={index} 
                      className="text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 px-2.5 py-1 rounded-xl font-medium"
                    >
                      {inst}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <span className="text-slate-400 dark:text-gray-500 text-sm block">กรุณาเลือกความถี่บนชาร์ตบอร์ดเพื่อแสดงรายละเอียด</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
