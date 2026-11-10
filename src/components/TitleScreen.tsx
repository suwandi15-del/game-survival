import React, { useState } from 'react';
import { 
  Play, 
  BookOpen, 
  Target, 
  HelpCircle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Plane, 
  Bike, 
  Rocket, 
  Anchor, 
  ShieldCheck, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { soundManager } from '../sound';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  isMuted,
  onToggleMute,
}) => {
  const [activeTab, setActiveTab] = useState<'tujuan' | 'target' | 'petunjuk'>('tujuan');
  const [highlightPetunjuk, setHighlightPetunjuk] = useState(false);

  const handleBelumPaham = () => {
    soundManager.playClick();
    setActiveTab('petunjuk');
    setHighlightPetunjuk(true);
    setTimeout(() => setHighlightPetunjuk(false), 2000);
  };

  const handleMulai = () => {
    soundManager.playClick();
    onStart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-amber-100 to-emerald-200 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Animated Floating Clouds & Sun */}
      <div className="absolute top-4 left-6 w-20 h-20 bg-amber-300/80 rounded-full blur-xl animate-pulse pointer-events-none" />
      <div className="absolute top-10 right-12 w-32 h-14 bg-white/70 rounded-full blur-md animate-bounce pointer-events-none" style={{ animationDuration: '6s' }} />
      <div className="absolute top-24 left-1/4 w-28 h-12 bg-white/60 rounded-full blur-sm pointer-events-none" />

      {/* Top Bar with Sound Toggle */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700">Matematika Kelas X SMK · Fase E</span>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onToggleMute();
          }}
          className="flex items-center gap-2 bg-white/90 hover:bg-white px-3 py-1.5 rounded-full shadow-sm border border-white text-slate-700 transition active:scale-95 text-xs font-semibold"
          title="Tombol Suara"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          <span>{isMuted ? 'Suara Mati' : 'Suara Aktif'}</span>
        </button>
      </header>

      {/* Hero Title Section */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 flex flex-col items-center text-center my-4">
        {/* Animated 6 Character Mini Avatars */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-400 text-white flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '0ms' }} title="Pos 1: Pilot Pesawat">
            <Plane className="w-6 h-6" />
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '150ms' }} title="Pos 2: Pembalap Motor">
            <Bike className="w-6 h-6" />
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '300ms' }} title="Pos 3: Pelompat Menara">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '450ms' }} title="Pos 4: Astronot Roket">
            <Rocket className="w-6 h-6" />
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '600ms' }} title="Pos 5: Penyelam Samudra">
            <Anchor className="w-6 h-6" />
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '750ms' }} title="Pos 6: Pahlawan Robot Guardian">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Big Game Title */}
        <div className="relative">
          <div className="inline-block bg-amber-400 text-amber-950 px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-1 shadow-sm">
            Petualangan Aksi Matematika
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-rose-600 to-amber-600 drop-shadow-sm tracking-tight">
            POWER SURVIVAL
          </h1>
          <h2 className="text-xl sm:text-2xl font-black text-indigo-900 tracking-wide mt-1">
            PETUALANGAN 6 POS EKSPONEN
          </h2>
        </div>

        <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-700 max-w-xl">
          Terapkan sifat-sifat eksponen secara interaktif! Kemudikan kendaraan dan karaktermu menabrak target jawaban yang benar.
        </p>

        {/* 3 Nav Tabs */}
        <div className="mt-6 w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 overflow-hidden text-left">
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('tujuan');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'tujuan'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>1. Tujuan Belajar</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('target');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'target'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>2. Target Capaian</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('petunjuk');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'petunjuk'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              } ${highlightPetunjuk ? 'ring-4 ring-amber-400 animate-pulse' : ''}`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>3. Petunjuk Main</span>
            </button>
          </div>

          {/* Tab 1 Content: Tujuan Pembelajaran */}
          {activeTab === 'tujuan' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5">
                <span className="text-xs font-black text-indigo-700 uppercase tracking-wider block">Tujuan Utama Pembelajaran:</span>
                <p className="text-xs sm:text-sm font-medium text-indigo-950 mt-1">
                  Murid menerapkan sifat-sifat bilangan berpangkat untuk menyederhanakan bentuk matematika dan menyelesaikan masalah kontekstual dengan tepat.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">6 Capaian Kemampuan Siswa:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Pos 1:</strong> Menerapkan sifat perkalian eksponen (<code className="text-indigo-600 font-bold">aᵐ × aⁿ = aᵐ⁺ⁿ</code>)</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Pos 2:</strong> Menerapkan sifat pembagian eksponen (<code className="text-amber-600 font-bold">aᵐ ÷ aⁿ = aᵐ⁻ⁿ</code>)</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Pos 3:</strong> Menerapkan sifat pangkat dipangkatkan (<code className="text-emerald-600 font-bold">(aᵐ)ⁿ = aᵐˣⁿ</code>)</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Pos 4:</strong> Menerapkan sifat pangkat negatif (<code className="text-purple-600 font-bold">a⁻ⁿ = 1/aⁿ</code>)</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Pos 5:</strong> Menerapkan sifat pangkat nol (<code className="text-cyan-600 font-bold">a⁰ = 1, a ≠ 0</code>)</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Pos 6:</strong> Menyelesaikan operasi campuran eksponen di arena final</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2 Content: Target Pencapaian */}
          {activeTab === 'target' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <span className="text-xs font-black text-amber-800 uppercase tracking-wider block">Target Keberhasilan Murid:</span>
                <p className="text-xs sm:text-sm font-medium text-amber-950 mt-1">
                  Menuntaskan seluruh <strong>6 Pos Petualangan</strong> dan menjawab tepat <strong>30 tantangan matematika</strong> dengan benar untuk merebut gelar <strong>Power Survivor Emas</strong>!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-2xl font-black text-indigo-600">6 Pos</div>
                  <div className="text-xs text-slate-500 mt-1">Arena Berbeda</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-2xl font-black text-amber-600">30 Soal</div>
                  <div className="text-xs text-slate-500 mt-1">Tantangan Aksi</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-2xl font-black text-emerald-600">30.000+</div>
                  <div className="text-xs text-slate-500 mt-1">Skor Maksimal</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-2xl font-black text-rose-600">30 Koin</div>
                  <div className="text-xs text-slate-500 mt-1">Medali Emas Final</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3 Content: Petunjuk Permainan */}
          {activeTab === 'petunjuk' && (
            <div className="p-4 sm:p-6 space-y-3 text-xs sm:text-sm">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Mekanisme Gameplay Tabrak Jawaban Ceria:
                </h4>
                <p className="text-emerald-950 mt-1">
                  Ini bukan kuis biasa! Pertanyaan tampil di atas layar dan pilihan jawaban mengapung di arena permainan. Arahkan kendaraan atau karaktermu untuk <strong>menabrak target yang memuat jawaban yang benar</strong>!
                </p>
              </div>

              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <span><strong>Baca Materi Dulu:</strong> Setiap pos dimulai dengan rangkuman materi dan contoh soal langkah demi langkah.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <span><strong>Cek Pemahaman:</strong> Konfirmasi apakah sudah paham atau butuh mengulang sebelum mini-game dimulai.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <span><strong>5 Tantangan Per Pos:</strong> Setiap pos memiliki 5 target soal matematika, termasuk soal kontekstual SMK di akhir pos!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <span><strong>Hadiah Jawaban Benar:</strong> Mendapat <strong className="text-emerald-600">+1.000 Poin</strong>, <strong className="text-amber-600">+1 Koin</strong>, efek turbo, dan ucapan apresiasi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">5</span>
                  <span><strong>Jawaban Belum Tepat:</strong> Jangan khawatir! Penjelasan konsep akan muncul dan kamu bisa mencoba kembali soal tersebut sampai paham.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">6</span>
                  <span><strong>Buka Pos Bertahap:</strong> Pos 2 sampai 6 akan terbuka berurutan setelah pos sebelumnya diselesaikan 5/5.</span>
                </li>
              </ul>
            </div>
          )}

          {/* CEK KESIAPAN SEBELUM POS 1 (MANDATORY REQUIREMENT) */}
          <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border-t border-slate-200 p-4 sm:p-5">
            <div className="text-center">
              <span className="text-xs font-black tracking-widest text-indigo-900 uppercase">Cek Kesiapan Petualang</span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                SUDAH PAHAM DENGAN PETUNJUK PERMAINAN?
              </h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                Pilih salah satu tombol di bawah untuk menentukan langkahmu:
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleMulai}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>SAYA SUDAH PAHAM, MULAI!</span>
                </button>

                <button
                  onClick={handleBelumPaham}
                  className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>BELUM PAHAM, LIHAT PETUNJUK LAGI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Credits */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-4 py-4 text-center text-xs font-medium text-slate-600">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/60 shadow-xs">
          <span>Created by <strong>Suwandi, S.Pd.</strong></span>
          <span>·</span>
          <span><strong>SMKN 4 SOPPENG</strong></span>
        </div>
      </footer>
    </div>
  );
};
