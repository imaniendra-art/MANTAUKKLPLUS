"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Check, X, Search, CheckCircle2, Clock, Users, UserCheck, AlertTriangle, MessageSquare, Zap, ExternalLink, Camera, MapPin, Eye, FileText } from "lucide-react";

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
      case 'menunggu_mentor': return <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded shadow-sm">⏳ Menunggu Mentor</span>;
      case 'divalidasi_mentor': return <span className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold rounded shadow-sm">🔹 Divalidasi Mentor</span>;
      case 'divalidasi_dpl': return <span className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold rounded shadow-sm"><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Divalidasi DPL</span>;
      case 'revisi': return <span className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded shadow-sm"><X className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Direvisi</span>;
      default: return <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded shadow-sm">{status}</span>;
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
                {log.proker_id?.judul_proker || "Umum / Personal"}
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
                <button onClick={() => handleViewFile(log.bukti_kegiatan)} className="text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors border border-teal-200">
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
  const [activeTab, setActiveTab] = useState("dpl"); // 'dpl' | 'logbook' | 'monev'
  const [processingId, setProcessingId] = useState(null);

  // Filter khusus Tab Monev
  const [monevFilter, setMonevFilter] = useState("semua"); // 'semua' | 'belum_lengkap' | 'belum_pengantaran' | 'belum_pertengahan' | 'belum_penarikan' | 'tuntas'

  // Modal Detail Kunjungan Monev
  const [selectedMonevDetail, setSelectedMonevDetail] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Ambil seluruh pokja yang aktif di periode ini (disetujui_admin, berjalan, selesai)
      const res = await fetch('/api/pokja?admin=true&status=disetujui_admin,berjalan,selesai');
      const data = await res.json();
      setPokjas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil data monitoring pokja:", error);
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
    const namaDpl = p.dpl_id?.nama_lengkap?.toLowerCase() || "";
    const namaMitra = p.mitra_id?.nama_instansi?.toLowerCase() || "";
    const matchSearch = namaPokja.includes(searchLower) || namaKetua.includes(searchLower) || namaDpl.includes(searchLower) || namaMitra.includes(searchLower);

    if (!matchSearch) return false;

    // Filter tambahan khusus tab Monev
    if (activeTab === 'monev') {
      const summary = p.monev_summary || { total: 0, is_complete: false, has_pengantaran: false, has_pertengahan: false, has_penarikan: false };
      if (monevFilter === 'belum_lengkap') return summary.total < 3;
      if (monevFilter === 'belum_pengantaran') return !summary.has_pengantaran;
      if (monevFilter === 'belum_pertengahan') return !summary.has_pertengahan;
      if (monevFilter === 'belum_penarikan') return !summary.has_penarikan;
      if (monevFilter === 'tuntas') return summary.is_complete;
    }

    return true;
  });

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  // Handler bypass aktivasi penyerahan oleh Admin
  const handleKonfirmasiPenyerahan = async (pokja) => {
    const confirmMsg = `Konfirmasi penyerahan kelompok "${pokja.nama_pokja}"?\n\nTindakan ini akan mengaktifkan status POKJA menjadi "Berjalan" sehingga mahasiswa dapat langsung mengisi logbook kegiatan harian.`;
    if (!window.confirm(confirmMsg)) return;

    setProcessingId(pokja._id);
    try {
      const res = await fetch('/api/pokja', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pokja._id,
          status_pokja: 'berjalan'
        })
      });

      if (res.ok) {
        alert(`Berhasil! Kelompok "${pokja.nama_pokja}" kini resmi berstatus Berjalan. Akses logbook mahasiswa telah terbuka.`);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Gagal mengonfirmasi penyerahan: ${err.error || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan saat memperbarui status pokja.");
    } finally {
      setProcessingId(null);
    }
  };

  // Helper WhatsApp Link
  const formatWaLink = (phone, dplName, pokjaName) => {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    if (!clean.startsWith('62')) clean = '62' + clean;

    const text = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${dplName || 'DPL KKL Plus'},\n\n` +
      `Pemberitahuan dari LPPM STIMI YAPMIM terkait pendampingan kelompok *${pokjaName || 'KKL Plus'}*.\n` +
      `Mohon kesediaannya login ke portal https://kklplus.stimiapps.my.id untuk meninjau penyerahan kelompok dan memasukkan data Mentor Instansi agar logbook kegiatan mahasiswa dapat berjalan lancar.\n\n` +
      `Terima kasih.`
    );
    return `https://wa.me/${clean}?text=${text}`;
  };

  // Helper WhatsApp Link untuk Pengingat Kunjungan Monev
  const formatWaMonevLink = (phone, dplName, pokjaName, summary) => {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    if (!clean.startsWith('62')) clean = '62' + clean;

    const missingVisits = [];
    if (!summary?.has_pengantaran) missingVisits.push("1. Kunjungan Pengantaran");
    if (!summary?.has_pertengahan) missingVisits.push("2. Kunjungan Pertengahan (Monev)");
    if (!summary?.has_penarikan) missingVisits.push("3. Kunjungan Penarikan");

    const text = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${dplName || 'DPL KKL Plus'},\n\n` +
      `Pemberitahuan dari LPPM STIMI YAPMIM terkait dokumentasi kunjungan lapangan kelompok *${pokjaName || 'KKL Plus'}*.\n` +
      `Tercatat progres saat ini: *${summary?.total || 0}/3 Kunjungan*.\n` +
      (missingVisits.length > 0 ? `Dokumentasi kunjungan yang belum terunggah:\n${missingVisits.join('\n')}\n\n` : '') +
      `Mohon kesediaannya untuk melengkapi dokumentasi foto & catatan kunjungan di portal resmi:\nhttps://kklplus.stimiapps.my.id/dpl/monev\n\n` +
      `Terima kasih.`
    );
    return `https://wa.me/${clean}?text=${text}`;
  };

  // Helper cerdas cek keaktifan DPL
  const isDplActive = (dpl, pokja) => {
    if (!dpl) return false;
    if (dpl.last_login) return true;
    if (dpl.isFirstLogin === false) return true;
    if (pokja?.mentor_id) return true;
    return false;
  };

  // Perhitungan Ringkasan Masalah DPL & Proker
  const dplBelumLoginCount = pokjas.filter(p => p.dpl_id && !isDplActive(p.dpl_id, p)).length;
  const pokjaBelumMentorCount = pokjas.filter(p => !p.mentor_id).length;
  const pokjaPendingPenyerahanCount = pokjas.filter(p => p.status_pokja === 'disetujui_admin').length;
  const pokjaBelumAdaProkerCount = pokjas.filter(p => ['berjalan', 'disetujui_admin'].includes(p.status_pokja) && (p.proker_stats?.total || 0) === 0).length;
  const prokerMenungguApprovalCount = pokjas.filter(p => (p.proker_stats?.usulan || 0) > 0).length;

  // Perhitungan KPI Kunjungan Monev DPL
  const monevTuntasCount = pokjas.filter(p => p.monev_summary?.is_complete).length;
  const monevBelumPengantaranCount = pokjas.filter(p => !p.monev_summary?.has_pengantaran).length;
  const monevBelumPertengahanCount = pokjas.filter(p => !p.monev_summary?.has_pertengahan).length;
  const monevBelumPenarikanCount = pokjas.filter(p => !p.monev_summary?.has_penarikan).length;
  const monevBelumLengkapCount = pokjas.filter(p => (p.monev_summary?.total || 0) < 3).length;

  return (
    <DashboardLayout title="Monitoring KKL Plus">
      <div className="space-y-6">
        
        {/* Header & Search */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 lg:p-8 rounded-[2rem] border border-white/60 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Monitoring KKL Plus
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pantau kesiapan DPL, serah terima mentor instansi, kunjungan lapangan 3 kali kegiatan, dan logbook mahasiswa.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-auto flex shrink-0 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari Pokja, DPL, Ketua, Mitra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 pl-10 pr-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white/20 dark:bg-slate-900/20 font-medium text-sm text-slate-900 dark:text-white transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-900/70 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-fit gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dpl")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'dpl'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Kesiapan & Serah Terima DPL
            {pokjaPendingPenyerahanCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-black">
                {pokjaPendingPenyerahanCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("monev")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'monev'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Monitoring Kunjungan DPL (Monev)
            {monevBelumLengkapCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-black">
                {monevBelumLengkapCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("logbook")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'logbook'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Monitoring Logbook Mahasiswa
          </button>
        </div>

        {/* TAB 1: Kesiapan & Serah Terima DPL */}
        {activeTab === 'dpl' && (
          <div className="space-y-6">
            
            {/* Quick KPI Cards (5 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${dplBelumLoginCount > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-teal-50 text-teal-600'}`}>
                  {dplBelumLoginCount > 0 ? '⚠️' : '✅'}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">DPL Belum Login</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{dplBelumLoginCount} Dosen</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-black text-lg shrink-0">
                  ⏳
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Penyerahan</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{pokjaPendingPenyerahanCount} Kelompok</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-lg shrink-0">
                  🏢
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Ada Mentor</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{pokjaBelumMentorCount} Lokasi</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${pokjaBelumAdaProkerCount > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-teal-50 text-teal-600'}`}>
                  📂
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Buat Proker</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{pokjaBelumAdaProkerCount} Kelompok</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${prokerMenungguApprovalCount > 0 ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse' : 'bg-teal-50 text-teal-600'}`}>
                  📝
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proker Menunggu DPL</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{prokerMenungguApprovalCount} Kelompok</p>
                </div>
              </div>
            </div>

            {/* Tabel Monitoring DPL */}
            {loading ? (
              <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat data kesiapan DPL...</div>
            ) : (
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 shadow-sm border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6 whitespace-nowrap">POKJA & Mitra</th>
                        <th className="py-4 px-6">Dosen Pembimbing (DPL)</th>
                        <th className="py-4 px-6">Mentor Instansi</th>
                        <th className="py-4 px-6">Status Program Kerja</th>
                        <th className="py-4 px-6 text-center">Status Kelompok</th>
                        <th className="py-4 px-6 text-center">Aksi Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {filteredPokjas.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                            <div className="text-4xl mb-3">📭</div>
                            Tidak ada kelompok KKL Plus yang cocok dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredPokjas.map((p) => {
                          const isDplLoggedIn = isDplActive(p.dpl_id, p);
                          const dplPhone = p.dpl_id?.nomor_hp;
                          const waLink = formatWaLink(dplPhone, p.dpl_id?.nama_lengkap, p.nama_pokja);

                          return (
                            <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                              {/* Pokja & Mitra */}
                              <td className="py-4 px-6 align-top">
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{p.nama_pokja}</p>
                                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                                  🏢 {p.mitra_id?.nama_instansi || 'Belum pilih mitra'}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-1">
                                  Ketua: {p.ketua_id?.nama_lengkap || '-'} ({p.ketua_id?.nim_nidn || '-'})
                                </p>
                              </td>

                              {/* DPL */}
                              <td className="py-4 px-6 align-top">
                                {p.dpl_id ? (
                                  <div className="space-y-1.5">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                      {p.dpl_id.nama_lengkap}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                      NIDN: {p.dpl_id.nim_nidn || p.dpl_id.nidn || '-'}
                                    </p>
                                    
                                    {/* Status Login DPL */}
                                    <div className="flex items-center gap-2">
                                      {!isDplLoggedIn ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg text-[10px] font-bold">
                                          🔴 Belum Pernah Login
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50 rounded-lg text-[10px] font-bold">
                                          🟢 Sudah Aktif Login
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                    ⚠️ Belum Diplot DPL
                                  </span>
                                )}
                              </td>

                              {/* Mentor Instansi */}
                              <td className="py-4 px-6 align-top">
                                {p.mentor_id ? (
                                  <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                      👤 {p.mentor_id.nama_lengkap}
                                    </p>
                                    {p.mentor_id.nomor_hp && (
                                      <p className="text-xs text-slate-500 font-medium">
                                        📱 {p.mentor_id.nomor_hp}
                                      </p>
                                    )}
                                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md text-[10px] font-bold">
                                      {p.mentor_id.isFirstLogin ? 'Mentor Terdaftar (Belum Login)' : 'Mentor Aktif'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="text-xs text-slate-400 italic">Belum Ada Mentor</span>
                                    <p className="text-[10px] text-slate-400">Didaftarkan saat DPL serah terima</p>
                                  </div>
                                )}
                              </td>

                              {/* Status Program Kerja */}
                              <td className="py-4 px-6 align-top">
                                {['berjalan', 'disetujui_admin'].includes(p.status_pokja) ? (
                                  (p.proker_stats?.total === 0 || !p.proker_stats) ? (
                                    <div className="space-y-1">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Belum Ada Proker
                                      </span>
                                      {p.ketua_id?.nomor_hp && (
                                        <div>
                                          <a 
                                            href={`https://wa.me/${p.ketua_id.nomor_hp.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${p.ketua_id.nama_lengkap || 'Ketua Pokja'}, kelompok KKL Plus Anda (${p.nama_pokja}) saat ini sudah aktif/berjalan. Mohon segera merancang dan mengajukan Program Kerja ke DPL melalui portal resmi MANTAU KKL Plus:\nhttps://kklplus.stimiapps.my.id\n\nTerima kasih.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                                          >
                                            <MessageSquare className="w-3 h-3" /> Chat WA Ketua POKJA
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  ) : (p.proker_stats?.usulan > 0) ? (
                                    <div className="space-y-1">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-800 animate-pulse">
                                        <Clock className="w-3.5 h-3.5" /> {p.proker_stats.usulan} Menunggu DPL
                                      </span>
                                      {p.dpl_id?.nomor_hp && (
                                        <div>
                                          <a 
                                            href={`https://wa.me/${p.dpl_id.nomor_hp.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Yth. Bapak/Ibu ${p.dpl_id.nama_lengkap}, kelompok bimbingan Anda (${p.nama_pokja}) telah mengajukan usulan Program Kerja. Mohon kesediaannya untuk meninjau dan memberikan persetujuan melalui portal MANTAU KKL Plus:\nhttps://kklplus.stimiapps.my.id\n\nTerima kasih.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                                          >
                                            <MessageSquare className="w-3 h-3" /> Chat WA DPL
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  ) : (p.proker_stats?.revisi > 0) ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 text-xs font-bold rounded-lg border border-orange-200 dark:border-orange-800">
                                      <AlertTriangle className="w-3.5 h-3.5" /> {p.proker_stats.revisi} Perlu Revisi
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 text-xs font-bold rounded-lg border border-teal-200 dark:border-teal-800">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> {p.proker_stats?.disetujui || 0} Proker Disetujui
                                    </span>
                                  )
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Menunggu Aktivasi</span>
                                )}
                              </td>

                              {/* Status Kelompok */}
                              <td className="py-4 px-6 align-top text-center">
                                {p.status_pokja === 'berjalan' ? (
                                  <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-bold">
                                    🚀 Berjalan
                                  </span>
                                ) : p.status_pokja === 'disetujui_admin' ? (
                                  <div className="space-y-1">
                                    <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs font-bold">
                                      ⏳ Belum Serah Terima
                                    </span>
                                    <p className="text-[10px] text-slate-400">DPL belum klik konfirmasi penyerahan</p>
                                  </div>
                                ) : (
                                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs font-bold">
                                    {p.status_pokja}
                                  </span>
                                )}
                              </td>

                              {/* Aksi Admin */}
                              <td className="py-4 px-6 align-top text-center">
                                <div className="flex flex-col gap-2 items-center">
                                  {p.status_pokja === 'disetujui_admin' && (
                                    <button
                                      disabled={processingId === p._id}
                                      onClick={() => handleKonfirmasiPenyerahan(p)}
                                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 whitespace-nowrap"
                                    >
                                      <Zap className="w-3.5 h-3.5" /> Konfirmasi Penyerahan
                                    </button>
                                  )}

                                  {/* Tombol Hubungi WhatsApp DPL */}
                                  {waLink ? (
                                    <a
                                      href={waLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs rounded-xl transition-all whitespace-nowrap"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" /> Chat WA DPL
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">No HP DPL belum ada</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Monitoring Kunjungan DPL (Monev) */}
        {activeTab === 'monev' && (
          <div className="space-y-6">
            
            {/* Quick KPI Cards (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-black text-lg shrink-0">
                  🏆
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kunjungan Tuntas (3/3)</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{monevTuntasCount} Pokja</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${monevBelumPengantaranCount > 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200' : 'bg-slate-50 text-slate-400'}`}>
                  🚗
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Pengantaran</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{monevBelumPengantaranCount} Pokja</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${monevBelumPertengahanCount > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200' : 'bg-slate-50 text-slate-400'}`}>
                  📍
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Pertengahan</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{monevBelumPertengahanCount} Pokja</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${monevBelumPenarikanCount > 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200' : 'bg-slate-50 text-slate-400'}`}>
                  🏁
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Penarikan</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{monevBelumPenarikanCount} Pokja</p>
                </div>
              </div>
            </div>

            {/* Filter Bar Kepatuhan Monev */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Status:</span>
                <select
                  value={monevFilter}
                  onChange={(e) => setMonevFilter(e.target.value)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="semua">Semua Kelompok ({pokjas.length})</option>
                  <option value="belum_lengkap">Belum Lengkap &lt; 3 Kunjungan ({monevBelumLengkapCount})</option>
                  <option value="belum_pengantaran">Belum Pengantaran ({monevBelumPengantaranCount})</option>
                  <option value="belum_pertengahan">Belum Pertengahan ({monevBelumPertengahanCount})</option>
                  <option value="belum_penarikan">Belum Penarikan ({monevBelumPenarikanCount})</option>
                  <option value="tuntas">Kunjungan Tuntas 3/3 ({monevTuntasCount})</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                Menampilkan <strong className="text-slate-800 dark:text-white">{filteredPokjas.length}</strong> dari {pokjas.length} kelompok
              </div>
            </div>

            {/* Tabel Monitoring Kunjungan Monev DPL */}
            {loading ? (
              <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat data monitoring kunjungan DPL...</div>
            ) : (
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 shadow-sm border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6 whitespace-nowrap">POKJA & Mitra</th>
                        <th className="py-4 px-6">Dosen Pembimbing (DPL)</th>
                        <th className="py-4 px-6 text-center">1. Pengantaran</th>
                        <th className="py-4 px-6 text-center">2. Pertengahan</th>
                        <th className="py-4 px-6 text-center">3. Penarikan</th>
                        <th className="py-4 px-6 text-center">Total Progres</th>
                        <th className="py-4 px-6 text-center">Pengingat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {filteredPokjas.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                            <div className="text-4xl mb-3">📭</div>
                            Tidak ada data kelompok yang sesuai dengan filter monev.
                          </td>
                        </tr>
                      ) : (
                        filteredPokjas.map((p) => {
                          const monevDetail = p.monev_detail || {};
                          const summary = p.monev_summary || { total: 0, is_complete: false };
                          const waMonevLink = formatWaMonevLink(p.dpl_id?.nomor_hp, p.dpl_id?.nama_lengkap, p.nama_pokja, summary);

                          const renderVisitBadge = (record, jenisName) => {
                            if (!record) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700">
                                  ⚪ Belum Ada
                                </span>
                              );
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => setSelectedMonevDetail({ pokja: p, monev: record, jenis: jenisName })}
                                className="inline-flex flex-col items-center gap-0.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-bold border border-teal-200 dark:border-teal-800 transition shadow-2xs group"
                              >
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                  <span>Sudah Upload</span>
                                  <Eye className="w-3 h-3 text-teal-500 group-hover:scale-110 transition-transform" />
                                </span>
                                <span className="text-[10px] text-teal-600/80 dark:text-teal-400/80 font-medium">
                                  {new Date(record.tanggal_kunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                              </button>
                            );
                          };

                          return (
                            <tr key={`monev-${p._id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                              {/* POKJA & Mitra */}
                              <td className="py-4 px-6 align-middle">
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{p.nama_pokja}</p>
                                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                                  🏢 {p.mitra_id?.nama_instansi || 'Belum pilih mitra'}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {p.mitra_id?.wilayah || p.mitra_id?.kecamatan || '-'}
                                </p>
                              </td>

                              {/* DPL */}
                              <td className="py-4 px-6 align-middle">
                                {p.dpl_id ? (
                                  <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                      {p.dpl_id.nama_lengkap}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                      {p.dpl_id.nomor_hp || `NIDN: ${p.dpl_id.nim_nidn || p.dpl_id.nidn || '-'}`}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-amber-600 font-medium">Belum Diplot DPL</span>
                                )}
                              </td>

                              {/* 1. Pengantaran */}
                              <td className="py-4 px-6 align-middle text-center">
                                {renderVisitBadge(monevDetail.pengantaran, "Pengantaran")}
                              </td>

                              {/* 2. Pertengahan */}
                              <td className="py-4 px-6 align-middle text-center">
                                {renderVisitBadge(monevDetail.pertengahan, "Pertengahan")}
                              </td>

                              {/* 3. Penarikan */}
                              <td className="py-4 px-6 align-middle text-center">
                                {renderVisitBadge(monevDetail.penarikan, "Penarikan")}
                              </td>

                              {/* Total Progres */}
                              <td className="py-4 px-6 align-middle text-center">
                                <div className="flex flex-col items-center gap-1.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                    summary.total === 3 
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                      : summary.total > 0 
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' 
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                  }`}>
                                    {summary.total} / 3 Selesai
                                  </span>
                                  <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all duration-300 ${summary.total === 3 ? 'bg-emerald-500' : 'bg-teal-500'}`} 
                                      style={{ width: `${(summary.total / 3) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>

                              {/* Pengingat WA */}
                              <td className="py-4 px-6 align-middle text-center">
                                {summary.total === 3 ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    <Check className="w-4 h-4" /> Lengkap
                                  </span>
                                ) : waMonevLink ? (
                                  <a
                                    href={waMonevLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs rounded-xl transition-all whitespace-nowrap"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" /> Ingatkan DPL
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No HP belum ada</span>
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
            )}
          </div>
        )}

        {/* TAB 3: Monitoring Logbook Mahasiswa */}
        {activeTab === 'logbook' && (
          <div className="space-y-6">
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
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Riwayat Logbook</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {filteredPokjas.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                            <div className="text-4xl mb-3">📭</div>
                            Tidak ada kelompok KKL Plus aktif ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredPokjas.map((p) => (
                          <React.Fragment key={p._id}>
                            <tr className={`transition-colors ${expandedId === p._id ? 'bg-teal-50/30 dark:bg-teal-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/20'}`}>
                              <td className="py-4 px-6 align-middle">
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{p.nama_pokja}</p>
                                <p className="text-xs text-slate-500 font-medium">Ketua: {p.ketua_id?.nama_lengkap || '-'}</p>
                              </td>
                              <td className="py-4 px-6 align-middle">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  {p.mitra_id?.nama_instansi || '-'}
                                </p>
                              </td>
                              <td className="py-4 px-6 align-middle">
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                  {p.dpl_id?.nama_lengkap || <span className="text-slate-400 italic">Belum diset</span>}
                                </p>
                              </td>
                              <td className="py-4 px-6 align-middle text-center">
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                                  p.status_pokja === 'berjalan'
                                    ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {p.status_pokja === 'berjalan' ? 'Berjalan' : 'Persiapan (Disetujui)'}
                                </span>
                              </td>
                              <td className="py-4 px-6 align-middle text-center">
                                <button 
                                  onClick={() => toggleExpand(p._id)}
                                  className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap shadow-sm dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50 dark:hover:bg-teal-900/50"
                                >
                                  <span>📋</span> {expandedId === p._id ? 'Tutup Logbook' : 'Lihat Logbook'}
                                </button>
                              </td>
                            </tr>
                            {/* Expandable Row Content */}
                            {expandedId === p._id && (
                              <tr>
                                <td colSpan="5" className="p-0 border-b-2 border-teal-200 dark:border-teal-800/50">
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
        )}

      </div>

      {/* MODAL PREVIEW DETAIL DOKUMENTASI MONEV */}
      {selectedMonevDetail && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 uppercase tracking-wider">
                  Kunjungan {selectedMonevDetail.jenis}
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1">
                  {selectedMonevDetail.pokja.nama_pokja}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  DPL: {selectedMonevDetail.pokja.dpl_id?.nama_lengkap || '-'} • Mitra: {selectedMonevDetail.pokja.mitra_id?.nama_instansi || '-'}
                </p>
              </div>
              <button
                onClick={() => setSelectedMonevDetail(null)}
                className="w-9 h-9 rounded-full bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-300 flex items-center justify-center text-slate-600 dark:text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Info Tanggal */}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Tanggal Pelaksanaan: <strong>{new Date(selectedMonevDetail.monev.tanggal_kunjungan).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
              </div>

              {/* Bukti Foto */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Foto Dokumentasi Kegiatan:</p>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center group max-h-[360px]">
                  <img
                    src={selectedMonevDetail.monev.foto_url}
                    alt={`Dokumentasi ${selectedMonevDetail.jenis}`}
                    className="w-full h-auto max-h-[360px] object-contain"
                  />
                  <a
                    href={selectedMonevDetail.monev.foto_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Ukuran Penuh
                  </a>
                </div>
              </div>

              {/* Catatan Kunjungan */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Catatan / Temuan Lapangan DPL:
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedMonevDetail.monev.catatan || (
                    <span className="italic text-slate-400">Tidak ada catatan tertulis yang disertakan.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedMonevDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-semibold text-sm transition"
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
