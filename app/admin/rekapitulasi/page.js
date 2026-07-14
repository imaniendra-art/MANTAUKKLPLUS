"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Search, Download, Award, CheckCircle, Clock } from "lucide-react";
import * as XLSX from 'xlsx';

export default function RekapitulasiNilai() {
  const { data: session } = useSession();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, lengkap, belum

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rekapitulasi");
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    const matchSearch = 
      item.mahasiswa_id?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mahasiswa_id?.nim_nidn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pokja_id?.nama_pokja?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const isLengkap = item.dpl_sudah_menilai && item.mentor_sudah_menilai;
    const matchStatus = 
      filterStatus === "all" ? true :
      filterStatus === "lengkap" ? isLengkap :
      !isLengkap;

    return matchSearch && matchStatus;
  });

  const exportToExcel = () => {
    const exportData = filteredData.map((item, index) => ({
      "No": index + 1,
      "NIM": item.mahasiswa_id?.nim_nidn || "-",
      "Nama Mahasiswa": item.mahasiswa_id?.nama_lengkap || "-",
      "Program Studi": item.mahasiswa_id?.program_studi || "-",
      "Kelompok (Pokja)": item.pokja_id?.nama_pokja || "-",
      "Mitra / Tempat KKL": item.pokja_id?.mitra_id?.nama_instansi || "-",
      "Dosen Pembimbing": item.pokja_id?.dpl_id?.nama_lengkap || "-",
      "Nilai DPL (80%)": ((item.nilai_dpl_kelompok + item.nilai_dpl_individu) / 2).toFixed(2),
      "Nilai Mentor (20%)": ((item.nilai_mentor_kelompok + item.nilai_mentor_individu) / 2).toFixed(2),
      "Nilai Akhir (Angka)": item.nilai_akhir_angka?.toFixed(2) || 0,
      "Nilai Akhir (Huruf)": item.nilai_akhir_huruf || "-",
      "Status Penilaian": (item.dpl_sudah_menilai && item.mentor_sudah_menilai) ? "Lengkap" : "Belum Lengkap"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap_Nilai");
    XLSX.writeFile(wb, "Rekapitulasi_Nilai_KKL_Plus.xlsx");
  };

  return (
    <DashboardLayout title="Rekapitulasi Nilai">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header & Controls */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-6 h-6 text-teal-600" />
              Master Data Nilai
            </h2>
            <p className="text-slate-500 text-sm mt-1">Pemantauan dan rekapitulasi nilai akhir seluruh mahasiswa KKL Plus.</p>
          </div>
          <button 
            onClick={exportToExcel}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari NIM, Nama, atau Kelompok..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-4 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none min-w-[200px]"
          >
            <option value="all">Semua Status</option>
            <option value="lengkap">Nilai Lengkap (Selesai)</option>
            <option value="belum">Belum Lengkap</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Mahasiswa</th>
                <th className="px-6 py-4">Kelompok & Mitra</th>
                <th className="px-6 py-4 text-center">Nilai DPL<br/><span className="text-[10px] font-normal text-slate-400">(80%)</span></th>
                <th className="px-6 py-4 text-center">Nilai Mentor<br/><span className="text-[10px] font-normal text-slate-400">(20%)</span></th>
                <th className="px-6 py-4 text-center">Nilai Akhir</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      Memuat data nilai...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                    Tidak ada data yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const mhs = item.mahasiswa_id || {};
                  const pokja = item.pokja_id || {};
                  const isLengkap = item.dpl_sudah_menilai && item.mentor_sudah_menilai;
                  
                  const dplTotal = ((item.nilai_dpl_kelompok + item.nilai_dpl_individu) / 2).toFixed(1);
                  const mentorTotal = ((item.nilai_mentor_kelompok + item.nilai_mentor_individu) / 2).toFixed(1);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{mhs.nama_lengkap || '-'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{mhs.nim_nidn || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700 text-xs bg-slate-100 px-2 py-0.5 rounded inline-block mb-1">
                          {pokja.nama_pokja || 'Tanpa Kelompok'}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]" title={pokja.mitra_id?.nama_instansi}>
                          {pokja.mitra_id?.nama_instansi || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.dpl_sudah_menilai ? (
                          <span className="font-bold text-slate-700">{dplTotal}</span>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Menunggu</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.mentor_sudah_menilai ? (
                          <span className="font-bold text-slate-700">{mentorTotal}</span>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Menunggu</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-lg font-black text-teal-700">{item.nilai_akhir_angka?.toFixed(2) || '0.00'}</span>
                          <span className="text-xs font-bold px-2 py-0.5 bg-teal-100 text-teal-800 rounded mt-1 shadow-sm">
                            Grade: {item.nilai_akhir_huruf || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isLengkap ? (
                          <div className="flex items-center justify-center gap-1.5 text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 text-xs font-bold">
                            <CheckCircle className="w-3.5 h-3.5" /> Selesai
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 text-xs font-bold">
                            <Clock className="w-3.5 h-3.5" /> Proses
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
