import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Logbook from '@/models/Logbook';

import PaketMatkul from '@/models/PaketMatkul';

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const mhsId = searchParams.get('mhsId');
    
    if (!mhsId) return NextResponse.json({ error: "Missing mhsId" }, { status: 400 });
    
    // 1. Ambil Pokja dan Paket Matkul
    const Pokja = (await import('@/models/Pokja')).default;
    const pengajuan = await Pokja.findOne({ 
      $or: [
        { ketua_id: mhsId },
        { 'anggota.user_id': mhsId }
      ],
      status_pokja: { $in: ['disetujui_lppm', 'berjalan', 'selesai'] }
    });
    
    let cpmkAchievements = [];
    
    // As Pokja doesn't save paket_matkul_id per group yet, use the default one
    if (pengajuan) {
      const paket = await PaketMatkul.findOne();
      if (paket) {
        // Inisialisasi map achievement
        paket.mata_kuliah.forEach(mk => {
          if (mk.cpmk) {
            mk.cpmk.forEach(c => {
              cpmkAchievements.push({
                cpmk_id: c._id.toString(),
                matkul: mk.nama,
                nama_cpmk: c.nama_cpmk,
                status: 'kosong', // kosong | pending | tercapai
                fulfilled_count: 0,
                total_indikator: c.indikator ? c.indikator.length : 0
              });
            });
          }
        });
      }
    }
    
    // 2. Tarik semua logbook
    const allLogs = await Logbook.find({ mahasiswa_id: mhsId }).sort({ tanggal: -1 });
    
    // 3. Kalkulasi Achievement
    let achievedTodayCount = 0;
    const today = new Date().toDateString();

    allLogs.forEach(log => {
      if (log.matched_indicators && log.matched_indicators.length > 0) {
        log.matched_indicators.forEach(matched => {
          const achIndex = cpmkAchievements.findIndex(a => a.cpmk_id === matched.cpmk_id || (a.nama_cpmk && a.nama_cpmk === matched.nama_cpmk));
          if (achIndex !== -1) {
            const currentStatus = cpmkAchievements[achIndex].status;
            
            // Jika logbook divalidasi, jadikan status 'tercapai' (jika belum tercapai)
            if (log.status_validasi === 'divalidasi_mentor' || log.status_validasi === 'divalidasi_dpl') {
              if (currentStatus !== 'tercapai') {
                cpmkAchievements[achIndex].status = 'tercapai';
                cpmkAchievements[achIndex].fulfilled_count += 1;
                cpmkAchievements[achIndex].achieved_date = log.tanggal;
                cpmkAchievements[achIndex].achieved_desc = log.deskripsi_kegiatan;
                
                // Cek apakah di-acc hari ini atau lognya hari ini
                if (new Date(log.tanggal).toDateString() === today) {
                  achievedTodayCount++;
                }
              }
            } 
            // Jika logbook masih pending dan status masih kosong, jadikan 'pending'
            else if (log.status_validasi === 'menunggu_mentor' && currentStatus === 'kosong') {
              cpmkAchievements[achIndex].status = 'pending';
            }
          }
        });
      }
    });

    // 4. Algoritma Anti-Monoton & Saran Pintar
    const recentLogs = allLogs.slice(0, 3);
    let peringatan_monoton = false;
    let suggested_indicator = null;
    
    if (recentLogs.length >= 2) {
      // Jika 2 atau 3 log terakhir kosong indikatornya
      const emptyCount = recentLogs.filter(l => !l.matched_indicators || l.matched_indicators.length === 0).length;
      if (emptyCount >= 2) {
        peringatan_monoton = true;
        
        // Cari 1 indikator dari CPMK yang belum tercapai secara acak
        const unachieved = cpmkAchievements.filter(a => a.status === 'kosong');
        if (unachieved.length > 0) {
          const randomCpmk = unachieved[Math.floor(Math.random() * unachieved.length)];
          // Cari indikator text dari paket matkul asli
          if (pengajuan) {
             const paket = await PaketMatkul.findOne();
             paket?.mata_kuliah?.forEach(mk => {
                mk?.cpmk?.forEach(c => {
                   if (c._id.toString() === randomCpmk.cpmk_id && c.indikator && c.indikator.length > 0) {
                      suggested_indicator = c.indikator[Math.floor(Math.random() * c.indikator.length)];
                   }
                });
             });
          }
        }
      }
    }
    
    // Log yang divalidasi untuk dashboard
    const dplLogs = allLogs.filter(l => l.status_validasi === 'divalidasi_dpl' || l.status_validasi === 'divalidasi_mentor');
    
    return NextResponse.json({
      achieved_today: achievedTodayCount > 0,
      achieved_count: achievedTodayCount,
      peringatan_monoton,
      suggested_indicator,
      recent_logs: dplLogs.slice(0, 3),
      achievements: cpmkAchievements
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
