"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { UserCircle, MapPin, Phone, Mail, CheckCircle2, UserPlus, Clock, Info, Eye, RefreshCcw, Upload } from "lucide-react";

export default function DaftarBimbinganPage() {
  const [bimbinganList, setBimbinganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showStatusInfo, setShowStatusInfo] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [mentorForm, setMentorForm] = useState({ nama_lengkap: '', nomor_hp: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Modal State Reject
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Proker State
  const [expandedProkerRow, setExpandedProkerRow] = useState(null);
  const [selectedPokjaProker, setSelectedPokjaProker] = useState(null);
  const [prokerList, setProkerList] = useState([]);
  const [isProkerLoading, setIsProkerLoading] = useState(false);
  const [revisiNotes, setRevisiNotes] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/dpl/bimbingan?_t=${Date.now()}`);
      const data = await res.json();
      if (!data.error) setBimbinganList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const toggleProkerRow = async (pokja) => {
    if (expandedProkerRow === pokja._id) {
      setExpandedProkerRow(null);
      return;
    }
    
    // Close member row if open
    if (expandedRow === pokja._id) setExpandedRow(null);
    
    setExpandedProkerRow(pokja._id);
    setSelectedPokjaProker(pokja);
    setIsProkerLoading(true);
    try {
      const res = await fetch(`/api/proker?pokjaId=${pokja._id}`);
      const data = await res.json();
      setProkerList(Array.isArray(data) ? data : []);
      setRevisiNotes({});
    } catch (error) {
      console.error("Error fetching prokers:", error);
    } finally {
      setIsProkerLoading(false);
    }
  };

  const handleReviewProker = async (prokerId, action) => {
    try {
      const body = { id: prokerId, status: action };
      if (action === 'revisi') {
        body.catatan_revisi = revisiNotes[prokerId] || 'Silakan perbaiki proker ini';
      } else {
        body.catatan_revisi = ''; // Clear notes if approved
      }

      const res = await fetch('/api/proker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        // Refresh proker list
        const refreshedRes = await fetch(`/api/proker?pokjaId=${selectedPokjaProker._id}`);
        const data = await refreshedRes.json();
        const updatedList = Array.isArray(data) ? data : [];
        setProkerList(updatedList);
        
        // Update all_proker_approved locally
        if (updatedList.length > 0 && updatedList.every(p => p.status === 'disetujui_dpl')) {
          setBimbinganList(prev => prev.map(b => b._id === selectedPokjaProker._id ? { ...b, all_proker_approved: true } : b));
        } else {
          setBimbinganList(prev => prev.map(b => b._id === selectedPokjaProker._id ? { ...b, all_proker_approved: false } : b));
        }
      }
    } catch (error) {
      console.error("Error reviewing proker:", error);
    }
  };

  const handleKonfirmasi = async (id) => {
    if (!confirm("Konfirmasi bahwa Anda telah menyerahkan mahasiswa ini ke instansi?")) return;
    try {
      const res = await fetch("/api/dpl/bimbingan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pengajuanId: id })
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Gagal mengonfirmasi");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleLaporan = async (id, currentStatus) => {
    const actionText = currentStatus ? "mengunci kembali" : "membuka paksa";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} akses laporan mahasiswa ini?`)) return;
    
    try {
      const res = await fetch("/api/dpl/toggle-laporan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pengajuanId: id, isUnlocked: !currentStatus })
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Gagal mengubah status laporan");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    }
  };

  const handleUploadLegal = async (e, type, mitraId, pokjaId) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', type);
    formData.append('pokjaId', pokjaId);

    try {
      const res = await fetch('/api/upload/surat', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (res.ok && data.fileUrl) {
        const updatePayload = { id: mitraId };
        let newStatus = '';
        if (type === 'mou') {
          updatePayload.file_mou = data.fileUrl;
          newStatus = 'Memorandum of Understanding (MoU)';
        } else if (type === 'moa') {
          updatePayload.file_moa = data.fileUrl;
          newStatus = 'Memorandum of Agreement (MoA)';
        } else if (type === 'ia') {
          updatePayload.file_ia = data.fileUrl;
          newStatus = 'Implementation Arrangement (IA)';
        }
        
        updatePayload.status_kerjasama = newStatus;

        await fetch('/api/mitra', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });
        
        showToast(`Dokumen ${type.toUpperCase()} berhasil diupload.`);
        fetchData();
      } else {
        alert("Gagal mengupload dokumen");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTolakInstansi = async (e) => {
    e.preventDefault();
    if (!selectedPengajuan || !rejectReason) return;
    
    setIsRejecting(true);
    try {
      const res = await fetch("/api/pengajuan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPengajuan._id,
          status_pengajuan: 'ditolak',
          alasan_penolakan: rejectReason
        })
      });
      
      if (res.ok) {
        setShowRejectModal(false);
        setRejectReason("");
        fetchData();
        alert("Mahasiswa telah ditandai sebagai Ditolak Instansi.");
      } else {
        const data = await res.json();
        alert("Gagal menolak: " + (data.error || ""));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleAddMentor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/dpl/bimbingan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          pengajuanId: selectedPengajuan._id,
          ...mentorForm
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mendaftarkan mentor");
      } else {
        setShowModal(false);
        setMentorForm({ nama_lengkap: '', nomor_hp: '', email: '' });
        fetchData();
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDocButtons = (type, url, label, mitraId, pokjaId) => {
    if (url) {
      return (
        <div className="flex items-center" onClick={e => e.stopPropagation()}>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold px-2 py-1.5 rounded-l-md border border-r-0 border-teal-200 bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30 hover:bg-teal-200 dark:hover:bg-teal-500/30 transition-colors flex items-center gap-1">
            <Eye className="w-3 h-3" /> {label}
          </a>
          <label className={`text-[9px] font-bold px-2 py-1.5 rounded-r-md border border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <RefreshCcw className="w-3 h-3" />
            <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleUploadLegal(e, type, mitraId, pokjaId)} disabled={isUploading} />
          </label>
        </div>
      );
    }
    return (
      <label className={`text-[9px] font-bold px-2 py-1.5 rounded-md border border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700'}`} onClick={e => e.stopPropagation()}>
        <Upload className="w-3 h-3" /> {label}
        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleUploadLegal(e, type, mitraId, pokjaId)} disabled={isUploading} />
      </label>
    );
  };

  return (
    <DashboardLayout title="Daftar Bimbingan & Penyerahan" backPath="/dpl">
      <div className="space-y-6">
        
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-teal-200/50 dark:border-teal-800/50 shadow-sm flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-500 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Informasi Penyerahan & Bimbingan</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-5xl">
              Berikut adalah daftar Kelompok Kerja (POKJA) KKL Plus di bawah bimbingan Anda. Mohon pastikan tiga hal utama: <strong>(1) Tugaskan Mentor Lapangan & Konfirmasi Penyerahan</strong> setelah serah terima di instansi, <strong>(2) Lengkapi & Update berkas kerjasama (MoU, MoA, IA)</strong> dengan pihak mitra, dan <strong>(3) Review & Setujui Program Kerja (Proker)</strong> yang diusulkan oleh mahasiswa agar mereka dapat melaksanakan kegiatannya secara terarah.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 dark:bg-slate-800/50 animate-pulse rounded-2xl"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800/50 animate-pulse rounded-2xl"></div>
          </div>
        ) : bimbinganList.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">Belum ada mahasiswa bimbingan yang disetujui.</p>
          </div>
        ) : (
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-white/20 dark:bg-slate-900/20/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Kelompok Kerja</th>
                    <th className="px-6 py-4">Lokasi KKL Plus</th>
                    <th className="px-6 py-4">Doc. Kerjasama</th>
                    <th className="px-6 py-4">Mentor Lapangan</th>
                    <th className="px-6 py-4">Rancangan Proker</th>
                    <th className="px-6 py-4 text-center">Status / Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {bimbinganList.map((item) => {
                    const ketua = item.ketua_id;
                    const anggota = item.anggota || [];
                    const mentor = item.mentor_id;
                    const lokasi = item.mitra_id?.nama_instansi || "-";
                    const isExpanded = expandedRow === item._id;
                    
                    return (
                      <React.Fragment key={item._id}>
                        <tr 
                          onClick={() => {
                            if (expandedProkerRow === item._id) setExpandedProkerRow(null);
                            setExpandedRow(isExpanded ? null : item._id);
                          }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center font-bold shrink-0">
                                👥
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100">{item.nama_pokja || "Kelompok KKL"}</p>
                                <p className="text-xs text-slate-500">Ketua: {ketua?.nama_lengkap}</p>
                                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
                                  {anggota.length + 1} Anggota <span className="text-teal-500">{isExpanded ? "(Tutup Detail)" : "(Lihat Detail)"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5 max-w-[200px]">
                              <div className="flex items-start gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span className="font-medium line-clamp-2 leading-relaxed">{lokasi}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {item.mitra_id?.status_kerjasama ? (
                              <div className="flex flex-col gap-1.5 w-fit">
                                <div 
                                  className="flex flex-col gap-1 text-[10px] bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200 px-2 py-1.5 rounded-md border border-sky-100 dark:border-sky-800/50"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center gap-1 font-bold">
                                    <Info className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                                    <span>Status Kerjasama: {item.mitra_id.status_kerjasama.split('(')[0].trim()}</span>
                                  </div>
                                  <span className="text-[8.5px] italic text-sky-600/90 dark:text-sky-300/80 leading-tight">
                                    {item.mitra_id.status_kerjasama.includes('MoU') 
                                      ? '» Segera arahkan untuk MoA & IA.'
                                      : item.mitra_id.status_kerjasama.includes('MoA')
                                      ? '» Segera arahkan untuk IA.'
                                      : item.mitra_id.status_kerjasama.includes('IA')
                                      ? '» Seluruh berkas kerjasama terpenuhi.'
                                      : item.mitra_id.status_kerjasama.includes('Penjajakan')
                                      ? '» Segera selesaikan dokumen MoU.'
                                      : '» Segera mulai penjajakan MoU.'}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-1.5 mt-2" onClick={e => e.stopPropagation()}>
                                  {renderDocButtons('mou', item.mitra_id.file_mou, 'MoU', item.mitra_id._id, item._id)}
                                  {renderDocButtons('moa', item.mitra_id.file_moa, 'MoA', item.mitra_id._id, item._id)}
                                  {renderDocButtons('ia', item.mitra_id.file_ia, 'IA', item.mitra_id._id, item._id)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Data mitra tidak ditemukan</span>
                            )}
                          </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            {mentor ? (
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100">{mentor.nama_lengkap}</p>
                                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                                  <Phone className="w-3 h-3" /> {mentor.nomor_hp}
                                </div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => { setSelectedPengajuan(item); setShowModal(true); }}
                                className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
                              >
                                <UserPlus className="w-3 h-3" /> Tugaskan Mentor
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex flex-col gap-2">
                              {item.all_proker_approved && (
                                <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 text-xs font-bold rounded-full border border-teal-200 dark:border-teal-500/30 w-full">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui Semua
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleProkerRow(item);
                                }}
                                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-2 w-full justify-center ${
                                  expandedProkerRow === item._id
                                    ? "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-200"
                                    : "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/50 hover:bg-teal-100 dark:hover:bg-teal-900/50"
                                }`}
                              >
                                {expandedProkerRow === item._id ? "Tutup Proker" : "Review Proker"}
                              </button>
                            </div>
                          </td>
                        <td className="px-6 py-4 align-middle text-center">
                          {['berjalan', 'selesai'].includes(item.status_pokja) ? (
                            <div className="flex flex-col items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 text-xs font-bold rounded-full border border-teal-200 dark:border-teal-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Terkonfirmasi
                              </span>
                              
                              <button
                                onClick={() => handleToggleLaporan(item._id, item.is_laporan_unlocked)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold w-full max-w-[140px] border transition-all ${
                                  item.is_laporan_unlocked
                                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400"
                                    : "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100 dark:bg-teal-500/10 dark:border-teal-500/30 dark:text-teal-400"
                                }`}
                              >
                                {item.is_laporan_unlocked ? "🔒 Kunci Laporan" : "🔓 Buka Laporan"}
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-full">
                                <Clock className="w-3 h-3" /> Menunggu Penyerahan
                              </span>
                              <button 
                                onClick={() => handleKonfirmasi(item._id)}
                                disabled={!mentor}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all w-full max-w-[140px] ${
                                  mentor 
                                    ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20" 
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                                }`}
                                title={!mentor ? "Tugaskan mentor terlebih dahulu" : "Konfirmasi penyerahan"}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi
                              </button>
                              
                              <button 
                                onClick={() => { setSelectedPengajuan(item); setShowRejectModal(true); }}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 transition-all w-full max-w-[140px]"
                                title="Tandai ditolak jika instansi menolak mahasiswa"
                              >
                                🚫 Ditolak Instansi
                              </button>
                            </div>
                          )}
                          </td>
                        </tr>
                        
                        {isExpanded && (
                          <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <td colSpan={5} className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h5 className="font-bold text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                  <UserCircle className="w-4 h-4 text-teal-500" /> Detail Anggota Kelompok
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {/* Ketua */}
                                  <div className="p-3 bg-teal-50/50 dark:bg-teal-900/10 rounded-lg border border-teal-100 dark:border-teal-800/50">
                                    <span className="text-[10px] uppercase font-bold text-teal-500 mb-1 block">Ketua POKJA</span>
                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{ketua?.nama_lengkap}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{ketua?.nim_nidn}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">{ketua?.program_studi || "-"} • {ketua?.konsentrasi || "Belum ada konsentrasi"}</p>
                                  </div>
                                  
                                  {/* Anggota */}
                                  {anggota.map((ang, idx) => {
                                    if (ang.status_undangan !== 'bergabung') return null;
                                    const u = ang.user_id;
                                    return (
                                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Anggota</span>
                                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{u?.nama_lengkap}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{u?.nim_nidn}</p>
                                        <p className="text-[11px] text-slate-400 mt-1">{u?.program_studi || "-"} • {u?.konsentrasi || "Belum ada konsentrasi"}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        
                        {/* Expanded Proker Row */}
                        {expandedProkerRow === item._id && (
                          <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <td colSpan={5} className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                              <div className="p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h5 className="font-bold text-sm text-slate-800 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                  <span>Review Program Kerja POKJA</span>
                                </h5>
                                
                                {isProkerLoading ? (
                                  <div className="text-center py-8 text-slate-500">Memuat data proker...</div>
                                ) : prokerList.length === 0 ? (
                                  <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                    Mahasiswa belum mengajukan program kerja.
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {prokerList.map((p, idx) => (
                                      <div key={p._id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col xl:flex-row gap-6">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-2">
                                            <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-black shrink-0">{idx + 1}</span>
                                            <h4 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{p.judul_proker}</h4>
                                          </div>
                                          <div className="ml-11 space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${p.jenis_proker === 'Utama' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                                                {p.jenis_proker}
                                              </span>
                                              <span className="text-[11px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                                PIC: {p.pic_id?.nama_lengkap || '-'}
                                              </span>
                                              <span className="text-[11px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                                Waktu: {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                                              </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p.deskripsi}</p>
                                            <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg border border-teal-100 dark:border-teal-800/30">
                                              <p className="text-xs font-bold text-teal-800 dark:text-teal-400 mb-1">Target Dampak:</p>
                                              <p className="text-sm text-teal-700 dark:text-teal-300">{p.target_dampak}</p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="w-full xl:w-64 shrink-0 flex flex-col justify-center border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-700 pt-4 xl:pt-0 xl:pl-6">
                                          <div className="mb-3 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                                              p.status === 'disetujui_dpl' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                              p.status === 'revisi' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                              'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                              {p.status === 'disetujui_dpl' ? 'Disetujui' : p.status === 'revisi' ? 'Perlu Revisi' : 'Menunggu Persetujuan'}
                                            </span>
                                          </div>

                                          {p.status !== 'disetujui_dpl' && (
                                            <div className="space-y-2">
                                              {p.status !== 'revisi' && (
                                                <button
                                                  onClick={() => handleReviewProker(p._id, 'disetujui_dpl')}
                                                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                                                >
                                                  Setujui Proker
                                                </button>
                                              )}
                                              <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <textarea
                                                  placeholder="Catatan revisi..."
                                                  value={revisiNotes[p._id] || ''}
                                                  onChange={(e) => setRevisiNotes({...revisiNotes, [p._id]: e.target.value})}
                                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs mb-2 resize-none h-16 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                ></textarea>
                                                <button
                                                  onClick={() => handleReviewProker(p._id, 'revisi')}
                                                  disabled={!revisiNotes[p._id]}
                                                  className="w-full py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                  {p.status === 'revisi' ? 'Perbarui Revisi' : 'Minta Revisi'}
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {p.status === 'revisi' && p.catatan_revisi && (
                                            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                              <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 mb-1">Catatan Terakhir:</p>
                                              <p className="text-xs text-amber-700 dark:text-amber-300">{p.catatan_revisi}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}

                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add Mentor */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-white/60 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Tugaskan Mentor Lapangan</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Buatkan akun untuk perwakilan instansi yang akan menjadi mentor. Mereka bisa login menggunakan <strong>Nomor HP</strong> sebagai password default.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-200">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddMentor} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap Mentor *</label>
                <input 
                  type="text" 
                  required
                  value={mentorForm.nama_lengkap}
                  onChange={e => setMentorForm({...mentorForm, nama_lengkap: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/20 dark:bg-slate-900/20/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  placeholder="Cth: Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nomor HP/WhatsApp *</label>
                <input 
                  type="text" 
                  required
                  value={mentorForm.nomor_hp}
                  onChange={e => setMentorForm({...mentorForm, nomor_hp: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/20 dark:bg-slate-900/20/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  placeholder="Cth: 08123456789 (Digunakan sbg login & password)"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email (Opsional)</label>
                <input 
                  type="email" 
                  value={mentorForm.email}
                  onChange={e => setMentorForm({...mentorForm, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/20 dark:bg-slate-900/20/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  placeholder="budi@perusahaan.com"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan & Tugaskan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penolakan Instansi */}
      {showRejectModal && selectedPengajuan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-white/60 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl shrink-0">
                🚫
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Ditolak Instansi</h2>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Apakah Anda yakin ingin mengembalikan status <strong>{selectedPengajuan.mahasiswa_id?.nama_lengkap}</strong> menjadi ditolak? Mahasiswa akan dapat mengajukan ulang ke lokasi KKL Plus lain.
            </p>

            <form onSubmit={handleTolakInstansi} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Alasan Penolakan (Wajib)</label>
                <textarea 
                  required
                  rows="3"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/20 dark:bg-slate-900/20/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 text-sm leading-relaxed"
                  placeholder="Cth: Ditolak instansi karena kuota mahasiswa KKL Plus bulan ini sudah penuh..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isRejecting || !rejectReason.trim()}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isRejecting ? "Memproses..." : "Ya, Tolak Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Info Status Kerja Sama */}
      {showStatusInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-500" /> Panduan Status Kerja Sama
            </h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>Status kerja sama instansi menunjukkan tingkat ikatan formal antara <strong>STIMI YAPMI Makassar</strong> dengan lokasi KKL Plus. Ini sangat penting untuk capaian akreditasi kampus (IKU).</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-slate-800 dark:text-slate-100">Belum Ada / Proses Penjajakan:</strong> Kesempatan Bapak/Ibu DPL untuk menjajaki/membuka peluang kerja sama baru dengan pihak instansi.</li>
                <li><strong className="text-slate-800 dark:text-slate-100">MOU (Memorandum of Understanding):</strong> Sudah ada kesepakatan payung (tingkat STIMI YAPMI Makassar). Butuh ditindaklanjuti secara spesifik.</li>
                <li><strong className="text-slate-800 dark:text-slate-100">MOA (Memorandum of Agreement):</strong> Sudah ada kesepakatan rinci teknis.</li>
                <li><strong className="text-slate-800 dark:text-slate-100">IA (Implementation Arrangement):</strong> <span className="text-teal-600 dark:text-teal-400 font-bold">Kasta Tertinggi.</span> Bukti bahwa kegiatan nyata (seperti KKL Plus ini) telah/sedang berjalan.</li>
              </ul>
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-lg text-xs mt-4">
                <strong>Tips:</strong> Jika instansi bersedia meningkatkan status kerja sama (misal dari MoU ke IA), dokumen bisa diunggah oleh POKJA melalui halaman Pusat Dokumen atau diserahkan ke Admin LPPM.
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowStatusInfo(false)} 
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
