/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Syllabus, SyllabusInput, ThemeConfig, SlideContent, DetailedLecture, OverviewSlides, SavedSyllabus } from './types';
import { generateSyllabus, analyzeLogo, generateSlidesFromSyllabus, generateDetailedLecture } from './services/gemini';
import SyllabusForm from './components/SyllabusForm';
import SyllabusResult from './components/SyllabusResult';
import SlidesView from './components/SlidesView';
import DetailedLectureView from './components/DetailedLectureView';
import { Sparkles, BrainCircuit, GraduationCap, History, Trash2, Home } from 'lucide-react';

const MICROSOFT_THEME: ThemeConfig = {
  primaryColor: '#00a4ef',
  secondaryColor: '#f25022',
  accentColor: '#7fbb00',
  textColor: '#000000',
  backgroundColor: '#ffffff',
  fontStyle: 'modern'
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [input, setInput] = useState<SyllabusInput | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(MICROSOFT_THEME);
  const [overviewSlides, setOverviewSlides] = useState<OverviewSlides | null>(null);
  const [detailedLecture, setDetailedLecture] = useState<DetailedLecture | null>(null);
  const [showSlides, setShowSlides] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<SavedSyllabus[]>(() => {
    const saved = localStorage.getItem('syllabus_drafts');
    return saved ? JSON.parse(saved) : [];
  });
  const [showDrafts, setShowDrafts] = useState(false);

  const handleGenerate = async (newInput: SyllabusInput, logo?: string) => {
    setIsLoading(true);
    setInput(newInput);
    if (logo) {
      setLogoBase64(logo);
      try {
        const theme = await analyzeLogo(logo);
        setThemeConfig(theme);
      } catch (err) {
        console.error("Lỗi phân tích logo, dùng mặc định:", err);
        setThemeConfig(MICROSOFT_THEME);
      }
    } else {
      setLogoBase64(null);
      setThemeConfig(MICROSOFT_THEME);
    }

    try {
      const result = await generateSyllabus(newInput);
      setSyllabus(result);
      
      // Auto-save draft and set current draft ID
      const draftId = crypto.randomUUID();
      setCurrentDraftId(draftId);
      
      const newDraft: SavedSyllabus = {
        id: draftId,
        timestamp: Date.now(),
        input: newInput,
        syllabus: result,
        logoBase64: logo || null,
        themeConfig: logo ? themeConfig : MICROSOFT_THEME
      };
      
      const updatedDrafts = [newDraft, ...savedDrafts].slice(0, 10);
      setSavedDrafts(updatedDrafts);
      localStorage.setItem('syllabus_drafts', JSON.stringify(updatedDrafts));

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Lỗi khi tạo syllabus:", error);
      if (error.message.includes("QUOTA_EXHAUSTED")) {
        alert("Hệ thống đang tạm thời hết lượt sử dụng miễn phí (Quota 429). Vui lòng thử lại sau giây lát.");
      } else {
        alert("Đã xảy ra lỗi khi tạo syllabus. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSyllabus = (updatedSyllabus: Syllabus) => {
    setSyllabus(updatedSyllabus);
    saveCurrentDraft(updatedSyllabus);
  };

  const saveCurrentDraft = (updatedSyllabus: Syllabus, updatedDetailedLectures?: Record<string, DetailedLecture>) => {
    if (!input || !updatedSyllabus) return;

    let draftId = currentDraftId;
    let updatedDrafts = [...savedDrafts];

    if (draftId) {
      const existingIdx = updatedDrafts.findIndex(d => d.id === draftId);
      if (existingIdx !== -1) {
        updatedDrafts[existingIdx] = {
          ...updatedDrafts[existingIdx],
          syllabus: updatedSyllabus,
          detailedLectures: updatedDetailedLectures || updatedDrafts[existingIdx].detailedLectures,
          timestamp: Date.now()
        };
      }
    } else {
      draftId = crypto.randomUUID();
      setCurrentDraftId(draftId);
      const newDraft: SavedSyllabus = {
        id: draftId,
        timestamp: Date.now(),
        input: input,
        syllabus: updatedSyllabus,
        logoBase64: logoBase64,
        themeConfig: themeConfig,
        detailedLectures: updatedDetailedLectures
      };
      updatedDrafts = [newDraft, ...updatedDrafts].slice(0, 10);
    }

    setSavedDrafts(updatedDrafts);
    localStorage.setItem('syllabus_drafts', JSON.stringify(updatedDrafts));
  };

  const handleConvertToSlides = async () => {
    if (!syllabus) return;
    setIsLoading(true);
    try {
      const generated = await generateSlidesFromSyllabus(syllabus);
      setOverviewSlides(generated);
      setShowSlides(true);
    } catch (err) {
      console.error("Lỗi tạo slides:", err);
      alert("Không thể tạo slides lúc này.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpandHour = async (hour: string) => {
    if (!syllabus) return;
    
    // Check if we already have this lecture in the current draft
    const currentDraft = savedDrafts.find(d => d.id === currentDraftId);
    if (currentDraft?.detailedLectures?.[hour]) {
      setDetailedLecture(currentDraft.detailedLectures[hour]);
      setShowDetailed(true);
      return;
    }

    setIsLoading(true);
    try {
      const lecture = await generateDetailedLecture(syllabus, hour);
      setDetailedLecture(lecture);
      setShowDetailed(true);
      
      // Save to current draft
      if (syllabus) {
        const updatedLectures = { 
          ...(currentDraft?.detailedLectures || {}), 
          [hour]: lecture 
        };
        saveCurrentDraft(syllabus, updatedLectures);
      }
    } catch (err: any) {
      console.error("Lỗi triển khai bài giảng:", err);
      if (err.message.includes("QUOTA_EXHAUSTED")) {
        alert("Hệ thống đang tạm thời hết lượt sử dụng miễn phí (Quota 429). Vui lòng thử lại sau giây lát.");
      } else {
        alert("Không thể triển khai bài giảng chi tiết lúc này.");
      }
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
      // Persist adjustment to draft
      saveCurrentDraft(result);
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
    setOverviewSlides(null);
    setDetailedLecture(null);
    setShowSlides(false);
    setShowDetailed(false);
    setLogoBase64(null);
    setThemeConfig(MICROSOFT_THEME);
    setShowDrafts(false);
    setCurrentDraftId(null);
  };

  const handleLoadDraft = (draft: SavedSyllabus) => {
    setSyllabus(draft.syllabus);
    setInput(draft.input);
    setLogoBase64(draft.logoBase64);
    setThemeConfig(draft.themeConfig);
    setCurrentDraftId(draft.id);
    setShowDrafts(false);
    setOverviewSlides(null);
    setDetailedLecture(null);
    setShowSlides(false);
    setShowDetailed(false);
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(updated);
    localStorage.setItem('syllabus_drafts', JSON.stringify(updated));
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
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 hover:text-editorial-accent cursor-pointer transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                Trang chủ
              </button>
              <button 
                onClick={() => setShowDrafts(!showDrafts)}
                className="flex items-center gap-2 hover:text-editorial-accent cursor-pointer transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                Bản nháp
              </button>
              {(showSlides || showDetailed) && (
                <span 
                  className="hover:text-editorial-accent cursor-pointer transition-colors"
                  onClick={() => { setShowSlides(false); setShowDetailed(false); }}
                >
                  Quay lại Syllabus
                </span>
              )}
              <span className="hover:text-editorial-accent cursor-pointer transition-colors">Documentation</span>
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
          {showDrafts ? (
            <motion.div
              key="drafts"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto space-y-12"
            >
               <div className="text-center space-y-4">
                 <h2 className="text-4xl font-bold tracking-tighter uppercase italic">Lưu trữ bản nháp</h2>
                 <p className="text-slate-500 text-sm">Quản lý các đề cương đã xây dựng trước đó</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {savedDrafts.length === 0 ? (
                   <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-sm italic text-slate-400">
                      Chưa có bản nháp nào được lưu trữ.
                   </div>
                 ) : (
                   savedDrafts.map(draft => (
                     <div 
                        key={draft.id}
                        onClick={() => handleLoadDraft(draft)}
                        className="group bg-white border border-editorial-line p-8 cursor-pointer hover:shadow-xl transition-all relative"
                     >
                        <button 
                          onClick={(e) => handleDeleteDraft(draft.id, e)}
                          className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-4">
                           <div className="flex justify-between items-start">
                             <div className="px-2 py-0.5 border border-editorial-ink text-[8px] font-bold uppercase tracking-widest">
                               {new Date(draft.timestamp).toLocaleDateString()}
                             </div>
                           </div>
                           <h3 className="text-xl font-bold tracking-tighter uppercase leading-tight group-hover:text-editorial-accent transition-colors">
                             {draft.input.courseName}
                           </h3>
                           <p className="text-[10px] text-slate-400 line-clamp-2 italic">
                             {draft.syllabus.introduction}
                           </p>
                        </div>
                     </div>
                   ))
                 )}
               </div>

               <div className="text-center">
                 <button 
                   onClick={() => setShowDrafts(false)}
                   className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-editorial-accent transition-all"
                 >
                   ← Quay lại
                 </button>
               </div>
            </motion.div>
          ) : showDetailed && detailedLecture ? (
            <motion.div
              key="detailed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DetailedLectureView 
                lecture={detailedLecture} 
                theme={themeConfig}
                logo={logoBase64}
                onClose={() => setShowDetailed(false)}
              />
            </motion.div>
          ) : showSlides && overviewSlides ? (
            <motion.div
              key="slides"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <SlidesView 
                slides={overviewSlides.slides} 
                theme={themeConfig} 
                logo={logoBase64} 
                pythonPptxCode={overviewSlides.pythonPptxCode}
                onClose={() => setShowSlides(false)}
              />
            </motion.div>
          ) : !syllabus ? (
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
                onUpdate={handleUpdateSyllabus}
                onConvertToSlides={handleConvertToSlides}
                onExpandHour={handleExpandHour}
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
