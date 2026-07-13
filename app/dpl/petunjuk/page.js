"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Eye, School } from "lucide-react";

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
                <span>👨‍🏫</span> Selamat Datang, Dosen Pembimbing Lapangan!
              </h1>
              <p className="text-teal-50 text-sm md:text-base leading-relaxed max-w-3xl font-medium mb-4">
                Sebagai <strong>Dosen Pembimbing Lapangan (DPL)</strong>, Anda memiliki peran penting dalam memastikan KKL Plus berjalan dengan lancar dan memberikan dampak nyata. Panduan ringkas ini akan membantu Anda menavigasi seluruh alur KKL Plus, mulai dari pemantauan harian hingga tahap penilaian akhir.
              </p>
            </div>
          </div>
          
          <div className="p-8 space-y-8 text-slate-700">
            {/* Bagian 1: Alur Validasi */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="text-teal-600">1.</span> Alur Utama DPL</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">📝</span> A. Validasi Logbook Harian
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-2">
                    Mahasiswa akan melaporkan kegiatan mereka setiap hari melalui logbook. Anda diharapkan untuk mengecek, memberikan catatan revisi, dan menyetujui logbook tersebut secara rutin melalui menu <strong>Validasi Logbook</strong>.
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-300 p-5 rounded-xl shadow-sm relative">
                  <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">🚀</span> B. Validasi Laporan & Link Mentor
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed mb-3">
                    Pada akhir periode KKL, DPL wajib memeriksa Laporan Akhir kelompok di menu <strong>Validasi Laporan</strong>. Menekan tombol "Validasi" adalah syarat utama agar form penilaian terbuka.
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-amber-300 text-xs md:text-sm font-semibold text-amber-900 shadow-inner">
                    <span className="text-red-600 font-bold uppercase tracking-wider block mb-1">🚨 Sangat Penting!</span>
                    Setelah Anda menekan tombol Validasi, sebuah pop-up berisi <strong>Magic Link (Tautan Penilaian Mentor)</strong> akan otomatis muncul. Anda <u className="decoration-red-500 decoration-2">wajib meng-copy link tersebut dan mengirimkannya langsung ke Mentor Eksternal</u> agar mereka bisa memberikan nilai dari instansi.
                  </div>
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
