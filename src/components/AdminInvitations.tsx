"use client";

import { useState } from "react";

interface Voter {
  id: string;
  code: string | null;
  name: string | null;
  className: string;
  token: string;
  voted: boolean;
}

interface Settings {
  title: string;
  activePilcosis: boolean;
  activePks: boolean;
  activeMpk: boolean;
  schoolName?: string;
  eventDate?: string;
  eventTime?: string;
  eventPlace?: string;
  committeeChairman?: string;
  signatureCity?: string;
}

interface AdminInvitationsProps {
  initialVoters: Voter[];
  settings: Settings;
}

export default function AdminInvitations({ initialVoters, settings }: AdminInvitationsProps) {
  const [voters] = useState<Voter[]>(initialVoters);
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [customSchoolName, setCustomSchoolName] = useState(
    settings.schoolName || "SMA / SMK NEGERI 1 INDONESIA"
  );
  const [customDate, setCustomDate] = useState(
    settings.eventDate || "Senin, 15 September 2026"
  );
  const [customTime, setCustomTime] = useState(
    settings.eventTime || "08:00 - 12:00 WIB"
  );
  const [customPlace, setCustomPlace] = useState(
    settings.eventPlace || "Bilik Suara Lab Komputer"
  );

  const committeeChairman = settings.committeeChairman || "Ketua Panitia";
  const signatureCity = settings.signatureCity || "Karangasem";

  // Format tanggal tanda tangan
  const formattedSignatureDate = (() => {
    if (!customDate) return `${signatureCity}, 15 September 2026`;
    const parts = customDate.split(",");
    if (parts.length > 1) {
      return `${signatureCity},${parts.slice(1).join(",")}`;
    }
    return `${signatureCity}, ${customDate}`;
  })();

  const classes = Array.from(new Set(voters.map((v) => v.className))).sort();

  const filteredVoters = voters.filter((v) => {
    const matchClass = selectedClass === "ALL" || v.className === selectedClass;
    const matchSearch =
      (v.code && v.code.toLowerCase().includes(search.toLowerCase())) ||
      (v.name && v.name.toLowerCase().includes(search.toLowerCase())) ||
      v.token.includes(search);
    return matchClass && matchSearch;
  });

  const handleOpenPrintTab = () => {
    const queryParams = new URLSearchParams({
      class: selectedClass,
      q: search,
      school: customSchoolName,
      date: customDate,
      time: customTime,
      place: customPlace,
      showToken: showToken ? "1" : "0",
    });

    window.open(`/admin/print-invitations?${queryParams.toString()}`, "_blank");
  };

  const electionLabels = [];
  if (settings.activePilcosis) electionLabels.push("PILKOSIS (Ketua & Wakil OSIS)");
  if (settings.activePks) electionLabels.push("PKS (Patroli Keamanan Sekolah)");
  if (settings.activeMpk) electionLabels.push("MPK (Majelis Perwakilan Kelas)");
  const electionText = electionLabels.join(" • ");

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full">
      {/* Control Panel */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">✉️</span>
              <span>Cetak <span className="text-gradient-vivid">Surat Panggilan Pemilih</span></span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Buka lembar cetak khusus berformat <b>tepat 10 kartu surat panggilan per halaman A4</b> di tab baru dengan TTD di atas kotak token panjang.
            </p>
          </div>

          <button
            onClick={handleOpenPrintTab}
            disabled={filteredVoters.length === 0}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-violet-300/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 text-xs sm:text-sm"
          >
            <span>🖨️</span> Buka Tab Cetak (10 Kartu / Lembar A4) ({filteredVoters.length}) ↗
          </button>
        </div>

        {/* Setting Kartu Undangan */}
        <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-1.5">
              Nama Sekolah / Instansi
            </label>
            <input
              type="text"
              value={customSchoolName}
              onChange={(e) => setCustomSchoolName(e.target.value)}
              className="w-full bg-violet-50/50 border border-violet-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-1.5">
              Hari & Tanggal Pelaksanaan
            </label>
            <input
              type="text"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full bg-violet-50/50 border border-violet-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-1.5">
              Waktu / Jam TPS
            </label>
            <input
              type="text"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full bg-violet-50/50 border border-violet-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-violet-600 uppercase tracking-wider mb-1.5">
              Lokasi / Ruangan TPS
            </label>
            <input
              type="text"
              value={customPlace}
              onChange={(e) => setCustomPlace(e.target.value)}
              className="w-full bg-violet-50/50 border border-violet-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Opsi Isi Token */}
        <div className="bg-white border border-violet-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-wider shrink-0">
            Kotak Token:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowToken(false)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border-2 ${
                !showToken
                  ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-300/30"
                  : "bg-white text-slate-600 border-violet-200 hover:border-violet-400 hover:bg-violet-50"
              }`}
            >
              ⬜ Kosong (Diisi Panitia)
            </button>
            <button
              onClick={() => setShowToken(true)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border-2 ${
                showToken
                  ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-300/30"
                  : "bg-white text-slate-600 border-violet-200 hover:border-violet-400 hover:bg-violet-50"
              }`}
            >
              🔢 Isi Token Otomatis
            </button>
          </div>
          <span className="text-[11px] text-slate-400">
            {showToken ? "Token 6 angka akan tercetak di kotak." : "Kotak token dikosongkan, diisi manual oleh petugas."}
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-violet-100 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="🔍 Cari nama, kode, token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-violet-50/50 border border-violet-200 rounded-xl py-2 px-3 text-xs text-slate-700 w-full sm:w-64 focus:outline-none focus:border-violet-500"
            />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-violet-50/50 border border-violet-200 rounded-xl py-2 px-3 text-xs text-slate-600 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">Semua Kelompok ({voters.length})</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  Kelompok: {c}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Menampilkan <b>{filteredVoters.length}</b> dari {voters.length} surat panggilan (<b>10 kartu per lembar kertas A4</b>)
          </div>
        </div>
      </div>

      {/* Grid of Invitations Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVoters.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white border border-violet-100 rounded-3xl">
            <span className="text-4xl block mb-3">✉️</span>
            <p className="font-medium text-sm">Tidak ada pemilih yang sesuai filter.</p>
          </div>
        ) : (
          filteredVoters.map((voter, index) => (
            <div
              key={voter.id}
              className="bg-white border-2 border-dashed border-violet-300 rounded-2xl p-3.5 shadow-xs relative overflow-hidden flex flex-col justify-between"
            >
              {/* Header Surat */}
              <div className="border-b border-violet-200 pb-1.5 flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-none">
                    {customSchoolName}
                  </h3>
                  <h4 className="text-[9px] font-bold text-violet-700 tracking-wide mt-0.5">
                    SURAT PANGGILAN PEMILIH ELEKTRONIK
                  </h4>
                  <p className="text-[7.5px] text-pink-600 font-bold uppercase leading-none mt-0.5">
                    {electionText}
                  </p>
                </div>
                <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-black text-[9px] shadow-xs">
                  TPS
                </div>
              </div>

              {/* Tengah: Data Pemilih (Kiri) & TTD Panitia (Kanan) */}
              <div className="grid grid-cols-12 gap-2 my-2 items-center">
                {/* Data Pemilih */}
                <div className="col-span-7 space-y-0.5 text-slate-700 text-[10px] leading-tight">
                  <div className="flex">
                    <span className="w-16 text-slate-400 text-[9px]">KODE/NIS</span>
                    <span className="font-mono font-bold">: {voter.code || "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-16 text-slate-400 text-[9px]">NAMA</span>
                    <span className="font-bold truncate">: {voter.name || "(Nama Siswa)"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-16 text-slate-400 text-[9px]">KELAS</span>
                    <span className="font-semibold text-violet-700">: {voter.className}</span>
                  </div>
                  <div className="flex">
                    <span className="w-16 text-slate-400 text-[9px]">WAKTU</span>
                    <span className="truncate">: {customTime}</span>
                  </div>
                  <div className="flex">
                    <span className="w-16 text-slate-400 text-[9px]">LOKASI</span>
                    <span className="truncate">: {customPlace}</span>
                  </div>
                </div>

                {/* TTD Ketua Panitia */}
                <div className="col-span-5 text-right flex flex-col items-end justify-center text-[8px] space-y-0.5">
                  <span className="text-[7px] text-slate-500 block leading-none truncate max-w-full">
                    {formattedSignatureDate}
                  </span>
                  <span className="font-bold text-slate-800 block leading-none mt-0.5">
                    Ketua Panitia,
                  </span>

                  {/* Preview TTD */}
                  <div className="h-6 w-16 relative flex items-center justify-end">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/ttd.png"
                      alt="TTD"
                      className="max-h-6 max-w-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>

                  <span className="font-bold underline text-[7.5px] text-slate-800 block leading-none truncate max-w-full">
                    {committeeChairman}
                  </span>
                </div>
              </div>

              {/* Bawah: Kotak Token Panjang Penuh */}
              <div className="bg-violet-50/70 border border-violet-300 rounded-xl p-1.5 flex items-center justify-between gap-1">
                <div>
                  <span className="text-[7.5px] font-black text-violet-800 uppercase tracking-wider block leading-none">
                    {showToken ? "TOKEN PEMILIH" : "KOTAK TOKEN (DIISI PANITIA)"}
                  </span>
                  <span className="text-[6.5px] text-slate-400 block mt-0.5 leading-none">
                    {showToken ? "Rahasia — jangan diperlihatkan" : "Ditulis petugas KPPS di TPS"}
                  </span>
                </div>
                {/* 6 Kotak Token */}
                <div className="flex items-center justify-center gap-1">
                  {voter.token.split("").map((digit, i) => (
                    <div
                      key={i}
                      className="w-5 h-6.5 border border-dashed border-violet-400 bg-white rounded flex items-center justify-center text-[7px] font-mono font-black text-violet-700"
                    >
                      {showToken ? digit : ""}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Petunjuk */}
              <div className="border-t border-slate-100 pt-1 mt-1.5 flex items-center justify-between text-[7.5px] text-slate-400 leading-none">
                <span>* Bawa kartu ini ke bilik TPS saat pemilihan</span>
                <span className="font-mono font-bold text-slate-500">#{index + 1}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
