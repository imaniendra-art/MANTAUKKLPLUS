"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Check, X } from "lucide-react";

export default function DplValidasi() {
  const { data: session } = useSession();
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCpmk, setExpandedCpmk] = useState({});

  const toggleCpmk = (id) => {
    setExpandedCpmk(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [activeTab, setActiveTab] = useState('antrean'); // 'antrean' or 'histori'

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/logbook?role=dpl&userId=${session.user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setLogbooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, [fetchData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleValidasi = async (id, newStatus) => {
    try {
      const res = await fetch('/api/logbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status_validasi: newStatus })
      });
      if (res.ok) {
        showToast(newStatus === 'divalidasi_dpl' ? "CPMK Akademik Berhasil Divalidasi!" : "Diminta revisi!");
        fetchData();
      } else {
        alert("Gagal memvalidasi");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    }
  };

  const handleViewFile = (dataUrl) => {
    try {
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) {
        window.open(dataUrl, '_blank');
        return;
      }
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.error("Gagal membuka file:", e);
      window.open(dataUrl, '_blank');
    }
  };

  return (
    <DashboardLayout title="Pantau Kegiatan Mahasiswa (DPL)">
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-3.5 rounded-full shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-300 font-bold flex items-center gap-2.5 border border-emerald-500">
          <span><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> {toastMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-bold animate-pulse">Memuat antrean logbook...</div>
      ) : (
        <div className="space-y-6">
      <div className="flex space-x-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-1.5 rounded-xl w-max border border-white/60 dark:border-slate-700">
        <button
          className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'antrean' 
              ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
              : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
          }`}
          onClick={() => setActiveTab('antrean')}
        >
          ⏳ Perlu Perhatian
        </button>
        <button
          className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'histori' 
              ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
              : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
          }`}
          onClick={() => setActiveTab('histori')}
        >
          📭 Riwayat (Tervalidasi)
        </button>
      </div>

          {/* Header Card */}
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Riwayat & Pemantauan Logbook Mahasiswa</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Pantau kegiatan harian mahasiswa bimbingan Anda. Ingatkan Mentor jika mahasiswa kurang mendapatkan eksposur yang relevan dengan target CPMK.</p>
          </div>

          {/* Table Card */}
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 shadow-sm border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6 whitespace-nowrap w-[20%]">Mahasiswa & Tgl</th>
                    <th className="py-4 px-6 w-[55%]">Deskripsi Kegiatan</th>
                    <th className="py-4 px-6 text-right w-[25%]">Status & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {logbooks.filter(log => activeTab === 'antrean' ? log.status_validasi === 'menunggu_mentor' : log.status_validasi !== 'menunggu_mentor').length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                        <div className="text-4xl mb-3">{activeTab === 'antrean' ? '📚' : '📭'}</div>
                        {activeTab === 'antrean' ? 'Semua logbook sudah divalidasi oleh Mentor.' : 'Belum ada riwayat logbook yang divalidasi.'}
                      </td>
                    </tr>
                  ) : (
                    logbooks.filter(log => activeTab === 'antrean' ? log.status_validasi === 'menunggu_mentor' : log.status_validasi !== 'menunggu_mentor').map((log) => (
                      <React.Fragment key={log._id}>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-6 align-top">
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{log.mahasiswa_id?.nama_lengkap}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-1 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-md">{new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </td>
                          <td className="py-4 px-6 align-top">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{log.deskripsi_kegiatan}</p>
                          </td>
                          <td className="py-4 px-6 align-top text-right">
                            <div className="flex flex-col items-end gap-3">
                              {/* Action Buttons */}
                              <div className="flex flex-wrap justify-end gap-2">
                                {log.bukti_kegiatan && (
                                  <button onClick={() => handleViewFile(log.bukti_kegiatan)} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap shadow-sm cursor-pointer">
                                    <span>🖼️</span> Bukti
                                  </button>
                                )}
                                <button 
                                  onClick={() => toggleCpmk(log._id)}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                                >
                                  <span>🎯</span> Capaian
                                </button>
                              </div>

                              {/* Validation Status / Actions */}
                              {log.status_validasi === 'menunggu_mentor' && (
                                <div className="flex flex-col items-end gap-2 mt-1">
                                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-flex items-center gap-1.5 shadow-sm">
                                    <span>⏳</span> Menunggu Mentor
                                  </span>
                                  <div className="flex flex-col xl:flex-row gap-2 mt-1">
                                    <a 
                                      href={`https://wa.me/?text=Halo%20Bapak/Ibu%20Mentor,%20mohon%20bantuannya%20untuk%20memvalidasi%20logbook%20magang%20atas%20nama%20${log.mahasiswa_id?.nama_lengkap}.%20Terima%20kasih!`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                    >
                                      <span>💬</span> WA
                                    </a>
                                    <button 
                                      onClick={() => handleValidasi(log._id, 'divalidasi_mentor')}
                                      className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                    >
                                      <span><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> Bantu Validasi
                                    </button>
                                  </div>
                                </div>
                              )}

                              {log.status_validasi === 'divalidasi_mentor' && (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 shadow-sm">
                                  <span><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> Divalidasi Lapangan
                                </span>
                              )}

                              {log.status_validasi === 'revisi' && (
                                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 shadow-sm inline-flex items-center gap-1.5">
                                  <span><X className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> Diminta Revisi
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expandable CPMK Row */}
                        {expandedCpmk[log._id] && (
                          <tr className="border-b border-slate-100 dark:border-slate-700/50">
                            <td colSpan="3" className="px-6 pb-5 pt-0">
                              <div className="animate-in fade-in slide-in-from-top-2 duration-200 w-full">
                                {log.matched_indicators && log.matched_indicators.length > 0 ? (
                                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-white/60 dark:border-slate-700">
                                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                      <span>🎯</span> {log.matched_indicators.length} Target CPMK Terpenuhi
                                    </p>
                                    <div className="space-y-3">
                                      {log.matched_indicators.map((ind, idx) => (
                                        <div key={idx} className="flex gap-2.5 items-start">
                                          <div className="text-amber-400 text-xs mt-0.5 shrink-0">⭐</div>
                                          <div>
                                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-1 rounded shadow-sm inline-block mb-1 border border-slate-100 dark:border-slate-700">{ind.nama_cpmk}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{ind.indikator}</p>
                                            {ind.alasan && (
                                              <div className="mt-1.5 p-2 bg-indigo-100/50 dark:bg-indigo-900/30 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                                                <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                                                  <span className="font-bold text-indigo-700 dark:text-indigo-400 mr-1">Analisis Kegiatan:</span>
                                                  {ind.alasan}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3.5 border border-amber-200 dark:border-amber-800/50 flex gap-2 items-start">
                                    <span className="text-amber-500">💡</span>
                                    <div>
                                      <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider mb-0.5">
                                        Tidak Memenuhi Target CPMK
                                      </p>
                                      <p className="text-[11px] text-amber-600 dark:text-amber-400/80 leading-relaxed mt-1">Kegiatan ini bersifat rutinitas. Mohon arahkan mahasiswa untuk melakukan variasi tugas lain agar target KKL Plus tercapai.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
