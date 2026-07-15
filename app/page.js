"use client";

import Link from 'next/link';
import Image from 'next/image';
import LandingMitraList from '@/components/LandingMitraList';
import { useSession } from "@/components/AuthProvider";
import { Users, ClipboardCheck, MapPin, BarChart3, GraduationCap, Building } from "lucide-react";;
export default function Home() {
  const { data: session, status } = useSession();

  const getDashboardUrl = () => {
    if (!session || !session.user) return '/login';
    if (session.user.role === 'admin') return '/admin';
    return `/${session.user.role}`;
  };

  return (
    <main className="bg-slate-50 text-slate-800 font-sans antialiased bg-light-grid min-h-screen">
      
      {/* BAGIAN ATAS: NAVY BLUE (HERO SECTION) */}
      <div className="bg-[#0F172A] relative overflow-hidden pb-32">
        {/* Background Full Screen ala stimiyapmim.ac.id */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/mantau_hero.png')" }}></div>
        {/* Glow effect - replaced blur filter with radial gradient to prevent bounding box horizontal line artifacts in browsers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,_rgba(255,255,255,0.15),_transparent_40%)] pointer-events-none z-0"></div>

        {/* NAVBAR - LEBIH LEBAR */}
        <nav className="w-full px-8 lg:px-[5cm] py-6 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3 lg:gap-4">
            <Image src="/mk_gelap.png" alt="Mantau KKL Plus Logo" width={180} height={60} className="h-10 lg:h-12 w-auto object-contain drop-shadow-md" priority />
            <div className="text-3xl lg:text-4xl font-extrabold tracking-widest text-[#FAF9F6] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-l border-slate-500/50 pl-3 lg:pl-4 h-10 lg:h-12 flex items-center">
              STIMI YAPMI
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('target_kkl');
              window.location.href = getDashboardUrl();
            }}
            className="px-6 py-2 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all shadow-lg shadow-white/10"
          >
            {status === 'authenticated' && session?.user ? 'Ke Dashboard' : 'Login Sistem'}
          </button>
        </nav>

        {/* HERO SECTION - LEBIH LEBAR */}
        <section className="w-full px-8 lg:px-[5cm] relative z-10 flex items-center min-h-[450px]">
          {/* Kiri: Teks */}
          <div className="relative z-20 w-full lg:max-w-3xl space-y-8 py-10 px-8 lg:p-12 mt-10">
            <h1 className="text-6xl lg:text-7xl font-extrabold text-[#FAF9F6] leading-[1.1] tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]">
              Bangun Program,<br/>
              <span className="text-teal-600">Bergerak Bersama,</span><br/>
              Beri Dampak Nyata.
            </h1>
            <p className="text-xl text-[#FAF9F6] leading-relaxed font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <strong>MANTAU KKLPlus</strong> merupakan singkatan dari Manajemen Aktivitas, peNilaian, & Tata Administrasi Umum KKLPlus, adalah platform kolaboratif untuk mahasiswa melaksanakan program kerja kelompok bersama DPL dan mentor di lokasi, mulai dari perencanaan, pelaksanaan, hingga evaluasi.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200/60 mt-4">
              <button 
                onClick={() => {
                  localStorage.removeItem('target_kkl');
                  window.location.href = getDashboardUrl();
                }} 
                className="px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-[#0f7a85] text-white font-bold text-lg transition-all shadow-lg shadow-teal-600/30"
              >
                {status === 'authenticated' ? 'Ke Dashboard' : 'Mulai Sekarang'}
              </button>
              <Link href="/alur" className="px-8 py-3.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-lg transition-all shadow-sm">
                Pelajari Alur
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* AREA KONTEN BAWAH */}
      <section className="w-full px-8 lg:px-[5cm] -mt-24 relative z-20 pb-16">
        <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-10 lg:p-16 border border-white/60">
          <div className="text-center mb-16 max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Apa itu KKL Plus Berdampak STIMI YAPMI?</h2>
            <p className="text-lg text-slate-600 leading-relaxed text-justify lg:text-center">
              KKL Plus Berdampak STIMI YAPMI adalah program pengabdian lapangan unggulan yang dirancang melampaui sekadar kewajiban akademik. Program ini berorientasi pada penciptaan dampak nyata melalui program kerja yang disusun langsung berdasarkan kebutuhan masyarakat di lokasi penempatan.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed text-justify lg:text-center">
              Mulai dari observasi lapangan, perancangan solusi, pelaksanaan, hingga evaluasi, semuanya dilakukan secara sistematis. Dengan pendampingan DPL dan kolaborasi bersama Mentor Lokal, KKL Plus Berdampak memastikan setiap program tidak sekadar selesai di atas kertas, melainkan meninggalkan perubahan positif yang nyata, terukur, dan berkelanjutan bagi masyarakat.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-12">
            {/* Card 1 */}
            <div className="relative p-10 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 hover:border-teal-200 transition-all duration-500 group hover:shadow-[0_20px_40px_-15px_rgba(96,85,154,0.15)] hover:-translate-y-2">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none group-hover:text-teal-500 group-hover:opacity-10 transition-all duration-500 group-hover:-translate-y-4 group-hover:rotate-12"><GraduationCap className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500"><GraduationCap className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Bagi Mahasiswa</h3>
                <p className="text-slate-600 text-base leading-relaxed">Tergabung dalam Kelompok Kerja (POKJA) untuk berkolaborasi merumuskan dan mengeksekusi Program Kerja (Proker) yang berdampak langsung di lapangan.</p>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="relative p-10 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 hover:border-teal-200 transition-all duration-500 group hover:shadow-[0_20px_40px_-15px_rgba(96,85,154,0.15)] hover:-translate-y-2">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none group-hover:text-teal-500 group-hover:opacity-10 transition-all duration-500 group-hover:-translate-y-4 group-hover:rotate-12">🏛️</div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">🏛️</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Bagi Kampus</h3>
                <p className="text-slate-600 text-base leading-relaxed">Memperluas jaringan kemitraan institusi dan memberikan kontribusi nyata kepada masyarakat melalui inovasi serta solusi praktis dari mahasiswa.</p>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="relative p-10 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 hover:border-teal-200 transition-all duration-500 group hover:shadow-[0_20px_40px_-15px_rgba(96,85,154,0.15)] hover:-translate-y-2">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none group-hover:text-teal-500 group-hover:opacity-10 transition-all duration-500 group-hover:-translate-y-4 group-hover:rotate-12">🎯</div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">🎯</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Keberhasilan Proker</h3>
                <p className="text-slate-600 text-base leading-relaxed">Fokus pada eksekusi Program Kerja yang terukur dan aplikatif. Penilaian didasarkan pada sejauh mana solusi bermanfaat bagi instansi.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="relative p-10 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 hover:border-teal-200 transition-all duration-500 group hover:shadow-[0_20px_40px_-15px_rgba(96,85,154,0.15)] hover:-translate-y-2">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none group-hover:text-teal-500 group-hover:opacity-10 transition-all duration-500 group-hover:-translate-y-4 group-hover:rotate-12"><Building className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500"><Building className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Bagi Mitra (Instansi)</h3>
                <p className="text-slate-600 text-base leading-relaxed">Mendapatkan gagasan segar, solusi inovatif, dan tenaga bantuan terdidik yang secara proaktif membantu menyelesaikan tantangan operasional di lokasi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ETALASE PERUSAHAAN & POSISI */}
      <section className="w-full px-8 lg:px-[5cm] pb-24 relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Temukan Lokasi KKL Plus</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Pilih instansi mitra yang sesuai dengan minat dan konsentrasi program studi Anda. Berdampaklah bagi industri dan masyarakat luas bersama STIMI YAPMI.
          </p>
        </div>
        
        <LandingMitraList />
      </section>

    </main>
  );
}
