"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Check, X } from "lucide-react";

// Sub-komponen untuk mengambil dan menampilkan logbook pokja
function PokjaLogbookList({ pokjaId }) {
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`/api/logbook?pokjaId=${pokjaId}&tipe=pokja`)
      .then(r => r.json())
      .then(data => {
        if (isMounted) {
          setLogbooks(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(e => {
        console.error(e);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [pokjaId]);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'menunggu_mentor': return <span className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-bold rounded shadow-sm">⏳ Menunggu Mentor</span>;
      case 'divalidasi_mentor': return <span className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold rounded shadow-sm">🔹 Divalidasi Mentor</span>;
      case 'divalidasi_dpl': return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded shadow-sm"><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Divalidasi DPL</span>;
      case 'revisi': return <span className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded shadow-sm"><X className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Direvisi</span>;
      default: return <span className="px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold rounded shadow-sm">{status}</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse text-sm">Mengambil data logbook POKJA...</div>;
  if (logbooks.length === 0) return <div className="p-8 text-center text-slate-500 text-sm">Belum ada riwayat logbook kelompok (POKJA).</div>;

  return (
    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="space-y-4">
        {logbooks.map(log => (
          <div key={log._id} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-xl border border-white/60 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="shrink-0 w-40 border-r border-slate-100 dark:border-slate-700 pr-4">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {new Date(log.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <div className="mt-2">{getStatusBadge(log.status_validasi)}</div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                {log.proker_id?.judul_proker || "Umum"}
              </p>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed space-y-1 mb-2">
                <p><strong>Rencana:</strong> {log.rencana_target}</p>
                <p><strong>Uraian:</strong> {log.uraian_kegiatan}</p>
                <p><strong>Hasil:</strong> {log.hasil_output}</p>
                {log.kendala_solusi && <p><strong>Kendala/Solusi:</strong> {log.kendala_solusi}</p>}
              </div>
            </div>
            
            {log.bukti_kegiatan && (
              <div className="shrink-0">
                <button onClick={() => handleViewFile(log.bukti_kegiatan)} className="text-xs font-bold text-[#1398A5] bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors border border-teal-200">
                  🖼️ Bukti
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MonitoringPokjaPage() {
  const [pokjas, setPokjas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pokja?admin=true&status=berjalan');
      const data = await res.json();
      setPokjas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPokjas = pokjas.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const namaPokja = p.nama_pokja?.toLowerCase() || "";
    const namaKetua = p.ketua_id?.nama_lengkap?.toLowerCase() || "";
    return namaPokja.includes(searchLower) || namaKetua.includes(searchLower);
  });

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <DashboardLayout title="Monitoring KKL Plus">
      <div className="space-y-6">
        {/* Header & Search */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 lg:p-8 rounded-[2rem] border border-white/60 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="w-full md:w-auto">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Monitoring Logbook POKJA</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pantau aktivitas kelompok mahasiswa. Klik "Lihat Logbook" untuk menampilkan riwayat kegiatan proyek kerja mereka.
            </p>
          </div>
          <div className="w-full md:w-auto flex shrink-0 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              🔍
            </div>
            <input
              type="text"
              placeholder="Cari Kelompok atau Ketua..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 pl-10 pr-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white/20 dark:bg-slate-900/20 font-medium text-sm text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Table Card */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat data kelompok...</div>
        ) : (
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 shadow-sm border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6 whitespace-nowrap">POKJA</th>
                    <th className="py-4 px-6">Mitra KKL Plus</th>
                    <th className="py-4 px-6">DPL</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredPokjas.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-500 font-medium">
                        <div className="text-4xl mb-3">📭</div>
                        Tidak ada kelompok KKL Plus aktif ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredPokjas.map((p) => (
                      <React.Fragment key={p._id}>
                        <tr className={`transition-colors ${expandedId === p._id ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/20'}`}>
                          <td className="py-4 px-6 align-middle">
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{p.nama_pokja}</p>
                            <p className="text-xs text-slate-500 font-medium">Ketua: {p.ketua_id?.nama_lengkap}</p>
                          </td>
                          <td className="py-4 px-6 align-middle">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {p.mitra_id?.nama_instansi || '-'}
                            </p>
                          </td>
                          <td className="py-4 px-6 align-middle">
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{p.dpl_id?.nama_lengkap || <span className="text-slate-400 italic">Belum diset</span>}</p>
                          </td>
                          <td className="py-4 px-6 align-middle text-center">
                            <button 
                              onClick={() => toggleExpand(p._id)}
                              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap shadow-sm dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50 dark:hover:bg-indigo-900/50"
                            >
                              <span>📋</span> {expandedId === p._id ? 'Tutup Logbook' : 'Lihat Logbook'}
                            </button>
                          </td>
                        </tr>
                        {/* Expandable Row Content */}
                        {expandedId === p._id && (
                          <tr>
                            <td colSpan="4" className="p-0 border-b-2 border-indigo-200 dark:border-indigo-800/50">
                              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                <PokjaLogbookList pokjaId={p._id} />
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
        )}
      </div>
    </DashboardLayout>
  );
}
