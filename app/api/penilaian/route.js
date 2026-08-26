import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Penilaian from '@/models/Penilaian';
import Pokja from '@/models/Pokja';
import User from '@/models/User';
import Proker from '@/models/Proker';
import LaporanAkhir from '@/models/LaporanAkhir';

// Helper for letter grading
function calculateLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 66) return 'B-';
  if (score >= 61) return 'C+';
  if (score >= 56) return 'C';
  if (score >= 46) return 'D';
  return 'E';
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const pokjaId = searchParams.get('pokjaId');

    if (!pokjaId) {
      return NextResponse.json({ error: 'Missing pokjaId' }, { status: 400 });
    }

    const pokja = await Pokja.findById(pokjaId).populate('anggota.user_id').populate('ketua_id');
    if (!pokja) {
      return NextResponse.json({ error: 'Pokja not found' }, { status: 404 });
    }

    // kumpulkan semua mahasiswa (ketua + anggota)
    const mahasiswaIds = [pokja.ketua_id._id];
    if (pokja.anggota && Array.isArray(pokja.anggota)) {
      pokja.anggota.forEach(a => {
        if (a.user_id && a.status_undangan === 'bergabung') {
          mahasiswaIds.push(a.user_id._id);
        }
      });
    }

    // Get existing Penilaian records
    let penilaians = await Penilaian.find({ pokja_id: pokjaId }).populate('mahasiswa_id', 'nama_lengkap nim');

    // Create missing records if any
    const existingIds = penilaians.map(p => p.mahasiswa_id?._id?.toString());
    const missingStudents = mahasiswaIds.filter(id => !existingIds.includes(id.toString()));

    if (missingStudents.length > 0) {
      const newDocs = missingStudents.map(id => ({
        pokja_id: pokjaId,
        mahasiswa_id: id,
      }));
      await Penilaian.insertMany(newDocs);
      
      // Refetch
      penilaians = await Penilaian.find({ pokja_id: pokjaId }).populate('mahasiswa_id', 'nama_lengkap nim');
    }

    // Ambil daftar Proker dari kelompok ini
    const prokers = await Proker.find({ pokja_id: pokjaId }).lean();

    // Cek status persetujuan Laporan Akhir (Kelompok & Seluruh Individu)
    const laporans = await LaporanAkhir.find({ pokja_id: pokjaId }).lean();
    const lapKelompok = laporans.find(l => l.tipe_laporan === 'pokja');
    const isLaporanKelompokApproved = lapKelompok?.status === 'disetujui';
    const stringActiveIds = mahasiswaIds.map(id => id.toString());
    const approvedIndividuCount = laporans.filter(l => 
      l.tipe_laporan === 'individu' && 
      l.status === 'disetujui' &&
      stringActiveIds.includes(l.mahasiswa_id?.toString())
    ).length;
    const isIndividuComplete = stringActiveIds.length > 0 && approvedIndividuCount >= stringActiveIds.length;
    const allReportsApproved = isLaporanKelompokApproved && isIndividuComplete;

    // Filter Ghost Student dan Tambah nilai_final_tersedia
    const filteredPenilaians = penilaians
      .filter(p => p.mahasiswa_id && stringActiveIds.includes(p.mahasiswa_id._id.toString()))
      .map(p => {
        const pObj = p.toObject ? p.toObject() : p;
        pObj.nilai_final_tersedia = pObj.mentor_sudah_menilai === true && pObj.dpl_sudah_menilai === true;
        return pObj;
      });

    return NextResponse.json({ 
      success: true, 
      penilaians: filteredPenilaians, 
      prokers, 
      allReportsApproved,
      laporanSummary: {
        isLaporanKelompokApproved,
        approvedIndividuCount,
        totalMembers: stringActiveIds.length,
        isIndividuComplete
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const { role, updates } = await req.json(); // role: 'mentor' or 'dpl', updates: array of {_id, nilai_kelompok, nilai_individu, catatan}

    if (!['mentor', 'dpl'].includes(role) || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // PERBAIKAN 1: Validasi Nilai (0 - 100)
    for (const data of updates) {
      const nk = Number(data.nilai_kelompok) || 0;
      const ni = Number(data.nilai_individu) || 0;
      if (nk < 0 || nk > 100 || ni < 0 || ni > 100) {
        return NextResponse.json({ error: "Nilai harus berada pada rentang 0 sampai 100." }, { status: 400 });
      }
    }

    if (role === 'dpl' && updates.length > 0) {
      const sampleP = await Penilaian.findById(updates[0]._id);
      if (sampleP?.pokja_id) {
        const laporans = await LaporanAkhir.find({ pokja_id: sampleP.pokja_id }).lean();
        const lapKelompok = laporans.find(l => l.tipe_laporan === 'pokja');
        if (!lapKelompok || lapKelompok.status !== 'disetujui') {
          return NextResponse.json({ error: "Laporan Kelompok belum disetujui DPL. Selesaikan validasi laporan terlebih dahulu." }, { status: 400 });
        }
      }
    }

    // Process each update
    for (const data of updates) {
      const p = await Penilaian.findById(data._id);
      if (!p) continue;

      if (role === 'mentor') {
        p.nilai_mentor_kelompok = Number(data.nilai_kelompok) || 0;
        p.nilai_mentor_individu = Number(data.nilai_individu) || 0;
        if (data.detail_kelompok) p.detail_mentor_kelompok = data.detail_kelompok;
        if (data.detail_individu) p.detail_mentor_individu = data.detail_individu;
        p.catatan_mentor = data.catatan || '';
        p.mentor_sudah_menilai = true;
      } else {
        p.nilai_dpl_kelompok = Number(data.nilai_kelompok) || 0;
        p.nilai_dpl_individu = Number(data.nilai_individu) || 0;
        if (data.detail_kelompok) p.detail_dpl_kelompok = data.detail_kelompok;
        if (data.detail_individu) p.detail_dpl_individu = data.detail_individu;
        p.catatan_dpl = data.catatan || '';
        p.dpl_sudah_menilai = true;
      }

      // Recalculate Final Score if both have graded
      // Bobot: Mentor 20%, DPL 80%
      // Nilai dari setiap role = Rata-rata dari nilai kelompok dan individu
      const mentorScore = (p.nilai_mentor_kelompok + p.nilai_mentor_individu) / 2;
      const dplScore = (p.nilai_dpl_kelompok + p.nilai_dpl_individu) / 2;

      p.nilai_akhir_angka = (mentorScore * 0.20) + (dplScore * 0.80);
      p.nilai_akhir_huruf = calculateLetterGrade(p.nilai_akhir_angka);

      await p.save();
    }

    return NextResponse.json({ success: true, message: 'Nilai berhasil disimpan' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
