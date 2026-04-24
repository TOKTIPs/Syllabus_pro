import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Sparkles, Download, FileCode, CheckCircle2, Copy } from 'lucide-react';
import { SlideContent, ThemeConfig } from '../types';
import { generateSlideImage } from '../services/gemini';

interface Props {
  slides: SlideContent[];
  theme: ThemeConfig;
  logo: string | null;
  pythonPptxCode?: string;
  onClose: () => void;
}

export default function SlidesView({ slides, theme, logo, pythonPptxCode, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideImages, setSlideImages] = useState<Record<string, string>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (pythonPptxCode) {
      navigator.clipboard.writeText(pythonPptxCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentSlide = slides[currentIndex];

  useEffect(() => {
    if (currentSlide && !slideImages[currentSlide.id] && !isGeneratingImage && !imageError) {
      const fetchImage = async () => {
        setIsGeneratingImage(true);
        setImageError(null);
        try {
          const imageUrl = await generateSlideImage(currentSlide.imagePrompt);
          setSlideImages(prev => ({ ...prev, [currentSlide.id]: imageUrl }));
        } catch (err: any) {
          console.error("Lỗi tạo ảnh slide:", err);
          if (err.message.includes("QUOTA_EXHAUSTED")) {
            setImageError("Hệ thống đang tạm thời hết lượt sử dụng ảnh miễn phí. Vui lòng thử lại sau.");
          } else {
            setImageError("Không thể tải ảnh minh họa lúc này.");
          }
        } finally {
          setIsGeneratingImage(false);
        }
      };
      fetchImage();
    }
  }, [currentIndex, currentSlide, slideImages, isGeneratingImage, imageError]);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1));
    setImageError(null); // Reset error when changing slide
  };
  
  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
    setImageError(null); // Reset error when changing slide
  };

  return (
    <div 
      className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm"
      style={{ fontFamily: theme.fontStyle === 'modern' ? 'Inter, sans-serif' : 'serif' }}
    >
      <div className="absolute top-8 left-8 flex items-center gap-4 z-[70]">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full">
          <Sparkles className="w-3 h-3 text-editorial-accent" />
          <span className="text-[9px] text-white/70 font-bold tracking-widest uppercase italic">Presentation Mode</span>
        </div>
        
        {pythonPptxCode && (
          <button 
            onClick={handleCopyCode}
            className="flex items-center gap-2 bg-editorial-accent text-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 rounded-full shadow-lg"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            {copied ? "Đã sao chép!" : "Xuất File PPTX (Python Code)"}
          </button>
        )}
      </div>

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-white/50 hover:text-white transition-all p-3 hover:bg-white/10 rounded-full z-[70]"
      >
        <X className="w-8 h-8" />
      </button>

      <div 
        className="relative w-full max-w-7xl aspect-video bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex transition-colors duration-700"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        
        {/* Slide Content */}
        <div className="flex-1 p-16 flex flex-col relative z-20">
          {/* Logo in top right as requested */}
          {logo && (
            <div className="absolute top-10 right-10 w-28 h-28 flex items-center justify-center bg-white/50 backdrop-blur-sm p-3 group transition-transform hover:scale-105">
              <img src={logo} alt="Project Logo" className="max-w-full max-h-full object-contain" />
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center max-w-3xl">
             <div className="mb-6 flex items-center gap-3">
                <div className="w-12 h-1 bg-current opacity-20" style={{ color: theme.primaryColor }}></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 italic">Chapter 0{currentIndex + 1}</span>
             </div>

             <AnimatePresence mode="wait">
               <motion.div
                 key={currentIndex}
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -30 }}
                 transition={{ duration: 0.6, ease: "easeOut" }}
               >
                 <h2 
                   className="text-6xl font-bold mb-12 leading-[1.1] tracking-tighter"
                   style={{ color: theme.primaryColor }}
                 >
                   {currentSlide.title}
                 </h2>

                 <ul className="space-y-8">
                   {currentSlide.points.map((point, idx) => (
                     <motion.li 
                       key={`${currentIndex}-${idx}`}
                       initial={{ opacity: 0, x: -30 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                       className="text-2xl flex items-start gap-6 leading-snug group"
                       style={{ color: theme.textColor }}
                     >
                       <span className="w-3 h-3 rounded-full mt-3.5 flex-shrink-0 transition-transform group-hover:scale-125" style={{ backgroundColor: theme.accentColor }}></span>
                       <span className="opacity-90">{point}</span>
                     </motion.li>
                   ))}
                 </ul>
               </motion.div>
             </AnimatePresence>
          </div>

          <div className="mt-12 pt-10 border-t flex justify-between items-center text-[10px] font-bold uppercase tracking-widest" 
               style={{ borderColor: `${theme.primaryColor}20`, color: theme.secondaryColor }}>
             <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span>AI-Powered Learning Experience</span>
             </div>
             <div className="flex items-center gap-6">
                <span>{slides[currentIndex].id.toUpperCase()}</span>
                <span className="opacity-40">/</span>
                <span>Slide 0{currentIndex + 1} of 0{slides.length}</span>
             </div>
          </div>
        </div>

        {/* Slide Image / Decorative Side */}
        <div className="w-[42%] bg-slate-100 relative overflow-hidden group border-l" style={{ borderColor: `${theme.primaryColor}10` }}>
           <AnimatePresence mode="wait">
             {slideImages[currentSlide.id] ? (
               <motion.div 
                  key={slideImages[currentSlide.id]}
                  initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full"
               >
                 <img 
                    src={slideImages[currentSlide.id]}
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-700"></div>
               </motion.div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-6 bg-slate-50">
                  <div className="relative">
                    <ImageIcon className={`w-16 h-16 ${isGeneratingImage ? 'animate-pulse' : ''}`} />
                    {isGeneratingImage && (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="absolute -top-1 -right-1"
                      >
                         <Sparkles className="w-5 h-5 text-editorial-accent" />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-center space-y-1 px-8">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black block">
                      {isGeneratingImage 
                        ? 'Khởi tạo không gian AI...' 
                        : imageError 
                          ? 'Dừng khơi tạo ảnh' 
                          : 'Chờ phân tích ngữ cảnh...'}
                    </span>
                    <span className={`text-[8px] italic ${imageError ? 'text-red-500 font-bold opacity-100' : 'opacity-60'}`}>
                      {imageError || 'Generative Imagery by Gemini'}
                    </span>
                    {imageError && (
                      <button 
                        onClick={() => setImageError(null)}
                        className="mt-4 text-[9px] font-bold uppercase tracking-widest text-slate-900 bg-white border px-3 py-1 hover:bg-slate-50 transition-colors"
                      >
                        Thử lại
                      </button>
                    )}
                  </div>
               </div>
             )}
           </AnimatePresence>
           
           {/* Color Accent Overlay */}
           <div 
             className="absolute inset-0 opacity-15 pointer-events-none transition-opacity group-hover:opacity-25"
             style={{ 
               background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` 
             }}
           ></div>
        </div>
      </div>

      {/* Navigation & Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-12 z-[70]">
        <button 
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="w-20 h-20 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center disabled:opacity-10 transition-all hover:bg-white/5 active:scale-90"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>

        <div className="flex gap-3">
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className="w-3 h-3 rounded-full transition-all"
              style={{ 
                backgroundColor: idx === currentIndex ? theme.primaryColor : 'rgba(255,255,255,0.2)',
                transform: idx === currentIndex ? 'scale(1.4)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          disabled={currentIndex === slides.length - 1}
          className="w-20 h-20 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center disabled:opacity-10 transition-all hover:bg-white/5 active:scale-90"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      </div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 overflow-hidden">
        <motion.div 
          className="h-full bg-editorial-accent"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
