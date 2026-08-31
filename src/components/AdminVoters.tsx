"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteVoter } from "@/lib/actions";

interface Voter {
  id: string;
  code?: string | null;
  name?: string | null;
  token: string;
  className: string;
  voted: boolean;
  votedAt: Date | null;
}

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

interface AdminVotersProps {
  initialVoters: Voter[];
  settings?: ElectionSetting;
}

export default function AdminVoters({ initialVoters, settings }: AdminVotersProps) {
  const router = useRouter();
  const [voters] = useState<Voter[]>(initialVoters);
  const [isPending, startTransition] = useTransition();
  
  // State Filter Pencarian & Opsi Token
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("ALL");
  const [showToken, setShowToken] = useState(true);

  const schoolName = settings?.schoolName || "SMA / SMK NEGERI 1 INDONESIA";
  const electionTitle = settings?.title || "PEMILIHAN OSIS, PKS & MPK";
  const eventDate = settings?.eventDate || "Senin, 15 September 2026";
  const committeeChairman = settings?.committeeChairman || "Ketua Panitia";
  const committeeSecretary = settings?.committeeSecretary || "Sekretaris Panitia";
  const headmasterName = settings?.headmasterName || "Kepala Sekolah";
  const headmasterNip = settings?.headmasterNip || "-";

  const handleDeleteVoter = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pemilih ini?")) return;

    startTransition(async () => {
      try {
        const res = await deleteVoter(id);
        if (res.success) {
          router.refresh();
          window.location.reload();
        } else {
          alert(res.error || "Gagal menghapus pemilih.");
        }
      } catch {
        alert("Terjadi kesalahan sistem.");
      }
    });
  };

  const handleOpenPrintTab = () => {
    const queryParams = new URLSearchParams({
      class: filterClass,
      q: search,
      status: filterStatus,
      showToken: showToken ? "1" : "0",
    });

    window.open(`/admin/print-voters?${queryParams.toString()}`, "_blank");
  };

  const classes = Array.from(new Set(voters.map((v) => v.className))).sort();

  // Logika Pencarian & Filter
  const filteredVoters = voters.filter((v) => {
    const matchesSearch =
      (v.code && v.code.toLowerCase().includes(search.toLowerCase())) ||
      (v.name && v.name.toLowerCase().includes(search.toLowerCase())) ||
      v.token.toLowerCase().includes(search.toLowerCase()) ||
      v.className.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "voted" && v.voted) || 
      (filterStatus === "not_voted" && !v.voted);

    const matchesClass = filterClass === "ALL" || v.className === filterClass;

    return matchesSearch && matchesStatus && matchesClass;
  });

  const totalVoted = voters.filter(v => v.voted).length;
  const totalNotVoted = voters.length - totalVoted;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">🖨️</span>
            <span>Cetak <span className="text-gradient-vivid">Daftar Pemilih (DPT)</span></span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Rekap daftar pemilih tetap (DPT), token unik 6 angka, paraf tanda tangan, dan status kehadiran di TPS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenPrintTab}
            disabled={filteredVoters.length === 0}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-violet-300/30 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
          >
            <span>🖨️</span> Cetak Daftar Pemilih ({filteredVoters.length}) ↗
          </button>
        </div>
      </div>

      {/* Quick Stats Banner (Hidden on print to keep clean official paper) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white border border-violet-100 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center font-bold text-lg">
            👥
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Pemilih DPT</span>
            <div className="text-xl font-black text-slate-800">{voters.length}</div>
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-lg">
            ✓
          </div>
          <div>
            <span className="text-[11px] text-emerald-600 font-semibold uppercase">Sudah Memilih (Hadir)</span>
            <div className="text-xl font-black text-emerald-700">{totalVoted}</div>
          </div>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold text-lg">
            ⏳
          </div>
          <div>
            <span className="text-[11px] text-amber-600 font-semibold uppercase">Belum Memilih</span>
            <div className="text-xl font-black text-amber-700">{totalNotVoted}</div>
          </div>
        </div>
      </div>

      {/* Tabel Data Token (Full Width) */}
      <div className="bg-white border border-violet-100 print:border-0 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col w-full min-h-[550px] print:p-0 print:shadow-none">
        {/* Filter & Search Toolbar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4 pb-4 border-b border-violet-100 print:hidden">
          <div className="relative w-full sm:flex-1">
            <input
              type="text"
              placeholder="🔍 Cari KODE, NAMA, KELAS, TOKEN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-2 px-3 text-xs text-slate-700 placeholder-violet-300 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Opsi Isi Token */}
            <div className="flex items-center gap-1 bg-violet-50/70 border-2 border-violet-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setShowToken(true)}
                className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                  showToken
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-violet-700"
                }`}
              >
                🔢 Isi Token
              </button>
              <button
                type="button"
                onClick={() => setShowToken(false)}
                className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                  !showToken
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-violet-700"
                }`}
              >
                ⬜ Tanpa Token
              </button>
            </div>

            {/* Filter Kelompok / Kelas */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-violet-50/50 border-2 border-violet-200 rounded-xl py-2 px-3 text-xs text-slate-600 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">Semua Kelompok ({voters.length})</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Filter Status Memilih */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-violet-50/50 border-2 border-violet-200 rounded-xl py-2 px-3 text-xs text-slate-600 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Semua Status</option>
              <option value="voted">Sudah Memilih</option>
              <option value="not_voted">Belum Memilih</option>
            </select>
          </div>
        </div>

        {/* Table Content (Full Width) */}
        <div className="w-full overflow-x-auto">
          {filteredVoters.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <span className="text-4xl block mb-3">📭</span>
              <p className="font-medium text-xs sm:text-sm">Tidak ada data token yang sesuai.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 bg-white shadow-xs z-10">
                <tr className="border-b-2 border-violet-100 font-bold text-violet-600 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pr-4 w-14 text-center">NO</th>
                  <th className="pb-3 pr-4">KODE / NIS</th>
                  <th className="pb-3 pr-4">NAMA LENGKAP</th>
                  {showToken && <th className="pb-3 pr-4">TOKEN 6 ANGKA</th>}
                  <th className="pb-3 pr-4">KELOMPOK / KELAS</th>
                  <th className="pb-3 pr-4 text-center">STATUS</th>
                  <th className="pb-3 text-right w-16">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50">
                {filteredVoters.map((voter, index) => (
                  <tr key={voter.id} className="hover:bg-violet-50/50 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-slate-400 text-center">{index + 1}</td>
                    <td className="py-3 pr-4 font-mono font-bold text-slate-700">{voter.code || "-"}</td>
                    <td className="py-3 pr-4 font-medium text-slate-800">{voter.name || "(Nama Siswa)"}</td>
                    {showToken && (
                      <td className="py-3 pr-4 font-mono font-extrabold text-pink-600 tracking-widest text-xs sm:text-sm">
                        {voter.token}
                      </td>
                    )}
                    <td className="py-3 pr-4">
                      <span className="bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 rounded-md font-semibold text-[11px]">
                        {voter.className}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      {voter.voted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold">
                          ✓ Sudah Memilih
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1 rounded-full text-[11px] font-bold">
                          ⏳ Belum Memilih
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteVoter(voter.id)}
                        disabled={isPending}
                        className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus Pemilih"
                      >
                        🗑️
                      </button>
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

