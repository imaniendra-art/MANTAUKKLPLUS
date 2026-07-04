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
          <div className="p-8 border-b border-white/60 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              👤 Profil Anda
            </h2>
          </div>
          <div className="p-8 bg-white/20 dark:bg-slate-900/20/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Nama Lengkap</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{session?.user?.nama_lengkap}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Role / Peran</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 uppercase">{session?.user?.role}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {role === 'mahasiswa' ? 'NIM' : 'ID (Username)'}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{session?.user?.nim_nidn}</p>
              </div>
              {session?.user?.nidn && role !== 'mahasiswa' && (
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">NIDN</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{session?.user?.nidn}</p>
                </div>
              )}
            </div>
            
            <hr className="border-white/60 dark:border-slate-700 mb-8" />
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Ubah Password</h3>
            
            {message && (
              <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
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
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password Baru</label>
                <input 
                  type="password" 
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
