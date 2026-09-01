"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CandidateStats {
  id: string;
  type: string;
  noUrut: number;
  name: string;
  fullName: string;
  photoUrl?: string;
  votes: number;
}

interface StatsData {
  settings: {
    id: string;
    title: string;
    schoolName?: string;
    eventDate?: string;
    activePilcosis: boolean;
    activePks: boolean;
    activeMpk: boolean;
  };
  totalVoters: number;
  votesPilcosis: number;
  votesPks: number;
  votesMpk: number;
  chartData: CandidateStats[];
}

interface LiveResultsViewProps {
  initialStats: StatsData;
}

export default function LiveResultsView({ initialStats }: LiveResultsViewProps) {
  const [stats, setStats] = useState<StatsData>(initialStats);
  const [activeTab, setActiveTab] = useState<"PILKOSIS" | "PKS" | "MPK">("PILKOSIS");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStreamConnected, setIsStreamConnected] = useState(true);
  const [lastPushTime, setLastPushTime] = useState<Date>(new Date());

  // Set default active tab based on active election types
  useEffect(() => {
    if (stats.settings.activePilcosis) {
      setActiveTab("PILKOSIS");
    } else if (stats.settings.activePks) {
      setActiveTab("PKS");
    } else if (stats.settings.activeMpk) {
      setActiveTab("MPK");
    }
  }, [stats.settings.activePilcosis, stats.settings.activePks, stats.settings.activeMpk]);

  // Server-Sent Events (SSE) Real-Time Stream + Fallback Polling Cadangan
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    const fetchFallbackStats = async () => {
      try {
        const res = await fetch(`/api/stats?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const freshData = await res.json();
          if (isSubscribed && freshData && freshData.chartData) {
            setStats(freshData);
            setLastPushTime(new Date());
          }
        }
      } catch (err) {
        // silent fail on network blip
      }
    };

    const setupSSE = () => {
      try {
        eventSource = new EventSource("/api/live-stream");

        eventSource.onopen = () => {
          if (isSubscribed) setIsStreamConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            if (!event.data || event.data.startsWith(":")) return;
            const freshData = JSON.parse(event.data);
            if (isSubscribed && freshData && freshData.chartData) {
              setStats(freshData);
              setLastPushTime(new Date());
              setIsStreamConnected(true);
            }
          } catch (err) {
            console.error("Error parsing data stream SSE:", err);
          }
        };

        eventSource.onerror = () => {
          if (isSubscribed) {
            setIsStreamConnected(false);
          }
        };
      } catch (err) {
        console.error("Gagal inisialisasi SSE:", err);
        if (isSubscribed) setIsStreamConnected(false);
      }
    };

    setupSSE();

    // Fallback sync tiap 5 detik untuk mengantisipasi buffering proxy/Cloudflare atau cluster PM2
    fallbackInterval = setInterval(fetchFallbackStats, 5000);

    return () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const schoolName = stats.settings.schoolName || "SMA / SMK NEGERI 1 INDONESIA";
  const electionTitle = stats.settings.title || "PEMILIHAN OSIS DIGITAL";
  const eventDate = stats.settings.eventDate || "Senin, 15 September 2026";

  // Filter kandidat sesuai tab
  const tabCandidates = stats.chartData
    .filter((c) => c.type === activeTab)
    .sort((a, b) => a.noUrut - b.noUrut);

  const totalVotesForTab =
    activeTab === "PILKOSIS"
      ? stats.votesPilcosis
      : activeTab === "PKS"
      ? stats.votesPks
      : stats.votesMpk;

  const totalDpt = stats.totalVoters;
  const participationPercent = totalDpt > 0 ? ((totalVotesForTab / totalDpt) * 100).toFixed(1) : "0.0";
  const unvotedCount = Math.max(0, totalDpt - totalVotesForTab);

  // Cari kandidat tertinggi
  const maxVotes = Math.max(...tabCandidates.map((c) => c.votes), 0);

  const badgeGradients = [
    "from-violet-600 to-indigo-600",
    "from-pink-500 to-rose-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-cyan-500 to-blue-600",
  ];

  const progressGradients = [
    "bg-gradient-to-r from-violet-500 to-purple-600",
    "bg-gradient-to-r from-pink-500 to-rose-600",
    "bg-gradient-to-r from-amber-500 to-orange-500",
    "bg-gradient-to-r from-emerald-500 to-teal-500",
    "bg-gradient-to-r from-cyan-500 to-blue-500",
  ];

  return (
    <div className="min-h-screen bg-sacazio-hero bg-grid-pattern text-slate-800 flex flex-col selection:bg-violet-500 selection:text-white">
      {/* Decorative Background Glow */}
      <div className="fixed -top-24 left-1/4 w-[600px] h-72 bg-violet-400/20 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-72 bg-pink-400/20 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "3s" }} />

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-violet-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-white border-2 border-violet-200 rounded-2xl flex items-center justify-center p-1 shadow-md shadow-violet-200/50 overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo OSIS"
                className="max-h-9 max-w-9 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-sm sm:text-base leading-tight">
                  LIVE QUICK COUNT
                </span>
                <span className={`inline-flex items-center gap-1.5 border text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-all ${
                  isStreamConnected
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-300"
                    : "bg-amber-500/10 text-amber-700 border-amber-300"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isStreamConnected ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                  <span>{isStreamConnected ? "SSE STREAM AKTIF" : "MENYAMBUNGKAN..."}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                {schoolName} · {electionTitle}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs shadow-2xs transition-all"
              title="Mode Layar Penuh (Proyektor / TV)"
            >
              <span>{isFullscreen ? "🗗" : "🖥️"}</span>
              <span className="hidden md:inline ml-1">{isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}</span>
            </button>

            {/* Bilik Suara Link */}
            <Link
              href="/"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-violet-200 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>🗳️</span>
              <span className="hidden sm:inline">Bilik Suara</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Banner Pemilihan & Ringkasan Cepat */}
        <div className="bg-white/80 backdrop-blur-xl border border-violet-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-violet-100 pb-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-violet-100 text-violet-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Hasil Perolehan Suara
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Pelaksanaan: <b>{eventDate}</b>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-2">
                {electionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Menggunakan <b>Server-Sent Events (SSE)</b>. Data suara langsung terdorong ke layar seketika saat tombol coblos ditekan.
              </p>
            </div>

            {/* Tabs Pilihan Kategori Pemilihan */}
            <div className="flex items-center gap-2 bg-violet-50/70 p-1.5 rounded-2xl border border-violet-200/80 self-start md:self-auto">
              {stats.settings.activePilcosis && (
                <button
                  onClick={() => setActiveTab("PILKOSIS")}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "PILKOSIS"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-300/40"
                      : "text-slate-600 hover:text-violet-700 hover:bg-white/60"
                  }`}
                >
                  👑 PILKOSIS (OSIS)
                </button>
              )}
              {stats.settings.activePks && (
                <button
                  onClick={() => setActiveTab("PKS")}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "PKS"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-300/40"
                      : "text-slate-600 hover:text-violet-700 hover:bg-white/60"
                  }`}
                >
                  🛡️ PKS
                </button>
              )}
              {stats.settings.activeMpk && (
                <button
                  onClick={() => setActiveTab("MPK")}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "MPK"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-300/40"
                      : "text-slate-600 hover:text-violet-700 hover:bg-white/60"
                  }`}
                >
                  🏛️ MPK
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total DPT */}
            <div className="bg-gradient-to-br from-violet-50/80 to-white border border-violet-100 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">
                Total DPT (Pemilih)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
                {totalDpt} <span className="text-xs font-medium text-slate-400">Siswa</span>
              </div>
            </div>

            {/* Suara Masuk */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Suara Masuk (Sah)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
                {totalVotesForTab} <span className="text-xs font-medium text-slate-400">Suara</span>
              </div>
            </div>

            {/* Partisipasi Pemilih */}
            <div className="bg-gradient-to-br from-pink-50/80 to-white border border-pink-100 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">
                Partisipasi Pemilih
              </span>
              <div className="text-2xl sm:text-3xl font-black text-pink-600 mt-2">
                {participationPercent}%
              </div>
            </div>

            {/* Belum Memilih */}
            <div className="bg-gradient-to-br from-amber-50/80 to-white border border-amber-100 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Belum Memilih
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
                {unvotedCount} <span className="text-xs font-medium text-slate-400">Siswa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Paslon Cards Grid with Photo & Live Animated Percentages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>🏆</span> Perolehan Suara Pasangan Calon ({tabCandidates.length} Paslon)
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Update Terakhir: <b>{lastPushTime.toLocaleTimeString("id-ID")}</b>
            </span>
          </div>

          {tabCandidates.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-violet-100 text-slate-400 shadow-sm">
              <span className="text-5xl block mb-3">👥</span>
              <p className="font-bold text-base text-slate-700">Belum ada kandidat pada kategori ini.</p>
              <p className="text-xs text-slate-400 mt-1">Silakan tambahkan data pasangan calon melalui panel panitia.</p>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                tabCandidates.length === 1
                  ? "grid-cols-1 max-w-md mx-auto"
                  : tabCandidates.length === 2
                  ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {tabCandidates.map((candidate, idx) => {
                const percent =
                  totalVotesForTab > 0
                    ? ((candidate.votes / totalVotesForTab) * 100).toFixed(1)
                    : "0.0";
                const isLeading = candidate.votes > 0 && candidate.votes === maxVotes;

                return (
                  <div
                    key={candidate.id}
                    className={`bg-white rounded-3xl overflow-hidden border-2 transition-all duration-500 flex flex-col shadow-md hover:shadow-xl relative ${
                      isLeading
                        ? "border-amber-400 ring-4 ring-amber-100"
                        : "border-violet-100 hover:border-violet-300"
                    }`}
                  >
                    {/* Leading Winner Crown Badge */}
                    {isLeading && (
                      <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider animate-bounce">
                        <span>👑</span>
                        <span>Suara Terbanyak</span>
                      </div>
                    )}

                    {/* Candidate Photo Container */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-gradient-to-br from-violet-100 via-purple-50 to-pink-50">
                      {candidate.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.fullName}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-violet-300 text-8xl">
                          👤
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Number Badge on Photo */}
                      <div
                        className={`absolute top-4 left-4 w-12 h-12 bg-gradient-to-br ${
                          badgeGradients[idx % badgeGradients.length]
                        } rounded-2xl flex items-center justify-center shadow-xl border-2 border-white`}
                      >
                        <span className="text-xl font-black text-white">{candidate.noUrut}</span>
                      </div>

                      {/* Name on bottom of photo */}
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-300 block mb-0.5">
                          Kandidat No. {candidate.noUrut}
                        </span>
                        <h4 className="text-base sm:text-lg font-black leading-tight drop-shadow-md truncate">
                          {candidate.fullName}
                        </h4>
                      </div>
                    </div>

                    {/* Vote Statistics Box (Below Photo) */}
                    <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4 bg-slate-50/50">
                      <div>
                        {/* Big Percentage & Vote Numbers */}
                        <div className="flex items-baseline justify-between mb-2">
                          <div>
                            <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight transition-all duration-300">
                              {percent}%
                            </span>
                            <span className="text-xs font-semibold text-slate-400 ml-1.5">
                              dari suara masuk
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-black text-violet-700 transition-all duration-300">
                              {candidate.votes}
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                              Total Suara
                            </span>
                          </div>
                        </div>

                        {/* Animated Visual Progress Bar with CSS Transitions */}
                        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              progressGradients[idx % progressGradients.length]
                            }`}
                            style={{ width: `${Math.max(Number(percent), 2)}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer Info per Card */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Posisi: <b>{activeTab}</b></span>
                        <span>Nomor Urut: <b>#{candidate.noUrut}</b></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Breakdown Table */}
        {tabCandidates.length > 0 && (
          <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-4">
              📋 Rincian Tabulasi Suara ({activeTab})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-violet-100 text-violet-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3 pr-4 w-16 text-center">NO. URUT</th>
                    <th className="pb-3 pr-4">NAMA PASANGAN CALON / KANDIDAT</th>
                    <th className="pb-3 pr-4 text-center w-28">JUMLAH SUARA</th>
                    <th className="pb-3 pr-4 text-right w-28">PERSENTASE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-50">
                  {tabCandidates.map((c) => {
                    const pct =
                      totalVotesForTab > 0
                        ? ((c.votes / totalVotesForTab) * 100).toFixed(2)
                        : "0.00";
                    return (
                      <tr key={c.id} className="hover:bg-violet-50/40 transition-colors">
                        <td className="py-3 pr-4 text-center font-bold text-slate-700">#{c.noUrut}</td>
                        <td className="py-3 pr-4 font-bold text-slate-800">{c.fullName}</td>
                        <td className="py-3 pr-4 text-center font-black font-mono text-violet-700 text-sm transition-all duration-300">
                          {c.votes}
                        </td>
                        <td className="py-3 pr-4 text-right font-black font-mono text-pink-600 text-sm transition-all duration-300">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-100 bg-white/70 backdrop-blur-md py-4 text-center text-xs text-slate-400">
        <p>
          {schoolName} · Sistem E-Voting & Quick Count Real-Time PILKOSIS
        </p>
      </footer>
    </div>
  );
}
