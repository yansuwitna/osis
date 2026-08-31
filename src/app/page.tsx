"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { voterLogin } from "@/lib/actions";
import Link from "next/link";
import Swal from "sweetalert2";

export default function Home() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya izinkan angka (0-9) maksimal 6 digit
    const numericOnly = e.target.value.replace(/[^0-9]/g, "");
    if (numericOnly.length <= 6) {
      setToken(numericOnly);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || token.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Token Belum Lengkap",
        text: "Masukkan 6 digit angka token unik yang tertera pada Surat Panggilan Pemilih!",
        confirmButtonColor: "#7c3aed",
        confirmButtonText: "Mengerti",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await voterLogin(token);
      if (res.success) {
        // Langsung arahkan ke bilik suara tanpa popup SweetAlert
        router.push("/vote");
      } else {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Token Tidak Valid",
          text: res.error || "Token tidak ditemukan atau seluruh proses pemilihan sudah Anda selesaikan.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "Coba Lagi",
        });
      }
    } catch {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Kesalahan Koneksi",
        text: "Gagal terhubung ke server. Pastikan koneksi aktif.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-sacazio-hero flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-violet-400/25 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-orange-300/15 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "4s" }} />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-cyan-300/15 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "6s" }} />

      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 dot-bg opacity-40 pointer-events-none" />

      {/* Top Navigation Links */}
      <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
        <Link
          href="/results"
          className="pointer-events-auto flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-all duration-300 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-full backdrop-blur-md shadow-sm hover:shadow-md"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>📊 Live Quick Count</span>
        </Link>

        <Link
          href="/admin/login"
          className="pointer-events-auto flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-all duration-300 bg-white/80 hover:bg-white border border-violet-200 px-4 py-2 rounded-full backdrop-blur-md shadow-sm hover:shadow-md"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Panel Panitia
        </Link>
      </div>

      <div className="relative w-full max-w-md z-10 animate-fade-in-up">
        {/* Card */}
        <div className="card-glass rounded-3xl p-8 shadow-2xl">
          {/* Logo & Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className="w-24 h-24 bg-white/90 border-2 border-violet-200 rounded-3xl flex items-center justify-center p-2.5 shadow-xl shadow-violet-300/30 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Logo OSIS"
                  className="max-h-20 max-w-20 object-contain"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.src.includes("logo.jpg")) {
                      img.src = "/logo.jpg";
                    }
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-violet-600 to-pink-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-[10px] font-black text-white">✓</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-center tracking-tight leading-tight">
              PILKOSIS · PKS · MPK
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-extrabold text-pink-500 tracking-[0.25em] uppercase">
                SISTEM E-VOTING DIGITAL
              </span>
            </div>
            <p className="text-slate-500 text-xs text-center mt-3 leading-relaxed max-w-xs">
              Sistem Pemilihan Digital Cepat, Aman, Jujur & Transparan
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 live-dot" />
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Bilik Suara Siap</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="token" className="block text-xs font-bold text-violet-600 uppercase tracking-widest mb-2.5 text-center">
                Masukkan 6 Digit Angka Token
              </label>
              <div className="relative">
                <input
                  id="token"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={token}
                  onChange={handleTokenChange}
                  placeholder="• • • • • •"
                  className="w-full bg-violet-50/80 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-2xl py-4 px-4 text-center text-3xl font-mono font-black tracking-[0.4em] text-violet-700 placeholder:text-violet-300 placeholder:text-2xl placeholder:tracking-[0.3em] focus:outline-none transition-all duration-300"
                  disabled={loading}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Token 6 angka unik tertera pada <b>Surat Panggilan Pemilih</b> Anda
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || token.length < 6}
              className="group w-full relative shimmer-btn text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-violet-400/30 hover:shadow-violet-400/50 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none overflow-hidden"
            >
              <div className="relative flex items-center justify-center gap-2.5">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Memverifikasi Token...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span>Masuk Bilik Suara</span>
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

