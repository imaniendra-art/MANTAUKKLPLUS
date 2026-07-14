"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Eye, School, Car, UserCheck, Target, FileText, MapPin, Link as LinkIcon, Award, GraduationCap } from "lucide-react";

export default function PetunjukDPL() {
  return (
    <DashboardLayout title="Petunjuk & Panduan DPL">
      <div className="space-y-6 pb-12 mt-6">
        {/* Banner Penjelasan & Alur Lengkap */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-black mb-4 flex items-center gap-3">
                <GraduationCap className="w-9 h-9 text-teal-200" /> Selamat Datang, Dosen Pembimbing Lapangan!
              </h1>
              <p className="text-teal-50 text-sm md:text-base leading-relaxed max-w-3xl font-medium mb-4">
                Sebagai <strong>Dosen Pembimbing Lapangan (DPL)</strong>, Anda memiliki peran penting dalam memastikan KKL Plus berjalan dengan lancar dan memberikan dampak nyata. Panduan ringkas ini akan membantu Anda menavigasi seluruh alur KKL Plus, mulai dari pemantauan harian hingga tahap penilaian akhir.
              </p>
            </div>
          </div>
          
          <div className="p-8 space-y-8 text-slate-700">
            {/* Bagian 1: Alur Validasi */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="text-teal-600">1.</span> Alur Pelaksanaan KKL Plus bagi DPL</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                
                {/* A */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl hover:shadow-md transition">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Car className="w-5 h-5 text-slate-500" /> A. Pengantaran Mahasiswa
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    DPL wajib membawa dan mengantarkan mahasiswa ke lokasi KKL Plus, serta secara resmi menyerahkan mahasiswa kepada pihak pimpinan instansi/mitra.
                  </p>
                </div>

                {/* B */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl hover:shadow-md transition">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-slate-500" /> B. Menunjuk Mentor Lapangan
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    DPL berkoordinasi dengan instansi untuk menunjuk Mentor Lapangan, lalu mendaftarkan nama dan kontak mentor tersebut ke dalam sistem.
                  </p>
                </div>

                {/* C */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl hover:shadow-md transition">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5 text-slate-500" /> C. Validasi Program Kerja
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Membantu menyusun dan memvalidasi usulan Proker. Proker wajib dibagi menjadi dua kategori utama: <strong>Proker Core (Inti)</strong> dan <strong>Proker Pendukung</strong>.
                  </p>
                </div>

                {/* D */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl hover:shadow-md transition">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-500" /> D. Validasi Logbook
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Memantau kegiatan mahasiswa setiap minggu. DPL mengecek, memberi catatan revisi, dan menyetujui logbook harian melalui menu <strong>Validasi Logbook</strong>.
                  </p>
                </div>

                {/* E */}
                <div className="bg-teal-50 border border-teal-300 p-5 rounded-xl shadow-sm relative">
                  <h3 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-600" /> E. Kunjungan Lapangan
                  </h3>
                  <div className="text-sm text-teal-800 leading-relaxed">
                    DPL <strong>wajib melakukan minimal 3 kali kunjungan</strong> ke lokasi:
                    <ul className="list-disc list-inside mt-2 space-y-1 font-semibold">
                      <li>Kunjungan Pengantaran (Awal)</li>
                      <li>Kunjungan Pertengahan (Monev)</li>
                      <li>Kunjungan Penarikan (Akhir)</li>
                    </ul>
                  </div>
                </div>

                {/* F */}
                <div className="bg-amber-50 border border-amber-300 p-5 rounded-xl shadow-sm relative flex flex-col">
                  <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-amber-600" /> F. Laporan & Link Mentor
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed mb-3 flex-grow">
                    Validasi Laporan Akhir adalah syarat agar form Penilaian terbuka.
                  </p>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-300 text-xs font-semibold text-amber-900 mt-auto">
                    <span className="text-red-600 font-bold">🚨 SANGAT PENTING:</span> Setelah memvalidasi, copy pop-up <strong>Magic Link</strong> dan berikan langsung ke Mentor Eksternal!
                  </div>
                </div>

                {/* G */}
                <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl hover:shadow-md transition">
                  <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" /> G. Evaluasi & Penilaian
                  </h3>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    Setelah validasi selesai dan Mentor memberikan nilai, DPL mengkalkulasi dan menetapkan <strong>Nilai Akhir</strong> untuk mahasiswa di menu <strong>Evaluasi</strong>.
                  </p>
                </div>

              </div>
            </section>

            {/* Bagian 2: Skema Penilaian */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="text-teal-600">2.</span> Skema & Perhitungan Penilaian</h2>
              <p className="text-sm text-slate-600 mb-4">
                Penilaian KKL Plus terdiri dari <strong>Nilai Kelompok</strong> (merata untuk semua anggota) dan <strong>Nilai Individu</strong> (spesifik per mahasiswa), yang diberikan oleh DPL dan Mentor Eksternal. Menu <strong>Penilaian</strong> baru bisa diakses setelah Anda memvalidasi Laporan Akhir.
              </p>
              
              <div className="bg-teal-50 border border-teal-200 rounded-xl overflow-hidden mb-6">
                <div className="bg-teal-600 text-white p-3 px-5 font-bold text-sm">
                  Komponen Penilaian (Rentang 0 - 100)
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-bold text-teal-900 border-b border-teal-200 pb-2 mb-3">Nilai Kelompok (50%)</h4>
                    <ul className="list-disc list-inside space-y-1 text-teal-800">
                      <li>Ketercapaian Target Proker</li>
                      <li>Kesesuaian Proker dengan Bidang Studi</li>
                      <li>Dampak/Manfaat Proker bagi Masyarakat/Instansi</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-900 border-b border-teal-200 pb-2 mb-3">Nilai Individu (50%)</h4>
                    <ul className="list-disc list-inside space-y-1 text-teal-800">
                      <li>Kualitas Penyusunan Laporan Akhir</li>
                      <li>Kedisiplinan Pengisian Logbook Harian</li>
                      <li>Etika dan Komunikasi selama Bimbingan</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 text-slate-300 rounded-xl p-6 text-sm">
                <h3 className="text-white font-bold text-base mb-3">Rumus Perhitungan Nilai Akhir (Otomatis oleh Sistem)</h3>
                <div className="space-y-4 font-mono bg-slate-900 p-4 rounded-lg text-xs md:text-sm leading-relaxed overflow-x-auto">
                  <p><span className="text-fuchsia-400">Total DPL</span> = (Rata-rata Kelompok DPL + Rata-rata Individu DPL) / 2</p>
                  <p><span className="text-sky-400">Total Mentor</span> = (Rata-rata Kelompok Mentor + Rata-rata Individu Mentor) / 2</p>
                  <div className="h-px bg-slate-700 my-2"></div>
                  <p className="text-teal-400 font-bold text-sm md:text-base">
                    Nilai Akhir Angka = (Total DPL × 80%) + (Total Mentor × 20%)
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
