"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function ProfilPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const role = session?.user?.role;
  let dashboardPath = "/";
  if (role === "lppm") dashboardPath = "/admin";
  else if (role === "mahasiswa") dashboardPath = "/mahasiswa";
  else if (role === "dpl") dashboardPath = "/dpl";
  else if (role === "mentor") dashboardPath = "/mentor";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "Password baru dan konfirmasi password tidak cocok." });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Gagal mengubah password." });
      } else {
        alert("Password berhasil diubah. Silakan login kembali dengan password baru pada sesi berikutnya.");
        router.push(dashboardPath);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan sistem." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Pengaturan Profil" backPath={dashboardPath}>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1398A5] to-teal-600 p-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-md">
              Profil Pengguna
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                <p className="text-lg font-black text-slate-800 dark:text-white">{session?.user?.nama_lengkap}</p>
              </div>
              <div className="p-5 bg-teal-50/50 dark:bg-teal-900/20 rounded-2xl border border-teal-100/50 dark:border-teal-800/50 shadow-sm">
                <p className="text-xs font-bold text-teal-500 dark:text-teal-400 uppercase tracking-wider mb-1">Role / Peran</p>
                <p className="text-lg font-black text-teal-700 dark:text-teal-300 uppercase">{session?.user?.role}</p>
              </div>
              <div className="p-5 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {role === 'mahasiswa' ? 'NIM' : 'ID Pengguna (Username)'}
                </p>
                <p className="text-lg font-black text-slate-800 dark:text-white">{session?.user?.nim_nidn}</p>
              </div>
              {session?.user?.nidn && role !== 'mahasiswa' && (
                <div className="p-5 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">NIDN</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">{session?.user?.nidn}</p>
                </div>
              )}
            </div>
            
            <div className="bg-white/40 dark:bg-slate-900/20 p-6 rounded-3xl border border-white/60 dark:border-slate-700 shadow-inner">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#1398A5]">🔒</span> Ubah Password
                </h3>
                <p className="text-sm text-slate-500 mt-1">Pastikan password baru Anda aman dan mudah diingat.</p>
              </div>
              
              {message && (
                <div className={`p-4 rounded-xl mb-6 font-bold text-sm flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {message.type === 'error' ? '⚠️ ' : '✅ '}{message.text}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password Lama</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1398A5] transition-all font-medium placeholder-slate-400"
                    placeholder="Masukkan password lama"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password Baru</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1398A5] transition-all font-medium placeholder-slate-400"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1398A5] transition-all font-medium placeholder-slate-400"
                    placeholder="Ulangi password baru"
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#1398A5] hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Menyimpan...' : (
                      <>
                        <Check className="w-5 h-5" />
                        Simpan Password Baru
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
