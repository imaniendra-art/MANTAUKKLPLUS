"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CetakPengantar() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [posisiData, setPosisiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const posisiId = urlParams.get('posisiId');
    const pengajuanId = urlParams.get('pengajuanId');
    const mhsId = urlParams.get('mhsId') || session?.user?.id;

    if (id) {
      fetch(`/api/laporan-akhir?id=${id}`)
        .then(res => res.json())
        .then(d => {
          if (d.laporan && d.pengajuan) {
            setData(d);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (pengajuanId) {
      // Jika ada pengajuanId (dari dashboard admin / mhs yang sudah disetujui)
      fetch(`/api/pengajuan?pengajuanId=${pengajuanId}`)
        .then(res => res.json())
        .then(d => {
          if (d) setData({ pengajuan: d });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (posisiId) {
      // Fetch specific posisi data for preview during application
      fetch(`/api/posisi?posisiId=${posisiId}`)
        .then(res => res.json())
        .then(d => {
          setPosisiData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (mhsId) {
      // Fetch existing pengajuan data for after application (fallback)
      fetch(`/api/laporan-akhir?mhsId=${mhsId}`)
        .then(res => res.json())
        .then(d => {
          if (d.laporan && d.pengajuan) {
            setData(d);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) return <div className="p-10 text-center">Memuat dokumen...</div>;
  if (!data && !posisiData) return <div className="p-10 text-center text-red-500 font-bold">Data tidak ditemukan. Pastikan Anda sudah login dan memiliki data pengajuan/posisi.</div>;

  // Jika data.pengajuan.mahasiswa_id ada (populate dari DB), gunakan itu. Jika tidak ada, gunakan session.
  const mhs = data?.pengajuan?.mahasiswa_id || session?.user;
  let mitra = ".......................................................";
  let alamatMitra = ".......................................................";
  let tanggalMulai = new Date();
  let tanggalSelesai = new Date();
  let namaDpl = "........................................";
  let noHpDpl = "....................";
  let nomorSurat = "......../STIMI/................/20....";
  let tanggalSurat = "............................";

  if (posisiData) {
    mitra = posisiData.mitra_id?.nama_instansi || ".......................................................";
    alamatMitra = posisiData.mitra_id?.alamat || ".......................................................";
    // Default to current date and 3 months later if not yet submitted
    tanggalSelesai.setMonth(tanggalSelesai.getMonth() + 3);
  } else if (data?.pengajuan) {
    mitra = data.pengajuan.mitra_id?.nama_perusahaan || data.pengajuan.detail_tempat?.nama || ".......................................................";
    alamatMitra = data.pengajuan.detail_tempat?.alamat || ".......................................................";
    tanggalMulai = new Date(data.pengajuan.tanggal_mulai || new Date());
    tanggalSelesai = new Date(data.pengajuan.tanggal_selesai || new Date(tanggalMulai).setMonth(tanggalMulai.getMonth() + 3));
    if (data.pengajuan.dpl_id) {
       namaDpl = data.pengajuan.dpl_id.nama_lengkap || "........................................";
       noHpDpl = data.pengajuan.dpl_id.nomor_hp || "....................";
    }
    if (data.pengajuan.nomor_surat_pengantar) {
       nomorSurat = data.pengajuan.nomor_surat_pengantar;
    }
    
    if (data.pengajuan.updatedAt) {
      tanggalSurat = new Date(data.pengajuan.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
      tanggalSurat = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

  return (
    <div className="bg-slate-200 min-h-screen font-serif text-black text-[11pt]">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
      <div className="fixed top-5 right-5 print:hidden">
        <button onClick={() => window.print()} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700">
          🖨️ Cetak PDF
        </button>
      </div>

      <div className="max-w-[21cm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none">
        <div className="p-[2.5cm] min-h-[29.7cm] print:p-[1.5cm] print:min-h-0">
          
          {/* KOP SURAT KAMPUS */}
          <div className="border-b-[3px] border-black pb-3 mb-3 text-center flex items-center justify-center gap-5">
            <img src="/logo_stimi.png" alt="Logo" className="h-20 object-contain" />
            <div className="text-center">
              <h1 className="text-lg font-black uppercase tracking-wider">SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR</h1>
              <p className="text-xs mt-1">Jl. Perintis Kemerdekaan No.KM. 9, Tamalanrea, Makassar | Website: www.stimi-yapmi.ac.id | Email: info@stimi-yapmi.ac.id</p>
            </div>
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-24">Nomor</td>
                    <td className="w-4">:</td>
                    <td>{nomorSurat}</td>
                  </tr>
                  <tr>
                    <td>Lampiran</td>
                    <td>:</td>
                    <td>1 (Satu) Berkas</td>
                  </tr>
                  <tr>
                    <td>Perihal</td>
                    <td>:</td>
                    <td className="font-bold underline">Permohonan Izin KKL Plus Berdampak</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p>Makassar, {tanggalSurat}</p>
            </div>
          </div>

          <div className="mb-4">
            <p>Kepada Yth,</p>
            <p className="font-bold">Pimpinan {mitra}</p>
            <p>{alamatMitra}</p>
            <p>di - Tempat</p>
          </div>

          <div className="text-justify leading-relaxed space-y-3 mb-6">
            <p>Dengan hormat,</p>
            <p>
              Dalam rangka meningkatkan pemahaman praktis dan kompetensi mahasiswa di dunia kerja nyata, maka kami memohon kesediaan Bapak/Ibu untuk dapat menerima mahasiswa kami melaksanakan kegiatan <strong>KKL Plus Berdampak</strong> di instansi/perusahaan yang Bapak/Ibu pimpin.
            </p>
            <p>
              <strong>KKL Plus Berdampak</strong> adalah program unggulan kami yang dirancang agar mahasiswa tidak hanya sekadar belajar, tetapi juga didorong untuk memberikan kontribusi nyata. Kami sangat berharap kehadiran mahasiswa KKL Plus kami di tempat Bapak/Ibu dapat memberikan dampak yang positif, inovatif, dan bermanfaat secara langsung bagi instansi/perusahaan yang Bapak/Ibu pimpin.
            </p>
            <p>Adapun mahasiswa yang bersangkutan adalah:</p>
            
            <table className="w-full border-collapse border border-black mt-2 mb-2">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="border border-black p-2 w-10">No</th>
                  <th className="border border-black p-2 w-[35%]">Nama / NIM</th>
                  <th className="border border-black p-2 w-[25%]">Program Studi / Konsentrasi</th>
                  <th className="border border-black p-2 w-[35%]">Dosen Pembimbing (DPL)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 text-center">1</td>
                  <td className="border border-black p-2">
                    <strong className="whitespace-nowrap">{mhs.nama_lengkap}</strong><br/>
                    {mhs.nim_nidn}
                  </td>
                  <td className="border border-black p-2 text-center">
                    S1 Manajemen<br/>
                    {mhs.konsentrasi || '-'}
                  </td>
                  <td className="border border-black p-2">
                    <strong className="whitespace-nowrap">{namaDpl}</strong><br/>
                    WA: {noHpDpl}
                  </td>
                </tr>
              </tbody>
            </table>

            <p>
              Rencana pelaksanaan kegiatan KKL Plus ini akan dilaksanakan selama <strong>4 (empat) bulan</strong>, terhitung mulai bulan <strong>{tanggalMulai.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</strong> sampai dengan <strong>{tanggalSelesai.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</strong>.
            </p>
            <p>
              Demikian surat permohonan ini kami sampaikan, atas perhatian dan kerjasama yang baik dari Bapak/Ibu kami ucapkan terima kasih.
            </p>
          </div>

          <div className="flex justify-end mt-4 text-center">
            <div className="w-1/2">
              <p>Ketua Program Studi Manajemen,</p>
              <p className="mb-12 mt-2 text-sm text-slate-400">(Stempel & Tanda Tangan)</p>
              <p className="font-bold underline">....................................................</p>
              <p>NIDN. ....................................</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
