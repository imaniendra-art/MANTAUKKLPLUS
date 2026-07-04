import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/db';
import PaketMatkul from '@/models/PaketMatkul';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['lppm', 'dpl'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paket_id, matkul_id, cpmk_id } = await req.json();

    if (!paket_id || !matkul_id || !cpmk_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const paket = await PaketMatkul.findById(paket_id);
    if (!paket) return NextResponse.json({ error: "Paket matkul tidak ditemukan" }, { status: 404 });

    const matkul = paket.mata_kuliah.id(matkul_id);
    if (!matkul) return NextResponse.json({ error: "Mata kuliah tidak ditemukan" }, { status: 404 });

    const cpmk = matkul.cpmk.id(cpmk_id);
    if (!cpmk) return NextResponse.json({ error: "CPMK tidak ditemukan" }, { status: 404 });

    // Build Prompt
    const prompt = `Anda adalah sistem AI yang bertugas menerjemahkan target akademis (CPMK dan Indikator) menjadi "Misi / Saran Kegiatan Harian" untuk mahasiswa KKL Plus.

Tujuan utama:
Saran kegiatan ini akan dibaca oleh mahasiswa sebagai panduan menulis logbook harian mereka. Jika mahasiswa melakukan dan menuliskan kegiatan seperti yang Anda sarankan, maka "AI Penilai Logbook" (sistem AI lain) harus bisa dengan sangat mudah mencocokkan logbook tersebut dengan CPMK ini.

Data Akademis:
- CPMK: ${cpmk.nama_cpmk}
- Indikator: 
${cpmk.indikator.map(i => "  * " + i).join('\n')}

Tugas Anda:
Buatlah tepat 8 contoh aktivitas nyata, spesifik, dan operasional (mengandung kata kerja tindakan fisik/digital) yang relevan dengan data di atas.
Gunakan sudut pandang kegiatan yang biasa ditulis di logbook (contoh: "Membuat desain konten promosi untuk Instagram menggunakan Canva", "Menginput data transaksi harian pelanggan ke dalam Microsoft Excel", "Membantu staf melakukan pengecekan stok fisik barang di gudang").

Aturan Output:
1. LANGSUNG tuliskan 8 poin tersebut (gunakan bullet point '- ').
2. DILARANG KERAS menggunakan kata pembuka seperti "Berikut adalah..." atau penutup.
3. Gunakan bahasa yang mudah dipahami mahasiswa (tidak kaku/akademis) tapi sangat spesifik agar AI Penilai Logbook mudah mendeteksi kecocokannya.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const saranKegiatan = response.text().trim();

    return NextResponse.json({ message: "Berhasil di-generate", saran_kegiatan: saranKegiatan });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
