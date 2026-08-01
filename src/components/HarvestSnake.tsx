import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, X, Volume2, VolumeX, Trophy, Play, RotateCcw, ShieldAlert, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

// --- Types ---
interface Point {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type CropType = 'CARROT' | 'PUMPKIN' | 'WHEAT' | 'GOLDEN';

interface FoodItem {
  pos: Point;
  type: CropType;
  rotation: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

// --- Game Configurations ---
const GRID_SIZE = 15;
const BASE_SPEED = 140; // milliseconds per tick
const NIGHT_SPEED = 110;

// Web Audio API Synthesizer
const playTone = (type: 'eat_carrot' | 'eat_pumpkin' | 'eat_wheat' | 'eat_golden' | 'game_over' | 'click' | 'milestone') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const triggerTone = (freq: number, oscType: OscillatorType, duration: number, delay = 0, volume = 0.08) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    if (type === 'eat_carrot') {
      triggerTone(523.25, 'triangle', 0.12); // C5
      triggerTone(659.25, 'triangle', 0.12, 0.04); // E5
    } else if (type === 'eat_pumpkin') {
      triggerTone(220.00, 'sine', 0.22, 0, 0.2); // A3
      triggerTone(261.63, 'sine', 0.18, 0.03, 0.15); // C4
    } else if (type === 'eat_wheat') {
      triggerTone(587.33, 'sine', 0.25, 0); // D5
      triggerTone(698.46, 'sine', 0.25, 0.05); // F5
      triggerTone(880.00, 'sine', 0.35, 0.1); // A5
    } else if (type === 'eat_golden') {
      triggerTone(523.25, 'triangle', 0.2, 0); // C5
      triggerTone(659.25, 'triangle', 0.2, 0.04); // E5
      triggerTone(783.99, 'triangle', 0.2, 0.08); // G5
      triggerTone(1046.50, 'triangle', 0.35, 0.12); // C6
    } else if (type === 'game_over') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'click') {
      triggerTone(700, 'sine', 0.04, 0, 0.04);
    } else if (type === 'milestone') {
      triggerTone(261.63, 'triangle', 0.15, 0); // C4
      triggerTone(329.63, 'triangle', 0.15, 0.08); // E4
      triggerTone(392.00, 'triangle', 0.15, 0.16); // G4
      triggerTone(523.25, 'triangle', 0.35, 0.24, 0.12); // C5
    }
  } catch (err) {
    console.warn("Audio Context blocked or failed:", err);
  }
};

