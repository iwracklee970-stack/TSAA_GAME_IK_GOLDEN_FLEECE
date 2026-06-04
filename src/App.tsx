import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { BookOpen, Map as MapIcon, Compass, ChevronDown, Feather } from 'lucide-react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Chapter 1: The Library (Fades out early)
  const libraryOpacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const libraryY = useTransform(scrollYProgress, [0, 0.25], [0, -200]);

  // Chapter 2: The Map/Journey (Fades in mid-scroll, fades out late)
  const journeyOpacity = useTransform(scrollYProgress, [0.2, 0.35, 0.65, 0.8], [0, 1, 1, 0]);
  const journeyScale = useTransform(scrollYProgress, [0.2, 0.8], [0.9, 1.1]);
  const shipPath = useTransform(scrollYProgress, [0.3, 0.7], [0, 100]); // Percentage of journey complete

  // Chapter 3: The Destination/Start Game (Fades in at the end)
  const destinationOpacity = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);
  const destinationY = useTransform(scrollYProgress, [0.75, 0.9], [100, 0]);

  const goToGame = () => {
    window.location.hash = '#/play';
  };

  return (
    <div ref={containerRef} className="bg-sepia-900 min-h-[400vh] text-sepia-100 font-serif selection:bg-sepia-accent/30 overflow-x-hidden">
      
      {/* Background Ambience (Dust/Noise) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] mix-blend-overlay"></div>
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-sepia-950 via-sepia-900 to-sepia-950 opacity-80"></div>

      {/* Chapter 1: The Library in Georgia */}
      <motion.section 
        style={{ opacity: libraryOpacity, y: libraryY }}
        className="fixed inset-0 flex flex-col items-center justify-center text-center px-4 z-10 pointer-events-none"
      >
        <div className="max-w-2xl mx-auto space-y-12 bg-sepia-800/80 p-12 border border-sepia-700/50 backdrop-blur-sm shadow-2xl relative">
          <BookOpen className="w-12 h-12 text-sepia-400 mx-auto opacity-50 mb-8" />
          
          <h1 className="text-4xl md:text-6xl font-heading uppercase tracking-widest text-sepia-100 mb-6 drop-shadow-md">
            Tbilisi, 1938
          </h1>
          
          <div className="w-16 h-px bg-sepia-500/50 mx-auto"></div>
          
          <p className="text-xl md:text-2xl font-serif italic text-sepia-300 leading-relaxed text-justify">
            The university archives smelled of decaying parchment and forgotten wars. It was here, buried beneath stacks of discarded Ottoman maps, that I found it.
          </p>
          <p className="text-xl md:text-2xl font-serif italic text-sepia-300 leading-relaxed text-justify">
            A journal entry speaking of the Argo. Not as a myth, but as an expedition. And the Fleece... it wasn't gold. It was something else entirely.
          </p>

          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50 animate-bounce">
             <span className="text-xs font-mono uppercase tracking-[0.3em] text-sepia-400">Scroll</span>
             <ChevronDown className="w-4 h-4 text-sepia-400" />
          </div>
        </div>
      </motion.section>

      {/* Chapter 2: The Journey to Greece */}
      <motion.section 
        style={{ opacity: journeyOpacity, scale: journeyScale }}
        className="fixed inset-0 flex flex-col items-center justify-center px-4 z-20 pointer-events-none"
      >
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12">
          
          {/* Map Graphic representation */}
          <div className="relative w-full md:w-1/2 aspect-square border-4 border-sepia-700 bg-sepia-800 p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] opacity-30 mix-blend-multiply"></div>
             
             {/* Map Points */}
             <div className="absolute top-1/4 right-1/4 flex flex-col items-center gap-2">
                <div className="w-3 h-3 bg-sepia-accent rounded-full animate-pulse shadow-[0_0_10px_var(--color-sepia-accent)]"></div>
                <span className="text-[10px] font-mono uppercase tracking-widest">Georgia</span>
             </div>

             <div className="absolute bottom-1/3 left-1/3 flex flex-col items-center gap-2">
                <div className="w-3 h-3 border-2 border-sepia-accent rounded-full"></div>
                <span className="text-[10px] font-mono uppercase tracking-widest">Aegean Sea</span>
             </div>

             {/* Dynamic Path line */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }}>
               <motion.path 
                 d="M 75% 25% Q 50% 20% 33% 66%" 
                 fill="transparent" 
                 stroke="var(--color-sepia-accent)" 
                 strokeWidth="2"
                 strokeDasharray="5,5"
                 pathLength="100"
                 style={{ pathLength: useTransform(shipPath, [0, 100], [0, 1]) }}
               />
             </svg>
          </div>

          <div className="w-full md:w-1/2 space-y-8 bg-sepia-900/80 p-8 border-l-2 border-sepia-accent/30">
            <Compass className="w-8 h-8 text-sepia-accent opacity-50" />
            <h2 className="text-3xl font-heading text-sepia-100 uppercase tracking-widest">The Descent</h2>
            <p className="text-lg text-sepia-300 font-serif italic leading-relaxed">
              I packed my satchel, my notes, and my service revolver. If the texts were right, the ruins of Poseidon's temple were not just abandoned. They were guarded by those who sank with it.
            </p>
            <p className="text-lg text-sepia-300 font-serif italic leading-relaxed">
              Six bullets. That's all I have. I must make every shot count.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Chapter 3: Enter the Game */}
      <motion.section 
        style={{ opacity: destinationOpacity, y: destinationY }}
        className="fixed inset-0 flex flex-col items-center justify-center px-4 z-30"
      >
        <div className="text-center space-y-12">
          <Feather className="w-12 h-12 text-sepia-accent mx-auto mb-8 animate-float" />
          
          <h2 className="text-5xl md:text-7xl font-heading text-sepia-100 uppercase tracking-[0.2em] mb-4">
            The Sunken Ruins
          </h2>
          <p className="text-xl text-sepia-400 font-mono tracking-widest uppercase mb-16">
            1938 Expedition
          </p>

          <button
            onClick={goToGame}
            className="group relative px-12 py-5 bg-sepia-900 border border-sepia-accent text-sepia-accent font-heading text-sm uppercase tracking-[0.3em] transition-all hover:bg-sepia-accent hover:text-sepia-950 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <span className="relative z-10">Step Into the Dark</span>
            <div className="absolute inset-0 bg-sepia-100 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>
        </div>
      </motion.section>

    </div>
  );
}
