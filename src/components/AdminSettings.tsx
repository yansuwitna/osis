"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateElectionSettings } from "@/lib/actions";
import Swal from "sweetalert2";

interface Settings {
  id: string;
  title: string;
  activePilcosis: boolean;
  activePks: boolean;
  activeMpk: boolean;
  schoolName?: string;
  eventDate?: string;
  eventTime?: string;
  eventPlace?: string;
  signatureCity?: string;
}

interface AdminSettingsProps {
  initialSettings: Settings;
}

export default function AdminSettings({ initialSettings }: AdminSettingsProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialSettings.title || "PEMILIHAN OSIS, PKS & MPK");
  const [schoolName, setSchoolName] = useState(initialSettings.schoolName || "SMA / SMK NEGERI 1 INDONESIA");
  const [eventDate, setEventDate] = useState(initialSettings.eventDate || "Senin, 15 September 2026");
  const [eventTime, setEventTime] = useState(initialSettings.eventTime || "08:00 - 12:00 WIB");
  const [eventPlace, setEventPlace] = useState(initialSettings.eventPlace || "Bilik Suara Lab Komputer");
  const [signatureCity, setSignatureCity] = useState(initialSettings.signatureCity || "Karangasem");

  const [activePilcosis, setActivePilcosis] = useState(initialSettings.activePilcosis);
  const [activePks, setActivePks] = useState(initialSettings.activePks);
  const [activeMpk, setActiveMpk] = useState(initialSettings.activeMpk);
  const [isPending, startTransition] = useTransition();

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activePilcosis && !activePks && !activeMpk) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Minimal 1 Pemilihan",
        text: "Anda harus mengaktifkan minimal salah satu dari PILKOSIS, PKS, atau MPK!",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateElectionSettings({
          title,
          schoolName,
          eventDate,
          eventTime,
          eventPlace,
          signatureCity,
          activePilcosis,
          activePks,
          activeMpk,
        });

        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "Pengaturan Disimpan!",
            text: "Konfigurasi pemilihan dan informasi surat panggilan berhasil disimpan permanen ke database.",
            confirmButtonColor: "#7c3aed",
          });
          router.refresh();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Menyimpan",
            text: res.error,
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
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="text-3xl">⚙️</span>
          <span>Pengaturan <span className="text-gradient-vivid">Pemilihan & Surat Panggilan</span></span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Konfigurasikan judul pemilihan, identitas instansi, jadwal TPS, serta aktivasi pemilihan. Data akan tersimpan permanen di database.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Card 1: Informasi Sekolah & Surat Panggilan */}
        <div className="bg-white border border-violet-100 rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 text-sm">🏫</span>
            Identitas Sekolah / Instansi & Jadwal TPS
          </h3>
          <p className="text-xs text-slate-400">
            Informasi di bawah ini otomatis tampil pada <b>Surat Panggilan Pemilih</b> dan tidak akan berubah saat halaman di-refresh.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
                Nama Sekolah / Instansi
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: SMA NEGERI 1 JAKARTA"
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-slate-700 font-semibold focus:outline-none transition-all"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
                Judul Acara Pemilihan
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: PEMILIHAN KETUA OSIS, PKS & MPK 2026/2027"
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-slate-700 font-semibold focus:outline-none transition-all"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
                Hari & Tanggal Pelaksanaan
              </label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="Contoh: Senin, 15 September 2026"
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-slate-700 font-semibold focus:outline-none transition-all"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
                Waktu / Jam Pemilihan
              </label>
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="Contoh: 08:00 - 12:00 WIB"
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-slate-700 font-semibold focus:outline-none transition-all"
                disabled={isPending}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
                Tempat / Lokasi TPS
              </label>
              <input
                type="text"
                value={eventPlace}
                onChange={(e) => setEventPlace(e.target.value)}
                placeholder="Contoh: Bilik Suara Lab Komputer 1 & 2"
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-slate-700 font-semibold focus:outline-none transition-all"
                disabled={isPending}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
                Lokasi / Kota Tanda Tangan (TTD)
              </label>
              <input
                type="text"
                value={signatureCity}
                onChange={(e) => setSignatureCity(e.target.value)}
                placeholder="Contoh: Karangasem"
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-3 px-4 text-slate-700 font-semibold focus:outline-none transition-all"
                disabled={isPending}
                required
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Kota/lokasi ini akan dicantumkan di atas tanggal tanda tangan (misal: <b>{signatureCity || "Karangasem"}, 15 September 2026</b>) pada seluruh lembar cetak DPT dan Berita Acara.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Aktivasi Jenis Pemilihan */}
        <div className="bg-white border border-violet-100 rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 text-sm">🗳️</span>
            Aktivasi Jenis Pemilihan
          </h3>

          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Siswa yang masuk ke bilik suara akan melalui tahapan pemilihan yang dicentang di bawah ini secara berurutan:
            </p>

            {/* Toggle PILKOSIS */}
            <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              activePilcosis ? "bg-violet-50/80 border-violet-400 shadow-sm" : "bg-slate-50/60 border-slate-200 opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={activePilcosis}
                onChange={(e) => setActivePilcosis(e.target.checked)}
                className="mt-1 w-5 h-5 text-violet-600 rounded-lg focus:ring-violet-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 text-sm">1. PILKOSIS</span>
                  <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full">OSIS</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemilihan Ketua dan Wakil Ketua Organisasi Siswa Intra Sekolah (OSIS).
                </p>
              </div>
            </label>

            {/* Toggle PKS */}
            <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              activePks ? "bg-pink-50/80 border-pink-400 shadow-sm" : "bg-slate-50/60 border-slate-200 opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={activePks}
                onChange={(e) => setActivePks(e.target.checked)}
                className="mt-1 w-5 h-5 text-pink-600 rounded-lg focus:ring-pink-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 text-sm">2. PKS</span>
                  <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Keamanan</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemilihan Koordinator / Ketua Patroli Keamanan Sekolah (PKS).
                </p>
              </div>
            </label>

            {/* Toggle MPK */}
            <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              activeMpk ? "bg-amber-50/80 border-amber-400 shadow-sm" : "bg-slate-50/60 border-slate-200 opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={activeMpk}
                onChange={(e) => setActiveMpk(e.target.checked)}
                className="mt-1 w-5 h-5 text-amber-600 rounded-lg focus:ring-amber-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 text-sm">3. MPK</span>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Perwakilan Kelas</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemilihan Ketua & Anggota Majelis Perwakilan Kelas (MPK).
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-violet-300/30 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-base"
        >
          {isPending ? "Menyimpan ke Database..." : "Simpan Seluruh Pengaturan 💾"}
        </button>
      </form>
    </div>
  );
}

