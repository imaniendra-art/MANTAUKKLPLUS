import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'mahasiswa') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { peran, namaKelompok, pokjaId, nomor_hp, newPassword, isPlotted } = await req.json();

    if (!peran || !nomor_hp || !newPassword) {
      return NextResponse.json({ message: 'Data tidak lengkap (Peran, No HP & Password wajib diisi)' }, { status: 400 });
    }
    
    if (!isPlotted && peran === 'ketua' && !namaKelompok) {
      return NextResponse.json({ message: 'Nama kelompok wajib diisi untuk Ketua' }, { status: 400 });
    }
    
    if (!isPlotted && peran === 'anggota' && !pokjaId) {
      return NextResponse.json({ message: 'Pilihan kelompok wajib diisi untuk Anggota' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'Password minimal 6 karakter' }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    // Process Pokja
    if (!isPlotted) {
      if (peran === 'ketua') {
        // Check if user is already a ketua somewhere else
        const existingPokja = await import('@/models/Pokja').then(m => m.default).then(Pokja => Pokja.findOne({ ketua_id: user._id }));
        if (existingPokja) {
          // Just update it if they are already ketua, or ignore
        } else {
          const Pokja = (await import('@/models/Pokja')).default;
          await Pokja.create({
            nama_pokja: namaKelompok,
            ketua_id: user._id,
            status_pokja: 'draft',
            anggota: []
          });
        }
      } else if (peran === 'anggota') {
        const Pokja = (await import('@/models/Pokja')).default;
        const pokjaTarget = await Pokja.findById(pokjaId);
        if (!pokjaTarget) {
          return NextResponse.json({ message: 'Kelompok tidak ditemukan' }, { status: 404 });
        }
        
        if (pokjaTarget.anggota.length >= 4) {
          return NextResponse.json({ message: 'Kelompok sudah penuh (maksimal 5 orang termasuk ketua)' }, { status: 400 });
        }
        
        // Check if already joined
        const isAlreadyMember = pokjaTarget.anggota.find(a => a.user_id.toString() === user._id.toString());
        if (!isAlreadyMember) {
          pokjaTarget.anggota.push({
            user_id: user._id,
            status_undangan: 'bergabung',
          });
          await pokjaTarget.save();
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id, 
      {
        password: hashedPassword,
        nomor_hp: nomor_hp,
        isFirstLogin: false
      },
      { new: true }
    );

    console.log("Setup akun sukses:", updatedUser.nim_nidn);

    return NextResponse.json({ message: 'Profil dan password berhasil diubah' }, { status: 200 });
  } catch (error) {
    console.error('Setup akun error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
