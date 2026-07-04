import { NextResponse } from 'next/server';

export async function GET() {
  const csvContent = "no;nim;nama;prodi\n1;246120100;Muhammad Budi;Manajemen (S1)\n2;246120101;Siti Aminah;Manajemen (S1)\n3;246120102;Ahmad Fauzi;Manajemen (S1)";
  
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="Template_Import_SIAM.csv"'
    }
  });
}
