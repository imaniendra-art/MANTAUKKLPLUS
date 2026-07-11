"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Check, UserCircle, Info } from "lucide-react";

export default function ValidasiPokja() {
  const [activeTab, setActiveTab] = useState('menunggu_persetujuan_lppm');
  const [pokjas, setPokjas] = useState([]);
  const [dpls, setDpls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Modal State Validasi
  const [showModal, setShowModal] = useState(false);
  const [selectedPokja, setSelectedPokja] = useState(null);
  const [selectedDplId, setSelectedDplId] = useState("");
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Modal State Dokumen
  const [showDokumenModal, setShowDokumenModal] = useState(false);

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

  const handleKelolaDokumen = (p) => {
    setSelectedPokja(p);
    setShowDokumenModal(true);
  };

  const handleAdminUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pokjaId', selectedPokja._id);
    formData.append('documentType', documentType);

    setSubmitting(true);
    try {
      const res = await fetch('/api/upload/surat', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        showToast("✅ Dokumen berhasil diunggah!");
        fetchData(activeTab);
        // Update selectedPokja local state
        const updatedPokja = await (await fetch(`/api/pokja?admin=true&status=${activeTab}`)).json();
        const fresh = updatedPokja.find(p => p._id === selectedPokja._id);
        if (fresh) setSelectedPokja(fresh);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengunggah dokumen");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan saat mengunggah dokumen.");
    } finally {
      setSubmitting(false);
    }
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
        <div className="fixed top-24 right-8 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-6 py-3 rounded-xl shadow-lg z-50 animate-in slide-in-from-right-10 fade-in duration-300 font-bold">
          {toastMessage}
        </div>
      )}

      <div className="space-y-6">
      <div className="flex space-x-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-1.5 rounded-xl w-max border border-white/60 dark:border-slate-700">
        <button
          className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'menunggu_persetujuan_lppm' 
              ? 'bg-teal-600 text-amber-300 shadow-sm' 
              : 'text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400'
          }`}
          onClick={() => setActiveTab('menunggu_persetujuan_lppm')}
        >
          Antrean Validasi
        </button>
        <button
          className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'disetujui_lppm,berjalan,selesai' 
              ? 'bg-teal-600 text-amber-300 shadow-sm' 
              : 'text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400'
          }`}
          onClick={() => setActiveTab('disetujui_lppm,berjalan,selesai')}
        >
          Semua POKJA Aktif
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
                    {activeTab !== 'menunggu_persetujuan_lppm' && <th className="py-4 px-4 text-left">DPL</th>}
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
                      const isExpanded = expandedRow === p._id;
                      return (
                      <React.Fragment key={p._id}>
                      <tr 
                        className="hover:bg-white/50 dark:hover:bg-slate-700/60 transition-colors text-sm cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : p._id)}
                      >
                        <td className="py-4 px-4 text-center font-medium text-slate-500 dark:text-slate-400">{index + 1}</td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{p.nama_pokja}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            {p.anggota?.length || 0} Anggota <span className="text-teal-500">{isExpanded ? "(Tutup)" : "(Lihat)"}</span>
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{p.ketua_id?.nama_lengkap}</p>
                          <p className="text-xs text-slate-500">{p.ketua_id?.nim_nidn}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{p.mitra_id?.nama_instansi || 'Belum Memilih Mitra'}</p>
                        </td>
                        {activeTab !== 'menunggu_persetujuan_lppm' && (
                          <td className="py-4 px-4">
                            <p className="font-bold text-teal-600 dark:text-teal-400">{p.dpl_id?.nama_lengkap || '-'}</p>
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
                                className="px-3 py-1.5 bg-teal-500/20 text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                              >
                                Tugaskan DPL
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2 items-center">
                              <span className="text-teal-500 font-bold text-xs uppercase hidden md:inline">
                                {p.status_pokja === 'disetujui_lppm' ? 'Persiapan' : p.status_pokja.replace('_', ' ')}
                              </span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleKelolaDokumen(p); }}
                                className="px-3 py-1.5 bg-teal-500/20 text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                              >
                                Kelola Dokumen
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                          <td colSpan={6} className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                              <h5 className="font-bold text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                <UserCircle className="w-4 h-4 text-teal-500" /> Detail Anggota Kelompok
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Ketua */}
                                <div className="p-3 bg-teal-50/50 dark:bg-teal-900/10 rounded-lg border border-teal-100 dark:border-teal-800/50">
                                  <span className="text-[10px] uppercase font-bold text-teal-500 mb-1 block">Ketua POKJA</span>
                                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{p.ketua_id?.nama_lengkap}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{p.ketua_id?.nim_nidn}</p>
                                  <p className="text-[11px] text-slate-400 mt-1">{p.ketua_id?.program_studi || "-"} • {p.ketua_id?.konsentrasi || "Belum ada konsentrasi"}</p>
                                </div>
                                
                                {/* Anggota */}
                                {p.anggota?.map((anggota, i) => (
                                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600/50">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Anggota</span>
                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{anggota.user_id?.nama_lengkap}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{anggota.user_id?.nim_nidn}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">{anggota.user_id?.program_studi || "-"} • {anggota.user_id?.konsentrasi || "Belum ada konsentrasi"}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
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
              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl mb-4">
                <p className="font-bold text-teal-900 dark:text-teal-100">{selectedPokja.nama_pokja}</p>
                <p className="text-sm text-teal-700 dark:text-teal-300">Ketua: {selectedPokja.ketua_id?.nama_lengkap}</p>
                <p className="text-sm text-teal-700 dark:text-teal-300">Mitra: {selectedPokja.mitra_id?.nama_instansi || 'Belum memilih'}</p>
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
                <button type="submit" className="px-6 py-2 bg-teal-600 text-white font-bold rounded-xl">Setujui POKJA</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Kelola Dokumen */}
      {showDokumenModal && selectedPokja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 w-full max-w-4xl shadow-2xl my-8">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Kelola Dokumen - {selectedPokja.nama_pokja}</h3>
            
            <div className="space-y-6">
              {/* Dokumen Pokja */}
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Dokumen POKJA (Khusus Kelompok Ini)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Surat Pengantar */}
                  <div className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">Surat Pengantar</p>
                      <p className="text-xs text-slate-500">Otomatis dari sistem</p>
                    </div>
                    <button onClick={() => window.open(`/mahasiswa/surat/pengantar/${selectedPokja._id}`, '_blank')} className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-200">Buka PDF</button>
                  </div>
                  {/* SK Tugas */}
                  <div className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">Surat Tugas (SK)</p>
                      <p className="text-xs text-slate-500">Legalitas kelompok</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedPokja.file_surat_tugas && <a href={selectedPokja.file_surat_tugas} target="_blank" className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-200">Lihat</a>}
                      <label className="cursor-pointer px-3 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold rounded-lg relative overflow-hidden">
                        <span className={submitting ? "opacity-0" : ""}>Upload</span>
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAdminUpload(e, 'sk')} disabled={submitting} />
                        {submitting && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div></div>}
                      </label>
                    </div>
                  </div>
                  {/* LOA */}
                  <div className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">Surat Balasan (LOA)</p>
                      <p className="text-xs text-slate-500">Bukti diterima mitra</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedPokja.file_surat_balasan && <a href={selectedPokja.file_surat_balasan} target="_blank" className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200">Lihat</a>}
                      <label className="cursor-pointer px-3 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold rounded-lg relative overflow-hidden">
                        <span className={submitting ? "opacity-0" : ""}>Upload</span>
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAdminUpload(e, 'loa')} disabled={submitting} />
                        {submitting && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div></div>}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dokumen Mitra */}
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Dokumen Mitra ({selectedPokja.mitra_id?.nama_instansi})</h4>
                
                <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 p-4 rounded-xl mb-4">
                  <div className="flex gap-2">
                    <Info className="w-5 h-5 text-sky-600 shrink-0" />
                    <div className="text-sm text-sky-800 dark:text-sky-200">
                      <p className="font-bold mb-1">Panduan Status Kerja Sama Mitra:</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        <li><strong>Belum Ada / Penjajakan:</strong> Peluang DPL & LPPM untuk membuka kerja sama baru selama masa KKL Plus.</li>
                        <li><strong>MOU (Memorandum of Understanding):</strong> Payung kerja sama umum (tingkat Universitas). Harus ditindaklanjuti dengan MOA/IA.</li>
                        <li><strong>MOA (Memorandum of Agreement):</strong> Kesepakatan spesifik (tingkat Fakultas). Membutuhkan IA sebagai bukti pelaksanaan riil.</li>
                        <li><strong>IA (Implementation Arrangement):</strong> Bukti implementasi nyata bahwa mahasiswa KKL telah beraktivitas. Sangat penting untuk <strong>IKU & Akreditasi!</strong></li>
                      </ul>
                      <p className="mt-2 text-xs italic text-sky-700 dark:text-sky-300">Catatan: Jika dokumen diunggah ke sini, status mitra akan terekam selamanya di database dan berlaku untuk kelompok KKL angkatan berikutnya.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* MOU */}
                  <div className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100">
                    <p className="font-bold text-sm text-slate-800 dark:text-white mb-2">MOU</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPokja.mitra_id?.file_mou && <a href={selectedPokja.mitra_id.file_mou} target="_blank" className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-200">Lihat MOU</a>}
                      <label className="cursor-pointer px-3 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold rounded-lg relative overflow-hidden flex-1 text-center">
                        <span className={submitting ? "opacity-0" : ""}>Upload MOU</span>
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAdminUpload(e, 'mou')} disabled={submitting} />
                        {submitting && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div></div>}
                      </label>
                    </div>
                  </div>
                  {/* MOA */}
                  <div className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100">
                    <p className="font-bold text-sm text-slate-800 dark:text-white mb-2">MOA</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPokja.mitra_id?.file_moa && <a href={selectedPokja.mitra_id.file_moa} target="_blank" className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200">Lihat MOA</a>}
                      <label className="cursor-pointer px-3 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold rounded-lg relative overflow-hidden flex-1 text-center">
                        <span className={submitting ? "opacity-0" : ""}>Upload MOA</span>
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAdminUpload(e, 'moa')} disabled={submitting} />
                        {submitting && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div></div>}
                      </label>
                    </div>
                  </div>
                  {/* IA */}
                  <div className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100">
                    <p className="font-bold text-sm text-slate-800 dark:text-white mb-2">IA</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPokja.mitra_id?.file_ia && <a href={selectedPokja.mitra_id.file_ia} target="_blank" className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200">Lihat IA</a>}
                      <label className="cursor-pointer px-3 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold rounded-lg relative overflow-hidden flex-1 text-center">
                        <span className={submitting ? "opacity-0" : ""}>Upload IA</span>
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAdminUpload(e, 'ia')} disabled={submitting} />
                        {submitting && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div></div>}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowDokumenModal(false)}
                className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-xl transition-colors"
              >
                Tutup Panel
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
