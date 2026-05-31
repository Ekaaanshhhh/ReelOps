import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileVideo, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize } from '../../utils/helpers';

/**
 * UploadDropzone — drag-and-drop video upload with preview and progress bar.
 */
export default function UploadDropzone({ onFileSelect, file, onClear, uploading, progress = 0 }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      onFileSelect?.(droppedFile);
    }
  }, [onFileSelect]);

  const handleInputChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect?.(selectedFile);
    }
  }, [onFileSelect]);

  // File selected — show preview
  if (file) {
    return (
      <div className="relative border border-border rounded-2xl bg-bg-secondary overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Video thumbnail */}
            <div className="w-24 h-16 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0">
              <FileVideo className="w-6 h-6 text-accent-purple" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{file.name}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {formatFileSize(file.size)} • {file.type}
              </p>
            </div>

            {!uploading && (
              <button
                onClick={onClear}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload progress */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-accent-purple">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading…
                  </span>
                  <span className="text-xs font-mono text-text-muted">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-bg"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // No file — show dropzone
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-200
        ${isDragging
          ? 'border-accent-purple bg-accent-purple/5'
          : 'border-border hover:border-border-light hover:bg-bg-secondary/50'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3 text-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
          isDragging ? 'bg-accent-purple/10' : 'bg-bg-secondary'
        }`}>
          <Upload className={`w-7 h-7 ${isDragging ? 'text-accent-purple' : 'text-text-muted'}`} />
        </div>

        <div>
          <p className="text-sm font-medium text-text">
            {isDragging ? 'Drop your video here' : 'Drag & drop your video'}
          </p>
          <p className="text-xs text-text-muted mt-1">
            or <span className="text-accent-purple">browse files</span> • MP4, MOV, WebM up to 100MB
          </p>
        </div>
      </div>
    </div>
  );
}
