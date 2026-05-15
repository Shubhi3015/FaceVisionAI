import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, X } from 'lucide-react';
import type { UploadMode } from '../types';

interface UploadBoxProps {
  onImageSelect: (file: File, preview: string) => void;
  previewURL: string | null;
}

export const UploadBox = ({ onImageSelect, previewURL }: UploadBoxProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<UploadMode>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a clear face image for accurate analysis.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onImageSelect(file, preview);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            processFile(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // Preview mode
  if (previewURL) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-glass border border-slate-200/50 p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-text mb-4 sm:mb-6">Image Preview</h2>
        <div className="relative mb-4 sm:mb-6">
          <img
            src={previewURL}
            alt="Preview"
            className="w-full h-auto max-h-[70vh] rounded-xl sm:rounded-2xl border border-primary/20 object-contain"
          />
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition touch-manipulation"
            aria-label="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-glass border border-slate-200/50 p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full"
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-text mb-6 sm:mb-8 text-center">Analyze Image</h2>

      {/* Mode Toggle */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8 bg-background rounded-2xl sm:rounded-full p-1.5 sm:p-1.5">
        <motion.button
          type="button"
          onClick={() => {
            setMode('upload');
            stopCamera();
          }}
          className={`flex-1 py-3 sm:py-2 px-4 sm:px-6 rounded-xl sm:rounded-full font-semibold transition flex items-center justify-center gap-2 ${
            mode === 'upload'
              ? 'bg-primary text-white shadow-lg'
              : 'text-text hover:bg-white/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Upload className="w-4 h-4 shrink-0" />
          <span>Upload Image</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={() => {
            setMode('camera');
            if (!cameraActive) startCamera();
          }}
          className={`flex-1 py-3 sm:py-2 px-4 sm:px-6 rounded-xl sm:rounded-full font-semibold transition flex items-center justify-center gap-2 ${
            mode === 'camera'
              ? 'bg-primary text-white shadow-lg'
              : 'text-text hover:bg-white/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span>Take Photo</span>
        </motion.button>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-10 md:p-12 text-center transition ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-primary/30 hover:border-primary/50'
          }`}
        >
          <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3 sm:mb-4 opacity-70" />
          <p className="text-base sm:text-lg md:text-xl font-semibold text-text mb-1 sm:mb-2">
            Drag & drop or click to upload
          </p>
          <p className="text-xs sm:text-sm text-text/60 mb-4 sm:mb-6">
            PNG, JPG, JPEG – Max 10MB
          </p>
          <label className="inline-block">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => {
                const files = e.currentTarget.files;
                if (files && files.length > 0) {
                  processFile(files[0]);
                }
              }}
              className="hidden"
            />
            <span className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-semibold cursor-pointer hover:shadow-lg transition text-sm sm:text-base">
              Select File
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {cameraActive && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-xl sm:rounded-2xl bg-black aspect-video object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={capturePhoto}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl sm:rounded-full font-semibold shadow-lg hover:shadow-xl transition"
                >
                  Capture Photo
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopCamera}
                  className="flex-1 px-6 py-3 border-2 border-primary/30 text-text rounded-xl sm:rounded-full font-semibold hover:bg-primary/10 transition"
                >
                  Retake
                </motion.button>
              </div>
            </>
          )}
          {!cameraActive && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startCamera}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl sm:rounded-full font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5 shrink-0" />
              Start Camera
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};
