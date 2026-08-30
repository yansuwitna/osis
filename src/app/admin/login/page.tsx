"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/actions";
import Link from "next/link";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username dan password harus diisi!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await adminLogin(username, password);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.error || "Login gagal");
        setLoading(false);
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sacazio-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-400/15 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "3s" }} />
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <Link 
          href="/" 
          className="text-xs text-violet-500 hover:text-violet-700 transition-colors bg-white/70 px-4 py-2 rounded-full border border-violet-200 flex items-center gap-2 font-semibold shadow-sm hover:shadow-md backdrop-blur-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Halaman Pemilih
        </Link>
      </div>

      <div className="relative w-full max-w-md z-10 animate-fade-in-up">
        <div className="card-glass rounded-3xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-18 h-18 bg-white/90 border-2 border-violet-200 rounded-2xl flex items-center justify-center p-2 shadow-lg shadow-violet-300/30 mb-4 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo OSIS"
                className="max-h-14 max-w-14 object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes("logo.jpg")) {
                    img.src = "/logo.jpg";
                  }
                }}
              />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">Login Administrator</h2>
            <p className="text-slate-400 text-sm text-center">
              Gunakan akun admin panitia untuk masuk ke panel dashboard utama.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Masukkan username"
                className="w-full bg-violet-50/60 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-2xl py-3 px-4 text-slate-700 placeholder-violet-300 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Masukkan password"
                className="w-full bg-violet-50/60 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-2xl py-3 px-4 text-slate-700 placeholder-violet-300 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-2xl flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-violet-400/30 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Membuka Panel...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
