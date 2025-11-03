import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon, PhotoIcon } from './icons';

interface ScannerViewProps {
  onCapture: (base64Image: string) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('Could not access the camera. Please check permissions and try again.');
      setIsCameraReady(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value to allow selecting the same file again
    event.target.value = '';
  };


  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
      />
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />


      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-between p-6">
        <div className="w-full flex justify-between items-start">
            <div className="text-center bg-black bg-opacity-50 p-3 rounded-lg">
              <h1 className="text-xl font-bold text-white">Scan an Artwork</h1>
              <p className="text-gray-200 text-sm">Position the artwork within the frame.</p>
            </div>
        </div>

        {/* Scanning Reticle */}
        <div className="w-full max-w-sm h-1/2 border-4 border-dashed border-white/50 rounded-2xl flex items-center justify-center">
          {!isCameraReady && !cameraError && (
              <div className="text-white">Starting camera...</div>
          )}
        </div>

        <div className="w-full flex flex-col items-center">
            {cameraError && <div className="bg-red-500 text-white p-4 rounded-lg mb-4 text-center">{cameraError}</div>}
            <div className="w-full max-w-xs flex items-center justify-center space-x-4">
                <div className="flex-1" /> {/* Spacer */}
                <button
                    onClick={handleCapture}
                    disabled={!isCameraReady}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    aria-label="Scan artwork"
                >
                    <CameraIcon className="w-10 h-10 text-gray-800" />
                </button>
                <div className="flex-1 flex justify-end">
                    <button
                        onClick={handleUploadClick}
                        className="w-14 h-14 bg-gray-700/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 active:scale-95"
                        aria-label="Upload a photo"
                    >
                        <PhotoIcon className="w-7 h-7" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};