"use client";

import { useState, useEffect } from 'react';
import { useSession } from "@/components/AuthProvider";
import DashboardLayout from '@/components/DashboardLayout';
import { Settings as SettingsIcon, User, Save, CheckCircle, AlertTriangle, FileSignature } from 'lucide-react';

export default function AdminSettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [systemSettings, setSystemSettings] = useState({
    periode_aktif: 'Ganjil 2026/2027',
    daftar_periode: ['Ganjil 2026/2027'],
    pendaftaran_buka: true,
    pengisian_logbook_buka: true,
    pengumpulan_laporan_buka: true,
  });

  const [newPeriode, setNewPeriode] = useState('');

  const [profileData, setProfileData] = useState({
    nama_lengkap: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSystemSettings({
          periode_aktif: data.periode_aktif || 'Ganjil 2026/2027',
          daftar_periode: data.daftar_periode || ['Ganjil 2026/2027'],
          pendaftaran_buka: data.pendaftaran_buka ?? true,
          pengisian_logbook_buka: data.pengisian_logbook_buka ?? true,
          pengumpulan_laporan_buka: data.pengumpulan_laporan_buka ?? true,
          kaprodi_nama: data.kaprodi_nama || 'Dr. Jhon Doe, SE., M.Si',
          kaprodi_nip: data.kaprodi_nip || '198001012005011001',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        nama_lengkap: session.user.nama_lengkap || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleSaveSystem = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemSettings)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menyimpan pengaturan.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    if (profileData.password && profileData.password !== profileData.confirm_password) {
      setMessage({ type: 'error', text: 'Password dan Konfirmasi Password tidak cocok!' });
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        nama_lengkap: profileData.nama_lengkap,
        email: profileData.email,
        password: profileData.password
      };
      
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        if (profileData.nama_lengkap !== session.user.nama_lengkap || profileData.email !== session.user.email) {
          // If name or email changed, try updating the session
          update({ nama_lengkap: profileData.nama_lengkap, email: profileData.email });
        }
        setProfileData(prev => ({ ...prev, password: '', confirm_password: '' }));
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal memperbarui profil.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <DashboardLayout title="Pengaturan Sistem"><div className="p-8">Memuat pengaturan...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Pengaturan Sistem">
      <div className="w-full space-y-6">
        
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="flex space-x-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-1.5 rounded-xl w-max mb-6 border border-white/60 dark:border-slate-700">
          <button 
            onClick={() => { setActiveTab('system'); setMessage(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'system' 
                ? 'bg-teal-600 text-amber-300 shadow-sm' 
                : 'text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400'
            }`}
          >
            <SettingsIcon className="w-4 h-4" /> Pengaturan Aplikasi
          </button>
          <button 
            onClick={() => { setActiveTab('arsip'); setMessage(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'arsip' 
                ? 'bg-teal-600 text-amber-300 shadow-sm' 
                : 'text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400'
            }`}
          >
            <FileSignature className="w-4 h-4" /> Penandatangan Dokumen
          </button>

          <button 
            onClick={() => { setActiveTab('profile'); setMessage(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'profile' 
                ? 'bg-teal-600 text-amber-300 shadow-sm' 
                : 'text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400'
            }`}
          >
            <User className="w-4 h-4" /> Profil Saya
          </button>
        </div>

        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 dark:border-slate-700 p-6 md:p-10">
          
          {activeTab === 'system' && (
            <form onSubmit={handleSaveSystem} className="space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Konfigurasi Periode KKL Plus</h3>
                <p className="text-slate-500 text-sm mb-6">Pilih periode aktif saat ini. Data pada dashboard akan di-filter berdasarkan periode ini.</p>
                
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Periode Aktif</label>
                    <select 
                      value={systemSettings.periode_aktif}
                      onChange={(e) => setSystemSettings({...systemSettings, periode_aktif: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all bg-slate-50"
                      required
                    >
                      {systemSettings.daftar_periode?.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Tambah Periode Baru</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newPeriode}
                        onChange={(e) => setNewPeriode(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm"
                        placeholder="Misal: Genap 2026/2027"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (newPeriode.trim() && !systemSettings.daftar_periode.includes(newPeriode.trim())) {
                            setSystemSettings({
                              ...systemSettings,
                              daftar_periode: [...systemSettings.daftar_periode, newPeriode.trim()]
                            });
                            setNewPeriode('');
                          }
                        }}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-xl font-black text-slate-800 mb-2">Buka/Tutup Akses Fitur</h3>
                <p className="text-slate-500 text-sm mb-6">Mengatur akses mahasiswa terhadap fitur-fitur KKL Plus.</p>
                
                <div className="space-y-4 max-w-2xl">
                  {/* Pendaftaran */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-slate-800">Pendaftaran POKJA Baru</h4>
                      <p className="text-sm text-slate-500">Izinkan mahasiswa untuk mendaftarkan Kelompok Kerja (POKJA) baru.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={systemSettings.pendaftaran_buka} onChange={(e) => setSystemSettings({...systemSettings, pendaftaran_buka: e.target.checked})} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>

                  {/* Logbook */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-slate-800">Pengisian Logbook Mingguan</h4>
                      <p className="text-sm text-slate-500">Izinkan mahasiswa mengisi aktivitas logbook saat POKJA berstatus Berjalan.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={systemSettings.pengisian_logbook_buka} onChange={(e) => setSystemSettings({...systemSettings, pengisian_logbook_buka: e.target.checked})} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>

                  {/* Laporan */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-slate-800">Pengumpulan Laporan Akhir</h4>
                      <p className="text-sm text-slate-500">Izinkan mahasiswa untuk submit dan cetak laporan akhir.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={systemSettings.pengumpulan_laporan_buka} onChange={(e) => setSystemSettings({...systemSettings, pengumpulan_laporan_buka: e.target.checked})} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'arsip' && (
            <form onSubmit={handleSaveSystem} className="space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Penandatangan Dokumen</h3>
                <p className="text-slate-500 text-sm mb-6">Nama dan identitas pejabat yang berwenang menandatangani dokumen-dokumen resmi KKL Plus.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Ketua Program Studi</label>
                    <input 
                      type="text" 
                      value={systemSettings.kaprodi_nama}
                      onChange={(e) => setSystemSettings({...systemSettings, kaprodi_nama: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">NIP / NIDN Kaprodi</label>
                    <input 
                      type="text" 
                      value={systemSettings.kaprodi_nip}
                      onChange={(e) => setSystemSettings({...systemSettings, kaprodi_nip: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all bg-slate-50"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Profil Admin</h3>
                <p className="text-slate-500 text-sm mb-6">Ubah data profil dan alamat email Anda.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={profileData.nama_lengkap}
                      onChange={(e) => setProfileData({...profileData, nama_lengkap: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all bg-slate-50"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-xl font-black text-slate-800 mb-2">Ubah Password</h3>
                <p className="text-slate-500 text-sm mb-6">Biarkan kosong jika Anda tidak ingin mengubah password.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password Baru</label>
                    <input 
                      type="password" 
                      value={profileData.password}
                      onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all bg-slate-50"
                      placeholder="Masukkan password baru..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Konfirmasi Password Baru</label>
                    <input 
                      type="password" 
                      value={profileData.confirm_password}
                      onChange={(e) => setProfileData({...profileData, confirm_password: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all bg-slate-50"
                      placeholder="Ketik ulang password baru..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
