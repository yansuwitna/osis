"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { backupAllData, restoreAllData, wipeEntireDatabase } from "@/lib/actions";
import Swal from "sweetalert2";

export default function AdminBackup() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<{
    exportedAt?: string;
    appName?: string;
    candidatesCount?: number;
    votersCount?: number;
    votesCount?: number;
    rawJson?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = async () => {
    startTransition(async () => {
      try {
        const res = await backupAllData();
        if (res.success && res.backup) {
          const jsonString = JSON.stringify(res.backup, null, 2);
          const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");

          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
          link.setAttribute("href", url);
          link.setAttribute("download", `BACKUP_EVOTING_${timestamp}.json`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setHasBackedUp(true);

          Swal.fire({
            icon: "success",
            title: "Backup Berhasil Diunduh!",
            text: "Simpan file backup .json ini di tempat yang aman. Tombol 'Kosongkan Semua Data' sekarang telah terbuka.",
            confirmButtonColor: "#7c3aed",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Backup",
            text: res.error || "Terjadi kesalahan.",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.data) {
          setFilePreview({
            exportedAt: parsed.exportedAt,
            appName: parsed.appName,
            candidatesCount: parsed.data.candidates?.length || 0,
            votersCount: parsed.data.voters?.length || 0,
            votesCount: parsed.data.votes?.length || 0,
            rawJson: content,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Format Tidak Valid",
            text: "File bukan merupakan format backup PILKOSIS / E-Voting yang valid!",
            confirmButtonColor: "#dc2626",
          });
          setFilePreview(null);
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "File Rusak",
          text: "File yang Anda pilih bukan JSON yang valid!",
          confirmButtonColor: "#dc2626",
        });
        setFilePreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!filePreview || !filePreview.rawJson) {
      Swal.fire({
        icon: "warning",
        title: "Pilih File Backup",
        text: "Pilih file .json cadangan terlebih dahulu!",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Konfirmasi Restore Data?",
      html: `
        <div style="text-align:left;font-size:0.85rem;color:#475569;background:#f8fafc;padding:12px;border-radius:12px;border:1px solid #e2e8f0;margin-top:8px;">
          <p style="margin-bottom:6px;"><b>⚠️ Perhatian:</b> Seluruh data saat ini akan ditimpa dengan data dari file backup:</p>
          <ul style="list-style-type:disc;padding-left:18px;margin:0;">
            <li>Kandidat: <b>${filePreview.candidatesCount} data</b></li>
            <li>DPT (Pemilih): <b>${filePreview.votersCount} data</b></li>
            <li>Suara Masuk: <b>${filePreview.votesCount} data</b></li>
          </ul>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Restore Sekarang!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    startTransition(async () => {
      try {
        const res = await restoreAllData(filePreview.rawJson!);
        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "Restore Berhasil!",
            text: `Data berhasil dipulihkan (${res.summary?.voters} pemilih, ${res.summary?.candidates} kandidat, ${res.summary?.votes} suara).`,
            confirmButtonColor: "#7c3aed",
          });
          setFilePreview(null);
          setRestoreFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          router.refresh();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Restore",
            text: res.error || "Terjadi kesalahan saat memulihkan data.",
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

  const handleWipeDatabase = async () => {
    if (!hasBackedUp) {
      Swal.fire({
        icon: "warning",
        title: "Backup Diperlukan!",
        text: "Anda WAJIB mengunduh file backup terlebih dahulu sebelum dapat mengosongkan seluruh database!",
        confirmButtonColor: "#7c3aed",
        confirmButtonText: "Saya Mengerti",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Kosongkan Seluruh Data?",
      html: `
        <div style="text-align:left;font-size:0.85rem;color:#dc2626;background:#fef2f2;padding:14px;border-radius:14px;border:1px solid #fecaca;margin-top:8px;">
          <p style="font-weight:bold;margin-bottom:6px;">⚠️ PERINGATAN PEMBERSIHAN DATABASE TOTAL:</p>
          <ul style="list-style-type:disc;padding-left:18px;margin:0;color:#991b1b;line-height:1.6;">
            <li><b>Identitas Sekolah & Jadwal TPS</b> direset ke default</li>
            <li><b>Data Panitia / KPPS & Pejabat</b> direset ke default</li>
            <li>Semua <b>Kandidat & Paslon</b> akan dihapus</li>
            <li>Semua <b>Data Pemilih / DPT</b> & Token akan dihapus</li>
            <li>Semua <b>Hasil Rekap Suara</b> akan dikosongkan ke 0</li>
            <li><b style="color:#059669;">🛡️ HANYA AKUN LOGIN ADMIN YANG DISISAKAN & TETAP AMAN</b></li>
          </ul>
          <p style="margin-top:8px;font-size:0.75rem;color:#7f1d1d;">Pastikan Anda telah mengunduh backup cadangan sebelum melanjutkan.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Kosongkan Semua Data!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    startTransition(async () => {
      try {
        const res = await wipeEntireDatabase();
        if (res.success) {
          setHasBackedUp(false);
          await Swal.fire({
            icon: "success",
            title: "Database Dikosongkan!",
            text: "Seluruh data identitas, panitia, kandidat, pemilih, dan suara telah dibersihkan. Akun login admin tetap aktif.",
            confirmButtonColor: "#7c3aed",
          });
          router.refresh();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Mengosongkan",
            text: res.error || "Terjadi kesalahan.",
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

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="text-3xl">💾</span>
          <span>Backup, Restore & <span className="text-gradient-vivid">Reset Database</span></span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Cadangkan seluruh data pemilihan ke file JSON, pulihkan dari cadangan, atau kosongkan database untuk persiapan pemilihan baru.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Card Backup */}
        <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
              📥
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Backup Seluruh Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Unduh cadangan data lengkap mencakup seluruh:
            </p>
            <ul className="text-xs text-slate-600 space-y-2 bg-violet-50/50 p-4 rounded-2xl border border-violet-100 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Pengaturan & Aktivasi Pemilihan
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Seluruh Paslon (PILKOSIS, PKS, MPK)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Daftar Pemilih (KODE, NAMA, KELOMPOK & Token)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Seluruh Rekap Suara yang telah masuk
              </li>
            </ul>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-violet-300/30 transition-all duration-300 transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isPending ? "Menyiapkan Data..." : "Unduh File Backup (.JSON) 💾"}
          </button>
        </div>

        {/* Card Restore */}
        <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
              📤
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Restore dari File Cadangan</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Pilih file <span className="font-mono text-pink-600">.json</span> hasil backup untuk memulihkan seluruh data sistem:
            </p>

            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="w-full bg-pink-50/40 border-2 border-pink-200 rounded-xl py-2 px-3 text-slate-500 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-600 file:hover:bg-pink-200 file:cursor-pointer"
                disabled={isPending}
              />
            </div>

            {filePreview && (
              <div className="bg-pink-50/60 border border-pink-200 rounded-2xl p-4 text-xs space-y-1.5 text-slate-700 mb-4">
                <div className="font-bold text-pink-700 mb-1 flex items-center justify-between">
                  <span>📄 Ringkasan File Backup:</span>
                  <span className="text-[10px] bg-pink-200 px-2 py-0.5 rounded-full">Valid</span>
                </div>
                <div>Tanggal Ekspor: <b>{new Date(filePreview.exportedAt || "").toLocaleString("id-ID")}</b></div>
                <div>Jumlah Kandidat: <b>{filePreview.candidatesCount}</b></div>
                <div>Jumlah Pemilih (DPT): <b>{filePreview.votersCount}</b></div>
                <div>Jumlah Suara: <b>{filePreview.votesCount}</b></div>
              </div>
            )}
          </div>

          <button
            onClick={handleExecuteRestore}
            disabled={isPending || !filePreview}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-pink-300/30 transition-all duration-300 transform active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
          >
            {isPending ? "Sedang Memulihkan..." : "Pulihkan / Restore Sekarang 🚀"}
          </button>
        </div>
      </div>

      {/* Danger Zone: Kosongkan Semua Data */}
      <div className={`border-2 rounded-3xl p-6 shadow-sm transition-all duration-300 ${
        hasBackedUp
          ? "bg-red-50/60 border-red-300"
          : "bg-slate-50/80 border-slate-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-bold flex items-center gap-2 ${
                hasBackedUp ? "text-red-600" : "text-slate-600"
              }`}>
                <span>🗑️</span>
                Kosongkan Semua Data (Reset Total Database)
              </h3>
              {hasBackedUp ? (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  ✓ Backup Terunduh (Tombol Aktif)
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  🔒 Terkunci (Wajib Backup Dulu)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Tindakan ini akan menghapus <b>semua pasangan calon kandidat</b>, <b>seluruh data pemilih (DPT) & token</b>, serta <b>semua rekap suara</b> yang masuk. <b>Akun login administrator tetap aman dan tidak akan terhapus.</b> Anda <b>wajib mengunduh backup</b> terlebih dahulu sebelum tombol ini dapat diklik.
            </p>
          </div>

          <button
            onClick={handleWipeDatabase}
            disabled={isPending || !hasBackedUp}
            title={!hasBackedUp ? "Unduh file backup terlebih dahulu untuk membuka tombol ini" : "Kosongkan semua data"}
            className={`font-bold py-3.5 px-6 rounded-2xl text-xs transition-all duration-300 whitespace-nowrap shadow-sm active:scale-95 flex items-center gap-2 ${
              hasBackedUp
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200 cursor-pointer"
                : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60"
            }`}
          >
            {hasBackedUp ? (
              <>
                <span>🗑️</span>
                <span>Kosongkan Semua Data</span>
              </>
            ) : (
              <>
                <span>🔒</span>
                <span>Terkunci (Backup Dulu)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


