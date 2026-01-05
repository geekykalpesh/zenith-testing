"use client";

import React, { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion, AnimatePresence } from "framer-motion";

const frameCount = 240;

// Helper to get image path - assuming they are in public root
const getCurrentFrame = (index: number) => {
  // Files are named ezgif-frame-001.jpg through ezgif-frame-240.jpg
  // Index is 0-239, so we need to add 1.
  const frameNumber = index + 1;
  return `/frames/ezgif-frame-${frameNumber.toString().padStart(3, '0')}.jpg`;
};

export default function HeadphoneScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll progress for the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll (0-1) to frame index (0-239)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);

  // Preload images
  useEffect(() => {
    console.log("Preloading images...");
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = getCurrentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setIsLoading(false);
        }
      };
      
      img.onerror = () => {
         loadedCount++;
         if (loadedCount === frameCount) setIsLoading(false);
      }
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Render to canvas
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || images.length === 0) return;

      const currentIndex = Math.round(frameIndex.get());
      const img = images[currentIndex];

      if (img && img.complete && img.naturalWidth > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);

        const canvasRatio = canvas.width / dpr / (canvas.height / dpr);
        const imgRatio = img.width / img.height;
        
        let deployWidth, deployHeight;

        // "Cover" fit logic for maximum impact
        if (canvasRatio > imgRatio) {
            deployWidth = window.innerWidth;
            deployHeight = deployWidth / imgRatio;
        } else {
            deployHeight = window.innerHeight;
            deployWidth = deployHeight * imgRatio;
        }

        const x = (window.innerWidth - deployWidth) / 2;
        const y = (window.innerHeight - deployHeight) / 2;

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.drawImage(img, x, y, deployWidth, deployHeight);
      } else {
        // Fallback or loading frame?
        // We can just leave it clear or draw previous frame.
      }
    };

    const unsubscribe = frameIndex.on("change", render);
    window.addEventListener("resize", render);
    
    const animationId = requestAnimationFrame(render);

    return () => {
        unsubscribe();
        window.removeEventListener("resize", render);
        cancelAnimationFrame(animationId);
    };
  }, [images, frameIndex, isLoading]);

  // --- Animation Variants ---
  const fadeInUp = {
    initial: { opacity: 0, y: 50, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, filter: "blur(10px)", transition: { duration: 0.5 } }
  };

  // --- Opacity Transforms for Sections ---
  // We use standard motion values for simple fades, enabling/disabling pointer events via CSS classes often cleaner, 
  // but here we will just render them based on scroll ranges if we wanted strict conditionals, 
  // OR just map opacity and use pointer-events-none.
  
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const opacitySec1 = useTransform(scrollYProgress, [0.15, 0.25, 0.35], [0, 1, 0]);
  const opacitySec2 = useTransform(scrollYProgress, [0.45, 0.55, 0.65], [0, 1, 0]);
  const opacityCta = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);

  return (
    <div ref={containerRef} className="relative h-[600vh] bg-[#050505]">
      
      {/* Loading Spinner */}
      <AnimatePresence>
        {isLoading && (
            <motion.div 
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white"
            >
                <div className="h-12 w-12 border-t-2 border-l-2 border-white rounded-full animate-spin mb-4"></div>
                <div className="text-white/50 text-sm tracking-widest uppercase">Loading Assets</div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full object-cover" />
      </div>

      {/* --- Section 1: Hero --- */}
      <motion.div 
        style={{ opacity: opacityHero }}
        className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center z-10"
      >
        <motion.div 
            initial="initial" animate="animate" exit="exit" variants={fadeInUp}
            className="text-center"
        >
            <div className="flex items-center justify-center gap-4 mb-6">
                <span className="h-[1px] w-12 bg-white/30"></span>
                <span className="text-white/50 tracking-[0.4em] text-xs uppercase">The Future of Sound</span>
                <span className="h-[1px] w-12 bg-white/30"></span>
            </div>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mix-blend-difference mb-2">
              ZENITH<span className="text-red-600">X</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl tracking-wide font-light">
                Engineering perfection.
            </p>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
             <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
             <span className="text-[10px] uppercase tracking-widest text-white/40">Scroll to disassemble</span>
        </motion.div>
      </motion.div>


      {/* --- Section 2: Breakdown --- */}
      <motion.div 
         style={{ opacity: opacitySec1 }}
         className="fixed inset-0 pointer-events-none flex items-center justify-start p-8 md:p-32 z-10"
      >
        <div className="max-w-lg backdrop-blur-sm bg-black/20 p-8 rounded-2xl border border-white/5 shadow-2xl">
            <div className="text-red-500 font-mono text-sm mb-2">01. ARCHITECTURE</div>
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-6">
                Internal<br /><span className="text-white/40">Precision.</span>
            </h2>
            <p className="text-lg text-white/70 leading-relaxed font-light">
                Stripped of all excess. Every screw, magnet, and coil is placed with surgical accuracy to eliminate distortion.
            </p>
        </div>
      </motion.div>

       {/* --- Section 3: Drivers --- */}
       <motion.div 
         style={{ opacity: opacitySec2 }}
         className="fixed inset-0 pointer-events-none flex items-center justify-end p-8 md:p-32 z-10"
      >
        <div className="max-w-lg text-right backdrop-blur-sm bg-black/20 p-8 rounded-2xl border border-white/5 shadow-2xl">
            <div className="text-red-500 font-mono text-sm mb-2">02. PERFORMANCE</div>
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-6">
                Titanium<br /><span className="text-white/40">Core.</span>
            </h2>
            <p className="text-lg text-white/70 leading-relaxed font-light">
                Our patented 50mm titanium drivers deliver a soundstage so wide, you'll forget you're wearing headphones.
            </p>
        </div>
      </motion.div>

      {/* --- Section 4: CTA --- */}
      <motion.div 
         style={{ opacity: opacityCta }}
         className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center z-[60]"
      >
        <div className="text-center relative">
            <h2 className="relative text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8">
                Hear the<br />Impossible.
            </h2>
            <button className="relative pointer-events-auto group bg-white text-black px-10 py-4 rounded-full font-medium text-lg tracking-wide hover:scale-105 transition-all duration-300">
                <span className="relative z-10">Pre-order Zenith X</span>
            </button>
            <div className="mt-8 text-white/60 text-xs uppercase tracking-widest">
                Limited Edition / Series 01
            </div>
        </div>
      </motion.div>
    </div>
  );
}
