"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Check, Edit2, Trash2, FileText, CheckCircle, XCircle } from "lucide-react";

export default function MasterData() {
  const [mounted, setMounted] = useState(false);
  // Data State
  const [mitras, setMitras] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mitra");

  
  // Modals State
  const [showMitraModal, setShowMitraModal] = useState(false);
  // AI Preview Modal State
  // Toast State
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mitraRes, mentorRes] = await Promise.all([
        fetch('/api/mitra'),
        fetch('/api/admin/pengguna?role=mentor')
      ]);
      const mitraData = await mitraRes.json();
      const mentorData = await mentorRes.json();
      
      if (Array.isArray(mitraData)) setMitras(mitraData);
      if (Array.isArray(mentorData)) setMentors(mentorData);
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


  ;

  ;

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

  ;

  ;

  // Dynamic form handlers for CPMK & Indikator
  ;

  ;

  ;

  ;

  ;

  ;

  ;

  ;

  ;

  ;

  ;

  // Ekstrak semua matkul untuk ditampilkan di UI
  
  ;

  ;

  ;

  ;

  // Pagination Calculations
  const indexOfLastMitra = currentPageMitra * itemsPerPage;
  const indexOfFirstMitra = indexOfLastMitra - itemsPerPage;
  const currentMitras = mitras.slice(indexOfFirstMitra, indexOfLastMitra);
  const totalPagesMitra = Math.ceil(mitras.length / itemsPerPage);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DashboardLayout title="Master Data Mitra">
      
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
          <div className="flex space-x-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-1.5 rounded-xl w-max mb-6 border border-white/60 dark:border-slate-700">
            <button onClick={() => setActiveTab("mitra")} className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "mitra" ? "bg-teal-600 text-amber-300 shadow-sm" : "text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"}`}>Daftar Instansi</button>
            <button onClick={() => setActiveTab("mentor")} className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "mentor" ? "bg-teal-600 text-amber-300 shadow-sm" : "text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"}`}>Data Mentor</button>
          </div>

          <div className="space-y-6">
          {activeTab === "mitra" && (
            <>
              <div className="flex justify-between items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Instansi / Mitra KKL Plus</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola perusahaan tempat mahasiswa melakukan kegiatan KKL Plus.</p>
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

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm overflow-hidden">
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
                      <tr><td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">Belum ada data mitra.</td></tr>
                    ) : (
                      currentMitras.map((mitra, index) => (
                        <tr key={mitra._id} className="hover:bg-slate-50 dark:bg-slate-800/80 transition-colors">
                          <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-400 font-medium">{indexOfFirstMitra + index + 1}</td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{mitra.nama_instansi}</div>
                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${mitra.kategori?.includes('Sektor Publik') ? 'bg-teal-50 text-teal-600' : mitra.kategori?.includes('Ekonomi Kerakyatan') ? 'bg-amber-50 text-amber-600' : mitra.kategori?.includes('Privat') ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-600'}`}>
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
                              <div className="text-sm text-slate-600 dark:text-slate-300" title={`${mitra.alamat_lengkap}, ${mitra.kecamatan}, ${mitra.kabupaten_kota}`}>
                                {mitra.alamat_lengkap}, {mitra.kecamatan}, {mitra.kabupaten_kota}
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
                                <XCircle className="w-5 h-5 text-slate-300" />
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

          {activeTab === "mentor" && (
            <>
              <div className="flex justify-between items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Data Mentor (Mitra Pendamping)</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola kontak mentor atau pendamping dari instansi KKL Plus.</p>
                </div>
                <button onClick={() => { setMentorForm({ id: null, nidn: "", nama_lengkap: "", nomor_hp: "", email: "", lokasi: "", devisi: "" }); setShowAddMentorModal(true); }} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-md">
                  + Tambah Mentor
                </button>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold">
                      <th className="py-4 px-6 w-16 text-center">No</th>
                      <th className="py-4 px-6">Nama & Kontak</th>
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
                        <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
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

      {mounted && showSaranModal && createPortal(
        <div  className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-sm w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-white/60 dark:border-slate-700 max-h-[95vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-white/50 dark:border-slate-600 flex justify-between items-center bg-gradient-to-r from-amber-50 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/20">
              <h3 className="text-lg font-black text-amber-800 dark:text-amber-500 flex items-center gap-2">
                <span>✨</span> Preview Saran Kegiatan (AI)
              </h3>
              <button onClick={() => setShowSaranModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-4">
                Berikut adalah saran kegiatan yang dihasilkan oleh AI. Anda dapat membacanya, merevisinya jika kurang pas, lalu menyimpannya.
              </p>
              <textarea 
                value={saranPreview} 
                onChange={(e) => setSaranPreview(e.target.value)} 
                rows="6" 
                className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-amber-50/30 dark:bg-slate-900/50 text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed"
              ></textarea>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-white/50 dark:border-slate-600 flex justify-end gap-3">
              <button type="button" onClick={() => setShowSaranModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
              <button onClick={handleSaveSaran} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-500 hover:from-amber-600 hover:to-amber-600 rounded-xl shadow-md transition-colors flex items-center gap-2">
                Simpan Saran
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Tambah Mitra */}
      {showMitraModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-sm w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-white/50 dark:border-slate-600 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tambah Mitra KKL Plus Baru</h3>
              <button onClick={() => setShowMitraModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleMitraSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Nama Instansi / Mitra</label>
                  <input required value={mitraForm.nama_instansi} onChange={(e) => setMitraForm({...mitraForm, nama_instansi: e.target.value})} type="text" placeholder="Contoh: PT Sukses Mandiri / Desa Maju" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50 dark:bg-slate-800/80" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Kategori Sektor</label>
                  <select value={mitraForm.kategori} onChange={(e) => setMitraForm({...mitraForm, kategori: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50 dark:bg-slate-800/80 appearance-none">
                    <option value="Pemerintahan & Desa (Sektor Publik)">Pemerintahan & Desa (Sektor Publik)</option>
                    <option value="Bisnis & Ekonomi Kerakyatan">Bisnis & Ekonomi Kerakyatan</option>
                    <option value="Industri & Korporasi (Sektor Privat)">Industri & Korporasi (Sektor Privat)</option>
                    <option value="Pendidikan, Sosial & Kesehatan">Pendidikan, Sosial & Kesehatan</option>
                    <option value="Organisasi Kemasyarakatan">Organisasi Kemasyarakatan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Deskripsi Singkat (Opsional)</label>
                  <textarea value={mitraForm.deskripsi_singkat} onChange={(e) => setMitraForm({...mitraForm, deskripsi_singkat: e.target.value})} rows="3" placeholder="Tentang instansi/perusahaan ini secara singkat..." className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50 dark:bg-slate-800/80"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Kuota Penerimaan Mahasiswa</label>
                  <input required value={mitraForm.kuota_maksimal} onChange={(e) => setMitraForm({...mitraForm, kuota_maksimal: parseInt(e.target.value) || 0})} type="number" min="0" placeholder="0" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50 dark:bg-slate-800/80" />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-white/50 dark:border-slate-600 flex justify-end gap-3">
                <button type="button" onClick={() => setShowMitraModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-colors">Simpan Data</button>
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
                        <button onClick={() => { setPosisiForm({ id: pos._id, nama_posisi: pos.nama_posisi, konsentrasi: pos.konsentrasi, kuota: pos.kuota, deskripsi_pekerjaan: pos.deskripsi_pekerjaan || "", kriteria_kandidat: pos.kriteria_kandidat || "", sistem_kerja: pos.sistem_kerja || "WFO" }); setShowPosisiFormModal(true); }} className="p-1.5 bg-slate-100 hover:bg-teal-100 text-teal-600 rounded-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                        <button onClick={() => handleDeletePosisi(pos._id)} className="p-1.5 bg-slate-100 hover:bg-red-100 text-red-600 rounded-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
