"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function SuratTugasPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();
  const [pokja, setPokja] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokja = async () => {
      try {
        const res = await fetch(`/api/pokja?pokjaId=${id}`);
        const data = await res.json();
        setPokja(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPokja();
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center font-bold">Memuat Surat...</div>;
  }

  if (!pokja || pokja.error) {
    return <div className="p-10 text-center font-bold text-red-500">Data Kelompok tidak ditemukan!</div>;
  }

  // Cek kelayakan status
  if (!['disetujui_admin', 'berjalan', 'selesai'].includes(pokja.status_pokja)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Ditolak</h2>
          <p className="text-slate-600 mb-6">Surat Tugas (SK Penugasan) belum diterbitkan karena kelompok Anda belum berstatus Disetujui Admin atau Berjalan.</p>
          <button onClick={() => router.back()} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg w-full">Kembali</button>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="bg-slate-200 min-h-screen py-8 print:py-0 print:bg-white flex justify-center">
      
      {/* Tombol Cetak (Tidak akan ikut terprint karena ada class print:hidden) */}
      <div className="fixed top-8 right-8 print:hidden flex flex-col gap-3">
        <button 
          onClick={() => window.print()} 
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xl flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Simpan / Print PDF
        </button>
        <button 
          onClick={() => router.back()} 
          className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl shadow border border-slate-200 text-center"
        >
          Kembali
        </button>
      </div>

      {/* Kertas A4 */}
      <div className="bg-white w-[210mm] min-h-[297mm] px-[20mm] py-[20mm] shadow-2xl print:shadow-none print:m-0 font-serif text-[12pt] text-black leading-relaxed">
        
        {/* KOP SURAT */}
        <div className="border-b-4 border-black pb-4 mb-1 flex items-center gap-6">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center shrink-0 border border-slate-300">
            <span className="text-xs font-sans text-slate-400">LOGO KAMPUS</span>
          </div>
          <div className="text-center flex-1">
            <h1 className="font-bold text-[14pt] tracking-wide uppercase">Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi</h1>
            <h2 className="font-bold text-[16pt] uppercase mt-1">Universitas Contoh Indonesia</h2>
            <h3 className="font-bold text-[12pt] mt-1">Lembaga Penelitian dan Pengabdian kepada Masyarakat (Admin)</h3>
            <p className="text-[10pt] mt-2">Jl. Pendidikan No. 1, Kota Akademik 12345, Telp. (021) 123456</p>
            <p className="text-[10pt]">Laman: www.contoh.ac.id | Email: lppm@contoh.ac.id</p>
          </div>
        </div>
        <div className="border-b border-black mb-8"></div>

        {/* JUDUL SURAT */}
        <div className="text-center mb-8">
          <h1 className="font-bold text-[14pt] underline">SURAT TUGAS PELAKSANAAN KKL PLUS</h1>
          <p>Nomor: ..... /UN.../Admin/KKL-TUGAS/{new Date().getFullYear()}</p>
        </div>

        {/* ISI SURAT */}
        <div className="space-y-4 text-justify">
          <p>
            Ketua Lembaga Penelitian dan Pengabdian kepada Masyarakat (Admin) Universitas Contoh Indonesia, dengan ini memberikan tugas kepada:
          </p>

          <table className="w-full mt-4 border-collapse border border-black text-[11pt]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black py-2 px-3 w-12 text-center">No</th>
                <th className="border border-black py-2 px-3">Nama Mahasiswa</th>
                <th className="border border-black py-2 px-3 w-32 text-center">NIM</th>
                <th className="border border-black py-2 px-3 text-center">Tugas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black py-2 px-3 text-center">1</td>
                <td className="border border-black py-2 px-3 font-bold">{pokja.ketua_id?.nama_lengkap}</td>
                <td className="border border-black py-2 px-3 text-center">{pokja.ketua_id?.nim || "-"}</td>
                <td className="border border-black py-2 px-3 text-center font-bold">Ketua Kelompok</td>
              </tr>
              {pokja.anggota.filter(a => a.user_id?._id !== pokja.ketua_id?._id).map((member, idx) => (
                <tr key={idx}>
                  <td className="border border-black py-2 px-3 text-center">{idx + 2}</td>
                  <td className="border border-black py-2 px-3">{member.user_id?.nama_lengkap}</td>
                  <td className="border border-black py-2 px-3 text-center">{member.user_id?.nim || "-"}</td>
                  <td className="border border-black py-2 px-3 text-center">Anggota Kelompok</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4">
            Untuk melaksanakan kegiatan Kuliah Kerja Lapangan (KKL) Plus Tahun Akademik {new Date().getFullYear()}/{new Date().getFullYear() + 1} di lokasi Mitra:
          </p>

          <table className="text-[12pt] ml-4 mt-2">
            <tbody>
              <tr>
                <td className="pr-4 py-1">Nama Mitra</td>
                <td className="pr-2">:</td>
                <td className="font-bold">{pokja.mitra_id?.nama_instansi}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1 align-top">Alamat Lokasi</td>
                <td className="pr-2 align-top">:</td>
                <td>{pokja.mitra_id?.alamat_lengkap}, Kec. {pokja.mitra_id?.kecamatan}, {pokja.mitra_id?.kabupaten_kota}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1">Dosen Pembimbing</td>
                <td className="pr-2">:</td>
                <td className="font-bold">{pokja.dpl_id?.nama_lengkap || "Belum Ditentukan"}</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-4">
            Surat tugas ini berlaku selama mahasiswa melaksanakan kegiatan di lokasi mitra yang bersangkutan. Mahasiswa diwajibkan untuk menjaga nama baik almamater, mematuhi peraturan yang berlaku di instansi mitra, serta melaporkan hasil kegiatannya kepada Admin.
          </p>
          <p>
            Demikian surat tugas ini dibuat agar dapat dilaksanakan dengan penuh tanggung jawab.
          </p>
        </div>

        {/* TTD */}
        <div className="mt-16 flex justify-end">
          <div className="w-64 text-center">
            <p className="mb-1">Dikeluarkan di: Kota Akademik</p>
            <p className="mb-20">Pada Tanggal: {currentDate}</p>
            <p className="font-bold underline">Prof. Dr. Akademisi Hebat, M.Si.</p>
            <p>NIP. 19800101 200501 1 001</p>
          </div>
        </div>

      </div>
    </div>
  );
}
