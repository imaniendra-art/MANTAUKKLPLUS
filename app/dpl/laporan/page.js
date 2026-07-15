'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, FileText, CheckCircle, Info, AlertTriangle, FileSignature, Printer, BookOpen, Award } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/DashboardLayout";

export default function LaporanDplPage() {
  const { data: session } = useSession();
  const [laporan, setLaporan] = useState(null);
  const [pokjas, setPokjas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('panduan'); 
  const reportRef = useRef(null);

  const [formData, setFormData] = useState({
    latar_belakang: '',
    tujuan_pembimbingan: '',
    jadwal_pembekalan: '',
    jadwal_monitoring_1: '',
    jadwal_monitoring_2: '',
    jadwal_penarikan: '',
    proker_utama: '',
    proker_penunjang: '',
    evaluasi_kinerja: '',
    evaluasi_prokers: {},
    kendala_lapangan: '',
    solusi_lapangan: '',
    kesimpulan: '',
    saran: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      const url = id ? `/api/dpl/laporan?id=${id}` : '/api/dpl/laporan';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setPokjas(data.pokjas || []);
        if (data.laporan) {
          setLaporan(data.laporan);
          setFormData({
            latar_belakang: data.laporan.latar_belakang || '',
            tujuan_pembimbingan: data.laporan.tujuan_pembimbingan || '',
            jadwal_pembekalan: data.laporan.jadwal_pembekalan || '',
            jadwal_monitoring_1: data.laporan.jadwal_monitoring_1 || '',
            jadwal_monitoring_2: data.laporan.jadwal_monitoring_2 || '',
            jadwal_penarikan: data.laporan.jadwal_penarikan || '',
            proker_utama: data.laporan.proker_utama || '',
            proker_penunjang: data.laporan.proker_penunjang || '',
            evaluasi_kinerja: data.laporan.evaluasi_kinerja || '',
            evaluasi_prokers: data.laporan.evaluasi_prokers || {},
            kendala_lapangan: data.laporan.kendala_lapangan || '',
            solusi_lapangan: data.laporan.solusi_lapangan || '',
            kesimpulan: data.laporan.kesimpulan || data.laporan.kesimpulan_kelayakan || '',
            saran: data.laporan.saran || ''
          });
          if (data.laporan.status === 'disetujui') {
            setActiveTab('print');
          }
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isSubmit = false) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/dpl/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isSubmit })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(isSubmit ? 'Laporan berhasil disubmit!' : 'Draft laporan berhasil disimpan');
        setLaporan(data.laporan);
        if (isSubmit) setActiveTab('panduan');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = (type) => {
    let styleEl = document.getElementById('dynamic-print-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-print-style';
      document.head.appendChild(styleEl);
    }

    if (type === 'laporan') {
      styleEl.innerHTML = '@page { size: A4; margin: 3cm 3cm 3cm 4cm !important; }';
      document.body.classList.add('print-laporan');
      document.body.classList.remove('print-sertifikat');
    } else {
      styleEl.innerHTML = '@page { size: A4; margin: 0 !important; }';
      document.body.classList.add('print-sertifikat');
      document.body.classList.remove('print-laporan');
    }
    
    window.print();
    
    setTimeout(() => {
      document.body.classList.remove('print-laporan');
      document.body.classList.remove('print-sertifikat');
    }, 1000);
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    </DashboardLayout>
  );

  const isReadonly = laporan?.status === 'submitted' || laporan?.status === 'disetujui';
  const qrCodeUrl = laporan?.qr_code_validasi ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`http://localhost:3020/verify/${laporan.qr_code_validasi}`)}` : '';

  return (
    <DashboardLayout>
      {/* Global styles for print control */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-laporan .only-sertifikat { display: none !important; }
          .print-sertifikat .only-laporan { display: none !important; }
        }
      `}} />

      <div className="w-full space-y-6 print:space-y-0 print:m-0 print:p-0">
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-white/60 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Laporan Akhir DPL</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Evaluasi Pelaksanaan KKL Plus berbasis Form Digital</p>
            </div>
          </div>
          {laporan?.status && (
            <div className={`px-4 py-2 text-sm font-bold rounded-xl uppercase tracking-wide border ${
              laporan.status === 'disetujui' ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20' :
              laporan.status === 'submitted' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' :
              laporan.status === 'revisi' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' :
              'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
            }`}>
              Status: {laporan.status}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 flex items-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 backdrop-blur-md print:hidden">
            <AlertTriangle className="w-5 h-5 mr-3 shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 flex items-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 backdrop-blur-md print:hidden">
            <CheckCircle className="w-5 h-5 mr-3 shrink-0" />
            <p className="font-medium text-sm">{success}</p>
          </div>
        )}

        <div className="flex bg-white rounded-t-2xl border-b border-slate-200 p-2 gap-2 shadow-sm flex-wrap print:hidden">
          <button onClick={() => setActiveTab('panduan')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'panduan' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BookOpen className="w-4 h-4" /> Panduan Pengisian
          </button>
          <button onClick={() => setActiveTab('form')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'form' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-slate-50'}`}>
            <FileSignature className="w-4 h-4" /> Form Isi Laporan
          </button>
          {laporan?.status === 'disetujui' && (
            <button onClick={() => setActiveTab('print')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'print' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Printer className="w-4 h-4" /> Print Laporan & Sertifikat
            </button>
          )}
        </div>

        <div className="bg-white p-4 md:p-8 rounded-b-2xl shadow-sm border border-t-0 border-slate-100 min-h-[500px] print:p-0 print:border-none print:shadow-none print:bg-transparent">
          
          {activeTab === 'panduan' && (
            <div className="space-y-6 text-slate-700 print:hidden">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6" /> Panduan Penulisan Laporan DPL
                </h2>
                <div className="space-y-4 text-sm md:text-base">
                  <p>Laporan ini merupakan evaluasi pelaksanaan Kuliah Kerja Lapangan Plus (KKLP) yang disusun oleh Dosen Pembimbing Lapangan (DPL). Silakan lengkapi form pada tab <strong>Form Isi Laporan</strong> dengan panduan berikut:</p>
                  
                  <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-amber-900">Bab I. Pendahuluan</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Latar Belakang:</strong> Uraikan gambaran umum mengenai pentingnya KKLP dan peran DPL dalam mengarahkan mahasiswa di lokasi mitra.</li>
                      <li><strong>Tujuan Pembimbingan:</strong> Sebutkan tujuan spesifik dari proses bimbingan yang Anda lakukan terhadap kelompok mahasiswa (misal: adaptasi, penyusunan proker, dsb).</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-amber-900">Bab II. Pelaksanaan Pembimbingan dan Monitoring</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Data Mahasiswa Bimbingan:</strong> Otomatis diisi oleh sistem berdasarkan data pembagian kelompok (Pokja) Anda.</li>
                      <li><strong>Jadwal Pembekalan:</strong> Jelaskan kapan dan apa saja arahan yang diberikan pada tahap pembekalan awal.</li>
                      <li><strong>Jadwal Monitoring I & II:</strong> Jelaskan kapan kunjungan monitoring dilakukan dan hasil evaluasi sementara dari proker mahasiswa.</li>
                      <li><strong>Jadwal Penarikan:</strong> Deskripsikan proses penarikan mahasiswa dari lokasi mitra.</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-amber-900">Bab III. Hasil Capaian Program Kerja</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Evaluasi per Program Kerja:</strong> Daftar Program Kerja mahasiswa akan muncul secara otomatis. Anda diminta untuk memberikan evaluasi capaian pada masing-masing proker tersebut.</li>
                      <li><strong>Evaluasi Umum (Opsional):</strong> Berikan tambahan evaluasi umum mengenai kinerja, kedisiplinan, dan tanggung jawab mahasiswa jika diperlukan.</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-amber-900">Bab IV & V. Permasalahan, Solusi, Kesimpulan & Saran</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Kendala & Solusi:</strong> Uraikan masalah yang dihadapi di lapangan beserta solusi yang Anda berikan selaku DPL.</li>
                      <li><strong>Kesimpulan:</strong> Berikan kesimpulan akhir kelayakan dan pencapaian target.</li>
                      <li><strong>Saran:</strong> Tuliskan saran bagi institusi kampus maupun mitra kerja untuk evaluasi ke depan.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'form' && (
            <div className="flex flex-col xl:flex-row gap-6 print:hidden">
              <div className="flex-1 space-y-8">
                {/* BAB I */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2">I. PENDAHULUAN</h3>
                  <div>
                    <label className="font-bold block mb-1">A. Latar Belakang</label>
                    <textarea name="latar_belakang" value={formData.latar_belakang} onChange={handleChange} disabled={isReadonly} placeholder="Uraikan latar belakang..." className="w-full p-3 border rounded-xl h-32" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">B. Tujuan Pembimbingan</label>
                    <textarea name="tujuan_pembimbingan" value={formData.tujuan_pembimbingan} onChange={handleChange} disabled={isReadonly} placeholder="Uraikan tujuan pembimbingan..." className="w-full p-3 border rounded-xl h-32" />
                  </div>
                </div>

                {/* BAB II */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2">II. PELAKSANAAN PEMBIMBINGAN DAN MONITORING</h3>
                  <div className="p-4 bg-slate-50 border rounded-xl text-sm text-slate-600 mb-4">
                    <Info className="w-4 h-4 inline mr-2 text-teal-600" />
                    Data Mahasiswa Bimbingan akan otomatis dimasukkan pada dokumen laporan cetak.
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Tahap Pembekalan & Koordinasi Awal (Tanggal & Keterangan)</label>
                    <textarea name="jadwal_pembekalan" value={formData.jadwal_pembekalan} onChange={handleChange} disabled={isReadonly} placeholder="Contoh: 15 Juli 2026 - Memberikan arahan etika profesi..." className="w-full p-3 border rounded-xl h-24" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Tahap Monitoring I (Tanggal & Keterangan)</label>
                    <textarea name="jadwal_monitoring_1" value={formData.jadwal_monitoring_1} onChange={handleChange} disabled={isReadonly} placeholder="Contoh: 1 Agustus 2026 - Kunjungan ke instansi mitra..." className="w-full p-3 border rounded-xl h-24" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Tahap Monitoring II (Tanggal & Keterangan)</label>
                    <textarea name="jadwal_monitoring_2" value={formData.jadwal_monitoring_2} onChange={handleChange} disabled={isReadonly} placeholder="Contoh: 15 Agustus 2026 - Mengevaluasi progres..." className="w-full p-3 border rounded-xl h-24" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Tahap Penarikan Mahasiswa (Tanggal & Keterangan)</label>
                    <textarea name="jadwal_penarikan" value={formData.jadwal_penarikan} onChange={handleChange} disabled={isReadonly} placeholder="Contoh: 30 Agustus 2026 - Serah terima plakat..." className="w-full p-3 border rounded-xl h-24" />
                  </div>
                </div>

                {/* BAB III */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2">III. HASIL CAPAIAN PROGRAM KERJA MAHASISWA</h3>
                  
                  {pokjas.length === 0 || pokjas.every(p => !p.prokers || p.prokers.length === 0) ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                      Belum ada Program Kerja yang diajukan oleh kelompok bimbingan Anda.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pokjas.map(pokja => (
                        pokja.prokers && pokja.prokers.length > 0 && (
                          <div key={pokja._id} className="space-y-4">
                            <h4 className="font-bold text-lg text-teal-700 bg-teal-50 px-3 py-2 rounded-lg">{pokja.nama_pokja} - {pokja.mitra_id?.nama_instansi}</h4>
                            
                            {pokja.prokers.map(proker => (
                              <div key={proker._id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                  <div>
                                    <span className="font-bold text-slate-800">{proker.judul_proker}</span>
                                    <span className={`ml-3 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider inline-block align-middle ${
                                      proker.jenis_proker === 'core' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                      {proker.jenis_proker}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <label className="font-bold block mb-2 text-sm text-slate-700">Evaluasi Kinerja & Capaian:</label>
                                  <textarea 
                                    value={formData.evaluasi_prokers[proker._id] || ''} 
                                    onChange={(e) => setFormData(prev => ({
                                      ...prev,
                                      evaluasi_prokers: {
                                        ...prev.evaluasi_prokers,
                                        [proker._id]: e.target.value
                                      }
                                    }))}
                                    disabled={isReadonly} 
                                    placeholder="Tuliskan evaluasi kinerja dan capaian untuk proker ini..." 
                                    className="w-full p-3 border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <label className="font-bold block mb-1">Evaluasi Umum (Opsional)</label>
                    <textarea name="evaluasi_kinerja" value={formData.evaluasi_kinerja} onChange={handleChange} disabled={isReadonly} placeholder="Evaluasi umum kinerja kelompok mahasiswa..." className="w-full p-3 border rounded-xl h-24" />
                  </div>
                </div>

                {/* BAB IV */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2">IV. PERMASALAHAN DAN SOLUSI</h3>
                  <div>
                    <label className="font-bold block mb-1">Kendala di Lapangan</label>
                    <textarea name="kendala_lapangan" value={formData.kendala_lapangan} onChange={handleChange} disabled={isReadonly} placeholder="Kendala yang dialami..." className="w-full p-3 border rounded-xl h-24" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Solusi / Pemecahan Masalah</label>
                    <textarea name="solusi_lapangan" value={formData.solusi_lapangan} onChange={handleChange} disabled={isReadonly} placeholder="Solusi yang diberikan..." className="w-full p-3 border rounded-xl h-24" />
                  </div>
                </div>

                {/* BAB V */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b pb-2">V. KESIMPULAN DAN SARAN</h3>
                  <div>
                    <label className="font-bold block mb-1">A. Kesimpulan</label>
                    <textarea name="kesimpulan" value={formData.kesimpulan} onChange={handleChange} disabled={isReadonly} placeholder="Kesimpulan pelaksanaan KKLP..." className="w-full p-3 border rounded-xl h-24" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">B. Saran</label>
                    <textarea name="saran" value={formData.saran} onChange={handleChange} disabled={isReadonly} placeholder="Saran ke depan..." className="w-full p-3 border rounded-xl h-32" />
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                {!isReadonly && (
                  <div className="flex gap-4 pt-4 border-t border-slate-200">
                    <button onClick={() => handleSave(false)} className="flex-1 py-4 bg-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-300 transition-colors">
                      Simpan Draft
                    </button>
                    <button onClick={() => {
                        // Quick preview by switching tab and rendering Laporan part
                        setActiveTab('print');
                        setTimeout(() => handlePrint('laporan'), 500);
                        setTimeout(() => setActiveTab('form'), 1500);
                      }} 
                      className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Preview
                    </button>
                    <button onClick={() => handleSave(true)} className="flex-1 py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors">
                      Submit Laporan
                    </button>
                  </div>
                )}
              </div>
              
              {/* SIDEBAR INFORMASI POKJA */}
              <div className="xl:w-1/3">
                <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                  <div className="px-6 py-4 border-b border-slate-200 bg-white">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                      <Info className="w-5 h-5 text-teal-600" />
                      Data Bimbingan & Proker
                    </h3>
                  </div>
                  <div className="p-6 space-y-4 max-h-[700px] overflow-y-auto">
                    {pokjas.map((pokja, idx) => (
                      <div key={pokja._id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="mb-3">
                          <p className="font-bold text-teal-700">{pokja.nama_pokja || `Pokja ${idx + 1}`}</p>
                          <p className="text-xs text-slate-500">{pokja.mitra_id?.nama_instansi}</p>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-xs font-bold text-slate-700 border-b pb-1 mb-1">Anggota:</p>
                          <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                            {pokja.anggota?.map(a => (
                              <li key={a.user_id?._id}>{a.user_id?.nama_lengkap}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-700 border-b pb-1 mb-1">Proker Diajukan:</p>
                          {pokja.prokers?.length > 0 ? (
                             <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                               {pokja.prokers.map(pr => (
                                 <li key={pr._id}>{pr.judul_proker}</li>
                               ))}
                             </ul>
                          ) : (
                            <p className="text-xs text-slate-400 italic">Belum ada proker</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {pokjas.length === 0 && (
                      <div className="text-center p-6 border border-dashed border-slate-300 rounded-xl text-slate-400">
                        Belum ada data Pokja.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'print' && (
            <div className="space-y-10 print:space-y-0">
              <div className="flex gap-4 justify-center bg-slate-100 p-6 rounded-xl border border-slate-200 print:hidden">
                <button onClick={() => handlePrint('laporan')} className="flex items-center px-8 py-4 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md">
                  <FileText className="w-5 h-5 mr-2" />
                  Cetak Laporan PDF
                </button>
                <button onClick={() => handlePrint('sertifikat')} className="flex items-center px-8 py-4 font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-all shadow-md">
                  <Award className="w-5 h-5 mr-2" />
                  Cetak Sertifikat DPL
                </button>
              </div>
              
              {/* === LAYOUT PRINT LAPORAN === */}
              <div className="only-laporan overflow-x-auto pb-8 print:pb-0 print:overflow-visible flex justify-center">
                <div className="border border-slate-300 shadow-2xl bg-white print:border-none print:shadow-none print:max-w-none print:w-full" style={{ width: '210mm', minHeight: '297mm' }}>
                  <div className="pt-[3cm] pb-[3cm] pl-[4cm] pr-[3cm] print:p-0 text-black bg-white" style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: '1.5' }}>
                    
                    {/* COVER PAGE */}
                    <div className="text-center space-y-2 min-h-[23.7cm] flex flex-col justify-center print:min-h-0 print:h-[23.7cm] print:page-break-after-always pb-20">
                      <h2 className="text-2xl font-bold uppercase mb-2">LAPORAN DOSEN PEMBIMBING LAPANGAN (DPL)</h2>
                      <h2 className="text-2xl font-bold uppercase mb-16">KULIAH KERJA LAPANGAN PLUS (KKL PLUS)</h2>
                      
                      <div className="flex-1 flex items-center justify-center my-16">
                        <div className="w-48 h-48 flex items-center justify-center mx-auto">
                          <img src="/logo_stimi.png" alt="Logo STIMI YAPMI" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-xl font-bold">LOGO</span>'; }} />
                        </div>
                      </div>

                      <div className="mb-20 text-center">
                        <p className="mt-8 text-xl">Oleh:</p>
                        <p className="font-bold text-xl uppercase underline mt-2">{session?.user?.nama_lengkap}</p>
                        <p className="text-lg">NIDN: {session?.user?.nidn || session?.user?.nim_nidn || '...................'}</p>
                      </div>

                      <div className="mt-auto">
                        <h3 className="text-xl font-bold uppercase">PROGRAM STUDI MANAJEMEN SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA</h3>
                        <h3 className="text-xl font-bold uppercase">(STIMI) YAPMI MAKASSAR</h3>
                        <h3 className="text-xl font-bold uppercase">{new Date().getFullYear()}</h3>
                      </div>
                    </div>

                    {/* LEMBAR PENGESAHAN */}
                    <div className="min-h-[23.7cm] flex flex-col print:min-h-0 print:h-[23.7cm] print:page-break-after-always pt-10">
                      <h3 className="text-center font-bold text-xl mb-12 uppercase underline">LEMBAR PENGESAHAN LAPORAN DOSEN PEMBIMBING KKLP</h3>
                      
                      <p className="mb-8 leading-relaxed">
                        Di Instansi/Perusahaan: <span className="underline font-bold uppercase">{pokjas.length > 0 ? pokjas.map(p => p.mitra_id?.nama_instansi).filter(Boolean).join(', ') : '........................'}</span> di <span className="underline font-bold">{pokjas.length > 0 ? pokjas.map(p => {
                          const mitra = p.mitra_id;
                          if (!mitra) return null;
                          const alamat = [mitra.alamat_lengkap, mitra.desa_kelurahan, mitra.kecamatan, mitra.kabupaten_kota].filter(Boolean).join(', ');
                          return alamat || '........................';
                        }).filter(Boolean).join(' & ') : '........................'}</span>
                      </p>
                      
                      <p className="mb-4">Disetujui oleh:</p>
                      
                      <div className="flex justify-between mt-12 mb-16">
                        <div className="w-1/2 flex flex-col items-center text-center">
                          <p className="mb-24">Dosen Pembimbing Lapangan,</p>
                          <p className="font-bold underline">{session?.user?.nama_lengkap || '..................................................'}</p>
                          <p>NIDN: {session?.user?.nidn || session?.user?.nim_nidn || '...................'}</p>
                        </div>
                        <div className="w-1/2 flex flex-col items-center text-center relative">
                          <p className="mb-24">Ketua LPPM,</p>
                          <div className="absolute top-10 left-1/2 -translate-x-1/2">
                            {laporan?.status === 'disetujui' && qrCodeUrl ? (
                              <img src={qrCodeUrl} alt="QR Validasi" className="w-[70px] h-[70px] opacity-80" />
                            ) : null}
                          </div>
                          <p className="font-bold underline">Andi Arwinda Wildam, SE.,MM</p>
                          <p>NUPTK. 0153770671230313</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center text-center mt-8">
                        <p className="mb-24">Mengetahui, Ketua STIMI YAPMI</p>
                        <p className="font-bold underline">Dr. Ibrahim Syah, S.E.,M.M</p>
                        <p>NIDN : ......................</p>
                      </div>
                    </div>

                    {/* ISI LAPORAN */}
                    <div className="space-y-6 text-justify pt-10 break-words">
                      <h4 className="font-bold">I. PENDAHULUAN</h4>
                      <p><strong>A. Latar Belakang</strong></p>
                      <div className="whitespace-pre-wrap">{formData.latar_belakang || 'Belum diisi.'}</div>
                      
                      <p className="mt-4"><strong>B. Tujuan Pembimbingan</strong></p>
                      <div className="whitespace-pre-wrap">{formData.tujuan_pembimbingan || 'Belum diisi.'}</div>

                      <h4 className="font-bold mt-8">II. PELAKSANAAN PEMBIMBINGAN DAN MONITORING</h4>
                      <p><strong>A. Data Mahasiswa Bimbingan</strong><br/>Berikut adalah daftar mahasiswa yang berada di bawah bimbingan Dosen Pembimbing:</p>
                      {pokjas.map((p, pIdx) => {
                        const members = [];
                        if (p.ketua_id) members.push({ user: p.ketua_id, role: 'Ketua' });
                        if (p.anggota) {
                          p.anggota.forEach(a => {
                            if (a.user_id) members.push({ user: a.user_id, role: 'Anggota' });
                          });
                        }

                        return (
                          <div key={p._id} className="mb-6">
                            <p className="font-bold underline mb-2">{p.nama_pokja} - {p.mitra_id?.nama_instansi}</p>
                            <table className="w-full border-collapse border border-black">
                              <thead>
                                <tr className="bg-gray-100 text-sm">
                                  <th className="border border-black p-1 w-10">No</th>
                                  <th className="border border-black p-1">NIM</th>
                                  <th className="border border-black p-1">Nama Mahasiswa</th>
                                  <th className="border border-black p-1">Status Keanggotaan</th>
                                  <th className="border border-black p-1 w-1/3">PIC Proker</th>
                                </tr>
                              </thead>
                              <tbody>
                                {members.map((m, mIdx) => {
                                  const picProkers = p.prokers?.filter(pr => pr.pic_id?.some(id => id.toString() === m.user._id?.toString())).map(pr => pr.judul_proker).join(', ');
                                  return (
                                    <tr key={m.user._id} className="text-sm">
                                      <td className="border border-black p-1 text-center">{mIdx + 1}</td>
                                      <td className="border border-black p-1 text-center">{m.user.nim_nidn}</td>
                                      <td className="border border-black p-1">{m.user.nama_lengkap}</td>
                                      <td className="border border-black p-1 text-center">{m.role}</td>
                                      <td className="border border-black p-1 text-xs">{picProkers || '-'}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                      
                      <p><strong>B. Jadwal dan Realisasi Pembimbingan</strong></p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Tahap Pembekalan & Koordinasi Awal:</strong> <br/><span className="whitespace-pre-wrap">{formData.jadwal_pembekalan || '-'}</span></li>
                        <li><strong>Tahap Monitoring I:</strong> <br/><span className="whitespace-pre-wrap">{formData.jadwal_monitoring_1 || '-'}</span></li>
                        <li><strong>Tahap Monitoring II & Evaluasi Tengah Periode:</strong> <br/><span className="whitespace-pre-wrap">{formData.jadwal_monitoring_2 || '-'}</span></li>
                        <li><strong>Tahap Penarikan Mahasiswa:</strong> <br/><span className="whitespace-pre-wrap">{formData.jadwal_penarikan || '-'}</span></li>
                      </ul>

                      <h4 className="font-bold mt-8">III. HASIL CAPAIAN PROGRAM KERJA MAHASISWA</h4>
                      
                      {pokjas.map(pokja => (
                        pokja.prokers && pokja.prokers.length > 0 && (
                          <div key={`print-${pokja._id}`} className="mt-4">
                            <p className="font-bold underline mb-2">{pokja.nama_pokja} - {pokja.mitra_id?.nama_instansi}</p>
                            <table className="w-full border-collapse border border-black mb-4">
                              <thead>
                                <tr className="bg-gray-100 text-sm">
                                  <th className="border border-black p-2 w-10">No</th>
                                  <th className="border border-black p-2 w-1/3">Judul Proker</th>
                                  <th className="border border-black p-2 w-24">Jenis</th>
                                  <th className="border border-black p-2">Evaluasi Capaian</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pokja.prokers.map((proker, pIdx) => (
                                  <tr key={`print-proker-${proker._id}`} className="text-sm">
                                    <td className="border border-black p-2 text-center align-top">{pIdx + 1}</td>
                                    <td className="border border-black p-2 align-top font-semibold">{proker.judul_proker}</td>
                                    <td className="border border-black p-2 text-center align-top uppercase text-[10px]">{proker.jenis_proker}</td>
                                    <td className="border border-black p-2 align-top whitespace-pre-wrap">{formData.evaluasi_prokers?.[proker._id] || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      ))}

                      {formData.evaluasi_kinerja && (
                        <div className="mt-4">
                          <p><strong>Evaluasi Umum:</strong></p>
                          <div className="pl-4 whitespace-pre-wrap">{formData.evaluasi_kinerja}</div>
                        </div>
                      )}

                      <h4 className="font-bold mt-8">IV. PERMASALAHAN DAN SOLUSI</h4>
                      <p><strong>• Kendala:</strong></p>
                      <div className="pl-4 whitespace-pre-wrap">{formData.kendala_lapangan || '-'}</div>
                      <p className="mt-4"><strong>◦ Solusi:</strong></p>
                      <div className="pl-4 whitespace-pre-wrap">{formData.solusi_lapangan || '-'}</div>

                      <h4 className="font-bold mt-8">V. KESIMPULAN DAN SARAN</h4>
                      <p><strong>A. Kesimpulan</strong></p>
                      <div className="whitespace-pre-wrap">{formData.kesimpulan || '-'}</div>
                      <p className="mt-4"><strong>B. Saran</strong></p>
                      <div className="whitespace-pre-wrap">{formData.saran || '-'}</div>

                      <h4 className="font-bold mt-8">VI. LAMPIRAN</h4>
                      <p>(Dokumen pendukung yang wajib dilampirkan:)</p>
                      <ul className="list-disc pl-5">
                        <li>Daftar Hadir Monitoring Dosen Pembimbing (Tanda Tangan & Stempel Mitra).</li>
                        <li>Form Penilaian Mahasiswa oleh Dosen Pembimbing & Supervisor Mitra.</li>
                        <li>Dokumentasi Foto Kegiatan (Foto bersama pimpinan mitra, foto monitoring, dan foto mahasiswa saat bekerja).</li>
                      </ul>
                    </div>

                  </div>
                </div>
              </div>


              {/* === PEMISAH VISUAL DI LAYAR (Tidak ikut ter-print) === */}
              <div className="my-16 flex items-center justify-center print:hidden">
                <div className="border-t-2 border-dashed border-slate-300 w-1/3"></div>
                <span className="mx-4 text-slate-400 text-sm font-semibold tracking-widest uppercase">Batas Halaman</span>
                <div className="border-t-2 border-dashed border-slate-300 w-1/3"></div>
              </div>

              {/* === LAYOUT PRINT SERTIFIKAT === */}
              <div className="only-sertifikat flex flex-col items-center gap-8">
                {/* HALAMAN 1: SERTIFIKAT DPL */}
                <div className="w-[21cm] h-[29.7cm] bg-white relative overflow-hidden shadow-2xl print:shadow-none print:border-none flex flex-col print:h-[29.7cm] print:w-[21cm]" style={{ pageBreakAfter: 'always' }}>
                  
                  {/* Latar Belakang Image */}
                  <div className="absolute inset-0 z-0">
                    <img src="/template-sertifikat.png" alt="Background" className="w-full h-full object-cover" />
                  </div>

                  {/* Nomor Sertifikat */}
                  <div className="absolute top-11 right-16 text-right text-slate-500 font-bold tracking-widest text-sm z-20 uppercase">
                    Nomor: {laporan?._id ? laporan._id.substring(0, 10) : 'DPL-CERT'}
                  </div>

                  {/* Padding diset ke 2.54cm */}
                  <div className="flex-1 flex flex-col w-full h-full relative z-10 p-[2.54cm] text-center items-center">
                    
                    {/* Header & Logo */}
                    <div className="w-full flex flex-col items-center mt-2">
                      <div className="flex gap-6 justify-center items-center mb-3">
                        <img src="/logo_stimi.png" alt="Logo STIMI" className="h-20 object-contain" />
                        <img src="/mk_terang.png" alt="Logo KKL Plus" className="h-16 object-contain" />
                        <img src="/berdampak_logo.png" alt="Logo Berdampak" className="h-[72px] object-contain" />
                      </div>
                      <div className="flex flex-col items-center translate-y-[1.5cm]">
                        <h1 className="text-7xl text-[#6B21A8] mb-2 font-normal leading-none" style={{ fontFamily: "'Great Vibes', cursive" }}>
                          Sertifikat
                        </h1>
                        <h2 className="text-xl font-black tracking-[0.2em] text-slate-800 mb-1 font-serif uppercase">
                          KKL PLUS BERDAMPAK
                        </h2>
                        <p className="text-[#6B21A8] font-bold text-center text-base leading-tight tracking-widest">
                          STIMI YAPMI MAKASSAR
                        </p>
                      </div>
                    </div>

                    {/* Konten Utama */}
                    <div className="w-full flex flex-col items-center flex-1 justify-center gap-5 my-2">
                      
                      <div className="flex flex-col items-center text-center">
                        <p className="text-lg text-slate-600 mb-2 font-medium italic">Diberikan dengan bangga kepada:</p>
                        <h3 className="text-4xl md:text-5xl font-black text-[#7e22ce] mb-2 italic leading-tight px-4" style={{ fontFamily: 'Georgia, serif' }}>
                          {session?.user?.nama_lengkap}
                        </h3>
                        
                        <p className="text-base text-slate-700 font-bold tracking-widest uppercase">
                          NIDN: {session?.user?.nidn || session?.user?.nim_nidn || '-'}
                        </p>
                      </div>

                      <div className="flex flex-col items-center w-full">
                        <div className="flex items-center w-3/4 mx-auto mb-4">
                          <div className="h-[2px] bg-[#6B21A8] w-full relative">
                            <div className="absolute -top-1 -left-1 w-2 h-2 border-2 border-[#6B21A8] bg-white transform rotate-45"></div>
                            <div className="absolute -top-1 -right-1 w-2 h-2 border-2 border-[#6B21A8] bg-white transform rotate-45"></div>
                          </div>
                        </div>

                        <p className="text-base md:text-lg text-slate-700 max-w-[17cm] mx-auto leading-relaxed font-medium text-center px-4">
                          Atas partisipasi dan dedikasinya telah menyelesaikan tugas sebagai
                          <br />
                          <span className="font-bold text-[#6B21A8] block mt-2 text-xl md:text-2xl">DOSEN PEMBIMBING LAPANGAN (DPL)</span>
                          <br />
                          pada program Kuliah Kerja Lapangan Plus (KKLP) Berdampak Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI Makassar.
                        </p>
                      </div>
                    </div>

                    {/* Footer QR & Tanda Tangan */}
                    <div className="w-full flex justify-between items-end mt-auto pt-2 pb-2 px-8">
                        <div className="flex flex-col items-center">
                          {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 border-2 border-slate-200 p-1 bg-white rounded-lg shadow-sm mb-1" />}
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Verifikasi Laporan</p>
                        </div>

                        <div className="text-center w-64">
                          <div className="h-14 flex items-center justify-center">
                            <span className="text-4xl text-slate-800" style={{fontFamily: "'Great Vibes', cursive"}}>Ibrahim</span>
                          </div>
                          <h4 className="text-base font-bold text-[#6B21A8] mt-1 border-b-2 border-slate-300 inline-block px-4 pb-1">Dr. Ibrahim Syah, S.E.,M.M.</h4>
                          <p className="text-xs text-slate-600 font-medium mt-1">Ketua STIMI YAPMI Makassar</p>
                        </div>
                    </div>

                  </div>
                </div>

                {/* HALAMAN 2: DAFTAR KELOMPOK & PROKER */}
                <div className="w-[21cm] h-[29.7cm] bg-white relative overflow-hidden shadow-2xl print:shadow-none border border-slate-200 print:border-none flex flex-col print:h-[29.6cm]">
                  <div className="absolute inset-0 z-0">
                    <img src="/template-sertifikat.png" alt="Background" className="w-full h-full object-cover opacity-90" />
                  </div>

                  <div className="flex-1 flex flex-col p-[2.54cm] w-full h-full relative z-10">
                    
                    <div className="flex flex-col items-center border-b-2 border-slate-800 pb-2 mb-4 text-center">
                      <div className="flex gap-4 items-center mb-2">
                        <img src="/logo_stimi.png" alt="Logo STIMI" className="h-14" />
                        <img src="/mk_terang.png" alt="Logo KKL Plus" className="h-12" />
                        <img src="/berdampak_logo.png" alt="Logo Berdampak" className="h-[50px]" />
                      </div>
                      <h2 className="text-xl font-serif font-bold text-slate-900 uppercase tracking-widest leading-none mt-1">Daftar Kelompok Bimbingan & Program Kerja</h2>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2 leading-tight">Program Kuliah Kerja Lapangan Plus Berdampak</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI Makassar</p>
                    </div>

                    <div className="mb-4 bg-slate-50 p-2 px-3 rounded border border-slate-200">
                      <table className="text-left text-sm text-slate-800 w-full leading-snug">
                        <tbody>
                          <tr><td className="py-1 w-40 font-bold text-slate-500">Nama DPL</td><td className="font-bold">: {session?.user?.nama_lengkap}</td></tr>
                          <tr><td className="py-1 w-40 font-bold text-slate-500">NUPTK/NIDN</td><td className="font-bold">: {session?.user?.nim_nidn || '-'}</td></tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col gap-4 overflow-y-hidden">
                      {pokjas.map((pokja, idx) => (
                        <div key={pokja._id} className="border border-slate-300 rounded p-3 bg-white/80">
                          <h3 className="font-bold text-slate-800 text-sm bg-slate-100 p-1.5 rounded">{idx + 1}. {pokja.nama_pokja || `Kelompok ${idx+1}`} - {pokja.mitra_id?.nama_mitra}</h3>
                          
                          <div className="mt-2 text-xs text-slate-700">
                            <span className="font-bold border-b border-slate-300 inline-block mb-1">Daftar Anggota:</span>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              {pokja.anggota?.map(a => (
                                <span key={a.user_id?._id}>• {a.user_id?.nama_lengkap}</span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-slate-700">
                            <span className="font-bold border-b border-slate-300 inline-block mb-1">Program Kerja:</span>
                            {pokja.prokers?.length > 0 ? (
                               <ul className="list-disc pl-5">
                                 {pokja.prokers.map(pr => (
                                   <li key={pr._id}>{pr.judul_proker}</li>
                                 ))}
                               </ul>
                            ) : (
                              <p className="italic text-slate-400">Belum ada proker tercatat.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex-1"></div>

                    <div className="flex justify-between px-8 mt-4 mb-[0.5cm]">
                      <div className="flex flex-col justify-between items-center w-56 h-[3cm]">
                        <p className="text-xs text-slate-600">Ketua LPPM</p>
                        <div className="flex-1 flex items-center justify-center">
                          {qrCodeUrl && <img src={qrCodeUrl} alt="TTD QR" className="h-[1.8cm] w-[1.8cm] opacity-80 mix-blend-multiply" />}
                        </div>
                        <div className="w-full text-center">
                          <div className="border-b border-slate-800 w-full mb-1"></div>
                          <p className="font-bold text-slate-900 text-xs">Andi Arwinda Wildam, SE.,MM</p>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-center w-64 h-[3cm]">
                        <p className="text-xs text-slate-600">Ketua Program Studi</p>
                        <div className="flex-1 flex items-center justify-center">
                          {qrCodeUrl && <img src={qrCodeUrl} alt="TTD QR" className="h-[1.8cm] w-[1.8cm] opacity-80 mix-blend-multiply" />}
                        </div>
                        <div className="w-full text-center">
                          <div className="border-b border-slate-800 w-full mb-1"></div>
                          <p className="font-bold text-slate-900 text-xs">Ketua Program Studi</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
