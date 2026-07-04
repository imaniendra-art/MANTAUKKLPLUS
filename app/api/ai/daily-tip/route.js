import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'mahasiswa') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cpmk_name } = await req.json();
    if (!cpmk_name) {
      return NextResponse.json({ error: "Missing CPMK name" }, { status: 400 });
    }

    const prompt = `Anda adalah asisten AI yang bertugas memberikan saran kegiatan harian yang sangat natural dan praktis kepada mahasiswa KKL Plus.
Mahasiswa ini memiliki target kemampuan yang harus dicapai hari ini terkait topik berikut: "${cpmk_name}".

Tugas Anda:
Berikan 1 atau maksimal 2 kalimat saran singkat tentang apa yang spesifik bisa mereka kerjakan atau tanyakan ke mentor hari ini di tempat KKL Plus untuk berlatih topik tersebut.
Gunakan bahasa Indonesia yang formal, sopan, namun tetap natural dan membumi (hindari bahasa gaul seperti "nggak", "dibikin", "biar"). JANGAN PERNAH menyebutkan kata "CPMK", "Target", "Indikator", atau mengutip topik tersebut secara kaku.
Berikan contoh kalimat langsung yang bisa diucapkan mahasiswa ke mentor (menggunakan sapaan Bapak/Ibu).

Contoh output yang diharapkan:
"Kamu bisa bertanya kepada mentor seperti ini: 'Bapak/Ibu, apakah ada proyek inovasi yang sedang dikerjakan dan perlu di tes kelayakannya hari ini? Apakah mungkin saya bisa membantu?'"
atau
"Coba tanyakan kepada mentor: 'Apakah ada data yang perlu saya cari di lapangan Pak/Bu? Agar pekerjaan Bapak/Ibu bisa saya bantu lengkapi.'"

Output:`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return NextResponse.json({ tip: text });
  } catch (error) {
    console.error("AI Daily Tip Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
