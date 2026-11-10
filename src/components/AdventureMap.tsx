import React, { useState } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  Trophy, 
  Coins, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  HelpCircle,
  Play,
  Star,
  Plane,
  Bike,
  Rocket,
  Anchor,
  ShieldCheck,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { GAME_POSTS } from '../data/gameData';
import { GameProgress, PostId } from '../types';
import { soundManager } from '../sound';

interface AdventureMapProps {
  progress: GameProgress;
  onSelectPost: (postId: PostId) => void;
  onOpenTutorial: () => void;
  onResetProgress: () => void;
  onOpenVictory: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  progress,
  onSelectPost,
  onOpenTutorial,
  onResetProgress,
  onOpenVictory,
  isMuted,
  onToggleMute,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);

  // Check if all 6 posts are completed (5/5)
  const allCompleted = GAME_POSTS.every((p) => (progress.completedQuestions[p.id] || 0) >= 5);
  const totalQuestionsDone = Object.values(progress.completedQuestions).reduce((a, b) => a + b, 0);

  const getPostIcon = (id: PostId) => {
    switch (id) {
      case 1:
        return <Plane className="w-7 h-7" />;
      case 2:
        return <Bike className="w-7 h-7" />;
      case 3:
        return <Sparkles className="w-7 h-7" />;
      case 4:
        return <Rocket className="w-7 h-7" />;
      case 5:
        return <Anchor className="w-7 h-7" />;
      case 6:
        return <ShieldCheck className="w-7 h-7" />;
    }
  };

  const getPostBgGradient = (id: PostId, isUnlocked: boolean, isCompleted: boolean) => {
    if (!isUnlocked) return 'from-slate-200 to-slate-300 text-slate-400 border-slate-300';
    if (isCompleted) return 'from-emerald-400 to-teal-500 text-white border-emerald-300 shadow-emerald-200';
    switch (id) {
      case 1:
        return 'from-sky-400 to-blue-500 text-white border-sky-300 shadow-sky-200';
      case 2:
        return 'from-amber-400 to-orange-500 text-white border-amber-300 shadow-amber-200';
      case 3:
        return 'from-emerald-400 to-green-600 text-white border-emerald-300 shadow-emerald-200';
      case 4:
        return 'from-purple-400 to-indigo-600 text-white border-purple-300 shadow-purple-200';
      case 5:
        return 'from-cyan-400 to-teal-500 text-white border-cyan-300 shadow-cyan-200';
      case 6:
        return 'from-rose-500 to-amber-500 text-white border-rose-300 shadow-rose-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic Animated Clouds in Background */}
      <div className="absolute top-8 left-10 w-36 h-14 bg-white/70 rounded-full blur-sm pointer-events-none" />
      <div className="absolute top-28 right-16 w-48 h-16 bg-white/60 rounded-full blur-md pointer-events-none" />
      <div className="absolute bottom-20 left-12 w-40 h-14 bg-white/50 rounded-full blur-sm pointer-events-none" />

      {/* Top HUD Bar */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md rounded-b-2xl shadow-sm border-b border-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
            PS
          </div>
          <div>
            <h1 className="text-sm font-black text-indigo-950 tracking-tight">POWER SURVIVAL</h1>
            <p className="text-[11px] font-semibold text-slate-500">Peta Petualangan 6 Pos Eksponen</p>
          </div>
        </div>

        {/* Player Stats Cluster */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-900 tabular-nums">{progress.coins} Koin</span>
          </div>

          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
            <Trophy className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-950 tabular-nums">{progress.totalScore.toLocaleString('id-ID')} Poin</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-950 tabular-nums">{totalQuestionsDone}/30 Selesai</span>
          </div>

          {/* Controls: Sound, Tutorial, Reset */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleMute();
              }}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Toggle Suara"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenTutorial();
              }}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Lihat Petunjuk & Tujuan"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowResetModal(true);
              }}
              className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 transition"
              title="Reset Progres Permainan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Map Trail */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col justify-center">
        {/* Banner Announcement */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-white text-xs font-bold text-indigo-950">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Pilih arena pos yang telah terbuka untuk memulai pembelajaran dan aksi game!</span>
          </div>
        </div>

        {/* 6 Towers Interactive Grid / Trail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAME_POSTS.map((post) => {
            // STRICT RULE: Pos 1 is always unlocked. Pos 2-6 require previous post to have AT LEAST 5/5 completed!
            const prevCompleted = post.id > 1 ? (progress.completedQuestions[(post.id - 1) as PostId] || 0) : 5;
            const isUnlocked = post.id === 1 || prevCompleted >= 5;
            const completedCount = progress.completedQuestions[post.id] || 0;
            const isCompleted = completedCount >= 5;
            const isCurrentActive = isUnlocked && !isCompleted;

            return (
              <div
                key={post.id}
                onClick={() => {
                  if (isUnlocked) {
                    soundManager.playClick();
                    onSelectPost(post.id);
                  } else {
                    soundManager.playWrong();
                  }
                }}
                className={`relative rounded-3xl p-5 border-2 transition-all duration-300 select-none overflow-hidden ${
                  isUnlocked
                    ? 'cursor-pointer hover:scale-[1.03] active:scale-95 bg-white/95 shadow-lg'
                    : 'cursor-not-allowed bg-slate-100/90 opacity-75 border-slate-200'
                } ${isCurrentActive ? 'ring-4 ring-amber-400 ring-offset-2 animate-pulse shadow-xl' : ''}`}
              >
                {/* Visual Header / Pos Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md border ${getPostBgGradient(
                      post.id,
                      isUnlocked,
                      isCompleted
                    )}`}
                  >
                    {isUnlocked ? getPostIcon(post.id) : <Lock className="w-6 h-6 text-slate-400" />}
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUnlocked
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? 'SELESAI' : isUnlocked ? 'TERBUKA' : 'TERKUNCI'}
                    </span>
                    <div className="mt-1 flex items-center gap-1 justify-end">
                      <span className="text-xs font-black text-slate-700">POS {post.id}</span>
                      <span className="text-xs font-black text-indigo-700 tabular-nums">
                        ({completedCount}/5)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pos Title & Game Details */}
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    {post.subtitle}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <span className="font-bold text-indigo-600">{post.gameName}</span>
                    <span>·</span>
                    <span className="truncate">{post.gameGenre}</span>
                  </div>
                </div>

                {/* Math Rule Snippet Formula */}
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-700">{post.ruleFormula}</span>
                  {isCompleted ? (
                    <Award className="w-5 h-5 text-amber-500" />
                  ) : isUnlocked ? (
                    <Play className="w-4 h-4 text-indigo-600 fill-current" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Progress Bar 0..5 */}
                <div className="mt-3">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-indigo-500'
                      }`}
                      style={{ width: `${(completedCount / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Current Active Indicator */}
                {isCurrentActive && (
                  <div className="mt-2 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 animate-bounce">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span>SIAP DIMAINKAN! KLIK UNTUK MASUK</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final Castle / Arena Victory Gate */}
        <div className="mt-6">
          <div
            onClick={() => {
              if (allCompleted) {
                soundManager.playVictory();
                onOpenVictory();
              } else {
                soundManager.playWrong();
              }
            }}
            className={`rounded-3xl p-5 border-2 text-center transition-all select-none ${
              allCompleted
                ? 'cursor-pointer bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500 text-white shadow-xl hover:scale-[1.02] border-amber-300'
                : 'cursor-not-allowed bg-white/70 text-slate-500 border-dashed border-slate-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                    allCompleted ? 'bg-amber-300 text-amber-950 animate-bounce' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest block opacity-90">
                    Kastil Puncak Kejayaan
                  </span>
                  <h3 className="text-lg font-black tracking-tight leading-tight">
                    ARENA KEMENANGAN POWER SURVIVOR
                  </h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    {allCompleted
                      ? 'Selamat! Seluruh 6 pos telah kamu selesaikan! Klik untuk melihat piagam kelulusan & medali.'
                      : 'Selesaikan seluruh 6 pos (30/30 tantangan) untuk membuka pintu kastil kemenangan akhir.'}
                  </p>
                </div>
              </div>

              <button
                disabled={!allCompleted}
                className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md ${
                  allCompleted
                    ? 'bg-white text-indigo-950 hover:bg-amber-50 cursor-pointer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>{allCompleted ? 'LIHAT HASIL' : 'TERKUNCI'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Credits */}
      <footer className="relative z-20 w-full max-w-5xl mx-auto px-4 py-3 text-center text-xs font-semibold text-slate-600">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/70 shadow-xs">
          <span>Mata Pelajaran: <strong>Matematika Kelas X SMK Fase E</strong></span>
          <span>·</span>
          <span>Guru: <strong>Suwandi, S.Pd. – SMKN 4 Soppeng</strong></span>
        </div>
      </footer>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Ulangi Dari Awal?</h3>
            <p className="text-xs text-slate-600 mt-1.5">
              Apakah kamu yakin ingin mereset seluruh progres tantangan, poin, dan koin yang sudah diperoleh?
            </p>

            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onResetProgress();
                  setShowResetModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-sm"
              >
                Ya, Reset Progres
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
