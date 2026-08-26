"use client";

import { useEffect, useState } from 'react';
import { useSession } from "@/components/AuthProvider";
import KopSurat from "@/components/KopSurat";

export default function CetakPengantar() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [posisiData, setPosisiData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch settings for Kaprodi TTD
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(d => setSettings(d))
      .catch(err => console.error(err));

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const pokjaId = urlParams.get('pokjaId') || urlParams.get('pengajuanId');
    const posisiId = urlParams.get('posisiId');
    const mhsId = urlParams.get('mhsId') || session?.user?.id;

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
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (pokjaId) {
      fetch(`/api/pokja?pokjaId=${pokjaId}`)
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
          if (d.pengajuan) {
            setData({
              pengajuan: d.pengajuan,
              laporan: d.laporan || d.laporan_kelompok || d.laporan_individu || {}
            });
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
  if (!settings) return <div className="p-10 text-center">Memuat pengaturan...</div>;

  let mitra = ".......................................................";
  let alamatMitra = ".......................................................";
  let tanggalMulai = new Date();
  let tanggalSelesai = new Date();
  let namaDpl = "........................................";
  let noHpDpl = "....................";
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const idStr = urlParams.get('id') || urlParams.get('pengajuanId') || urlParams.get('pokjaId') || urlParams.get('posisiId') || '';
  const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const currentMonthRoman = romanMonths[new Date().getMonth()];
  const currentYear = new Date().getFullYear();
  const noUrutStr = idStr ? String(parseInt(idStr.slice(-4), 16) % 1000).padStart(3, '0') : "001";
  
  let nomorSurat = `${noUrutStr}/PI-KKLPlus/STIMI/${currentMonthRoman}/${currentYear}`;
  let tanggalSurat = "............................";

  if (posisiData) {
    mitra = posisiData.mitra_id?.nama_instansi || ".......................................................";
    alamatMitra = posisiData.mitra_id?.alamat_lengkap || ".......................................................";
    // Default to current date and 2 months later if not yet submitted
    tanggalSelesai.setMonth(tanggalSelesai.getMonth() + 2);
  } else if (data?.pengajuan) {
    mitra = data.pengajuan.mitra_id?.nama_instansi || data.pengajuan.detail_tempat?.nama || ".......................................................";
    alamatMitra = data.pengajuan.mitra_id?.alamat_lengkap || data.pengajuan.detail_tempat?.alamat || ".......................................................";
    tanggalMulai = new Date(data.pengajuan.tanggal_mulai || new Date());
    tanggalSelesai = new Date(data.pengajuan.tanggal_selesai || new Date(tanggalMulai).setMonth(tanggalMulai.getMonth() + 2));
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

  // Kumpulkan seluruh anggota Pokja (Ketua + Anggota)
  let daftarMahasiswa = [];

  if (data?.pengajuan) {
    const pengajuan = data.pengajuan;
    const ketua = pengajuan.ketua_id && typeof pengajuan.ketua_id === 'object' ? pengajuan.ketua_id : null;
    const ketuaIdStr = ketua?._id ? ketua._id.toString() : (typeof pengajuan.ketua_id === 'string' ? pengajuan.ketua_id : null);

    if (ketua && ketua.nama_lengkap) {
      daftarMahasiswa.push({
        _id: ketua._id?.toString() || 'ketua',
        nama_lengkap: ketua.nama_lengkap,
        nim_nidn: ketua.nim_nidn,
        program_studi: ketua.program_studi || 'S1 Manajemen',
        konsentrasi: ketua.konsentrasi || '-',
        peran: 'Ketua'
      });
    }

    if (Array.isArray(pengajuan.anggota)) {
      pengajuan.anggota.forEach((ang, idx) => {
        const u = ang.user_id && typeof ang.user_id === 'object' ? ang.user_id : null;
        if (u && u.nama_lengkap) {
          const uIdStr = u._id?.toString();
          const alreadyInList = daftarMahasiswa.some(m => (m.nim_nidn && m.nim_nidn === u.nim_nidn) || (uIdStr && m._id === uIdStr));
          
          if (!alreadyInList && (!ang.status_undangan || ang.status_undangan === 'bergabung')) {
            daftarMahasiswa.push({
              _id: uIdStr || (ang._id ? ang._id.toString() : `anggota-${idx}`),
              nama_lengkap: u.nama_lengkap,
              nim_nidn: u.nim_nidn,
              program_studi: u.program_studi || 'S1 Manajemen',
              konsentrasi: u.konsentrasi || '-',
              peran: 'Anggota'
            });
          }
        }
      });
    }
  }

  // Fallback jika daftar mahasiswa masih kosong (misal preview posisi individu)
  if (daftarMahasiswa.length === 0) {
    const fallbackUser = data?.pengajuan?.mahasiswa_id || session?.user;
    if (fallbackUser) {
      daftarMahasiswa.push({
        _id: fallbackUser._id?.toString() || 'user',
        nama_lengkap: fallbackUser.nama_lengkap || fallbackUser.name || '........................................',
        nim_nidn: fallbackUser.nim_nidn || '....................',
        program_studi: fallbackUser.program_studi || 'S1 Manajemen',
        konsentrasi: fallbackUser.konsentrasi || '-',
        peran: 'Mahasiswa'
      });
    }
  }

  const bulanMulaiStr = tanggalMulai ? tanggalMulai.toLocaleDateString('id-ID', { month: 'long' }) : 'September';
  const bulanSelesaiStr = tanggalSelesai ? tanggalSelesai.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : `Desember ${currentYear}`;

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
        <div className="p-[1.5cm] min-h-[29.7cm] print:p-[1cm] print:min-h-0">
          
          {/* KOP SURAT KAMPUS */}
          <KopSurat />

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

          <div className="text-justify leading-relaxed space-y-3 mb-2">
            <p>Dengan hormat,</p>
            <p>
              Dalam rangka meningkatkan pemahaman praktis dan kompetensi mahasiswa di dunia kerja nyata, maka kami memohon kesediaan Bapak/Ibu untuk dapat menerima mahasiswa kami melaksanakan kegiatan <strong>KKL Plus Berdampak</strong> di instansi/perusahaan yang Bapak/Ibu pimpin.
            </p>
            <p>
              <strong>KKL Plus Berdampak</strong> adalah program unggulan kami yang dirancang agar mahasiswa tidak hanya sekadar belajar, tetapi juga didorong untuk memberikan kontribusi nyata. Kami sangat berharap kehadiran mahasiswa KKL Plus kami di tempat Bapak/Ibu dapat memberikan dampak yang positif, inovatif, dan bermanfaat secara langsung bagi instansi/perusahaan yang Bapak/Ibu pimpin.
            </p>
            <p>Adapun mahasiswa yang bersangkutan adalah:</p>
            
            <table className="w-full border-collapse border border-black mt-2 mb-2 text-[10.5pt]">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="border border-black p-2 w-10">No</th>
                  <th className="border border-black p-2 w-[35%]">Nama / NIM</th>
                  <th className="border border-black p-2 w-[25%]">Program Studi / Konsentrasi</th>
                  <th className="border border-black p-2 w-[35%]">Dosen Pembimbing (DPL)</th>
                </tr>
              </thead>
              <tbody>
                {daftarMahasiswa.map((mhsItem, idx) => (
                  <tr key={mhsItem._id || idx}>
                    <td className="border border-black p-2 text-center align-middle">{idx + 1}</td>
                    <td className="border border-black p-2 align-middle">
                      <strong className="whitespace-nowrap uppercase">{mhsItem.nama_lengkap}</strong><br/>
                      {mhsItem.nim_nidn}
                    </td>
                    <td className="border border-black p-2 text-center align-middle">
                      {mhsItem.program_studi ? (mhsItem.program_studi.toLowerCase().includes('manajemen') ? 'S1 Manajemen' : mhsItem.program_studi) : 'S1 Manajemen'}<br/>
                      {mhsItem.konsentrasi || '-'}
                    </td>
                    {idx === 0 && (
                      <td rowSpan={daftarMahasiswa.length} className="border border-black p-2 align-middle">
                        <strong className="whitespace-nowrap">{namaDpl}</strong><br/>
                        {noHpDpl && noHpDpl !== "...................." ? `WA: ${noHpDpl}` : "WA: ...................."}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <p>
              Rencana pelaksanaan kegiatan KKL Plus ini akan dilaksanakan selama <strong>2 (dua) bulan</strong>, terhitung mulai di antara bulan <strong>{bulanMulaiStr}</strong> sampai dengan <strong>{bulanSelesaiStr}</strong>.
            </p>
            <p>
              Demikian surat permohonan ini kami sampaikan, atas perhatian dan kerjasama yang baik dari Bapak/Ibu kami ucapkan terima kasih.
            </p>
          </div>

          <div className="flex justify-end mt-4 text-center">
            <div className="w-1/2">
              <p className="mb-20">Ketua Program Studi Manajemen,</p>
              <p className="font-bold underline">{settings.kaprodi_nama}</p>
              <p>NIDN. {settings.kaprodi_nip}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
