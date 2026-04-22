import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, RefreshCw, ExternalLink, ArrowRight, MessageSquare, List, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Syllabus } from '../types';
import { cn } from '../lib/utils';
import { exportToDocx, exportToMarkdown } from '../services/export';

interface Props {
  syllabus: Syllabus;
  courseName: string;
  onAdjust: (adjustment: string) => void;
  isLoading: boolean;
}

export default function SyllabusResult({ syllabus, courseName, onAdjust, isLoading }: Props) {
  const [adjustment, setAdjustment] = useState('');

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustment.trim()) return;
    onAdjust(adjustment);
    setAdjustment('');
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-32">
      {/* Header & Export Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-editorial-line pb-8"
      >
        <div className="flex gap-3">
          <button 
            onClick={() => exportToDocx(syllabus, courseName)}
            className="flex items-center gap-2 bg-white border border-editorial-line px-4 py-2 text-[12px] font-bold tracking-widest uppercase hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>DOCX</span>
          </button>
          <button 
            onClick={() => exportToMarkdown(syllabus, courseName)}
            className="flex items-center gap-2 bg-white border border-editorial-line px-4 py-2 text-[12px] font-bold tracking-widest uppercase hover:bg-slate-50 transition-colors"
          >
            <FileCode className="w-4 h-4" />
            <span>MARKDOWN</span>
          </button>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 border border-editorial-line text-[11px] font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 
          Sẵn sàng xuất bản
        </div>
      </motion.div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Document Area */}
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="editorial-doc p-16 relative"
          >
            <div className="space-y-12 mb-20">
              <div className="text-center mb-12">
                <h1 className="text-2xl font-bold uppercase tracking-[0.2em] mb-2">Đề cương chi tiết khoá học</h1>
                <div className="w-24 h-[2px] bg-editorial-ink mx-auto"></div>
                <h2 className="text-4xl font-bold mt-8 italic tracking-tighter uppercase">{courseName}</h2>
              </div>

              <div className="grid grid-cols-2 gap-12 border-t border-editorial-line pt-10">
                <section className="space-y-4">
                  <h3 className="font-bold uppercase text-sm tracking-widest">1. Giới thiệu chung</h3>
                  <div className="text-slate-700 leading-relaxed text-sm markdown-content">
                    <ReactMarkdown>{syllabus.introduction}</ReactMarkdown>
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="font-bold uppercase text-sm tracking-widest">2. Mục tiêu</h3>
                  <div className="text-slate-700 leading-relaxed text-sm markdown-content">
                    <ReactMarkdown>{syllabus.goals}</ReactMarkdown>
                  </div>
                </section>
              </div>

              <section className="space-y-4 border-t border-editorial-line pt-10">
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <h3 className="font-bold uppercase text-sm tracking-widest mb-4">3. Đối tượng</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{syllabus.targetAudience}</p>
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-sm tracking-widest mb-4">4. Thời lượng</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{syllabus.duration}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-6 pt-10">
                <h3 className="font-bold uppercase text-sm tracking-widest">5. Nội dung chương trình</h3>
                <div className="overflow-hidden">
                  <table className="editorial-table text-sm">
                    <thead>
                      <tr className="bg-slate-50 font-bold uppercase tracking-widest text-[11px]">
                        <th className="w-[10%] p-4 border-b border-editorial-line">Giờ</th>
                        <th className="w-[20%] p-4 border-b border-editorial-line">Chủ đề</th>
                        <th className="w-[45%] p-4 border-b border-editorial-line">Nội dung chính</th>
                        <th className="w-[25%] p-4 border-b border-editorial-line">Bài tập & Mục tiêu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-editorial-ink/10">
                      {syllabus.detailedContent.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="font-bold">{item.hour}</td>
                          <td className="font-bold underline underline-offset-4">{item.topic}</td>
                          <td>
                            <ul className="space-y-1">
                              {item.content.map((point, pIdx) => (
                                <li key={pIdx} className="leading-tight">• {point}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="text-[12px]">
                            <div className="mb-2">
                              <span className="font-bold block uppercase text-[10px] opacity-60">Mục tiêu</span>
                              {item.objective}
                            </div>
                            <div>
                              <span className="font-bold block uppercase text-[10px] opacity-60">Bài tập</span>
                              <span className="italic text-slate-500">{item.exercise}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Micro-annotation footer */}
            <div className="absolute bottom-6 left-0 w-full text-center opacity-40 italic text-[10px] tracking-wide">
              * Nội dung được thiết lập theo Times New Roman, Size 13, Line spacing 1.5 *
            </div>
          </motion.div>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-10">
          <section className="bg-editorial-sidebar border border-editorial-line p-6">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4 border-b border-editorial-line pb-2">
              Tham khảo External
            </h3>
            <div className="space-y-4">
              {syllabus.externalCourses.map((course, idx) => (
                <a
                  key={idx}
                  href={course.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 border border-editorial-ink font-bold uppercase tracking-tighter",
                      course.type === 'free' ? "bg-white" : "bg-editorial-accent text-white"
                    )}>
                      {course.type === 'free' ? 'Free' : 'Paid'}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-editorial-accent transition-colors" />
                  </div>
                  <h4 className="font-bold text-xs group-hover:underline transition-all line-clamp-1">{course.name}</h4>
                </a>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Floating Bottom Adjustment Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50"
      >
        <div className="bg-editorial-accent text-white p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-2xl">
          <div className="text-xs uppercase tracking-widest font-bold opacity-60 flex items-center gap-2 shrink-0">
            <MessageSquare className="w-4 h-4" />
            Đề xuất điều chỉnh
          </div>
          <form onSubmit={handleAdjust} className="flex-1 w-full flex gap-3">
            <input
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              placeholder="Ví dụ: Thêm phần quản lý rủi ro..."
              className="flex-1 bg-white/10 border-none text-xs px-4 py-2 focus:ring-1 focus:ring-white/30 outline-none placeholder:text-white/30"
            />
            <button
              disabled={isLoading || !adjustment.trim()}
              className="bg-white text-editorial-accent text-[10px] font-bold px-6 py-2 uppercase tracking-widest hover:bg-slate-200 transition-colors disabled:opacity-30 flex items-center gap-2"
            >
              {isLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
              Gửi
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
