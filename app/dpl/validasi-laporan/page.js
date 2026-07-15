"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "@/components/AuthProvider";
import { Check, X, ChevronDown, ChevronUp, Award, Link, MessageCircle } from "lucide-react";

const DEFAULT_SECTIONS_INDIVIDU = {
  bab1: [
    { id: '1_1', title: '1.1 Latar Belakang dan Rasionalisasi Pemilihan Mitra' },
    { id: '1_2', title: '1.2 Tujuan dan Manfaat Pelaksanaan KKL Plus' }
  ],
  bab2: [
    { id: '2_1', title: '2.1 Deskripsi Posisi dan Uraian Tugas (Job Description)' },
    { id: '2_2', title: '2.2 Observasi Budaya dan Lingkungan Kerja Mitra' }
  ],
  bab3: [
    { id: '3_1', title: '3.1 Relevansi Praktik Kerja dengan Kerangka Teoretis' },
    { id: '3_2', title: '3.2 Identifikasi Kendala dan Strategi Pemecahan Masalah' },
    { id: '3_3', title: '3.3 Pengembangan Kompetensi Teknis dan Non-Teknis (Hard & Soft Skills)' }
  ],
  bab4: [
    { id: '4_1', title: '4.1 Kesimpulan' },
    { id: '4_2', title: '4.2 Evaluasi Diri dan Rekomendasi' }
  ],
  bab5: []
};

const DEFAULT_SECTIONS_KELOMPOK = {
  bab1: [
    { id: '1_1', title: '1.1 Latar Belakang dan Rasionalisasi Program Kerja' },
    { id: '1_2', title: '1.2 Tujuan dan Sasaran Strategis Program Kerja' }
  ],
  bab2: [
    { id: '2_1', title: '2.1 Tinjauan Historis dan Profil Institusi Mitra' },
    { id: '2_2', title: '2.2 Struktur Organisasi dan Tata Kelola (Manajemen) Mitra' },
    { id: '2_3', title: '2.3 Identifikasi Kesenjangan (Gap Analysis) dan Kebutuhan Mitra' }
  ],
  bab3: [
    { id: '3_1', title: '3.1 Deskripsi Komprehensif Pelaksanaan Program Kerja' },
    { id: '3_2', title: '3.2 Evaluasi Capaian dan Indikator Keberhasilan Program (KPI)' }
  ],
  bab4: [
    { id: '4_1', title: '4.1 Kesimpulan dan Sintesis Kegiatan Kelompok' },
    { id: '4_2', title: '4.2 Rekomendasi Manajerial dan Strategis' }
  ],
  bab5: []
};

