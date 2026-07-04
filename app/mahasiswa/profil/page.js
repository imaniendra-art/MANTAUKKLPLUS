import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export default async function ProfilMahasiswa() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'mahasiswa') {
    return <div>Akses ditolak</div>;
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id);

  if (!user) {
    return <div>Data tidak ditemukan</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm mb-8 flex items-start gap-3">
        <span className="text-xl">🔄</span>
        <p>
          <strong>Data disinkronkan:</strong> Data profil Anda disinkronkan secara otomatis dari SIAM (Sistem Informasi Akademik) STIMI YAPMI. Jika terdapat kekeliruan data, silakan hubungi bagian BAAK.
        </p>
      </div>

      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 dark:border-slate-700 overflow-hidden">
        <div className="px-8 py-6 border-b border-white/60 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profil Mahasiswa</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Informasi biodata diri Anda</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="nama_lengkap" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nama Lengkap
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="nama_lengkap"
                  id="nama_lengkap"
                  value={user.nama_lengkap}
                  disabled
                  readOnly
                  className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-slate-700 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="nim" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                NIM
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="nim"
                  id="nim"
                  value={user.nim_nidn}
                  disabled
                  readOnly
                  className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-slate-700 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={user.email}
                  disabled
                  readOnly
                  className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-slate-700 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="program_studi" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Program Studi
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="program_studi"
                  id="program_studi"
                  value={user.program_studi || 'Manajemen (S1)'}
                  disabled
                  readOnly
                  className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-slate-700 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="konsentrasi" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Konsentrasi
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="konsentrasi"
                  id="konsentrasi"
                  value={user.konsentrasi || '-'}
                  disabled
                  readOnly
                  className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-slate-700 cursor-not-allowed opacity-80"
                />
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="ttl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tempat, Tanggal Lahir
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="ttl"
                  id="ttl"
                  value="Makassar, 01 Januari 2002"
                  disabled
                  readOnly
                  className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-slate-700 cursor-not-allowed opacity-80"
                />
                <p className="mt-1 text-xs text-slate-500">Hanya dummy/contoh integrasi SIAM.</p>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="ipk" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                IPK (Indeks Prestasi Kumulatif)
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="ipk"
                  id="ipk"
                  value="3.75"
                  disabled
                  readOnly
                  className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-slate-700 cursor-not-allowed opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
