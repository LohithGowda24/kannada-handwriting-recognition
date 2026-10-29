import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  RotateCw, 
  Sliders, 
  Play, 
  RefreshCw, 
  Check, 
  X,
  FileText
} from 'lucide-react';
import { PreprocessingOptions } from '../types/htr';
import { applyPreprocessing } from '../utils/imageProcessing';

interface ImageUploadCropProps {
  onRecognize: (dataUrl: string, promptHint?: string) => void;
  isLoading: boolean;
}

export const ImageUploadCrop: React.FC<ImageUploadCropProps> = ({
  onRecognize,
  isLoading,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [userHint, setUserHint] = useState('');
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera start
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
    }
  };

  // Capture snapshot from camera
  const captureCamera = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setSelectedImage(dataUrl);
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Rotate image by 90 degrees
  const handleRotate = () => {
    if (!selectedImage) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      setSelectedImage(canvas.toDataURL('image/png'));
    };
    img.src = selectedImage;
  };

  // Apply quick image filter
  const applyFilter = (filterType: 'binarize' | 'contrast' | 'invert' | 'thin') => {
    if (!selectedImage) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const opts: PreprocessingOptions = {
        grayscale: true,
        binarize: filterType === 'binarize' || filterType === 'thin',
        threshold: 128,
        invert: filterType === 'invert',
        enhanceContrast: filterType === 'contrast',
        denoise: false,
        skeletonize: filterType === 'thin',
      };

      applyPreprocessing(ctx, canvas.width, canvas.height, opts);
      setSelectedImage(canvas.toDataURL('image/png'));
    };
    img.src = selectedImage;
  };

  // Trigger recognition
  const handleTrigger = () => {
    if (!selectedImage) return;
    onRecognize(selectedImage, userHint);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col gap-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            Upload Handwritten Kannada Document or Snapshot
          </h2>
          <p className="text-xs text-slate-400">
            Supports irregular handwriting, low-contrast ink, notebook pages, letters, and mobile snapshots.
          </p>
        </div>

        {/* Buttons for File / Camera */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Choose Image</span>
          </button>

          {!isCameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Camera</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-900/40 text-rose-300 border border-rose-700/50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Camera Live Stream View */}
      {isCameraActive && (
        <div className="relative rounded-xl overflow-hidden border border-indigo-500/50 bg-black flex flex-col items-center">
          <video ref={videoRef} autoPlay playsInline className="w-full max-h-[380px] object-contain" />
          <div className="absolute bottom-4 flex items-center gap-3">
            <button
              type="button"
              onClick={captureCamera}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Snapshot</span>
            </button>
          </div>
        </div>
      )}

      {/* Image Preview / Drop Zone */}
      {!isCameraActive && (
        <>
          {selectedImage ? (
            <div className="flex flex-col gap-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-3 max-h-[360px]">
                <img
                  src={selectedImage}
                  alt="Handwritten Kannada Preview"
                  className="max-h-[330px] w-auto object-contain rounded-lg shadow-md"
                />

                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="p-1.5 rounded hover:bg-rose-900/50 text-rose-300"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Preprocessing Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Preprocessing:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyFilter('binarize')}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                  >
                    Otsu Binarize
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFilter('contrast')}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                  >
                    Contrast Stretch
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFilter('thin')}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                  >
                    Thinning
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFilter('invert')}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                  >
                    Invert
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-8 sm:p-12 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Drop Kannada handwritten photo here, or <span className="text-amber-400">browse files</span>
                </p>
                <p className="text-xs text-slate-500">
                  PNG, JPG, WEBP • Works on low-contrast, faded ink, scribbled doctor scripts, or inscriptions
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Prompt Hint */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <span>Optional Context / Handwriting Style Clues (e.g., "Doctor prescription", "Ancient palm leaf", "Classroom homework"):</span>
        </label>
        <input
          type="text"
          value={userHint}
          onChange={(e) => setUserHint(e.target.value)}
          placeholder="E.g., Low contrast ink on aged paper, compound Sanskrit loanwords..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/80 transition-colors"
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleTrigger}
          disabled={!selectedImage || isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Extracting Handwritten Text...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Recognize Uploaded Script</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
