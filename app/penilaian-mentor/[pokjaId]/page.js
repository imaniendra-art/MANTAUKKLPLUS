'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, CheckCircle2 } from 'lucide-react';

export default function MentorPenilaianPage() {
  const params = useParams();
  const [penilaians, setPenilaians] = useState([]);
  const [prokers, setProkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Group Details
  const [detailKelompokMentor, setDetailKelompokMentor] = useState({
    keberhasilan: 0,
    manfaat: 0,
    kerjasama: 0
  });

  useEffect(() => {
    fetchData();
  }, [params.pokjaId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/penilaian?pokjaId=${params.pokjaId}`);
      const data = await res.json();
      if (data.success) {
        setPenilaians(data.penilaians.map(p => ({
          ...p,
          detail_mentor_individu: p.detail_mentor_individu || { kedisiplinan: 0, tanggungjawab: 0, keterampilan: 0 }
        })));
        
        setProkers(data.prokers || []);
        
        if (data.penilaians.length > 0) {
          if (data.penilaians[0].detail_mentor_kelompok) {
            const dk = data.penilaians[0].detail_mentor_kelompok;
            if (dk.keberhasilan !== undefined) {
              setDetailKelompokMentor({
                keberhasilan: dk.keberhasilan || 0,
                manfaat: dk.manfaat || 0,
                kerjasama: dk.kerjasama || 0
              });
            }
          }
          if (data.penilaians[0].mentor_sudah_menilai) {
            setSubmitted(true);
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

  const handleIndividuDetailChange = (id, field, value) => {
    setPenilaians(prev => prev.map(p => {
      if (p._id === id) {
        return { 
          ...p, 
          detail_mentor_individu: {
            ...p.detail_mentor_individu,
            [field]: Number(value)
          }
        };
      }
      return p;
    }));
  };

  const calculateKelompok = () => {
    if (!detailKelompokMentor) return 0;
    return (Number(detailKelompokMentor.keberhasilan || 0) + Number(detailKelompokMentor.manfaat || 0) + Number(detailKelompokMentor.kerjasama || 0)) / 3 || 0;
  };

  const calculateIndividu = (detail) => {
    if (!detail) return 0;
    return (Number(detail.kedisiplinan || 0) + Number(detail.tanggungjawab || 0) + Number(detail.keterampilan || 0)) / 3 || 0;
  };

  const handleSubmit = async () => {
    if (!confirm('Apakah Anda yakin ingin mengirim penilaian ini? Nilai tidak dapat diubah setelah dikirim.')) return;
    
    setSaving(true);
    try {
      const nilai_kelompok = calculateKelompok();

      const updates = penilaians.map(p => ({
        _id: p._id,
        nilai_kelompok: nilai_kelompok,
        detail_kelompok: detailKelompokMentor,
        nilai_individu: calculateIndividu(p.detail_mentor_individu),
        detail_individu: p.detail_mentor_individu,
        catatan: p.catatan_mentor,
      }));

      const res = await fetch('/api/penilaian', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'mentor',
          updates
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-slate-100">
          <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Penilaian Diterima</h2>
          <p className="text-slate-600 mb-6">Terima kasih, penilaian Anda telah berhasil disimpan dan diteruskan ke Dosen Pembimbing Lapangan (DPL).</p>
          <button onClick={() => window.close()} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold">
            Tutup Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-white font-black text-lg">
              K
            </div>
            <span className="font-bold text-slate-800 tracking-tight">KKL<span className="text-[#D4AF37]">Plus</span></span>
          </div>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
            Form Mentor Lapangan
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <h2 className="text-base font-bold text-slate-800 mb-2">1. Nilai Kelompok (Proker)</h2>
          
          <div className="mb-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <p className="text-xs font-bold text-slate-700 mb-2">Daftar Program Kerja Kelompok (sebagai referensi):</p>
            {prokers.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Belum ada program kerja yang tercatat.</p>
            ) : (
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                {prokers.map(p => (
                  <li key={p._id}><span className="font-bold">{p.judul_proker}</span> - {p.deskripsi.substring(0, 50)}...</li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4 bg-teal-50 border border-teal-100 p-4 rounded-xl">
            <p className="text-xs font-bold text-teal-900 mb-2">Indikator Penilaian Kelompok:</p>
            <ul className="list-disc list-inside text-xs text-teal-800 space-y-1 mb-2">
              <li>Keberhasilan dan kualitas pelaksanaan Program Kerja (Proker) di instansi Anda</li>
              <li>Besar manfaat yang diberikan dari program kerja tersebut kepada instansi</li>
              <li>Kerjasama tim secara keseluruhan</li>
            </ul>
            <p className="text-[10px] text-teal-700 italic">* Nilai kelompok berlaku merata untuk seluruh anggota.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">A. Keberhasilan Pelaksanaan Proker (0-100)</label>
              <input 
                type="number" 
                min="0" max="100"
                placeholder="0-100"
                value={detailKelompokMentor.keberhasilan || ''}
                onChange={(e) => setDetailKelompokMentor(prev => ({...prev, keberhasilan: e.target.value}))}
                className="w-full sm:max-w-xs border-slate-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">B. Manfaat bagi Instansi (0-100)</label>
              <input 
                type="number" 
                min="0" max="100"
                placeholder="0-100"
                value={detailKelompokMentor.manfaat || ''}
                onChange={(e) => setDetailKelompokMentor(prev => ({...prev, manfaat: e.target.value}))}
                className="w-full sm:max-w-xs border-slate-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">C. Kerjasama Tim Lapangan (0-100)</label>
              <input 
                type="number" 
                min="0" max="100"
                placeholder="0-100"
                value={detailKelompokMentor.kerjasama || ''}
                onChange={(e) => setDetailKelompokMentor(prev => ({...prev, kerjasama: e.target.value}))}
                className="w-full sm:max-w-xs border-slate-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2"
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
            <span className="text-sm font-bold text-slate-600">Rata-rata Nilai Kelompok:</span>
            <span className="text-lg font-bold text-teal-600">{calculateKelompok().toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800 mb-2">2. Nilai Individu Mahasiswa</h2>
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl">
              <p className="text-xs font-bold text-teal-900 mb-2">Indikator Penilaian Individu:</p>
              <ul className="list-disc list-inside text-xs text-teal-800 space-y-1 mb-2">
                <li>Kedisiplinan dan Etika (Soft Skill) selama di instansi</li>
                <li>Tanggung Jawab dan Inisiatif Kerja</li>
                <li>Keterampilan Teknis dan Kualitas Kerja individu</li>
              </ul>
              <p className="text-[10px] text-teal-700 italic">* Rata-rata dari indikator ini akan menjadi nilai individu masing-masing mahasiswa.</p>
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
          <div className="divide-y divide-slate-100">
            {penilaians.map((item) => {
              const avgIndividu = calculateIndividu(item.detail_mentor_individu);
              return (
              <div key={item._id} className="p-5 flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-2">
                  <p className="font-bold text-slate-800 text-sm">{item.mahasiswa_id?.nama_lengkap}</p>
                  <p className="text-xs text-slate-500">{item.mahasiswa_id?.nim}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">A. Kedisiplinan & Etika</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      placeholder="0-100"
                      value={item.detail_mentor_individu?.kedisiplinan || ''}
                      onChange={(e) => handleIndividuDetailChange(item._id, 'kedisiplinan', e.target.value)}
                      className="w-full px-4 py-2.5 border-slate-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">B. Tanggung Jawab & Inisiatif</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      placeholder="0-100"
                      value={item.detail_mentor_individu?.tanggungjawab || ''}
                      onChange={(e) => handleIndividuDetailChange(item._id, 'tanggungjawab', e.target.value)}
                      className="w-full px-4 py-2.5 border-slate-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">C. Keterampilan Teknis (Kerja)</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      placeholder="0-100"
                      value={item.detail_mentor_individu?.keterampilan || ''}
                      onChange={(e) => handleIndividuDetailChange(item._id, 'keterampilan', e.target.value)}
                      className="w-full px-4 py-2.5 border-slate-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 font-bold text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase">Rata-rata:</span>
                  <span className="text-sm font-bold text-teal-600">{avgIndividu.toFixed(2)}</span>
                </div>
              </div>
            )})}
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md shadow-teal-500/20 text-lg"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Mengirim Data...' : 'Kirim Penilaian'}
        </button>
        <p className="text-center text-xs text-slate-400 mt-4 px-4">
          Pastikan nilai yang diinput sudah benar sebelum menekan tombol Kirim.
        </p>
      </div>
    </div>
  );
}
