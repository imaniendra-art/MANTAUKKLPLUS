"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Check } from "lucide-react";

export default function ValidasiPokja() {
  const [activeTab, setActiveTab] = useState('menunggu_persetujuan_lppm');
  const [pokjas, setPokjas] = useState([]);
  const [dpls, setDpls] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State Validasi
  const [showModal, setShowModal] = useState(false);
  const [selectedPokja, setSelectedPokja] = useState(null);
  const [selectedDplId, setSelectedDplId] = useState("");
  
  // Modal State Penolakan
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchData = useCallback(async (status) => {
    setLoading(true);
    try {
      const [pokjaRes, dplRes] = await Promise.all([
        fetch(`/api/pokja?admin=true&status=${status}`),
        fetch('/api/users/dpl')
      ]);
      const pokjaData = await pokjaRes.json();
      const dplData = await dplRes.json();
      
      if (Array.isArray(pokjaData)) setPokjas(pokjaData);
      if (Array.isArray(dplData)) setDpls(dplData);
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [fetchData, activeTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleValidasiClick = (p) => {
    setSelectedPokja(p);
    setSelectedDplId("");
    setShowModal(true);
  };

  const handleRejectClick = (p) => {
    setSelectedPokja(p);
    setRejectReason("Kelompok ditolak karena mitra KKL Plus tidak relevan.");
    setShowRejectModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDplId || !selectedPokja) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/pokja', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPokja._id,
          dpl_id: selectedDplId,
          status_pokja: 'disetujui_lppm'
        })
      });
      
      if (res.ok) {
        setShowModal(false);
        showToast("✅ POKJA Divalidasi & DPL Ditugaskan!");
        fetchData(activeTab);
      } else {
        const errData = await res.json();
        alert("Gagal memvalidasi: " + errData.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPokja || !rejectReason) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/pokja', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPokja._id,
          status_pokja: 'ditolak',
          catatan_lppm: rejectReason
        })
      });
      
      if (res.ok) {
        setShowRejectModal(false);
        showToast("⚠️ POKJA Berhasil Ditolak");
        fetchData(activeTab);
      } else {
        const errData = await res.json();
        alert("Gagal menolak: " + errData.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Validasi POKJA KKL Plus">
      
      {toastMessage && (
        <div className="fixed top-24 right-8 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-6 py-3 rounded-xl shadow-lg z-50 animate-in slide-in-from-right-10 fade-in duration-300 font-bold">
          {toastMessage}
        </div>
      )}

      <div className="space-y-6">
      <div className="flex space-x-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-1.5 rounded-xl w-max border border-white/60 dark:border-slate-700">
        <button
          className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'menunggu_persetujuan_lppm' 
              ? 'bg-[#1398A5] text-amber-300 shadow-sm' 
              : 'text-slate-500 hover:text-[#1398A5] dark:text-slate-400 dark:hover:text-teal-400'
          }`}
          onClick={() => setActiveTab('menunggu_persetujuan_lppm')}
        >
          Antrean Validasi
        </button>
        <button
          className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'disetujui_lppm' 
              ? 'bg-[#1398A5] text-amber-300 shadow-sm' 
              : 'text-slate-500 hover:text-[#1398A5] dark:text-slate-400 dark:hover:text-teal-400'
          }`}
          onClick={() => setActiveTab('disetujui_lppm')}
        >
          Data Divalidasi
        </button>
      </div>

        {/* Header Card */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Validasi Kelompok Kerja (POKJA) KKL Plus</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Verifikasi pembentukan kelompok mahasiswa, tinjau usulan mitra lokasi, dan alokasikan Dosen Pembimbing Lapangan (DPL).</p>
        </div>

        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/20 dark:bg-slate-900/20/50 border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-4 text-center">No</th>
                    <th className="py-4 px-4 text-left">Nama Kelompok</th>
                    <th className="py-4 px-4 text-left">Ketua</th>
                    <th className="py-4 px-4 text-left">Mitra Tujuan</th>
                    {activeTab === 'disetujui_lppm' && <th className="py-4 px-4 text-left">DPL</th>}
                    <th className="py-4 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 relative">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-20 text-center">
                        <div className="inline-block w-8 h-8 border-3 border-white/60 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 animate-pulse">Memuat data...</p>
                      </td>
                    </tr>
                  ) : pokjas.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                        <div className="text-4xl mb-3">🎉</div>
                        Tidak ada data POKJA pada tab ini.
                      </td>
                    </tr>
                  ) : (
                    pokjas.map((p, index) => {
                      return (
                      <tr key={p._id} className="hover:bg-white/50 dark:hover:bg-slate-700/60 transition-colors text-sm">
                        <td className="py-4 px-4 text-center font-medium text-slate-500 dark:text-slate-400">{index + 1}</td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{p.nama_pokja}</p>
                          <p className="text-xs text-slate-500">{p.anggota?.length || 0} Anggota</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{p.ketua_id?.nama_lengkap}</p>
                          <p className="text-xs text-slate-500">{p.ketua_id?.nim_nidn}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{p.mitra_id?.nama_instansi || 'Belum Memilih Mitra'}</p>
                        </td>
                        {activeTab === 'disetujui_lppm' && (
                          <td className="py-4 px-4">
                            <p className="font-bold text-indigo-600 dark:text-indigo-400">{p.dpl_id?.nama_lengkap || '-'}</p>
                          </td>
                        )}
                        <td className="py-4 px-4 text-center">
                          {activeTab === 'menunggu_persetujuan_lppm' ? (
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleRejectClick(p)}
                                className="px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                              >
                                Tolak
                              </button>
                              <button 
                                onClick={() => handleValidasiClick(p)}
                                className="px-3 py-1.5 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                              >
                                Tugaskan DPL
                              </button>
                            </div>
                          ) : (
                            <span className="text-emerald-500 font-bold">Disetujui</span>
                          )}
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* Modal Penolakan */}
      {showRejectModal && selectedPokja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-black text-red-500 mb-4">Tolak POKJA</h3>
            <form onSubmit={handleRejectSubmit}>
              <label className="block text-sm font-bold text-slate-500 mb-2">Alasan Penolakan</label>
              <textarea 
                required 
                rows={4}
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 mb-4"
              ></textarea>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowRejectModal(false)} className="px-5 py-2 font-bold text-slate-500">Batal</button>
                <button type="submit" className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl">Tolak POKJA</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penugasan DPL */}
      {showModal && selectedPokja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">Validasi & Tugaskan DPL</h3>
            <form onSubmit={handleSubmit}>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-4">
                <p className="font-bold text-indigo-900 dark:text-indigo-100">{selectedPokja.nama_pokja}</p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">Ketua: {selectedPokja.ketua_id?.nama_lengkap}</p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">Mitra: {selectedPokja.mitra_id?.nama_instansi || 'Belum memilih'}</p>
              </div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Pilih DPL</label>
              <select 
                required 
                value={selectedDplId} 
                onChange={(e) => setSelectedDplId(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 mb-6"
              >
                <option value="" disabled>-- Pilih DPL --</option>
                {dpls.map(dpl => (
                  <option key={dpl._id} value={dpl._id}>{dpl.nama_lengkap}</option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 font-bold text-slate-500">Batal</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl">Setujui POKJA</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
