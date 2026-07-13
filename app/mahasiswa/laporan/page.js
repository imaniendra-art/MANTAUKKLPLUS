"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { Check, X, FileSignature, Building, User, Users, BookOpen, Paperclip, Printer, PenTool, Mail, FileCheck, FileBadge, FileText, Award, Download, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const DEFAULT_SECTIONS_INDIVIDU = {
  bab1: [
    { id: '1_1', title: '1.1 Latar Belakang dan Rasionalisasi Pemilihan Mitra', content: '', placeholder: 'Uraikan argumentasi mengapa instansi tersebut dipilih sebagai mitra KKL Plus dan bagaimana relevansinya dengan kompetensi program studi Anda...' },
    { id: '1_2', title: '1.2 Tujuan dan Manfaat Pelaksanaan KKL Plus', content: '', placeholder: 'Deskripsikan target pencapaian esensial, tujuan akademis dan praktis, serta implikasi strategis pasca-pelaksanaan KKL Plus...' }
  ],
  bab2: [
    { id: '2_1', title: '2.1 Deskripsi Posisi dan Uraian Tugas (Job Description)', content: '', placeholder: 'Rincikan posisi spesifik Anda selama KKL Plus beserta tugas, tanggung jawab (KPI), dan wewenang yang diberikan...' },
    { id: '2_2', title: '2.2 Observasi Budaya dan Lingkungan Kerja Mitra', content: '', placeholder: 'Lakukan analisis observasional terhadap iklim organisasi, kultur kerja, dan mekanisme penyelesaian masalah di instansi mitra...' }
  ],
  bab3: [
    { id: '3_1', title: '3.1 Relevansi Praktik Kerja dengan Kerangka Teoretis', content: '', placeholder: 'Sintesiskan keselarasan atau kesenjangan (gap) antara teori yang dipelajari di kampus dengan realitas praktik kerja di lapangan...' },
    { id: '3_2', title: '3.2 Identifikasi Kendala dan Strategi Pemecahan Masalah', content: '', placeholder: 'Jabarkan kendala operasional yang Anda temui beserta langkah-langkah strategis yang diambil untuk meresolusinya...' },
    { id: '3_3', title: '3.3 Pengembangan Kompetensi Teknis dan Non-Teknis (Hard & Soft Skills)', content: '', placeholder: 'Evaluasi peningkatan kompetensi teknis (hard skills) dan kecakapan interpersonal (soft skills) yang Anda peroleh...' }
  ],
  bab4: [
    { id: '4_1', title: '4.1 Kesimpulan', content: '', placeholder: 'Susun kesimpulan utama mengenai efektivitas KKL Plus dan capaian kompetensi secara keseluruhan...' },
    { id: '4_2', title: '4.2 Evaluasi Diri dan Rekomendasi', content: '', placeholder: 'Berikan evaluasi diri atas kinerja Anda serta rekomendasi konstruktif bagi prodi, mahasiswa selanjutnya, maupun mitra...' }
  ],
  bab5: []
};

const DEFAULT_SECTIONS_KELOMPOK = {
  bab1: [
    { id: '1_1', title: '1.1 Latar Belakang dan Rasionalisasi Program Kerja', content: '', placeholder: 'Uraikan rasionalisasi pemilihan program kerja kelompok dan urgensinya berdasarkan hasil observasi awal...' },
    { id: '1_2', title: '1.2 Tujuan dan Sasaran Strategis Program Kerja', content: '', placeholder: 'Formulasikan tujuan kolektif dan sasaran strategis dari program kerja kelompok yang dijalankan...' }
  ],
  bab2: [
    { id: '2_1', title: '2.1 Tinjauan Historis dan Profil Institusi Mitra', content: '', placeholder: 'Paparkan sejarah, visi misi, dan profil institusi mitra sebagai landasan pemahaman konteks organisasi...' },
    { id: '2_2', title: '2.2 Struktur Organisasi dan Tata Kelola (Manajemen) Mitra', content: '', placeholder: 'Analisis struktur organisasi dan sistem tata kelola manajemen pada instansi mitra...' },
    { id: '2_3', title: '2.3 Identifikasi Kesenjangan (Gap Analysis) dan Kebutuhan Mitra', content: '', placeholder: 'Identifikasi kesenjangan kinerja (gap analysis) atau masalah spesifik yang menjadi dasar perancangan program kerja...' }
  ],
  bab3: [
    { id: '3_1', title: '3.1 Deskripsi Komprehensif Pelaksanaan Program Kerja', content: '', placeholder: 'Uraikan secara komprehensif tahapan pelaksanaan program kerja, mulai dari perencanaan hingga implementasi...' },
    { id: '3_2', title: '3.2 Evaluasi Capaian dan Indikator Keberhasilan Program (KPI)', content: '', placeholder: 'Evaluasi efektivitas program kerja berdasarkan indikator keberhasilan (KPI) yang telah ditetapkan...' }
  ],
  bab4: [
    { id: '4_1', title: '4.1 Kesimpulan dan Sintesis Kegiatan Kelompok', content: '', placeholder: 'Susun sintesis dan kesimpulan kolektif atas keseluruhan pelaksanaan program kerja kelompok...' },
    { id: '4_2', title: '4.2 Rekomendasi Manajerial dan Strategis', content: '', placeholder: 'Berikan rekomendasi manajerial dan strategis untuk penyempurnaan di masa mendatang...' }
  ],
  bab5: []
};

