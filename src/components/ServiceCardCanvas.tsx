import React, { useEffect, useRef } from 'react';

interface ServiceCardCanvasProps {
  type: 'webdev' | 'frontend' | 'uiux';
  theme: 'dark' | 'light';
}

export const ServiceCardCanvas: React.FC<ServiceCardCanvasProps> = ({ type, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Colors based on theme
    const isDark = theme === 'dark';
    const baseColor = isDark ? '255, 255, 255' : '0, 0, 0';

    // Type-specific particle/animation variables
    // 1. Web Dev: characters
    const chars = ['0', '1', '{', '}', '<', '>', '/', ';', '=', '(', ')', '[', ']'];
    interface WebChar {
      x: number;
      y: number;
      vy: number;
      char: string;
      fontSize: number;
      opacity: number;
    }
    let webChars: WebChar[] = [];

    // 2. Frontend: nodes
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }
    let particles: Particle[] = [];

    // 3. UI/UX: angles
    let angleSquare = 0;
    let angleCircle = 0;

    // Initialization helper
    const initAnimation = (w: number, h: number) => {
      width = w;
      height = h;

      if (type === 'webdev') {
        const count = Math.max(15, Math.floor((w * h) / 6000)); // Dynamic count based on size
        webChars = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vy: -(0.3 + Math.random() * 0.5), // Drifts slowly upward
          char: chars[Math.floor(Math.random() * chars.length)],
          fontSize: Math.floor(10 + Math.random() * 5),
          opacity: 0.3 + Math.random() * 0.7,
        }));
      } else if (type === 'frontend') {
        const count = Math.max(20, Math.floor((w * h) / 4500)); // Density based on card size
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3, // slow speed
          vy: (Math.random() - 0.5) * 0.3,
          radius: 1 + Math.random() * 1.5,
        }));
      }
    };

    // Resize observer to scale canvas properly
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);

        if (w > 0 && h > 0) {
          canvas.width = w;
          canvas.height = h;
          initAnimation(w, h);
        }
      }
    });

    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    // Animation Loop
    const render = () => {
      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      if (type === 'webdev') {
        // Render scrolling monospace code characters
        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${baseColor}, 0.5)`;

        for (const p of webChars) {
          ctx.font = `${p.fontSize}px "JetBrains Mono", "Fira Code", monospace`;
          ctx.fillText(p.char, p.x, p.y);

          // Update position
          p.y += p.vy;

          // Wrap around top
          if (p.y < -15) {
            p.y = height + 15;
            p.x = Math.random() * width;
            p.char = chars[Math.floor(Math.random() * chars.length)];
          }
        }
      } else if (type === 'frontend') {
        // Render node / constellation effect
        // 1. Draw connecting lines
        const limit = 70; // Connection distance limit
        for (let i = 0; i < particles.length; i++) {
          const pi = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const pj = particles[j];
            const dx = pi.x - pj.x;
            const dy = pi.y - pj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < limit) {
              const alpha = (1 - dist / limit) * 0.5;
              ctx.beginPath();
              ctx.moveTo(pi.x, pi.y);
              ctx.lineTo(pj.x, pj.y);
              ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        // 2. Draw nodes and update positions
        ctx.fillStyle = `rgba(${baseColor}, 0.6)`;
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Move
          p.x += p.vx;
          p.y += p.vy;

          // Bounce off walls
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          // Keep within bounds
          if (p.x < 0) p.x = 0;
          if (p.x > width) p.x = width;
          if (p.y < 0) p.y = 0;
          if (p.y > height) p.y = height;
        }
      } else if (type === 'uiux') {
        // Render rotating wireframe shape centered in the card
        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = Math.min(width, height) * 0.28;

        if (baseRadius > 10) {
          ctx.lineWidth = 0.75;

          // --- Shape 1: Square wireframe rotating clockwise ---
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angleSquare);
          ctx.strokeStyle = `rgba(${baseColor}, 0.35)`;

          // Outer Square
          const size = baseRadius * 1.4;
          ctx.strokeRect(-size / 2, -size / 2, size, size);

          // Inner diagonal lines
          ctx.beginPath();
          ctx.moveTo(-size / 2, -size / 2);
          ctx.lineTo(size / 2, size / 2);
          ctx.moveTo(size / 2, -size / 2);
          ctx.lineTo(-size / 2, size / 2);
          ctx.strokeStyle = `rgba(${baseColor}, 0.15)`;
          ctx.stroke();

          // Corner squares to look like drag handles / UI anchor nodes
          const nodeSize = 4;
          ctx.fillStyle = `rgba(${baseColor}, 0.6)`;
          ctx.fillRect(-size / 2 - nodeSize / 2, -size / 2 - nodeSize / 2, nodeSize, nodeSize);
          ctx.fillRect(size / 2 - nodeSize / 2, -size / 2 - nodeSize / 2, nodeSize, nodeSize);
          ctx.fillRect(-size / 2 - nodeSize / 2, size / 2 - nodeSize / 2, nodeSize, nodeSize);
          ctx.fillRect(size / 2 - nodeSize / 2, size / 2 - nodeSize / 2, nodeSize, nodeSize);

          ctx.restore();

          // --- Shape 2: Circle wireframe rotating counter-clockwise ---
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angleCircle);

          // Draw stroked circle
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${baseColor}, 0.35)`;
          ctx.stroke();

          // Draw compass/axis markers or ticks
          ctx.beginPath();
          // Horizontal axis line
          ctx.moveTo(-baseRadius, 0);
          ctx.lineTo(baseRadius, 0);
          // Vertical axis line
          ctx.moveTo(0, -baseRadius);
          ctx.lineTo(0, baseRadius);
          ctx.strokeStyle = `rgba(${baseColor}, 0.15)`;
          ctx.stroke();

          // Circumference nodes
          ctx.fillStyle = `rgba(${baseColor}, 0.65)`;
          const nodeRadius = 2.5;
          const nodeAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
          for (const a of nodeAngles) {
            ctx.beginPath();
            ctx.arc(Math.cos(a) * baseRadius, Math.sin(a) * baseRadius, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          // Update rotation angles
          angleSquare += 0.0012; // slow clockwise
          angleCircle -= 0.0018; // slow counter-clockwise
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Start loop
    render();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [type, theme]);

  return (
    <canvas
      ref={canvasRef}
      id={`canvas-service-${type}`}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-[0.42] group-hover:opacity-[0.28] transition-opacity duration-400 ease-out"
    />
  );
};
