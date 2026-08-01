import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface InteractiveProfileProps {
  theme: 'dark' | 'light';
}

export const InteractiveProfile: React.FC<InteractiveProfileProps> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for normalized mouse positions (-1 to 1)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for a fluid, lag-free premium feel
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Rotation limits (~8 degrees max)
  // When y goes from -1 to 1, we rotate around X-axis from 8 to -8 deg
  const rotateX = useTransform(springY, [-1, 1], [8, -8]);
  // When x goes from -1 to 1, we rotate around Y-axis from -8 to 8 deg
  const rotateY = useTransform(springX, [-1, 1], [-8, 8]);

  // Dot layer rotation (60-70% of base)
  const dotRotateX = useTransform(springY, [-1, 1], [5.2, -5.2]);
  const dotRotateY = useTransform(springX, [-1, 1], [-5.2, 5.2]);

  // Translate dot layer opposite to the tilt direction to create depth (floating above)
  const dotTranslateX = useTransform(springX, [-1, 1], [6, -6]);
  const dotTranslateY = useTransform(springY, [-1, 1], [6, -6]);

  // Shadow displacement based on tilt
  const shadowX = useTransform(springX, [-1, 1], [15, -15]);
  const shadowY = useTransform(springY, [-1, 1], [15, -15]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = rect.width;
    const height = rect.height;

    // Calculate mouse coordinates relative to the center of the card
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;

    // Normalize coordinates (-1 to 1)
    const normalizedX = mouseX / (width / 2);
    const normalizedY = mouseY / (height / 2);

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    // Return smoothly to center
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[180px] sm:max-w-[220px] lg:max-w-[260px] aspect-[4/5] cursor-pointer [perspective:1000px] select-none group"
      style={{ willChange: 'transform' }}
    >
      {/* Dynamic shadows that shift based on tilt */}
      <motion.div
        className={`absolute inset-2 rounded-xl filter blur-xl opacity-40 transition-colors duration-500 pointer-events-none -z-10 ${
          theme === 'light' ? 'bg-black/10' : 'bg-black/80'
        }`}
        style={{
          x: shadowX,
          y: shadowY,
          scale: 0.95,
        }}
      />

      {/* Tilt Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900 transition-colors duration-500"
      >
        {/* Layer 1: Base halftone-dot photo */}
        <div className="absolute inset-0 w-full h-full [transform:translateZ(0px)] overflow-hidden">
          {/* Halftone image */}
          <img
            src="/img/drei.jpg"
            alt="Kellas Andrei"
            className="w-full h-full object-cover filter grayscale contrast-[1.5] brightness-[1.15]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = '0';
            }}
          />
          {/* Fine halftone dots baked into base */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.85)_1px,transparent_1.3px)] [background-size:3.5px_3.5px] mix-blend-multiply opacity-65 pointer-events-none" />
        </div>

        {/* Layer 2: Floating Duplicated Halftone Dot Overlay Layer */}
        {/* Floating at +30px z-space, rotating slightly less, translating opposite */}
        <motion.div
          style={{
            rotateX: dotRotateX,
            rotateY: dotRotateY,
            x: dotTranslateX,
            y: dotTranslateY,
            z: 30,
            transformStyle: 'preserve-3d',
          }}
          className="absolute inset-0 w-full h-full pointer-events-none mix-blend-multiply opacity-50 dark:opacity-60"
        >
          {/* Transparent dot mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.7)_1.5px,transparent_1.8px)] [background-size:6px_6px] [background-position:1.75px_1.75px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_1px,transparent_1.5px)] [background-size:12px_12px]" />
        </motion.div>

        {/* Gloss/Reflect Effect Overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 dark:via-white/2 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            z: 40,
          }}
        />
      </motion.div>
    </div>
  );
};
