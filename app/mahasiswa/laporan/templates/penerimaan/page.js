"use client";

import { useEffect, useState } from 'react';
import { useSession } from "@/components/AuthProvider";

export default function CetakPenerimaan() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const mhsId = params.get('mhsId') || session?.user?.id;

    if (id) {
      fetch(`/api/laporan-akhir?id=${id}`)
        .then(res => res.json())
        .then(d => {
          if (d.pengajuan) {
            setData({
              pengajuan: d.pengajuan,
              laporan: d.laporan || d.laporan_kelompok || d.laporan_individu || {}
            });
          }
        });
    } else if (mhsId) {
      fetch(`/api/laporan-akhir?mhsId=${mhsId}`)
        .then(res => res.json())
        .then(d => {
          if (d.pengajuan) {
            setData({
              pengajuan: d.pengajuan,
              laporan: d.laporan || d.laporan_kelompok || d.laporan_individu || {}
            });
          }
        });
    }
  }, [session]);

  if (!data) return <div className="p-10 text-center">Memuat dokumen...</div>;

  const { pengajuan } = data;
  const mhs = session.user;
  const mitra = pengajuan.mitra_id?.nama_perusahaan || pengajuan.detail_tempat?.nama || ".......................................................";
  const alamatMitra = pengajuan.detail_tempat?.alamat || ".......................................................";

  return (
    <div className="bg-slate-200 min-h-screen font-serif text-black">
      <div className="fixed top-5 right-5 print:hidden">
        <button onClick={() => window.print()} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700">
          🖨️ Cetak PDF
        </button>
        <p className="mt-2 text-xs text-center text-slate-500 bg-white p-2 rounded shadow">Gunakan Kop Surat Perusahaan Jika Ada</p>
      </div>

      <div className="max-w-[21cm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none">
        <div className="px-[3cm] pb-[3cm] pt-[1.5cm] min-h-[29.7cm] print:px-[2.5cm] print:pb-[2.5cm] print:pt-[1cm]">
          
          {/* KOP SURAT PERUSAHAAN (KOSONGAN/GENERIC) */}
          <div className="border-b-4 border-black pb-4 mb-8 text-center min-h-24 flex items-center justify-center">
            <h1 className="text-3xl font-black uppercase tracking-wider text-slate-300">KOP INSTANSI</h1>
          </div>

          <div className="flex justify-between mb-8">
            <div>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-24">Nomor</td>
                    <td className="w-4">:</td>
                    <td>......../............/............/20....</td>
                  </tr>
                  <tr>
                    <td>Lampiran</td>
                    <td>:</td>
                    <td>-</td>
                  </tr>
                  <tr>
                    <td>Perihal</td>
                    <td>:</td>
                    <td className="font-bold underline">Surat Balasan Penerimaan KKL Plus</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p>................., ............................</p>
            </div>
          </div>

          <div className="mb-8">
            <p>Kepada Yth,</p>
            <p className="font-bold">Ketua STIMI YAPMI Makassar</p>
            <p>di - Tempat</p>
          </div>

          <div className="text-justify leading-relaxed space-y-4 mb-8">
            <p>Dengan hormat,</p>
            <p>
              Menindaklanjuti Surat Permohonan Izin KKL Plus dari STIMI YAPMI Makassar, maka dengan ini kami sampaikan bahwa kami <strong>menerima</strong> mahasiswa tersebut di bawah ini untuk melaksanakan kegiatan KKL Plus di tempat kami:
            </p>
            
            <table className="w-full ml-4 mb-2">
              <tbody>
                <tr>
                  <td className="w-48 align-top">Nama</td>
                  <td className="w-4 align-top">:</td>
                  <td className="font-bold uppercase">{mhs?.nama_lengkap || "......................................................."}</td>
                </tr>
                <tr>
                  <td className="align-top">NIM</td>
                  <td className="align-top">:</td>
                  <td>{mhs?.nim_nidn || "......................................................."}</td>
                </tr>
                <tr>
                  <td className="align-top">Program Studi</td>
                  <td className="align-top">:</td>
                  <td>Manajemen</td>
                </tr>
              </tbody>
            </table>

            <p>
              Kegiatan KKL Plus akan dilaksanakan mulai tanggal <strong>..........................</strong> sampai dengan <strong>..........................</strong>. Selama pelaksanaannya, kami berharap mahasiswa tersebut dapat memberikan kontribusi nyata yang bermanfaat dan berdampak positif bagi instansi kami.
            </p>
            <p>
              Demikian surat balasan penerimaan KKL Plus ini kami sampaikan agar dapat dipergunakan sebagaimana mestinya. Atas kerja sama yang baik kami ucapkan terima kasih.
            </p>
          </div>

          <div className="flex justify-end mt-16 text-center">
            <div className="w-1/2">
              <p className="mb-24">Hormat Kami,</p>
              <p className="font-bold underline">(..................................................)</p>
              <p>Pimpinan / HRD</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