const safeParse = (str, defaultObj) => {
  if (!str) return defaultObj;
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return defaultObj;
  } catch (e) {
    const fallback = JSON.parse(JSON.stringify(defaultObj));
    if (fallback[0]) fallback[0].content = str;
    return fallback;
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

export default function LaporanAkhirPage() {
  const { data: session } = useSession();
  const [laporanIndividu, setLaporanIndividu] = useState(null);
  const [laporanKelompok, setLaporanKelompok] = useState(null);
  const [pengajuan, setPengajuan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('panduan'); // panduan, bab, dokumen, cetak
  const [activeMode, setActiveMode] = useState('individu'); // individu, kelompok
  const [isSaving, setIsSaving] = useState(false);

  const safeParse = (str, defaultObj) => {
    if (!str) return defaultObj;
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return defaultObj;
    } catch (e) {
      const fallback = JSON.parse(JSON.stringify(defaultObj));
      if (fallback[0]) fallback[0].content = str;
      return fallback;
    }
  };

  const countChars = (sections) => {
    return sections.reduce((acc, curr) => acc + (curr.content || '').length, 0);
  };

  const initialFormState = {
    kata_pengantar: '',
    bab1_sections: [],
    bab2_sections: [],
    bab3_sections: [],
    bab4_sections: [],
    bab5_sections: [],
    file_pengantar: '',
    file_penerimaan: '',
    file_keterangan: '',
    file_struktur_organisasi: '',
    catatan_dpl: '',
    status: 'draft',
    id: null
  };

  const [formIndividu, setFormIndividu] = useState({ ...initialFormState, bab1_sections: DEFAULT_SECTIONS_INDIVIDU.bab1, bab2_sections: DEFAULT_SECTIONS_INDIVIDU.bab2, bab3_sections: DEFAULT_SECTIONS_INDIVIDU.bab3, bab4_sections: DEFAULT_SECTIONS_INDIVIDU.bab4 });
  const [formKelompok, setFormKelompok] = useState({ ...initialFormState, bab1_sections: DEFAULT_SECTIONS_KELOMPOK.bab1, bab2_sections: DEFAULT_SECTIONS_KELOMPOK.bab2, bab3_sections: DEFAULT_SECTIONS_KELOMPOK.bab3, bab4_sections: DEFAULT_SECTIONS_KELOMPOK.bab4 });

  const isKetua = pengajuan && (pengajuan.ketua_id?._id === session?.user?.id || pengajuan.ketua_id === session?.user?.id);

  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/laporan-akhir?mhsId=${session.user.id}&_t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setLaporanIndividu(data.laporan_individu);
      setLaporanKelompok(data.laporan_kelompok);
      setPengajuan(data.pengajuan);

      if (data.laporan_individu) {
        setFormIndividu({
          id: data.laporan_individu._id,
          kata_pengantar: data.laporan_individu.kata_pengantar || '',
          bab1_sections: safeParse(data.laporan_individu.bab1_pendahuluan, DEFAULT_SECTIONS_INDIVIDU.bab1),
          bab2_sections: safeParse(data.laporan_individu.bab2_metode, DEFAULT_SECTIONS_INDIVIDU.bab2),
          bab3_sections: safeParse(data.laporan_individu.bab3_profil, DEFAULT_SECTIONS_INDIVIDU.bab3),
          bab4_sections: safeParse(data.laporan_individu.bab4_hasil, DEFAULT_SECTIONS_INDIVIDU.bab4),
          bab5_sections: safeParse(data.laporan_individu.bab5_penutup, DEFAULT_SECTIONS_INDIVIDU.bab5),
          file_pengantar: data.laporan_individu.file_pengantar || '',
          file_penerimaan: data.laporan_individu.file_penerimaan || '',
          file_keterangan: data.laporan_individu.file_keterangan || '',
          file_struktur_organisasi: data.laporan_individu.file_struktur_organisasi || '',
          catatan_dpl: parseCatatan(data.laporan_individu.catatan_dpl),
          status: data.laporan_individu.status || 'draft'
        });
      }

      if (data.laporan_kelompok) {
        setFormKelompok({
          id: data.laporan_kelompok._id,
          kata_pengantar: data.laporan_kelompok.kata_pengantar || '',
          bab1_sections: safeParse(data.laporan_kelompok.bab1_pendahuluan, DEFAULT_SECTIONS_KELOMPOK.bab1),
          bab2_sections: safeParse(data.laporan_kelompok.bab2_metode, DEFAULT_SECTIONS_KELOMPOK.bab2),
          bab3_sections: safeParse(data.laporan_kelompok.bab3_profil, DEFAULT_SECTIONS_KELOMPOK.bab3),
          bab4_sections: safeParse(data.laporan_kelompok.bab4_hasil, DEFAULT_SECTIONS_KELOMPOK.bab4),
          bab5_sections: safeParse(data.laporan_kelompok.bab5_penutup, DEFAULT_SECTIONS_KELOMPOK.bab5),
          file_pengantar: data.laporan_kelompok.file_pengantar || '',
          file_penerimaan: data.laporan_kelompok.file_penerimaan || '',
          file_keterangan: data.laporan_kelompok.file_keterangan || '',
          file_struktur_organisasi: data.laporan_kelompok.file_struktur_organisasi || '',
          catatan_dpl: parseCatatan(data.laporan_kelompok.catatan_dpl),
          status: data.laporan_kelompok.status || 'draft'
        });
      }

      setIsDirty(false);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const currentForm = activeMode === 'individu' ? formIndividu : formKelompok;
  const setCurrentForm = activeMode === 'individu' ? setFormIndividu : setFormKelompok;

  const handleSave = async (submitFinal = false, isAutoSave = false) => {
    if (!isAutoSave) setIsSaving(true);
    try {
      const payload = {
        mhsId: session.user.id,
        tipe_laporan: activeMode === 'kelompok' ? 'pokja' : 'individu',
        kata_pengantar: currentForm.kata_pengantar,
        bab1_pendahuluan: JSON.stringify(currentForm.bab1_sections),
        bab2_metode: JSON.stringify(currentForm.bab2_sections),
        bab3_profil: JSON.stringify(currentForm.bab3_sections),
        bab4_hasil: JSON.stringify(currentForm.bab4_sections),
        bab5_penutup: JSON.stringify(currentForm.bab5_sections),
        file_pengantar: currentForm.file_pengantar,
        file_penerimaan: currentForm.file_penerimaan,
        file_keterangan: currentForm.file_keterangan,
        file_struktur_organisasi: currentForm.file_struktur_organisasi,
        status: submitFinal ? 'submitted' : currentForm.status
      };

      const res = await fetch('/api/laporan-akhir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsDirty(false);
        setLastSaved(new Date());
        if (!isAutoSave) {
          alert(submitFinal ? `Laporan ${activeMode} berhasil disubmit final!` : 'Draf berhasil disimpan!');
          fetchData();
        }
      } else {
        const errorData = await res.json();
        console.error("Save error:", errorData);
        if (!isAutoSave) alert(`Gagal menyimpan: ${errorData.error || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      console.error("Save exception:", error);
      if (!isAutoSave) alert(`Terjadi kesalahan saat menyimpan: ${error.message}`);
    }
    if (!isAutoSave) setIsSaving(false);
  };

  useEffect(() => {
    if (!isDirty || currentForm.status === 'submitted') return;
    
    const timeout = setTimeout(() => {
      handleSave(false, true);
    }, 4000); // 4 seconds after typing stops
    
    return () => clearTimeout(timeout);
  }, [currentForm, isDirty]);

  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        e.target.value = null;
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          setIsSaving(true);
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: reader.result })
          });
          const data = await res.json();
          if (res.ok && data.url) {
            setCurrentForm(prev => ({ ...prev, [field]: data.url }));
            setIsDirty(true);
          } else {
            alert(`Gagal mengunggah file: ${data.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error("Upload error:", error);
          alert("Terjadi kesalahan saat mengunggah file.");
        } finally {
          setIsSaving(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <DashboardLayout title="Laporan Akhir"><div className="p-8 text-center text-slate-500">Memuat data...</div></DashboardLayout>;

  if (!pengajuan) {
    return (
      <DashboardLayout title="Laporan Akhir Mahasiswa">
        <div className="p-8">
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100">
            <h3 className="font-bold text-lg mb-2">Akses Ditolak</h3>
            <p>Anda belum memiliki pengajuan KKL Plus yang aktif atau disetujui. Laporan Akhir belum dapat diakses.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Laporan Akhir Mahasiswa">
      {!pengajuan?.is_laporan_unlocked ? (
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-10 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm text-center">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🔒</div>
            <h2 className="text-2xl font-black mb-2 text-slate-800 dark:text-white">Akses Terkunci</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Pengisian Laporan Akhir saat ini masih dikunci oleh sistem. Akses akan dibuka oleh <b>Dosen Pembimbing Lapangan (DPL)</b> setelah kegiatan POKJA dianggap cukup.
            </p>
          </div>
        </div>
      ) : (
      <div className="space-y-6 pb-28 mt-6">

        {isKetua && (
          <div className="mb-6 flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 w-fit">
            <button
              onClick={() => setActiveMode('individu')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeMode === 'individu' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <User className="w-4 h-4" /> Laporan Individu
            </button>
            <button
              onClick={() => setActiveMode('kelompok')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeMode === 'kelompok' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Users className="w-4 h-4" /> Laporan Kelompok
            </button>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-2xl font-black text-slate-800 capitalize">Mode: Laporan {activeMode}</h2>
          <p className="text-slate-500 text-sm">
            {activeMode === 'individu' 
              ? 'Fokus pada proses belajar, pengembangan diri, dan observasi personal.' 
              : 'Fokus pada output proker kelompok dan analisis organisasional perusahaan mitra.'}
          </p>
        </div>

        {currentForm.status === 'submitted' && (
          <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3">
            <div className="text-2xl"><Clock className="w-6 h-6 text-amber-600" /></div>
            <div>
              <div className="font-bold">Menunggu Persetujuan DPL</div>
              <div className="text-sm">Laporan {activeMode} telah disubmit dan sedang diperiksa oleh DPL Anda. Anda tidak dapat mengubah isi laporan saat ini.</div>
            </div>
          </div>
        )}

        {currentForm.status === 'revisi' && (
          <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
            <div className="text-2xl mt-1"><AlertTriangle className="w-6 h-6 text-amber-600" /></div>
            <div>
              <div className="font-bold">Laporan Perlu Direvisi</div>
              <div className="text-sm mb-2">DPL Anda meminta Anda untuk melakukan revisi sebelum laporan {activeMode} dapat disetujui.</div>
              <div className="bg-white p-3 rounded border border-amber-100 text-sm italic font-medium">
                Catatan DPL: Silakan periksa detail pesan revisi yang tertera di kotak merah pada masing-masing kolom isian laporan Anda.
              </div>
            </div>
          </div>
        )}

        {currentForm.status === 'disetujui' && (
          <div className="mb-8 bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-xl flex items-center gap-3">
            <div className="text-2xl"><CheckCircle className="w-6 h-6 text-teal-600" /></div>
            <div>
              <div className="font-bold">Laporan {activeMode} Telah Disetujui DPL</div>
              <div className="text-sm">Anda sekarang dapat mencetak dokumen {activeMode}.</div>
            </div>
          </div>
        )}

        {/* Tab Navigasi */}
        <div className="flex bg-white rounded-t-2xl border-b border-slate-200 p-2 gap-2 shadow-sm flex-wrap">
          <button onClick={() => setActiveTab('panduan')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'panduan' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BookOpen className="w-4 h-4" /> Panduan & Template
          </button>
          <button onClick={() => setActiveTab('bab')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'bab' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-slate-50'}`}>
            <FileSignature className="w-4 h-4" /> Isi Laporan (Pengantar - Bab IV)
          </button>
          <button onClick={() => setActiveTab('dokumen')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'dokumen' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Paperclip className="w-4 h-4" /> Upload Lampiran
          </button>
          <button onClick={() => setActiveTab('cetak')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'cetak' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Printer className="w-4 h-4" /> Cetak Dokumen
          </button>
        </div>

        {/* Konten Tab */}
        <div className="bg-white p-8 rounded-b-2xl shadow-sm border border-t-0 border-slate-100 min-h-[500px]">
          
          {/* TAB 0: PANDUAN */}
          {activeTab === 'panduan' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Sistematika Penulisan {activeMode === 'individu' ? 'Individu' : 'Kelompok'}</h3>
                
                {activeMode === 'individu' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-xl md:col-span-2">
                      <h4 className="font-bold text-lg text-teal-700 border-b pb-2 mb-2">KATA PENGANTAR</h4>
                      <div className="space-y-3 mt-3">
                        <div>
                          <span className="text-sm text-slate-600">Berisi ucapan syukur kepada Tuhan Yang Maha Esa dan penyampaian rasa terima kasih secara terperinci kepada pihak-pihak yang telah berkontribusi dan mendukung selama proses KKL Plus (misal: Pimpinan Kampus, Dosen Pembimbing Lapangan, Mentor/Pimpinan Instansi Mitra, Rekan Kelompok, dan Keluarga). Sampaikan juga tujuan singkat penulisan laporan serta permohonan maaf atas segala kekurangan yang mungkin ada di dalam penulisan.</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border p-4 rounded-xl md:col-span-2">
                      <h4 className="font-bold text-lg text-teal-700 border-b pb-2 mb-2">BAB I. PENDAHULUAN</h4>
                      <div className="space-y-3 mt-3">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">1.1 Latar Belakang dan Rasionalisasi Pemilihan Mitra</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Bagian ini menguraikan argumentasi logis dan objektif mengenai alasan penentuan instansi atau perusahaan sebagai mitra KKL Plus. Mahasiswa diwajibkan untuk memaparkan korelasi antara profil institusi mitra dengan bidang keilmuan yang ditekuni, serta menyusun rasionalisasi pemilihan tersebut secara komprehensif dengan memuat komponen-komponen berikut:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Landasan Pemilihan Mitra:</b> Uraikan argumentasi mengapa instansi/perusahaan tersebut dipilih dan bagaimana relevansinya dengan kompetensi serta konsentrasi program studi.</li>
                              <li><b>Nilai Tambah (Value Proposition) Institusi:</b> Deskripsikan keunggulan komparatif, sistem kerja operasional, prosedur manajerial, atau karakteristik spesifik dari mitra yang menjadikannya sebagai lokasi yang representatif dan ideal untuk pelaksanaan studi lapangan.</li>
                              <li><b>Fokus Kajian dan Identifikasi Masalah:</b> Formulasikan fenomena, kesenjangan empiris (gap), urgensi permasalahan praktis, atau fokus kajian yang akan diobservasi dan dianalisis secara mendalam selama pelaksanaan kegiatan KKL Plus di lokasi tersebut.</li>
                            </ul>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">1.2 Tujuan dan Manfaat Pelaksanaan KKL Plus</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Bagian ini mendeskripsikan secara definitif target pencapaian esensial yang diharapkan oleh mahasiswa selama pelaksanaan KKL Plus. Uraian harus mencakup signifikansi program terhadap pengembangan kapasitas diri secara terstruktur, dengan memuat komponen berikut:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Tujuan Akademis dan Praktis:</b> Formulasikan tujuan spesifik yang diorientasikan pada pemahaman komprehensif terhadap dinamika dunia kerja profesional, serta pengujian teori akademis dalam situasi empiris.</li>
                              <li><b>Pengembangan Kompetensi (Skill Acquisition):</b> Identifikasi kompetensi teknis (hardskill) maupun kompetensi interpersonal (softskill) yang secara spesifik menjadi target utama untuk diakuisisi atau diekskalasi.</li>
                              <li><b>Implikasi dan Manfaat Strategis:</b> Deskripsikan proyeksi manfaat strategis pasca-pelaksanaan KKL Plus, baik signifikansinya bagi peningkatan daya saing dan akselerasi karir profesional, maupun kontribusi konstruktif bagi institusi mitra.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border p-4 rounded-xl md:col-span-2">
                      <h4 className="font-bold text-lg text-teal-700 border-b pb-2 mb-2">BAB II. DESKRIPSI PERAN</h4>
                      <div className="space-y-3 mt-3">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">2.1 Deskripsi Posisi dan Uraian Tugas (Job Description)</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Bagian ini menguraikan penempatan institusional mahasiswa selama KKL Plus beserta rincian beban kerja (workload) yang diamanatkan. Mahasiswa diharapkan mendeskripsikan secara komprehensif:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Nomenklatur dan Posisi Penempatan:</b> Sebutkan unit kerja, departemen, atau divisi penempatan secara spesifik beserta struktur komandonya (atasan langsung).</li>
                              <li><b>Rincian Tugas Pokok dan Fungsi (Tupoksi):</b> Jabarkan operasional harian atau mingguan yang menjadi tanggung jawab utama. Uraikan prosedur, instrumen, atau perangkat lunak yang secara rutin dioperasikan dalam penyelesaian tugas.</li>
                            </ul>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">2.2 Observasi Budaya dan Lingkungan Kerja Mitra</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Bagian ini menuntut mahasiswa untuk melakukan analisis observasional terhadap iklim organisasi dan kultur kerja di instansi mitra. Komponen analisis meliputi:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Dinamika dan Iklim Organisasi:</b> Deskripsikan atmosfer kerja profesional, sistem komunikasi interpersonal, pola koordinasi antar-divisi, serta mekanisme penyelesaian konflik (problem-solving) yang berlaku.</li>
                              <li><b>Internalisasi Budaya Profesional:</b> Identifikasi nilai-nilai (core values), etos kerja, kedisiplinan, atau standar operasional (SOP) positif yang diadopsi oleh mitra, yang memberikan konversi nilai-nilai profesional di luar kurikulum akademis kampus.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border p-4 rounded-xl md:col-span-2">
                      <h4 className="font-bold text-lg text-teal-700 border-b pb-2 mb-2">BAB III. REFLEKSI DAN PEMBAHASAN</h4>
                      <div className="space-y-3 mt-3">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">3.1 Relevansi Praktik Kerja dengan Kerangka Teoretis</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Bagian ini mengevaluasi korelasi dan integrasi antara landasan teori yang didapatkan pada kurikulum program studi dengan realitas empiris di lapangan kerja. Mahasiswa diharuskan untuk mensintesiskan:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Keselarasan Teori dan Praktik:</b> Paparkan studi kasus spesifik di mana konsep atau model akademis berhasil diimplementasikan secara langsung untuk menyelesaikan tugas-tugas di lokasi KKL Plus.</li>
                              <li><b>Kesenjangan (Gap) Teoretis:</b> Analisis fenomena operasional yang mengalami deviasi atau ketidaksesuaian dengan literatur akademis, beserta argumen mengenai faktor praktis yang menyebabkan perbedaan tersebut.</li>
                            </ul>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">3.2 Identifikasi Kendala dan Strategi Pemecahan Masalah</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Fokus pada identifikasi hambatan teknis maupun non-teknis yang mengintervensi efektivitas kinerja selama pelaksanaan KKL Plus, serta mekanisme adaptasinya:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Analisis Kendala Operasional:</b> Deskripsikan kendala yang dialami, baik dari segi keterbatasan fasilitas, kapabilitas personal, maupun dinamika tim (team dynamics).</li>
                              <li><b>Strategi Mitigasi dan Solusi (Problem Solving):</b> Jabarkan langkah-langkah konkret, taktis, maupun strategis yang diambil secara mandiri atau kolaboratif dalam meresolusi kendala tersebut, serta hasil (outcome) dari intervensi yang dilakukan.</li>
                            </ul>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">3.3 Pengembangan Kompetensi Teknis dan Non-Teknis (Hard & Soft Skills)</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Mengevaluasi secara objektif ekskalasi dan akuisisi kompetensi pasca-kegiatan, yang diklasifikasikan ke dalam dua parameter utama:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Kecakapan Teknis (Hard Skills):</b> Penguasaan instrumen kerja baru, metodologi praktis, perangkat lunak (software), atau prosedur teknis spesifik yang relevan dengan bidang keahlian.</li>
                              <li><b>Kecakapan Interpersonal (Soft Skills):</b> Peningkatan kapasitas komunikasi profesional, manajemen waktu, negosiasi, resiliensi terhadap tekanan kerja, serta kemampuan berkolaborasi lintas sektoral (teamwork).</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border p-4 rounded-xl md:col-span-2">
                      <h4 className="font-bold text-lg text-teal-700 border-b pb-2 mb-2">BAB IV. PENUTUP</h4>
                      <div className="space-y-3 mt-3">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">4.1 Kesimpulan</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Merupakan sintesis komprehensif dari keseluruhan observasi dan implementasi kegiatan. Mahasiswa harus merumuskan:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Ketercapaian Indikator Kinerja:</b> Penilaian konklusif mengenai tingkat keberhasilan pencapaian tujuan dan manfaat yang telah diproyeksikan pada Bab I.</li>
                              <li><b>Sintesis Pengalaman Profesional:</b> Ringkasan akumulatif mengenai dampak fundamental kegiatan KKL Plus terhadap pembentukan karakter dan kesiapan memasuki ekosistem dunia kerja sesungguhnya.</li>
                            </ul>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">4.2 Evaluasi Diri dan Rekomendasi</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Memberikan ulasan konstruktif sebagai landasan perbaikan berkelanjutan (continuous improvement), yang mencakup:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Evaluasi Personal (Self-Assessment):</b> Identifikasi celah kompetensi (competency gap) yang masih perlu dioptimalkan untuk meminimalkan disparitas antara kualifikasi diri saat ini dengan tuntutan industri.</li>
                              <li><b>Rekomendasi Strategis:</b> Saran konstruktif dan aplikatif yang ditujukan kepada institusi kampus (penyesuaian kurikulum), instansi mitra (perbaikan manajemen program mahasiswa KKL Plus), maupun bagi mahasiswa periode mendatang.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-xl md:col-span-2">
                      <h4 className="font-bold text-lg text-teal-700 border-b pb-2 mb-2">KATA PENGANTAR</h4>
                      <div className="space-y-3 mt-3">
                        <div>
                          <span className="text-sm text-slate-600">Berisi ucapan syukur kepada Tuhan Yang Maha Esa dan penyampaian rasa terima kasih secara terperinci kepada pihak-pihak yang telah berkontribusi dan mendukung selama proses KKL Plus (misal: Pimpinan Kampus, Dosen Pembimbing Lapangan, Mentor/Pimpinan Instansi Mitra, dan pihak lain yang relevan). Sampaikan juga tujuan singkat penulisan laporan kelompok serta permohonan maaf atas segala kekurangan yang mungkin ada di dalam penulisan.</span>
                        </div>
                      </div>
                    </div>

                    <div className="border p-4 rounded-xl md:col-span-2">
                      <h4 className="font-bold text-lg text-teal-700 border-b pb-2 mb-2">BAB I. PENDAHULUAN</h4>
                      <div className="space-y-3 mt-3">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">1.1 Latar Belakang dan Rasionalisasi Program Kerja</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Bagian ini menguraikan argumentasi logis mengenai pemilihan program kerja yang diusung oleh kelompok. Uraian harus mencakup:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Analisis Situasional:</b> Penjelasan mengenai kondisi awal di lokasi mitra yang mendasari perlunya program kerja tersebut.</li>
                              <li><b>Urgensi Program:</b> Paparan mengenai seberapa penting program ini untuk dilaksanakan dan relevansinya dengan kebutuhan mitra maupun kompetensi program studi mahasiswa.</li>
                            </ul>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">1.2 Tujuan dan Sasaran Strategis Program Kerja</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Tujuan Umum dan Khusus:</b> Formulasikan capaian akhir yang ingin diraih melalui eksekusi program kerja.</li>
                              <li><b>Sasaran Program (Target Audience):</b> Identifikasi pihak-pihak yang menjadi penerima manfaat langsung (beneficiaries) dari program kerja yang dijalankan.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border p-4 rounded-xl md:col-span-2">
                      <h4 className="font-bold text-lg text-teal-700 border-b pb-2 mb-2">BAB II. PROFIL MITRA DAN ANALISIS</h4>
                      <div className="space-y-3 mt-3">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">2.1 Tinjauan Historis dan Profil Institusi Mitra</span>
                          <span className="text-sm text-slate-600">Paparkan profil singkat, sejarah pendirian, visi-misi, serta sektor atau bidang garapan utama dari instansi mitra.</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">2.2 Struktur Organisasi dan Tata Kelola (Manajemen) Mitra</span>
                          <span className="text-sm text-slate-600">Gambarkan susunan organisasi, pembagian divisi, dan garis komando yang berlaku. Uraikan secara singkat bagaimana roda manajemen dan operasional mitra dijalankan sehari-hari.</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">2.3 Identifikasi Kesenjangan (Gap Analysis) dan Kebutuhan Mitra</span>
                          <span className="text-sm text-slate-600"><b>Analisis Kebutuhan (Needs Assessment):</b> Formulasikan permasalahan konkret, kendala operasional, atau area pengembangan (area of improvement) yang ditemukan di instansi mitra, yang kemudian menjadi landasan rumusan program kerja kelompok.</span>
                        </div>
                      </div>
                    </div>

                    <div className="border p-4 rounded-xl md:col-span-2">
                      <h4 className="font-bold text-lg text-teal-700 border-b pb-2 mb-2">BAB III. PELAKSANAAN PROGRAM KERJA</h4>
                      <div className="space-y-3 mt-3">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">3.1 Deskripsi Komprehensif Pelaksanaan Program Kerja</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Metode dan Tahapan Eksekusi:</b> Jabarkan secara kronologis dan sistematis langkah-langkah implementasi program kerja, mulai dari tahap perencanaan, persiapan, hingga eksekusi di lapangan.</li>
                              <li><b>Pembagian Peran (Role Assignment):</b> Uraikan pembagian tugas spesifik dan kontribusi masing-masing anggota kelompok dalam realisasi program.</li>
                            </ul>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">3.2 Evaluasi Capaian dan Indikator Keberhasilan Program (KPI)</span>
                          <div className="text-sm text-slate-600 space-y-2">
                            <ul className="list-disc pl-5 space-y-1">
                              <li><b>Pengukuran Kinerja:</b> Lakukan evaluasi objektif terhadap tingkat keberhasilan program kerja dengan membandingkan target awal (Bab I) dengan realisasi di lapangan.</li>
                              <li><b>Faktor Pendukung dan Penghambat:</b> Identifikasi variabel-variabel yang memfasilitasi kelancaran program maupun hambatan yang mengintervensi eksekusinya, beserta solusi yang telah diterapkan.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border p-4 rounded-xl md:col-span-2">
                      <h4 className="font-bold text-lg text-teal-700 border-b pb-2 mb-2">BAB IV. PENUTUP</h4>
                      <div className="space-y-3 mt-3">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">4.1 Kesimpulan dan Sintesis Kegiatan Kelompok</span>
                          <span className="text-sm text-slate-600">Rangkumkan efektivitas keseluruhan program kerja yang telah dijalankan dan dampaknya secara kolektif terhadap institusi mitra.</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block mb-1">4.2 Rekomendasi Manajerial dan Strategis</span>
                          <span className="text-sm text-slate-600">Berikan saran tindak lanjut yang aplikatif bagi instansi mitra untuk memelihara (sustainability) hasil program kerja, serta masukan evaluatif bagi pihak kampus dalam penyelenggaraan KKL Plus di masa mendatang.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Template & Referensi Dokumen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href={`/mahasiswa/laporan/templates/pengesahan?id=${currentForm.id || ''}`} target="_blank" className="flex items-center gap-3 p-4 border rounded-xl hover:bg-teal-50 transition-colors">
                    <div className="p-3 bg-teal-100 rounded-lg text-teal-600"><PenTool className="w-6 h-6" /></div>
                    <div>
                      <div className="font-bold">Lembar Pengesahan</div>
                      <div className="text-xs text-slate-500">Template Cetak & TTD</div>
                    </div>
                  </Link>
                  <Link href={`/mahasiswa/laporan/templates/pengantar?id=${currentForm.id || ''}`} target="_blank" className="flex items-center gap-3 p-4 border rounded-xl hover:bg-teal-50 transition-colors">
                    <div className="p-3 bg-teal-100 rounded-lg text-teal-600"><Mail className="w-6 h-6" /></div>
                    <div>
                      <div className="font-bold">Surat Pengantar KKL Plus</div>
                      <div className="text-xs text-slate-500">Template Cetak & TTD</div>
                    </div>
                  </Link>
                  <Link href={`/mahasiswa/laporan/templates/penerimaan?id=${currentForm.id || ''}`} target="_blank" className="flex items-center gap-3 p-4 border rounded-xl hover:bg-teal-50 transition-colors">
                    <div className="p-3 bg-teal-100 rounded-lg text-teal-600"><FileCheck className="w-6 h-6" /></div>
                    <div>
                      <div className="font-bold">Surat Penerimaan KKL Plus</div>
                      <div className="text-xs text-slate-500">Template Cetak & TTD</div>
                    </div>
                  </Link>
                  <Link href={`/mahasiswa/laporan/templates/keterangan?id=${currentForm.id || ''}`} target="_blank" className="flex items-center gap-3 p-4 border rounded-xl hover:bg-amber-50 transition-colors">
                    <div className="p-3 bg-amber-100 rounded-lg text-amber-600"><FileBadge className="w-6 h-6" /></div>
                    <div>
                      <div className="font-bold">Surat Keterangan Selesai KKL Plus</div>
                      <div className="text-xs text-slate-500">Template Cetak & TTD</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: ISI LAPORAN */}
          {activeTab === 'bab' && (
            <div className="space-y-8">
              {currentForm.catatan_dpl?.global && (
                <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-amber-800 shadow-sm flex gap-3 items-start">
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <div className="font-bold text-lg mb-1 text-amber-900">Catatan Revisi Umum DPL</div>
                    <div className="whitespace-pre-wrap">{currentForm.catatan_dpl.global}</div>
                  </div>
                </div>
              )}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-lg font-bold text-slate-800">KATA PENGANTAR ({activeMode === 'individu' ? 'Pribadi' : 'Kelompok'})</h3>
                  {currentForm.status !== 'submitted' && (
                    <button onClick={() => handleSave(false)} disabled={isSaving} className={`px-4 py-2 text-sm rounded-lg border font-bold shadow-sm disabled:opacity-50 transition-colors ${isDirty ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                      {isSaving ? 'Menyimpan...' : (isDirty ? 'Perlu Disimpan (*)' : (lastSaved ? `Tersimpan ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Simpan Draf'))}
                    </button>
                  )}
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {currentForm.catatan_dpl?.kata_pengantar && (
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex gap-2 items-start shadow-sm">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <div className="font-bold mb-0.5 text-amber-900">Revisi DPL (Kata Pengantar):</div>
                        <div className="whitespace-pre-wrap">{currentForm.catatan_dpl.kata_pengantar}</div>
                      </div>
                    </div>
                  )}
                  <textarea
                    disabled={['submitted', 'disetujui'].includes(currentForm.status)}
                    value={currentForm.kata_pengantar}
                    onChange={(e) => {
                      setIsDirty(true);
                      setCurrentForm({...currentForm, kata_pengantar: e.target.value});
                    }}
                    className="w-full h-48 border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 text-sm"
                    placeholder="Puji dan syukur ke hadirat Tuhan Yang Maha Esa... (Tuliskan ungkapan rasa syukur, tujuan penulisan laporan KKL Plus, serta ucapan terima kasih kepada pihak-pihak yang telah membantu kelancaran kegiatan)"
                  ></textarea>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-lg font-bold text-slate-800">BAB I. Pendahuluan</h3>
                </div>
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {currentForm.bab1_sections.map((sec, idx) => (
                    <div key={sec.id}>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        {(activeMode === 'individu' ? DEFAULT_SECTIONS_INDIVIDU.bab1 : DEFAULT_SECTIONS_KELOMPOK.bab1).find(s => s.id === sec.id)?.title || sec.title}
                      </label>
                      {currentForm.catatan_dpl?.[sec.id] && (
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex gap-2 items-start shadow-sm">
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                          <div>
                            <div className="font-bold mb-0.5 text-amber-900">Revisi DPL:</div>
                            <div className="whitespace-pre-wrap">{currentForm.catatan_dpl[sec.id]}</div>
                          </div>
                        </div>
                      )}
                      <textarea
                        disabled={['submitted', 'disetujui'].includes(currentForm.status)}
                        value={sec.content}
                        onChange={(e) => {
                          setIsDirty(true);
                          const newSecs = [...currentForm.bab1_sections];
                          newSecs[idx].content = e.target.value;
                          setCurrentForm({...currentForm, bab1_sections: newSecs});
                        }}
                        className="w-full h-32 border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 text-sm"
                        placeholder={(activeMode === 'individu' ? DEFAULT_SECTIONS_INDIVIDU.bab1 : DEFAULT_SECTIONS_KELOMPOK.bab1).find(s => s.id === sec.id)?.placeholder || 'Ketik di sini...'}
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-lg font-bold text-slate-800">BAB II. {activeMode === 'individu' ? 'Deskripsi Peran' : 'Profil Mitra & Analisis'}</h3>
                </div>
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {currentForm.bab2_sections.map((sec, idx) => (
                    <div key={sec.id}>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        {(activeMode === 'individu' ? DEFAULT_SECTIONS_INDIVIDU.bab2 : DEFAULT_SECTIONS_KELOMPOK.bab2).find(s => s.id === sec.id)?.title || sec.title}
                      </label>
                      {currentForm.catatan_dpl?.[sec.id] && (
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex gap-2 items-start shadow-sm">
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                          <div>
                            <div className="font-bold mb-0.5 text-amber-900">Revisi DPL:</div>
                            <div className="whitespace-pre-wrap">{currentForm.catatan_dpl[sec.id]}</div>
                          </div>
                        </div>
                      )}
                      <textarea
                        disabled={['submitted', 'disetujui'].includes(currentForm.status)}
                        value={sec.content}
                        onChange={(e) => {
                          setIsDirty(true);
                          const newSecs = [...currentForm.bab2_sections];
                          newSecs[idx].content = e.target.value;
                          setCurrentForm({...currentForm, bab2_sections: newSecs});
                        }}
                        className="w-full h-32 border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 text-sm"
                        placeholder={(activeMode === 'individu' ? DEFAULT_SECTIONS_INDIVIDU.bab2 : DEFAULT_SECTIONS_KELOMPOK.bab2).find(s => s.id === sec.id)?.placeholder || 'Ketik di sini...'}
                      ></textarea>
                      {sec.id === '2_2' && (
                        <div className="mt-2 text-xs text-slate-600 bg-teal-50 border border-teal-100 p-2 rounded-lg flex gap-2 items-start">
                          <span className="font-semibold text-teal-700 shrink-0">💡 Tips:</span>
                          <p>
                            Anda dapat mengunggah Gambar Struktur Organisasi (jika ada) melalui tab{' '}
                            <button 
                              type="button" 
                              onClick={() => {
                                setActiveTab('dokumen');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }} 
                              className="text-teal-600 hover:text-teal-800 underline font-semibold transition-colors"
                            >
                              Upload Lampiran
                            </button>.
                            Gambar tersebut akan otomatis disematkan di bawah teks bagian ini pada hasil cetak laporan.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-lg font-bold text-slate-800">BAB III. {activeMode === 'individu' ? 'Refleksi dan Pembahasan' : 'Pelaksanaan Program Kerja'}</h3>
                </div>
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {currentForm.bab3_sections.map((sec, idx) => (
                    <div key={sec.id}>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        {(activeMode === 'individu' ? DEFAULT_SECTIONS_INDIVIDU.bab3 : DEFAULT_SECTIONS_KELOMPOK.bab3).find(s => s.id === sec.id)?.title || sec.title}
                      </label>
                      {currentForm.catatan_dpl?.[sec.id] && (
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex gap-2 items-start shadow-sm">
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                          <div>
                            <div className="font-bold mb-0.5 text-amber-900">Revisi DPL:</div>
                            <div className="whitespace-pre-wrap">{currentForm.catatan_dpl[sec.id]}</div>
                          </div>
                        </div>
                      )}
                      <textarea
                        disabled={['submitted', 'disetujui'].includes(currentForm.status)}
                        value={sec.content}
                        onChange={(e) => {
                          setIsDirty(true);
                          const newSecs = [...currentForm.bab3_sections];
                          newSecs[idx].content = e.target.value;
                          setCurrentForm({...currentForm, bab3_sections: newSecs});
                        }}
                        className="w-full h-32 border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 text-sm"
                        placeholder={(activeMode === 'individu' ? DEFAULT_SECTIONS_INDIVIDU.bab3 : DEFAULT_SECTIONS_KELOMPOK.bab3).find(s => s.id === sec.id)?.placeholder || 'Ketik di sini...'}
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-lg font-bold text-slate-800">BAB IV. Penutup</h3>
                </div>
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {currentForm.bab4_sections.map((sec, idx) => (
                    <div key={sec.id}>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        {(activeMode === 'individu' ? DEFAULT_SECTIONS_INDIVIDU.bab4 : DEFAULT_SECTIONS_KELOMPOK.bab4).find(s => s.id === sec.id)?.title || sec.title}
                      </label>
                      {currentForm.catatan_dpl?.[sec.id] && (
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex gap-2 items-start shadow-sm">
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                          <div>
                            <div className="font-bold mb-0.5 text-amber-900">Revisi DPL:</div>
                            <div className="whitespace-pre-wrap">{currentForm.catatan_dpl[sec.id]}</div>
                          </div>
                        </div>
                      )}
                      <textarea
                        disabled={['submitted', 'disetujui'].includes(currentForm.status)}
                        value={sec.content}
                        onChange={(e) => {
                          setIsDirty(true);
                          const newSecs = [...currentForm.bab4_sections];
                          newSecs[idx].content = e.target.value;
                          setCurrentForm({...currentForm, bab4_sections: newSecs});
                        }}
                        className="w-full h-32 border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 text-sm"
                        placeholder={(activeMode === 'individu' ? DEFAULT_SECTIONS_INDIVIDU.bab4 : DEFAULT_SECTIONS_KELOMPOK.bab4).find(s => s.id === sec.id)?.placeholder || 'Ketik di sini...'}
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: UPLOAD DOKUMEN */}
          {activeTab === 'dokumen' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm mb-6">
                <strong>Penting:</strong> Dokumen lampiran ini berlaku untuk Laporan <b>{activeMode}</b>.
              </div>

              <div className="border border-slate-200 rounded-2xl p-6">
                <h4 className="font-bold text-slate-800 mb-1">1. Surat Pengantar</h4>
                <input disabled={['submitted', 'disetujui'].includes(currentForm.status)} type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'file_pengantar')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                {currentForm.file_pengantar && <span className="ml-4 text-xs font-bold text-teal-600">✓ Berkas Tersimpan</span>}
              </div>

              <div className="border border-slate-200 rounded-2xl p-6">
                <h4 className="font-bold text-slate-800 mb-1">2. Surat Penerimaan</h4>
                <input disabled={['submitted', 'disetujui'].includes(currentForm.status)} type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'file_penerimaan')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                {currentForm.file_penerimaan && <span className="ml-4 text-xs font-bold text-teal-600">✓ Berkas Tersimpan</span>}
              </div>

              <div className="border border-slate-200 rounded-2xl p-6">
                <h4 className="font-bold text-slate-800 mb-1">3. Surat Keterangan Selesai</h4>
                <input disabled={['submitted', 'disetujui'].includes(currentForm.status)} type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'file_keterangan')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                {currentForm.file_keterangan && <span className="ml-4 text-xs font-bold text-teal-600">✓ Berkas Tersimpan</span>}
              </div>

              <div className="border border-slate-200 rounded-2xl p-6">
                <h4 className="font-bold text-slate-800 mb-1">4. Gambar Struktur Organisasi (Opsional)</h4>
                <input disabled={['submitted', 'disetujui'].includes(currentForm.status)} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'file_struktur_organisasi')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                {currentForm.file_struktur_organisasi && <span className="ml-4 text-xs font-bold text-teal-600">✓ Gambar Tersimpan</span>}
              </div>
            </div>
          )}

          {/* TAB 3: CETAK */}
          {activeTab === 'cetak' && (
            <div className="space-y-6">
              {currentForm.status !== 'disetujui' ? (
                <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center">
                  <div className="text-4xl mb-3">⚠️</div>
                  <h3 className="font-bold text-lg">Dokumen Belum Bisa Dicetak</h3>
                  <p className="text-sm mt-1">Laporan <b>{activeMode}</b> Anda harus berstatus <strong>Disetujui</strong> oleh DPL sebelum dapat dicetak menjadi dokumen PDF resmi.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-all text-center group bg-white">
                    <div className="mx-auto w-16 h-16 bg-teal-100 text-teal-600 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform"><FileText className="w-8 h-8" /></div>
                    <h3 className="font-black text-xl text-slate-800 mb-2">Laporan Akhir ({activeMode === 'individu' ? 'Individu' : 'Kelompok'})</h3>
                    <p className="text-sm text-slate-500 mb-6">Dokumen lengkap beserta lampiran surat.</p>
                    <Link href={`/mahasiswa/laporan/cetak/laporan?id=${currentForm.id || ''}`} target="_blank" className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-500/30 flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" /> Download PDF Laporan
                    </Link>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-all text-center group bg-white">
                    <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform"><Award className="w-8 h-8" /></div>
                    <h3 className="font-black text-xl text-slate-800 mb-2">Sertifikat Mahasiswa</h3>
                    <p className="text-sm text-slate-500 mb-6">Sertifikat kelulusan KKL Plus dengan Validasi QR Code SKPI.</p>
                    <Link href={`/mahasiswa/laporan/cetak/sertifikat-mahasiswa?id=${currentForm.id || ''}`} target="_blank" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/30 flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" /> Download Sertifikat
                    </Link>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

        {/* Aksi Bawah */}
        {currentForm.status !== 'submitted' && activeTab === 'bab' && (
          <div className="mt-8 flex justify-end gap-4">
            <button onClick={() => handleSave(false)} disabled={isSaving} className="px-8 py-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition-colors">
              {isSaving ? 'Menyimpan...' : `Simpan Draf ${activeMode}`}
            </button>
            <button onClick={() => {
              if (confirm(`Yakin ingin SUBMIT FINAL Laporan ${activeMode}? Setelah diajukan, laporan akan terkunci untuk direviu oleh DPL.`)) {
                handleSave(true);
              }
            }} disabled={isSaving} className="px-8 py-3 rounded-xl bg-teal-600 font-bold text-white hover:bg-teal-700 shadow-lg shadow-teal-500/30 disabled:opacity-50 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Ajukan ke DPL (Submit Final)
            </button>
          </div>
        )}
      </div>
      )}
    </DashboardLayout>
  );
}
