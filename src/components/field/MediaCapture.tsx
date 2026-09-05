import React from 'react';
import { Camera, Video, X, FileText, Upload } from 'lucide-react';

export interface MediaCaptureItem {
  base64Data: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

interface MediaCaptureProps {
  mediaItems: MediaCaptureItem[];
  onChange: (items: MediaCaptureItem[]) => void;
}

export const MediaCapture: React.FC<MediaCaptureProps> = ({ mediaItems, onChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;

      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds maximum allowed size (${isVideo ? '50MB' : '15MB'}).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const newItem: MediaCaptureItem = {
          base64Data,
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          fileSize: file.size,
        };
        onChange([...mediaItems, newItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (index: number) => {
    const updated = mediaItems.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider flex items-center space-x-1.5">
          <Camera className="w-4 h-4 text-sky-600" />
          <span>FIELD PHOTO / VIDEO EVIDENCE</span>
        </label>
        <span className="text-[10px] text-slate-500 font-mono font-bold">
          {mediaItems.length} ATTACHED
        </span>
      </div>

      {/* Media Previews */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mediaItems.map((item, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 bg-white shadow-sm">
              {item.mimeType.startsWith('video/') ? (
                <div className="h-24 bg-slate-900 flex flex-col items-center justify-center text-white p-2">
                  <Video className="w-6 h-6 text-sky-400 mb-1" />
                  <span className="text-[10px] truncate max-w-full font-mono">{item.fileName}</span>
                </div>
              ) : (
                <img src={item.base64Data} alt="Field preview" className="h-24 w-full object-cover" />
              )}

              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 transition-all"
                title="Remove evidence"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="p-1.5 bg-slate-100 text-[9px] font-mono text-slate-600 truncate flex justify-between">
                <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                <span className="uppercase font-bold">{item.mimeType.split('/')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Inputs */}
      <div className="flex items-center space-x-3">
        <label className="flex-1 cursor-pointer px-4 py-2.5 bg-white border border-dashed border-slate-300 rounded-xl text-center hover:bg-slate-100 transition-all flex items-center justify-center space-x-2">
          <Upload className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-700">Attach Image / Video File</span>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
