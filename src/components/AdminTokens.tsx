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
  schoolName?: string;
  eventDate?: string;
}

interface AdminTokensProps {
  initialVoters: Voter[];
  settings: Settings;
}

export default function AdminTokens({ initialVoters, settings }: AdminTokensProps) {
  const [voters] = useState<Voter[]>(initialVoters);
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState<30 | 60>(30);

  const classes = Array.from(new Set(voters.map((v) => v.className))).sort();

  const filteredVoters = voters.filter((v) => {
    const matchClass = selectedClass === "ALL" || v.className === selectedClass;
    const matchSearch =
      !search ||
      (v.code && v.code.toLowerCase().includes(search.toLowerCase())) ||
      (v.name && v.name.toLowerCase().includes(search.toLowerCase())) ||
      v.token.includes(search) ||
      v.className.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  const totalPages = Math.ceil(filteredVoters.length / perPage);
  const gridLabel = perPage === 30 ? "3 kolom × 10 baris" : "3 kolom × 20 baris";

  const handleOpenPrintTab = () => {
    const queryParams = new URLSearchParams({
      class: selectedClass,
      q: search,
      perPage: String(perPage),
    });

    window.open(`/admin/print-tokens?${queryParams.toString()}`, "_blank");
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">🎟️</span>
            <span>Cetak <span className="text-gradient-vivid">Token Pemilih</span></span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Cetak potongan token untuk dibagikan ke pemilih. Format <b>{perPage} token per lembar A4</b> ({gridLabel}), siap dipotong-potong.
          </p>
        </div>

        <button
          onClick={handleOpenPrintTab}
          disabled={filteredVoters.length === 0}
          className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-violet-300/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 text-xs sm:text-sm"
        >
          <span>🖨️</span> Cetak Token ({filteredVoters.length} / {totalPages} Lembar A4) ↗
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-violet-100 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center font-bold text-lg">
            🎟️
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Token</span>
            <div className="text-xl font-black text-slate-800">{voters.length}</div>
          </div>
        </div>

        <div className="bg-white border border-pink-100 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 bg-pink-100 text-pink-700 rounded-xl flex items-center justify-center font-bold text-lg">
            📄
          </div>
          <div>
            <span className="text-[11px] text-pink-600 font-semibold uppercase">Lembar A4 Dibutuhkan</span>
            <div className="text-xl font-black text-pink-700">{totalPages}</div>
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-lg">
            ✂️
          </div>
          <div>
            <span className="text-[11px] text-emerald-600 font-semibold uppercase">Token per Lembar</span>
            <div className="text-xl font-black text-emerald-700">{perPage}</div>
          </div>
        </div>
      </div>

      {/* Pilihan Format & Filter */}
      <div className="bg-white border border-violet-100 rounded-2xl p-4 shadow-sm space-y-4">
        {/* Format Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-wider shrink-0">
            Format Cetak:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPerPage(30)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border-2 ${
                perPage === 30
                  ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-300/30"
                  : "bg-white text-slate-600 border-violet-200 hover:border-violet-400 hover:bg-violet-50"
              }`}
            >
              📄 30 Token / A4
              <span className="block text-[10px] font-medium mt-0.5 opacity-80">3 Kolom × 10 Baris</span>
            </button>
            <button
              onClick={() => setPerPage(60)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border-2 ${
                perPage === 60
                  ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-300/30"
                  : "bg-white text-slate-600 border-violet-200 hover:border-violet-400 hover:bg-violet-50"
              }`}
            >
              📄 60 Token / A4
              <span className="block text-[10px] font-medium mt-0.5 opacity-80">3 Kolom × 20 Baris</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-3 border-t border-violet-100">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="🔍 Cari nama, kode, token, kelas..."
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
            Menampilkan <b>{filteredVoters.length}</b> dari {voters.length} token (<b>{perPage} token per lembar A4</b>)
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white border border-violet-100 rounded-3xl p-5 sm:p-6 shadow-sm w-full">
        <h3 className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-4">
          Pratinjau Token ({filteredVoters.length})
        </h3>
        <div className="w-full overflow-x-auto">
          {filteredVoters.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <span className="text-4xl block mb-3">🎟️</span>
              <p className="font-medium text-xs sm:text-sm">Tidak ada data token yang sesuai filter.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 bg-white shadow-xs z-10">
                <tr className="border-b-2 border-violet-100 font-bold text-violet-600 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pr-4 w-14 text-center">NO</th>
                  <th className="pb-3 pr-4">NAMA LENGKAP</th>
                  <th className="pb-3 pr-4">KELOMPOK / KELAS</th>
                  <th className="pb-3 pr-4">TOKEN 6 ANGKA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50">
                {filteredVoters.map((voter, index) => (
                  <tr key={voter.id} className="hover:bg-violet-50/50 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-slate-400 text-center">{index + 1}</td>
                    <td className="py-3 pr-4 font-medium text-slate-800">{voter.name || "(Nama Siswa)"}</td>
                    <td className="py-3 pr-4">
                      <span className="bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 rounded-md font-semibold text-[11px]">
                        {voter.className}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono font-extrabold text-pink-600 tracking-widest text-xs sm:text-sm">
                      {voter.token}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
