import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/solid';

const MAX_SCALE = 5;
const MIN_SCALE = 1;
const ZOOM_FACTOR = 1.2;

function ImageModal({ imageSrc, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  
  // For smooth drag animations
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform([x, y], ([latestX, latestY]) => latestX * 0.02);

  // Calculate drag constraints based on image size and scale
  const getDragConstraints = useCallback(() => {
    if (!imgRef.current) return {};
    
    const imgWidth = imgRef.current.offsetWidth;
    const imgHeight = imgRef.current.offsetHeight;
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const containerHeight = containerRef.current?.offsetHeight || window.innerHeight;
    
    const horizontalBound = Math.max(0, (imgWidth * scale - containerWidth) / 2);
    const verticalBound = Math.max(0, (imgHeight * scale - containerHeight) / 2);
    
    return {
      left: -horizontalBound,
      right: horizontalBound,
      top: -verticalBound,
      bottom: verticalBound,
    };
  }, [scale]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * ZOOM_FACTOR, MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => {
      const newScale = prev / ZOOM_FACTOR;
      if (newScale <= MIN_SCALE) {
        setPosition({ x: 0, y: 0 });
        return MIN_SCALE;
      }
      return newScale;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(MIN_SCALE);
    setPosition({ x: 0, y: 0 });
    x.set(0);
    y.set(0);
  }, [x, y]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Handle pinch zoom on trackpads
      const delta = e.deltaY > 0 ? -1 : 1;
      if (delta > 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    } else {
      if (e.deltaY < 0) {
        handleZoomToPoint(e);
      } else {
        handleZoomOut();
      }
    }
  }, [handleZoomIn, handleZoomOut]);

  const handleZoomToPoint = useCallback((e) => {
    if (!imgRef.current || scale >= MAX_SCALE) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const newScale = Math.min(scale * ZOOM_FACTOR, MAX_SCALE);
    const originX = offsetX / scale;
    const originY = offsetY / scale;
    
    setScale(newScale);
    
    // Adjust position to zoom toward the mouse position
    setPosition({
      x: position.x - (originX * (newScale - scale)),
      y: position.y - (originY * (newScale - scale))
    });
  }, [scale, position.x, position.y]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    // Reset position when scale changes to 1
    if (scale === MIN_SCALE) {
      setPosition({ x: 0, y: 0 });
      x.set(0);
      y.set(0);
    }
  }, [scale, x, y]);

  useEffect(() => {
    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleZoomIn, handleZoomOut, handleResetZoom]);

  if (!imageSrc) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        ref={containerRef}
      >
        <motion.div
          className="relative"
          style={{
            width: 'fit-content',
            height: 'fit-content',
            cursor: isDragging ? 'grabbing' : (scale > MIN_SCALE ? 'grab' : 'auto'),
            x,
            y,
            rotate
          }}
          drag={scale > MIN_SCALE}
          dragConstraints={getDragConstraints()}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          onWheel={handleWheel}
        >
          <motion.img
            ref={imgRef}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: scale,
              opacity: 1,
              x: position.x,
              y: position.y
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={imageSrc}
            alt="Zoomed Visual"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
            style={{ transformOrigin: 'center center' }}
            onClick={(e) => {
              e.stopPropagation();
              if (e.detail === 2) handleZoomIn(); // Double click zoom
            }}
            draggable="false" // Prevent native drag behavior
          />
        </motion.div>

        {/* Close button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { delay: 0.2 } }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close image view"
        >
          <XMarkIcon className="h-6 w-6" />
        </motion.button>

        {/* Download button */}
        <motion.a
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { delay: 0.2 } }}
          exit={{ scale: 0, opacity: 0 }}
          href={imageSrc}
          download={`download-${Date.now()}`}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-16 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Download image"
        >
          <ArrowDownTrayIcon className="h-6 w-6" />
        </motion.a>

        {/* Zoom controls */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-full backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
            className="p-2 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom out"
            disabled={scale <= MIN_SCALE}
          >
            <MagnifyingGlassMinusIcon className="h-5 w-5" />
          </button>
          
          <span className="px-2 text-white text-sm flex items-center min-w-[50px] justify-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
            className="p-2 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Reset zoom"
            disabled={scale === MIN_SCALE}
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
            className="p-2 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom in"
            disabled={scale >= MAX_SCALE}
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ImageModal;