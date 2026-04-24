import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileCode, CheckCircle2, Copy, FileText, Layout, Presentation, MessageSquare, Play } from 'lucide-react';
import { DetailedLecture, ThemeConfig, SlideContent } from '../types';
import { exportDetailedLectureToDocx, exportDetailedLectureToMarkdown } from '../services/export';
import { useState } from 'react';
import SlidesView from './SlidesView';

interface Props {
  lecture: DetailedLecture;
  theme?: ThemeConfig;
  logo?: string | null;
  onClose: () => void;
}

export default function DetailedLectureView({ lecture, theme, logo, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [showSlidesPreview, setShowSlidesPreview] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lecture.pythonPptxCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Map LectureSlide to SlideContent for preview
  const previewSlides: SlideContent[] = lecture.slides.map((s, idx) => ({
    id: `lecture-slide-${idx}`,
    title: s.title,
    points: s.bullets,
    imagePrompt: s.imagePrompt
  }));

  return (
    <div className="fixed inset-0 z-[60] bg-editorial-bg flex flex-col overflow-hidden">
      <AnimatePresence>
        {showSlidesPreview && theme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SlidesView 
              slides={previewSlides}
              theme={theme}
              logo={logo || null}
              pythonPptxCode={lecture.pythonPptxCode}
              onClose={() => setShowSlidesPreview(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Overlay */}
      <div className="border-b border-editorial-line bg-editorial-sidebar h-20 shrink-0 flex items-center px-10 justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-editorial-accent text-white">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-xl tracking-tighter uppercase italic">Giai đoạn 3: Triển khai chi tiết</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#6b6658] font-bold">Chủ đề: {lecture.topic}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSlidesPreview(true)}
            className="editorial-btn flex items-center gap-2 py-2 px-6 h-10"
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="text-[10px]">TRÌNH CHIẾU</span>
          </button>
          <button 
            onClick={() => exportToDocx(lecture)}
            className="editorial-btn-outline flex items-center gap-2 py-2 px-4 h-10"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px]">DOCX</span>
          </button>
          <button 
            onClick={() => exportToMarkdown(lecture)}
            className="editorial-btn-outline flex items-center gap-2 py-2 px-4 h-10"
          >
            <FileCode className="w-4 h-4" />
            <span className="text-[10px]">MARKDOWN</span>
          </button>
          <button 
            onClick={onClose}
            className="ml-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 py-12 scroll-smooth">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Slides List */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <Presentation className="w-4 h-4" /> Cấu trúc Slides chi tiết
              </h3>
              <div className="flex gap-2">
                 <span className="text-[9px] bg-slate-100 px-2 py-1 uppercase font-bold tracking-tight">12 Slides</span>
                 <span className="text-[9px] bg-slate-100 px-2 py-1 uppercase font-bold tracking-tight">{lecture.hour}</span>
              </div>
            </div>

            <div className="space-y-8">
              {lecture.slides.map((slide, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-white border border-editorial-line p-10 relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-editorial-accent transition-all group-hover:w-2"></div>
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#6b6658] opacity-40">Slide {idx + 1}</span>
                      <h4 className="text-3xl font-bold tracking-tighter uppercase">{slide.title}</h4>
                      <span className="inline-block px-2 py-0.5 bg-editorial-accent/10 text-editorial-accent text-[9px] font-bold uppercase tracking-wider mt-2">
                        {slide.type}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-editorial-line">
                    <div className="space-y-6">
                       <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#6b6658]">Nội dung trình chiếu</h5>
                       <ul className="space-y-3">
                         {slide.bullets.map((point, pIdx) => (
                           <li key={pIdx} className="text-sm leading-relaxed flex gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent mt-2 shrink-0"></span>
                              {point}
                           </li>
                         ))}
                       </ul>
                    </div>

                    <div className="space-y-6 bg-slate-50/50 p-6 rounded-sm">
                       <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#6b6658] flex items-center gap-2">
                         <MessageSquare className="w-3 h-3" /> Speaker Notes
                       </h5>
                       <p className="text-xs text-slate-600 leading-relaxed italic">
                         {slide.speakerNotes}
                       </p>
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-slate-100 flex items-center gap-4 text-slate-400">
                     <FileText className="w-4 h-4 opacity-50" />
                     <span className="text-[9px] uppercase tracking-widest font-medium overflow-hidden text-ellipsis whitespace-nowrap italic">
                        UI Prompt: {slide.imagePrompt}
                     </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Python Code Sidebar */}
          <div className="lg:col-span-4 space-y-8">
             <div className="sticky top-0 space-y-8">
                <div className="bg-editorial-sidebar border border-editorial-line p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                       <FileCode className="w-4 h-4" /> Python PPTX Code
                    </h3>
                    <button 
                      onClick={handleCopyCode}
                      className="p-2 hover:bg-white transition-colors rounded-sm"
                      title="Copy code"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Sử dụng thư viện <code>python-pptx</code> để tạo file PowerPoint tự động từ cấu trúc này.
                  </p>

                  <div className="relative group">
                    <pre className="bg-[#1a1a1a] text-slate-300 p-4 text-[10px] leading-relaxed overflow-x-auto max-h-[500px] font-mono scrollbar-thin scrollbar-thumb-white/10">
                      <code>{lecture.pythonPptxCode}</code>
                    </pre>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  <button 
                    onClick={handleCopyCode}
                    className="w-full editorial-btn py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Đã sao chép!" : "Sao chép mã Python"}
                  </button>
                </div>

                <div className="bg-editorial-accent/5 border border-editorial-accent/20 p-8 space-y-4">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-editorial-accent">Hướng dẫn nhanh</h3>
                   <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-editorial-accent text-white text-[10px] flex items-center justify-center font-bold shrink-0">1</span>
                        <p className="text-[10px] leading-relaxed">Cài đặt <code>pip install python-pptx</code></p>
                      </div>
                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-editorial-accent text-white text-[10px] flex items-center justify-center font-bold shrink-0">2</span>
                        <p className="text-[10px] leading-relaxed">Lưu mã vào file <code>generate_pptx.py</code></p>
                      </div>
                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-editorial-accent text-white text-[10px] flex items-center justify-center font-bold shrink-0">3</span>
                        <p className="text-[10px] leading-relaxed">Chạy lệnh <code>python generate_pptx.py</code></p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function exportToDocx(l: DetailedLecture) {
  exportDetailedLectureToDocx(l);
}

function exportToMarkdown(l: DetailedLecture) {
  exportDetailedLectureToMarkdown(l);
}
