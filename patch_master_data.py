import re

with open("app/admin/master-data/page.js", "r") as f:
    content = f.read()

# 1. State
state_target = """  // Data State
  const [mitras, setMitras] = useState([]);
  const [pakets, setPakets] = useState([]);
  const [loading, setLoading] = useState(true);"""

state_replace = """  // Data State
  const [mitras, setMitras] = useState([]);
  const [pakets, setPakets] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mitra");
"""
content = content.replace(state_target, state_replace)

# 2. fetchData
fetch_target = """  const fetchData = async () => {
    setLoading(true);
    try {
      const [mitraRes, paketRes] = await Promise.all([
        fetch('/api/mitra'),
        fetch('/api/paket-matkul')
      ]);
      const mitraData = await mitraRes.json();
      const paketData = await paketRes.json();
      
      if (Array.isArray(mitraData)) setMitras(mitraData);
      if (Array.isArray(paketData)) setPakets(paketData);
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setLoading(false);
    }
  };"""

fetch_replace = """  const fetchData = async () => {
    setLoading(true);
    try {
      const [mitraRes, paketRes, mentorRes] = await Promise.all([
        fetch('/api/mitra'),
        fetch('/api/paket-matkul'),
        fetch('/api/admin/pengguna?role=mentor')
      ]);
      const mitraData = await mitraRes.json();
      const paketData = await paketRes.json();
      const mentorData = await mentorRes.json();
      
      if (Array.isArray(mitraData)) setMitras(mitraData);
      if (Array.isArray(paketData)) setPakets(paketData);
      if (Array.isArray(mentorData)) setMentors(mentorData);
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setLoading(false);
    }
  };

  // Mentor State & Handlers
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [showEditMentorModal, setShowEditMentorModal] = useState(false);
  const [mentorForm, setMentorForm] = useState({ id: null, nidn: "", nama_lengkap: "", nomor_hp: "", email: "", lokasi: "", devisi: "" });
  const [currentPageMentor, setCurrentPageMentor] = useState(1);
  const mentorsPerPage = 8;
  const indexOfLastMentor = currentPageMentor * mentorsPerPage;
  const indexOfFirstMentor = indexOfLastMentor - mentorsPerPage;
  const currentMentors = mentors.slice(indexOfFirstMentor, indexOfLastMentor);
  const totalPagesMentor = Math.ceil(mentors.length / mentorsPerPage);

  const handleMentorSubmit = async (e, isEdit) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/pengguna', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mentorForm, role: 'mentor', nim_nidn: mentorForm.nidn })
      });
      if (res.ok) {
        if(isEdit) setShowEditMentorModal(false);
        else setShowAddMentorModal(false);
        setMentorForm({ id: null, nidn: "", nama_lengkap: "", nomor_hp: "", email: "", lokasi: "", devisi: "" });
        setToastMessage(isEdit ? "Mentor diperbarui!" : "Mentor ditambahkan!");
        setTimeout(() => setToastMessage(""), 3000);
        fetchData();
      } else {
        const data = await res.json();
        setToastMessage(data.error || "Gagal menyimpan mentor");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (error) { 
        setToastMessage("Terjadi kesalahan sistem"); 
        setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleDeleteMentor = async (id) => {
    if (!window.confirm("Hapus mentor ini?")) return;
    try {
      const res = await fetch(`/api/admin/pengguna?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setToastMessage("Mentor berhasil dihapus!");
        setTimeout(() => setToastMessage(""), 3000);
        fetchData();
      }
    } catch (error) { 
        setToastMessage("Terjadi kesalahan sistem"); 
        setTimeout(() => setToastMessage(""), 3000);
    }
  };
"""
content = content.replace(fetch_target, fetch_replace)

# 3. Tabs UI and opening activeTab === 'mitra'
tabs_target = """      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-bold animate-pulse">Memuat data dari database...</div>
      ) : (
        <>
          <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">"""

tabs_replace = """      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-bold animate-pulse">Memuat data dari database...</div>
      ) : (
        <>
          <div className="flex space-x-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-1.5 rounded-xl w-max mb-6 border border-white/60 dark:border-slate-700">
            <button onClick={() => setActiveTab("mitra")} className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "mitra" ? "bg-[#1398A5] text-amber-300 shadow-sm" : "text-slate-500 hover:text-[#1398A5] dark:text-slate-400 dark:hover:text-teal-400"}`}>Daftar Instansi</button>
            <button onClick={() => setActiveTab("mentor")} className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "mentor" ? "bg-[#1398A5] text-amber-300 shadow-sm" : "text-slate-500 hover:text-[#1398A5] dark:text-slate-400 dark:hover:text-teal-400"}`}>Data Mentor</button>
          </div>

          <div className="space-y-6">
          {activeTab === "mitra" && (
            <>
              <div className="flex justify-between items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">"""
content = content.replace(tabs_target, tabs_replace)

