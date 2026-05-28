import React, { useEffect, useRef } from 'react';
import { frequencies } from '../data/frequencies';

interface AudioVisualizerProps {
  isPlaying: boolean;
  activeSource: 'original' | 'boosted';
  selectedFreq: number | undefined;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  activeSource,
  selectedFreq
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const heightsRef = useRef<number[]>([]);
  const numBars = 64;

  // Initialize bars heights
  useEffect(() => {
    heightsRef.current = Array.from({ length: numBars }, () => 5);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Active frequency index for drawing the boost bump
    let targetBarIndex = -1;
    let boostColor = '#10b981';

    if (selectedFreq) {
      const activeData = frequencies.find(f => f.value === selectedFreq);
      if (activeData) {
        boostColor = activeData.color;
        // Map selected frequency logarithmically to a bar index (0 to numBars - 1)
        const minLog = Math.log10(20);
        const maxLog = Math.log10(20000);
        const freqLog = Math.log10(selectedFreq);
        const pct = (freqLog - minLog) / (maxLog - minLog);
        targetBarIndex = Math.floor(pct * numBars);
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background horizontal lines (faint)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let y = 20; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const barWidth = width / numBars - 1.5;
      const heights = heightsRef.current;

      // Update and draw bars
      for (let i = 0; i < numBars; i++) {
        let targetHeight = 4; // idle height

        if (isPlaying) {
          // Generate normal organic spectrum bouncing
          // Bass frequencies (left) are taller, treble (right) are shorter but faster
          const baseNoise = Math.sin(Date.now() * 0.003 * (i * 0.15 + 1)) * 12 + 15;
          const randomJiggle = Math.random() * 15;
          const bassBoost = i < numBars * 0.25 ? (numBars * 0.25 - i) * 1.5 : 0;
          targetHeight = baseNoise + randomJiggle + bassBoost;

          // Apply EQ boost visual effect if in boosted mode
          if (activeSource === 'boosted' && targetBarIndex !== -1) {
            const distance = Math.abs(i - targetBarIndex);
            // Bell-curve influence
            if (distance < 8) {
              const boostMultiplier = Math.exp(-Math.pow(distance, 2) / 8); // Gaussian bell
              targetHeight += boostMultiplier * 45; // significant bump
            }
          }
        } else {
          // Decay state (settle to flat line)
          targetHeight = heights[i] * 0.85;
          if (targetHeight < 4) targetHeight = 4;
        }

        // Smooth height changes
        heights[i] = heights[i] + (targetHeight - heights[i]) * 0.25;

        // Draw bar
        const x = i * (barWidth + 1.5);
        const y = height - heights[i];

        // Fill color gradient: purple/violet to emerald/blue
        // But near the boosted frequency, glow the frequency's color
        let isCloseToBoost = false;
        if (isPlaying && activeSource === 'boosted' && targetBarIndex !== -1) {
          if (Math.abs(i - targetBarIndex) < 5) {
            isCloseToBoost = true;
          }
        }

        const gradient = ctx.createLinearGradient(x, y, x, height);
        if (isCloseToBoost) {
          gradient.addColorStop(0, boostColor);
          gradient.addColorStop(1, `${boostColor}33`);
        } else {
          // Default cool gradient
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.7)'); // Violet
          gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)'); // Blue
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)'); // Emerald
        }

        ctx.fillStyle = gradient;

        // Draw rounded rectangle for bar
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, heights[i], [2, 2, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, heights[i]);
        }
        ctx.fill();

        // Draw subtle glowing highlights at the peak of active frequency
        if (isCloseToBoost && i === targetBarIndex) {
          ctx.shadowColor = boostColor;
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          // Reset shadow
          ctx.shadowBlur = 0;
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    // Handle window resize
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, activeSource, selectedFreq]);

  return (
    <div className="w-full h-16 bg-[#0a0c10] border border-white/5 rounded-xl overflow-hidden relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Visualizer active badge */}
      <div className="absolute top-2 left-3 flex items-center gap-1.5 pointer-events-none select-none">
        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 font-mono">
          {isPlaying ? 'Real-time Signal' : 'Signal Idle'}
        </span>
      </div>
    </div>
  );
};
