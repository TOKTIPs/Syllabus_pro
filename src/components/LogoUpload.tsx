import { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  onLogoUpload: (base64: string | null) => void;
  className?: string;
}

export default function LogoUpload({ onLogoUpload, className }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onLogoUpload(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setPreview(null);
    onLogoUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="editorial-label">Logo thương hiệu (Tùy chọn)</label>
      <div 
        onClick={() => !preview && fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed transition-all duration-300 flex items-center justify-center cursor-pointer",
          preview ? "border-emerald-500 bg-emerald-50/10 h-32" : "border-editorial-line hover:border-editorial-accent bg-slate-50/50 h-32 overflow-hidden"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {preview ? (
          <div className="flex items-center gap-4 px-6 w-full h-full">
            <div className="w-20 h-20 bg-white border border-editorial-line p-2 shrink-0">
               <img src={preview} alt="Logo preview" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase tracking-widest mb-1">
                 <Check className="w-3 h-3" /> Đã tải lên
               </div>
               <p className="text-[10px] text-slate-500 uppercase tracking-tight">Slide sẽ tự động theo màu logo này</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); clearLogo(); }}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        ) : (
          <div className="text-center p-4">
            <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tải lên logo định dạng và màu sắc</p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase italic">Microsoft theme sẽ là mặc định</p>
          </div>
        )}
      </div>
    </div>
  );
}
