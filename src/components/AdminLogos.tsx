"use client";

import { useState, useTransition } from "react";
import { uploadLogoAction } from "@/lib/actions";
import Swal from "sweetalert2";

interface AdminLogosProps {
  hasOsisLogo: boolean;
  hasSchoolLogo: boolean;
  hasTtd?: boolean;
}

export default function AdminLogos({ hasOsisLogo, hasSchoolLogo, hasTtd }: AdminLogosProps) {
  const [isPending, startTransition] = useTransition();
  const [previewOsis, setPreviewOsis] = useState<string | null>(hasOsisLogo ? "/logo.png?v=" + Date.now() : null);
  const [previewSchool, setPreviewSchool] = useState<string | null>(hasSchoolLogo ? "/sekolah.png?v=" + Date.now() : null);
  const [previewTtd, setPreviewTtd] = useState<string | null>(hasTtd ? "/ttd.png?v=" + Date.now() : null);

  const handleUpload = (type: "osis" | "sekolah" | "ttd", file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Format Tidak Sesuai",
        text: "Harap upload file gambar (PNG, JPG, JPEG, WEBP).",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      if (type === "osis") setPreviewOsis(base64Data);
      else if (type === "sekolah") setPreviewSchool(base64Data);
      else setPreviewTtd(base64Data);

      startTransition(async () => {
        try {
          const res = await uploadLogoAction(type, base64Data);
          if (res.success) {
            const label =
              type === "osis"
                ? "Logo OSIS (logo.png)"
                : type === "sekolah"
                ? "Logo Sekolah (sekolah.png)"
                : "Tanda Tangan Ketua Panitia (ttd.png)";

            await Swal.fire({
              icon: "success",
              title: "File Berhasil Diupload!",
              text: label + " telah tersimpan dan langsung diterapkan.",
              confirmButtonColor: "#7c3aed",
            });
            window.location.reload();
          } else {
            Swal.fire({
              icon: "error",
              title: "Gagal Upload",
              text: res.error || "Gagal mengunggah file.",
              confirmButtonColor: "#dc2626",
            });
          }
        } catch (err: any) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Terjadi kesalahan: " + err.message,
            confirmButtonColor: "#dc2626",
          });
        }
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="w-10 h-10 bg-violet-100 text-violet-700 rounded-2xl flex items-center justify-center font-bold text-lg">
            🎨
          </span>
          <span>Kelola <span className="text-gradient-vivid">Logo, Favicon & Tanda Tangan</span></span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Upload Logo OSIS, Logo Sekolah, dan TTD digital Ketua Panitia untuk surat panggilan dan dokumen resmi.
        </p>
      </div>

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6">
        {/* Card 1: Logo OSIS */}
        <div className="bg-white border-2 border-violet-100 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-violet-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center font-bold text-base">
                  🛡️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Logo OSIS</h3>
                  <span className="text-[10px] font-mono text-violet-600 font-semibold block">public/logo.png</span>
                </div>
              </div>
              <span className="bg-violet-100 text-violet-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                Favicon
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Digunakan sebagai <b>Favicon Tab Browser</b>, logo panel panitia, dan identitas e-voting.
            </p>

            {/* Preview Box */}
            <div className="h-36 bg-violet-50/50 border-2 border-dashed border-violet-200 rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden group">
              {previewOsis ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewOsis}
                  alt="Preview Logo OSIS"
                  className="max-h-28 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <span className="text-2xl block mb-1">🖼️</span>
                  <span className="text-xs font-medium">Belum ada Logo OSIS</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md shadow-violet-200">
              <span>📤</span>
              <span>{isPending ? "Mengupload..." : "Upload Logo OSIS"}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isPending}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUpload("osis", e.target.files[0]);
                  }
                }}
              />
            </label>
            <span className="text-[10px] text-slate-400 text-center block mt-1.5">PNG / JPG Transparan</span>
          </div>
        </div>

        {/* Card 2: Logo Sekolah */}
        <div className="bg-white border-2 border-pink-100 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-pink-100 text-pink-700 rounded-xl flex items-center justify-center font-bold text-base">
                  🏫
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Logo Sekolah</h3>
                  <span className="text-[10px] font-mono text-pink-600 font-semibold block">public/sekolah.png</span>
                </div>
              </div>
              <span className="bg-pink-100 text-pink-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                Kop DPT
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Digunakan pada <b>Kop Surat Panggilan</b> dan <b>Lembar Rekap DPT Cetak Resmi</b>.
            </p>

            {/* Preview Box */}
            <div className="h-36 bg-pink-50/50 border-2 border-dashed border-pink-200 rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden group">
              {previewSchool ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSchool}
                  alt="Preview Logo Sekolah"
                  className="max-h-28 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <span className="text-2xl block mb-1">🏫</span>
                  <span className="text-xs font-medium">Belum ada Logo Sekolah</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md shadow-pink-200">
              <span>📤</span>
              <span>{isPending ? "Mengupload..." : "Upload Logo Sekolah"}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isPending}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUpload("sekolah", e.target.files[0]);
                  }
                }}
              />
            </label>
            <span className="text-[10px] text-slate-400 text-center block mt-1.5">PNG / JPG Resolusi Tinggi</span>
          </div>
        </div>

        {/* Card 3: Tanda Tangan (TTD) Ketua Panitia */}
        <div className="bg-white border-2 border-amber-100 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold text-base">
                  ✍️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">TTD Ketua Panitia</h3>
                  <span className="text-[10px] font-mono text-amber-600 font-semibold block">public/ttd.png</span>
                </div>
              </div>
              <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                Surat Panggilan
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Hanya ditampilkan pada <b>Surat Panggilan Pemilih (10 kartu/A4)</b> sebagai tanda tangan pengesahan resmi panitia.
            </p>

            {/* Preview Box */}
            <div className="h-36 bg-amber-50/50 border-2 border-dashed border-amber-200 rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden group">
              {previewTtd ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewTtd}
                  alt="Preview TTD Ketua Panitia"
                  className="max-h-24 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <span className="text-2xl block mb-1">✍️</span>
                  <span className="text-xs font-medium">Belum ada TTD Panitia</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md shadow-amber-200">
              <span>📤</span>
              <span>{isPending ? "Mengupload..." : "Upload TTD Panitia"}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isPending}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUpload("ttd", e.target.files[0]);
                  }
                }}
              />
            </label>
            <span className="text-[10px] text-slate-400 text-center block mt-1.5">PNG Transparan (Tanda Tangan Asli)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
