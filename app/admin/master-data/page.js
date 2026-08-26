"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Check, Edit2, Trash2, FileText, CheckCircle, XCircle, 
  Users, User, Building2, Search, Eye, AlertCircle, Phone, 
  Mail, GraduationCap, X, UserCheck, Clock, ShieldCheck,
  ChevronRight, Calendar, Info
} from "lucide-react";

export default function MasterData() {
  const [mounted, setMounted] = useState(false);
  // Data State
  const [mitras, setMitras] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [pokjas, setPokjas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mitra");

  // Modals State
  const [showMitraModal, setShowMitraModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Form State
  const [mitraForm, setMitraForm] = useState({ id: null, nama_instansi: "", kategori: "Pemerintahan & Desa (Sektor Publik)", deskripsi_singkat: "", kuota_maksimal: 0 });
  
  // Posisi State
  const [showKelolaPosisiModal, setShowKelolaPosisiModal] = useState(false);
  const [selectedMitraForPosisi, setSelectedMitraForPosisi] = useState(null);
  const [posisiList, setPosisiList] = useState([]);
  const [showPosisiFormModal, setShowPosisiFormModal] = useState(false);
  const [posisiForm, setPosisiForm] = useState({ 
    id: null, nama_posisi: "", konsentrasi: "SDM", kuota: 1, 
    deskripsi_pekerjaan: "", kriteria_kandidat: "", sistem_kerja: "WFO" 
  });
  
  // Pagination State for Mitra
  const [currentPageMitra, setCurrentPageMitra] = useState(1);
  const itemsPerPage = 8;

  // Pokja States & Filters
  const [searchPokja, setSearchPokja] = useState("");
  const [statusFilterPokja, setStatusFilterPokja] = useState("all");
  const [currentPagePokja, setCurrentPagePokja] = useState(1);
  const pokjasPerPage = 8;
  const [selectedPokjaDetail, setSelectedPokjaDetail] = useState(null);
  const [showPokjaDetailModal, setShowPokjaDetailModal] = useState(false);
  const [showEditPokjaModal, setShowEditPokjaModal] = useState(false);
  const [editPokjaForm, setEditPokjaForm] = useState({ id: "", nama_pokja: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mitraRes, mentorRes, pokjaRes] = await Promise.all([
        fetch('/api/mitra'),
        fetch('/api/admin/pengguna?role=mentor'),
        fetch('/api/pokja?admin=true&status=all')
      ]);
      const [mitraData, mentorData, pokjaData] = await Promise.all([
        mitraRes.json(),
        mentorRes.json(),
        pokjaRes.json()
      ]);
      
      if (Array.isArray(mitraData)) setMitras(mitraData);
      if (Array.isArray(mentorData)) setMentors(mentorData);
      if (Array.isArray(pokjaData)) setPokjas(pokjaData);
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setLoading(false);
    }
  };

  // Mentor State & Handlers
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [showEditMentorModal, setShowEditMentorModal] = useState(false);
  const [mentorForm, setMentorForm] = useState({ id: null, nidn: "", nama_lengkap: "", nomor_hp: "", email: "", lokasi: "", devisi: "" });
  const [currentPageMentor, setCurrentPageMentor] = useState(1);
  const mentorsPerPage = 8;
  const indexOfLastMentor = currentPageMentor * mentorsPerPage;
  const indexOfFirstMentor = indexOfLastMentor - mentorsPerPage;
  const currentMentors = mentors.slice(indexOfFirstMentor, indexOfLastMentor);
  const totalPagesMentor = Math.ceil(mentors.length / mentorsPerPage);

  const handleMentorSubmit = async (e, isEdit) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/pengguna', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mentorForm, role: 'mentor', nim_nidn: mentorForm.nidn })
      });
      if (res.ok) {
        if(isEdit) setShowEditMentorModal(false);
        else setShowAddMentorModal(false);
        setMentorForm({ id: null, nidn: "", nama_lengkap: "", nomor_hp: "", email: "", lokasi: "", devisi: "" });
        setToastMessage(isEdit ? "Mentor diperbarui!" : "Mentor ditambahkan!");
        setTimeout(() => setToastMessage(""), 3000);
        fetchData();
      } else {
        const data = await res.json();
        setToastMessage(data.error || "Gagal menyimpan mentor");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (error) { 
        setToastMessage("Terjadi kesalahan sistem"); 
        setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleDeleteMentor = async (id) => {
    if (!window.confirm("Hapus mentor ini?")) return;
    try {
      const res = await fetch(`/api/admin/pengguna?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setToastMessage("Mentor berhasil dihapus!");
        setTimeout(() => setToastMessage(""), 3000);
        fetchData();
      }
    } catch (error) { 
        setToastMessage("Terjadi kesalahan sistem"); 
        setTimeout(() => setToastMessage(""), 3000);
    }
  };

  // Pokja Handlers
  const handleEditPokjaSubmit = async (e) => {
    e.preventDefault();
    if (!editPokjaForm.nama_pokja.trim()) return;
    try {
      const res = await fetch('/api/pokja', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editPokjaForm.id,
          action: 'rename',
          nama_pokja: editPokjaForm.nama_pokja
        })
      });
      if (res.ok) {
        setShowEditPokjaModal(false);
        setEditPokjaForm({ id: "", nama_pokja: "" });
        showToast("Nama POKJA berhasil diperbarui!");
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal mengubah nama Pokja");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan sistem");
    }
  };

  const handleDeletePokja = async (id, nama) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${nama || 'POKJA'}"? Semua data anggota, proker, dan logbook terkait kelompok ini akan ikut dibersihkan.`)) return;
    try {
      const res = await fetch(`/api/pokja?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("POKJA berhasil dihapus!");
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menghapus POKJA");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan sistem");
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleMitraSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = '/api/mitra';
      const method = mitraForm.id ? 'PATCH' : 'POST';
      const body = {
        nama_instansi: mitraForm.nama_instansi,
        kategori: mitraForm.kategori,
        deskripsi_singkat: mitraForm.deskripsi_singkat,
        kuota_maksimal: mitraForm.kuota_maksimal
      };
      if (mitraForm.id) body.id = mitraForm.id;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowMitraModal(false);
        setMitraForm({ id: null, nama_instansi: "", kategori: "Pemerintahan & Desa (Sektor Publik)", deskripsi_singkat: "", kuota_maksimal: 0 });
        showToast(mitraForm.id ? "Data Mitra berhasil diperbarui!" : "Data Mitra berhasil disimpan!");
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMitra = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus Mitra ini? Semua posisi KKL Plus yang terkait akan ikut terhapus!")) return;
    try {
      const res = await fetch(`/api/mitra?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Mitra berhasil dihapus!");
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  // Posisi Handlers
  const fetchPosisi = async (mitraId) => {
    try {
      const res = await fetch(`/api/posisi?mitraId=${mitraId}`);
      if (res.ok) {
        const data = await res.json();
        setPosisiList(data);
      }
    } catch (error) { console.error("Gagal fetch posisi", error); }
  };

  const handleOpenKelolaPosisi = (mitra) => {
    setSelectedMitraForPosisi(mitra);
    fetchPosisi(mitra._id);
    setShowKelolaPosisiModal(true);
  };

  const handlePosisiSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = '/api/posisi';
      const method = posisiForm.id ? 'PATCH' : 'POST';
      const body = { ...posisiForm, mitra_id: selectedMitraForPosisi._id };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowPosisiFormModal(false);
        setPosisiForm({ id: null, nama_posisi: "", konsentrasi: "SDM", kuota: 1, deskripsi_pekerjaan: "", kriteria_kandidat: "", sistem_kerja: "WFO" });
        showToast(posisiForm.id ? "Posisi berhasil diperbarui!" : "Posisi berhasil ditambahkan!");
        fetchPosisi(selectedMitraForPosisi._id);
      }
    } catch (error) { console.error(error); }
  };

  const handleDeletePosisi = async (id) => {
    if (!window.confirm("Hapus posisi KKL Plus ini?")) return;
    try {
      const res = await fetch(`/api/posisi?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Posisi berhasil dihapus!");
        fetchPosisi(selectedMitraForPosisi._id);
      }
    } catch (error) { console.error(error); }
  };

  // Filter and Pagination for Pokja
  const filteredPokjas = pokjas.filter(p => {
    const query = searchPokja.toLowerCase().trim();
    const namaMatch = p.nama_pokja?.toLowerCase().includes(query);
    const ketuaNamaMatch = p.ketua_id?.nama_lengkap?.toLowerCase().includes(query);
    const ketuaNimMatch = p.ketua_id?.nim_nidn?.toLowerCase().includes(query);
    const mitraMatch = p.mitra_id?.nama_instansi?.toLowerCase().includes(query);
    const matchesSearch = !query || namaMatch || ketuaNamaMatch || ketuaNimMatch || mitraMatch;

    if (!matchesSearch) return false;

    if (statusFilterPokja === "all") return true;
    if (statusFilterPokja === "belum_lengkap") {
      const activeMembers = p.anggota?.filter(a => a.status_undangan === 'bergabung') || [];
      return activeMembers.length < 2;
    }
    return p.status_pokja === statusFilterPokja;
  });

  const indexOfLastPokja = currentPagePokja * pokjasPerPage;
  const indexOfFirstPokja = indexOfLastPokja - pokjasPerPage;
  const currentPokjas = filteredPokjas.slice(indexOfFirstPokja, indexOfLastPokja);
  const totalPagesPokja = Math.ceil(filteredPokjas.length / pokjasPerPage) || 1;

  // Pagination Calculations for Mitra
  const indexOfLastMitra = currentPageMitra * itemsPerPage;
  const indexOfFirstMitra = indexOfLastMitra - itemsPerPage;
  const currentMitras = mitras.slice(indexOfFirstMitra, indexOfLastMitra);
  const totalPagesMitra = Math.ceil(mitras.length / itemsPerPage) || 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DashboardLayout title="Manajemen Master Data">
      
      {/* Toast Notification (Portaled) */}
      {mounted && toastMessage && createPortal(
        <div style={{ zIndex: 999999 }} className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-8 py-3 rounded-2xl shadow-xl shadow-slate-900/20 animate-in slide-in-from-top-10 fade-in duration-300 font-bold border border-slate-700/50 flex items-center gap-3">
          <span className="text-teal-400 text-lg"><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> {toastMessage}
        </div>,
        document.body
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-bold animate-pulse">Memuat data dari database...</div>
      ) : (
        <>
          {/* Top Navigation Tabs */}
          <div className="flex flex-wrap gap-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-1.5 rounded-xl w-max mb-6 border border-white/60 dark:border-slate-700">
            <button 
              onClick={() => setActiveTab("mitra")} 
              className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === "mitra" ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"}`}
            >
              <Building2 className="w-4 h-4" />
              <span>Daftar Instansi</span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${activeTab === "mitra" ? "bg-teal-700/60 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                {mitras.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("pokja")} 
              className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === "pokja" ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"}`}
            >
              <Users className="w-4 h-4" />
              <span>Daftar Pokja</span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${activeTab === "pokja" ? "bg-teal-700/60 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                {pokjas.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("mentor")} 
              className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === "mentor" ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"}`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Data Mentor</span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${activeTab === "mentor" ? "bg-teal-700/60 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                {mentors.length}
              </span>
            </button>
          </div>

          <div className="space-y-6">
          {/* TAB 1: MITRA / INSTANSI */}
          {activeTab === "mitra" && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Instansi / Mitra KKL Plus</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola perusahaan dan instansi tempat mahasiswa melakukan kegiatan KKL Plus.</p>
                </div>
                <button 
                  onClick={() => {
                    setMitraForm({ id: null, nama_instansi: "", kategori: "Pemerintahan & Desa (Sektor Publik)", deskripsi_singkat: "", kuota_maksimal: 0 });
                    setShowMitraModal(true);
                  }}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-teal-200/50"
                >
                  + Tambah Mitra Baru
                </button>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold">
                      <th className="py-4 px-6 w-16 text-center">No</th>
                      <th className="py-4 px-6">Nama Instansi</th>
                      <th className="py-4 px-6 text-center">Kuota Penerimaan</th>
                      <th className="py-4 px-6">Alamat</th>
                      <th className="py-4 px-6">Kontak</th>
                      <th className="py-4 px-6 text-center">Dokumen</th>
                      <th className="py-4 px-6 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {currentMitras.length === 0 ? (
                      <tr><td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">Belum ada data mitra.</td></tr>
                    ) : (
                      currentMitras.map((mitra, index) => (
                        <tr key={mitra._id} className="hover:bg-slate-50 dark:bg-slate-800/80 transition-colors">
                          <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-400 font-medium">{indexOfFirstMitra + index + 1}</td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{mitra.nama_instansi}</div>
                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${mitra.kategori?.includes('Sektor Publik') ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400' : mitra.kategori?.includes('Ekonomi Kerakyatan') ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                              {mitra.kategori}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {mitra.kuota_maksimal || 0} Orang
                            </span>
                          </td>
                          <td className="py-4 px-6 max-w-[200px] truncate">
                            {mitra.alamat_lengkap ? (
                              <div className="text-sm text-slate-600 dark:text-slate-300" title={`${mitra.alamat_lengkap}, ${mitra.kecamatan || ''}, ${mitra.kabupaten_kota || ''}`}>
                                {mitra.alamat_lengkap}{mitra.kecamatan ? `, ${mitra.kecamatan}` : ''}{mitra.kabupaten_kota ? `, ${mitra.kabupaten_kota}` : ''}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Belum diisi</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {mitra.nama_pimpinan ? (
                              <div className="text-sm text-slate-600 dark:text-slate-300">
                                {mitra.nama_pimpinan} <br/>
                                <span className="text-xs text-slate-500">{mitra.kontak_mitra}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Belum diisi</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center" title={`Status: ${mitra.status_kerjasama || 'Belum Ada'}`}>
                              {mitra.status_kerjasama && mitra.status_kerjasama !== 'Belum Ada' && mitra.status_kerjasama !== 'Proses Penjajakan (Siap MoU)' ? (
                                <FileText className="w-5 h-5 text-teal-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center gap-3">
                              <button onClick={() => { setMitraForm({ id: mitra._id, nama_instansi: mitra.nama_instansi, kategori: mitra.kategori || "Pemerintahan & Desa (Sektor Publik)", deskripsi_singkat: mitra.deskripsi_singkat || "", kuota_maksimal: mitra.kuota_maksimal || 0 }); setShowMitraModal(true); }} className="text-slate-400 hover:text-teal-600 transition-colors" title="Edit Mitra">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteMitra(mitra._id)} className="text-slate-400 hover:text-red-600 transition-colors" title="Hapus Mitra">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPagesMitra > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Menampilkan {indexOfFirstMitra + 1} - {Math.min(indexOfLastMitra, mitras.length)} dari total {mitras.length} mitra
                  </span>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPageMitra === 1}
                      onClick={() => setCurrentPageMitra(prev => prev - 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPagesMitra }).map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentPageMitra(i + 1)}
                        className={`w-9 h-9 flex items-center justify-center font-bold rounded-lg shadow-sm transition-colors border ${currentPageMitra === i + 1 ? 'bg-teal-600 text-white border-teal-600' : 'bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      disabled={currentPageMitra === totalPagesMitra}
                      onClick={() => setCurrentPageMitra(prev => prev + 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: DAFTAR POKJA (NEW) */}
          {activeTab === "pokja" && (
            <>
              {/* Header & Quick Stats */}
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      Daftar Kelompok Kerja (POKJA) Mahasiswa
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Data seluruh POKJA yang dibuat mahasiswa, termasuk kelompok baru (hanya ketua) hingga yang sudah berjalan.
                    </p>
                  </div>
                </div>

                {/* Stat Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/60 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total POKJA</div>
                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{pokjas.length}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Semua kelompok terdaftar</div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Belum Lengkap</div>
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                      {pokjas.filter(p => (p.anggota?.filter(a => a.status_undangan === 'bergabung').length || 0) < 2).length}
                    </div>
                    <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Hanya ketua / &lt; 2 anggota</div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Menunggu Validasi</div>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                      {pokjas.filter(p => p.status_pokja === 'menunggu_persetujuan_admin').length}
                    </div>
                    <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">Perlu konfirmasi admin</div>
                  </div>

                  <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-900/30">
                    <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Aktif / Berjalan</div>
                    <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                      {pokjas.filter(p => ['disetujui_admin', 'berjalan', 'selesai'].includes(p.status_pokja)).length}
                    </div>
                    <div className="text-[11px] text-teal-600/80 dark:text-teal-400/80 mt-0.5">Disetujui &amp; beroperasi</div>
                  </div>
                </div>

                {/* Search & Filter bar */}
                <div className="flex flex-col md:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={searchPokja} 
                      onChange={(e) => { setSearchPokja(e.target.value); setCurrentPagePokja(1); }}
                      placeholder="Cari nama pokja, nama ketua, NIM, atau instansi..." 
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/60 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                  </div>

                  <div className="w-full md:w-64">
                    <select 
                      value={statusFilterPokja} 
                      onChange={(e) => { setStatusFilterPokja(e.target.value); setCurrentPagePokja(1); }}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/60 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 font-medium"
                    >
                      <option value="all">Semua Status POKJA</option>
                      <option value="belum_lengkap">⚠️ Belum Lengkap (Hanya Ketua / &lt;2 Anggota)</option>
                      <option value="draft">Draf (Belum Diajukan)</option>
                      <option value="menunggu_persetujuan_admin">Menunggu Validasi Admin</option>
                      <option value="disetujui_admin">Disetujui Admin</option>
                      <option value="berjalan">Sedang Berjalan</option>
                      <option value="selesai">Selesai</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pokja Table */}
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold">
                      <th className="py-4 px-6 w-14 text-center">No</th>
                      <th className="py-4 px-6">Nama Pokja &amp; Periode</th>
                      <th className="py-4 px-6">Ketua Kelompok</th>
                      <th className="py-4 px-6">Komposisi Tim</th>
                      <th className="py-4 px-6">Instansi Mitra</th>
                      <th className="py-4 px-6">Pembimbing (DPL)</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-center w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {currentPokjas.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-500 dark:text-slate-400">
                          <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                          Tidak ada data POKJA yang sesuai filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      currentPokjas.map((pokja, index) => {
                        const activeMembers = pokja.anggota?.filter(a => a.status_undangan === 'bergabung') || [];
                        const pendingMembers = pokja.anggota?.filter(a => a.status_undangan === 'menunggu') || [];
                        const totalActive = 1 + activeMembers.length;

                        return (
                          <tr key={pokja._id} className="hover:bg-slate-50 dark:bg-slate-800/80 transition-colors">
                            <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-400 font-medium">
                              {indexOfFirstPokja + index + 1}
                            </td>

                            {/* Nama Pokja & Periode */}
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                <span>{pokja.nama_pokja || "POKJA Mahasiswa"}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{pokja.periode || "Periode Aktif"}</span>
                              </div>
                            </td>

                            {/* Ketua Kelompok */}
                            <td className="py-4 px-6">
                              {pokja.ketua_id ? (
                                <div>
                                  <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                                    <span>{pokja.ketua_id.nama_lengkap}</span>
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    NIM: <span className="font-semibold text-slate-700 dark:text-slate-300">{pokja.ketua_id.nim_nidn}</span>
                                    {pokja.ketua_id.konsentrasi && ` • ${pokja.ketua_id.konsentrasi}`}
                                  </div>
                                  {pokja.ketua_id.nomor_hp && (
                                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-slate-400" /> {pokja.ketua_id.nomor_hp}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Ketua tidak terdata</span>
                              )}
                            </td>

                            {/* Status Tim & Anggota */}
                            <td className="py-4 px-6">
                              {activeMembers.length === 0 ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> 1 Orang (Hanya Ketua)
                                  </span>
                                  {pendingMembers.length > 0 ? (
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                      {pendingMembers.length} undangan menunggu
                                    </div>
                                  ) : (
                                    <div className="text-[11px] text-slate-400 italic mt-1">
                                      Belum ada anggota diundang
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-900/40">
                                    <Users className="w-3.5 h-3.5 shrink-0" /> {totalActive} Mahasiswa
                                  </span>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    {activeMembers.length} Bergabung {pendingMembers.length > 0 && `• ${pendingMembers.length} Menunggu`}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Instansi Mitra */}
                            <td className="py-4 px-6">
                              {pokja.mitra_id ? (
                                <div>
                                  <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                                    <span>{pokja.mitra_id.nama_instansi}</span>
                                  </div>
                                  {pokja.mitra_id.kategori && (
                                    <span className="inline-block mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                      {pokja.mitra_id.kategori}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                  Belum Memilih Lokasi
                                </span>
                              )}
                            </td>

                            {/* DPL & Mentor */}
                            <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300">
                              <div>
                                <span className="text-slate-400">DPL:</span>{" "}
                                <strong className="text-slate-700 dark:text-slate-200">{pokja.dpl_id?.nama_lengkap || "Belum diplot"}</strong>
                              </div>
                              {pokja.mentor_id && (
                                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                  <span className="text-slate-400">Mentor:</span> {pokja.mentor_id.nama_lengkap}
                                </div>
                              )}
                            </td>

                            {/* Status Pokja */}
                            <td className="py-4 px-6 text-center">
                              {(() => {
                                switch (pokja.status_pokja) {
                                  case 'draft':
                                    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Draf</span>;
                                  case 'menunggu_persetujuan_admin':
                                    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">Menunggu Validasi</span>;
                                  case 'disetujui_admin':
                                    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">Disetujui</span>;
                                  case 'berjalan':
                                    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">Sedang Berjalan</span>;
                                  case 'selesai':
                                    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">Selesai</span>;
                                  case 'ditolak':
                                    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300">Ditolak</span>;
                                  default:
                                    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">{pokja.status_pokja || '-'}</span>;
                                }
                              })()}
                            </td>

                            {/* Aksi */}
                            <td className="py-4 px-6">
                              <div className="flex justify-center gap-1.5">
                                <button 
                                  onClick={() => { setSelectedPokjaDetail(pokja); setShowPokjaDetailModal(true); }}
                                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg transition-colors"
                                  title="Lihat Detail & Anggota"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => { setEditPokjaForm({ id: pokja._id, nama_pokja: pokja.nama_pokja || '' }); setShowEditPokjaModal(true); }}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                                  title="Ganti Nama Pokja"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeletePokja(pokja._id, pokja.nama_pokja)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                                  title="Hapus Pokja"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Pokja */}
              {totalPagesPokja > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Menampilkan {indexOfFirstPokja + 1} - {Math.min(indexOfLastPokja, filteredPokjas.length)} dari total {filteredPokjas.length} POKJA
                  </span>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPagePokja === 1}
                      onClick={() => setCurrentPagePokja(prev => prev - 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPagesPokja }).map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentPagePokja(i + 1)}
                        className={`w-9 h-9 flex items-center justify-center font-bold rounded-lg shadow-sm transition-colors border ${currentPagePokja === i + 1 ? 'bg-teal-600 text-white border-teal-600' : 'bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      disabled={currentPagePokja === totalPagesPokja}
                      onClick={() => setCurrentPagePokja(prev => prev + 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 3: DATA MENTOR */}
          {activeTab === "mentor" && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Data Mentor (Mitra Pendamping)</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola kontak mentor atau pendamping dari instansi KKL Plus.</p>
                </div>
                <button onClick={() => { setMentorForm({ id: null, nidn: "", nama_lengkap: "", nomor_hp: "", email: "", lokasi: "", devisi: "" }); setShowAddMentorModal(true); }} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-md">
                  + Tambah Mentor
                </button>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold">
                      <th className="py-4 px-6 w-16 text-center">No</th>
                      <th className="py-4 px-6">Nama &amp; Kontak</th>
                      <th className="py-4 px-6">Instansi / Lokasi</th>
                      <th className="py-4 px-6">Posisi / Devisi</th>
                      <th className="py-4 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {currentMentors.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">Belum ada data mentor.</td></tr>
                    ) : (
                      currentMentors.map((m, index) => (
                        <tr key={m._id} className="hover:bg-slate-50 dark:bg-slate-800/80 transition-colors">
                          <td className="py-4 px-6 text-center text-slate-500 font-medium">{indexOfFirstMentor + index + 1}</td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-800 dark:text-slate-100">{m.nama_lengkap}</div>
                            <div className="text-xs text-slate-500">{m.email} {m.nomor_hp ? `| ${m.nomor_hp}` : ''}</div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{m.lokasi || '-'}</td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{m.devisi || '-'}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setMentorForm({ id: m._id, nidn: m.nidn || "", nama_lengkap: m.nama_lengkap || "", nomor_hp: m.nomor_hp || "", email: m.email || "", lokasi: m.lokasi || "", devisi: m.devisi || "" }); setShowEditMentorModal(true); }} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg">Edit</button>
                              <button onClick={() => handleDeleteMentor(m._id)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg">Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Mentor */}
              {totalPagesMentor > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Menampilkan {indexOfFirstMentor + 1} - {Math.min(indexOfLastMentor, mentors.length)} dari total {mentors.length} mentor
                  </span>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPageMentor === 1}
                      onClick={() => setCurrentPageMentor(prev => prev - 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPagesMentor }).map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentPageMentor(i + 1)}
                        className={`w-9 h-9 flex items-center justify-center font-bold rounded-lg shadow-sm transition-colors border ${currentPageMentor === i + 1 ? 'bg-teal-600 text-white border-teal-600' : 'bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      disabled={currentPageMentor === totalPagesMentor}
                      onClick={() => setCurrentPageMentor(prev => prev + 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          </div>
        </>
      )}

      {/* MODALS */}

      {/* Modal Detail Pokja (NEW) */}
      {mounted && showPokjaDetailModal && selectedPokjaDetail && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/60 dark:border-slate-700 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {selectedPokjaDetail.nama_pokja || "POKJA Mahasiswa"}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
                    {selectedPokjaDetail.periode || "Periode Aktif"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Detail susunan tim kelompok, ketua, anggota, instansi, dan status verifikasi.
                </p>
              </div>
              <button 
                onClick={() => setShowPokjaDetailModal(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Card Ketua */}
              <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Ketua Kelompok (Inisiator)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white">
                    Ketua Pokja
                  </span>
                </div>
                {selectedPokjaDetail.ketua_id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="font-black text-slate-800 dark:text-slate-100 text-base">
                        {selectedPokjaDetail.ketua_id.nama_lengkap}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                        NIM: <span className="font-semibold">{selectedPokjaDetail.ketua_id.nim_nidn}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                        Prodi / Konsentrasi: <span className="font-semibold">{selectedPokjaDetail.ketua_id.konsentrasi || selectedPokjaDetail.ketua_id.program_studi || "-"}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 sm:border-l sm:border-teal-200/50 sm:dark:border-teal-900/30 sm:pl-4">
                      {selectedPokjaDetail.ketua_id.nomor_hp && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>{selectedPokjaDetail.ketua_id.nomor_hp}</span>
                        </div>
                      )}
                      {selectedPokjaDetail.ketua_id.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span className="truncate">{selectedPokjaDetail.ketua_id.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">Data ketua tidak ditemukan</div>
                )}
              </div>

              {/* Grid Info Mitra & Pembimbing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mitra */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Instansi Mitra
                  </div>
                  {selectedPokjaDetail.mitra_id ? (
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        {selectedPokjaDetail.mitra_id.nama_instansi}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {selectedPokjaDetail.mitra_id.alamat_lengkap || selectedPokjaDetail.mitra_id.kategori || "-"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Belum memilih instansi mitra</div>
                  )}
                </div>

                {/* Pembimbing */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Pembimbing (DPL &amp; Mentor)
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400">DPL:</span>{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {selectedPokjaDetail.dpl_id?.nama_lengkap || "Belum diplot oleh admin"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Mentor:</span>{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {selectedPokjaDetail.mentor_id?.nama_lengkap || "-"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daftar Anggota */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Daftar Anggota Kelompok ({selectedPokjaDetail.anggota?.length || 0})
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Maksimal 5 Mahasiswa per kelompok
                  </span>
                </div>

                {(!selectedPokjaDetail.anggota || selectedPokjaDetail.anggota.length === 0) ? (
                  <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-300 dark:border-amber-800/40 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                    <div className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                      Kelompok ini belum memiliki anggota lain (Hanya Ketua)
                    </div>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 max-w-md mx-auto">
                      Ketua kelompok belum mengundang anggota mahasiswa lain atau belum ada anggota yang bergabung.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold">
                          <th className="py-3 px-4 w-10 text-center">No</th>
                          <th className="py-3 px-4">Nama &amp; NIM</th>
                          <th className="py-3 px-4">Prodi / Konsentrasi</th>
                          <th className="py-3 px-4">Kontak</th>
                          <th className="py-3 px-4 text-center">Status Undangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {selectedPokjaDetail.anggota.map((ang, idx) => (
                          <tr key={ang._id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {ang.user_id?.nama_lengkap || "Mahasiswa"}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                NIM: {ang.user_id?.nim_nidn || "-"}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              {ang.user_id?.konsentrasi || ang.user_id?.program_studi || "-"}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                              {ang.user_id?.nomor_hp || ang.user_id?.email || "-"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {ang.status_undangan === 'bergabung' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                                  <Check className="w-3 h-3" /> Bergabung
                                </span>
                              ) : ang.status_undangan === 'ditolak' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-800/40">
                                  <X className="w-3 h-3" /> Ditolak
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                                  <Clock className="w-3 h-3" /> Menunggu
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowPokjaDetailModal(false)} 
                className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl border border-slate-200 dark:border-slate-600 transition-colors shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Edit Nama Pokja */}
      {mounted && showEditPokjaModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/60 dark:border-slate-700">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-teal-600" />
                Ubah Nama POKJA
              </h3>
              <button onClick={() => setShowEditPokjaModal(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleEditPokjaSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Kelompok / POKJA
                  </label>
                  <input 
                    required 
                    value={editPokjaForm.nama_pokja} 
                    onChange={(e) => setEditPokjaForm({ ...editPokjaForm, nama_pokja: e.target.value })} 
                    type="text" 
                    placeholder="Contoh: POKJA 01 - Tim Alpha" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100" 
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditPokjaModal(false)} className="px-4 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-colors">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Tambah / Edit Mitra */}
      {showMitraModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-sm w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-white/50 dark:border-slate-600 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{mitraForm.id ? "Edit Data Mitra" : "Tambah Mitra KKL Plus Baru"}</h3>
              <button onClick={() => setShowMitraModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleMitraSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Nama Instansi / Mitra</label>
                  <input required value={mitraForm.nama_instansi} onChange={(e) => setMitraForm({...mitraForm, nama_instansi: e.target.value})} type="text" placeholder="Contoh: PT Sukses Mandiri / Desa Maju" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Kategori Sektor</label>
                  <select value={mitraForm.kategori} onChange={(e) => setMitraForm({...mitraForm, kategori: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100">
                    <option value="Pemerintahan & Desa (Sektor Publik)">Pemerintahan &amp; Desa (Sektor Publik)</option>
                    <option value="Bisnis & Ekonomi Kerakyatan">Bisnis &amp; Ekonomi Kerakyatan</option>
                    <option value="Industri & Korporasi (Sektor Privat)">Industri &amp; Korporasi (Sektor Privat)</option>
                    <option value="Pendidikan, Sosial & Kesehatan">Pendidikan, Sosial &amp; Kesehatan</option>
                    <option value="Organisasi Kemasyarakatan">Organisasi Kemasyarakatan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Deskripsi Singkat (Opsional)</label>
                  <textarea value={mitraForm.deskripsi_singkat} onChange={(e) => setMitraForm({...mitraForm, deskripsi_singkat: e.target.value})} rows="3" placeholder="Tentang instansi/perusahaan ini secara singkat..." className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Kuota Penerimaan Mahasiswa</label>
                  <input required value={mitraForm.kuota_maksimal} onChange={(e) => setMitraForm({...mitraForm, kuota_maksimal: parseInt(e.target.value) || 0})} type="number" min="0" placeholder="0" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100" />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-white/50 dark:border-slate-600 flex justify-end gap-3">
                <button type="button" onClick={() => setShowMitraModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-colors">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Posisi (Besar) */}
      {showKelolaPosisiModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-sm w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-white/60 dark:border-slate-700">
            <div className="px-6 py-5 border-b border-white/50 dark:border-slate-600 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lowongan / Posisi KKL Plus</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedMitraForPosisi?.nama_instansi}</p>
              </div>
              <button onClick={() => setShowKelolaPosisiModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between mb-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Daftar Divisi/Posisi Tersedia</h4>
                <button 
                  onClick={() => { setPosisiForm({ id: null, nama_posisi: "", konsentrasi: "SDM", kuota: 1, deskripsi_pekerjaan: "", kriteria_kandidat: "", sistem_kerja: "WFO" }); setShowPosisiFormModal(true); }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-sm shadow-sm transition-colors"
                >
                  + Tambah Posisi
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posisiList.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-slate-500 border border-dashed border-white/50 dark:border-slate-600 rounded-2xl">Belum ada posisi dibuka.</div>
                ) : (
                  posisiList.map(pos => (
                    <div key={pos._id} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 p-5 rounded-2xl shadow-sm relative group hover:shadow-md transition-all">
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setPosisiForm({ id: pos._id, nama_posisi: pos.nama_posisi, konsentrasi: pos.konsentrasi, kuota: pos.kuota, deskripsi_pekerjaan: pos.deskripsi_pekerjaan || "", kriteria_kandidat: pos.kriteria_kandidat || "", sistem_kerja: pos.sistem_kerja || "WFO" }); setShowPosisiFormModal(true); }} className="p-1.5 bg-slate-100 hover:bg-teal-100 text-teal-600 rounded-md"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletePosisi(pos._id)} className="p-1.5 bg-slate-100 hover:bg-red-100 text-red-600 rounded-md"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 pr-12">{pos.nama_posisi}</h5>
                      <span className={`inline-block mt-2 px-2.5 py-1 text-xs font-bold rounded-md ${pos.sistem_kerja === 'WFH' ? 'bg-teal-50 text-teal-600' : pos.sistem_kerja === 'Hybrid' ? 'bg-teal-50 text-teal-600' : 'bg-teal-50 text-teal-600'}`}>{pos.sistem_kerja || 'WFO'}</span>
                      <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between"><span>Konsentrasi:</span> <strong className="text-slate-700 dark:text-slate-300 text-right">{pos.konsentrasi}</strong></div>
                        <div className="flex justify-between"><span>Kuota Tersedia:</span> <strong className="text-slate-700 dark:text-slate-300">{pos.kuota} Mahasiswa</strong></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Posisi (Nested) */}
      {showPosisiFormModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-white/60 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{posisiForm.id ? 'Edit' : 'Tambah'} Posisi KKL Plus</h3>
              <button onClick={() => setShowPosisiFormModal(false)} className="text-slate-500 hover:text-red-500 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              <form id="posisiForm" onSubmit={handlePosisiSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Nama Divisi / Posisi</label>
                    <input required value={posisiForm.nama_posisi} onChange={e => setPosisiForm({...posisiForm, nama_posisi: e.target.value})} type="text" className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 dark:bg-slate-700" placeholder="Contoh: Digital Marketing" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Konsentrasi Manajemen</label>
                    <select value={posisiForm.konsentrasi} onChange={e => setPosisiForm({...posisiForm, konsentrasi: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 dark:bg-slate-700">
                      <option value="SDM">Manajemen SDM</option>
                      <option value="Keuangan">Manajemen Keuangan</option>
                      <option value="Pemasaran">Manajemen Pemasaran</option>
                      <option value="Pengembangan Bisnis">Pengembangan Bisnis</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Kuota Penerimaan</label>
                    <input required value={posisiForm.kuota} onChange={e => setPosisiForm({...posisiForm, kuota: Number(e.target.value)})} type="number" min="1" className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 dark:bg-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Sistem Kerja</label>
                    <select value={posisiForm.sistem_kerja} onChange={e => setPosisiForm({...posisiForm, sistem_kerja: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 dark:bg-slate-700">
                      <option value="WFO">WFO (Work From Office)</option>
                      <option value="WFH">WFH (Work From Home)</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Deskripsi Pekerjaan</label>
                  <textarea value={posisiForm.deskripsi_pekerjaan} onChange={e => setPosisiForm({...posisiForm, deskripsi_pekerjaan: e.target.value})} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 dark:bg-slate-700" placeholder="Uraikan tugas harian divisi ini..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Kriteria Kandidat</label>
                  <textarea value={posisiForm.kriteria_kandidat} onChange={e => setPosisiForm({...posisiForm, kriteria_kandidat: e.target.value})} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 dark:bg-slate-700" placeholder="Syarat: Menguasai Excel, Analitis..."></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-white/60 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setShowPosisiFormModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
              <button type="submit" form="posisiForm" className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-colors">Simpan Posisi</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Mentor */}
      {(showAddMentorModal || showEditMentorModal) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700 w-full max-w-lg overflow-hidden relative scale-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="p-8 border-b border-white/60 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {showEditMentorModal ? 'Edit Mentor' : 'Tambah Mentor'}
              </h3>
            </div>
            
            <form onSubmit={(e) => handleMentorSubmit(e, showEditMentorModal)} className="p-8 bg-white/20 dark:bg-slate-900/20/50 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ID / Username</label>
                <input required value={mentorForm.nidn} onChange={(e) => setMentorForm({...mentorForm, nidn: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600" placeholder="Masukkan ID atau username" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input required value={mentorForm.nama_lengkap} onChange={(e) => setMentorForm({...mentorForm, nama_lengkap: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600" placeholder="Nama Lengkap Mentor" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Instansi / Lokasi</label>
                  <input required value={mentorForm.lokasi} onChange={(e) => setMentorForm({...mentorForm, lokasi: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600" placeholder="Contoh: PT Telkom" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Posisi / Devisi</label>
                  <input required value={mentorForm.devisi} onChange={(e) => setMentorForm({...mentorForm, devisi: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600" placeholder="Contoh: HRD" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor HP</label>
                  <input required value={mentorForm.nomor_hp} onChange={(e) => setMentorForm({...mentorForm, nomor_hp: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600" placeholder="0812..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" required value={mentorForm.email} onChange={(e) => setMentorForm({...mentorForm, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600" placeholder="Email Mentor" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowAddMentorModal(false); setShowEditMentorModal(false); }} className="flex-1 px-4 py-3 rounded-xl font-bold bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700 shadow-sm">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-lg shadow-teal-500/30">Simpan Mentor</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
