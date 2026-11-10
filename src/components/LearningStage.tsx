import React, { useState, useRef } from 'react';
import { 
  PostData 
} from '../types';
import { 
  ArrowLeft, 
  Play, 
  HelpCircle, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  Lightbulb, 
  GraduationCap,
  ChevronRight,
  Flame
} from 'lucide-react';
import { soundManager } from '../sound';

interface LearningStageProps {
  post: PostData;
  onBackToMap: () => void;
  onProceedToGame: () => void;
}

export const LearningStage: React.FC<LearningStageProps> = ({
  post,
  onBackToMap,
  onProceedToGame,
}) => {
  const [highlightMateri, setHighlightMateri] = useState(false);
  const materiRef = useRef<HTMLDivElement>(null);

  const handleBelumPaham = () => {
    soundManager.playClick();
    setHighlightMateri(true);
    materiRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => setHighlightMateri(false), 2500);
  };

  const handleSudahPaham = () => {
    soundManager.playClick();
    onProceedToGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-100 text-slate-800 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              soundManager.playClick();
              onBackToMap();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Peta</span>
          </button>

          <div className="text-center">
            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wider block">
              POS {post.id}
            </span>
            <span className="text-xs font-bold text-slate-800">{post.gameName}</span>
          </div>

          <div className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-[11px] font-bold text-amber-900">
            Fase Pembelajaran
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Pos Hero Badge */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 text-[11px] font-bold px-3 py-1 rounded-full mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Materi Matematika Kelas X SMK</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {post.title}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Karakter Pendamping: <span className="text-indigo-600">{post.characterName}</span> ({post.characterDesc})
              </p>
            </div>
          </div>
        </div>

        {/* TAHAP 1: MATERI */}
        <section 
          ref={materiRef} 
          className={`bg-white rounded-3xl p-6 shadow-md border-2 transition-all duration-300 ${
            highlightMateri ? 'border-amber-400 ring-4 ring-amber-200 animate-pulse' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              1
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tahap 1</span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Konsep Inti & Rumus Sifat Eksponen</h2>
            </div>
          </div>

          {/* Formula Display Box */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white text-center shadow-md my-4">
            <span className="text-[11px] font-black tracking-widest uppercase opacity-90 block mb-1">
              Rumus Sifat Matematika
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-wider font-mono">
              {post.ruleFormula}
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p className="font-medium text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {post.ruleDescription}
            </p>

            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold uppercase tracking-wider text-amber-800">Tips Penting:</strong>
                <span className="text-xs sm:text-sm font-medium">{post.ruleNotes}</span>
              </div>
            </div>
          </div>
        </section>

        {/* TAHAP 2: CONTOH SOAL */}
        <section className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
              2
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tahap 2</span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Contoh Soal & Langkah Pembahasan</h2>
            </div>
          </div>

          <div className="space-y-4">
            {post.examples.map((ex, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                    {ex.title}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Solusi Lengkap
                  </span>
                </div>

                <div className="font-mono text-sm sm:text-base font-black text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200 mb-3">
                  {ex.problem}
                </div>

                <div className="space-y-2 mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Langkah Pengerjaan:
                  </span>
                  {ex.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-emerald-900">Hasil Akhir:</span>
                  <span className="font-mono font-black text-emerald-700 text-sm sm:text-base">{ex.answer}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TAHAP 3: CEK PEMAHAMAN (MANDATORY REQUIREMENT) */}
        <section className="bg-gradient-to-r from-amber-400/20 via-emerald-400/20 to-indigo-400/20 rounded-3xl p-6 shadow-lg border-2 border-amber-300 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <HelpCircle className="w-7 h-7" />
          </div>

          <span className="text-xs font-black tracking-widest uppercase text-indigo-900 block mb-1">
            Tahap 3 · Cek Kesiapan Bermain
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            SUDAH PAHAM DENGAN MATERI INI?
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-md mx-auto mt-1 mb-5">
            Pilih <span className="text-emerald-700 font-bold">SUDAH PAHAM</span> untuk langsung meluncur ke aksi game <strong>{post.gameName}</strong>, atau <span className="text-slate-700 font-bold">BELUM PAHAM</span> untuk mengulang materi di atas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* TOMBOL 1 */}
            <button
              onClick={handleSudahPaham}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>SAYA SUDAH PAHAM! LANJUT KE GAME</span>
            </button>

            {/* TOMBOL 2 */}
            <button
              onClick={handleBelumPaham}
              className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl border border-slate-300 shadow-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>BELUM PAHAM! ULANGI MATERI</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer Credits */}
      <footer className="w-full max-w-3xl mx-auto px-4 py-4 text-center text-xs font-medium text-slate-500">
        Materi Disusun oleh <strong>Suwandi, S.Pd. – SMKN 4 Soppeng</strong>
      </footer>
    </div>
  );
};
