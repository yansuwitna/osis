"use client";

import { useState, useEffect, useTransition } from "react";
import { getElectionStats } from "@/lib/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChartItem {
  id: string;
  type: string;
  name: string;
  fullName: string;
  votes: number;
}

interface Stats {
  settings: {
    id: string;
    title: string;
    activePilcosis: boolean;
    activePks: boolean;
    activeMpk: boolean;
  };
  totalVoters: number;
  votesPilcosis: number;
  votesPks: number;
  votesMpk: number;
  chartData: ChartItem[];
}

interface AdminDashboardProps {
  initialStats: Stats;
}

export default function AdminDashboard({ initialStats }: AdminDashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>(initialStats);
  const [activeTab, setActiveTab] = useState<"PILKOSIS" | "PKS" | "MPK">("PILKOSIS");
  const [isPending, startTransition] = useTransition();

  // Real-time SSE Stream (Polling cadangan HANYA aktif jika SSE terputus)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let syncInterval: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    const stopSync = () => {
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
    };

    const fetchSync = async () => {
      try {
        const res = await fetch(`/api/stats?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const freshData = await res.json();
          if (isSubscribed && freshData && freshData.chartData) {
            setStats(freshData);
          }
        }
      } catch {}
    };

    const startSync = () => {
      if (syncInterval) return;
      fetchSync();
      syncInterval = setInterval(fetchSync, 5000);
    };

    try {
      eventSource = new EventSource("/api/live-stream");

      eventSource.onopen = () => {
        stopSync();
      };

      eventSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(":")) return;
          const freshData = JSON.parse(event.data);
          if (isSubscribed && freshData && freshData.chartData) {
            setStats(freshData);
            stopSync();
          }
        } catch {}
      };

      eventSource.onerror = () => {
        if (isSubscribed) {
          startSync();
        }
      };
    } catch {
      if (isSubscribed) {
        startSync();
      }
    }

    return () => {
      isSubscribed = false;
      if (eventSource) eventSource.close();
      stopSync();
    };
  }, []);

  const refreshStats = () => {
    startTransition(async () => {
      try {
        const newStats = await getElectionStats();
        setStats(newStats as any);
        router.refresh();
      } catch (err) {
        console.error("Gagal memperbarui data statistik:", err);
      }
    });
  };

  // Filter kandidat sesuai tab
  const tabCandidates = stats.chartData.filter((c) => c.type === activeTab);
  const totalVotesForTab =
    activeTab === "PILKOSIS"
      ? stats.votesPilcosis
      : activeTab === "PKS"
      ? stats.votesPks
      : stats.votesMpk;

  const turnoutPercent =
    stats.totalVoters > 0 ? Math.round((totalVotesForTab / stats.totalVoters) * 100) : 0;

  const winner = tabCandidates.reduce((prev, current) => {
    return prev.votes > current.votes ? prev : current;
  }, tabCandidates[0] || { fullName: "Belum ada suara", votes: 0 });

  const barColors = [
    "from-violet-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-orange-400 to-amber-500",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-green-600",
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <span>Dashboard <span className="text-gradient-vivid">Hasil Pemilihan</span></span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">{stats.settings.title} · Pantau statistik perolehan suara.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/results"
            target="_blank"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform active:scale-95 text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Layar Quick Count (Live) ↗</span>
          </Link>

          <Link
            href="/admin/berita-acara"
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform active:scale-95 text-xs shadow-md shadow-violet-200 flex items-center gap-2"
          >
            <span>📜</span>
            <span>Cetak Berita Acara</span>
          </Link>

          <button
            onClick={refreshStats}
            disabled={isPending}
            className="bg-white hover:bg-violet-50 border border-violet-200 text-violet-700 font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm cursor-pointer"
          >
            <svg className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {isPending ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Tabs Pemilihan (PILKOSIS, PKS, MPK) */}
      <div className="flex flex-wrap gap-2 border-b border-violet-100 pb-3">
        <button
          onClick={() => setActiveTab("PILKOSIS")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            activeTab === "PILKOSIS"
              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200"
              : "bg-white text-slate-600 hover:bg-violet-50 border border-slate-200"
          }`}
        >
          <span>👑 PILKOSIS</span>
          {stats.settings.activePilcosis ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          ) : (
            <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Non-Aktif</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("PKS")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            activeTab === "PKS"
              ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-200"
              : "bg-white text-slate-600 hover:bg-pink-50 border border-slate-200"
          }`}
        >
          <span>🛡️ PKS</span>
          {stats.settings.activePks ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          ) : (
            <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Non-Aktif</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("MPK")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            activeTab === "MPK"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200"
              : "bg-white text-slate-600 hover:bg-amber-50 border border-slate-200"
          }`}
        >
          <span>🏛️ MPK</span>
          {stats.settings.activeMpk ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          ) : (
            <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Non-Aktif</span>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-violet-100 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total DPT</span>
          <span className="text-3xl font-black text-violet-700 block mt-2">{stats.totalVoters}</span>
          <span className="text-slate-400 text-xs mt-1 block">Pemilih terdaftar</span>
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Suara Masuk ({activeTab})</span>
          <span className="text-3xl font-black text-emerald-600 block mt-2">{totalVotesForTab}</span>
          <span className="text-slate-400 text-xs mt-1 block">Telah memilih {activeTab}</span>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Belum Memilih ({activeTab})</span>
          <span className="text-3xl font-black text-amber-600 block mt-2">{stats.totalVoters - totalVotesForTab}</span>
          <span className="text-slate-400 text-xs mt-1 block">Siswa belum memilih</span>
        </div>

        <div className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Partisipasi {activeTab}</span>
          <span className="text-3xl font-black text-pink-600 block mt-2">{turnoutPercent}%</span>
          <div className="w-full bg-pink-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${turnoutPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Main Graphs & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-violet-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-xl">📈</span> Perolehan Suara - Kategori {activeTab}
          </h3>

          {tabCandidates.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <span className="text-4xl block mb-3">👤</span>
              <p className="font-medium">Belum ada kandidat untuk kategori {activeTab}.</p>
              <p className="text-xs text-slate-400 mt-1">Tambahkan kandidat di menu Kelola Kandidat.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tabCandidates.map((item, idx) => {
                const percent =
                  totalVotesForTab > 0 ? Math.round((item.votes / totalVotesForTab) * 100) : 0;

                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-end text-sm">
                      <div>
                        <span className="text-slate-800 font-bold">{item.name}</span>
                        <span className="text-slate-400 text-xs ml-2">({item.fullName})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-violet-600 font-bold text-base">{item.votes} Suara</span>
                        <span className="text-slate-400 text-xs ml-2">({percent}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-violet-50 h-8 rounded-xl overflow-hidden border border-violet-100 flex">
                      <div
                        className={`bg-gradient-to-r ${barColors[idx % barColors.length]} rounded-xl transition-all duration-700 flex items-center justify-end px-3 font-bold text-xs text-white`}
                        style={{ width: `${percent > 0 ? percent : 2}%` }}
                      >
                        {percent > 5 && `${percent}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-xl">💡</span> Rangkuman {activeTab}
            </h3>
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100 rounded-2xl p-4">
                <span className="text-xs text-violet-400 block uppercase font-bold tracking-wider">Pemenang Sementara</span>
                {totalVotesForTab > 0 ? (
                  <div className="mt-2">
                    <h4 className="text-slate-800 font-extrabold text-lg">{winner.fullName}</h4>
                    <p className="text-violet-600 text-sm font-semibold mt-1">
                      Memimpin dengan {winner.votes} suara
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm mt-1">Belum ada suara masuk untuk {activeTab}.</p>
                )}
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <span className="text-xs text-emerald-500 block uppercase font-bold tracking-wider">Status Pemilihan</span>
                <div className="flex items-center gap-2 mt-3">
                  <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-slate-700 text-sm font-bold">
                    {stats.settings.activePilcosis || stats.settings.activePks || stats.settings.activeMpk
                      ? "Proses Pemilihan Aktif"
                      : "Semua Pemilihan Ditutup"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-slate-400 leading-relaxed border-t border-violet-100 pt-5">
            Gunakan tab di bagian atas untuk melihat hasil perolehan PILKOSIS, PKS, atau MPK.
          </div>
        </div>
      </div>
    </div>
  );
}

