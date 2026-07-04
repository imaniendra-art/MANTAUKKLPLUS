"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CetakTranskrip() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/laporan-akhir?mhsId=${session.user.id}`)
        .then(res => res.json())
        .then(d => {
          if (d.laporan && d.pengajuan) {
            setData(d);
          }
        });
    }
  }, [session]);

  if (!data) return <div className="p-10 text-center">Memuat Transkrip...</div>;

  const { laporan, pengajuan } = data;
  const mhs = session.user;
  const mitra = pengajuan.mitra_id?.nama_perusahaan || pengajuan.detail_tempat?.nama;
  const mataKuliah = pengajuan.paket_matkul_id?.mata_kuliah || [];

  // URL validasi untuk QR Code
  const verifyUrl = `http://localhost:3020/verify/${laporan._id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  const totalSKS = mataKuliah.reduce((sum, mk) => sum + (mk.sks || 0), 0);

  return (
    <div className="bg-slate-200 min-h-screen font-serif text-black p-8 print:p-0">
      
      {/* Tombol Print (Sembunyi saat diprint) */}
      <div className="fixed top-5 right-5 print:hidden">
        <button onClick={() => window.print()} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700">
          🖨️ Cetak Transkrip (A4)
        </button>
      </div>

      {/* Kontainer Kertas A4 */}
      <div className="max-w-[21cm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none p-[2cm] min-h-[29.7cm]">
        
        {/* KOP SURAT */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-8">
          <div className="flex items-center gap-4">
            <img src="/mk.png" alt="Logo" className="h-20" />
            <div>
              <h1 className="text-xl font-bold uppercase">Program Studi Manajemen</h1>
              <h2 className="text-lg font-bold uppercase">STIMI YAPMI Makassar</h2>
              <p className="text-sm">Jl. Printis Kemerdekaan, Kota Makassar</p>
            </div>
          </div>
          <div>
            <img src={qrCodeUrl} alt="QR Code SKPI" className="w-20 h-20 border border-slate-300 p-1" />
            <p className="text-[10px] text-center mt-1">Validasi SKPI</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center uppercase mb-8 decoration-solid underline underline-offset-4">
          Transkrip Konversi Nilai KKL Plus
        </h2>

        {/* DATA MAHASISWA */}
        <table className="w-full mb-8 text-sm">
          <tbody>
            <tr>
              <td className="w-40 font-bold py-1">Nama Mahasiswa</td>
              <td className="w-4">:</td>
              <td className="uppercase">{mhs.nama_lengkap}</td>
            </tr>
            <tr>
              <td className="w-40 font-bold py-1">NIM</td>
              <td className="w-4">:</td>
              <td>{mhs.nim_nidn}</td>
            </tr>
            <tr>
              <td className="w-40 font-bold py-1">Program KKL Plus</td>
              <td className="w-4">:</td>
              <td>KKL Plus Berdampak Berbasis OBE</td>
            </tr>
            <tr>
              <td className="w-40 font-bold py-1">Lokasi KKL Plus</td>
              <td className="w-4">:</td>
              <td className="uppercase font-bold">{mitra}</td>
            </tr>
          </tbody>
        </table>

        {/* TABEL NILAI */}
        <table className="w-full border-collapse border border-black text-sm mb-8 text-center">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black py-2 px-3">No</th>
              <th className="border border-black py-2 px-3">Kode MK</th>
              <th className="border border-black py-2 px-3 text-left">Nama Mata Kuliah</th>
              <th className="border border-black py-2 px-3">SKS</th>
              <th className="border border-black py-2 px-3">Nilai Angka</th>
              <th className="border border-black py-2 px-3">Nilai Huruf</th>
            </tr>
          </thead>
          <tbody>
            {mataKuliah.map((mk, idx) => (
              <tr key={idx}>
                <td className="border border-black py-2 px-3">{idx + 1}</td>
                <td className="border border-black py-2 px-3">{mk.kode}</td>
                <td className="border border-black py-2 px-3 text-left">{mk.nama}</td>
                <td className="border border-black py-2 px-3">{mk.sks}</td>
                <td className="border border-black py-2 px-3 font-bold">90.00</td>
                <td className="border border-black py-2 px-3 font-bold text-lg">A</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold">
              <td colSpan="3" className="border border-black py-2 px-3 text-right">Total SKS Diakui</td>
              <td className="border border-black py-2 px-3 text-center">{totalSKS}</td>
              <td colSpan="2" className="border border-black py-2 px-3">PREDIKAT: SANGAT BAIK</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-sm text-justify mb-8 leading-relaxed">
          <p><strong>Keterangan:</strong> Nilai A (Sangat Baik) diberikan berdasarkan akumulasi capaian kinerja dari seluruh aktivitas KKL Plus (Logbook Harian) yang telah divalidasi oleh Mentor Industri dan Dosen Pembimbing Lapangan, serta memenuhi seluruh indikator Capaian Pembelajaran Mata Kuliah (CPMK) yang telah disepakati di awal program (Outcome-Based Education).</p>
        </div>

        {/* TANDA TANGAN */}
        <div className="w-full flex justify-end">
          <div className="text-center w-64 text-sm">
            <p className="mb-16">Makassar, {new Date(pengajuan.tanggal_selesai).toLocaleDateString('id-ID')}</p>
            <div className="border-b border-black w-full mb-2"></div>
            <p className="font-bold uppercase">Ketua Program Studi</p>
          </div>
        </div>

      </div>
    </div>
  );
}
