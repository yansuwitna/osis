"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeAdminPassword } from "@/lib/actions";
import Swal from "sweetalert2";

export default function AdminPassword() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi Form",
        text: "Semua kolom password wajib diisi!",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password Terlalu Pendek",
        text: "Password baru minimal terdiri dari 6 karakter!",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Konfirmasi Tidak Cocok",
        text: "Password baru dan konfirmasi password tidak sama!",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await changeAdminPassword(oldPassword, newPassword);
        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "Password Berhasil Diubah!",
            text: "Password akun Administrator telah diperbarui. Silakan gunakan password baru ini untuk login berikutnya.",
            confirmButtonColor: "#7c3aed",
          });

          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          router.refresh();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Mengubah Password",
            text: res.error || "Terjadi kesalahan.",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error Sistem",
          text: err.message,
          confirmButtonColor: "#dc2626",
        });
      }
    });
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="w-10 h-10 bg-violet-100 text-violet-700 rounded-2xl flex items-center justify-center font-bold text-lg">
            🔑
          </span>
          <span>Ubah <span className="text-gradient-vivid">Password Admin</span></span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Perbarui kata sandi login panel administrator untuk menjaga keamanan sistem pemilihan.
        </p>
      </div>

      {/* Card Form */}
      <div className="bg-white border-2 border-violet-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">
              Password Lama Saat Ini
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan password lama"
              className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-slate-700 font-semibold focus:outline-none transition-all text-xs sm:text-sm"
              disabled={isPending}
              required
            />
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-4">
            <div>
              <label className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">
                Password Baru
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-slate-700 font-semibold focus:outline-none transition-all text-xs sm:text-sm"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">
                Konfirmasi Password Baru
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-slate-700 font-semibold focus:outline-none transition-all text-xs sm:text-sm"
                disabled={isPending}
                required
              />
            </div>
          </div>

          {/* Toggle Lihat Password */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="showPass"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded-md border-violet-300 focus:ring-violet-500 cursor-pointer"
            />
            <label htmlFor="showPass" className="text-xs text-slate-600 font-medium cursor-pointer">
              Tampilkan Karakter Password
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-violet-300/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 text-xs sm:text-sm"
          >
            <span>💾</span>
            <span>{isPending ? "Menyimpan Password..." : "Simpan Password Baru"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
