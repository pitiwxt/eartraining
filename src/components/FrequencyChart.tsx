import React from 'react';
import { frequencies } from '../data/frequencies';

interface FrequencyChartProps {
  selectedFreq: number | undefined;
  activeSource: 'original' | 'boosted';
  isPlaying: boolean;
  onSelectFreq?: (freq: number) => void;
  interactive?: boolean;
  highlightedFreqs?: number[]; // Highlight subset of frequencies (e.g. during test reveals)
  wrongAnswerFreq?: number; // Show user's incorrect choice in red
}

// Logarithmic conversion helper
// Maps 20 Hz - 20000 Hz to 0 - 100%
const getXPercent = (freq: number) => {
  const minLog = Math.log10(20);
  const maxLog = Math.log10(20000);
  const freqLog = Math.log10(freq);
  return ((freqLog - minLog) / (maxLog - minLog)) * 100;
};

export const FrequencyChart: React.FC<FrequencyChartProps> = ({
  selectedFreq,
  activeSource,
  isPlaying,
  onSelectFreq,
  interactive = true,
  highlightedFreqs,
  wrongAnswerFreq
}) => {
  const gridLines = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  const height = 180;
  const baseLineY = height / 2;

  // Generate path for the EQ response curve
  const getCurvePath = () => {
    if (!selectedFreq || (activeSource === 'original' && isPlaying)) {
      // Flat line when Original is active
      return `M 0,${baseLineY} L 1000,${baseLineY}`;
    }

    const targetXPercent = getXPercent(selectedFreq);
    const targetX = (targetXPercent / 100) * 1000;
    
    // EQ Peak parameters
    const peakHeight = -45; // pixels up
    const qWidth = 50; // standard narrow Q width in pixels

    let points = [];
    for (let x = 0; x <= 1000; x += 5) {
      // Gaussian curve formula: y = A * e^(-(x-x0)^2 / (2*w^2))
      const exponent = -Math.pow(x - targetX, 2) / (2 * Math.pow(qWidth, 2));
      const y = baseLineY + peakHeight * Math.exp(exponent);
      points.push(`${x},${y}`);
    }

    return `M ${points.join(' L ')}`;
  };

  const getFrequencyLabel = (freq: number) => {
    if (freq >= 1000) {
      return `${freq / 1000}k`;
    }
    return `${freq}`;
  };

  const activeFreqData = frequencies.find(f => f.value === selectedFreq);

  return (
    <div className="w-full bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200 dark:border-white/5 p-5 shadow-sm relative overflow-hidden group transition-colors duration-300">
      {/* Background glowing grid aura */}
      <div className="absolute inset-0 bg-radial-gradient from-violet-500/3 dark:from-violet-500/5 to-transparent pointer-events-none" />

      {/* Header Info */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-slate-400 dark:text-gray-500 font-semibold">EQ Spectrum Analyzer</span>
          {activeFreqData && (
            <span 
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ 
                backgroundColor: `${activeFreqData.color}20`, 
                color: activeFreqData.color 
              }}
            >
              {activeFreqData.bandLabelEn}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-500 dark:text-gray-400">
            {selectedFreq 
              ? `Center: ${selectedFreq >= 1000 ? `${selectedFreq/1000} kHz` : `${selectedFreq} Hz`} (+7.0 dB, Q: 3.5)`
              : 'Flat Response'
            }
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[180px]">
        <svg viewBox="0 0 1000 180" className="w-full h-full overflow-visible select-none">
          {/* Grid lines (Frequencies) */}
          {gridLines.map((freq) => {
            const x = (getXPercent(freq) / 100) * 1000;
            const isK = freq >= 1000;
            return (
              <g key={freq} className="opacity-40 group-hover:opacity-60 transition-opacity duration-300">
                <line
                  x1={x}
                  y1={10}
                  x2={x}
                  y2={height - 25}
                  stroke="var(--chart-grid)"
                  strokeWidth="1"
                  strokeDasharray={isK ? 'none' : '4,4'}
                />
                <text
                  x={x}
                  y={height - 8}
                  fill="var(--chart-text)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {getFrequencyLabel(freq)}
                </text>
              </g>
            );
          })}

          {/* Horizontal Zero-dB line */}
          <line
            x1="0"
            y1={baseLineY}
            x2="1000"
            y2={baseLineY}
            stroke="var(--chart-zero-line)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text x="10" y={baseLineY - 6} fill="var(--chart-text)" fontSize="9" fontFamily="monospace">0 dB</text>
          <text x="10" y={baseLineY - 45} fill="#059669" fontSize="9" fontFamily="monospace" className="opacity-60 dark:opacity-80">+7 dB</text>

          {/* EQ Curve Path */}
          <path
            d={getCurvePath()}
            fill="none"
            stroke={
              selectedFreq 
                ? activeFreqData?.color 
                : '#10b981'
            }
            strokeWidth="3.5"
            className="transition-all duration-300 ease-out"
            style={{
              filter: selectedFreq 
                ? `drop-shadow(0 0 6px ${activeFreqData?.color}80)` 
                : 'none'
            }}
          />

          {/* Frequency Markers */}
          {frequencies.map((freq) => {
            const x = (getXPercent(freq.value) / 100) * 1000;
            const isSelected = selectedFreq === freq.value;
            const isHighlighted = highlightedFreqs?.includes(freq.value);
            const isWrong = wrongAnswerFreq === freq.value;
            
            // Marker styling based on state
            let dotSize = 7;
            let showLabel = isSelected;

            if (isSelected) {
              dotSize = 9;
            } else if (isHighlighted) {
              dotSize = 9;
              showLabel = true;
            } else if (isWrong) {
              dotSize = 9;
              showLabel = true;
            }

            return (
              <g 
                key={freq.value}
                transform={`translate(${x}, ${baseLineY})`}
                className={`
                  ${interactive ? 'cursor-pointer' : 'pointer-events-none'} 
                  transition-all duration-200
                `}
                onClick={() => interactive && onSelectFreq && onSelectFreq(freq.value)}
              >
                {/* Outer hover target circle */}
                <circle
                  cx="0"
                  cy="0"
                  r="20"
                  className="fill-transparent stroke-transparent hover:fill-slate-100 dark:hover:fill-white/5 transition-colors duration-200"
                />

                {/* Ring indicator */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected || isHighlighted || isWrong ? 12 : 9}
                  className="transition-all duration-300"
                  fill="transparent"
                  stroke={
                    isSelected 
                      ? freq.color 
                      : isHighlighted 
                      ? '#10b981' 
                      : isWrong 
                      ? '#ef4444' 
                      : 'var(--chart-text)'
                  }
                  strokeWidth={isSelected || isHighlighted || isWrong ? '2.5' : '1.5'}
                  style={{
                    filter: (isSelected || isHighlighted)
                      ? `drop-shadow(0 0 4px ${freq.color}aa)`
                      : 'none'
                  }}
                />

                {/* Core Dot */}
                <circle
                  cx="0"
                  cy="0"
                  r={dotSize - 3}
                  className="transition-all duration-300"
                  fill={
                    isSelected 
                      ? freq.color 
                      : isHighlighted 
                      ? '#10b981' 
                      : isWrong 
                      ? '#ef4444' 
                      : 'var(--chart-text)'
                  }
                />

                {/* Floating frequency value label (Practice Mode Center label) */}
                {showLabel && (
                  <g transform="translate(0, -25)">
                    <rect
                      x="-35"
                      y="-16"
                      width="70"
                      height="22"
                      rx="6"
                      fill="var(--chart-marker-bg)"
                      stroke={
                        isWrong 
                          ? '#ef4444' 
                          : isHighlighted 
                          ? '#10b981' 
                          : freq.color
                      }
                      strokeWidth="1"
                      className="filter drop-shadow-md"
                    />
                    <text
                      x="0"
                      y="-1"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                      className="fill-slate-800 dark:fill-white"
                    >
                      {freq.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
