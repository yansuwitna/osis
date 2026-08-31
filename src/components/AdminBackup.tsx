"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { backupAllData, restoreAllData, wipeSelectedData, WipeOptions } from "@/lib/actions";
import Swal from "sweetalert2";

export default function AdminBackup() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<{
    exportedAt?: string;
    appName?: string;
    schoolName?: string;
    eventDate?: string;
    committeeChairman?: string;
    candidatesCount?: number;
    votersCount?: number;
    votesCount?: number;
    rawJson?: string;
  } | null>(null);

  // State Modal Pilihan Kosongkan Data
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [wipeOptions, setWipeOptions] = useState<WipeOptions>({
    deleteVotes: true,
    deleteVoters: false,
    deleteCandidates: false,
    resetSettings: false,
  });

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
            text: "Simpan file backup .json ini di tempat yang aman. Fitur 'Kosongkan / Bersihkan Data' sekarang telah terbuka.",
            confirmButtonColor: "#7c3aed",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Backup",
            text: res.error || "Terjadi kesalahan saat membuat backup.",
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      Swal.fire({
        icon: "error",
        title: "Format Salah",
        text: "Hanya file format JSON (.json) yang didukung untuk restore backup!",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    setRestoreFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.backup_meta && !parsed.candidates && !parsed.voters) {
          throw new Error("Struktur file backup tidak valid!");
        }

        setFilePreview({
          exportedAt: parsed.backup_meta?.exported_at,
          appName: parsed.backup_meta?.app,
          schoolName: parsed.data?.settings?.schoolName || "-",
          eventDate: parsed.data?.settings?.eventDate || "-",
          committeeChairman: parsed.data?.settings?.committeeChairman || "-",
          candidatesCount: parsed.data?.candidates?.length || 0,
          votersCount: parsed.data?.voters?.length || 0,
          votesCount: parsed.data?.votes?.length || 0,
          rawJson: content,
        });
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "File Rusak",
          text: "Gagal membaca file backup: " + err.message,
          confirmButtonColor: "#dc2626",
        });
        setRestoreFile(null);
        setFilePreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!filePreview?.rawJson) return;

    const confirm = await Swal.fire({
      title: "Konfirmasi Restore Data?",
      html: `
        <div style="text-align:left;font-size:0.85rem;color:#475569;background:#f8fafc;padding:12px;border-radius:12px;border:1px solid #e2e8f0;">
          <p style="font-weight:bold;color:#dc2626;margin-bottom:6px;">⚠️ PERHATIAN PENTING:</p>
          <p style="margin-bottom:4px;">Proses restore akan <b>mengganti seluruh data saat ini</b> dengan data dari file backup:</p>
          <ul style="list-style-type:disc;padding-left:18px;margin:0;">
            <li>Kandidat: <b>${filePreview.candidatesCount} orang</b></li>
            <li>DPT / Pemilih: <b>${filePreview.votersCount} orang</b></li>
            <li>Rekap Suara: <b>${filePreview.votesCount} suara</b></li>
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
        Swal.fire({
          title: "Memulihkan Database...",
          text: "Mohon tunggu sebentar, data sedang dipulihkan...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await restoreAllData(filePreview.rawJson!);
        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "Restore Berhasil! 🎉",
            text: "Database berhasil dipulihkan sesuai file cadangan.",
            confirmButtonColor: "#7c3aed",
          });
          setRestoreFile(null);
          setFilePreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          router.refresh();
          window.location.reload();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Restore",
            text: res.error || "Terjadi kesalahan saat restore.",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Terjadi kesalahan sistem: " + err.message,
          confirmButtonColor: "#dc2626",
        });
      }
    });
  };

  const handleOpenWipeModal = () => {
    if (!hasBackedUp) {
      Swal.fire({
        icon: "warning",
        title: "Backup Diperlukan!",
        text: "Anda disarankan mengunduh file backup terlebih dahulu sebelum mengosongkan atau membersihkan data pemilihan!",
        confirmButtonColor: "#7c3aed",
        confirmButtonText: "Saya Mengerti",
      });
      return;
    }
    setIsWipeModalOpen(true);
  };

  const handleExecuteWipe = async () => {
    const selectedCount = [
      wipeOptions.deleteVotes,
      wipeOptions.deleteVoters,
      wipeOptions.deleteCandidates,
      wipeOptions.resetSettings,
    ].filter(Boolean).length;

    if (selectedCount === 0) {
      Swal.fire({
        icon: "info",
        title: "Pilih Setidaknya 1 Kategori",
        text: "Silakan centang data yang ingin Anda kosongkan terlebih dahulu.",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    // Bangun teks ringkasan untuk konfirmasi
    const itemsList: string[] = [];
    if (wipeOptions.deleteVotes && !wipeOptions.deleteVoters) {
      itemsList.push("<b>Hasil Suara / Rekap Voting</b> (Suara kembali 0, status pemilih di-reset, <u>akun siswa & token TETAP ADA</u>)");
    }
    if (wipeOptions.deleteVoters) {
      itemsList.push("<b>Data Pemilih (DPT) & Token</b> (Semua akun siswa, token, dan suara akan dihapus)");
    }
    if (wipeOptions.deleteCandidates) {
      itemsList.push("<b>Data Kandidat / Paslon</b> (Seluruh paslon PILKOSIS, PKS, MPK dihapus)");
    }
    if (wipeOptions.resetSettings) {
      itemsList.push("<b>Pengaturan Pemilihan & Data Panitia</b> (Direset ke default)");
    }

    const confirm = await Swal.fire({
      title: "Konfirmasi Pembersihan Data?",
      html: `
        <div style="text-align:left;font-size:0.82rem;color:#dc2626;background:#fef2f2;padding:12px;border-radius:12px;border:1px solid #fecaca;margin-top:8px;">
          <p style="font-weight:bold;margin-bottom:6px;">⚠️ Data yang akan dibersihkan (${selectedCount} kategori):</p>
          <ul style="list-style-type:disc;padding-left:18px;margin:0;color:#991b1b;line-height:1.6;">
            ${itemsList.map(item => `<li>${item}</li>`).join("")}
          </ul>
          <p style="margin-top:8px;font-size:0.75rem;color:#059669;font-weight:bold;">🛡️ Akun Login Admin TIDAK AKAN terhapus dan tetap aktif.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Bersihkan Sekarang!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    setIsWipeModalOpen(false);

    startTransition(async () => {
      try {
        Swal.fire({
          title: "Membersihkan Data...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await wipeSelectedData(wipeOptions);
        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "Data Berhasil Dibersihkan! ✨",
            text: "Data yang Anda pilih telah berhasil dikosongkan/direset sesuai permintaan.",
            confirmButtonColor: "#7c3aed",
          });
          router.refresh();
          window.location.reload();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Membersihkan Data",
            text: res.error || "Terjadi kesalahan.",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Terjadi kesalahan sistem: " + err.message,
          confirmButtonColor: "#dc2626",
        });
      }
    });
  };

  const selectedOptionsCount = [
    wipeOptions.deleteVotes,
    wipeOptions.deleteVoters,
    wipeOptions.deleteCandidates,
    wipeOptions.resetSettings,
  ].filter(Boolean).length;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="text-3xl">💾</span>
          <span>Backup & <span className="text-gradient-vivid">Restore Data</span></span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Cadangkan seluruh data pemilihan ke file JSON, pulihkan dari cadangan, atau kosongkan data secara fleksibel untuk persiapan pemilihan baru.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel 1: Download Backup */}
        <div className="bg-white border border-violet-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-100 text-violet-700 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xs">
                📥
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">1. Unduh Cadangan (Backup)</h2>
                <p className="text-xs text-slate-400">Ekspor seluruh data pemilihan ke file JSON terenkripsi</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Data yang dicadangkan mencakup: <b>identitas pemilihan & jadwal</b>, <b>data seluruh paslon/kandidat & foto</b>, <b>daftar pemilih (DPT) & token</b>, serta <b>seluruh rekapitulasi suara yang masuk</b>.
            </p>

            <div className="bg-violet-50/60 border border-violet-200/70 rounded-2xl p-4 space-y-2">
              <span className="text-[11px] text-violet-700 font-bold block uppercase tracking-wider">
                🛡️ Manfaat Backup Berkala:
              </span>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Arsip rekapitulasi hasil pleno pemilihan resmi</li>
                <li>Penyelamat data saat pergantian server / perangkat</li>
                <li>Syarat wajib sebelum melakukan pembersihan data pemilihan</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-violet-300/30 transition-all duration-300 transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            <span>💾</span>
            {isPending ? "Membuat Cadangan..." : "Unduh File Backup (.json)"}
          </button>
        </div>

        {/* Panel 2: Restore Backup */}
        <div className="bg-white border border-violet-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xs">
                📤
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">2. Pulihkan Data (Restore)</h2>
                <p className="text-xs text-slate-400">Kembalikan data pemilihan dari file cadangan .json</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-pink-200 hover:border-pink-300 rounded-2xl p-4 text-center transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="restore-file-input"
              />
              <label
                htmlFor="restore-file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <span className="text-3xl">📁</span>
                <span className="text-xs font-bold text-pink-600 hover:text-pink-700">
                  {restoreFile ? restoreFile.name : "Klik untuk Pilih File Backup .json"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {restoreFile ? `${(restoreFile.size / 1024).toFixed(1)} KB` : "Pilih file yang sebelumnya diunduh dari menu Backup"}
                </span>
              </label>
            </div>

            {/* Preview Isi File Restore */}
            {filePreview && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700 border-b border-slate-200 pb-1.5">
                  <span>Pratinjau File Cadangan</span>
                  <span className="text-[10px] text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md font-mono">Valid JSON</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Sekolah: <b className="text-slate-800 block truncate">{filePreview.schoolName}</b></div>
                  <div>Tanggal: <b className="text-slate-800 block truncate">{filePreview.eventDate}</b></div>
                  <div>Kandidat: <b className="text-violet-700">{filePreview.candidatesCount} paslon</b></div>
                  <div>Pemilih (DPT): <b className="text-violet-700">{filePreview.votersCount} pemilih</b></div>
                  <div className="col-span-2">Rekap Suara: <b className="text-emerald-700">{filePreview.votesCount} surat suara</b></div>
                </div>
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

      {/* Danger Zone: Kosongkan / Bersihkan Data */}
      <div className={`border-2 rounded-3xl p-6 shadow-sm transition-all duration-300 ${
        hasBackedUp
          ? "bg-red-50/60 border-red-300"
          : "bg-slate-50/80 border-slate-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-base font-bold flex items-center gap-2 ${
                hasBackedUp ? "text-red-600" : "text-slate-600"
              }`}>
                <span>🗑️</span>
                Kosongkan / Bersihkan Data Pemilihan
              </h3>
              {hasBackedUp ? (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  ✓ Backup Terunduh (Fitur Terbuka)
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  🔒 Terkunci (Wajib Backup Dulu)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Anda dapat <b>memilih secara fleksibel</b> data mana yang ingin dihapus (misalnya: <b>hanya reset hasil voting suara saja</b> tanpa menghapus akun siswa & token, atau menghapus kandidat, atau reset total). <b>Akun login admin selalu aman & tidak akan pernah terhapus.</b>
            </p>
          </div>

          <button
            onClick={handleOpenWipeModal}
            disabled={isPending || !hasBackedUp}
            title={!hasBackedUp ? "Unduh file backup terlebih dahulu untuk membuka tombol ini" : "Buka pilihan kosongkan data"}
            className={`font-bold py-3.5 px-6 rounded-2xl text-xs transition-all duration-300 whitespace-nowrap shadow-sm active:scale-95 flex items-center gap-2 ${
              hasBackedUp
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200 cursor-pointer"
                : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60"
            }`}
          >
            {hasBackedUp ? (
              <>
                <span>🗑️</span>
                <span>Pilih Data yang Dikosongkan...</span>
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

      {/* Modal Dialog Pilihan Kosongkan Data */}
      {isWipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-red-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span>🗑️</span> Pilihan Data yang Ingin Dihapus
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Centang kategori data yang ingin Anda kosongkan / reset ke awal.
                </p>
              </div>
              <button
                onClick={() => setIsWipeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Presets Cepat */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                ⚡ Pilihan Cepat (Preset):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWipeOptions({
                    deleteVotes: true,
                    deleteVoters: false,
                    deleteCandidates: false,
                    resetSettings: false,
                  })}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    wipeOptions.deleteVotes && !wipeOptions.deleteVoters && !wipeOptions.deleteCandidates && !wipeOptions.resetSettings
                      ? "border-violet-500 bg-violet-50 text-violet-800 font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="block font-bold">🗳️ Hanya Suara</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Akun pemilih tetap aman</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWipeOptions({
                    deleteVotes: true,
                    deleteVoters: true,
                    deleteCandidates: false,
                    resetSettings: false,
                  })}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    wipeOptions.deleteVotes && wipeOptions.deleteVoters && !wipeOptions.deleteCandidates && !wipeOptions.resetSettings
                      ? "border-violet-500 bg-violet-50 text-violet-800 font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="block font-bold">👥 Pemilih & Suara</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Kandidat tetap aman</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWipeOptions({
                    deleteVotes: true,
                    deleteVoters: true,
                    deleteCandidates: true,
                    resetSettings: true,
                  })}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    wipeOptions.deleteVotes && wipeOptions.deleteVoters && wipeOptions.deleteCandidates && wipeOptions.resetSettings
                      ? "border-red-500 bg-red-50 text-red-800 font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="block font-bold">🧹 Reset Total</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Kosongkan semua</span>
                </button>
              </div>
            </div>

            {/* Checkbox Options List */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pilih Detail Centang:
              </span>

              {/* 1. Hasil Suara */}
              <label className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                wipeOptions.deleteVotes ? "bg-amber-50/80 border-amber-300" : "bg-white border-slate-200 hover:bg-slate-50"
              }`}>
                <input
                  type="checkbox"
                  checked={wipeOptions.deleteVotes || false}
                  onChange={(e) => setWipeOptions({ ...wipeOptions, deleteVotes: e.target.checked })}
                  className="mt-1 w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🗳️</span>
                    <span className="text-xs font-black text-slate-800">Hasil Suara / Rekap Voting</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Menghapus seluruh surat suara yang masuk (suara kembali 0) dan mereset status pemilih menjadi <i>Belum Memilih</i>. <b>Akun pemilih dan token tetap aman dan tidak akan terhapus.</b>
                  </p>
                </div>
              </label>

              {/* 2. Data Pemilih (DPT) & Token */}
              <label className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                wipeOptions.deleteVoters ? "bg-red-50/80 border-red-300" : "bg-white border-slate-200 hover:bg-slate-50"
              }`}>
                <input
                  type="checkbox"
                  checked={wipeOptions.deleteVoters || false}
                  onChange={(e) => setWipeOptions({ ...wipeOptions, deleteVoters: e.target.checked })}
                  className="mt-1 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">👥</span>
                    <span className="text-xs font-black text-slate-800">Data Pemilih (DPT) & Token</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Menghapus seluruh daftar pemilih (nama siswa, NIS, kelas) beserta token unik 6 angka. <i>(Otomatis menghapus surat suara terkait)</i>.
                  </p>
                </div>
              </label>

              {/* 3. Data Kandidat / Paslon */}
              <label className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                wipeOptions.deleteCandidates ? "bg-red-50/80 border-red-300" : "bg-white border-slate-200 hover:bg-slate-50"
              }`}>
                <input
                  type="checkbox"
                  checked={wipeOptions.deleteCandidates || false}
                  onChange={(e) => setWipeOptions({ ...wipeOptions, deleteCandidates: e.target.checked })}
                  className="mt-1 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">👔</span>
                    <span className="text-xs font-black text-slate-800">Data Kandidat / Paslon</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Menghapus semua data pasangan calon ketua & wakil OSIS, PKS, dan MPK beserta foto dan visi misinya.
                  </p>
                </div>
              </label>

              {/* 4. Pengaturan Pemilihan & Data Panitia */}
              <label className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                wipeOptions.resetSettings ? "bg-red-50/80 border-red-300" : "bg-white border-slate-200 hover:bg-slate-50"
              }`}>
                <input
                  type="checkbox"
                  checked={wipeOptions.resetSettings || false}
                  onChange={(e) => setWipeOptions({ ...wipeOptions, resetSettings: e.target.checked })}
                  className="mt-1 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">⚙️</span>
                    <span className="text-xs font-black text-slate-800">Pengaturan Pemilihan & Panitia</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Mengembalikan nama sekolah, jadwal TPS, lokasi bilik suara, serta nama Ketua Panitia, Sekretaris, dan Kepala Sekolah ke pengaturan default.
                  </p>
                </div>
              </label>
            </div>

            {/* Admin Safety Notice */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
              <span className="text-xl">🛡️</span>
              <p className="text-xs text-emerald-800 font-medium">
                <b>Akun Login Administrator:</b> Selalu aman dan <b>tidak akan pernah terhapus</b> oleh operasi pembersihan apa pun.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsWipeModalOpen(false)}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-5 rounded-xl text-xs transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteWipe}
                disabled={selectedOptionsCount === 0}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>🗑️</span>
                <span>Bersihkan Data ({selectedOptionsCount} Kategori Dipilih)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
