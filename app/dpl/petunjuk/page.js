"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Eye, School } from "lucide-react";

export default function PetunjukDPL() {
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
    <DashboardLayout title="Petunjuk & Panduan DPL">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Banner Penjelasan */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-4 flex items-center gap-3">
              <span>👨‍<School className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> Selamat Datang, Dosen Pembimbing!
            </h1>
            <div className="space-y-4 text-teal-50 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
              <p>
                Sebagai <strong>Dosen Pembimbing Lapangan (DPL)</strong>, peran Anda sangat krusial dalam memastikan bahwa pengalaman KKL Plus mahasiswa sejalan dengan standar akademik program studi. Program <strong>KKL Plus Berdampak</strong> dirancang secara terstruktur (OBE - <em>Outcome Based Education</em>) agar pengalaman praktik lapangan mahasiswa benar-benar bernilai dan dapat dikonversi menjadi SKS.
              </p>
              <p>
                Aktivitas KKL Plus tidak dinilai secara subjektif, melainkan berdasarkan pemenuhan target kompetensi yang disebut <strong>CPMK (Capaian Pembelajaran Mata Kuliah)</strong>. Berikut adalah daftar CPMK beserta indikator-indikator operasional yang menjadi acuan penilaian keberhasilan KKL Plus mahasiswa.
              </p>
              <div className="bg-white/10 rounded-xl p-5 mt-4 border border-white/20">
                <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                  <span>🎯</span> Tanggung Jawab Utama Anda:
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Monitoring:</strong> Memantau secara rutin logbook harian mahasiswa untuk memastikan aktivitas mereka relevan dengan indikator CPMK.</li>
                  <li><strong>Validasi Logbook:</strong> Memberikan komentar, arahan perbaikan, dan memvalidasi kelayakan isi logbook mahasiswa.</li>
                  <li><strong>Penilaian & Evaluasi Akhir:</strong> Memvalidasi laporan KKL Plus dan menentukan tingkat pencapaian CPMK mahasiswa di akhir periode.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar CPMK */}
        <div>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
              📚
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Mata Kuliah & Indikator Penilaian</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Seluruh laporan dan kinerja mahasiswa merujuk pada kompetensi di bawah ini.</p>
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
                            <span className="inline-block px-2.5 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg text-xs font-bold mb-2 uppercase tracking-wider">
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
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm text-teal-600 dark:text-teal-400">
                                  {c.nama_cpmk}
                                </h4>
                                <div className="shrink-0 flex items-center">
                                  <span className="text-xs font-bold px-3 py-1.5 bg-teal-100 hover:bg-teal-200 dark:bg-teal-900/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-lg transition-colors group-open:hidden flex items-center gap-2">
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
                                      <span className="text-teal-500 shrink-0 mt-0.5">✓</span>
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
