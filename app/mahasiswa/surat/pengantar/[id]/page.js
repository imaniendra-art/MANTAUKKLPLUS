"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function SuratPengantarPage({ params }) {
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
            <h3 className="font-bold text-[12pt] mt-1">Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM)</h3>
            <p className="text-[10pt] mt-2">Jl. Pendidikan No. 1, Kota Akademik 12345, Telp. (021) 123456</p>
            <p className="text-[10pt]">Laman: www.contoh.ac.id | Email: lppm@contoh.ac.id</p>
          </div>
        </div>
        <div className="border-b border-black mb-8"></div>

        {/* INFO SURAT */}
        <div className="flex justify-between mb-8">
          <div>
            <table className="text-[12pt]">
              <tbody>
                <tr>
                  <td className="pr-4 py-1">Nomor</td>
                  <td className="pr-2">:</td>
                  <td>..... /UN.../LPPM/KKL/{new Date().getFullYear()}</td>
                </tr>
                <tr>
                  <td className="pr-4 py-1">Lampiran</td>
                  <td className="pr-2">:</td>
                  <td>1 (Satu) Berkas</td>
                </tr>
                <tr>
                  <td className="pr-4 py-1">Perihal</td>
                  <td className="pr-2">:</td>
                  <td className="font-bold">Permohonan Izin Observasi & Penjajakan Lokasi KKL Plus</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-right">
            <p>{currentDate}</p>
          </div>
        </div>

        {/* TUJUAN */}
        <div className="mb-8">
          <p>Yth. Pimpinan/Penanggung Jawab</p>
          <p className="font-bold">{pokja.mitra_id?.nama_instansi || "Nama Instansi Mitra"}</p>
          <p>di Tempat</p>
        </div>

        {/* ISI SURAT */}
        <div className="space-y-4 text-justify">
          <p>
            Dengan hormat,
          </p>
          <p>
            Dalam rangka pelaksanaan kegiatan Kuliah Kerja Lapangan (KKL) Plus bagi mahasiswa Universitas Contoh Indonesia sebagai bentuk pengabdian kepada masyarakat dan implementasi Tri Dharma Perguruan Tinggi, kami memohon bantuan Bapak/Ibu untuk dapat menerima mahasiswa kami melakukan kegiatan <strong>observasi dan penjajakan lokasi</strong> di instansi yang Bapak/Ibu pimpin.
          </p>
          <p>
            Kegiatan observasi ini bertujuan untuk mencari data awal, mendiskusikan potensi program kerja (proker), serta mengurus kelengkapan administrasi penerimaan (Surat Balasan / <i>Letter of Acceptance</i>) sebelum kegiatan KKL Plus resmi dimulai.
          </p>
          <p>
            Adapun mahasiswa yang akan melaksanakan observasi tersebut adalah kelompok <strong>{pokja.nama_pokja}</strong> yang terdiri dari:
          </p>

          <table className="w-full mt-4 border-collapse border border-black text-[11pt]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black py-2 px-3 w-12 text-center">No</th>
                <th className="border border-black py-2 px-3">Nama Mahasiswa</th>
                <th className="border border-black py-2 px-3 w-32 text-center">NIM</th>
                <th className="border border-black py-2 px-3 text-center">Status POKJA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black py-2 px-3 text-center">1</td>
                <td className="border border-black py-2 px-3 font-bold">{pokja.ketua_id?.nama_lengkap}</td>
                <td className="border border-black py-2 px-3 text-center">{pokja.ketua_id?.nim || "-"}</td>
                <td className="border border-black py-2 px-3 text-center font-bold">Ketua</td>
              </tr>
              {pokja.anggota.filter(a => a.user_id?._id !== pokja.ketua_id?._id).map((member, idx) => (
                <tr key={idx}>
                  <td className="border border-black py-2 px-3 text-center">{idx + 2}</td>
                  <td className="border border-black py-2 px-3">{member.user_id?.nama_lengkap}</td>
                  <td className="border border-black py-2 px-3 text-center">{member.user_id?.nim || "-"}</td>
                  <td className="border border-black py-2 px-3 text-center">Anggota</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4">
            Kami sangat mengharapkan kesediaan Bapak/Ibu untuk menerima mahasiswa kami. Demikian permohonan ini kami sampaikan, atas perhatian dan kerja sama yang baik kami ucapkan terima kasih.
          </p>
        </div>

        {/* TTD */}
        <div className="mt-16 flex justify-end">
          <div className="w-64 text-center">
            <p className="mb-20">Ketua LPPM,</p>
            <p className="font-bold underline">Prof. Dr. Akademisi Hebat, M.Si.</p>
            <p>NIP. 19800101 200501 1 001</p>
          </div>
        </div>

      </div>
    </div>
  );
}
