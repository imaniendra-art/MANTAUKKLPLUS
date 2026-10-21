"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "@/components/AuthProvider";
import { Search, FolderOpen, FileText, Award, Book, FileSignature, Download, Printer, Image as ImageIcon, ChevronLeft, ChevronRight, X, ExternalLink, Users, Calendar, MapPin, Eye, Building2, UserCheck, Camera, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ArsipDokumen() {
  const { data: session } = useSession();
  const [dataPokja, setDataPokja] = useState([]);
  const [dataPengajuan, setDataPengajuan] = useState([]);
  const [dataMonev, setDataMonev] = useState([]);
  const [dataLogbook, setDataLogbook] = useState([]);
  const [dataLaporanDpl, setDataLaporanDpl] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("surat"); // surat, laporan, sertifikat, galeri
  const [searchTerm, setSearchTerm] = useState("");

  // Modal SK states
  const [showSkModal, setShowSkModal] = useState(false);
  const [isCollectiveSk, setIsCollectiveSk] = useState(false);
  const [selectedPokjaForSk, setSelectedPokjaForSk] = useState(null);
  const [skForm, setSkForm] = useState({
    nomor_sk: "000.4/496/STIMI-YAPMI/MKS/IX/2026",
    tanggal_sk: "14 September 2026",
    tanggal_rapat: "28 Mei 2026",
    semester: "Ganjil",
    tahun_akademik: "2026/2027",
  });

  // Galeri Album states
  const [selectedAlbumPokjaId, setSelectedAlbumPokjaId] = useState(null);
  const [galeriKategori, setGaleriKategori] = useState("semua"); // 'semua', 'mitra', 'monev', 'logbook'
  const [filterMhsId, setFilterMhsId] = useState("semua");
  const [galeriSearch, setGaleriSearch] = useState("");
  const [galeriPage, setGaleriPage] = useState(1);
  const [lightboxItem, setLightboxItem] = useState(null);

  const openSkModalForPokja = (pokja) => {
    setSelectedPokjaForSk(pokja);
    setIsCollectiveSk(false);
    setShowSkModal(true);
  };

  const openSkModalCollective = () => {
    setSelectedPokjaForSk(null);
    setIsCollectiveSk(true);
    setShowSkModal(true);
  };

  const handleGenerateSk = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      nomorSk: skForm.nomor_sk,
      tglSk: skForm.tanggal_sk,
      tglRapat: skForm.tanggal_rapat,
      semester: skForm.semester,
      tahun: skForm.tahun_akademik,
    });
    if (isCollectiveSk) {
      query.set("collective", "true");
    } else if (selectedPokjaForSk) {
      query.set("pokjaId", selectedPokjaForSk._id);
    }
    window.open(`/admin/arsip/sk?${query.toString()}`, "_blank");
    setShowSkModal(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/arsip");
      const json = await res.json();
      if (json.pokjas) setDataPokja(json.pokjas);
      if (json.pengajuans) setDataPengajuan(json.pengajuans);
      if (json.monevs) setDataMonev(json.monevs);
      if (json.logbooks) setDataLogbook(json.logbooks);
      if (json.laporanDpls) setDataLaporanDpl(json.laporanDpls);
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
    { id: "kerjasama", label: "Dok. Kerjasama", icon: <FileText className="w-4 h-4" /> },
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
            <h4 className="font-bold text-amber-800 flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-amber-600" />
              Cetak Surat Keputusan (SK) KKL Plus
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              Surat Keputusan (SK) Penetapan Dosen Pembimbing & Peserta KKLP dapat dicetak per Kelompok maupun Kolektif (seluruh kelompok).
            </p>
          </div>
          <button
            onClick={openSkModalCollective}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            Cetak SK Kolektif (Semua Kelompok)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(pokja => (
            <div key={pokja._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{pokja.nama_pokja}</h3>
              <p className="text-sm text-slate-600 mb-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span> 
                {pokja.mitra_id?.nama_instansi || 'Belum ada mitra'}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Surat Pengantar Instansi</p>
                    <p className="text-xs text-slate-500">Ke: {pokja.mitra_id?.nama_instansi}</p>
                  </div>
                  <Link href={`/mahasiswa/surat/pengantar/${pokja.ketua_id?._id}`} target="_blank" className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                    <Printer className="w-5 h-5" />
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Surat Tugas DPL</p>
                    <p className="text-xs text-slate-500">DPL: {pokja.dpl_id?.nama_lengkap || '-'}</p>
                  </div>
                  <Link href={`/mahasiswa/surat/tugas/${pokja.ketua_id?._id}`} target="_blank" className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                    <Printer className="w-5 h-5" />
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-800/60">
                  <div>
                    <p className="text-sm font-semibold text-amber-800">SK Mahasiswa & DPL</p>
                    <p className="text-xs text-amber-600">Surat Keputusan Penetapan</p>
                  </div>
                  <button 
                    className="px-3.5 py-1.5 text-amber-800 bg-amber-200 hover:bg-amber-300 rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                    onClick={() => openSkModalForPokja(pokja)}
                  >
                    <Printer className="w-3.5 h-3.5" />
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

  // ================= TAB KERJASAMA =================
  const renderTabKerjasama = () => {
    // Unique mitra
    const mitras = [];
    dataPokja.forEach(p => {
      if (p.mitra_id && !mitras.some(m => m._id === p.mitra_id._id)) {
        mitras.push(p.mitra_id);
      }
    });

    const filteredMitras = mitras.filter(m => 
      m.nama_instansi?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg border-b border-slate-200 dark:border-slate-700 pb-2">Dokumen Kerjasama Mitra</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMitras.map(mitra => (
            <div key={mitra._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{mitra.nama_instansi}</h3>
              <p className="text-sm text-slate-600 mb-4 flex items-center gap-1.5">
                Status: <span className="font-bold text-teal-600">{mitra.status_kerjasama || 'Belum Ada'}</span>
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Memorandum of Understanding (MoU)</p>
                    <p className="text-xs text-slate-500">Kesepakatan Tingkat Perguruan Tinggi</p>
                  </div>
                  {mitra.file_mou ? (
                    <a href={mitra.file_mou} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-lg text-xs font-bold transition-colors">
                      Buka Dokumen
                    </a>
                  ) : (
                    <span className="text-xs text-rose-500 italic">Belum Ada</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Memorandum of Agreement (MoA)</p>
                    <p className="text-xs text-slate-500">Kesepakatan Tingkat Fakultas</p>
                  </div>
                  {mitra.file_moa ? (
                    <a href={mitra.file_moa} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-lg text-xs font-bold transition-colors">
                      Buka Dokumen
                    </a>
                  ) : (
                    <span className="text-xs text-rose-500 italic">Belum Ada</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Implementation Arrangement (IA)</p>
                    <p className="text-xs text-slate-500">Surat Keterangan Implementasi Program</p>
                  </div>
                  {mitra.file_ia ? (
                    <a href={mitra.file_ia} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-lg text-xs font-bold transition-colors">
                      Buka Dokumen
                    </a>
                  ) : (
                    <span className="text-xs text-rose-500 italic">Belum Ada</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredMitras.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-500">
              Tidak ada data mitra ditemukan.
            </div>
          )}
        </div>
      </div>
    );
  };

  // ================= TAB LAPORAN AKHIR =================
  const renderTabLaporan = () => {
    const filteredIndividu = dataPengajuan.filter(p => 
      p.mahasiswa_id?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mahasiswa_id?.nim_nidn?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg border-b border-slate-200 dark:border-slate-700 pb-2">Laporan Kelompok</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dataPokja.filter(p => p.nama_pokja?.toLowerCase().includes(searchTerm.toLowerCase())).map(pokja => (
            <div key={pokja._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3">
              <div className="overflow-hidden">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{pokja.nama_pokja}</p>
                <p className="text-xs text-slate-500 truncate">{pokja.mitra_id?.nama_instansi}</p>
              </div>
              <Link href={`/mahasiswa/laporan/cetak/laporan?tipe=pokja&pokjaId=${pokja._id}`} target="_blank" className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs rounded-lg transition-colors">
                <FileText className="w-4 h-4" /> Buka
              </Link>
            </div>
          ))}
        </div>

        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg border-b border-slate-200 dark:border-slate-700 pb-2 mt-8">Laporan Individu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredIndividu.map(pengajuan => (
            <div key={pengajuan._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3 justify-between">
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{pengajuan.mahasiswa_id?.nama_lengkap}</p>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{pengajuan.mahasiswa_id?.nim_nidn}</p>
                <p className="text-xs text-teal-600 font-semibold mt-1 bg-teal-50 inline-block px-2 py-0.5 rounded">{pengajuan.pokja_id?.nama_pokja}</p>
              </div>
              <Link href={`/mahasiswa/laporan/cetak/laporan?tipe=individu&pokjaId=${pengajuan.pokja_id?._id}&mhsId=${pengajuan.mahasiswa_id?._id}`} target="_blank" className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 text-white hover:bg-slate-700 font-semibold text-xs rounded-lg transition-colors w-full">
                <FileText className="w-4 h-4" /> Lihat Laporan Individu
              </Link>
            </div>
          ))}
        </div>

        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg border-b border-slate-200 dark:border-slate-700 pb-2 mt-8">Laporan Dosen Pembimbing (DPL)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dataLaporanDpl.filter(l => l.dpl_id?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())).map(laporan => (
            <div key={laporan._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3 justify-between">
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{laporan.dpl_id?.nama_lengkap}</p>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{laporan.dpl_id?.nidn || laporan.dpl_id?.nim_nidn}</p>
                <p className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded uppercase ${laporan.status === 'disetujui' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>{laporan.status}</p>
              </div>
              <Link href={`/dpl/laporan?id=${laporan._id}`} target="_blank" className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs rounded-lg transition-colors w-full">
                <FileText className="w-4 h-4" /> Cetak Laporan
              </Link>
            </div>
          ))}
          {dataLaporanDpl.length === 0 && (
            <div className="col-span-full py-6 text-center text-slate-500 text-sm">Belum ada laporan DPL yang masuk.</div>
          )}
        </div>
      </div>
    );
  };

  // ================= TAB 3: SERTIFIKAT =================
  const renderTabSertifikat = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg border-b border-slate-200 dark:border-slate-700 pb-2">Sertifikat Mahasiswa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {dataPengajuan.filter(p => p.mahasiswa_id?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())).map(pengajuan => (
            <div key={`cert-mhs-${pengajuan._id}`} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{pengajuan.mahasiswa_id?.nama_lengkap}</p>
                <p className="text-xs text-slate-500">{pengajuan.mahasiswa_id?.nim_nidn}</p>
              </div>
              <Link href={`/mahasiswa/laporan/cetak/sertifikat-mahasiswa?mhsId=${pengajuan._id}`} target="_blank" className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border-2 border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 font-bold text-xs rounded-lg transition-colors">
                <Printer className="w-4 h-4" /> Cetak
              </Link>
            </div>
          ))}
        </div>

        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg border-b border-slate-200 dark:border-slate-700 pb-2 mt-8">Sertifikat Mitra Instansi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {dataPokja.filter(p => p.mitra_id?.nama_instansi?.toLowerCase().includes(searchTerm.toLowerCase())).map(pokja => (
            <div key={`cert-mitra-${pokja._id}`} className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-xl border border-teal-100 shadow-sm flex flex-col justify-between gap-4">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm shrink-0">
                  <Award className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2">{pokja.mitra_id?.nama_instansi || 'Belum Ada Mitra'}</p>
                  <p className="text-xs text-slate-500 mt-1">Diberikan via Kelompok: {pokja.nama_pokja}</p>
                </div>
              </div>
              <Link href={`/mahasiswa/laporan/cetak/sertifikat-mitra?pokjaId=${pokja._id}`} target="_blank" className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm">
                <Printer className="w-4 h-4" /> Cetak Sertifikat Mitra
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ================= TAB 4: GALERI FOTO (ALBUM PER KELOMPOK) =================
  const renderTabGaleri = () => {
    // 1. Compile Albums data for each Pokja
    const albums = dataPokja.map((pokja, idx) => {
      // Mitra photos
      const mitraPhotos = [];
      const mInstansi = pokja.mitra_id?.nama_instansi || "Mitra";
      if (pokja.mitra_id?.foto_kantor_desa && pokja.mitra_id.foto_kantor_desa.trim() !== '') {
        mitraPhotos.push({
          id: `mitra-desa-${pokja._id}`,
          type: 'mitra',
          url: pokja.mitra_id.foto_kantor_desa,
          title: 'Foto Gedung Kantor Mitra',
          subtitle: mInstansi,
          tag: 'Gedung Mitra',
          date: null,
          uploader: 'Instansi Mitra',
          pokja
        });
      }
      if (pokja.mitra_id?.foto_kantor_bumdes && pokja.mitra_id.foto_kantor_bumdes.trim() !== '') {
        mitraPhotos.push({
          id: `mitra-bumdes-${pokja._id}`,
          type: 'mitra',
          url: pokja.mitra_id.foto_kantor_bumdes,
          title: 'Foto Fasilitas / Dalam Gedung',
          subtitle: mInstansi,
          tag: 'Fasilitas Mitra',
          date: null,
          uploader: 'Instansi Mitra',
          pokja
        });
      }

      // Monev photos
      const monevPhotos = dataMonev.filter(m => 
        (m.pokja_id?._id && String(m.pokja_id._id) === String(pokja._id)) ||
        (m.pokja_id?.nama_pokja && m.pokja_id.nama_pokja === pokja.nama_pokja)
      ).map(m => ({
        id: `monev-${m._id}`,
        type: 'monev',
        url: m.foto_url,
        title: m.jenis_kunjungan || 'Monitoring & Evaluasi DPL',
        subtitle: `DPL: ${m.dpl_id?.nama_lengkap || pokja.dpl_id?.nama_lengkap || '-'}`,
        description: m.catatan || '',
        tag: 'Monev DPL',
        date: m.tanggal_kunjungan || m.createdAt,
        uploader: m.dpl_id?.nama_lengkap || 'DPL',
        pokja
      }));

      // Logbook photos
      const logbookPhotos = dataLogbook.filter(l => 
        (l.pokja_id?._id && String(l.pokja_id._id) === String(pokja._id)) ||
        (l.pokja_id?.nama_pokja && l.pokja_id.nama_pokja === pokja.nama_pokja)
      ).map(l => ({
        id: `logbook-${l._id}`,
        type: 'logbook',
        url: l.bukti_kegiatan,
        title: l.mahasiswa_id?.nama_lengkap || 'Mahasiswa',
        nim: l.mahasiswa_id?.nim_nidn || '',
        mhsId: l.mahasiswa_id?._id ? String(l.mahasiswa_id._id) : '',
        subtitle: l.kegiatan_utama || 'Aktivitas Harian KKL Plus',
        description: l.uraian_kegiatan || '',
        tag: 'Logbook Mahasiswa',
        date: l.tanggal_kegiatan || l.createdAt,
        uploader: l.mahasiswa_id?.nama_lengkap || 'Mahasiswa',
        pokja
      }));

      const allPhotos = [...mitraPhotos, ...monevPhotos, ...logbookPhotos];
      const coverUrl = monevPhotos[0]?.url || mitraPhotos[0]?.url || logbookPhotos[0]?.url || null;

      // Mahasiswa members list for filtering
      const membersList = [];
      if (pokja.ketua_id) {
        membersList.push({ id: String(pokja.ketua_id._id || pokja.ketua_id), nama: pokja.ketua_id.nama_lengkap || 'Ketua' });
      }
      if (Array.isArray(pokja.anggota)) {
        pokja.anggota.forEach(a => {
          if (a.user_id && String(a.user_id._id || a.user_id) !== String(pokja.ketua_id?._id || pokja.ketua_id)) {
            membersList.push({ id: String(a.user_id._id || a.user_id), nama: a.user_id.nama_lengkap || 'Anggota' });
          }
        });
      }

      return {
        pokja,
        mitraPhotos,
        monevPhotos,
        logbookPhotos,
        allPhotos,
        coverUrl,
        membersList,
        totalCount: allPhotos.length,
      };
    });

    const activeAlbum = albums.find(a => String(a.pokja._id) === String(selectedAlbumPokjaId));

    // ================= VIEW LEVEL 2: DI DALAM ALBUM KELOMPOK =================
    if (activeAlbum) {
      // Filter photos by category and student
      let currentPhotos = activeAlbum.allPhotos;
      if (galeriKategori === 'mitra') currentPhotos = activeAlbum.mitraPhotos;
      else if (galeriKategori === 'monev') currentPhotos = activeAlbum.monevPhotos;
      else if (galeriKategori === 'logbook') currentPhotos = activeAlbum.logbookPhotos;

      if (filterMhsId !== 'semua') {
        currentPhotos = currentPhotos.filter(p => p.type !== 'logbook' || p.mhsId === filterMhsId);
      }

      // Pagination calculation
      const itemsPerPage = 12;
      const totalPages = Math.ceil(currentPhotos.length / itemsPerPage) || 1;
      const currentPage = Math.min(galeriPage, totalPages);
      const paginatedPhotos = currentPhotos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Header Navigasi Album */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <button
                onClick={() => {
                  setSelectedAlbumPokjaId(null);
                  setGaleriKategori('semua');
                  setFilterMhsId('semua');
                  setGaleriPage(1);
                }}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Daftar Album
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    Album {activeAlbum.pokja.nama_pokja}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                    {activeAlbum.totalCount} Foto
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {activeAlbum.pokja.mitra_id?.desa_kelurahan ? `Kel. ${activeAlbum.pokja.mitra_id.desa_kelurahan}` : (activeAlbum.pokja.mitra_id?.nama_instansi || 'Mitra')}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    DPL: {activeAlbum.pokja.dpl_id?.nama_lengkap || '-'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    {activeAlbum.membersList.length} Mahasiswa
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Filter Toolbar: Kategori & Filter Mahasiswa */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Filter Kategori Segmented */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {[
                { id: 'semua', label: 'Semua', count: activeAlbum.totalCount },
                { id: 'mitra', label: '🏢 Mitra', count: activeAlbum.mitraPhotos.length },
                { id: 'monev', label: '👨‍🏫 Monev DPL', count: activeAlbum.monevPhotos.length },
                { id: 'logbook', label: '📸 Logbook', count: activeAlbum.logbookPhotos.length },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setGaleriKategori(cat.id); setGaleriPage(1); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    galeriKategori === cat.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${galeriKategori === cat.id ? 'bg-white/20 dark:bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Filter Mahasiswa (hanya jika ada foto logbook dan kategori mencakup logbook) */}
            {(galeriKategori === 'semua' || galeriKategori === 'logbook') && activeAlbum.membersList.length > 0 && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-slate-500 whitespace-nowrap font-medium">Mahasiswa:</span>
                <select
                  value={filterMhsId}
                  onChange={(e) => { setFilterMhsId(e.target.value); setGaleriPage(1); }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 w-full md:w-56"
                >
                  <option value="semua">Semua Mahasiswa ({activeAlbum.membersList.length})</option>
                  {activeAlbum.membersList.map(m => (
                    <option key={m.id} value={m.id}>{m.nama}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Grid Foto Paginated */}
          {paginatedPhotos.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
              <Camera className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">Tidak ada foto dokumentasi pada filter ini.</p>
              <p className="text-xs text-slate-400 mt-1">Coba ganti kategori atau pilih mahasiswa lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedPhotos.map(foto => (
                <div
                  key={foto.id}
                  onClick={() => setLightboxItem(foto)}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-400 transition-all cursor-pointer overflow-hidden group flex flex-col"
                >
                  <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={foto.url}
                      alt={foto.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentElement.innerHTML = `
                          <div class="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <svg class="w-8 h-8 mb-1 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span class="text-[10px] font-bold text-slate-500">Foto di Server</span>
                            <span class="text-[9px] text-slate-400">Klik untuk detail</span>
                          </div>
                        `;
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm font-semibold">
                      {foto.tag}
                    </div>
                    <div className="absolute inset-0 bg-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-2 bg-white/90 dark:bg-slate-800/90 text-teal-700 dark:text-teal-300 rounded-full shadow-lg">
                        <Eye className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {foto.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {foto.subtitle}
                      </p>
                    </div>
                    {foto.date && (
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 border-t border-slate-100 pt-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(foto.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button
                disabled={currentPage === 1}
                onClick={() => setGaleriPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              <span className="text-xs text-slate-600 font-medium">
                Halaman <strong className="text-slate-800 dark:text-white">{currentPage}</strong> dari <strong>{totalPages}</strong> ({currentPhotos.length} Foto)
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setGaleriPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Berikutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      );
    }

    // ================= VIEW LEVEL 1: DAFTAR SEMUA ALBUM (FOLDER POKJA) =================
    const filteredAlbums = albums.filter(a => 
      a.pokja.nama_pokja?.toLowerCase().includes(galeriSearch.toLowerCase()) ||
      a.pokja.mitra_id?.nama_instansi?.toLowerCase().includes(galeriSearch.toLowerCase()) ||
      a.pokja.dpl_id?.nama_lengkap?.toLowerCase().includes(galeriSearch.toLowerCase())
    );

    const totalDokumentasi = albums.reduce((acc, curr) => acc + curr.totalCount, 0);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* Banner Ringkasan & Search Album */}
        <div className="bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-slate-850 dark:to-slate-800 border border-teal-200/70 dark:border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-teal-600" />
              Galeri Dokumentasi Berbasis Album Kelompok
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Foto kegiatan diarsipkan rapi per Pokja untuk menghemat kuota dan mempermudah pemantauan dokumentasi lapangan.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-2xs">
                📁 {albums.length} Album Kelompok
              </span>
              <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-800 dark:text-indigo-300 shadow-2xs">
                📸 {totalDokumentasi} Total Foto Dokumentasi
              </span>
            </div>
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Kelompok / Mitra / DPL..."
              value={galeriSearch}
              onChange={(e) => setGaleriSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Grid Album Pokja Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.pokja._id}
              onClick={() => {
                setSelectedAlbumPokjaId(album.pokja._id);
                setGaleriKategori('semua');
                setFilterMhsId('semua');
                setGaleriPage(1);
              }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-teal-400 dark:hover:border-teal-400 transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col"
            >
              {/* Cover Album */}
              <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt={album.pokja.nama_pokja}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = `
                        <div class="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                          <svg class="w-10 h-10 mb-1 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                          <span class="text-xs font-bold text-slate-600">Dokumentasi Tersimpan</span>
                          <span class="text-[10px] text-slate-400">Di Server Produksi</span>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FolderOpen className="w-12 h-12 text-slate-300 mb-1" />
                    <span className="text-xs font-semibold text-slate-400">Belum Ada Foto</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                {/* Badges on cover */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  {album.pokja.periode || 'KKL Plus'}
                </div>
                <div className="absolute top-3 right-3 bg-teal-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-md backdrop-blur-sm flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" />
                  {album.totalCount} Foto
                </div>

                {/* Pokja Name on bottom of cover */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h4 className="font-black text-lg drop-shadow-md leading-tight group-hover:text-teal-200 transition-colors">
                    {album.pokja.nama_pokja}
                  </h4>
                  <p className="text-xs text-white/90 drop-shadow flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{album.pokja.mitra_id?.desa_kelurahan ? `Kel. ${album.pokja.mitra_id.desa_kelurahan}` : (album.pokja.mitra_id?.nama_instansi || 'Lokasi Mitra')}</span>
                  </p>
                </div>
              </div>

              {/* Card Body & Counters */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{album.pokja.mitra_id?.nama_instansi || 'Belum Ada Mitra'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">DPL: {album.pokja.dpl_id?.nama_lengkap || '-'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{album.membersList.length} Mahasiswa Aktif</span>
                  </p>
                </div>

                {/* Breakdown tags */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                    🏢 {album.mitraPhotos.length} Mitra
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                    👨‍🏫 {album.monevPhotos.length} Monev
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                    📸 {album.logbookPhotos.length} Logbook
                  </span>
                </div>

                <div className="pt-1">
                  <span className="w-full py-2 bg-teal-50 group-hover:bg-teal-600 text-teal-700 group-hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs">
                    Buka Album Dokumentasi →
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredAlbums.length === 0 && (
            <div className="col-span-full py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Tidak ada album yang sesuai dengan pencarian.</p>
              <p className="text-xs text-slate-400 mt-1">Coba ketikkan kata kunci nama kelompok atau mitra lain.</p>
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <DashboardLayout title="Arsip & Dokumen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-teal-600" />
            Digital Library & Arsip KKL
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Pusat penyimpanan seluruh dokumen, surat-menyurat, laporan, dan sertifikat.</p>
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
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Tabs Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex-1 md:flex-none justify-center ${
              activeTab === tab.id 
                ? "bg-teal-600 text-white shadow-md" 
                : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
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
            {activeTab === "kerjasama" && renderTabKerjasama()}
            {activeTab === "laporan" && renderTabLaporan()}
            {activeTab === "sertifikat" && renderTabSertifikat()}
            {activeTab === "galeri" && renderTabGaleri()}
          </>
        )}
      </div>

      {/* Modal Pengaturan Cetak SK */}
      {showSkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {isCollectiveSk ? "Cetak SK Kolektif (Semua Kelompok)" : `Cetak SK - ${selectedPokjaForSk?.nama_pokja || "Kelompok"}`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isCollectiveSk 
                      ? "Membuat Surat Keputusan induk untuk seluruh kelompok peserta & DPL" 
                      : `Lokasi: ${selectedPokjaForSk?.mitra_id?.desa_kelurahan ? `Kel. ${selectedPokjaForSk.mitra_id.desa_kelurahan}` : (selectedPokjaForSk?.mitra_id?.nama_instansi || '-')}`}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowSkModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSk} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Surat Keputusan (SK)
                </label>
                <input
                  type="text"
                  required
                  value={skForm.nomor_sk}
                  onChange={(e) => setSkForm({ ...skForm, nomor_sk: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 focus:border-amber-500 focus:ring focus:ring-amber-200 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                  placeholder="000.4/496/STIMI-YAPMI/MKS/IX/2026"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">Format baku: 000.4/[NoUrut]/STIMI-YAPMI/MKS/[RomawiBulan]/[Tahun]</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Penetapan SK
                  </label>
                  <input
                    type="text"
                    required
                    value={skForm.tanggal_sk}
                    onChange={(e) => setSkForm({ ...skForm, tanggal_sk: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 focus:border-amber-500 focus:ring focus:ring-amber-200 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="14 September 2026"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Rapat Pimpinan
                  </label>
                  <input
                    type="text"
                    required
                    value={skForm.tanggal_rapat}
                    onChange={(e) => setSkForm({ ...skForm, tanggal_rapat: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 focus:border-amber-500 focus:ring focus:ring-amber-200 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="28 Mei 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    required
                    value={skForm.semester}
                    onChange={(e) => setSkForm({ ...skForm, semester: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 focus:border-amber-500 focus:ring focus:ring-amber-200 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Ganjil"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Akademik
                  </label>
                  <input
                    type="text"
                    required
                    value={skForm.tahun_akademik}
                    onChange={(e) => setSkForm({ ...skForm, tahun_akademik: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 focus:border-amber-500 focus:ring focus:ring-amber-200 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="2026/2027"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowSkModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Buka & Cetak SK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {lightboxItem && (
        <div 
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center"
          >
            {/* Tombol Tutup */}
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Gambar Besar */}
            <div className="bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center max-h-[68vh] w-full">
              <img
                src={lightboxItem.url}
                alt={lightboxItem.title}
                className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.parentElement.innerHTML = `
                    <div class="py-20 text-center text-slate-300">
                      <p class="text-4xl mb-2">📸</p>
                      <p class="font-bold">File Gambar Tersimpan di Server</p>
                      <p class="text-xs text-slate-400 mt-1">File tidak ditemukan di lokal dev.</p>
                    </div>
                  `;
                }}
              />
            </div>

            {/* Info Bar Bawah */}
            <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 mt-3 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/30 text-teal-300 border border-teal-400/30">
                    {lightboxItem.tag}
                  </span>
                  <h4 className="font-bold text-sm text-white">{lightboxItem.title}</h4>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {lightboxItem.subtitle}
                  {lightboxItem.nim ? ` (NIM: ${lightboxItem.nim})` : ''}
                  {lightboxItem.date ? ` • ${new Date(lightboxItem.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                </p>
                {lightboxItem.description && (
                  <p className="text-xs text-slate-400 mt-1.5 italic line-clamp-2">
                    "{lightboxItem.description}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={lightboxItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Ukuran Asli
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
