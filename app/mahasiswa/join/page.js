"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from "@/components/AuthProvider";
import { Check, X, Users, AlertCircle } from 'lucide-react';

function JoinPokjaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('invite');
  const { data: session, status } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pokjaInfo, setPokjaInfo] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/mahasiswa/join?invite=${inviteId}`);
      return;
    }

    if (status === 'authenticated') {
      if (session.user.role !== 'mahasiswa') {
        router.push('/');
        return;
      }
      
      // If user hasn't setup account, redirect to setup account
      if (session.user.isFirstLogin === true) {
        router.push(`/mahasiswa/setup-akun?invite=${inviteId}`);
        return;
      }

      if (!inviteId) {
        setError('Link undangan tidak valid (ID Kelompok hilang).');
        setLoading(false);
        return;
      }

      // Fetch the Pokja Info to verify it exists
      fetch(`/api/pokja/available`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            const targetPokja = data.data.find(p => p._id === inviteId);
            if (targetPokja) {
              setPokjaInfo(targetPokja);
            } else {
              setError('Kelompok tidak ditemukan atau sudah tidak menerima anggota.');
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Terjadi kesalahan saat memeriksa data kelompok.');
          setLoading(false);
        });
    }
  }, [status, session, router, inviteId]);

  const handleJoin = async () => {
    setProcessing(true);
    setError('');
    
    try {
      const res = await fetch('/api/pokja', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: inviteId,
          mhs_id: session.user.id,
          action: 'join_by_link'
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal bergabung ke kelompok.');
      }
      
      setSuccess('Berhasil bergabung ke kelompok!');
      setTimeout(() => {
        router.push('/mahasiswa');
      }, 1500);
      
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading || status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/mantau_hero.png')" }}></div>
      <div className="absolute inset-0 bg-white/40 pointer-events-none z-0"></div>
      
      <div className="max-w-md w-full relative z-10 bg-white/60 backdrop-blur-2xl p-8 rounded-3xl shadow-xl border border-white/60">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-teal-600/10 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Undangan Kelompok</h2>
          <p className="text-slate-500 mt-1">Anda diundang untuk bergabung ke kelompok KKL Plus.</p>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6 flex gap-3 items-start">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        ) : success ? (
          <div className="bg-teal-50 text-teal-600 p-4 rounded-xl text-sm font-medium border border-teal-100 mb-6 flex gap-3 items-start">
            <Check size={20} className="shrink-0" />
            <p>{success}</p>
          </div>
        ) : pokjaInfo && (
          <div className="bg-white/50 border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Nama Kelompok</p>
            <p className="font-bold text-lg text-slate-800 mb-3">{pokjaInfo.nama_pokja}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-bold">Ketua</p>
                <p className="text-sm font-medium text-slate-700">{pokjaInfo.ketua_nama}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-bold">Anggota Saat Ini</p>
                <p className="text-sm font-medium text-slate-700">{pokjaInfo.jumlah_anggota} Orang</p>
              </div>
            </div>
          </div>
        )}

        {!error && !success && pokjaInfo && (
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/mahasiswa')}
              disabled={processing}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleJoin}
              disabled={processing}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all disabled:opacity-50"
            >
              {processing ? 'Memproses...' : 'Bergabung'}
            </button>
          </div>
        )}
        
        {error && (
          <button
            onClick={() => router.push('/mahasiswa')}
            className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl"
          >
            Kembali ke Beranda
          </button>
        )}
      </div>
    </div>
  );
}

export default function JoinPokja() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <JoinPokjaContent />
    </Suspense>
  );
}
