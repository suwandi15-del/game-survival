import React, { useEffect, useRef } from 'react';
import { GameProgress } from '../types';
import { GAME_POSTS } from '../data/gameData';
import { 
  Trophy, 
  Coins, 
  CheckCircle2, 
  RotateCcw, 
  Map, 
  Award, 
  Sparkles, 
  Flame, 
  Clock, 
  Check, 
  Star,
  GraduationCap
} from 'lucide-react';
import { soundManager } from '../sound';

interface VictoryScreenProps {
  progress: GameProgress;
  onPlayAgain: () => void;
  onViewMap: () => void;
  onResetGame: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  progress,
  onPlayAgain,
  onViewMap,
  onResetGame,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate statistics
  const totalCorrect = Object.values(progress.completedQuestions).reduce((a, b) => a + b, 0);
  const totalAttempts = Math.max(totalCorrect, progress.totalAttempts || totalCorrect);
  const accuracy = Math.round((totalCorrect / totalAttempts) * 100);

  // Elapsed time calculation
  const endTime = progress.completedTime || Date.now();
  const elapsedSec = Math.max(1, Math.round((endTime - progress.startTime) / 1000));
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = elapsedSec % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  // Determine Medal
  let medalTier: 'Emas (Gold)' | 'Perak (Silver)' | 'Perunggu (Bronze)' = 'Perunggu (Bronze)';
  let medalColor = 'from-amber-600 to-amber-800 text-amber-100';
  if (accuracy >= 85) {
    medalTier = 'Emas (Gold)';
    medalColor = 'from-yellow-400 via-amber-300 to-yellow-500 text-amber-950 border-amber-200';
  } else if (accuracy >= 70) {
    medalTier = 'Perak (Silver)';
    medalColor = 'from-slate-200 via-slate-100 to-slate-300 text-slate-800 border-slate-300';
  }

  // Colorful fireworks animation on victory canvas
  useEffect(() => {
    soundManager.playVictory();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const fireworks: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      size: number;
    }> = [];

    const colors = ['#f59e0b', '#10b981', '#38bdf8', '#ec4899', '#a855f7', '#fbbf24', '#ffffff'];

    const spawnFirework = () => {
      const cx = Math.random() * canvas.width;
      const cy = (Math.random() * 0.5 + 0.1) * canvas.height;
      const count = 35;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
        const speed = 1.5 + Math.random() * 3.5;
        fireworks.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          size: 2.5 + Math.random() * 3,
        });
      }
    };

    let lastSpawn = 0;
    const render = (time: number) => {
      if (time - lastSpawn > 600) {
        spawnFirework();
        lastSpawn = time;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const p = fireworks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.alpha -= 0.015;

        if (p.alpha <= 0) {
          fireworks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-amber-950 text-white flex flex-col justify-between font-sans relative overflow-x-hidden">
      {/* Background fireworks canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Top Banner */}
      <header className="relative z-20 w-full max-w-4xl mx-auto px-4 py-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase shadow-md mb-2">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Kelulusan Tingkat Fase E</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white drop-shadow-lg tracking-tight">
          CONGRATULATIONS!
        </h1>
        <h2 className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
          POWER SURVIVOR BERHASIL DITUNTASKAN!
        </h2>
        <p className="text-xs sm:text-sm text-purple-200 max-w-lg mx-auto mt-2 font-medium">
          Luar biasa! Kamu telah menaklukkan seluruh 6 pos eksponen dan menyelesaikan 30 tantangan matematika aksi dengan gemilang.
        </p>
      </header>

      {/* Main Stats Card */}
      <main className="relative z-20 flex-1 max-w-3xl mx-auto w-full px-4 py-4 space-y-6">
        {/* Big Medal Showcase */}
        <div className={`rounded-3xl p-6 bg-gradient-to-br ${medalColor} border-2 shadow-2xl text-center relative overflow-hidden`}>
          <div className="w-20 h-20 rounded-3xl bg-white/30 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Trophy className="w-12 h-12" />
          </div>

          <span className="text-xs font-black tracking-widest uppercase block opacity-90">
            Medali Pencapaianmu:
          </span>
          <h3 className="text-3xl font-black tracking-tight mt-0.5">
            MEDALI {medalTier.toUpperCase()}
          </h3>
          <p className="text-xs font-bold mt-1 opacity-90">
            Akurasi Jawabanmu: <span className="underline">{accuracy}%</span>
          </p>
        </div>

        {/* 4 Key Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums">
              {progress.totalScore.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] font-semibold text-slate-300 mt-0.5">Total Skor</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
            <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-xl sm:text-2xl font-black text-yellow-300 tabular-nums">
              {progress.coins}
            </div>
            <div className="text-[11px] font-semibold text-slate-300 mt-0.5">Total Koin</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-xl sm:text-2xl font-black text-emerald-300 tabular-nums">
              {totalCorrect} / 30
            </div>
            <div className="text-[11px] font-semibold text-slate-300 mt-0.5">Soal Tuntas</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
            <Clock className="w-5 h-5 text-sky-400 mx-auto mb-1" />
            <div className="text-xl sm:text-2xl font-black text-sky-300 tabular-nums">
              {timeFormatted}
            </div>
            <div className="text-[11px] font-semibold text-slate-300 mt-0.5">Waktu Belajar</div>
          </div>
        </div>

        {/* 6 Conquered Posts Grid */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3 text-center">
            Semua 6 Pos Berhasil Ditaklukkan:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold">
            {GAME_POSTS.map((post) => (
              <div
                key={post.id}
                className="bg-white/10 border border-white/20 rounded-xl p-2.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-[11px]">
                    {post.id}
                  </span>
                  <span className="text-slate-100">{post.gameName}</span>
                </div>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Inspirational Inscription */}
        <div className="bg-gradient-to-r from-amber-400/20 via-pink-500/20 to-indigo-500/20 border border-amber-300/40 rounded-2xl p-4 text-center">
          <p className="text-sm sm:text-base font-bold text-amber-200 italic">
            &ldquo;Terus berlatih, karena matematika adalah petualangan yang menyenangkan!&rdquo;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onViewMap();
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black text-sm rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Map className="w-4 h-4" />
            <span>LIHAT PETA PETUALANGAN</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-100 text-indigo-950 font-black text-sm rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>MAIN LAGI</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onResetGame();
            }}
            className="w-full sm:w-auto px-5 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/30 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ULANGI GAME</span>
          </button>
        </div>
      </main>

      {/* Footer Credits */}
      <footer className="relative z-20 w-full max-w-4xl mx-auto px-4 py-5 text-center text-xs font-semibold text-purple-200">
        <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 shadow-md">
          <span>Created by <strong>Suwandi, S.Pd.</strong></span>
          <span>·</span>
          <span><strong>SMKN 4 SOPPENG</strong></span>
        </div>
      </footer>
    </div>
  );
};