# 4. Closing mitra and adding mentor block
mentor_block_target = """                </div>
              )}
            </div>
        </>
      )}

      {/* MODALS */}"""

mentor_block_replace = """                </div>
              )}
            </>
          )}

          {activeTab === "mentor" && (
            <>
              <div className="flex justify-between items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Data Mentor (Mitra Pendamping)</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola kontak mentor atau pendamping dari instansi KKL Plus.</p>
                </div>
                <button onClick={() => { setMentorForm({ id: null, nidn: "", nama_lengkap: "", nomor_hp: "", email: "", lokasi: "", devisi: "" }); setShowAddMentorModal(true); }} className="px-5 py-2.5 bg-[#1398A5] hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-md">
                  + Tambah Mentor
                </button>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold">
                      <th className="py-4 px-6 w-16 text-center">No</th>
                      <th className="py-4 px-6">Nama & Kontak</th>
                      <th className="py-4 px-6">Instansi / Lokasi</th>
                      <th className="py-4 px-6">Posisi / Devisi</th>
                      <th className="py-4 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {currentMentors.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">Belum ada data mentor.</td></tr>
                    ) : (
                      currentMentors.map((m, index) => (
                        <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                          <td className="py-4 px-6 text-center text-slate-500 font-medium">{indexOfFirstMentor + index + 1}</td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-800 dark:text-slate-100">{m.nama_lengkap}</div>
                            <div className="text-xs text-slate-500">{m.email} {m.nomor_hp ? `| ${m.nomor_hp}` : ''}</div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{m.lokasi || '-'}</td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{m.devisi || '-'}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setMentorForm({ id: m._id, nidn: m.nidn || "", nama_lengkap: m.nama_lengkap || "", nomor_hp: m.nomor_hp || "", email: m.email || "", lokasi: m.lokasi || "", devisi: m.devisi || "" }); setShowEditMentorModal(true); }} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg">Edit</button>
                              <button onClick={() => handleDeleteMentor(m._id)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg">Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Mentor */}
              {totalPagesMentor > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Menampilkan {indexOfFirstMentor + 1} - {Math.min(indexOfLastMentor, mentors.length)} dari total {mentors.length} mentor
                  </span>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPageMentor === 1}
                      onClick={() => setCurrentPageMentor(prev => prev - 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPagesMentor }).map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentPageMentor(i + 1)}
                        className={`w-9 h-9 flex items-center justify-center font-bold rounded-lg shadow-sm transition-colors border ${currentPageMentor === i + 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      disabled={currentPageMentor === totalPagesMentor}
                      onClick={() => setCurrentPageMentor(prev => prev + 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

            </div>
        </>
      )}

      {/* MODALS */}"""
content = content.replace(mentor_block_target, mentor_block_replace)


# 5. Add/Edit Mentor Modal Component
modals_append_target = """    </DashboardLayout>
  );
}"""

modals_append_replace = """
      {(showAddMentorModal || showEditMentorModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700 w-full max-w-lg overflow-hidden relative scale-in-95 duration-200">
            <div className="p-8 border-b border-white/60 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {showEditMentorModal ? 'Edit Mentor' : 'Tambah Mentor'}
              </h3>
            </div>
            
            <form onSubmit={(e) => handleMentorSubmit(e, showEditMentorModal)} className="p-8 bg-white/20 dark:bg-slate-900/20/50 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ID / Username</label>
                <input required value={mentorForm.nidn} onChange={(e) => setMentorForm({...mentorForm, nidn: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1398A5]" placeholder="Masukkan ID atau username" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input required value={mentorForm.nama_lengkap} onChange={(e) => setMentorForm({...mentorForm, nama_lengkap: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1398A5]" placeholder="Nama Lengkap Mentor" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Instansi / Lokasi</label>
                  <input required value={mentorForm.lokasi} onChange={(e) => setMentorForm({...mentorForm, lokasi: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1398A5]" placeholder="Contoh: PT Telkom" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Posisi / Devisi</label>
                  <input required value={mentorForm.devisi} onChange={(e) => setMentorForm({...mentorForm, devisi: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1398A5]" placeholder="Contoh: HRD" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor HP</label>
                  <input required value={mentorForm.nomor_hp} onChange={(e) => setMentorForm({...mentorForm, nomor_hp: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1398A5]" placeholder="0812..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" required value={mentorForm.email} onChange={(e) => setMentorForm({...mentorForm, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1398A5]" placeholder="Email Mentor" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowAddMentorModal(false); setShowEditMentorModal(false); }} className="flex-1 px-4 py-3 rounded-xl font-bold bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700 shadow-sm">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold bg-[#1398A5] hover:bg-teal-700 text-white transition-all shadow-lg shadow-teal-500/30">Simpan Mentor</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}"""

content = content.replace(modals_append_target, modals_append_replace)

with open("app/admin/master-data/page.js", "w") as f:
    f.write(content)

print("Patch applied.")
