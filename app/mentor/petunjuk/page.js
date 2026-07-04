"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Eye } from "lucide-react";

export default function PetunjukMentor() {
  const [paketData, setPaketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/paket-matkul')
      .then(res => res.json())
      .then(data => {
        setPaketData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout title="Petunjuk & Panduan Mentor">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Banner Penjelasan */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-4 flex items-center gap-3">
              <span>👋</span> Selamat Datang, Mentor!
            </h1>
            <div className="space-y-4 text-emerald-50 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
              <p>
                Sebagai <strong>Mentor Industri</strong>, Anda adalah ujung tombak dalam membimbing mahasiswa mempraktikkan ilmu mereka di dunia nyata. Program <strong>KKL Plus Berdampak</strong> ini dirancang bukan sekadar untuk menjadikan mahasiswa sebagai tenaga bantuan administratif, melainkan agar mereka mampu memberikan <em>dampak nyata</em> melalui proyek inovasi dan penyelesaian masalah di instansi Anda.
              </p>
              <p>
                Oleh karena itu, setiap aktivitas harian yang mahasiswa lakukan harus diselaraskan dengan target kompetensi yang disebut <strong>CPMK (Capaian Pembelajaran Mata Kuliah)</strong>. Mahasiswa dituntut untuk proaktif mencari tahu apa yang bisa mereka kerjakan di tempat KKL Plus untuk memenuhi indikator-indikator di bawah ini.
              </p>
              <div className="bg-white/10 rounded-xl p-5 mt-4 border border-white/20">
                <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                  <span>📌</span> Peran Utama Anda:
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Memberikan arahan dan tugas yang relevan dengan target indikator mahasiswa.</li>
                  <li>Membuka ruang diskusi dan merespons inisiatif ide yang diajukan oleh mahasiswa.</li>
                  <li><strong>Memvalidasi (Menyetujui/Menolak) Logbook Harian</strong> mahasiswa secara objektif melalui menu Validasi Logbook.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar CPMK */}
        <div>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
              🎯
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Target CPMK & Indikator</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Berikut adalah kompetensi yang wajib dikejar mahasiswa selama KKL Plus.</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {paketData.map((paket) => (
                <div key={paket._id} className="space-y-4">
                  {paket.mata_kuliah.map((mk, idx) => (
                    <div key={idx} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 dark:border-slate-700 overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-white/60 dark:border-slate-700 p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold mb-2 uppercase tracking-wider">
                              {mk.kode}
                            </span>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{mk.nama}</h3>
                          </div>
                          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-white/60 dark:border-slate-700">
                            {mk.sks} SKS
                          </span>
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        {mk.cpmk && mk.cpmk.length > 0 ? (
                          mk.cpmk.map((c, cIdx) => (
                            <details key={cIdx} className="group p-4 rounded-xl border border-white/60 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 [&_summary::-webkit-details-marker]:hidden">
                              <summary className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer list-none focus:outline-none">
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm text-indigo-600 dark:text-indigo-400">
                                  {c.nama_cpmk}
                                </h4>
                                <div className="shrink-0 flex items-center">
                                  <span className="text-xs font-bold px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors group-open:hidden flex items-center gap-2">
                                    <Eye className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Lihat Indikator Aktivitas
                                  </span>
                                  <span className="text-xs font-bold px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors hidden group-open:flex items-center gap-2">
                                    Tutup ✕
                                  </span>
                                </div>
                              </summary>
                              <div className="pt-4 mt-4 border-t border-white/60 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Aktivitas yang Disarankan:</p>
                                <ul className="space-y-2">
                                  {c.indikator.map((ind, iIdx) => (
                                    <li key={iIdx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                      <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                                      <span>{ind}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </details>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 italic text-center py-4">Belum ada CPMK untuk mata kuliah ini.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
