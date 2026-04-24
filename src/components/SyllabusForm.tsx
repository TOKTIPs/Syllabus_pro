import { useState } from 'react';
import { BookOpen, Target, Users, Clock, FileText, Send, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { SyllabusInput } from '../types';
import { cn } from '../lib/utils';

import LogoUpload from './LogoUpload';

interface Props {
  onGenerate: (input: SyllabusInput, logo?: string) => void;
  isLoading: boolean;
}

export default function SyllabusForm({ onGenerate, isLoading }: Props) {
  const [courseName, setCourseName] = useState('');
  const [goals, setGoals] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [duration, setDuration] = useState('');
  const [requirements, setRequirements] = useState('');
  const [logo, setLogo] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;
    onGenerate({ courseName, goals, targetAudience, duration, requirements }, logo || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-editorial-sidebar rounded-none shadow-none border border-editorial-line p-10 max-w-4xl mx-auto"
    >
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tighter italic text-editorial-ink mb-2">L&D Architect <span className="text-xs not-italic font-normal opacity-50 uppercase tracking-widest ml-2">v2.0</span></h2>
        <p className="text-slate-500 text-sm italic">Nhập thông số để khởi tạo đề cương khoá học</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1">
            <label className="editorial-label">Tên khóa học *</label>
            <input
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="VD: Kỹ năng quản lý đội nhóm chuyên nghiệp"
              className="editorial-input"
            />
          </div>

          <div className="space-y-1">
            <label className="editorial-label">Thời lượng học</label>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Mặc định: 16h (2 ngày)"
              className="editorial-input"
            />
          </div>

          <div className="space-y-1">
            <label className="editorial-label">Mục tiêu khóa học</label>
            <textarea
              rows={3}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Mục tiêu kiến thức, kỹ năng đạt được..."
              className="editorial-input resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="editorial-label">Đối tượng học viên</label>
            <textarea
              rows={3}
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Quản lý cấp trung, nhân viên mới..."
              className="editorial-input resize-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="editorial-label">Yêu cầu/Lưu ý khác</label>
          <textarea
            rows={2}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Các tiêu chí tùy chỉnh, yêu cầu chuyên sâu..."
            className="editorial-input resize-none"
          />
        </div>

        <LogoUpload onLogoUpload={setLogo} />

        <button
          disabled={isLoading || !courseName}
          className={cn(
            "editorial-btn w-full",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? "Đang khởi tạo..." : "Khởi tạo Syllabus"}
        </button>
      </form>
    </motion.div>
  );
}
