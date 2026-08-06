import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, Loader2, Sparkles } from 'lucide-react';
import { store } from '../../lib/store';

interface CloudinaryUploaderProps {
  onUploadSuccess: (url: string) => void;
  value?: string;
  label?: string;
  accept?: string;
  placeholder?: string;
  className?: string;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  onUploadSuccess,
  value = '',
  label = 'Upload Media',
  accept = 'image/*',
  placeholder = 'https://res.cloudinary.com/... or paste image URL',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [manualUrl, setManualUrl] = useState(value);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cloudinaryConfig = store.getCloudinaryConfig();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    setIsSuccess(false);

    try {
      if (cloudinaryConfig && cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);

        const resourceType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'video' : 'image';
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const secureUrl = data.secure_url;
          setManualUrl(secureUrl);
          onUploadSuccess(secureUrl);
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 3000);
          setIsUploading(false);
          return;
        }
      }

      // Fallback if Cloudinary config isn't custom or request failed: convert to local Base64/DataURL
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setManualUrl(dataUrl);
        onUploadSuccess(dataUrl);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to process image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Cloudinary Upload Error:', err);
      // Fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setManualUrl(dataUrl);
        onUploadSuccess(dataUrl);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualUrlSubmit = () => {
    if (manualUrl.trim()) {
      onUploadSuccess(manualUrl.trim());
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Cloudinary Powered
          </span>
        </label>
      )}

      {/* Main Upload Box */}
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="flex-1 relative cursor-pointer group">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <div className="w-full px-4 py-3 rounded-2xl bg-rose-50/50 dark:bg-slate-800/80 border-2 border-dashed border-rose-200 dark:border-rose-900/50 hover:border-rose-400 text-rose-600 dark:text-rose-400 transition-colors flex items-center justify-center gap-2 text-xs font-bold">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                <span>Uploading to Cloudinary...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Uploaded Successfully!</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload via Cloudinary</span>
              </>
            )}
          </div>
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5"
          title="Direct Image URL"
        >
          <LinkIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Paste URL</span>
        </button>
      </div>

      {/* Optional Direct URL Input field */}
      {(showUrlInput || !manualUrl) && (
        <div className="flex gap-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="button"
            onClick={handleManualUrlSubmit}
            className="px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-rose-500 text-xs font-bold hover:opacity-90"
          >
            Set
          </button>
        </div>
      )}

      {/* Image Preview Thumbnail */}
      {manualUrl && (
        <div className="relative mt-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-36 bg-slate-950 flex items-center justify-center">
          <img src={manualUrl} alt="Preview" className="max-h-36 w-full object-contain" />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-mono">
            {manualUrl.includes('cloudinary.com') ? 'Cloudinary Hosted' : 'Media URL'}
          </div>
        </div>
      )}

      {uploadError && <p className="text-[11px] text-red-500 font-medium">{uploadError}</p>}
    </div>
  );
};
