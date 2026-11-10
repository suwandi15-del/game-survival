import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PostData, Question, QuestionOption } from '../../types';
import { soundManager } from '../../sound';
import { 
  ArrowLeft, 
  Pause, 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Coins, 
  Sparkles, 
  AlertCircle, 
  Flame,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface GameCanvasProps {
  post: PostData;
  initialQuestionIndex?: number;
  onQuestionAnsweredCorrectly: (points: number, coins: number) => void;
  onPostCompleted: () => void;
  onExitToMap: () => void;
  currentScore: number;
  currentCoins: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

interface TargetItem {
  id: string;
  label: string;
  isCorrect: boolean;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  scale: number;
  initialY: number;
  bobPhase: number;
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
}

// Utility to shuffle an array randomly
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  post,
  initialQuestionIndex = 0,
  onQuestionAnsweredCorrectly,
  onPostCompleted,
  onExitToMap,
  currentScore,
  currentCoins,
  isMuted,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // If initialQuestionIndex was already >= 5 (replaying a finished post), restart from question 0 (1/5)
  const safeStartIndex = initialQuestionIndex >= 5 ? 0 : initialQuestionIndex;

  // Game state
  const [questionIndex, setQuestionIndex] = useState(safeStartIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [showWrongModal, setShowWrongModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [showPostCompletedModal, setShowPostCompletedModal] = useState(false);
  const [attemptsThisQuestion, setAttemptsThisQuestion] = useState(0);

  const currentQuestion: Question = post.questions[questionIndex] || post.questions[0];

  // Shuffled options for the active question (randomized order so answer is never in same slot)
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>(() => {
    return shuffleArray(post.questions[safeStartIndex]?.options || []);
  });

  // Game internal variables in refs to avoid re-triggering React renders
  const playerRef = useRef({
    x: 90,
    y: 200,
    vx: 0,
    vy: 0,
    targetY: 200,
    groundY: 340,
    isJumping: false,
    jumpCount: 0,
    angle: 0,
    turboTimer: 0,
    width: 48,
    height: 38,
  });

  const keysHeld = useRef<{ [key: string]: boolean }>({});
  const targetsRef = useRef<TargetItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const bgOffsetRef = useRef(0);
  const frameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const cameraShakeRef = useRef(0);
  const isTransitioningRef = useRef(false);

  // Dedicated jump trigger function (Mario-style physics)
  const triggerJump = useCallback(() => {
    const p = playerRef.current;
    if (post.id === 3) {
      // Allow jump from ground OR platform, or double-jump
      if (!p.isJumping || (p.jumpCount || 0) < 2) {
        p.vy = -560; // Strong, immediate upward impulse in pixels/second
        p.isJumping = true;
        p.jumpCount = (p.jumpCount || 0) + 1;
        soundManager.playJump();

        // Small dust burst particles at character feet
        for (let i = 0; i < 6; i++) {
          particlesRef.current.push({
            x: p.x + p.width / 2 + (Math.random() - 0.5) * 16,
            y: p.y + p.height,
            vx: (Math.random() - 0.5) * 60,
            vy: Math.random() * -30 - 20,
            size: 3 + Math.random() * 3,
            color: '#e2e8f0',
            alpha: 0.8,
            life: 0.35,
          });
        }
      }
    } else {
      // Turbo burst for other vehicle games
      p.turboTimer = 1.0;
      soundManager.playThrust();
    }
  }, [post.id]);

  // Core generator for target items given options and viewport size
  const createTargetsForOptions = useCallback(
    (options: QuestionOption[], canvasWidth: number, canvasHeight: number) => {
      const count = options.length;
      const targets: TargetItem[] = [];
      const colors = ['#0284c7', '#ea580c', '#16a34a', '#9333ea'];

      if (post.id === 1) {
        // Sky Pilot: Gates floating from right to left at randomized altitudes and varied X
        const verticalSlots = shuffleArray([1, 2, 3, 4].slice(0, count));
        options.forEach((opt, idx) => {
          const slot = verticalSlots[idx] || (idx + 1);
          const spacing = (canvasHeight - 140) / (count + 1);
          const y = 80 + slot * spacing + (Math.random() - 0.5) * 20;
          const x = canvasWidth * 0.68 + (idx * 35) + Math.random() * 50;
          targets.push({
            id: opt.id,
            label: opt.label,
            isCorrect: opt.isCorrect,
            x,
            y,
            radius: 34,
            vx: -0.45 - Math.random() * 0.2,
            vy: (idx % 2 === 0 ? 0.35 : -0.35),
            color: colors[idx % colors.length],
            scale: 1,
            initialY: y,
            bobPhase: Math.random() * Math.PI * 2,
          });
        });
      } else if (post.id === 2) {
        // Gear Racing: Roadway checkpoint lanes, randomized lane assignment
        const laneIndices = shuffleArray([0, 1, 2, 3].slice(0, count));
        options.forEach((opt, idx) => {
          const laneIdx = laneIndices[idx];
          const laneY = 100 + (laneIdx * (canvasHeight - 180)) / (count - 1 || 1);
          const laneX = canvasWidth * 0.75 + (idx % 2 === 0 ? 0 : 50) + Math.random() * 30;
          targets.push({
            id: opt.id,
            label: opt.label,
            isCorrect: opt.isCorrect,
            x: laneX,
            y: laneY,
            radius: 35,
            vx: -0.65 - Math.random() * 0.15,
            vy: 0,
            color: colors[idx % colors.length],
            scale: 1,
            initialY: laneY,
            bobPhase: 0,
          });
        });
      } else if (post.id === 3) {
        // Power Tower: 4 mystery blocks '?' placed at randomized heights and columns
        const blockPositions = shuffleArray([
          { x: canvasWidth * 0.22, y: canvasHeight * 0.42 },
          { x: canvasWidth * 0.45, y: canvasHeight * 0.24 },
          { x: canvasWidth * 0.68, y: canvasHeight * 0.38 },
          { x: canvasWidth * 0.86, y: canvasHeight * 0.20 },
        ]);
        options.forEach((opt, idx) => {
          const pos = blockPositions[idx] || { x: 140 + idx * 80, y: 120 };
          targets.push({
            id: opt.id,
            label: opt.label,
            isCorrect: opt.isCorrect,
            x: pos.x,
            y: pos.y,
            radius: 36,
            vx: 0,
            vy: 0.3 * (idx % 2 === 0 ? 1 : -1),
            color: '#f97316',
            scale: 1,
            initialY: pos.y,
            bobPhase: Math.random() * Math.PI * 2,
          });
        });
      } else if (post.id === 4) {
        // Space Rocket: Cosmic warp portals orbiting with randomized initial angle
        const baseAngle = Math.random() * Math.PI * 2;
        options.forEach((opt, idx) => {
          const angle = baseAngle + (idx / count) * Math.PI * 2;
          const cx = canvasWidth * 0.72;
          const cy = canvasHeight * 0.5;
          const r = Math.min(canvasHeight * 0.35, 120) + (idx % 2 === 0 ? 15 : -15);
          targets.push({
            id: opt.id,
            label: opt.label,
            isCorrect: opt.isCorrect,
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
            radius: 36,
            vx: -0.3,
            vy: Math.sin(idx) * 0.4,
            color: colors[idx % colors.length],
            scale: 1,
            initialY: cy,
            bobPhase: angle,
          });
        });
      } else if (post.id === 5) {
        // Underwater Submarine: Treasure chests with randomized depths and positions
        const depths = shuffleArray([
          canvasHeight * 0.28,
          canvasHeight * 0.45,
          canvasHeight * 0.62,
          canvasHeight * 0.76,
        ]);
        const xPositions = shuffleArray([
          canvasWidth * 0.25,
          canvasWidth * 0.46,
          canvasWidth * 0.68,
          canvasWidth * 0.88,
        ]);
        options.forEach((opt, idx) => {
          const x = xPositions[idx];
          const y = depths[idx];
          targets.push({
            id: opt.id,
            label: opt.label,
            isCorrect: opt.isCorrect,
            x,
            y,
            radius: 36,
            vx: Math.cos(idx) * 0.25,
            vy: Math.sin(idx) * 0.35,
            color: '#0284c7',
            scale: 1,
            initialY: y,
            bobPhase: Math.random() * Math.PI * 2,
          });
        });
      } else {
        // Final Arena: Guardian Robot Core Shields rotating with randomized start phase
        const startPhase = Math.random() * Math.PI * 2;
        options.forEach((opt, idx) => {
          const angle = startPhase + (idx / count) * Math.PI * 2;
          const cx = canvasWidth * 0.76;
          const cy = canvasHeight * 0.52;
          const r = 90;
          targets.push({
            id: opt.id,
            label: opt.label,
            isCorrect: opt.isCorrect,
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
            radius: 36,
            vx: 0,
            vy: 0,
            color: colors[idx % colors.length],
            scale: 1,
            initialY: cy,
            bobPhase: angle,
          });
        });
      }

      return targets;
    },
    [post.id]
  );

  // Setup a specific question index cleanly, generating fresh targets and resetting player
  const setupQuestion = useCallback(
    (newQuestionIdx: number) => {
      const q = post.questions[newQuestionIdx];
      if (!q) return;

      const freshShuffled = shuffleArray(q.options);
      setShuffledOptions(freshShuffled);

      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        targetsRef.current = createTargetsForOptions(freshShuffled, rect.width, rect.height);
      }

      // Reset player position safely
      playerRef.current.x = 80;
      playerRef.current.y = 200;
      playerRef.current.vx = 0;
      playerRef.current.vy = 0;
      playerRef.current.isJumping = false;
      playerRef.current.jumpCount = 0;
      isTransitioningRef.current = false;
    },
    [post.questions, createTargetsForOptions]
  );

  // Spawn celebration particles
  const spawnCelebrationParticles = (x: number, y: number) => {
    const pColors = ['#f59e0b', '#10b981', '#38bdf8', '#ec4899', '#fbbf24', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: pColors[Math.floor(Math.random() * pColors.length)],
        alpha: 1,
        life: 0.8 + Math.random() * 0.5,
      });
    }
  };

  // Trigger correct answer flow - STRICT 5-QUESTION REQUIREMENT!
  const handleCorrectAnswer = (target: TargetItem) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    soundManager.playCorrect();
    soundManager.playCoin();
    playerRef.current.turboTimer = 1.2;
    spawnCelebrationParticles(target.x, target.y);

    const cheers = ['Hebat!', 'Luar biasa!', 'Jawaban tepat!', 'Kamu semakin tangguh!', 'Satu tantangan berhasil!'];
    const randomCheer = cheers[Math.floor(Math.random() * cheers.length)];
    setShowSuccessToast(`${randomCheer} Soal ${questionIndex + 1}/5 Tuntas!`);

    // Award score and coins
    onQuestionAnsweredCorrectly(1000, 1);

    setTimeout(() => {
      setShowSuccessToast(null);

      // Check if this was the 5th and final question of the post!
      if (questionIndex + 1 >= 5) {
        soundManager.playVictory();
        setShowPostCompletedModal(true);
      } else {
        // Move to the next question (Question 2, 3, 4, 5)
        const nextIdx = questionIndex + 1;
        setQuestionIndex(nextIdx);
        setAttemptsThisQuestion(0);
        setupQuestion(nextIdx);
      }
    }, 1400);
  };

  // Trigger wrong answer flow
  const handleWrongAnswer = (target: TargetItem) => {
    soundManager.playWrong();
    cameraShakeRef.current = 15;
    setAttemptsThisQuestion((prev) => prev + 1);

    // Knock back player
    playerRef.current.x = Math.max(50, playerRef.current.x - 70);
    playerRef.current.vx = -4;

    // Small smoke puff
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x: target.x,
        y: target.y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 5 + Math.random() * 4,
        color: '#94a3b8',
        alpha: 0.8,
        life: 0.5,
      });
    }

    setIsPaused(true);
    setShowWrongModal(true);
  };

  // Manual Target Touch/Click fallback
  const handleTargetClick = (target: TargetItem) => {
    if (isPaused || showWrongModal || isTransitioningRef.current) return;
    if (target.isCorrect) {
      handleCorrectAnswer(target);
    } else {
      handleWrongAnswer(target);
    }
  };

  // Setup Key listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }
      keysHeld.current[e.key] = true;
      keysHeld.current[e.code] = true;

      // Jump triggers in Pos 3: Spacebar, ArrowUp, or W
      if (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp' || e.code === 'KeyW') {
        if (post.id === 3) {
          e.preventDefault();
          triggerJump();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeld.current[e.key] = false;
      keysHeld.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [post.id, triggerJump]);

  // Main Canvas Setup and Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res canvas size based on client container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      targetsRef.current = createTargetsForOptions(shuffledOptions, rect.width, rect.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    lastTimeRef.current = performance.now();

    const loop = (timestamp: number) => {
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const dt = Math.min(rawDt, 0.05);

      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      if (!isPaused && !showWrongModal && !showPostCompletedModal && !showExitConfirm) {
        bgOffsetRef.current += (playerRef.current.turboTimer > 0 ? 160 : 70) * dt;

        // Camera shake decay
        if (cameraShakeRef.current > 0) {
          cameraShakeRef.current = Math.max(0, cameraShakeRef.current - 40 * dt);
        }

        // Turbo timer decay
        if (playerRef.current.turboTimer > 0) {
          playerRef.current.turboTimer = Math.max(0, playerRef.current.turboTimer - dt);
        }

        // PLAYER MOVEMENT & PHYSICS
        const p = playerRef.current;
        const keys = keysHeld.current;
        const speed = p.turboTimer > 0 ? 320 : 200;

        if (post.id === 3) {
          // Platformer Power Tower: horizontal walking + vertical gravity + platform landing
          if (keys['ArrowLeft'] || keys['KeyA']) p.x -= speed * dt;
          if (keys['ArrowRight'] || keys['KeyD']) p.x += speed * dt;

          // Apply Gravity (in pixels/sec²)
          const GRAVITY = 1100;
          p.vy += GRAVITY * dt;
          p.y += p.vy * dt;

          // Defined walkable platforms
          const groundY = H - 65;
          const platforms = [
            { x: W * 0.12, y: H * 0.68, w: 100, h: 14 },
            { x: W * 0.40, y: H * 0.52, w: 110, h: 14 },
            { x: W * 0.70, y: H * 0.64, w: 100, h: 14 },
            { x: W * 0.25, y: H * 0.35, w: 100, h: 14 },
            { x: W * 0.60, y: H * 0.32, w: 110, h: 14 },
          ];

          let onPlatform = false;
          // Check landing on platforms when moving downward
          if (p.vy >= 0) {
            for (const plat of platforms) {
              const pFeet = p.y + p.height;
              const prevFeet = pFeet - p.vy * dt;
              const pCenterX = p.x + p.width / 2;
              if (
                pCenterX >= plat.x - 8 &&
                pCenterX <= plat.x + plat.w + 8 &&
                prevFeet <= plat.y + 12 &&
                pFeet >= plat.y
              ) {
                p.y = plat.y - p.height;
                p.vy = 0;
                p.isJumping = false;
                p.jumpCount = 0;
                onPlatform = true;
                break;
              }
            }
          }

          // Check landing on ground
          if (!onPlatform && p.y + p.height >= groundY) {
            p.y = groundY - p.height;
            p.vy = 0;
            p.isJumping = false;
            p.jumpCount = 0;
          }
        } else if (post.id === 2) {
          // Motorcycle Gear Racing: predominantly up/down/left/right on highway
          if (keys['ArrowUp'] || keys['KeyW']) p.y -= speed * dt;
          if (keys['ArrowDown'] || keys['KeyS']) p.y += speed * dt;
          if (keys['ArrowLeft'] || keys['KeyA']) p.x -= speed * dt;
          if (keys['ArrowRight'] || keys['KeyD']) p.x += speed * dt;
        } else {
          // Sky Pilot, Space Rocket, Submarine, Final Arena: 4-way omnidirectional
          if (keys['ArrowUp'] || keys['KeyW']) p.y -= speed * dt;
          if (keys['ArrowDown'] || keys['KeyS']) p.y += speed * dt;
          if (keys['ArrowLeft'] || keys['KeyA']) p.x -= speed * dt;
          if (keys['ArrowRight'] || keys['KeyD']) p.x += speed * dt;
        }

        // Boundary Clamp
        p.x = Math.max(30, Math.min(W - 60, p.x));
        p.y = Math.max(40, Math.min(H - 60, p.y));

        // TARGETS UPDATE & COLLISION CHECK
        targetsRef.current.forEach((t, idx) => {
          t.x += t.vx * 60 * dt;
          t.y += t.vy * 60 * dt;

          // Boundary bouncing and wrap-around
          if (post.id === 1) {
            if (t.x < 80) {
              t.x = W + 40;
              t.y = 80 + Math.random() * (H - 160);
            }
            if (t.y < 70 || t.y > H - 70) t.vy *= -1;
          } else if (post.id === 4) {
            // Space orbit
            const angle = timestamp * 0.001 + (t.bobPhase || idx);
            t.x = W * 0.72 + Math.cos(angle) * 110;
            t.y = H * 0.52 + Math.sin(angle) * 90;
          } else if (post.id === 6) {
            // Final Arena robot shield orbit
            const angle = timestamp * 0.0012 + (t.bobPhase || idx);
            t.x = W * 0.76 + Math.cos(angle) * 85;
            t.y = H * 0.52 + Math.sin(angle) * 85;
          } else if (post.id === 3) {
            // Power Tower mystery blocks gently bob up and down
            t.y = t.initialY + Math.sin(timestamp * 0.004 + idx) * 14;
          } else {
            if (t.y < 80 || t.y > H - 80) t.vy *= -1;
            if (t.x < 120 || t.x > W - 60) t.vx *= -1;
          }

          // Collision Check with Player Hitbox (strictly disabled during transitions)
          const dx = (p.x + p.width / 2) - t.x;
          const dy = (p.y + p.height / 2) - t.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < t.radius + 22 && !showSuccessToast && !isTransitioningRef.current) {
            if (t.isCorrect) {
              handleCorrectAnswer(t);
            } else {
              handleWrongAnswer(t);
            }
          }
        });

        // UPDATE PARTICLES
        particlesRef.current.forEach((pt) => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= dt / pt.life;
        });
        particlesRef.current = particlesRef.current.filter((pt) => pt.alpha > 0);
      }

      // RENDERING SECTION
      ctx.save();

      // Camera Shake
      if (cameraShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * cameraShakeRef.current;
        const shakeY = (Math.random() - 0.5) * cameraShakeRef.current;
        ctx.translate(shakeX, shakeY);
      }

      ctx.clearRect(0, 0, W, H);

      // 1. DRAW DOMAIN-SPECIFIC CHEERFUL BACKGROUND
      drawGameBackground(ctx, post.id, W, H, bgOffsetRef.current);

      // 2. DRAW TARGET ITEMS (Floating Gates / Blocks / Portals / Chests)
      drawTargets(ctx, post.id, targetsRef.current, timestamp);

      // 3. DRAW PARTICLES
      particlesRef.current.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 4. DRAW PLAYER VEHICLE / CHARACTER
      drawPlayer(ctx, post.id, playerRef.current, timestamp);

      ctx.restore();

      frameIdRef.current = requestAnimationFrame(loop);
    };

    frameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [post.id, isPaused, showWrongModal, showPostCompletedModal, showExitConfirm, createTargetsForOptions, shuffledOptions, showSuccessToast]);

  // Virtual Mobile Controls handler
  const handleVirtualControl = (key: string, isDown: boolean) => {
    keysHeld.current[key] = isDown;
    if (isDown) {
      if (key === 'ArrowUp' && post.id === 3) {
        triggerJump();
      } else if (key === 'Space') {
        triggerJump();
      } else {
        soundManager.playThrust();
      }
    }
  };

  // Safe Exit To Map with confirmation if 5 questions are not done
  const handleExitClick = () => {
    soundManager.playClick();
    if (questionIndex < 4) {
      setShowExitConfirm(true);
    } else {
      onExitToMap();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans select-none overflow-hidden relative">
      {/* TOP HUD: QUESTION & STATS BANNER */}
      <header className="relative z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-700 px-3 sm:px-4 py-2 sm:py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Exit button & Pos indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExitClick}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 border border-slate-700 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Peta</span>
            </button>

            <div className="bg-indigo-600/30 border border-indigo-500/50 px-2.5 py-1 rounded-xl">
              <span className="text-[11px] font-black text-indigo-400 uppercase tracking-wider block">
                POS {post.id} · {post.gameName}
              </span>
            </div>
          </div>

          {/* Center: Strict 5-Question Counter Progress */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-300">Tantangan:</span>
              <span className="text-xs font-black text-amber-400 tabular-nums">
                {questionIndex + 1} / 5
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">(Harus 5/5)</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-xl text-amber-300 text-xs font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentCoins}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-emerald-300 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentScore.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Right: Pause & Mute buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleMute();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700 cursor-pointer"
              title="Suara"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setIsPaused((p) => !p);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700 cursor-pointer"
              title="Jeda Permainan"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ACTIVE QUESTION BANNER (CLEAR, BIG, NO ^ SYMBOL, CHEERFUL) */}
        <div className="max-w-4xl mx-auto mt-2 bg-gradient-to-r from-indigo-900/90 via-slate-800/90 to-purple-900/90 border-2 border-amber-400/80 rounded-2xl p-2.5 sm:p-3 shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>TANTANGAN {questionIndex + 1} DARI 5 · TABRAK JAWABAN YANG BENAR!</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-200 border border-indigo-700">
              {currentQuestion.difficulty}
            </span>
          </div>

          <p className="text-sm sm:text-base md:text-lg font-black text-white tracking-wide">
            {currentQuestion.text}
          </p>

          {currentQuestion.context && (
            <p className="text-[11px] font-semibold text-amber-200 mt-0.5 opacity-90 truncate">
              {currentQuestion.context}
            </p>
          )}
        </div>
      </header>

      {/* MAIN GAME VIEWPORT (CANVAS) */}
      <div className="relative flex-1 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair touch-none"
        />

        {/* Celebratory Success Toast Banner */}
        {showSuccessToast && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white font-black text-base sm:text-xl px-6 py-2.5 rounded-full shadow-2xl border-2 border-white animate-bounce flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
            <span>{showSuccessToast}</span>
          </div>
        )}

        {/* RANDOMIZED QUICK-TAP ROW (SYNCS WITH SHUFFLED OPTIONS) */}
        <div className="absolute top-2 left-2 right-2 pointer-events-none flex justify-center flex-wrap gap-2 z-20">
          {shuffledOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                const target = targetsRef.current.find((t) => t.id === opt.id);
                if (target) handleTargetClick(target);
              }}
              className="pointer-events-auto bg-slate-900/80 hover:bg-indigo-600 backdrop-blur-md text-amber-300 hover:text-white px-2.5 py-1 rounded-xl text-xs font-mono font-black border border-white/20 shadow-md transition active:scale-95"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* VIRTUAL CONTROLS FOR MOBILE (LOW OCCLUSION TOUCH BUTTONS) */}
        <div className="absolute bottom-3 left-3 z-30 flex flex-col items-center gap-1 select-none pointer-events-auto">
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              handleVirtualControl('ArrowUp', true);
            }}
            onTouchEnd={() => handleVirtualControl('ArrowUp', false)}
            onMouseDown={() => handleVirtualControl('ArrowUp', true)}
            onMouseUp={() => handleVirtualControl('ArrowUp', false)}
            onClick={() => {
              if (post.id === 3) triggerJump();
            }}
            className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 text-white font-black flex items-center justify-center active:bg-white/50 text-lg shadow-lg cursor-pointer"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                handleVirtualControl('ArrowLeft', true);
              }}
              onTouchEnd={() => handleVirtualControl('ArrowLeft', false)}
              onMouseDown={() => handleVirtualControl('ArrowLeft', true)}
              onMouseUp={() => handleVirtualControl('ArrowLeft', false)}
              className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 text-white font-black flex items-center justify-center active:bg-white/50 text-lg shadow-lg cursor-pointer"
            >
              ◀
            </button>
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                handleVirtualControl('ArrowDown', true);
              }}
              onTouchEnd={() => handleVirtualControl('ArrowDown', false)}
              onMouseDown={() => handleVirtualControl('ArrowDown', true)}
              onMouseUp={() => handleVirtualControl('ArrowDown', false)}
              className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 text-white font-black flex items-center justify-center active:bg-white/50 text-lg shadow-lg cursor-pointer"
            >
              ▼
            </button>
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                handleVirtualControl('ArrowRight', true);
              }}
              onTouchEnd={() => handleVirtualControl('ArrowRight', false)}
              onMouseDown={() => handleVirtualControl('ArrowRight', true)}
              onMouseUp={() => handleVirtualControl('ArrowRight', false)}
              className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 text-white font-black flex items-center justify-center active:bg-white/50 text-lg shadow-lg cursor-pointer"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Action / Jump Button for Mobile & Desktop */}
        <div className="absolute bottom-4 right-4 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              triggerJump();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              triggerJump();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              triggerJump();
            }}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 border-3 border-white text-white font-black text-xs sm:text-sm flex flex-col items-center justify-center shadow-2xl active:scale-90 active:brightness-125 cursor-pointer select-none"
          >
            <span className="text-base sm:text-lg">⬆</span>
            <span>{post.id === 3 ? 'LOMPAT' : 'TURBO'}</span>
          </button>
        </div>
      </div>

      {/* FOOTER DESKTOP CONTROL HINTS */}
      <footer className="hidden sm:flex bg-slate-900 border-t border-slate-800 px-4 py-2 text-center text-xs text-slate-400 items-center justify-between">
        <div>
          <span>Kontrol: <strong>Panah / W-A-S-D</strong> untuk Mengarahkan</span>
          {post.id === 3 && <span> · <strong>Spasi / Tombol Lompat</strong> untuk Melompat</span>}
          <span> · <strong>ESC</strong> untuk Jeda</span>
        </div>
        <div className="text-amber-400 font-semibold">
          Kerjakan kelima (5) tantangan hingga tuntas untuk membuka pos selanjutnya di peta!
        </div>
      </footer>

      {/* WRONG ANSWER EXPLANATION MODAL (MANDATORY REQUIREMENT) */}
      {showWrongModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-300 text-slate-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-rose-600 tracking-wider">
                  Jawaban Belum Tepat · Soal {questionIndex + 1}/5
                </span>
                <h3 className="text-lg font-black text-slate-900">Yuk, Pelajari Pembahasannya!</h3>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 my-3 text-xs sm:text-sm space-y-2">
              <div>
                <strong className="text-indigo-900 block font-bold">Petunjuk Konsep:</strong>
                <p className="text-slate-700">{currentQuestion.hint}</p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <strong className="text-emerald-900 block font-bold">Langkah Pembahasan:</strong>
                <p className="text-slate-800 font-medium">{currentQuestion.explanation}</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowWrongModal(false);
                  setIsPaused(false);
                  // Re-shuffle options and respawn fresh targets so answer moves to new spot
                  setupQuestion(questionIndex);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>COBA LAGI SOAL {questionIndex + 1}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL IF EXITING BEFORE ALL 5 QUESTIONS ARE DONE */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-amber-300 text-slate-900 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Pos Belum Tuntas!</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Kamu baru menyelesaikan <strong>{questionIndex} dari 5 soal</strong>.
              <br />
              <span className="text-rose-600 font-bold block mt-1">
                Pos berikutnya hanya akan terbuka jika kamu menyelesaikan seluruh 5 soal di pos ini!
              </span>
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer"
              >
                Lanjutkan Mengerjakan ({questionIndex + 1}/5)
              </button>

              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExitToMap();
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Tetap Keluar (Pos Berikutnya Masih Terkunci)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST COMPLETED CONGRATULATIONS MODAL (5/5 FINISHED!) */}
      {showPostCompletedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-emerald-400 text-slate-900 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700 block">
              SELESAI 5/5 TANTANGAN!
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              POS {post.id} TELAH TUNTAS!
            </h3>
            <p className="text-xs text-slate-600 mt-2 mb-5">
              Selamat! Kamu berhasil menuntaskan seluruh 5 tantangan di <strong>{post.title}</strong>. Pos berikutnya kini telah terbuka di peta petualangan!
            </p>

            <button
              onClick={() => {
                setShowPostCompletedModal(false);
                onPostCompleted();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              KEMBALI KE PETA PETUALANGAN
            </button>
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      {isPaused && !showWrongModal && !showPostCompletedModal && !showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900 text-center animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-900 mb-1">Permainan Dijeda</h3>
            <p className="text-xs text-slate-500 mb-5">
              Tantangan Saat Ini: Soal {questionIndex + 1} dari 5
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer"
              >
                Lanjutkan Permainan
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(false);
                  setQuestionIndex(0);
                  setupQuestion(0);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Ulangi Dari Tantangan 1
              </button>

              <button
                onClick={handleExitClick}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Kembali ke Peta Petualangan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2D CANVAS DRAWING FUNCTIONS (DOMAIN-NATIVE)
// ==========================================

function drawGameBackground(ctx: CanvasRenderingContext2D, postId: number, W: number, H: number, bgOffset: number) {
  if (postId === 1) {
    // Sky Pilot: Bright blue sky, fluffy moving clouds, green rolling hills at bottom, smiling sun
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.7, '#7dd3fc');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Sun
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(W - 80, 70, 36, 0, Math.PI * 2);
    ctx.fill();

    // Rolling green hills
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 40) {
      const y = H - 55 + Math.sin((x + bgOffset * 0.5) * 0.015) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    // Floating Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 260 - bgOffset) % (W + 200) + (W + 200)) % (W + 200) - 100;
      const cy = 60 + (i % 2) * 80;
      drawCloud(ctx, cx, cy, 32);
    }
  } else if (postId === 2) {
    // Gear Racing: Cheerful highway with yellow road markings, green grass verges, trees
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, 0, W, H);

    // Asphalt road
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 70, W, H - 140);

    // Road edges
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 66, W, 4);
    ctx.fillRect(0, H - 74, W, 4);

    // Yellow dashed center lines
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.setLineDash([30, 25]);
    ctx.lineDashOffset = -bgOffset * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Roadside cartoon trees
    for (let i = 0; i < 5; i++) {
      const tx = ((i * 200 - bgOffset * 1.2) % (W + 150) + (W + 150)) % (W + 150) - 50;
      // top tree
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(tx, 35, 18, 0, Math.PI * 2);
      ctx.fill();
      // bottom tree
      ctx.beginPath();
      ctx.arc(tx + 40, H - 35, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (postId === 3) {
    // Power Tower: Vertical fantasy tower jumper with lavender sky, brick platforms & floating clouds
    const towerGrad = ctx.createLinearGradient(0, 0, 0, H);
    towerGrad.addColorStop(0, '#a7f3d0');
    towerGrad.addColorStop(1, '#6ee7b7');
    ctx.fillStyle = towerGrad;
    ctx.fillRect(0, 0, W, H);

    // Ground platform
    const groundY = H - 65;
    ctx.fillStyle = '#047857';
    ctx.fillRect(0, groundY, W, 65);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, groundY - 4, W, 6);

    // Floating walkable platforms (matches physical collision)
    const platforms = [
      { x: W * 0.12, y: H * 0.68, w: 100, h: 14 },
      { x: W * 0.40, y: H * 0.52, w: 110, h: 14 },
      { x: W * 0.70, y: H * 0.64, w: 100, h: 14 },
      { x: W * 0.25, y: H * 0.35, w: 100, h: 14 },
      { x: W * 0.60, y: H * 0.32, w: 110, h: 14 },
    ];

    platforms.forEach((plat) => {
      // Brick texture
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 4);
      ctx.fill();

      // Top grass fringe
      ctx.fillStyle = '#34d399';
      ctx.fillRect(plat.x, plat.y, plat.w, 4);
    });
  } else if (postId === 4) {
    // Space Rocket: Bright purple/cyan cosmic nebula with colorful stars
    const spaceGrad = ctx.createLinearGradient(0, 0, W, H);
    spaceGrad.addColorStop(0, '#312e81');
    spaceGrad.addColorStop(0.5, '#4c1d95');
    spaceGrad.addColorStop(1, '#831843');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, W, H);

    // Colorful stars
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 47) % W;
      const sy = (i * 31 + Math.sin(bgOffset * 0.01 + i) * 10) % H;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating planet
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(W - 100, 100, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(W - 100, 100, 58, 12, Math.PI / 6, 0, Math.PI * 2);
    ctx.stroke();
  } else if (postId === 5) {
    // Underwater Submarine: Tropical turquoise sea, air bubbles, coral reefs
    const seaGrad = ctx.createLinearGradient(0, 0, 0, H);
    seaGrad.addColorStop(0, '#06b6d4');
    seaGrad.addColorStop(0.5, '#0891b2');
    seaGrad.addColorStop(1, '#0e7490');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, 0, W, H);

    // Sandy floor
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, H - 35, W, 35);

    // Corals
    ctx.fillStyle = '#f43f5e';
    for (let i = 0; i < 6; i++) {
      const cx = i * 140 + 30;
      ctx.beginPath();
      ctx.arc(cx, H - 35, 20, Math.PI, 0);
      ctx.fill();
    }

    // Rising bubbles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      const bx = (i * 65 + bgOffset * 0.3) % W;
      const by = (H - ((bgOffset * 0.8 + i * 40) % H));
      ctx.beginPath();
      ctx.arc(bx, by, (i % 4) + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // Final Arena: Grand crystal stage with rainbow energy grid
    const arenaGrad = ctx.createLinearGradient(0, 0, W, H);
    arenaGrad.addColorStop(0, '#4338ca');
    arenaGrad.addColorStop(0.5, '#581c87');
    arenaGrad.addColorStop(1, '#881337');
    ctx.fillStyle = arenaGrad;
    ctx.fillRect(0, 0, W, H);

    // Glowing grid lines
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x + r * 0.7, y - r * 0.3, r * 0.8, 0, Math.PI * 2);
  ctx.arc(x + r * 1.4, y, r * 0.9, 0, Math.PI * 2);
  ctx.arc(x + r * 0.7, y + r * 0.2, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawTargets(ctx: CanvasRenderingContext2D, postId: number, targets: TargetItem[], timestamp: number) {
  targets.forEach((t) => {
    ctx.save();
    ctx.translate(t.x, t.y);

    const pulse = Math.sin(timestamp * 0.005) * 2;
    const r = t.radius + pulse;

    // Outer glow ring
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 12;

    if (postId === 1) {
      // Sky Pilot: Golden air ring gate
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.arc(0, 0, r - 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (postId === 2) {
      // Gear Racing: Checkpoint arch banner
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.roundRect(-r - 4, -r + 6, (r + 4) * 2, r * 1.5, 14);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-r, -r + 10, r * 2, r * 1.25, 10);
      ctx.fill();
    } else if (postId === 3) {
      // Power Tower: Orange Mystery Block '?'
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(-r, -r, r * 2, r * 2, 10);
      ctx.fill();

      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-r + 4, -r + 4, (r - 4) * 2, (r - 4) * 2, 8);
      ctx.fill();
    } else if (postId === 4) {
      // Space Rocket: Cosmic warp portal with rotating halo
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(30, 27, 75, 0.85)';
      ctx.beginPath();
      ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (postId === 5) {
      // Submarine: Treasure chest
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(-r, -r + 6, r * 2, r * 1.4, 8);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -2, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Final Arena: Rotating energy shield orb
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Text Label inside target (NO ^ SYMBOL, BOLD MATH)
    ctx.shadowBlur = 0;
    ctx.fillStyle = postId === 4 ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.label, 0, 0);

    ctx.restore();
  });
}

function drawPlayer(ctx: CanvasRenderingContext2D, postId: number, p: any, timestamp: number) {
  ctx.save();
  ctx.translate(p.x, p.y);

  if (postId === 1) {
    // SKY PILOT: Cartoon 2D Red & White Aeroplane
    ctx.fillStyle = '#ef4444'; // Red fuselage
    ctx.beginPath();
    ctx.ellipse(22, 16, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(18, 16, 10, 22, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit windshield
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(30, 11, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Propeller
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    const propAngle = timestamp * 0.05;
    ctx.beginPath();
    ctx.moveTo(48 + Math.cos(propAngle) * 12, 16 + Math.sin(propAngle) * 12);
    ctx.lineTo(48 - Math.cos(propAngle) * 12, 16 - Math.sin(propAngle) * 12);
    ctx.stroke();

    // Turbo flame if active
    if (p.turboTimer > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-4, 16);
      ctx.lineTo(-20, 10);
      ctx.lineTo(-14, 16);
      ctx.lineTo(-20, 22);
      ctx.closePath();
      ctx.fill();
    }
  } else if (postId === 2) {
    // GEAR RACING: Motorcycle with Racer
    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(8, 26, 8, 0, Math.PI * 2);
    ctx.arc(36, 26, 8, 0, Math.PI * 2);
    ctx.fill();

    // Motor chassis
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(8, 24);
    ctx.lineTo(24, 14);
    ctx.lineTo(38, 24);
    ctx.closePath();
    ctx.fill();

    // Racer helmet
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(22, 8, 7, 0, Math.PI * 2);
    ctx.fill();
    // Visor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(24, 7, 5, 3);
  } else if (postId === 3) {
    // POWER TOWER: Cute Jumper Character with backpack & cap
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(10, 8, 24, 28, 8);
    ctx.fill();

    // Backpack
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.roundRect(4, 12, 8, 16, 3);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(22, 6, 9, 0, Math.PI * 2);
    ctx.fill();

    // Adventure Cap
    ctx.fillStyle = '#b45309';
    ctx.fillRect(14, 0, 18, 5);
    ctx.fillRect(10, 3, 24, 3);

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(25, 6, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (postId === 4) {
    // SPACE ROCKET: Futuristic White & Red Rocket with Thruster Flames
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(24, 16, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rocket Nose Cone
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(42, 10);
    ctx.lineTo(52, 16);
    ctx.lineTo(42, 22);
    ctx.closePath();
    ctx.fill();

    // Port window
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(30, 16, 5, 0, Math.PI * 2);
    ctx.fill();

    // Rocket Thruster Fire
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(2, 12);
    ctx.lineTo(-14, 16);
    ctx.lineTo(2, 20);
    ctx.closePath();
    ctx.fill();
  } else if (postId === 5) {
    // UNDERWATER: Yellow Mini Submarine
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(22, 18, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Periscope
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(20, 2, 4, 8);
    ctx.fillRect(20, 2, 8, 4);

    // Round porthole
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(28, 18, 6, 0, Math.PI * 2);
    ctx.fill();

    // Propeller
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-2, 12, 4, 12);
  } else {
    // FINAL ARENA: Math Hero with Shield
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.roundRect(8, 8, 22, 26, 6);
    ctx.fill();

    // Hero Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(19, 6, 8, 0, Math.PI * 2);
    ctx.fill();

    // Energy Shield
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(32, 18, 6, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
