import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/db';

import PaketMatkul from '@/models/PaketMatkul';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { pengajuan_id, deskripsi_kegiatan } = await req.json();

    if (!pengajuan_id || !deskripsi_kegiatan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Ambil pengajuan untuk mengetahui paket matkul
    const Pokja = (await import('@/models/Pokja')).default;
    const pengajuan = await Pokja.findById(pengajuan_id);
    if (!pengajuan) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }

    // Ambil paket matkul
    const paket = await PaketMatkul.findOne();
    if (!paket) {
      return NextResponse.json({ error: "Paket matkul tidak ditemukan" }, { status: 404 });
    }

    // Extract all possible indicators
    const allIndicators = [];
    paket.mata_kuliah.forEach(mk => {
      if (mk.cpmk && mk.cpmk.length > 0) {
        mk.cpmk.forEach(cpmk => {
          if (cpmk.indikator && cpmk.indikator.length > 0) {
            cpmk.indikator.forEach(ind => {
              allIndicators.push({
                matkul_kode: mk.kode,
                matkul_nama: mk.nama,
                cpmk_id: cpmk._id.toString(),
                nama_cpmk: cpmk.nama_cpmk,
                indikator: ind,
                saran_kegiatan: cpmk.saran_kegiatan || ""
              });
            });
          }
        });
      }
    });

    if (allIndicators.length === 0) {
      return NextResponse.json({ matched: [] });
    }

    // Build Prompt for Gemini
    const prompt = `Anda adalah Asisten Penilai KKL Plus yang BIJAKSANA namun OBJEKTIF.
Tugas Anda adalah mencocokkan deskripsi kegiatan harian mahasiswa dengan indikator Capaian Pembelajaran (CPMK). Tugas utama Anda adalah mencari "Semantic Matching" (Kesamaan Makna) antara apa yang dikerjakan mahasiswa dengan apa yang ditargetkan indikator.

PANDUAN PENILAIAN KETAT:
1. MAKSIMAL 3 INDIKATOR: Pilih HANYA MAKSIMAL 3 indikator yang PALING RELEVAN dengan kegiatan hari tersebut. Jangan serakah, pilih yang paling kuat keterkaitannya.
2. BERIKAN ALASAN SPESIFIK: Untuk setiap indikator yang dipilih, Anda WAJIB memberikan "alasan" mengapa kegiatan tersebut memenuhi indikator itu. Alasan harus secara eksplisit mengutip bagian dari kegiatan mahasiswa yang relevan.
Contoh: "Berdasarkan kegiatan 'mengetik laporan keuangan', mahasiswa telah mempraktikkan keterampilan teknis administrasi."
3. Jika kegiatan sangat tidak berhubungan (misal: "saya tidur seharian"), jangan pilih indikator apapun.

DAFTAR INDIKATOR:
${allIndicators.map((ind, i) => `[ID: ${i}] CPMK: ${ind.nama_cpmk} | Indikator Utama: ${ind.indikator} ${ind.saran_kegiatan ? `| Saran Kegiatan (Bahasa Lapangan): ${ind.saran_kegiatan}` : ''}`).join('\n')}

DESKRIPSI KEGIATAN MAHASISWA (Bahasa Lapangan):
"${deskripsi_kegiatan}"

Keluarkan hasil analisis Anda HANYA dalam format JSON array yang valid. Setiap elemen array adalah sebuah object dengan key "id" (angka ID indikator) dan "alasan" (penjelasan singkat maksimal 2 kalimat).
Contoh output jika cocok:
[
  { "id": 1, "alasan": "Berdasarkan kegiatan 'memperkenalkan diri', mahasiswa menunjukkan kemampuan komunikasi awal." },
  { "id": 3, "alasan": "Tindakan 'membantu mengerjakan laporan' menunjukkan partisipasi dalam tugas teknis." }
]
Contoh output jika tidak ada yang cocok: []
Jangan tambahkan teks apapun selain array JSON tersebut.`;

    // Initialize model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text();
    
    let matchedData = [];
    try {
      matchedData = JSON.parse(textResult);
    } catch (e) {
      console.error("Gagal parse output AI:", textResult);
    }

    const matchedIndicators = [];
    if (Array.isArray(matchedData)) {
      matchedData.forEach(item => {
        if (item && typeof item.id === 'number' && allIndicators[item.id]) {
          matchedIndicators.push({
            ...allIndicators[item.id],
            alasan: item.alasan || "Relevan dengan kegiatan mahasiswa."
          });
        }
      });
    }

    return NextResponse.json({ matched: matchedIndicators.slice(0, 3) });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
