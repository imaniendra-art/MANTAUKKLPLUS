"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FileSignature } from "lucide-react";

export default function AlurMagang() {
  return (
    <main className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen">
      {/* NAVBAR */}
      <nav className="w-full px-8 lg:px-[5cm] py-6 flex justify-between items-center relative z-20 shadow-sm bg-white/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 lg:gap-4">
          <Image src="/mk_gelap.png" alt="Mantau KKL Plus Logo" width={180} height={60} className="h-10 lg:h-12 w-auto object-contain drop-shadow-sm" priority />
          <div className="text-3xl lg:text-4xl font-extrabold tracking-widest text-slate-800 border-l border-slate-300 pl-3 lg:pl-4 h-10 lg:h-12 flex items-center">
            STIMI YAPMI
          </div>
        </Link>
        <Link 
          href="/"
          className="px-6 py-2 rounded-full bg-[#1398A5] text-white font-bold hover:bg-[#0f7a85] transition-all shadow-lg shadow-[#1398A5]/30"
        >
          Kembali ke Beranda
        </Link>
      </nav>

      {/* HEADER SECTION */}
      <div className="relative pt-16 pb-32 overflow-hidden text-center bg-slate-50">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/mantau_hero.png')" }}></div>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-0"></div>

        <div className="relative z-10 px-8 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex px-4 py-1.5 rounded-full border border-[#1398A5]/30 bg-[#1398A5]/10 text-[#0f7a85] text-sm font-bold tracking-widest backdrop-blur-sm uppercase">
            Panduan Lengkap
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight drop-shadow-md">
            Alur Pelaksanaan <span className="text-[#1398A5]">KKL Plus Berdampak</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-semibold drop-shadow-sm">
            Pahami tahapan pelaksanaan KKL Plus, mulai dari perencanaan program kerja, pelaksanaan di lapangan, hingga tahap evaluasi dampak bagi masyarakat.
          </p>
        </div>
      </div>

      {/* TIMELINE SECTION */}
      <div className="max-w-5xl mx-auto px-8 -mt-16 relative z-20 pb-24">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-8 md:p-16 border border-white/60">
          
          <div className="relative border-l-4 border-teal-100 ml-6 md:ml-10 space-y-16">
            
            {/* TAHAP 1 */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[22px] top-0 w-10 h-10 bg-white border-4 border-[#1398A5] rounded-full flex items-center justify-center shadow-lg shadow-[#1398A5]/30">
                <span className="text-[#1398A5] font-black text-lg">1</span>
              </div>
              <div className="bg-teal-50/50 p-8 rounded-3xl border border-teal-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-4"><FileSignature className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Pendaftaran & Pembentukan POKJA</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Mahasiswa mendaftar, membentuk Kelompok Kerja (POKJA), dan memilih lokasi instansi atau masyarakat sasaran. Pengajuan ini kemudian diteruskan ke pihak LPPM.
                </p>
                <ul className="space-y-2 text-sm font-medium text-slate-700">
                  <li className="flex items-center gap-2"><span className="text-[#1398A5]">✓</span> Pendaftaran dan pemilihan lokasi sasaran</li>
                  <li className="flex items-center gap-2"><span className="text-[#1398A5]">✓</span> Pembentukan Kelompok Kerja (POKJA)</li>
                  <li className="flex items-center gap-2"><span className="text-[#1398A5]">✓</span> Pengajuan kelompok ke LPPM</li>
                </ul>
              </div>
            </div>

            {/* TAHAP 2 */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[22px] top-0 w-10 h-10 bg-white border-4 border-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-emerald-600 font-black text-lg">2</span>
              </div>
              <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Plotting DPL & Penyusunan Proker</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  LPPM meninjau pengajuan dan menetapkan Dosen Pembimbing Lapangan (DPL). Bersama DPL dan Mentor, kelompok kemudian menyusun usulan Program Kerja (Proker).
                </p>
                <ul className="space-y-2 text-sm font-medium text-slate-700">
                  <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Peninjauan pengajuan & Plotting DPL oleh LPPM</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Kolaborasi awal bersama DPL & Mentor Lokal</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Penyusunan usulan Program Kerja (Proker)</li>
                </ul>
              </div>
            </div>

            {/* TAHAP 3 */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[22px] top-0 w-10 h-10 bg-white border-4 border-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-cyan-600 font-black text-lg">3</span>
              </div>
              <div className="bg-cyan-50/50 p-8 rounded-3xl border border-cyan-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Pelaksanaan & Tata Administrasi</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Mahasiswa terjun ke lapangan untuk mengeksekusi Proker secara nyata. Seluruh kegiatan dan Tata Administrasi Umum dicatat melalui platform MANTAU KKLPlus.
                </p>
                <ul className="space-y-2 text-sm font-medium text-slate-700">
                  <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span> Eksekusi Program Kerja di lapangan</li>
                  <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span> Pencatatan aktivitas di MANTAU KKLPlus</li>
                  <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span> Bimbingan berkala oleh Mentor & DPL</li>
                </ul>
              </div>
            </div>

            {/* TAHAP 4 */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[22px] top-0 w-10 h-10 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-blue-600 font-black text-lg">4</span>
              </div>
              <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">peNilaian & Laporan Dampak</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Tahap akhir berfokus pada evaluasi seberapa besar Proker bermanfaat bagi masyarakat. Pencapaian ini menjadi dasar peNilaian akhir secara terukur.
                </p>
                <ul className="space-y-2 text-sm font-medium text-slate-700">
                  <li className="flex items-center gap-2"><span className="text-blue-500">✓</span> Evaluasi keberhasilan solusi di lapangan</li>
                  <li className="flex items-center gap-2"><span className="text-blue-500">✓</span> Laporan akhir dampak program kerja</li>
                  <li className="flex items-center gap-2"><span className="text-blue-500">✓</span> Penilaian akhir oleh DPL dan Mentor Lokal</li>
                </ul>
              </div>
            </div>

          </div>

          <div className="mt-16 text-center">
            <h4 className="text-xl font-bold text-slate-800 mb-6">Siap berkolaborasi dan beri dampak nyata?</h4>
            <Link 
              href="/login" 
              className="inline-block px-10 py-4 bg-[#1398A5] hover:bg-[#0f7a85] text-white font-black rounded-xl shadow-lg shadow-[#1398A5]/30 transition-all hover:-translate-y-1"
            >
              Masuk ke MANTAU KKLPlus
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
