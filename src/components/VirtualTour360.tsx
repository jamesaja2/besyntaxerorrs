import { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, RotateCw, Pause, Play, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Define the pannellum viewer interface
interface PannellumViewer {
  loadScene: (sceneId: string) => void;
  startAutoRotate: (speed?: number) => void;
  stopAutoRotate: () => void;
  isAutoRotating: () => boolean;
  destroy: () => void;
  getPitch: () => number;
  getYaw: () => number;
  setPitch: (pitch: number) => void;
  setYaw: (yaw: number) => void;
}

declare global {
  interface Window {
    pannellum: {
      viewer: (container: string | Element, config: any) => PannellumViewer;
    };
  }
}

interface VirtualTour360Props {
  imageUrl?: string;
  autoLoad?: boolean;
  autoRotate?: number;
  pitch?: number;
  yaw?: number;
  hfov?: number;
  className?: string;
}

// Array of working 360° images for fallback
const fallbackImages = [
  'https://pannellum.org/images/bma-0.jpg',
  'https://pannellum.org/images/bma-1.jpg',
  'https://pannellum.org/images/alma.jpg',
];

export function VirtualTour360({
  imageUrl = 'https://pannellum.org/images/bma-0.jpg',
  autoLoad = true,
  autoRotate = 0,
  pitch = 0,
  yaw = 0,
  hfov = 100,
  className = ''
}: VirtualTour360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<PannellumViewer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [forceHideLoading, setForceHideLoading] = useState(false);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [imageUrl]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    let forceHideTimeout: NodeJS.Timeout;

    // More realistic loading progress
    const startLoadingProgress = () => {
      let progress = 0;
      progressInterval = setInterval(() => {
        progress += Math.random() * 8 + 3;
        if (progress > 90) progress = 90; // Don't go past 90% until actual load
        setLoadingProgress(progress);
      }, 200);
    };

    // Force hide loading after 10 seconds if stuck
    const setForceHideTimeout = () => {
      forceHideTimeout = setTimeout(() => {
        console.warn('Force hiding loading overlay after timeout');
        setForceHideLoading(true);
        setIsLoading(false);
        clearInterval(progressInterval);
      }, 10000); // 10 second force hide
    };

    // Set timeout to prevent infinite loading
    const setLoadingTimeoutHandler = () => {
      timeoutId = setTimeout(() => {
        console.warn('Loading timeout reached, trying fallback...');
        clearInterval(progressInterval);
        tryFallbackImage();
      }, 8000); // Reduced to 8 seconds
    };

    const tryFallbackImage = () => {
      if (currentImageIndex < fallbackImages.length - 1) {
        console.log(`Trying fallback image ${currentImageIndex + 1}`);
        setCurrentImageIndex(prev => prev + 1);
        setLoadingProgress(0);
        setError(null);
        setIsLoading(true);
        setForceHideLoading(false);
        // Will trigger useEffect again with new image
      } else {
        console.log('All fallback images failed');
        setError('Tidak dapat memuat gambar 360°. Semua fallback gagal.');
        setIsLoading(false);
        clearInterval(progressInterval);
      }
    };

    // Load pannellum script dynamically
    const loadPannellum = async () => {
      if (window.pannellum) {
        console.log('Pannellum already loaded, initializing viewer');
        initViewer();
        return;
      }

      try {
        console.log('Loading Pannellum library...');
        startLoadingProgress();
        setLoadingTimeoutHandler();
        setForceHideTimeout();

        // Load CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
        document.head.appendChild(cssLink);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
        script.onload = () => {
          console.log('Pannellum script loaded successfully');
          // Shorter delay
          setTimeout(initViewer, 300);
        };
        script.onerror = () => {
          console.error('Failed to load Pannellum script');
          clearInterval(progressInterval);
          clearTimeout(timeoutId);
          clearTimeout(forceHideTimeout);
          setError('Gagal memuat library 360° viewer');
          setIsLoading(false);
        };
        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Pannellum:', err);
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        clearTimeout(forceHideTimeout);
        setError('Gagal menginisialisasi 360° viewer');
        setIsLoading(false);
      }
    };

    const initViewer = () => {
      if (!containerRef.current) {
        console.error('Container not available');
        return;
      }

      if (!window.pannellum) {
        console.error('Pannellum not available');
        setTimeout(() => {
          setForceHideLoading(true);
          setIsLoading(false);
        }, 1000);
        return;
      }

      try {
        const currentImage = currentImageIndex === 0 ? imageUrl : fallbackImages[currentImageIndex - 1];
        console.log(`Initializing viewer with image ${currentImageIndex}:`, currentImage);
        
        const viewerInstance = window.pannellum.viewer(containerRef.current, {
          type: 'equirectangular',
          panorama: currentImage,
          autoLoad: autoLoad,
          autoRotate: autoRotate,
          pitch: pitch,
          yaw: yaw,
          hfov: hfov,
          showZoomCtrl: true,
          showFullscreenCtrl: false,
          showControls: true,
          keyboardZoom: true,
          mouseZoom: true,
          doubleClickZoom: true,
          backgroundColor: [0, 0, 0],
          crossOrigin: 'anonymous',
          loadButtonLabel: 'Klik untuk memuat tour',
          onLoad: () => {
            console.log('✅ 360° tour loaded successfully!');
            clearInterval(progressInterval);
            clearTimeout(timeoutId);
            clearTimeout(forceHideTimeout);
            setLoadingProgress(100);
            
            // Hide loading immediately
            setTimeout(() => {
              setIsLoading(false);
              setForceHideLoading(false);
              if (autoRotate > 0) {
                setIsAutoRotating(true);
              }
            }, 500);
          },
          onError: (msg: string) => {
            console.error('❌ Pannellum error:', msg);
            clearTimeout(forceHideTimeout);
            tryFallbackImage();
          }
        });

        setViewer(viewerInstance);
        
        // Additional fallback: if onLoad doesn't fire, force hide after delay
        setTimeout(() => {
          if (isLoading && !forceHideLoading) {
            console.warn('⚠️ onLoad callback may not have fired, checking viewer state');
            try {
              // Try to check if viewer is actually working
              if (viewerInstance && typeof viewerInstance.getPitch === 'function') {
                console.log('✅ Viewer seems to be working, hiding loading');
                setIsLoading(false);
                setLoadingProgress(100);
              }
            } catch (e) {
              console.warn('⚠️ Viewer check failed, but hiding loading anyway');
              setForceHideLoading(true);
              setIsLoading(false);
            }
          }
        }, 3000);

      } catch (err) {
        console.error('Error during viewer initialization:', err);
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        clearTimeout(forceHideTimeout);
        tryFallbackImage();
      }
    };

    loadPannellum();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (timeoutId) clearTimeout(timeoutId);
      if (forceHideTimeout) clearTimeout(forceHideTimeout);
      if (viewer) {
        try {
          viewer.destroy();
        } catch (err) {
          console.warn('Error destroying viewer:', err);
        }
      }
    };
  }, [imageUrl, autoLoad, autoRotate, pitch, yaw, hfov, currentImageIndex]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen tidak didukung');
    }
  };

  const toggleAutoRotate = () => {
    if (!viewer) return;

    try {
      if (isAutoRotating) {
        viewer.stopAutoRotate();
        setIsAutoRotating(false);
      } else {
        viewer.startAutoRotate(2);
        setIsAutoRotating(true);
      }
    } catch (err) {
      console.warn('Kontrol auto-rotate gagal');
    }
  };

  const resetView = () => {
    if (!viewer) return;
    
    try {
      viewer.setPitch(0);
      viewer.setYaw(0);
    } catch (err) {
      console.warn('Reset view gagal');
    }
  };

  const retryLoading = () => {
    setCurrentImageIndex(0);
    setError(null);
    setIsLoading(true);
    setLoadingProgress(0);
    setForceHideLoading(false);
  };

  const forceHideLoadingOverlay = () => {
    setIsLoading(false);
    setForceHideLoading(true);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative w-full h-[70vh] rounded-2xl bg-school-secondary flex items-center justify-center ${className}`}
      >
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-school-text mb-2 font-semibold">Virtual Tour 360° Tidak Tersedia</p>
          <p className="text-sm text-school-text-muted/70 mb-4">{error}</p>
          <div className="space-y-2 text-xs text-school-text-muted/60 mb-4">
            <p>Debugging info:</p>
            <p>• Image index: {currentImageIndex}</p>
            <p>• Loading progress: {Math.round(loadingProgress)}%</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={retryLoading} 
              className="bg-school-accent hover:bg-school-accent-dark"
            >
              Coba Lagi
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Refresh Halaman
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative w-full h-[70vh] rounded-2xl overflow-hidden bg-school-primary shadow-2xl ${className}`}
    >
      {/* Loading overlay */}
      {isLoading && !forceHideLoading && (
        <div className="absolute inset-0 z-20 bg-school-secondary/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="w-full h-full border-4 border-school-accent/20 rounded-full"></div>
              <div 
                className="absolute top-0 left-0 w-full h-full border-4 border-school-accent border-t-transparent rounded-full animate-spin"
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-school-accent">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
            </div>
            <p className="text-school-text font-medium mb-2">Memuat Virtual Tour 360°...</p>
            <p className="text-sm text-school-text-muted mb-2">
              {loadingProgress < 90 ? 'Mengunduh library...' : 'Memuat gambar panorama...'}
            </p>
            {currentImageIndex > 0 && (
              <p className="text-xs text-school-text-muted/70 mb-4">
                Mencoba gambar alternatif ({currentImageIndex + 1}/{fallbackImages.length + 1})
              </p>
            )}
            
            {/* Force hide button if stuck */}
            {loadingProgress > 80 && (
              <Button 
                onClick={forceHideLoadingOverlay}
                size="sm"
                variant="outline"
                className="mt-4"
              >
                Tour sudah siap? Klik di sini
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Viewer container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ backgroundColor: '#000' }}
      />

      {/* Custom controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={resetView}
          className="bg-black/60 backdrop-blur-sm hover:bg-black/80 border-school-accent/20 text-white"
          title="Reset View"
        >
          <RotateCw className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={toggleAutoRotate}
          className="bg-black/60 backdrop-blur-sm hover:bg-black/80 border-school-accent/20 text-white"
          title={isAutoRotating ? "Stop Auto Rotate" : "Start Auto Rotate"}
        >
          {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        
        <Button
          size="sm"
          variant="secondary"
          onClick={toggleFullscreen}
          className="bg-black/60 backdrop-blur-sm hover:bg-black/80 border-school-accent/20 text-white"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 text-white max-w-sm"
        >
          <p className="text-sm font-medium mb-1">🌍 Virtual Tour 360°</p>
          <div className="text-xs text-gray-300 space-y-1">
            <p>• Klik & drag untuk melihat sekeliling</p>
            <p>• Scroll mouse untuk zoom in/out</p>
            <p>• Double click untuk zoom cepat</p>
            <p>• Gunakan keyboard arrow keys</p>
          </div>
        </motion.div>
      </div>

      {/* Compass indicator */}
      {!isLoading && (
        <div className="absolute top-4 left-4 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <div className="text-white text-xs font-bold">N</div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default VirtualTour360;