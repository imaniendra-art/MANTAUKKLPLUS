"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Plus, X } from "lucide-react";

export default function DaftarProker() {
  const { data: session } = useSession();
  const [pokja, setPokja] = useState(null);
  const [prokers, setProkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    judul_proker: "",
    deskripsi: "",
    target_dampak: "",
    jenis_proker: "Utama",
    pic_id: "",
    tanggal_mulai: "",
    tanggal_selesai: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const resPokja = await fetch(`/api/pokja?mhsId=${session.user.id}`);
        const dataPokja = await resPokja.json();
        setPokja(dataPokja);

        if (dataPokja && !dataPokja.error) {
          const resProker = await fetch(`/api/proker?pokjaId=${dataPokja._id}`);
          const dataProker = await resProker.json();
          setProkers(Array.isArray(dataProker) ? dataProker : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user?.id) fetchInit();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pokja || !pokja._id) return;
    setSubmitting(true);
    try {
      let res;
      if (editingId) {
        res = await fetch('/api/proker', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            ...formData
          })
        });
      } else {
        res = await fetch('/api/proker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pokja_id: pokja._id,
            ...formData
          })
        });
      }
      
      if (res.ok) {
        setFormData({ 
          judul_proker: "", deskripsi: "", target_dampak: "", 
          jenis_proker: "Utama", pic_id: [], tanggal_mulai: "", tanggal_selesai: "" 
        });
        setEditingId(null);
        setIsModalOpen(false);
        const resProker = await fetch(`/api/proker?pokjaId=${pokja._id}`);
        const dataProker = await resProker.json();
        setProkers(Array.isArray(dataProker) ? dataProker : []);
      } else {
        const errorData = await res.json();
        alert(`Gagal menyimpan: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout title="Daftar Proker"><div className="p-10 text-center animate-pulse">Memuat...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Daftar Program Kerja POKJA">
      
      {!pokja || pokja.status_pokja === 'draft' || pokja.status_pokja === 'menunggu_persetujuan_admin' ? (
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-10 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm text-center">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🔒</div>
            <h2 className="text-2xl font-black mb-2 text-slate-800 dark:text-white">Akses Terkunci</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Pengisian Program Kerja (Proker) baru bisa dilakukan **setelah** POKJA Anda disetujui oleh Admin dan mendapatkan Dosen Pembimbing Lapangan (DPL).
            </p>
            <p className="text-sm font-bold text-slate-500 mt-6 bg-slate-100 dark:bg-slate-900/50 py-3 rounded-xl border border-slate-200 dark:border-slate-700 inline-block px-6">
              Status POKJA saat ini: <span className="text-amber-600 dark:text-amber-400 uppercase tracking-wider">{pokja?.status_pokja?.replace(/_/g, ' ')}</span>
            </p>
          </div>
        </div>
      ) : (
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-sm border border-white/60 dark:border-slate-700 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Daftar Proker</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pantau seluruh kegiatan program kerja POKJA Anda di sini.</p>
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ 
                judul_proker: "", deskripsi: "", target_dampak: "", 
                jenis_proker: "Utama", pic_id: [], tanggal_mulai: "", tanggal_selesai: "" 
              });
              setIsModalOpen(true);
            }}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Tambah Proker Baru
          </button>
        </div>

        {prokers.length === 0 ? (
          <div className="text-center p-12 text-slate-500 bg-white/20 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="text-4xl mb-4">📂</div>
            <p className="font-bold text-lg">Belum ada program kerja</p>
            <p className="text-sm">Klik tombol &quot;Tambah Proker Baru&quot; untuk mulai merancang kegiatan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {prokers.map((p, idx) => (
              <div key={p._id} className="p-6 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white/80 dark:border-slate-600 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 flex items-center justify-center font-black text-lg shrink-0">{idx + 1}</span>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{p.judul_proker}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${p.jenis_proker === 'Utama' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {p.jenis_proker}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">PIC: <span className="font-bold">{ (Array.isArray(p.pic_id) ? p.pic_id.map(pic => pic.nama_lengkap).join(', ') : p.pic_id?.nama_lengkap) || '-' }</span></span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-14 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg w-fit border border-slate-100 dark:border-slate-800">
                    <div><span className="font-bold">Mulai:</span> {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')}</div>
                    <div><span className="font-bold">Selesai:</span> {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}</div>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed flex-1">{p.deskripsi}</p>
                  
                  <div className="bg-teal-50 dark:bg-teal-900/10 p-3 rounded-xl border border-teal-100 dark:border-teal-800/30 mb-4">
                    <p className="text-[11px] font-bold text-teal-800 dark:text-teal-500 mb-1 uppercase tracking-wider">Target Capaian</p>
                    <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">{p.target_dampak}</p>
                  </div>

                  {p.status === 'revisi' && p.catatan_revisi && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200 dark:border-amber-800/30 mb-4">
                      <p className="text-[11px] font-bold text-amber-800 dark:text-amber-500 mb-1 uppercase tracking-wider">Catatan Revisi DPL</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">{p.catatan_revisi}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold border uppercase tracking-wider ${
                        p.status === 'disetujui_dpl' ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:border-teal-800' :
                        p.status === 'revisi' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' :
                        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800'
                      }`}>
                        {p.status === 'disetujui_dpl' ? 'Disetujui DPL' : p.status === 'revisi' ? 'Revisi DPL' : 'Menunggu DPL'}
                      </span>
                      
                      <select 
                        value={p.status_pelaksanaan || 'Belum Dimulai'}
                        disabled={p.status !== 'disetujui_dpl'}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          await fetch('/api/proker', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: p._id, status_pelaksanaan: newStatus })
                          });
                          const resProker = await fetch(`/api/proker?pokjaId=${pokja._id}`);
                          const dataProker = await resProker.json();
                          setProkers(Array.isArray(dataProker) ? dataProker : []);
                        }}
                        className={`text-xs rounded-lg border px-3 py-1.5 font-bold focus:ring-2 focus:outline-none ${
                          p.status !== 'disetujui_dpl' ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-500' :
                          (p.status_pelaksanaan === 'Selesai' ? 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-400' : 
                          p.status_pelaksanaan === 'Sedang Berjalan' ? 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-400' : 
                          'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300')
                        }`}
                      >
                        <option value="Belum Dimulai">Belum Dimulai</option>
                        <option value="Sedang Berjalan">Sedang Berjalan</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>

                    {p.status !== 'disetujui_dpl' && (p.status_pelaksanaan === 'Belum Dimulai' || !p.status_pelaksanaan) && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingId(p._id);
                            setFormData({
                              judul_proker: p.judul_proker,
                              deskripsi: p.deskripsi,
                              target_dampak: p.target_dampak,
                              jenis_proker: p.jenis_proker || 'Utama',
                              pic_id: Array.isArray(p.pic_id) ? p.pic_id.map(pic => pic._id) : (p.pic_id?._id ? [p.pic_id._id] : []),
                              tanggal_mulai: p.tanggal_mulai ? p.tanggal_mulai.substring(0, 10) : '',
                              tanggal_selesai: p.tanggal_selesai ? p.tanggal_selesai.substring(0, 10) : ''
                            });
                            setIsModalOpen(true);
                          }}
                          className="px-4 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={async () => {
                            if(confirm('Yakin ingin menghapus proker ini?')) {
                              const res = await fetch(`/api/proker?id=${p._id}`, { method: 'DELETE' });
                              if (res.ok) {
                                const resProker = await fetch(`/api/proker?pokjaId=${pokja._id}`);
                                const dataProker = await resProker.json();
                                setProkers(Array.isArray(dataProker) ? dataProker : []);
                              }
                            }
                          }}
                          className="px-4 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* MODAL FORM PROKER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white pr-10">
              {editingId ? 'Edit Program Kerja' : 'Buat Program Kerja Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Jenis Program Kerja</label>
                  <select 
                    required
                    value={formData.jenis_proker}
                    onChange={(e) => setFormData({...formData, jenis_proker: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option value="Utama">Utama (Core Project)</option>
                    <option value="Pendukung">Pendukung (Opsional)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Penanggung Jawab (PIC)</label>
                  {formData.jenis_proker === 'Utama' ? (
                    <select 
                      required
                      value={formData.pic_id[0] || ''}
                      onChange={(e) => setFormData({...formData, pic_id: [e.target.value]})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    >
                      <option value="" disabled>Pilih PIC (Maks. 1 orang)</option>
                      {pokja?.ketua_id && <option value={pokja.ketua_id._id}>{pokja.ketua_id.nama_lengkap} (Ketua)</option>}
                      {pokja?.anggota?.map(a => (
                        a.status_undangan === 'bergabung' && (
                          <option key={a.user_id._id} value={a.user_id._id}>{a.user_id.nama_lengkap} (Anggota)</option>
                        )
                      ))}
                    </select>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                      <p className="text-xs text-slate-500 mb-2 font-medium">Pilih PIC (Maks. 2 orang)</p>
                      {pokja?.ketua_id && (
                        <label className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.pic_id.includes(pokja.ketua_id._id)}
                            disabled={!formData.pic_id.includes(pokja.ketua_id._id) && formData.pic_id.length >= 2}
                            onChange={(e) => {
                              if (e.target.checked) setFormData({...formData, pic_id: [...formData.pic_id, pokja.ketua_id._id]});
                              else setFormData({...formData, pic_id: formData.pic_id.filter(id => id !== pokja.ketua_id._id)});
                            }}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 dark:bg-slate-900 border-slate-300 dark:border-slate-600" 
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pokja.ketua_id.nama_lengkap} (Ketua)</span>
                        </label>
                      )}
                      {pokja?.anggota?.map(a => (
                        a.status_undangan === 'bergabung' && (
                          <label key={a.user_id._id} className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.pic_id.includes(a.user_id._id)}
                              disabled={!formData.pic_id.includes(a.user_id._id) && formData.pic_id.length >= 2}
                              onChange={(e) => {
                                if (e.target.checked) setFormData({...formData, pic_id: [...formData.pic_id, a.user_id._id]});
                                else setFormData({...formData, pic_id: formData.pic_id.filter(id => id !== a.user_id._id)});
                              }}
                              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 dark:bg-slate-900 border-slate-300 dark:border-slate-600" 
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{a.user_id.nama_lengkap} (Anggota)</span>
                          </label>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama Program Kerja</label>
                <input 
                  required
                  type="text" 
                  value={formData.judul_proker}
                  onChange={(e) => setFormData({...formData, judul_proker: e.target.value})}
                  placeholder="Misal: Revitalisasi Tata Kelola BUMDes"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tanggal Mulai</label>
                  <input 
                    required
                    type="date" 
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({...formData, tanggal_mulai: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Selesai</label>
                  <input 
                    required
                    type="date" 
                    value={formData.tanggal_selesai}
                    onChange={(e) => setFormData({...formData, tanggal_selesai: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Deskripsi Kegiatan</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Capaian / Dampak</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.target_dampak}
                  onChange={(e) => setFormData({...formData, target_dampak: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl disabled:opacity-50 transition-colors shadow-md"
                >
                  {submitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambahkan Proker')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
