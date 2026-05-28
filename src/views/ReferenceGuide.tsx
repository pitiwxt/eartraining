import React from 'react';
import { frequencies } from '../data/frequencies';
import { BookOpen, Tag } from 'lucide-react';

export const ReferenceGuide: React.FC = () => {
  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white m-0">Frequency Reference Guide</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">คู่มืออ้างอิงความถี่เสียง: รายละเอียด คาแรคเตอร์ และลักษณะเสียงของย่านความถี่ทั้ง 12 ย่าน</p>
      </div>

      {/* Intro info box */}
      <div className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-start gap-4 shadow-sm transition-colors duration-300">
        <div className="p-3 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
          ความถี่เสียงที่เราใช้ฝึกทั้งหมดสอดคล้องกับมาตรฐานการฝึกฝนวิศวกรเสียงระดับมืออาชีพ การบูสต์ความถี่แต่ละย่านในระดับ **+7.0 dB Narrow Band (Q: 3.5)** ช่วยให้สังเกตลักษณะเฉพาะตัวของความถี่นั้นๆ ได้ง่ายขึ้น คู่มือนี้จะช่วยอธิบายลักษณะเสียงที่คุณจะได้ยินในแต่ละย่าน
        </div>
      </div>

      {/* Grid of 12 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frequencies.map(f => (
          <div 
            key={f.value}
            className="bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-350 dark:hover:border-white/10 shadow-sm transition duration-300"
          >
            {/* Glowing corner indicator */}
            <div 
              className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition duration-300"
              style={{
                background: `radial-gradient(circle at top right, ${f.color}, transparent 70%)`
              }}
            />

            {/* Glowing top line */}
            <div 
              className="absolute top-0 inset-x-0 h-[2px]"
              style={{ backgroundColor: `${f.color}60` }}
            />

            {/* Card Header */}
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${f.color}15`,
                    color: f.color
                  }}
                >
                  {f.bandLabelEn}
                </span>
                <span className="text-slate-300 dark:text-gray-500 text-xs font-semibold">|</span>
                <span className="text-slate-500 dark:text-gray-400 text-xs font-semibold">{f.bandLabelTh}</span>
              </div>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white leading-none">
                {f.label}
              </span>
            </div>

            {/* Title / Nickname */}
            <div className="mb-3">
              <h3 className="text-md font-bold text-slate-900 dark:text-white m-0 flex items-center gap-1">
                {f.nameTh}
              </h3>
              <span className="text-xs text-slate-500 dark:text-gray-500 font-medium block mt-0.5">
                {f.nameEn}
              </span>
            </div>

            {/* Content Descriptions */}
            <div className="space-y-3 text-xs leading-relaxed">
              <p className="text-slate-700 dark:text-gray-300">
                {f.descriptionTh}
              </p>
              <p className="text-slate-500 dark:text-gray-450 italic font-light border-l-2 border-slate-100 dark:border-white/5 pl-2.5">
                {f.descriptionEn}
              </p>
            </div>

            {/* Instruments */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 mr-1" />
              {f.instrumentsTh.map((inst, idx) => (
                <span 
                  key={idx}
                  className="bg-slate-50 dark:bg-white/5 text-slate-650 dark:text-gray-400 border border-slate-200 dark:border-transparent px-2 py-0.5 rounded text-[10px] font-medium"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
