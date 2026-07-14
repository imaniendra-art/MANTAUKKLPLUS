"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./ThemeContext";
import { useState, useRef, useEffect } from "react";
import { Users, Database, ClipboardCheck, Monitor, Award, Archive, CloudSync, Settings, FileSignature, BookOpen, FileBadge, CheckSquare, FileCheck, Book, LogOut, Camera } from "lucide-react";

// ═══════════════════════ ICON COMPONENTS ═══════════════════════
function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-inherit group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ═══════════════════════ THEME TOGGLE BUTTON ═══════════════════════
function ThemeToggle({ toggleTheme, isDark }) {
  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-all duration-500 flex items-center border border-white/40 shadow-sm bg-white/40 hover:bg-white/60 dark:bg-slate-800/40 dark:border-slate-600/50 dark:hover:bg-slate-700/60 backdrop-blur-md`}
      title={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
    >
      <div className={`absolute w-5 h-5 rounded-full transition-all duration-500 flex items-center justify-center shadow-lg ${
        isDark
          ? 'left-1 bg-slate-700 text-slate-100 shadow-slate-900/30'
          : 'left-7.5 bg-teal-600 text-white shadow-teal-500/30'
      }`}>
        {isDark ? <MoonIcon /> : <SunIcon />}
      </div>
    </button>
  );
}

// ═══════════════════════ USER MENU BUTTON ═══════════════════════
function UserMenu({ nama, role }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-[100]" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-2xl border transition-all duration-300 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-slate-700/60 border-white/50 dark:border-slate-600/50 shadow-sm"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">{nama}</p>
          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mt-0.5">{role.replace('_', ' ')}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-inner">
          {nama ? nama.charAt(0).toUpperCase() : 'U'}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 sm:hidden">
            <p className="text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">{nama}</p>
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mt-0.5">{role.replace('_', ' ')}</p>
          </div>
          <Link href="/profil" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
            <Settings className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Pengaturan Profil
          </Link>
          <div className="h-px bg-slate-200/50 dark:bg-slate-700/50"></div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full text-left px-4 py-3.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════ MENU CONFIGURATION ═══════════════════════
export const MENU_CONFIG = {
  admin: {
    greeting: "Admin & Prodi",
    subtitle: "Kelola master data, monitoring seluruh aktivitas KKL Plus, dan pantau DPL serta Mahasiswa.",
    menus: [
      { name: "Manajemen Pengguna", href: "/admin/pengguna", icon: <Users className="w-6 h-6" />, desc: "Kelola akun Mahasiswa, DPL, dan Mentor.", color: "from-teal-600 to-teal-700" },
      { name: "Master Data", href: "/admin/master-data", icon: <Database className="w-6 h-6" />, desc: "Kelola Instansi Mitra dan Posisi.", color: "from-teal-500 to-teal-600" },
      { name: "Validasi dan Data Pengajuan", href: "/admin/validasi", icon: <ClipboardCheck className="w-6 h-6" />, desc: "Persetujuan KKL Plus & plotting DPL.", color: "from-teal-500 to-teal-600" },
      { name: "Monitoring KKL Plus", href: "/admin/monitoring", icon: <Monitor className="w-6 h-6" />, desc: "Pantau logbook dan kendala lapangan.", color: "from-amber-500 to-amber-600" },
      { name: "Rekapitulasi Nilai", href: "/admin/rekapitulasi", icon: <Award className="w-6 h-6" />, desc: "Hasil akhir dan konversi SKS.", color: "from-teal-500 to-teal-600" },
      { name: "Arsip & Dokumen", href: "/admin/arsip", icon: <Archive className="w-6 h-6" />, desc: "Cetak surat pengantar & sertifikat.", color: "from-amber-500 to-amber-600" },
      { name: "Sinkronisasi PDDikti", href: "/admin/sinkronisasi", icon: <CloudSync className="w-6 h-6" />, desc: "Ekspor data pelaporan PDDikti.", color: "from-teal-500 to-teal-600" },
      { name: "Pengaturan Sistem", href: "/admin/settings", icon: <Settings className="w-6 h-6" />, desc: "Konfigurasi aplikasi dan periode.", color: "from-slate-500 to-slate-600" },
    ],
  },
  mahasiswa: {
    greeting: "Mahasiswa",
    subtitle: "Kumpulkan poin dengan menyelesaikan indikator CPMK setiap harinya.",
    menus: [
      { name: "Pengajuan KKL Plus", href: "/mahasiswa/pengajuan", icon: <FileSignature className="w-6 h-6" />, desc: "Ajukan dan kelola pengajuan KKL Plus baru", color: "from-teal-600 to-teal-600" },
      { name: "Logbook Harian", href: "/mahasiswa/logbook", icon: <BookOpen className="w-6 h-6" />, desc: "Catat kegiatan harian dan kumpulkan poin kinerja", color: "from-teal-500 to-teal-600" },
      { name: "Laporan & Sertifikat", href: "/mahasiswa/laporan", icon: <FileBadge className="w-6 h-6" />, desc: "Unduh laporan KKL Plus dan sertifikat pencapaian", color: "from-amber-500 to-amber-600" },
    ],
  },
  dpl: {
    greeting: "Dosen Pembimbing",
    subtitle: "Pantau aktivitas mahasiswa bimbingan Anda dan berikan penilaian berkala.",
    menus: [
      { name: "Daftar Bimbingan", href: "/dpl/bimbingan", icon: <Users className="w-6 h-6" />, desc: "Pantau dan konfirmasi penyerahan mahasiswa", color: "from-teal-600 to-teal-600" },
      { name: "Validasi Logbook", href: "/dpl/validasi", icon: <CheckSquare className="w-6 h-6" />, desc: "Review dan validasi logbook harian mahasiswa", color: "from-teal-500 to-teal-600" },
      { name: "Monev Lapangan", href: "/dpl/monev", icon: <Camera className="w-6 h-6" />, desc: "Upload dokumentasi kunjungan lapangan", color: "from-teal-500 to-teal-600" },
      { name: "Validasi Laporan & Penilaian", href: "/dpl/validasi-laporan", icon: <FileCheck className="w-6 h-6" />, desc: "Persetujuan Laporan Akhir", color: "from-teal-500 to-teal-600" },
      { name: "Petunjuk KKL Plus", href: "/dpl/petunjuk", icon: <Book className="w-6 h-6" />, desc: "Panduan pembimbingan dan rincian target CPMK", color: "from-amber-500 to-amber-600" },
    ],
  },
  mentor: {
    greeting: "Mentor Industri",
    subtitle: "Validasi logbook harian dan pantau perkembangan mahasiswa KKL Plus.",
    menus: [
      { name: "Validasi Logbook", href: "/mentor/validasi", icon: <CheckSquare className="w-6 h-6" />, desc: "Review dan validasi logbook harian mahasiswa", color: "from-teal-600 to-teal-600" },
      { name: "Petunjuk KKL Plus", href: "/mentor/petunjuk", icon: <Book className="w-6 h-6" />, desc: "Panduan mentoring dan rincian target CPMK", color: "from-teal-500 to-teal-600" },
    ],
  },
};

const SUB_PAGE_TITLES = {
  "/admin/validasi": "Validasi dan Data Pengajuan",
  "/admin/master-data": "Manajemen Data",
  "/admin/settings": "Pengaturan",
  "/admin/monitoring": "Monitoring KKL Plus",
  "/mahasiswa/pengajuan": "Pengajuan KKL Plus",
  "/mahasiswa/logbook": "Logbook Harian",
  "/mahasiswa/laporan": "Laporan & Sertifikat",
  "/dpl/validasi": "Validasi Logbook",
  "/dpl/validasi-laporan": "Validasi Laporan Akhir",
  "/dpl/evaluasi": "Evaluasi Akhir",
  "/mentor/validasi": "Validasi Logbook",
};

// ═══════════════════════ MAIN EXPORT ═══════════════════════
export default function DashboardLayout({ children, title = "Dashboard", notifications = null, backPath = null, customMenus = null }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [activePeriode, setActivePeriode] = useState("Memuat...");

  useEffect(() => {
    if (status === "authenticated") {
      fetch('/api/admin/settings')
        .then(res => res.json())
        .then(data => {
          if (data && data.periode_aktif) {
            setActivePeriode(data.periode_aktif);
          } else {
            setActivePeriode("Ganjil 2026/2027");
          }
        })
        .catch(err => {
          console.error("Gagal mengambil periode aktif:", err);
          setActivePeriode("Ganjil 2026/2027");
        });
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-900">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 rounded-full animate-spin border-teal-600/30 border-t-teal-600" />
          <div className="text-lg font-bold animate-pulse text-slate-500 dark:text-slate-400">Memuat data...</div>
        </div>
      </div>
    );
  }

  const role = session?.user?.role || "guest";
  const nama = session?.user?.nama_lengkap || "Pengguna";
  const config = MENU_CONFIG[role] || MENU_CONFIG.mahasiswa;

  const dashboardPaths = ["/admin", "/mahasiswa", "/dpl", "/mentor"];
  const isMainDashboard = dashboardPaths.includes(pathname);
  const parentPath = backPath || ("/" + pathname.split("/")[1]);
  const subPageTitle = SUB_PAGE_TITLES[pathname] || title;

  // Background Component to reuse
  const BackgroundScene = () => (
    <>
      {/* Gambar Latar */}
      <div 
        className={`absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed transition-opacity duration-700 ${isDark ? 'opacity-20' : 'opacity-40'}`} 
        style={{ backgroundImage: "url('/hero-2.webp')" }}
      />
      {/* Overlay agar teks tetap terbaca */}
      <div className={`absolute inset-0 z-0 transition-colors duration-700 ${isDark ? 'bg-slate-900/80' : 'bg-slate-50/85 backdrop-blur-[2px]'}`} />
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-600/10 dark:from-teal-600/15 to-transparent rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/5 dark:from-teal-500/10 to-transparent rounded-full pointer-events-none z-0" />
    </>
  );

  // ═══════════════════════ SUB-PAGE LAYOUT ═══════════════════════
  if (!isMainDashboard) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 selection:bg-teal-600/30">
        <BackgroundScene />

        {/* Sticky Header */}
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/10 dark:bg-slate-900/10 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(parentPath)}
                className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-700 border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm dark:shadow-none"
              >
                <BackIcon />
                <span className="text-sm font-semibold">Kembali</span>
              </button>
              <div className="hidden sm:block w-px h-6 bg-slate-300/50 dark:bg-slate-700" />
              <h1 className="hidden sm:block text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">{subPageTitle}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-600/10 dark:bg-teal-500/10 border border-teal-600/20 dark:border-teal-500/20">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-wide uppercase">Periode Aktif:</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{activePeriode}</span>
              </div>
              <ThemeToggle toggleTheme={toggleTheme} isDark={isDark} />
              <UserMenu nama={nama} role={role} />
            </div>
          </div>
        </header>

        {/* Sub-page Content */}
        <main className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════ MAIN DASHBOARD LAYOUT ═══════════════════════
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 selection:bg-teal-600/30">
      <BackgroundScene />

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-5 flex justify-between items-center relative z-50">
        <Link href="/" className="flex items-center gap-3 lg:gap-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md py-2 px-3 lg:px-4 rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-sm transition-all hover:bg-white/60 dark:hover:bg-slate-800/60">
          <img src="/mk_terang.png" alt="Mantau KKL Plus Logo" className="h-8 lg:h-10 w-auto object-contain drop-shadow-sm block dark:hidden" />
          <img src="/mk_gelap.png" alt="Mantau KKL Plus Logo" className="h-8 lg:h-10 w-auto object-contain drop-shadow-sm hidden dark:block" />
          <div className="text-xl lg:text-2xl font-extrabold tracking-widest text-slate-800 dark:text-[#FAF9F6] drop-shadow-sm border-l border-slate-300 dark:border-slate-600 pl-3 lg:pl-4 h-8 lg:h-10 flex items-center">
            STIMI YAPMI
          </div>
        </Link>
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/50 shadow-sm backdrop-blur-md">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-wide uppercase">Periode Aktif:</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{activePeriode}</span>
          </div>
          <ThemeToggle toggleTheme={toggleTheme} isDark={isDark} />
          <UserMenu nama={nama} role={role} />
        </div>
      </nav>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <div className="relative rounded-[2rem] shadow-lg overflow-hidden group border border-white/20">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('/mantau_hero.png')" }}
          ></div>
          {/* Dark Overlay for contrast */}
          <div className="absolute inset-0 bg-slate-900/80 dark:bg-slate-950/80"></div>
          {/* Accent Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 to-teal-600/20 dark:from-teal-900/90 dark:to-transparent"></div>
          
          <div className="relative z-10 p-8 lg:p-12">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm mb-6">
              <span className="text-xs font-bold uppercase tracking-widest">{config.greeting} Panel</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
              Selamat Datang, <span className="text-teal-300 drop-shadow-md">{nama.split(' ')[0]}</span>!
            </h1>
            <p className="text-slate-200 text-lg max-w-2xl leading-relaxed opacity-90 drop-shadow-md">
              {config.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ NOTIFICATION CARDS / HIGHLIGHTS ═══════════════ */}
      {notifications && (
        <section className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 mt-6 mb-10">
          {notifications}
        </section>
      )}

      {/* ═══════════════ MENU CARDS ═══════════════ */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-teal-600 rounded-full shadow-sm shadow-teal-600/50" />
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 drop-shadow-sm">Menu Utama</h2>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${customMenus ? (customMenus.length >= 4 ? 'lg:grid-cols-4' : customMenus.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2') : (config.menus.length >= 4 ? 'lg:grid-cols-4' : config.menus.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2')} gap-5 lg:gap-6`}>
          {(customMenus || config.menus).map((menu, index) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="group relative rounded-2xl p-7 lg:p-8 transition-all duration-500 hover:-translate-y-1 border bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl hover:bg-white/70 dark:hover:bg-slate-700/80 border-white/60 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400 shadow-sm hover:shadow-xl hover:shadow-amber-400/20 dark:shadow-none dark:hover:shadow-[0_0_30px_-5px_rgba(251,191,36,0.2)] transform-gpu will-change-transform"
            >
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${menu.color} text-white shadow-lg flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  {menu.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 transition-colors duration-300 text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  {menu.name}
                </h3>
                <p className="text-sm leading-relaxed transition-colors duration-300 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300">
                  {menu.desc}
                </p>
              </div>

              {/* Arrow indicator */}
              <div className="absolute top-7 right-7 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 bg-white/50 dark:bg-slate-900/50 group-hover:bg-teal-600/10 dark:group-hover:bg-teal-600/20 border border-white/40 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 backdrop-blur-sm">
                <ArrowRightIcon />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════ EXTRA CONTENT (CHILDREN) ═══════════════ */}
      {children && (
        <section className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-20">
          {children}
        </section>
      )}
    </div>
  );
}
