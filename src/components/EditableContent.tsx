import React, { useState, useEffect } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';

interface EditableContentProps {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  className?: string;
}

export const EditableContent: React.FC<EditableContentProps> = ({ 
  value, 
  onSave, 
  multiline = false,
  className 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={cn("relative group", className)}>
        {multiline ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full p-2 border border-editorial-ink/30 bg-white min-h-[100px] text-sm focus:outline-none focus:border-editorial-ink"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full p-2 border border-editorial-ink/30 bg-white text-sm focus:outline-none focus:border-editorial-ink"
            autoFocus
          />
        )}
        <div className="flex gap-1 mt-1 justify-end">
          <button onClick={handleSave} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check className="w-3 h-3" /></button>
          <button onClick={handleCancel} className="p-1 text-rose-600 hover:bg-rose-50 rounded"><X className="w-3 h-3" /></button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("group/editable relative cursor-pointer hover:bg-slate-50/50 p-1 rounded transition-colors", className)}
      onClick={() => setIsEditing(true)}
    >
      <div className="pr-6">
        {value}
      </div>
      <Pencil className="w-3 h-3 absolute top-2 right-1 opacity-0 group-hover/editable:opacity-30 transition-opacity text-editorial-ink" />
    </div>
  );
};
