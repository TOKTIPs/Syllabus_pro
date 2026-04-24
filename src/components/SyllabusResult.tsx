import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, RefreshCw, ExternalLink, ArrowRight, MessageSquare, List, FileCode, Presentation, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Syllabus } from '../types';
import { cn } from '../lib/utils';
import { exportToDocx, exportToMarkdown } from '../services/export';

interface Props {
  syllabus: Syllabus;
  courseName: string;
  onAdjust: (adjustment: string) => void;
  onUpdate: (updated: Syllabus) => void;
  onConvertToSlides: () => void;
  onExpandHour: (hour: string) => void;
  isLoading: boolean;
}

export default function SyllabusResult({ syllabus, courseName, onAdjust, onUpdate, onConvertToSlides, onExpandHour, isLoading }: Props) {
  const [adjustment, setAdjustment] = useState('');

  const updateField = (field: keyof Syllabus, value: any) => {
    onUpdate({ ...syllabus, [field]: value });
  };

  const updateDetailedContent = (idx: number, field: string, value: any) => {
    const newContent = [...syllabus.detailedContent];
    newContent[idx] = { ...newContent[idx], [field]: value };
    onUpdate({ ...syllabus, detailedContent: newContent });
  };

  const updateDetailedContentNested = (idx: number, pointIdx: number, value: string) => {
    const newContent = [...syllabus.detailedContent];
    const newPoints = [...newContent[idx].content];
    newPoints[pointIdx] = value;
    newContent[idx] = { ...newContent[idx], content: newPoints };
    onUpdate({ ...syllabus, detailedContent: newContent });
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustment.trim()) return;
    onAdjust(adjustment);
    setAdjustment('');
  };

  const EditableText = ({ value, onChange, textArea = false }: { value: string, onChange: (val: string) => void, textArea?: boolean }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    if (isEditing) {
      return (
        <div className="flex flex-col gap-2 w-full">
          {textArea ? (
            <textarea
              autoFocus
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full p-2 border border-editorial-accent bg-white text-sm outline-none min-h-[100px]"
            />
          ) : (
            <input
              autoFocus
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full p-1 border border-editorial-accent bg-white text-sm outline-none"
            />
          )}
          <div className="flex gap-2 justify-end">
            <button 
              className="text-[10px] font-bold uppercase tracking-widest text-[#6b6658] hover:text-red-500"
              onClick={() => {
                setTempValue(value);
                setIsEditing(false);
              }}
            >
              Hủy
            </button>
            <button 
              className="text-[10px] font-bold uppercase tracking-widest text-editorial-accent"
              onClick={() => {
                onChange(tempValue);
                setIsEditing(false);
              }}
            >
              Lưu
            </button>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="cursor-edit hover:bg-slate-50/80 transition-colors p-1 -m-1 rounded group relative"
        onClick={() => {
          setTempValue(value);
          setIsEditing(true);
        }}
      >
        <div className="markdown-content">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
        <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-40 pointer-events-none">
          <Wand2 className="w-3 h-3" />
        </div>
      </div>
    );
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
          <button 
            onClick={onConvertToSlides}
            disabled={isLoading}
            className="flex items-center gap-2 bg-editorial-ink text-white px-4 py-2 text-[12px] font-bold tracking-widest uppercase hover:opacity-90 transition-colors disabled:opacity-50"
          >
            <Presentation className="w-4 h-4" />
            <span>Chuyển thành Slide</span>
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
            className="editorial-doc p-16 relative shadow-sm"
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
                  <div className="text-slate-700 leading-relaxed text-sm">
                    <EditableText 
                      value={syllabus.introduction} 
                      onChange={(val) => updateField('introduction', val)}
                      textArea 
                    />
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="font-bold uppercase text-sm tracking-widest">2. Mục tiêu</h3>
                  <div className="text-slate-700 leading-relaxed text-sm">
                    <EditableText 
                      value={syllabus.goals} 
                      onChange={(val) => updateField('goals', val)}
                      textArea 
                    />
                  </div>
                </section>
              </div>

              <section className="space-y-4 border-t border-editorial-line pt-10">
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <h3 className="font-bold uppercase text-sm tracking-widest mb-4">3. Đối tượng</h3>
                    <div className="text-sm text-slate-700 leading-relaxed">
                      <EditableText 
                        value={syllabus.targetAudience} 
                        onChange={(val) => updateField('targetAudience', val)} 
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-sm tracking-widest mb-4">4. Thời lượng</h3>
                    <div className="text-sm text-slate-700 leading-relaxed">
                      <EditableText 
                        value={syllabus.duration} 
                        onChange={(val) => updateField('duration', val)} 
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6 pt-10">
                <h3 className="font-bold uppercase text-sm tracking-widest">5. Nội dung chương trình</h3>
                <p className="text-[10px] text-slate-400 italic">Nhấn vào nội dung để chỉnh sửa trực tiếp</p>
                <div className="overflow-hidden">
                  <table className="editorial-table text-sm">
                    <thead>
                      <tr className="bg-slate-50 font-bold uppercase tracking-widest text-[11px]">
                        <th className="w-[10%] p-4 border-b border-editorial-line">Giờ</th>
                        <th className="w-[20%] p-4 border-b border-editorial-line">Chủ đề</th>
                        <th className="w-[40%] p-4 border-b border-editorial-line">Nội dung chính</th>
                        <th className="w-[30%] p-4 border-b border-editorial-line">Bài tập & Mục tiêu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-editorial-ink/10">
                      {syllabus.detailedContent.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="font-bold">
                            <input 
                              value={item.hour} 
                              onChange={(e) => updateDetailedContent(idx, 'hour', e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-1 focus:ring-editorial-accent p-1"
                            />
                          </td>
                          <td className="font-bold underline underline-offset-4 decoration-slate-200">
                            <textarea 
                              value={item.topic} 
                              onChange={(e) => updateDetailedContent(idx, 'topic', e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-1 focus:ring-editorial-accent p-1 resize-none overflow-hidden h-auto font-bold"
                              rows={2}
                            />
                          </td>
                          <td>
                            <ul className="space-y-2">
                              {item.content.map((point, pIdx) => (
                                <li key={pIdx} className="flex gap-2">
                                  <span className="text-slate-300">•</span>
                                  <textarea 
                                    value={point} 
                                    onChange={(e) => updateDetailedContentNested(idx, pIdx, e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-1 focus:ring-editorial-accent p-1 text-[13px] resize-none overflow-hidden"
                                    rows={1}
                                  />
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="text-[12px] relative group/row space-y-4">
                            <div>
                               <span className="font-bold block uppercase text-[10px] opacity-40 mb-1">Mục tiêu</span>
                               <textarea 
                                  value={item.objective} 
                                  onChange={(e) => updateDetailedContent(idx, 'objective', e.target.value)}
                                  className="w-full bg-transparent border-none focus:ring-1 focus:ring-editorial-accent p-1 resize-none"
                                  rows={2}
                               />
                            </div>
                            <div>
                               <span className="font-bold block uppercase text-[10px] opacity-40 mb-1">Bài tập</span>
                               <textarea 
                                  value={item.exercise} 
                                  onChange={(e) => updateDetailedContent(idx, 'exercise', e.target.value)}
                                  className="w-full bg-transparent border-none focus:ring-1 focus:ring-editorial-accent p-1 italic text-slate-500 resize-none"
                                  rows={2}
                               />
                            </div>
                            
                            <button
                              onClick={() => onExpandHour(item.hour)}
                              className="mt-4 flex items-center gap-1 text-[10px] font-bold text-editorial-accent uppercase tracking-tighter hover:underline"
                            >
                              <Wand2 className="w-3 h-3" />
                              Chi tiết bài giảng
                            </button>
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
                <div key={idx} className="group block space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 border border-editorial-ink font-bold uppercase tracking-tighter",
                      course.type === 'free' ? "bg-white" : "bg-editorial-accent text-white"
                    )}>
                      {course.type === 'free' ? 'Free' : 'Paid'}
                    </span>
                    <a href={course.link} target="_blank" rel="noopener noreferrer">
                       <ExternalLink className="w-3 h-3 text-slate-400 hover:text-editorial-accent transition-colors" />
                    </a>
                  </div>
                  <input 
                    value={course.name}
                    onChange={(e) => {
                      const newExt = [...syllabus.externalCourses];
                      newExt[idx] = { ...newExt[idx], name: e.target.value };
                      updateField('externalCourses', newExt);
                    }}
                    className="w-full bg-transparent border-none focus:ring-1 focus:ring-editorial-accent p-1 font-bold text-xs"
                  />
                  <input 
                    value={course.link}
                    onChange={(e) => {
                      const newExt = [...syllabus.externalCourses];
                      newExt[idx] = { ...newExt[idx], link: e.target.value };
                      updateField('externalCourses', newExt);
                    }}
                    className="w-full bg-transparent border-none focus:ring-1 focus:ring-editorial-accent p-1 text-[10px] opacity-40 italic"
                  />
                </div>
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
