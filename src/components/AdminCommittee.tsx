"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateElectionSettings } from "@/lib/actions";
import Swal from "sweetalert2";

interface ElectionSetting {
  id: string;
  activePilcosis: boolean;
  activePks: boolean;
  activeMpk: boolean;
  title: string;
  schoolName: string;
  eventDate: string;
  eventTime: string;
  eventPlace: string;
  committeeChairman?: string;
  committeeSecretary?: string;
  headmasterName?: string;
  headmasterNip?: string;
}

interface AdminCommitteeProps {
  settings: ElectionSetting;
}

export default function AdminCommittee({ settings }: AdminCommitteeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [committeeChairman, setCommitteeChairman] = useState(settings.committeeChairman || "Ketua Panitia");
  const [committeeSecretary, setCommitteeSecretary] = useState(settings.committeeSecretary || "Sekretaris Panitia");
  const [headmasterName, setHeadmasterName] = useState(settings.headmasterName || "Kepala Sekolah");
  const [headmasterNip, setHeadmasterNip] = useState(settings.headmasterNip || "-");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const res = await updateElectionSettings({
          activePilcosis: settings.activePilcosis,
          activePks: settings.activePks,
          activeMpk: settings.activeMpk,
          title: settings.title,
          schoolName: settings.schoolName,
          eventDate: settings.eventDate,
          eventTime: settings.eventTime,
          eventPlace: settings.eventPlace,
          committeeChairman,
          committeeSecretary,
          headmasterName,
          headmasterNip,
        });

        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "Tersimpan!",
            text: "Data Panitia & Pejabat Penandatangan berhasil diperbarui.",
            timer: 2000,
            showConfirmButton: false,
            confirmButtonColor: "#7c3aed",
          });
          router.refresh();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Menyimpan",
            text: res.error || "Terjadi kesalahan saat menyimpan pengaturan panitia.",
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

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="w-10 h-10 bg-violet-100 text-violet-700 rounded-2xl flex items-center justify-center font-bold text-lg">
            👔
          </span>
          <span>Data <span className="text-gradient-vivid">Panitia & Pejabat</span></span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Pengaturan nama Ketua Panitia, Sekretaris, dan Kepala Sekolah yang akan dicantumkan pada Berita Acara & Dokumen Cetak Pemilihan.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card Panitia Pelaksana */}
        <div className="bg-white border border-violet-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-violet-100">
            <div className="w-10 h-10 bg-violet-100 text-violet-700 rounded-2xl flex items-center justify-center font-bold text-lg">
              ✍️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Panitia Pemilihan / KPPS</h3>
              <p className="text-xs text-slate-400">Petugas penanggung jawab dan penandatangan dokumen pemilihan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">
                Nama Ketua Panitia / KPPS
              </label>
              <input
                type="text"
                value={committeeChairman}
                onChange={(e) => setCommitteeChairman(e.target.value)}
                placeholder="Contoh: I Putu Eka Pratama, S.Pd."
                className="w-full bg-violet-50/40 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-xs sm:text-sm text-slate-800 focus:outline-none transition-all font-medium"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Dicantumkan di tanda tangan lembar cetak DPT & Berita Acara</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">
                Nama Sekretaris Panitia
              </label>
              <input
                type="text"
                value={committeeSecretary}
                onChange={(e) => setCommitteeSecretary(e.target.value)}
                placeholder="Contoh: Ni Kadek Ayu Lestari"
                className="w-full bg-violet-50/40 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-xs sm:text-sm text-slate-800 focus:outline-none transition-all font-medium"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Mendampingi ketua panitia dalam administrasi</span>
            </div>
          </div>
        </div>

        {/* Card Kepala Sekolah / Pimpinan Instansi */}
        <div className="bg-white border border-violet-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-violet-100">
            <div className="w-10 h-10 bg-pink-100 text-pink-700 rounded-2xl flex items-center justify-center font-bold text-lg">
              🏫
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Pimpinan Instansi / Kepala Sekolah</h3>
              <p className="text-xs text-slate-400">Pengesahan / Mengetahui pada laporan dan rekapitulasi resmi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">
                Nama Kepala Sekolah / Pimpinan
              </label>
              <input
                type="text"
                value={headmasterName}
                onChange={(e) => setHeadmasterName(e.target.value)}
                placeholder="Contoh: Drs. I Wayan Sudiarta, M.Pd."
                className="w-full bg-violet-50/40 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-xs sm:text-sm text-slate-800 focus:outline-none transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">
                NIP / Identitas Pimpinan
              </label>
              <input
                type="text"
                value={headmasterNip}
                onChange={(e) => setHeadmasterNip(e.target.value)}
                placeholder="Contoh: 19780512 200501 1 008 (atau '-' jika tidak ada)"
                className="w-full bg-violet-50/40 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-xs sm:text-sm text-slate-800 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-violet-300/30 transition-all duration-300 transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isPending ? (
              <span>Menyimpan Data...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Simpan Data Panitia & Pejabat</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}