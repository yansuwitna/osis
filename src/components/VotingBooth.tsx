"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitVoteElection, voterLogout } from "@/lib/actions";
import Swal from "sweetalert2";

interface Candidate {
  id: string;
  type: "PILKOSIS" | "PKS" | "MPK";
  noUrut: number;
  name: string;
  vision: string;
  mission: string;
  photoUrl: string;
}

interface Voter {
  id: string;
  code: string | null;
  name: string | null;
  token: string;
  className: string;
  votedPilcosis: boolean;
  votedPks: boolean;
  votedMpk: boolean;
  voted: boolean;
}

interface Settings {
  title: string;
  activePilcosis: boolean;
  activePks: boolean;
  activeMpk: boolean;
}

interface VotingBoothProps {
  voter: Voter;
  candidates: Candidate[];
  settings: Settings;
}

export default function VotingBooth({ voter, candidates, settings }: VotingBoothProps) {
  const router = useRouter();

  // Tentukan daftar tahap pemilihan yang aktif dan belum dipilih voter
  const stages: Array<"PILKOSIS" | "PKS" | "MPK"> = [];
  if (settings.activePilcosis && !voter.votedPilcosis) stages.push("PILKOSIS");
  if (settings.activePks && !voter.votedPks) stages.push("PKS");
  if (settings.activeMpk && !voter.votedMpk) stages.push("MPK");

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [selectedVotes, setSelectedVotes] = useState<{ [key: string]: { candidateId: string; candidateName: string; noUrut: number } }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(7);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  const currentStage = stages[currentStageIndex] || stages[0];

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Keluar dari Bilik Suara?",
      text: "Pilihan belum disimpan ke database. Token Anda masih dapat digunakan kembali.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      await voterLogout();
      router.push("/");
    }
  };

  const handleSelectCandidate = async (candidate: Candidate) => {
    const stageLabel =
      currentStage === "PILKOSIS"
        ? "Ketua & Wakil Ketua OSIS"
        : currentStage === "PKS"
        ? "Ketua Patroli Keamanan Sekolah (PKS)"
        : "Majelis Perwakilan Kelas (MPK)";

    const isLastStage = currentStageIndex === stages.length - 1;

    const result = await Swal.fire({
      title: `Konfirmasi Pilihan ${currentStage}`,
      html: `
        <div style="text-align:center;padding:4px 0;">
          <p style="color:#6b7280;font-size:0.85rem;margin-bottom:12px;">Untuk posisi: <b>${stageLabel}</b></p>
          
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg, #ede9fe, #fce7f3);border:2px solid #c4b5fd;border-radius:20px;padding:16px 20px;margin-bottom:14px;box-shadow:0 4px 10px -2px rgba(124,58,237,0.1);">
            <!-- Foto Kandidat -->
            <div style="position:relative;width:130px;height:130px;border-radius:18px;overflow:hidden;border:3px solid #ffffff;box-shadow:0 8px 16px -4px rgba(124,58,237,0.3);margin-bottom:12px;background:#f3e8ff;">
              ${
                candidate.photoUrl
                  ? `<img src="${candidate.photoUrl}" alt="${candidate.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';if(this.parentElement)this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:45px;\\'>👤</div>';" />`
                  : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:45px;color:#c084fc;">👤</div>`
              }
              <!-- Badge No Urut -->
              <div style="position:absolute;top:6px;left:6px;width:32px;height:32px;background:linear-gradient(135deg,#7c3aed,#ec4899);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#ffffff;font-weight:900;font-size:16px;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:1.5px solid #ffffff;">
                ${candidate.noUrut}
              </div>
            </div>

            <div style="font-size:1.35rem;font-weight:900;background:linear-gradient(135deg,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:2px;">
              Kandidat Nomor ${candidate.noUrut}
            </div>
            <div style="font-size:1.05rem;font-weight:800;color:#1e1b4b;max-width:320px;line-height:1.35;">
              ${candidate.name}
            </div>
          </div>

          <p style="color:#64748b;font-size:0.85rem;margin:0;">
            ${isLastStage ? '<strong style="color:#f97316">⚠️ Ini adalah tahap terakhir. Suara Anda akan langsung dikirim ke sistem.</strong>' : 'Setelah ini, Anda akan lanjut ke tahap pemilihan berikutnya.'}
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: isLastStage ? "✅ Ya, Kirim Suara!" : "Lanjut Tahap Berikutnya ➡️",
      cancelButtonText: "Periksa Lagi",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const updatedVotes = {
      ...selectedVotes,
      [currentStage]: {
        candidateId: candidate.id,
        candidateName: candidate.name,
        noUrut: candidate.noUrut,
      },
    };
    setSelectedVotes(updatedVotes);

    if (!isLastStage) {
      // Pindah ke tahap pemilihan berikutnya
      setCurrentStageIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Eksekusi kirim semua suara
      setLoading(true);
      try {
        const payload = Object.entries(updatedVotes).map(([stageType, info]) => ({
          type: stageType as "PILKOSIS" | "PKS" | "MPK",
          candidateId: info.candidateId,
        }));

        const res = await submitVoteElection(payload);
        if (res.success) {
          setSuccess(true);
        } else {
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: "Gagal Mengirim Suara",
            text: res.error || "Terjadi kesalahan.",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (err) {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Kesalahan Koneksi",
          text: "Gagal terhubung ke server database.",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [success, router]);

  const stageCandidates = candidates.filter((c) => c.type === currentStage);

  const badgeColors = [
    "from-violet-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-orange-400 to-amber-500",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-green-600",
  ];

  return (
    <div className="min-h-screen bg-sacazio-hero bg-grid-pattern flex flex-col">
      {/* Decorative Blobs */}
      <div className="fixed -top-24 left-1/4 w-[500px] h-72 bg-violet-300/20 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="fixed bottom-0 right-1/3 w-96 h-64 bg-pink-300/15 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "3s" }} />

      {/* Header */}
      <header className="relative z-30 border-b border-violet-100 backdrop-blur-xl bg-white/75 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-violet-200 rounded-xl flex items-center justify-center p-1 shadow-md shadow-violet-300/30 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo OSIS"
                className="max-h-8 max-w-8 object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes("logo.jpg")) {
                    img.src = "/logo.jpg";
                  }
                }}
              />
            </div>
            <div>
              <h1 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600 text-sm leading-tight">
                BILIK SUARA DIGITAL
              </h1>
              <p className="text-[10px] font-bold text-pink-500 tracking-wider leading-tight uppercase">
                {settings.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-800">{voter.name || "Pemilih"}</span>
              <span className="text-[11px] font-mono text-violet-600 font-semibold tracking-wider">
                {voter.className} · Token: {voter.token}
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-all"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Progress Stages Bar */}
        {stages.length > 1 && (
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-violet-100 -translate-y-1/2 z-0" />
              {stages.map((stg, index) => {
                const isPassed = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <div key={stg} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                          : isCurrent
                          ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white ring-4 ring-violet-200 shadow-md"
                          : "bg-white text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isPassed ? "✓" : index + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-1.5 font-bold tracking-wider ${
                        isCurrent ? "text-violet-700" : isPassed ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {stg}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Title Stage */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-violet-100/70 border border-violet-200 rounded-full px-4 py-1 mb-3">
            <span className="w-2 h-2 bg-violet-600 rounded-full live-dot" />
            <span className="text-xs font-extrabold text-violet-700 uppercase tracking-wider">
              Tahap {currentStageIndex + 1} dari {stages.length}: {currentStage}
            </span>
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">
            Pilih Calon <span className="text-gradient-vivid">{currentStage}</span>
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-xs sm:text-sm">
            {currentStage === "PILKOSIS"
              ? "Tentukan pilihan pasangan Calon Ketua & Wakil Ketua OSIS"
              : currentStage === "PKS"
              ? "Tentukan pilihan Calon Koordinator Patroli Keamanan Sekolah (PKS)"
              : "Tentukan pilihan Calon Pengurus Majelis Perwakilan Kelas (MPK)"}
          </p>
        </div>

        {/* Candidates List */}
        {stageCandidates.length === 0 ? (
          <div className="card-glass rounded-3xl p-16 text-center max-w-md mx-auto">
            <div className="text-5xl mb-4">⏳</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Kandidat {currentStage} Belum Ditambahkan</h3>
            <p className="text-slate-400 text-xs">Panitia sedang menyiapkan data kandidat untuk kategori ini.</p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              stageCandidates.length === 1
                ? "max-w-sm mx-auto"
                : stageCandidates.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {stageCandidates.map((candidate, idx) => (
              <div
                key={candidate.id}
                className="candidate-card card-glass rounded-3xl overflow-hidden flex flex-col"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Photo */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-gradient-to-br from-violet-100 to-pink-50">
                  {candidate.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={candidate.photoUrl}
                      alt={candidate.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-violet-300 text-7xl">👤</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />

                  {/* Number Badge */}
                  <div
                    className={`absolute top-4 left-4 w-12 h-12 bg-gradient-to-br ${
                      badgeColors[idx % badgeColors.length]
                    } rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/60`}
                  >
                    <span className="text-xl font-black text-white">{candidate.noUrut}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-extrabold text-slate-800 mb-3 leading-tight">
                    {candidate.name}
                  </h3>

                  {/* Visi */}
                  <div className="mb-3">
                    <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-wider block mb-1">
                      Visi
                    </span>
                    <p className="text-slate-600 text-xs italic leading-relaxed">
                      &ldquo;{candidate.vision}&rdquo;
                    </p>
                  </div>

                  {/* Misi */}
                  <div className="mb-5">
                    <span className="text-[10px] font-extrabold text-pink-500 uppercase tracking-wider block mb-1">
                      Misi
                    </span>
                    <p
                      className={`text-slate-600 text-xs leading-relaxed whitespace-pre-line ${
                        expandedCandidate !== candidate.id ? "line-clamp-3" : ""
                      }`}
                    >
                      {candidate.mission}
                    </p>
                    {candidate.mission.split("\n").length > 3 && (
                      <button
                        onClick={() =>
                          setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)
                        }
                        className="text-[10px] text-violet-500 font-semibold mt-1 hover:underline"
                      >
                        {expandedCandidate === candidate.id ? "Tutup ↑" : "Selengkapnya ↓"}
                      </button>
                    )}
                  </div>

                  {/* Tombol Pilih */}
                  <button
                    onClick={() => handleSelectCandidate(candidate)}
                    disabled={loading}
                    className={`group/btn mt-auto relative w-full bg-gradient-to-r ${
                      badgeColors[idx % badgeColors.length]
                    } text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-violet-300/30 hover:shadow-violet-400/50 transition-all transform active:scale-98 disabled:opacity-40 overflow-hidden text-xs sm:text-sm`}
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <span>Pilih Nomor {candidate.noUrut}</span>
                      <span>✓</span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Success Overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl text-center p-6">
          <div className="relative animate-fade-in-up space-y-6 max-w-md">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-300/50 animate-bounce-gentle">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">Suara Berhasil Dikirim! 🎉</h2>
              <p className="text-violet-600 font-semibold text-sm">
                Terima kasih telah berpartisipasi dalam pemilihan!
              </p>
            </div>

            <div className="card-glass rounded-2xl px-6 py-4">
              <p className="text-slate-400 text-xs mb-1">Kembali ke halaman utama dalam</p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600">
                  {countdown}
                </span>
                <span className="text-slate-400 text-xs mb-1">detik</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="bg-violet-100 hover:bg-violet-200 border border-violet-200 text-violet-700 font-bold py-2.5 px-6 rounded-2xl text-xs transition-all"
            >
              Selesai & Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
