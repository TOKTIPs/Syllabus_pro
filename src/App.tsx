/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BrainCircuit, GraduationCap } from 'lucide-react';
import SyllabusForm from './components/SyllabusForm';
import SyllabusResult from './components/SyllabusResult';
import { Syllabus, SyllabusInput } from './types';
import { generateSyllabus } from './services/gemini';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [input, setInput] = useState<SyllabusInput | null>(null);

  const handleGenerate = async (newInput: SyllabusInput) => {
    setIsLoading(true);
    setInput(newInput);
    try {
      const result = await generateSyllabus(newInput);
      setSyllabus(result);
      // Scroll to result
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Lỗi khi tạo syllabus:", error);
      alert("Đã xảy ra lỗi khi tạo syllabus. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjust = async (adjustment: string) => {
    if (!syllabus || !input) return;
    setIsLoading(true);
    try {
      const result = await generateSyllabus(input, syllabus, adjustment);
      setSyllabus(result);
    } catch (error) {
      console.error("Lỗi khi điều chỉnh syllabus:", error);
      alert("Đã xảy ra lỗi khi điều chỉnh. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSyllabus(null);
    setInput(null);
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-ink font-sans selection:bg-editorial-accent selection:text-white">
      {/* Navigation */}
      <nav className="relative z-10 border-b border-editorial-line bg-editorial-sidebar sticky top-0 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-10 w-full flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={handleReset}
          >
            <h1 className="text-xl font-bold tracking-tighter italic">L&D Architect <span className="text-[10px] not-italic font-normal opacity-50 uppercase tracking-widest ml-1">v2.0</span></h1>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6 text-[10px] font-bold text-[#6b6658] uppercase tracking-widest">
              <span className="hover:text-editorial-accent cursor-pointer transition-colors">Documentation</span>
              <span className="hover:text-editorial-accent cursor-pointer transition-colors">Resources</span>
            </div>
            <button 
              className="bg-editorial-accent text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
              onClick={handleReset}
            >
              Tạo mới
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-10 py-16">
        <AnimatePresence mode="wait">
          {!syllabus ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              <div className="text-center max-w-2xl mx-auto space-y-6">
                <div className="inline-block px-3 py-1 border border-editorial-ink text-[10px] font-bold uppercase tracking-[0.2em]">
                  Editorial Training Solutions
                </div>
                <h1 className="text-6xl font-bold tracking-tighter text-editorial-ink leading-[0.9] uppercase italic">
                  Craft the Perfect <br />
                  <span className="not-italic">Syllabus</span>
                </h1>
                <p className="text-[#6b6658] text-sm max-w-lg mx-auto font-medium leading-relaxed">
                  Hệ thống hỗ trợ chuyên gia đào tạo thiết lập đề cương khoá học chuẩn mực với cấu trúc khoa học và thẩm mỹ tối giản.
                </p>
              </div>
              <SyllabusForm 
                onGenerate={handleGenerate} 
                isLoading={isLoading} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <SyllabusResult 
                syllabus={syllabus} 
                courseName={input?.courseName || ""} 
                onAdjust={handleAdjust}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-100 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <BrainCircuit className="w-5 h-5" />
            <span className="text-sm font-black tracking-tighter uppercase">Syllabus Pro</span>
          </div>
          <p className="text-slate-400 text-xs">© 2026 Xây dựng bởi AI. Đã đăng ký bản quyền cho hệ thống đào tạo doanh nghiệp.</p>
          <div className="flex gap-6 text-slate-400">
            <span className="text-xs hover:text-indigo-600 cursor-pointer">Bảo mật</span>
            <span className="text-xs hover:text-indigo-600 cursor-pointer">Điều khoản</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Support Download icon in main too
import { Download } from 'lucide-react';
