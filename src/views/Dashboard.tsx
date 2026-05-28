import React from 'react';
import { useTrainingStats } from '../hooks/useTrainingStats';
import { frequencies } from '../data/frequencies';
import { BarChart2, Award, Zap, RefreshCw, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { stats, resetStats } = useTrainingStats();

  const accuracy = stats.totalRounds > 0 
    ? Math.round((stats.correctRounds / stats.totalRounds) * 100) 
    : 0;

  // Group frequencies by bands for breakdown
  const getBandStats = (values: number[]) => {
    let tested = 0;
    let correct = 0;
    values.forEach(v => {
      const fStat = stats.frequencyStats[v];
      if (fStat) {
        tested += fStat.tested;
        correct += fStat.correct;
      }
    });
    return {
      tested,
      correct,
      pct: tested > 0 ? Math.round((correct / tested) * 100) : 0
    };
  };

  const lowStats = getBandStats([40, 70, 110, 160]);
  const midStats = getBandStats([250, 400, 700, 1000]);
  const highStats = getBandStats([2500, 4500, 8000, 12000]);

  // Find the top confusion pairs
  const getTopConfusions = () => {
    const list: Array<{ actual: number; selected: number; count: number }> = [];
    Object.keys(stats.confusionMatrix).forEach(actualKey => {
      const actual = Number(actualKey);
      Object.keys(stats.confusionMatrix[actual]).forEach(selectedKey => {
        const selected = Number(selectedKey);
        if (actual !== selected) {
          const count = stats.confusionMatrix[actual][selected] || 0;
          if (count > 0) {
            list.push({ actual, selected, count });
          }
        }
      });
    });

    return list.sort((a, b) => b.count - a.count).slice(0, 3);
  };

  const topConfusions = getTopConfusions();

  const handleReset = () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างสถิติทั้งหมด? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
      resetStats();
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white m-0">EQ Dashboard</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">วิเคราะห์และประเมินผลการฝึกทักษะการแยกแยะความถี่เสียงของคุณ</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-800 dark:hover:text-red-300 transition px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          ล้างสถิติทั้งหมด (Reset Stats)
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rounds */}
        <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-colors duration-300">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-gray-400 block">จำนวนรอบที่ตอบ</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white block mt-0.5">{stats.totalRounds} <span className="text-xs text-slate-400 dark:text-gray-500 font-normal">รอบ</span></span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-colors duration-300">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-gray-400 block">ความแม่นยำเฉลี่ย</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white block mt-0.5">{accuracy}%</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-colors duration-300">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-gray-400 block">Streak ปัจจุบัน</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white block mt-0.5">{stats.currentStreak} <span className="text-xs text-slate-400 dark:text-gray-500 font-normal">รอบ</span></span>
          </div>
        </div>

        {/* Best Streak */}
        <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-colors duration-300">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-gray-400 block">Streak สูงสุด</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white block mt-0.5">{stats.bestStreak} <span className="text-xs text-slate-400 dark:text-gray-500 font-normal">รอบ</span></span>
          </div>
        </div>
      </div>

      {/* Accuracy by Band & Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Band Accuracy */}
        <div className="lg:col-span-2 bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-5 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">ความแม่นยำแบ่งตามย่านเสียง (Frequency Bands)</h3>
          
          <div className="space-y-4">
            {/* Low Band */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-gray-300 font-medium">ย่านต่ำ (Low End: 40Hz - 160Hz)</span>
                <span className="text-slate-500 dark:text-gray-400">{lowStats.correct}/{lowStats.tested} ถูก ({lowStats.pct}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden transition-colors">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500" 
                  style={{ width: `${lowStats.pct}%` }} 
                />
              </div>
            </div>

            {/* Mid Band */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-gray-300 font-medium">ย่านกลาง (Midrange: 250Hz - 1kHz)</span>
                <span className="text-slate-500 dark:text-gray-400">{midStats.correct}/{midStats.tested} ถูก ({midStats.pct}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden transition-colors">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${midStats.pct}%` }} 
                />
              </div>
            </div>

            {/* High Band */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-gray-300 font-medium">ย่านแหลม (High End: 2.5kHz - 12kHz)</span>
                <span className="text-slate-500 dark:text-gray-400">{highStats.correct}/{highStats.tested} ถูก ({highStats.pct}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden transition-colors">
                <div 
                  className="h-full bg-purple-500 transition-all duration-500" 
                  style={{ width: `${highStats.pct}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex flex-col justify-between shadow-sm transition-colors duration-300">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              การวิเคราะห์ความสับสน (Insights)
            </h3>
            {stats.totalRounds === 0 ? (
              <p className="text-slate-650 dark:text-gray-400 text-sm leading-relaxed">
                ทำแบบทดสอบ (Test Mode) อย่างน้อย 3-5 รอบ เพื่อให้ระบบวิเคราะห์ความสับสนและให้คำแนะนำในการฝึกหูอย่างตรงจุด
              </p>
            ) : topConfusions.length === 0 ? (
              <p className="text-emerald-600 dark:text-emerald-400 text-sm leading-relaxed font-semibold">
                ยอดเยี่ยมมาก! คุณยังไม่มีจุดที่ตอบผิดบ่อยๆ เลย รักษามาตรฐานนี้ไว้!
              </p>
            ) : (
              <div className="space-y-3 mt-2">
                <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed">
                  นี่คือคู่ความถี่ที่คุณมักจะสับสนมากที่สุด:
                </p>
                <div className="space-y-2">
                  {topConfusions.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-xl flex justify-between items-center text-xs shadow-sm">
                      <div>
                        <span className="text-red-650 dark:text-red-400 font-bold">{item.actual >= 1000 ? `${item.actual/1000}kHz` : `${item.actual}Hz`}</span>
                        <span className="text-slate-400 dark:text-gray-500 mx-2">สับสนเป็น</span>
                        <span className="text-orange-650 dark:text-orange-400 font-bold">{item.selected >= 1000 ? `${item.selected/1000}kHz` : `${item.selected}Hz`}</span>
                      </div>
                      <span className="bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-slate-700 dark:text-gray-300 font-mono font-bold border border-slate-200 dark:border-white/5">{item.count} ครั้ง</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 text-xs text-slate-400 dark:text-gray-500">
            คำแนะนำ: ในย่านที่สับสนบ่อยๆ ให้ลองใช้ **โหมดฝึก (Practice)** เพื่อสลับฟังความต่างแบบ A/B ให้หูคุ้นเคยกับความแตกต่างทางคาแรคเตอร์เสียง
          </div>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-4 overflow-hidden shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0 flex items-center gap-2">
            Confusion Matrix (ตารางความสับสนของหู)
          </h3>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 rounded" />
              <span>ถูกต้อง</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-500/20 dark:bg-red-500/40 border border-red-500/40 dark:border-red-500/60 rounded" />
              <span>ผิด/สับสน</span>
            </div>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px] select-none pb-2">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5 text-xs text-slate-400 dark:text-gray-500 font-semibold w-16 text-right pr-3 font-mono">
                    เฉลย ➔<br />ตอบ ↴
                  </th>
                  {frequencies.map(f => (
                    <th key={f.value} className="p-1.5 text-[10px] text-slate-500 dark:text-gray-400 font-mono font-semibold">
                      {f.label.replace(' Hz', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {frequencies.map(selectedF => (
                  <tr key={selectedF.value}>
                    <td className="p-1.5 text-[10px] text-slate-500 dark:text-gray-400 text-right pr-3 font-mono font-semibold">
                      {selectedF.label.replace(' Hz', '')}
                    </td>
                    {frequencies.map(actualF => {
                      const isDiagonal = actualF.value === selectedF.value;
                      
                      // Read count from matrix
                      const count = stats.confusionMatrix[actualF.value]?.[selectedF.value] || 0;
                      
                      let bgColor = 'bg-transparent';
                      let borderColor = 'border-slate-100 dark:border-white/5';
                      let textColor = 'text-slate-300 dark:text-gray-600';

                      if (count > 0) {
                        textColor = 'text-slate-900 dark:text-white font-bold';
                        if (isDiagonal) {
                          bgColor = 'bg-emerald-500/10';
                          borderColor = 'border-emerald-500/20 dark:border-emerald-500/35';
                        } else {
                          // Opacity depends on confusion rate
                          const opacity = Math.min(count * 20, 80);
                          bgColor = `bg-red-500/${opacity * 0.7} dark:bg-red-500/${opacity}`;
                          borderColor = 'border-red-500/20 dark:border-red-500/30';
                        }
                      }

                      return (
                        <td 
                          key={actualF.value} 
                          className={`p-2 border text-[11px] font-mono transition-all duration-350 ${bgColor} ${borderColor} ${textColor}`}
                          title={`เฉลย: ${actualF.label}, คุณตอบ: ${selectedF.label} (${count} ครั้ง)`}
                        >
                          {count > 0 ? count : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