const safeParse = (str) => {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const parseCatatan = (catatan) => {
  if (!catatan) return {};
  try {
    const parsed = JSON.parse(catatan);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
    return { global: catatan };
  } catch (e) {
    return { global: catatan };
  }
};

export default function DplValidasiLaporan() {
  const { data: session } = useSession();
  const [laporans, setLaporans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedPokja, setExpandedPokja] = useState(null);
  const [catatanDraft, setCatatanDraft] = useState({});
  const [activeTab, setActiveTab] = useState('validasi'); // 'validasi' or 'penilaian'
  const [pokjas, setPokjas] = useState([]);

  const togglePokja = (id) => {
    setExpandedPokja(prev => prev === id ? null : id);
  };

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/laporan-akhir?role=dpl&dplId=${session.user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setLaporans(data);

      const resPokja = await fetch(`/api/pokja?dplId=${session.user.id}`);
      const dataPokja = await resPokja.json();
      if (Array.isArray(dataPokja)) setPokjas(dataPokja);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleValidasi = async (id, newStatus) => {
    try {
      const payload = { 
        id, 
        status: newStatus, 
        catatan_dpl: newStatus === 'revisi' ? JSON.stringify(catatanDraft) : "" 
      };
      
      const res = await fetch('/api/laporan-akhir', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(newStatus === 'disetujui' ? "Laporan Berhasil Disetujui!" : "Laporan dikembalikan untuk revisi.");
        setExpandedRow(null);
        setCatatanDraft({});
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Gagal mengupdate laporan: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      alert(`Terjadi kesalahan sistem: ${error.message}`);
    }
  };

  const toggleExpand = (laporan) => {
    if (expandedRow === laporan._id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(laporan._id);
      setCatatanDraft(parseCatatan(laporan.catatan_dpl));
    }
  };

  const handleCatatanChange = (key, val) => {
    setCatatanDraft(prev => ({ ...prev, [key]: val }));
  };

  const renderText = (text) => {
    return text ? text : <span className="text-slate-400 italic">Belum diisi</span>;
  };

  const filteredLaporans = laporans;
  
  const groupedLaporans = filteredLaporans.reduce((acc, laporan) => {
    const pokjaId = laporan.pokja_id?._id || 'unknown';
    const pokjaName = laporan.pokja_id?.nama_pokja || 'Tanpa Kelompok';
    const mitraName = laporan.pokja_id?.mitra_id?.nama_instansi || 'N/A';
    
    if (!acc[pokjaId]) {
      acc[pokjaId] = {
        id: pokjaId,
        nama_pokja: pokjaName,
        mitra: mitraName,
        laporans: []
      };
    }
    acc[pokjaId].laporans.push(laporan);
    return acc;
  }, {});
  const groupedLaporansArr = Object.values(groupedLaporans);

  return (
    <DashboardLayout title="Validasi Laporan Akhir (DPL)">
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-8 py-3.5 rounded-full shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-300 font-bold flex items-center gap-2.5 border border-teal-500">
          <span><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> {toastMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white rounded-t-2xl border-b border-slate-200 p-2 gap-2 shadow-sm mb-6 flex-wrap">
        <button 
          onClick={() => { setActiveTab('validasi'); setExpandedRow(null); }} 
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'validasi' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Check className="w-4 h-4" /> Validasi Laporan
        </button>
        <button 
          onClick={() => { setActiveTab('penilaian'); setExpandedRow(null); }} 
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'penilaian' ? 'bg-fuchsia-100 text-fuchsia-800' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Award className="w-4 h-4" /> Penilaian Mahasiswa
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat data...</div>
      ) : activeTab === 'validasi' ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6 font-bold">Jenis / Pembuat Laporan</th>
                    <th className="py-4 px-6 font-bold">Tempat KKL Plus</th>
                    <th className="py-4 px-6 font-bold text-center">Status</th>
                    <th className="py-4 px-6 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLaporans.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-500 font-medium">
                        Belum ada laporan {activeTab === 'validasi' ? 'yang perlu divalidasi' : 'yang siap untuk dinilai (harus disetujui terlebih dahulu)'}.
                      </td>
                    </tr>
                  ) : (
                    groupedLaporansArr.map((group) => {
                      const isPokjaExpanded = expandedPokja === group.id;
                      
                      return (
                        <React.Fragment key={group.id}>
                          {/* Group Header Row */}
                          <tr 
                            className="bg-slate-50 cursor-pointer hover:bg-slate-100 border-y border-slate-200"
                            onClick={() => togglePokja(group.id)}
                          >
                            <td colSpan="4" className="py-4 px-6">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  <div className="p-1.5 bg-slate-200 rounded-lg">
                                    {isPokjaExpanded ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800 text-base">{group.nama_pokja}</p>
                                    <p className="text-sm text-slate-500">{group.mitra}</p>
                                  </div>
                                </div>
                                <div className="bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                                  {group.laporans.length} Laporan
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Group Items */}
                          {isPokjaExpanded && group.laporans.map((laporan) => {
                            const isExpanded = expandedRow === laporan._id;
                            const sections = laporan.tipe_laporan === 'individu' ? DEFAULT_SECTIONS_INDIVIDU : DEFAULT_SECTIONS_KELOMPOK;
                            const bab1Data = safeParse(laporan.bab1_pendahuluan);
                            const bab2Data = safeParse(laporan.bab2_metode);
                            const bab3Data = safeParse(laporan.bab3_profil);
                            const bab4Data = safeParse(laporan.bab4_hasil);
                            const bab5Data = safeParse(laporan.bab5_penutup);

                            return (
                              <React.Fragment key={laporan._id}>
                                <tr className={`transition-colors ${isExpanded ? 'bg-teal-50/50' : 'hover:bg-slate-50'} border-b border-slate-100`}>
                                  <td className="py-4 px-6 align-middle pl-12">
                              {laporan.tipe_laporan === 'pokja' ? (
                                <>
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700 mb-1 border border-teal-200 uppercase">Laporan Kelompok</span>
                                  <p className="font-bold text-sm text-slate-800">{laporan.pokja_id?.nama_pokja}</p>
                                  <p className="text-xs text-slate-500 mt-1">Pokja / Kelompok</p>
                                </>
                              ) : (
                                <>
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700 mb-1 border border-teal-200 uppercase">Laporan Individu</span>
                                  <p className="font-bold text-sm text-slate-800">{laporan.mahasiswa_id?.nama_lengkap || 'Tanpa Nama'}</p>
                                  <p className="text-xs text-slate-500 mt-1">{laporan.mahasiswa_id?.nim_nidn || '-'}</p>
                                </>
                              )}
                            </td>
                            <td className="py-4 px-6 align-middle">
                              <p className="text-sm font-medium text-slate-700">
                                {laporan.pokja_id?.mitra_id?.nama_instansi || 'N/A'}
                              </p>
                            </td>
                            <td className="py-4 px-6 align-middle text-center">
                              {laporan.status === 'submitted' && (
                                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">Perlu Diperiksa</span>
                              )}
                              {laporan.status === 'revisi' && (
                                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">Menunggu Revisi</span>
                              )}
                              {laporan.status === 'disetujui' && (
                                <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">Disetujui</span>
                              )}
                            </td>
                            <td className="py-4 px-6 align-middle text-right">
                              <div className="flex justify-end gap-2 flex-wrap">
                                <a 
                                  href={`/mahasiswa/laporan/cetak/laporan?id=${laporan._id}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg transition-colors border border-teal-200"
                                >
                                  📄 Cetak PDF
                                </a>
                                
                                <button 
                                  onClick={() => toggleExpand(laporan)}
                                  className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors border flex items-center gap-1 ${
                                    isExpanded 
                                      ? 'bg-teal-600 text-white border-teal-700 hover:bg-teal-700' 
                                      : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                                  }`}
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  {isExpanded ? 'Tutup Revisi' : 'Periksa & Revisi'}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Row for Validation */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="4" className="p-0 border-b border-teal-100">
                                <div className="bg-teal-50/30 p-6 md:p-8 shadow-inner border-y border-teal-100">
                                  <div className="max-w-4xl mx-auto space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="border-b pb-4">
                                      <h3 className="text-xl font-bold text-slate-800">Form Validasi Laporan Akhir</h3>
                                      <p className="text-slate-500 text-sm mt-1">Berikan catatan revisi spesifik pada tiap bagian yang menurut Anda kurang tepat.</p>
                                    </div>

                                    {/* Catatan Umum */}
                                    <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                      <h4 className="font-bold text-slate-700 text-lg flex items-center gap-2">Catatan Revisi Umum</h4>
                                      <p className="text-xs text-slate-500">Gunakan kolom ini untuk revisi yang mencakup keseluruhan laporan (misal: format, tata bahasa, daftar isi, dll).</p>
                                      <textarea
                                        placeholder="Tambahkan catatan revisi umum di sini..."
                                        value={catatanDraft.global || ''}
                                        onChange={(e) => handleCatatanChange('global', e.target.value)}
                                        className="w-full h-24 border-amber-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-amber-500 text-sm placeholder:text-slate-300 shadow-sm"
                                      ></textarea>
                                    </div>

                                    {/* Kata Pengantar */}
                                    <div className="space-y-3">
                                      <h4 className="font-bold text-slate-700 text-lg">Kata Pengantar</h4>
                                      <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                                        {renderText(laporan.kata_pengantar)}
                                      </div>
                                      <textarea
                                        placeholder="Tambahkan catatan revisi untuk Kata Pengantar (opsional)..."
                                        value={catatanDraft.kata_pengantar || ''}
                                        onChange={(e) => handleCatatanChange('kata_pengantar', e.target.value)}
                                        className="w-full h-20 border-amber-200 bg-amber-50/30 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 text-sm placeholder:text-amber-300"
                                      ></textarea>
                                    </div>

                                    {/* Bab 1 */}
                                    <div className="space-y-6 pt-4 border-t border-slate-100">
                                      <h4 className="font-bold text-slate-800 text-lg">BAB I. Pendahuluan</h4>
                                      {sections.bab1.map((sec) => {
                                        const studentText = bab1Data.find(s => s.id === sec.id)?.content || '';
                                        return (
                                          <div key={sec.id} className="space-y-2">
                                            <div className="font-bold text-sm text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">{sec.title}</div>
                                            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                                              {renderText(studentText)}
                                            </div>
                                            <textarea
                                              placeholder={`Catatan revisi untuk ${sec.title}...`}
                                              value={catatanDraft[sec.id] || ''}
                                              onChange={(e) => handleCatatanChange(sec.id, e.target.value)}
                                              className="w-full h-20 border-amber-200 bg-amber-50/30 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 text-sm placeholder:text-amber-300"
                                            ></textarea>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Bab 2 */}
                                    <div className="space-y-6 pt-4 border-t border-slate-100">
                                      <h4 className="font-bold text-slate-800 text-lg">BAB II. Metode Pelaksanaan / Analisis</h4>
                                      {sections.bab2.map((sec) => {
                                        const studentText = bab2Data.find(s => s.id === sec.id)?.content || '';
                                        return (
                                          <div key={sec.id} className="space-y-2">
                                            <div className="font-bold text-sm text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">{sec.title}</div>
                                            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                                              {renderText(studentText)}
                                            </div>
                                            <textarea
                                              placeholder={`Catatan revisi untuk ${sec.title}...`}
                                              value={catatanDraft[sec.id] || ''}
                                              onChange={(e) => handleCatatanChange(sec.id, e.target.value)}
                                              className="w-full h-20 border-amber-200 bg-amber-50/30 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 text-sm placeholder:text-amber-300"
                                            ></textarea>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Bab 3 */}
                                    <div className="space-y-6 pt-4 border-t border-slate-100">
                                      <h4 className="font-bold text-slate-800 text-lg">BAB III. Hasil dan Pembahasan</h4>
                                      {sections.bab3.map((sec) => {
                                        const studentText = bab3Data.find(s => s.id === sec.id)?.content || '';
                                        return (
                                          <div key={sec.id} className="space-y-2">
                                            <div className="font-bold text-sm text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">{sec.title}</div>
                                            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                                              {renderText(studentText)}
                                            </div>
                                            <textarea
                                              placeholder={`Catatan revisi untuk ${sec.title}...`}
                                              value={catatanDraft[sec.id] || ''}
                                              onChange={(e) => handleCatatanChange(sec.id, e.target.value)}
                                              className="w-full h-20 border-amber-200 bg-amber-50/30 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 text-sm placeholder:text-amber-300"
                                            ></textarea>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Bab 4 */}
                                    <div className="space-y-6 pt-4 border-t border-slate-100">
                                      <h4 className="font-bold text-slate-800 text-lg">BAB IV. Penutup</h4>
                                      {sections.bab4.map((sec) => {
                                        const studentText = bab4Data.find(s => s.id === sec.id)?.content || '';
                                        return (
                                          <div key={sec.id} className="space-y-2">
                                            <div className="font-bold text-sm text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">{sec.title}</div>
                                            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                                              {renderText(studentText)}
                                            </div>
                                            <textarea
                                              placeholder={`Catatan revisi untuk ${sec.title}...`}
                                              value={catatanDraft[sec.id] || ''}
                                              onChange={(e) => handleCatatanChange(sec.id, e.target.value)}
                                              className="w-full h-20 border-amber-200 bg-amber-50/30 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 text-sm placeholder:text-amber-300"
                                            ></textarea>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Lampiran Dokumen */}
                                    {(laporan.file_pengantar || laporan.file_penerimaan || laporan.file_keterangan || laporan.file_struktur_organisasi) && (
                                      <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <h4 className="font-bold text-slate-800 text-lg">Lampiran Dokumen</h4>
                                        <div className="flex flex-wrap gap-3">
                                          {laporan.file_pengantar && (
                                            <a href={laporan.file_pengantar} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors">
                                              <Link className="w-4 h-4" /> Surat Pengantar
                                            </a>
                                          )}
                                          {laporan.file_penerimaan && (
                                            <a href={laporan.file_penerimaan} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors">
                                              <Link className="w-4 h-4" /> Surat Penerimaan
                                            </a>
                                          )}
                                          {laporan.file_keterangan && (
                                            <a href={laporan.file_keterangan} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors">
                                              <Link className="w-4 h-4" /> Surat Selesai KKL
                                            </a>
                                          )}
                                          {laporan.file_struktur_organisasi && (
                                            <a href={laporan.file_struktur_organisasi} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors">
                                              <Link className="w-4 h-4" /> Struktur Organisasi
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="pt-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border">
                                      {laporan.status !== 'disetujui' && (
                                        <>
                                          <button 
                                            onClick={() => handleValidasi(laporan._id, 'revisi')}
                                            className="px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm"
                                          >
                                            <X className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Kirim Revisi ke Mahasiswa
                                          </button>
                                          <button 
                                            onClick={() => {
                                              if(confirm("Yakin ingin menyetujui laporan ini tanpa revisi lanjutan?")) {
                                                handleValidasi(laporan._id, 'disetujui');
                                              }
                                            }}
                                            className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
                                          >
                                            <Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Setujui Laporan
                                          </button>
                                        </>
                                      )}
                                      <button 
                                        onClick={() => setExpandedRow(null)}
                                        className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                      >
                                        Tutup
                                      </button>
                                    </div>

                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                            })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-amber-800 text-lg flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" /> Penilaian KKL Plus (DPL)
            </h3>
            <p className="text-amber-700 text-sm">
              Berikan penilaian untuk capaian kelompok dan capaian individu mahasiswa (Skala 0-100).<br/>
              <b>Bantuan untuk Mentor:</b> Nilai Mentor (Bobot 20%) diisi secara terpisah. Anda dapat membantu Mentor dengan mengirimkan link form penilaian mereka:
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6 font-bold w-[15%]">Nama Kelompok</th>
                    <th className="py-4 px-6 font-bold w-[15%]">Ketua Kelompok</th>
                    <th className="py-4 px-6 font-bold w-[20%]">Lokasi / Mitra</th>
                    <th className="py-4 px-6 font-bold w-[15%]">Nama Mentor</th>
                    <th className="py-4 px-6 font-bold w-[15%]">No WA</th>
                    <th className="py-4 px-6 font-bold text-right w-[20%]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pokjas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                        Belum ada kelompok bimbingan yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    pokjas.map((pokja) => (
                      <tr key={pokja._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 align-middle">
                          <p className="font-bold text-sm text-slate-800">{pokja.nama_pokja}</p>
                        </td>
                        <td className="py-4 px-6 align-middle">
                          <p className="text-sm text-slate-700">{pokja.ketua_id?.nama_lengkap || '-'}</p>
                        </td>
                        <td className="py-4 px-6 align-middle">
                          <p className="text-sm font-medium text-slate-700">{pokja.mitra_id?.nama_instansi || '-'}</p>
                        </td>
                        <td className="py-4 px-6 align-middle">
                          <p className="text-sm text-slate-700">{pokja.mentor_id?.nama_lengkap || '-'}</p>
                        </td>
                        <td className="py-4 px-6 align-middle">
                          {pokja.mentor_id?.nomor_hp ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm text-slate-700">{pokja.mentor_id.nomor_hp}</p>
                              <button
                                onClick={() => {
                                  const url = `${window.location.origin}/penilaian-mentor/${pokja._id}`;
                                  let phone = pokja.mentor_id.nomor_hp.replace(/[^0-9]/g, '');
                                  if (phone.startsWith('0')) phone = '62' + phone.substring(1);
                                  const msg = `Halo Bapak/Ibu ${pokja.mentor_id.nama_lengkap},\n\nBerikut adalah link untuk mengisi form penilaian KKL Plus mahasiswa kelompok *${pokja.nama_pokja}*:\n\n${url}\n\nTerima kasih.`;
                                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="text-[10px] bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded transition-colors border border-green-200 flex items-center gap-1 shrink-0"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-700">-</p>
                          )}
                        </td>
                        <td className="py-4 px-6 align-middle text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button 
                              onClick={() => {
                                const url = `${window.location.origin}/penilaian-mentor/${pokja._id}`;
                                navigator.clipboard.writeText(url);
                                showToast("Link Penilaian Mentor disalin!");
                              }}
                              className="inline-flex text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-2.5 rounded-lg transition-colors border border-slate-200 items-center gap-1.5"
                            >
                              <Link className="w-3.5 h-3.5" /> Copy Link
                            </button>
                            <a
                              href={`/dpl/penilaian/${pokja._id}`}
                              className="inline-flex text-xs font-bold text-fuchsia-700 bg-fuchsia-50 hover:bg-fuchsia-100 px-4 py-2.5 rounded-lg transition-colors border border-fuchsia-200 items-center gap-1.5"
                            >
                              <Award className="w-4 h-4" /> Nilai Kelompok Ini
                            </a>
                          </div>
                        </td>
                      </tr>
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
