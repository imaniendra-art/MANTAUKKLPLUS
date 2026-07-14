"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Check, X } from "lucide-react";

export default function MentorValidasi() {
  const { data: session } = useSession();
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [activeTab, setActiveTab] = useState('antrean'); // 'antrean' or 'histori'
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedCpmk, setExpandedCpmk] = useState({});
  const [selectedLogs, setSelectedLogs] = useState([]);

  const toggleCpmk = (id) => {
    setExpandedCpmk(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const [antreanRes, historiRes] = await Promise.all([
        fetch(`/api/logbook?role=mentor&userId=${session.user.id}`),
        fetch(`/api/logbook?role=mentor_histori&userId=${session.user.id}`)
      ]);
      const antreanData = await antreanRes.json();
      const historiData = await historiRes.json();
      
      const combined = [
        ...(Array.isArray(antreanData) ? antreanData : []),
        ...(Array.isArray(historiData) ? historiData : [])
      ];
      setLogbooks(combined);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Reset selection when tab changes
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setSelectedLogs([]);
    }
    return () => { mounted = false; };
  }, [activeTab]);

  useEffect(() => {
    let mounted = true;
    if (session?.user?.id) {
      fetchData().then(() => {
        // done
      });
    }
    return () => { mounted = false; };
  }, [fetchData, session?.user?.id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleValidasi = async (id, newStatus, catatan_revisi = "") => {
    if (newStatus === 'revisi' && !catatan_revisi) return; // Prevent empty reason
    setSubmitting(true);
    try {
      const payload = { id, status_validasi: newStatus };
      if (catatan_revisi) payload.catatan_revisi = catatan_revisi;

      const res = await fetch('/api/logbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(newStatus === 'divalidasi_mentor' ? "Fakta Kegiatan Divalidasi!" : "Diminta revisi!");
        if (newStatus === 'revisi') {
          setShowRejectModal(false);
          setRejectReason("");
          setSelectedLogId(null);
        }
        fetchData();
      } else {
        alert("Gagal memvalidasi");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkValidasi = async () => {
    if (selectedLogs.length === 0) return;
    setSubmitting(true);
    try {
      const payload = { ids: selectedLogs, status_validasi: 'divalidasi_mentor' };
      const res = await fetch('/api/logbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`${selectedLogs.length} Logbook Berhasil Divalidasi!`);
        setSelectedLogs([]);
        fetchData();
      } else {
        alert("Gagal memvalidasi logbook terpilih");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectLog = (id) => {
    setSelectedLogs(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const antreanIds = logbooks.filter(l => l.status_validasi === 'menunggu_mentor').map(l => l._id);
      setSelectedLogs(antreanIds);
    } else {
      setSelectedLogs([]);
    }
  };

  const openRejectModal = (id) => {
    setSelectedLogId(id);
    setRejectReason("");
    setShowRejectModal(true);
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
    <DashboardLayout title="Validasi Faktual (Mentor)">
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-8 py-3.5 rounded-full shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-300 font-bold flex items-center gap-2.5 border border-teal-500">
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
              ? 'bg-slate-100 dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' 
              : 'text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400'
          }`}
          onClick={() => setActiveTab('antrean')}
        >
          ⏳ Antrean Validasi
        </button>
        <button
          className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'histori' 
              ? 'bg-slate-100 dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' 
              : 'text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400'
          }`}
          onClick={() => setActiveTab('histori')}
        >
          📭 Riwayat (Histori)
        </button>
      </div>

          {/* Header Card */}
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Validasi Logbook Harian</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Verifikasi secara faktual apakah deskripsi kegiatan mahasiswa benar-benar dilakukan di instansi Anda.</p>
            </div>
            {activeTab === 'antrean' && selectedLogs.length > 0 && (
              <button 
                onClick={handleBulkValidasi}
                disabled={submitting}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                <Check className="w-5 h-5" /> Setujui {selectedLogs.length} Terpilih
              </button>
            )}
          </div>

          {/* Table Card */}
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 shadow-sm border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    {activeTab === 'antrean' && (
                      <th className="py-4 px-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                          onChange={handleSelectAll}
                          checked={selectedLogs.length > 0 && selectedLogs.length === logbooks.filter(l => l.status_validasi === 'menunggu_mentor').length}
                        />
                      </th>
                    )}
                    <th className="py-4 px-6 whitespace-nowrap w-[20%]">Mahasiswa & Tgl</th>
                    <th className="py-4 px-6 w-[55%]">Deskripsi Kegiatan</th>
                    <th className="py-4 px-6 text-right w-[25%]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {logbooks.filter(log => activeTab === 'antrean' ? log.status_validasi === 'menunggu_mentor' : log.status_validasi !== 'menunggu_mentor').length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === 'antrean' ? "4" : "3"} className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                        <div className="text-4xl mb-3">{activeTab === 'antrean' ? '🎉' : '📭'}</div>
                        {activeTab === 'antrean' ? 'Tidak ada logbook menunggu validasi lapangan Anda.' : 'Belum ada riwayat logbook yang Anda validasi/revisi.'}
                      </td>
                    </tr>
                  ) : (
                    logbooks.filter(log => activeTab === 'antrean' ? log.status_validasi === 'menunggu_mentor' : log.status_validasi !== 'menunggu_mentor').map((log) => (
                      <React.Fragment key={log._id}>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          {activeTab === 'antrean' && (
                            <td className="py-4 px-4 text-center align-top">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600 mt-1"
                                checked={selectedLogs.includes(log._id)}
                                onChange={() => toggleSelectLog(log._id)}
                              />
                            </td>
                          )}
                          <td className="py-4 px-6 align-top">
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{log.mahasiswa_id?.nama_lengkap}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-1 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-md">{new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </td>
                          <td className="py-4 px-6 align-top">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                              <p><strong>Rencana:</strong> {log.rencana_target}</p>
                              <p><strong>Uraian:</strong> {log.uraian_kegiatan}</p>
                              <p><strong>Hasil:</strong> {log.hasil_output}</p>
                              {log.kendala_solusi && <p><strong>Kendala/Solusi:</strong> {log.kendala_solusi}</p>}
                            </div>
                          </td>
                          <td className="py-4 px-6 align-top text-right">
                            <div className="flex flex-col items-end gap-3">
                              {/* Action Buttons */}
                              <div className="flex flex-wrap justify-end gap-2">
                                {log.bukti_kegiatan && (
                                  <button onClick={() => handleViewFile(log.bukti_kegiatan)} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap shadow-sm cursor-pointer">
                                    <span>🖼️</span> Bukti
                                  </button>
                                )}
                                <button 
                                  onClick={() => toggleCpmk(log._id)}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                                >
                                  <span>🎯</span> Capaian
                                </button>
                              </div>

                              {/* Validation Status / Actions */}
                              {activeTab === 'antrean' ? (
                                <div className="flex gap-2 mt-1">
                                  <button 
                                    onClick={() => handleValidasi(log._id, 'divalidasi_mentor')}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-lg transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
                                  >
                                    <Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Validasi
                                  </button>
                                  <button 
                                    onClick={() => openRejectModal(log._id)}
                                    disabled={submitting}
                                    className="px-4 py-2 border border-amber-200 text-amber-600 hover:bg-amber-50 font-bold text-xs rounded-lg transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
                                  >
                                    <X className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Revisi
                                  </button>
                                </div>
                              ) : (
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm inline-flex items-center gap-1.5 ${
                                  log.status_validasi === 'revisi' 
                                    ? 'text-amber-600 bg-amber-50 border-amber-200' 
                                    : 'text-teal-700 bg-teal-50 border-teal-200'
                                }`}>
                                  <span>{log.status_validasi === 'revisi' ? '❌' : '✅'}</span>
                                  {log.status_validasi === 'revisi' ? 'Direvisi' : 'Divalidasi'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expandable CPMK Row */}
                        {expandedCpmk[log._id] && (
                          <tr className="border-b border-slate-100 dark:border-slate-700/50">
                            <td colSpan={activeTab === 'antrean' ? "4" : "3"} className="px-6 pb-5 pt-0">
                              <div className="animate-in fade-in slide-in-from-top-2 duration-200 w-full">
                                {log.matched_indicators && log.matched_indicators.length > 0 ? (
                                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-white/60 dark:border-slate-700">
                                    <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
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
                                              <div className="mt-1.5 p-2 bg-teal-100/50 dark:bg-teal-900/30 rounded border border-teal-200/50 dark:border-teal-800/50">
                                                <p className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
                                                  <span className="font-bold text-teal-700 dark:text-teal-400 mr-1">Analisis Kegiatan:</span>
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

      {/* Modal Revisi */}
      {showRejectModal && selectedLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/60 dark:border-slate-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-amber-600 dark:text-amber-400">Minta Revisi Logbook</h3>
                <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xl">&times;</button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Mohon tuliskan dengan jelas bagian mana yang harus diperbaiki oleh mahasiswa pada logbook hari ini.</p>
              
              <textarea
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Deskripsi terlalu singkat, mohon jelaskan apa saja tugas spesifik yang kamu kerjakan hari ini..."
                className="w-full h-32 border border-white/50 dark:border-slate-600 bg-white/20 dark:bg-slate-900/20 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium text-slate-800 dark:text-slate-100"
              ></textarea>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => handleValidasi(selectedLogId, 'revisi', rejectReason)}
                  disabled={submitting || !rejectReason.trim()}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2 rounded-xl shadow-lg shadow-amber-600/20 transition-all"
                >
                  {submitting ? 'Memproses...' : 'Kirim Revisi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
