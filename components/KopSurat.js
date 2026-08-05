export default function KopSurat() {
  return (
    <>
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
    </>
  );
}
