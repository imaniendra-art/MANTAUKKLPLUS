"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import KopSurat from "@/components/KopSurat";


export default function SuratPengantarPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();
  const [pokja, setPokja] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPokja, resSettings] = await Promise.all([
          fetch(`/api/pokja?pokjaId=${id}`),
          fetch(`/api/admin/settings`)
        ]);
        const dataPokja = await resPokja.json();
        const dataSettings = resSettings.ok ? await resSettings.json() : {};
        setPokja(dataPokja);
        setSettings(dataSettings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
  
  const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const currentMonthRoman = romanMonths[new Date().getMonth()];
  const currentYear = new Date().getFullYear();
  const noUrutStr = id ? String(parseInt(id.slice(-4), 16) % 1000).padStart(3, '0') : "001";
  const nomorSurat = `${noUrutStr}/SPIO-KKLPlus/LPPM/${currentMonthRoman}/${currentYear}`;

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
      <div className="bg-white w-[210mm] min-h-[297mm] px-[20mm] pt-[5mm] pb-[20mm] shadow-2xl print:shadow-none print:m-0 font-serif text-[12pt] text-black leading-relaxed">
        
        {/* KOP SURAT */}
        <KopSurat />

        {/* INFO SURAT */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <table className="text-[12pt]">
              <tbody>
                <tr>
                  <td className="pr-4 py-1">Nomor</td>
                  <td className="pr-2">:</td>
                  <td>{nomorSurat}</td>
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
          <div className="text-right whitespace-nowrap ml-4">
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
                <td className="border border-black py-2 px-3 text-center">{pokja.ketua_id?.nim_nidn || "-"}</td>
                <td className="border border-black py-2 px-3 text-center font-bold">Ketua</td>
              </tr>
              {pokja.anggota.filter(a => a.user_id?._id !== pokja.ketua_id?._id).map((member, idx) => (
                <tr key={idx}>
                  <td className="border border-black py-2 px-3 text-center">{idx + 2}</td>
                  <td className="border border-black py-2 px-3">{member.user_id?.nama_lengkap}</td>
                  <td className="border border-black py-2 px-3 text-center">{member.user_id?.nim_nidn || "-"}</td>
                  <td className="border border-black py-2 px-3 text-center">Anggota</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4">
            Kelompok mahasiswa tersebut juga berada di bawah bimbingan Dosen Pembimbing Lapangan (DPL) yaitu <strong>{pokja.dpl_id?.nama_lengkap || "-"}</strong> (No. HP: {pokja.dpl_id?.nomor_hp || "-"}).
          </p>

          <p className="mt-4">
            Kami sangat mengharapkan kesediaan Bapak/Ibu untuk menerima mahasiswa kami. Demikian permohonan ini kami sampaikan, atas perhatian dan kerja sama yang baik kami ucapkan terima kasih.
          </p>
        </div>

        {/* TTD */}
        <div className="mt-16 flex justify-end">
          <div className="w-64 text-center">
            <p className="mb-20">Ketua LPPM,</p>
            <p className="font-bold underline">{settings?.ketua_lppm_nama || 'Dr. Jane Doe, M.Pd'}</p>
            <p>NIDN. {settings?.ketua_lppm_nidn || '0912345678'}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
