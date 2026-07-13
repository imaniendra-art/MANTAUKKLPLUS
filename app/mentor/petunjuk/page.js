"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Eye } from "lucide-react";

export default function PetunjukMentor() {
  return (
    <DashboardLayout title="Petunjuk & Panduan Mentor">
      <div className="space-y-6 pb-12 mt-6">
        {/* Banner Penjelasan */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-4 flex items-center gap-3">
              <span>👋</span> Selamat Datang, Mentor!
            </h1>
            <div className="space-y-4 text-teal-50 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
              <p>
                Sebagai <strong>Mentor Industri</strong>, Anda adalah ujung tombak dalam membimbing mahasiswa mempraktikkan ilmu mereka di dunia nyata. Program <strong>KKL Plus Berdampak</strong> ini dirancang bukan sekadar untuk menjadikan mahasiswa sebagai tenaga bantuan administratif, melainkan agar mereka mampu memberikan <em>dampak nyata</em> melalui proyek inovasi dan penyelesaian masalah di instansi Anda.
              </p>
              <div className="bg-white/10 rounded-xl p-5 mt-4 border border-white/20">
                <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                  <span>📌</span> Peran Utama Anda:
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Memberikan arahan dan tugas yang relevan dengan target indikator mahasiswa.</li>
                  <li>Membuka ruang diskusi dan merespons inisiatif ide yang diajukan oleh mahasiswa.</li>
                  <li><strong>Memvalidasi (Menyetujui/Menolak) Logbook Harian</strong> mahasiswa secara objektif melalui menu Validasi Logbook.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
