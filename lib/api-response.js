import { NextResponse } from 'next/server';

/**
 * Standardized API JSON response helpers for Next.js App Router (RFC 9457 compliant shapes).
 */

export function apiSuccess(data, status = 200, extra = {}) {
  return NextResponse.json({
    success: true,
    data,
    ...extra,
  }, { status });
}

export function apiError(message = "Terjadi kesalahan pada server", status = 400, details = null) {
  const payload = {
    success: false,
    error: message,
  };
  if (details) {
    payload.details = details;
  }
  return NextResponse.json(payload, { status });
}

export function apiUnauthorized(message = "Sesi tidak valid atau belum login") {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 401 });
}

export function apiForbidden(message = "Anda tidak memiliki hak akses untuk aksi ini") {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 403 });
}

export function apiNotFound(message = "Data tidak ditemukan") {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 404 });
}