export function HarvestSnakeModal({
  isOpen,
  onClose,
  theme
}: {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number | null>(null);

  // Game States
  const [snake, setSnake] = useState<Point[]>([
    { x: 7, y: 6 },
    { x: 7, y: 7 },
    { x: 7, y: 8 }
  ]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [nextDirection, setNextDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<FoodItem | null>(null);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('harvest_snake_highscore') || '0', 10);
    }
    return 0;
  });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [dayNightCycle, setDayNightCycle] = useState<'DAY' | 'NIGHT'>('DAY');
  const [secondsInPhase, setSecondsInPhase] = useState<number>(0);

  // Buffs / Effects
  const [goldenHarvestTime, setGoldenHarvestTime] = useState<number>(0); // remaining wheat double points
  const [heavyHarvestTime, setHeavyHarvestTime] = useState<number>(0); // remaining pumpkin speed boost
  const [growPending, setGrowPending] = useState<number>(0); // segments left to grow
  const [milestoneShown, setMilestoneShown] = useState<boolean>(false);
  const [showMilestoneAlert, setShowMilestoneAlert] = useState<boolean>(false);

  // Direction handler helper
  const changeDirection = (newDir: Direction) => {
    if (isGameOver || isPaused || showMilestoneAlert) return;

    // Prevent 180 degree turns
    const opposites = {
      'UP': 'DOWN',
      'DOWN': 'UP',
      'LEFT': 'RIGHT',
      'RIGHT': 'LEFT'
    };

    if (opposites[newDir] !== direction) {
      setNextDirection(newDir);
      if (!isMuted) playTone('click');
    }
  };

  // Setup Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (!isGameOver && !showMilestoneAlert) {
            setIsPaused(p => !p);
            if (!isMuted) playTone('click');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, direction, isGameOver, isPaused, showMilestoneAlert, isMuted]);

  // Spawn Food Logic
  const spawnFood = (currentSnake: Point[]): FoodItem => {
    let newPos: Point = { x: 0, y: 0 };
    let valid = false;

    while (!valid) {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };

      // Check collision with snake
      valid = !currentSnake.some(segment => segment.x === newPos.x && segment.y === newPos.y);
    }

    // Roll crop type
    const roll = Math.random();
    let type: CropType = 'CARROT';
    if (roll < 0.15) {
      type = 'GOLDEN';
    } else if (roll < 0.40) {
      type = 'WHEAT';
    } else if (roll < 0.65) {
      type = 'PUMPKIN';
    }

    return {
      pos: newPos,
      type,
      rotation: 0
    };
  };

  // Init Game
  useEffect(() => {
    if (isOpen) {
      const initialSnake = [
        { x: 7, y: 6 },
        { x: 7, y: 7 },
        { x: 7, y: 8 }
      ];
      setSnake(initialSnake);
      setDirection('UP');
      setNextDirection('UP');
      setFood(spawnFood(initialSnake));
      setScore(0);
      setIsGameOver(false);
      setIsPaused(false);
      setDayNightCycle('DAY');
      setSecondsInPhase(0);
      setGoldenHarvestTime(0);
      setHeavyHarvestTime(0);
      setGrowPending(0);
      setMilestoneShown(false);
      setShowMilestoneAlert(false);
      particlesRef.current = [];
    }
  }, [isOpen]);

  // Restart Handler
  const resetGame = () => {
    const initialSnake = [
      { x: 7, y: 6 },
      { x: 7, y: 7 },
      { x: 7, y: 8 }
    ];
    setSnake(initialSnake);
    setDirection('UP');
    setNextDirection('UP');
    setFood(spawnFood(initialSnake));
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setDayNightCycle('DAY');
    setSecondsInPhase(0);
    setGoldenHarvestTime(0);
    setHeavyHarvestTime(0);
    setGrowPending(0);
    setMilestoneShown(false);
    setShowMilestoneAlert(false);
    particlesRef.current = [];
    if (!isMuted) playTone('click');
  };

  // Day / Night and Effects Timers (Runs on a 1-second interval)
  useEffect(() => {
    if (!isOpen || isGameOver || isPaused || showMilestoneAlert) return;

    const interval = setInterval(() => {
      // Advance seconds in phase
      setSecondsInPhase(prev => {
        const next = prev + 1;
        if (dayNightCycle === 'DAY' && next >= 30) {
          setDayNightCycle('NIGHT');
          return 0;
        } else if (dayNightCycle === 'NIGHT' && next >= 15) {
          setDayNightCycle('DAY');
          return 0;
        }
        return next;
      });

      // Update active buffs
      setGoldenHarvestTime(prev => Math.max(0, prev - 1));
      setHeavyHarvestTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isGameOver, isPaused, dayNightCycle, showMilestoneAlert]);

  // Core Game Loop Physics Tick
  useEffect(() => {
    if (!isOpen || isGameOver || isPaused || showMilestoneAlert) return;

    // Calculate current speed based on Night Cycle and buffs
    let currentSpeed = dayNightCycle === 'NIGHT' ? NIGHT_SPEED : BASE_SPEED;
    if (goldenHarvestTime > 0) {
      currentSpeed = Math.floor(currentSpeed * 1.35); // Slow down for relaxed harvest
    } else if (heavyHarvestTime > 0) {
      currentSpeed = Math.floor(currentSpeed * 0.8); // Speed up for heavy pumpkin load
    }

    const gameTick = setInterval(() => {
      setSnake(prevSnake => {
        // Apply directional change
        setDirection(nextDirection);

        const head = prevSnake[0];
        let newHead: Point = { ...head };

        switch (nextDirection) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }

        // --- Collision Check (Wall or Self) ---
        const hitWall = newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;
        const hitSelf = prevSnake.some((seg, idx) => idx > 0 && seg.x === newHead.x && seg.y === newHead.y);

        if (hitWall || hitSelf) {
          setIsGameOver(true);
          if (!isMuted) playTone('game_over');
          clearInterval(gameTick);
          return prevSnake;
        }

        // --- Eat Food Check ---
        const newSnake = [newHead, ...prevSnake];
        let ateFood = false;

        if (food && newHead.x === food.pos.x && newHead.y === food.pos.y) {
          ateFood = true;

          // Trigger particles
          const canvas = canvasRef.current;
          if (canvas) {
            const cellSize = canvas.width / GRID_SIZE;
            const fx = food.pos.x * cellSize + cellSize / 2;
            const fy = food.pos.y * cellSize + cellSize / 2;

            let color = '#ea580c'; // Carrot orange
            if (food.type === 'PUMPKIN') color = '#f97316';
            else if (food.type === 'WHEAT') color = '#facc15';
            else if (food.type === 'GOLDEN') color = '#fbbf24';

            const newParticles: Particle[] = Array.from({ length: 15 }).map(() => ({
              x: fx,
              y: fy,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              size: Math.random() * 3 + 1.5,
              color,
              alpha: 1,
              life: 0,
              maxLife: Math.floor(Math.random() * 20) + 15
            }));
            particlesRef.current.push(...newParticles);
          }

          // Apply score and crop-specific modifiers
          let points = 1;
          if (food.type === 'CARROT') {
            points = 1;
            if (!isMuted) playTone('eat_carrot');
          } else if (food.type === 'PUMPKIN') {
            points = 3;
            setHeavyHarvestTime(6);
            setGrowPending(prev => prev + 1); // grows 1 more segment on next step
            if (!isMuted) playTone('eat_pumpkin');
          } else if (food.type === 'WHEAT') {
            points = 2;
            setGoldenHarvestTime(8);
            if (!isMuted) playTone('eat_wheat');
          } else if (food.type === 'GOLDEN') {
            points = 5;
            if (!isMuted) playTone('eat_golden');
          }

          // Double points if in golden harvest
          const finalPoints = goldenHarvestTime > 0 ? points * 2 : points;

          setScore(prev => {
            const nextScore = prev + finalPoints;
            // Milestone check (10 harvests)
            if (nextScore >= 10 && !milestoneShown) {
              setMilestoneShown(true);
              setShowMilestoneAlert(true);
              setIsPaused(true);
              if (!isMuted) playTone('milestone');
            }
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('harvest_snake_highscore', nextScore.toString());
            }
            return nextScore;
          });

          setFood(spawnFood(newSnake));
        }

        // Grow segment management
        if (ateFood) {
          // Keep the full array (grew by 1)
          return newSnake;
        } else if (growPending > 0) {
          // Extra growth segment from pumpkin
          setGrowPending(prev => prev - 1);
          return newSnake;
        } else {
          // Pop tail
          newSnake.pop();
          return newSnake;
        }
      });
    }, currentSpeed);

    return () => clearInterval(gameTick);
  }, [isOpen, direction, nextDirection, food, isGameOver, isPaused, dayNightCycle, goldenHarvestTime, heavyHarvestTime, growPending, milestoneShown, showMilestoneAlert, isMuted, highScore]);

  // Smooth 60fps Drawing and Animation Frame Loop
  useEffect(() => {
    let active = true;

    const render = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (!canvas) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      const isDark = theme === 'dark';
      const cellSize = canvas.width / GRID_SIZE;

      // 1. Clear background
      ctx.fillStyle = isDark ? '#0c0c0e' : '#fafafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw organic soil pasture grid lines
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
      }

      // 3. Draw border fences
      ctx.strokeStyle = isDark ? '#27272a' : '#e4e4e7';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

      // 4. Update and Draw Particles
      particlesRef.current = particlesRef.current.map(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
        p.life++;
        return p;
      }).filter(p => p.life < p.maxLife);

      particlesRef.current.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 5. Draw Food with rotation
      if (food) {
        const fx = food.pos.x * cellSize + cellSize / 2;
        const fy = food.pos.y * cellSize + cellSize / 2;

        ctx.save();
        ctx.translate(fx, fy);

        // Continuous smooth rotation over time
        const rotationAngle = (Date.now() / 800) % (Math.PI * 2);
        ctx.rotate(rotationAngle);

        if (food.type === 'CARROT') {
          // Grayscale/high-contrast carrot wedge
          ctx.beginPath();
          ctx.fillStyle = '#ea580c'; // Carrot orange
          ctx.moveTo(-cellSize * 0.15, -cellSize * 0.25);
          ctx.lineTo(cellSize * 0.15, -cellSize * 0.25);
          ctx.lineTo(0, cellSize * 0.35);
          ctx.closePath();
          ctx.fill();

          // Leafy green top
          ctx.beginPath();
          ctx.fillStyle = '#10b981';
          ctx.arc(0, -cellSize * 0.3, cellSize * 0.09, 0, Math.PI * 2);
          ctx.arc(-cellSize * 0.08, -cellSize * 0.32, cellSize * 0.07, 0, Math.PI * 2);
          ctx.arc(cellSize * 0.08, -cellSize * 0.32, cellSize * 0.07, 0, Math.PI * 2);
          ctx.fill();
        } else if (food.type === 'PUMPKIN') {
          // Thick round ribbed pumpkin
          ctx.beginPath();
          ctx.fillStyle = '#f97316'; // Pumpkin orange
          ctx.ellipse(0, cellSize * 0.03, cellSize * 0.28, cellSize * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();

          // Rib grooves for vintage etching
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(0, cellSize * 0.03, cellSize * 0.14, cellSize * 0.22, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Curly green stem
          ctx.beginPath();
          ctx.strokeStyle = '#047857';
          ctx.lineWidth = 2.5;
          ctx.moveTo(0, -cellSize * 0.12);
          ctx.quadraticCurveTo(cellSize * 0.08, -cellSize * 0.24, cellSize * 0.14, -cellSize * 0.2);
          ctx.stroke();
        } else if (food.type === 'WHEAT') {
          // Stalk of grain
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, cellSize * 0.25);
          ctx.lineTo(0, -cellSize * 0.25);
          ctx.stroke();

          ctx.fillStyle = '#facc15';
          for (let i = 0; i < 4; i++) {
            const yOffset = -cellSize * 0.15 + i * cellSize * 0.09;
            ctx.beginPath();
            ctx.ellipse(-cellSize * 0.09, yOffset, cellSize * 0.05, cellSize * 0.03, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cellSize * 0.09, yOffset, cellSize * 0.05, cellSize * 0.03, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (food.type === 'GOLDEN') {
          // Magical glowing crop
          ctx.beginPath();
          ctx.fillStyle = '#fbbf24'; // Amber yellow
          ctx.arc(0, cellSize * 0.04, cellSize * 0.24, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-cellSize * 0.09, cellSize * 0.22);
          ctx.lineTo(cellSize * 0.09, cellSize * 0.22);
          ctx.lineTo(0, cellSize * 0.42);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = '#34d399';
          ctx.ellipse(0, -cellSize * 0.18, cellSize * 0.07, cellSize * 0.16, 0, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle halo
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, cellSize * 0.4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6. Draw Growing Trail Soil segments
      for (let i = snake.length - 1; i > 0; i--) {
        const seg = snake[i];
        const segX = seg.x * cellSize + cellSize / 2;
        const segY = seg.y * cellSize + cellSize / 2;

        // Base tilled earth grid cell
        ctx.fillStyle = isDark ? '#1a1a1e' : '#e4e4e7';
        ctx.strokeStyle = isDark ? '#27272a' : '#d4d4d8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(seg.x * cellSize + 2, seg.y * cellSize + 2, cellSize - 4, cellSize - 4);
        ctx.fill();
        ctx.stroke();

        // Shading lines (woodcut texture)
        ctx.strokeStyle = isDark ? '#0c0c0e' : '#a1a1aa';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(seg.x * cellSize + 4, seg.y * cellSize + cellSize * 0.4);
        ctx.lineTo(seg.x * cellSize + cellSize - 4, seg.y * cellSize + cellSize * 0.4);
        ctx.moveTo(seg.x * cellSize + 5, seg.y * cellSize + cellSize * 0.7);
        ctx.lineTo(seg.x * cellSize + cellSize - 5, seg.y * cellSize + cellSize * 0.7);
        ctx.stroke();

        // Charming sprout growth details
        // Tail is tiny sprouts, head segments have mature crops!
        const progress = (snake.length - i) / snake.length; // 0 (tail) to 1 (near head)
        const sproutSize = cellSize * 0.08 + progress * cellSize * 0.22;

        ctx.fillStyle = '#10b981'; // Fresh green
        ctx.beginPath();
        // Leaves curving out
        ctx.ellipse(segX - sproutSize * 0.38, segY - cellSize * 0.1, sproutSize * 0.55, sproutSize * 0.28, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(segX + sproutSize * 0.38, segY - cellSize * 0.1, sproutSize * 0.55, sproutSize * 0.28, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(segX, segY + cellSize * 0.12);
        ctx.quadraticCurveTo(segX, segY - cellSize * 0.08, segX + sproutSize * 0.08, segY - cellSize * 0.13);
        ctx.stroke();
      }

      // 7. Draw Farmer Character Snake Head
      if (snake.length > 0) {
        const head = snake[0];
        const hx = head.x * cellSize + cellSize / 2;
        const hy = head.y * cellSize + cellSize / 2;

        ctx.save();
        ctx.translate(hx, hy);

        let angle = 0;
        if (direction === 'DOWN') angle = Math.PI;
        if (direction === 'LEFT') angle = -Math.PI / 2;
        if (direction === 'RIGHT') angle = Math.PI / 2;
        ctx.rotate(angle);

        // Blushing pink farmer head
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(0, 0, cellSize * 0.34, 0, Math.PI * 2);
        ctx.fill();

        // Tiny black bead eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-cellSize * 0.11, -cellSize * 0.05, cellSize * 0.045, 0, Math.PI * 2);
        ctx.arc(cellSize * 0.11, -cellSize * 0.05, cellSize * 0.045, 0, Math.PI * 2);
        ctx.fill();

        // Soft blush cheeks
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(-cellSize * 0.2, cellSize * 0.06, cellSize * 0.035, 0, Math.PI * 2);
        ctx.arc(cellSize * 0.2, cellSize * 0.06, cellSize * 0.035, 0, Math.PI * 2);
        ctx.fill();

        // Cute flat straw sun-hat
        // Hat brim
        ctx.fillStyle = '#d97706'; // Wheat yellow
        ctx.beginPath();
        ctx.ellipse(0, -cellSize * 0.06, cellSize * 0.48, cellSize * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hat crown
        ctx.beginPath();
        ctx.rect(-cellSize * 0.22, -cellSize * 0.35, cellSize * 0.44, cellSize * 0.3);
        ctx.fill();

        // Red hat ribbon
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.rect(-cellSize * 0.22, -cellSize * 0.13, cellSize * 0.44, cellSize * 0.06);
        ctx.fill();

        ctx.restore();
      }

      // 8. Draw Day/Night Ambient overlay (gives rich sunset/evening tint)
      if (dayNightCycle === 'NIGHT') {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 10, 36, 0.4)'; // soft twilight blue
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Little dynamic stars twinkling in the pasture background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 12; i++) {
          const starX = (Math.sin(i * 12.34) * 0.5 + 0.5) * canvas.width;
          const starY = (Math.cos(i * 56.78) * 0.5 + 0.5) * canvas.height;
          const tw = (Math.sin(Date.now() / 250 + i * 2) * 0.4 + 0.6) * 1.5;
          ctx.beginPath();
          ctx.arc(starX, starY, tw, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 9. Draw overlay for Golden Harvest state
      if (goldenHarvestTime > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
        ctx.restore();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => {
      active = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [snake, direction, food, dayNightCycle, goldenHarvestTime, theme]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card Container */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className={`w-full max-w-lg rounded-2xl border flex flex-col overflow-hidden shadow-2xl relative z-10 p-6 md:p-8 select-none ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-900 text-zinc-100'
              }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/40">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">Harvest Snake</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 hover:opacity-80 transition-opacity cursor-pointer text-zinc-500 hover:text-zinc-300"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:opacity-80 transition-opacity cursor-pointer text-zinc-500 hover:text-zinc-300"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scoreboard and Status Info */}
            <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/60 mb-4 text-xs font-sans">
              <div className="flex gap-4">
                <div>
                  <span className="text-zinc-400 mr-1">Score:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{score}</span>
                  {goldenHarvestTime > 0 && <span className="text-[10px] text-amber-500 font-bold ml-1.5 bg-amber-500/10 px-1 rounded">2x</span>}
                </div>
                <div>
                  <span className="text-zinc-400 mr-1">Best:</span>
                  <span className="font-semibold text-zinc-600 dark:text-zinc-300">{highScore}</span>
                </div>
              </div>

              {/* Day / Night state panel */}
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${dayNightCycle === 'DAY' ? 'bg-amber-500' : 'bg-indigo-500 animate-pulse'}`} />
                <span>{dayNightCycle === 'DAY' ? 'Day' : 'Night'}</span>
              </div>
            </div>

            {/* Buff Overlays */}
            <AnimatePresence>
              {(goldenHarvestTime > 0 || heavyHarvestTime > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap gap-2 mb-3 text-[10px] font-sans font-medium"
                >
                  {goldenHarvestTime > 0 && (
                    <span className="bg-amber-500/5 text-amber-500 border border-amber-500/10 px-2.5 py-0.5 rounded-md animate-pulse">
                      Double points ({goldenHarvestTime}s)
                    </span>
                  )}
                  {heavyHarvestTime > 0 && (
                    <span className="bg-orange-500/5 text-orange-500 border border-orange-500/10 px-2.5 py-0.5 rounded-md">
                      Heavy payload ({heavyHarvestTime}s)
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Game Canvas viewport */}
            <div className="relative w-full aspect-square border border-zinc-800 bg-[#0c0c0e] rounded-xl overflow-hidden mb-5 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full h-full block cursor-none"
              />

              {/* Positional Halftone Filter layer on top of Canvas */}
              <div className="absolute inset-0 pointer-events-none z-10" style={{ mixBlendMode: 'multiply' }}>
                {/* Fine dots overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.92)_1.1px,transparent_1.4px)] [background-size:3.5px_3.5px] opacity-75 dark:opacity-85 mix-blend-multiply" />
                {/* Coarse offset dots overlay for newsprint paper depth */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.5)_1.5px,transparent_1.9px)] [background-size:6px_6px] [background-position:1.5px_1.5px] opacity-40 mix-blend-multiply" />
              </div>

              {/* Game Over Panel overlay */}
              <AnimatePresence>
                {isGameOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-20 font-sans"
                  >
                    <h3 className="text-base font-bold uppercase tracking-[0.2em] text-red-500 mb-2">Game Over</h3>
                    <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
                      Try again to beat your best score.
                    </p>
                    <div className="text-sm text-zinc-200 mb-6">
                      Score: <span className="font-semibold text-emerald-400">{score}</span>
                    </div>
                    <button
                      onClick={resetGame}
                      className="px-6 py-2.5 bg-white text-black font-bold uppercase tracking-[0.15em] text-[10px] rounded-md hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
                    >
                      <RotateCcw size={12} /> Restart
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Paused Panel overlay */}
              <AnimatePresence>
                {isPaused && !isGameOver && !showMilestoneAlert && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center z-20 font-sans"
                  >
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-200 mb-2">Game Paused</h3>
                    <p className="text-xs text-zinc-400 mb-6">
                      Press Space to resume
                    </p>
                    <button
                      onClick={() => setIsPaused(false)}
                      className="px-5 py-2 bg-white text-black font-bold uppercase tracking-[0.15em] text-[10px] rounded-md transition-all cursor-pointer shadow-lg"
                    >
                      Resume
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Milestone Celebration popup */}
              <AnimatePresence>
                {showMilestoneAlert && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="absolute inset-4 bg-zinc-950/95 border border-zinc-800 rounded-xl flex flex-col items-center justify-center p-5 text-center z-30 font-sans"
                  >
                    <Trophy size={36} className="text-yellow-400 mb-3 animate-pulse" />
                    <h3 className="text-xs uppercase tracking-[0.3em] font-black text-yellow-400 mb-1">
                      Milestone
                    </h3>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
                      Level Unlocked
                    </h4>
                    <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed mb-4">
                      You have harvested 10 crops. Explore a featured creation:
                    </p>

                    {/* Featured Portfolio link embedded directly in the game play */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 w-full max-w-sm mb-4 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-400">Featured App</span>
                        <a
                          href="#projects"
                          onClick={() => {
                            onClose();
                            setTimeout(() => {
                              const el = document.getElementById('projects');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }, 300);
                          }}
                          className="text-[9px] text-zinc-500 hover:text-white flex items-center gap-1 font-bold underline"
                        >
                          View Work <ExternalLink size={10} />
                        </a>
                      </div>
                      <h5 className="text-xs font-bold uppercase text-white mt-1.5 mb-1">Social Website (Privy)</h5>
                      <p className="text-[9px] text-zinc-400 line-clamp-2">
                        A modern digital community platform that lets users interact, share moments, and post music recommendations seamlessly.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowMilestoneAlert(false);
                        setIsPaused(false);
                        if (!isMuted) playTone('click');
                      }}
                      className="w-full max-w-xs py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-wider text-[10px] rounded transition-colors cursor-pointer"
                    >
                      Resume Game
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Touch Controller - rendered on screen when modal is open */}
            <div className="flex flex-col items-center justify-center gap-1.5 md:hidden mb-2">
              <button
                onClick={() => changeDirection('UP')}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border text-zinc-400 active:bg-zinc-800 active:text-white active:scale-95 transition-all ${theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                  }`}
              >
                <ArrowUp size={16} />
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => changeDirection('LEFT')}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg border text-zinc-400 active:bg-zinc-800 active:text-white active:scale-95 transition-all ${theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                    }`}
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="w-12 h-12" /> {/* Spacer */}
                <button
                  onClick={() => changeDirection('RIGHT')}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg border text-zinc-400 active:bg-zinc-800 active:text-white active:scale-95 transition-all ${theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                    }`}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              <button
                onClick={() => changeDirection('DOWN')}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border text-zinc-400 active:bg-zinc-800 active:text-white active:scale-95 transition-all ${theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                  }`}
              >
                <ArrowDown size={16} />
              </button>
            </div>

            {/* Subtext Instructions */}
            <div className="text-center font-sans text-[10px] text-zinc-500">
              <span className="hidden md:inline">Arrow Keys or WASD to move &bull; Space to pause</span>
              <span className="md:hidden">Use the directional buttons to move</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
