'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function DplPenilaianPage() {
  const params = useParams();
  const router = useRouter();
  const [penilaians, setPenilaians] = useState([]);
  const [prokers, setProkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Group Details (per-proker)
  const [detailKelompokDPL, setDetailKelompokDPL] = useState({});

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/penilaian?pokjaId=${params.pokjaId}`);
      const data = await res.json();
      if (data.success) {
        setPenilaians(data.penilaians.map(p => ({
          ...p,
          detail_dpl_individu: p.detail_dpl_individu || { laporan: 0, logbook: 0, etika: 0 }
        })));
        
        setProkers(data.prokers || []);

        if (data.penilaians.length > 0 && data.penilaians[0].detail_dpl_kelompok) {
          const dk = data.penilaians[0].detail_dpl_kelompok;
          // If it's the old format (proker, target) or empty, we keep it as empty object
          // If it's the new format (keyed by prokerId), we load it
          if (dk && !dk.proker && !dk.target) {
            setDetailKelompokDPL(dk);
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data penilaian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.pokjaId]);

  const copyMentorLink = () => {
    const link = `${window.location.origin}/penilaian-mentor/${params.pokjaId}`;
    navigator.clipboard.writeText(link);
    alert('Link form penilaian Mentor berhasil disalin! Silakan kirimkan link tersebut ke Mentor via WhatsApp.');
  };

  const handleIndividuDetailChange = (id, field, value) => {
    setPenilaians(prev => prev.map(p => {
      if (p._id === id) {
        return { 
          ...p, 
          detail_dpl_individu: {
            ...p.detail_dpl_individu,
            [field]: Number(value)
          }
        };
      }
      return p;
    }));
  };

  const handleProkerDetailChange = (prokerId, field, value) => {
    setDetailKelompokDPL(prev => ({
      ...prev,
      [prokerId]: {
        ...(prev[prokerId] || { ketercapaian: 0, kesesuaian: 0, manfaat: 0 }),
        [field]: Number(value)
      }
    }));
  };

  const calculateProkerAvg = (prokerId) => {
    const data = detailKelompokDPL[prokerId];
    if (!data) return 0;
    return (Number(data.ketercapaian || 0) + Number(data.kesesuaian || 0) + Number(data.manfaat || 0)) / 3 || 0;
  };

  const calculateKelompok = () => {
    if (prokers.length === 0) return 0;
    let total = 0;
    prokers.forEach(proker => {
      total += calculateProkerAvg(proker._id);
    });
    return total / prokers.length;
  };

  const calculateIndividu = (detail) => {
    if (!detail) return 0;
    return (Number(detail.laporan || 0) + Number(detail.logbook || 0) + Number(detail.etika || 0)) / 3 || 0;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const nilai_kelompok = calculateKelompok();

      const updates = penilaians.map(p => ({
        _id: p._id,
        nilai_kelompok: nilai_kelompok,
        detail_kelompok: detailKelompokDPL,
        nilai_individu: calculateIndividu(p.detail_dpl_individu),
        detail_individu: p.detail_dpl_individu,
        catatan: p.catatan_dpl,
      }));

      const res = await fetch('/api/penilaian', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'dpl',
          updates
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Penilaian berhasil disimpan!');
        fetchData(); // reload
      } else {
        alert(data.error || 'Gagal menyimpan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout title="Penilaian KKL Plus (DPL)">
      <div className="p-8 text-center text-slate-500 font-bold">Memuat data...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Penilaian KKL Plus (DPL)">
      <div className="space-y-6 pb-28 mt-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Penilaian KKL Plus (DPL)</h1>
            <p className="text-slate-500">Berikan penilaian untuk capaian kelompok dan capaian individu mahasiswa (Skala 0-100).</p>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm flex flex-col gap-2">
          <p className="text-sm text-amber-800">
            <strong>Bantuan untuk Mentor:</strong> Nilai Mentor (Bobot 20%) diisi secara terpisah. Anda dapat membantu Mentor dengan mengirimkan link form penilaian mereka:
          </p>
          <button 
            onClick={copyMentorLink}
            className="flex items-center justify-center gap-2 bg-white border border-amber-300 text-amber-700 px-4 py-2 rounded-lg font-bold hover:bg-amber-100 transition shadow-sm text-sm"
          >
            <Copy className="w-4 h-4" />
            Copy Link Mentor
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Nilai Kelompok (Per-Proker)</h2>
          <div className="mt-4 bg-teal-50 border border-teal-100 p-4 rounded-xl">
            <p className="text-sm font-bold text-teal-900 mb-2">Indikator Penilaian Proker:</p>
            <ul className="list-disc list-inside text-sm text-teal-800 space-y-1 mb-2">
              <li>Tingkat Ketercapaian & Keberhasilan (Sesuai target yang ditetapkan)</li>
              <li>Kesesuaian dengan Bidang Ilmu (Relevansi akademik)</li>
              <li>Manfaat / Dampak Proker bagi instansi atau masyarakat</li>
            </ul>
            <p className="text-xs text-teal-700 italic">* Nilai akhir kelompok adalah rata-rata dari seluruh Proker (Bobot 50%).</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {prokers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Belum ada program kerja yang diajukan oleh kelompok ini.
            </div>
          ) : (
            prokers.map((proker, index) => {
              const avgProker = calculateProkerAvg(proker._id);
              const data = detailKelompokDPL[proker._id] || {};

              return (
                <div key={proker._id} className="p-6 flex flex-col gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="inline-block px-2 py-1 bg-teal-100 text-teal-700 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
                      Proker {index + 1}
                    </span>
                    <h3 className="font-bold text-slate-800">{proker.judul_proker}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{proker.deskripsi}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">1. Ketercapaian / Keberhasilan</label>
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={data.ketercapaian || ''}
                        onChange={(e) => handleProkerDetailChange(proker._id, 'ketercapaian', e.target.value)}
                        className="w-full px-4 py-2.5 border-slate-300 rounded-lg shadow-sm focus:border-fuchsia-500 focus:ring-fuchsia-500"
                        placeholder="0-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">2. Kesesuaian Bidang Ilmu</label>
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={data.kesesuaian || ''}
                        onChange={(e) => handleProkerDetailChange(proker._id, 'kesesuaian', e.target.value)}
                        className="w-full px-4 py-2.5 border-slate-300 rounded-lg shadow-sm focus:border-fuchsia-500 focus:ring-fuchsia-500"
                        placeholder="0-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">3. Manfaat & Dampak</label>
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={data.manfaat || ''}
                        onChange={(e) => handleProkerDetailChange(proker._id, 'manfaat', e.target.value)}
                        className="w-full px-4 py-2.5 border-slate-300 rounded-lg shadow-sm focus:border-fuchsia-500 focus:ring-fuchsia-500"
                        placeholder="0-100"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-2 bg-white px-4 py-3 rounded-lg border border-slate-200 w-max self-end shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">Rata-rata Proker {index + 1}:</span>
                    <span className="text-lg font-bold text-teal-600">{avgProker.toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {prokers.length > 0 && (
          <div className="p-6 bg-teal-50 border-t border-teal-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-teal-700 font-bold uppercase tracking-wider">Total Nilai Kelompok</p>
              <p className="text-[10px] text-teal-600">Rata-rata dari {prokers.length} Proker</p>
            </div>
            <span className="text-2xl font-black text-teal-900">{calculateKelompok().toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Nilai Individu Mahasiswa</h2>
          <div className="mt-4 bg-teal-50 border border-teal-100 p-4 rounded-xl">
            <p className="text-sm font-bold text-teal-900 mb-2">Indikator Penilaian Individu:</p>
            <ul className="list-disc list-inside text-sm text-teal-800 space-y-1 mb-2">
              <li>Kualitas penyusunan Laporan Akhir KKL Plus (Relevansi dan Tata Tulis)</li>
              <li>Kedisiplinan pengisian Logbook Harian secara konsisten</li>
              <li>Sikap, komunikasi, dan etika mahasiswa selama proses bimbingan</li>
            </ul>
            <p className="text-xs text-teal-700 italic">* Rata-rata dari ke-3 indikator ini akan menjadi Nilai Individu per mahasiswa.</p>
          </div>

          <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <p className="text-sm font-bold text-slate-800 mb-3">Skala Penilaian (Konversi Huruf):</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong className="text-teal-700">A:</strong> 90-100</span>
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong className="text-teal-700">A-:</strong> 80-89.9</span>
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong className="text-teal-700">B+:</strong> 75-79.9</span>
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong className="text-teal-700">B:</strong> 70-74.9</span>
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong className="text-amber-600">B-:</strong> 66-69.9</span>
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong className="text-amber-600">C+:</strong> 61-65.9</span>
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong className="text-amber-600">C:</strong> 56-60.9</span>
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong className="text-rose-600">D:</strong> 46-55.9</span>
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong className="text-rose-600">E:</strong> &lt; 46</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Mahasiswa</th>
                <th className="px-6 py-4">Nilai Laporan Akhir (0-100)</th>
                <th className="px-6 py-4">Kedisiplinan Logbook (0-100)</th>
                <th className="px-6 py-4">Etika Bimbingan (0-100)</th>
                <th className="px-6 py-4">Rata-Rata Individu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {penilaians.map((item) => {
                const avgIndividu = calculateIndividu(item.detail_dpl_individu);
                return (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <p className="font-bold text-slate-800">{item.mahasiswa_id?.nama_lengkap}</p>
                    <p className="text-xs text-slate-500 mb-2">{item.mahasiswa_id?.nim}</p>
                    {item.mentor_sudah_menilai ? (
                      <span className="inline-flex items-center gap-1 text-teal-600 bg-teal-50 px-2 py-1 rounded-md text-xs font-bold border border-teal-200">
                        <CheckCircle2 className="w-3 h-3" /> Mentor Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-bold border border-amber-200">
                        <AlertCircle className="w-3 h-3" /> Mentor Belum
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={item.detail_dpl_individu?.laporan || ''}
                      onChange={(e) => handleIndividuDetailChange(item._id, 'laporan', e.target.value)}
                      className="w-24 px-3 py-2 border-slate-300 rounded-lg shadow-sm focus:border-fuchsia-500 focus:ring-fuchsia-500"
                    />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={item.detail_dpl_individu?.logbook || ''}
                      onChange={(e) => handleIndividuDetailChange(item._id, 'logbook', e.target.value)}
                      className="w-24 px-3 py-2 border-slate-300 rounded-lg shadow-sm focus:border-fuchsia-500 focus:ring-fuchsia-500"
                    />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={item.detail_dpl_individu?.etika || ''}
                      onChange={(e) => handleIndividuDetailChange(item._id, 'etika', e.target.value)}
                      className="w-24 px-3 py-2 border-slate-300 rounded-lg shadow-sm focus:border-fuchsia-500 focus:ring-fuchsia-500"
                    />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-bold text-fuchsia-600 text-lg">{avgIndividu.toFixed(2)}</span>
                      {item.nilai_akhir_angka > 0 && (
                        <div className="mt-2 text-xs p-2 bg-slate-100 rounded-lg border border-slate-200">
                          <p className="font-bold text-slate-700">Hasil Akhir (Sistem):</p>
                          <p className="text-sm font-bold text-slate-800">{item.nilai_akhir_huruf} ({item.nilai_akhir_angka.toFixed(2)})</p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Penilaian DPL'}
          </button>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
