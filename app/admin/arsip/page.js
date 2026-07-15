"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "@/components/AuthProvider";
import { Search, FolderOpen, FileText, Award, Book, FileSignature, Download, Printer } from "lucide-react";
import Link from "next/link";

export default function ArsipDokumen() {
  const { data: session } = useSession();
  const [dataPokja, setDataPokja] = useState([]);
  const [dataPengajuan, setDataPengajuan] = useState([]);
  const [dataMonev, setDataMonev] = useState([]);
  const [dataLogbook, setDataLogbook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("surat"); // surat, laporan, sertifikat, galeri
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/arsip");
      const json = await res.json();
      if (json.pokjas) setDataPokja(json.pokjas);
      if (json.pengajuans) setDataPengajuan(json.pengajuans);
      if (json.monevs) setDataMonev(json.monevs);
      if (json.logbooks) setDataLogbook(json.logbooks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const TABS = [
    { id: "surat", label: "Surat & SK", icon: <FileSignature className="w-4 h-4" /> },
    { id: "laporan", label: "Laporan Akhir", icon: <FileText className="w-4 h-4" /> },
    { id: "sertifikat", label: "Sertifikat", icon: <Award className="w-4 h-4" /> },
    { id: "galeri", label: "Galeri Foto", icon: <FolderOpen className="w-4 h-4" /> }
  ];

  // ================= TAB 1: SURAT & SK =================
  const renderTabSurat = () => {
    const filtered = dataPokja.filter(p => 
      p.nama_pokja?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mitra_id?.nama_instansi?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-amber-800">Cetak Surat Keputusan (SK) KKL Plus</h4>
            <p className="text-sm text-amber-700 mt-1">Surat Keputusan (SK) untuk Peserta (Mahasiswa) dan DPL diterbitkan per Kelompok.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(pokja => (
            <div key={pokja._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-slate-800 mb-1">{pokja.nama_pokja}</h3>
              <p className="text-sm text-slate-600 mb-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span> 
                {pokja.mitra_id?.nama_instansi || 'Belum ada mitra'}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Surat Pengantar Instansi</p>
                    <p className="text-xs text-slate-500">Ke: {pokja.mitra_id?.nama_instansi}</p>
                  </div>
                  <Link href={`/mahasiswa/surat/pengantar/${pokja.ketua_id?._id}`} target="_blank" className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                    <Printer className="w-5 h-5" />
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Surat Tugas DPL</p>
                    <p className="text-xs text-slate-500">DPL: {pokja.dpl_id?.nama_lengkap || '-'}</p>
                  </div>
                  <Link href={`/mahasiswa/surat/tugas/${pokja.ketua_id?._id}`} target="_blank" className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                    <Printer className="w-5 h-5" />
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div>
                    <p className="text-sm font-semibold text-amber-800">SK Mahasiswa & DPL</p>
                    <p className="text-xs text-amber-600">Surat Keputusan KKL Plus</p>
                  </div>
                  <button className="px-3 py-1.5 text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg text-xs font-bold transition-colors shadow-sm" onClick={() => alert('Fitur Cetak SK sedang dalam pengembangan format.')}>
                    Cetak SK
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ================= TAB 2: LAPORAN AKHIR =================
  const renderTabLaporan = () => {
    const filteredIndividu = dataPengajuan.filter(p => 
      p.mahasiswa_id?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mahasiswa_id?.nim_nidn?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h3 className="font-bold text-slate-800 text-lg border-b pb-2">Laporan Kelompok</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dataPokja.filter(p => p.nama_pokja?.toLowerCase().includes(searchTerm.toLowerCase())).map(pokja => (
            <div key={pokja._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
              <div className="overflow-hidden">
                <p className="font-bold text-sm text-slate-800 truncate">{pokja.nama_pokja}</p>
                <p className="text-xs text-slate-500 truncate">{pokja.mitra_id?.nama_instansi}</p>
              </div>
              <Link href={`/mahasiswa/laporan/cetak/laporan?tipe=pokja&id=${pokja._id}`} target="_blank" className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs rounded-lg transition-colors">
                <FileText className="w-4 h-4" /> Buka
              </Link>
            </div>
          ))}
        </div>

        <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mt-8">Laporan Individu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredIndividu.map(pengajuan => (
            <div key={pengajuan._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 justify-between">
              <div>
                <p className="font-bold text-sm text-slate-800 truncate">{pengajuan.mahasiswa_id?.nama_lengkap}</p>
                <p className="text-xs font-mono text-slate-500">{pengajuan.mahasiswa_id?.nim_nidn}</p>
                <p className="text-xs text-teal-600 font-semibold mt-1 bg-teal-50 inline-block px-2 py-0.5 rounded">{pengajuan.pokja_id?.nama_pokja}</p>
              </div>
              <Link href={`/mahasiswa/laporan/cetak/laporan?tipe=individu&id=${pengajuan._id}`} target="_blank" className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 text-white hover:bg-slate-700 font-semibold text-xs rounded-lg transition-colors w-full">
                <FileText className="w-4 h-4" /> Lihat Laporan Individu
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ================= TAB 3: SERTIFIKAT =================
  const renderTabSertifikat = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h3 className="font-bold text-slate-800 text-lg border-b pb-2">Sertifikat Mahasiswa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {dataPengajuan.filter(p => p.mahasiswa_id?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())).map(pengajuan => (
            <div key={`cert-mhs-${pengajuan._id}`} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800 line-clamp-1">{pengajuan.mahasiswa_id?.nama_lengkap}</p>
                <p className="text-xs text-slate-500">{pengajuan.mahasiswa_id?.nim_nidn}</p>
              </div>
              <Link href={`/mahasiswa/laporan/cetak/sertifikat-mahasiswa?id=${pengajuan._id}`} target="_blank" className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-bold text-xs rounded-lg transition-colors">
                <Printer className="w-4 h-4" /> Cetak
              </Link>
            </div>
          ))}
        </div>

        <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mt-8">Sertifikat Mitra Instansi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {dataPokja.filter(p => p.mitra_id?.nama_instansi?.toLowerCase().includes(searchTerm.toLowerCase())).map(pokja => (
            <div key={`cert-mitra-${pokja._id}`} className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-xl border border-teal-100 shadow-sm flex flex-col justify-between gap-4">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                  <Award className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800 line-clamp-2">{pokja.mitra_id?.nama_instansi || 'Belum Ada Mitra'}</p>
                  <p className="text-xs text-slate-500 mt-1">Diberikan via Kelompok: {pokja.nama_pokja}</p>
                </div>
              </div>
              <Link href={`/mahasiswa/laporan/cetak/sertifikat-mitra?id=${pokja._id}`} target="_blank" className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm">
                <Printer className="w-4 h-4" /> Cetak Sertifikat Mitra
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ================= TAB 4: GALERI FOTO =================
  const renderTabGaleri = () => {
    // Kumpulkan foto Mitra
    const fotoMitra = [];
    dataPokja.forEach(pokja => {
      const mitra = pokja.mitra_id;
      if (mitra) {
        if (mitra.foto_kantor_desa && mitra.foto_kantor_desa.trim() !== '') {
          fotoMitra.push({ url: mitra.foto_kantor_desa, label: 'Foto Gedung', pokja });
        }
        if (mitra.foto_kantor_bumdes && mitra.foto_kantor_bumdes.trim() !== '') {
          fotoMitra.push({ url: mitra.foto_kantor_bumdes, label: 'Foto Dalam Gedung', pokja });
        }
      }
    });

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* FOTO MITRA */}
        <section>
          <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-4">Foto Instansi / Mitra</h3>
          {fotoMitra.length === 0 ? (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">Belum ada foto instansi mitra.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {fotoMitra.map((foto, idx) => (
                <div key={`mitra-${idx}`} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group">
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    <img src={foto.url} alt={foto.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                      {foto.label}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-slate-800 line-clamp-1">{foto.pokja?.nama_pokja}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{foto.pokja?.mitra_id?.nama_instansi}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FOTO MONEV */}
        <section>
          <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-4">Foto Monitoring DPL (Monev)</h3>
          {dataMonev.length === 0 ? (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">Belum ada foto dokumentasi dari DPL.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {dataMonev.map(monev => (
                <div key={monev._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group">
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    <img src={monev.foto_url} alt="Monev" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                      {monev.jenis_kunjungan}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-slate-800 line-clamp-1">{monev.pokja_id?.nama_pokja}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">DPL: {monev.dpl_id?.nama_lengkap}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FOTO LOGBOOK */}
        <section>
          <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-4">Foto Kegiatan Mahasiswa (Logbook)</h3>
          {dataLogbook.length === 0 ? (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">Belum ada foto kegiatan dari mahasiswa.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {dataLogbook.map(logbook => (
                <div key={logbook._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group">
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    <img src={logbook.bukti_kegiatan} alt="Kegiatan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 bg-teal-600/90 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm shadow-sm">
                      Logbook
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-slate-800 line-clamp-1">{logbook.mahasiswa_id?.nama_lengkap}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{logbook.pokja_id?.nama_pokja}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    );
  };

  return (
    <DashboardLayout title="Arsip & Dokumen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-teal-600" />
            Digital Library & Arsip KKL
          </h2>
          <p className="text-slate-500 mt-1">Pusat penyimpanan seluruh dokumen, surat-menyurat, laporan, dan sertifikat.</p>
        </div>
        
        {/* Search Bar - only show if not on galeri tab */}
        {activeTab !== 'galeri' && (
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari Nama, Kelompok, Mitra..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Tabs Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex-1 md:flex-none justify-center ${
              activeTab === tab.id 
                ? "bg-teal-600 text-white shadow-md" 
                : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-medium animate-pulse">Mengumpulkan arsip dokumen...</p>
          </div>
        ) : (
          <>
            {activeTab === "surat" && renderTabSurat()}
            {activeTab === "laporan" && renderTabLaporan()}
            {activeTab === "sertifikat" && renderTabSertifikat()}
            {activeTab === "galeri" && renderTabGaleri()}
          </>
        )}
      </div>

    </DashboardLayout>
  );
}
