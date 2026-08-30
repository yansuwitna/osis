"use client";

import { useState } from "react";

interface CandidateResult {
  id: string;
  type: string;
  noUrut: number;
  name: string;
  photoUrl: string;
  votes: number;
}

interface TurnoutItem {
  totalDpt: number;
  hadir: number;
  tidakHadir: number;
  suaraSah: number;
  persenHadir: string;
}

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
  committeeChairman?: string;
  committeeSecretary?: string;
  headmasterName?: string;
  headmasterNip?: string;
  signatureCity?: string;
}

interface AdminBeritaAcaraProps {
  initialData: {
    settings: Settings;
    candidates: CandidateResult[];
    turnout: {
      PILKOSIS: TurnoutItem;
      PKS: TurnoutItem;
      MPK: TurnoutItem;
    };
    totalVoters: number;
    votedGeneral: number;
  };
}

export default function AdminBeritaAcara({ initialData }: AdminBeritaAcaraProps) {
  const { settings, candidates, turnout, totalVoters } = initialData;

  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "PILKOSIS" | "PKS" | "MPK">("ALL");
  const [docNo, setDocNo] = useState(`001/BA-PILKOSIS/${new Date().getFullYear()}`);
  const [notes, setNotes] = useState("");
  const [saksi1, setSaksi1] = useState("Saksi Paslon 01");
  const [saksi2, setSaksi2] = useState("Saksi Paslon 02");
  const [saksi3, setSaksi3] = useState("Saksi Perwakilan Siswa / MPK");
  const [showConfig, setShowConfig] = useState(false);

  const schoolName = settings.schoolName || "SMA / SMK NEGERI 1 INDONESIA";
  const electionTitle = settings.title || "PEMILIHAN OSIS, PKS & MPK";
  const eventDate = settings.eventDate || "Senin, 15 September 2026";
  const eventTime = settings.eventTime || "08:00 - 12:00 WIB";
  const eventPlace = settings.eventPlace || "Bilik Suara Lab Komputer";
  const committeeChairman = settings.committeeChairman || "Ketua Panitia";
  const committeeSecretary = settings.committeeSecretary || "Sekretaris Panitia";
  const headmasterName = settings.headmasterName || "Kepala Sekolah";
  const headmasterNip = settings.headmasterNip || "-";
  const signatureCity = settings.signatureCity || "Karangasem";

  // URL untuk cetak
  const printUrl = (() => {
    const params = new URLSearchParams();
    params.set("category", selectedCategory);
    if (docNo) params.set("docNo", docNo);
    if (notes) params.set("notes", notes);
    if (saksi1) params.set("saksi1", saksi1);
    if (saksi2) params.set("saksi2", saksi2);
    if (saksi3) params.set("saksi3", saksi3);
    return `/admin/print-berita-acara?${params.toString()}`;
  })();

  const handleOpenPrint = () => {
    window.open(printUrl, "_blank");
  };

  // Kategori yang akan ditampilkan pada preview
  const categoriesToShow: Array<{ key: "PILKOSIS" | "PKS" | "MPK"; label: string; role: string }> = [];
  if ((selectedCategory === "ALL" || selectedCategory === "PILKOSIS") && (settings.activePilcosis || selectedCategory === "PILKOSIS")) {
    categoriesToShow.push({ key: "PILKOSIS", label: "PEMILIHAN KETUA & WAKIL KETUA OSIS (PILKOSIS)", role: "Ketua & Wakil Ketua OSIS" });
  }
  if ((selectedCategory === "ALL" || selectedCategory === "PKS") && (settings.activePks || selectedCategory === "PKS")) {
    categoriesToShow.push({ key: "PKS", label: "PEMILIHAN PERWAKILAN KELAS (PKS)", role: "Ketua PKS" });
  }
  if ((selectedCategory === "ALL" || selectedCategory === "MPK") && (settings.activeMpk || selectedCategory === "MPK")) {
    categoriesToShow.push({ key: "MPK", label: "PEMILIHAN MAJELIS PERWAKILAN KELAS (MPK)", role: "Ketua MPK" });
  }
  if (categoriesToShow.length === 0) {
    categoriesToShow.push({ key: "PILKOSIS", label: "PEMILIHAN OSIS", role: "Ketua OSIS" });
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="text-3xl">📜</span>
            <span>Berita Acara <span className="text-gradient-vivid">Hasil Pemilihan</span></span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cetak berita acara rekapitulasi penghitungan suara resmi untuk arsip dan pengesahan hasil pleno.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="bg-white hover:bg-violet-50 border border-violet-200 text-violet-700 font-bold py-2.5 px-4 rounded-2xl transition-all duration-300 transform active:scale-95 text-xs flex items-center gap-2 shadow-sm"
          >
            <span>⚙️</span>
            <span>{showConfig ? "Tutup Pengaturan" : "Atur Nomor & Saksi"}</span>
          </button>

          <button
            onClick={handleOpenPrint}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-2xl transition-all duration-300 transform active:scale-95 text-xs flex items-center gap-2 shadow-lg shadow-violet-300/30 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.205-.37-2.456-.37-3.737 0-4.697 3.327-8.62 7.75-9.458a9.49 9.49 0 011.89-.19c4.97 0 9 4.03 9 9 0 1.281-.13 2.532-.37 3.737m-4.26 4.79v3.023a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5v-3.023m13.5 0A4.5 4.5 0 0018 13.5H6a4.5 4.5 0 00-4.25 4.62" />
            </svg>
            <span>Cetak / Simpan PDF 🖨️</span>
          </button>
        </div>
      </div>

      {/* Filter Kategori Pemilihan Tab */}
      <div className="bg-white p-2 rounded-2xl border border-violet-100 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === "ALL"
              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Semua Pemilihan (Gabungan)
        </button>
        {settings.activePilcosis && (
          <button
            onClick={() => setSelectedCategory("PILKOSIS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "PILKOSIS"
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            🗳️ PILKOSIS (Ketua OSIS)
          </button>
        )}
        {settings.activePks && (
          <button
            onClick={() => setSelectedCategory("PKS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "PKS"
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            🛡️ PKS (Perwakilan Kelas)
          </button>
        )}
        {settings.activeMpk && (
          <button
            onClick={() => setSelectedCategory("MPK")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "MPK"
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            🏛️ MPK (Majelis Perwakilan)
          </button>
        )}
      </div>

      {/* Pengaturan Nomor Surat, Saksi & Catatan (Collapsible) */}
      {showConfig && (
        <div className="bg-white rounded-3xl p-6 border border-violet-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>📝</span>
            <span>Konfigurasi Tambahan Berita Acara</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Berita Acara:</label>
              <input
                type="text"
                value={docNo}
                onChange={(e) => setDocNo(e.target.value)}
                placeholder="Misal: 001/BA-PILKOSIS/IX/2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Saksi 1:</label>
              <input
                type="text"
                value={saksi1}
                onChange={(e) => setSaksi1(e.target.value)}
                placeholder="Nama Saksi Paslon 1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Saksi 2:</label>
              <input
                type="text"
                value={saksi2}
                onChange={(e) => setSaksi2(e.target.value)}
                placeholder="Nama Saksi Paslon 2"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Saksi 3 / MPK:</label>
              <input
                type="text"
                value={saksi3}
                onChange={(e) => setSaksi3(e.target.value)}
                placeholder="Nama Saksi Perwakilan MPK"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 text-xs">Catatan Khusus Rapat Pleno (Opsional):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Catatan tambahan seperti kondisi pemungutan suara, saksi yang hadir lengkap, tidak ada sanggahan, dsb."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 text-xs"
            />
          </div>
        </div>
      )}

      {/* Pratinjau Dokumen Berita Acara */}
      <div className="bg-slate-200/80 p-4 sm:p-8 rounded-3xl border border-slate-300 flex flex-col items-center">
        <div className="w-full max-w-[210mm] flex justify-between items-center mb-3 text-xs text-slate-500 px-1">
          <span className="font-semibold flex items-center gap-1.5">
            <span>📄</span>
            <span>Pratinjau Format Dokumen A4 (Standar Resmi)</span>
          </span>
          <button
            onClick={handleOpenPrint}
            className="text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1 underline"
          >
            Buka Halaman Cetak Penuh ↗
          </button>
        </div>

        {/* Lembar A4 Preview */}
        <div className="bg-white shadow-2xl border border-slate-300 w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 text-slate-900 font-sans text-xs sm:text-sm leading-relaxed rounded-md">
          {/* Kop Surat */}
          <div className="border-b-2 border-black pb-3 mb-5">
            <div className="flex items-center justify-between gap-4">
              {/* Logo Sekolah */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/sekolah.png"
                  alt="Logo Sekolah"
                  className="max-h-16 sm:max-h-20 max-w-16 sm:max-w-20 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = "none";
                    if (target.parentElement) target.parentElement.innerHTML = "🏛️";
                  }}
                />
              </div>

              {/* Teks Kop */}
              <div className="text-center flex-1">
                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-700">
                  ORGANISASI SISWA INTRA SEKOLAH (OSIS)
                </h3>
                <h2 className="text-xs sm:text-base font-black uppercase tracking-tight text-black">
                  PANITIA PEMILIHAN SUARA ELEKTRONIK (E-VOTING)
                </h2>
                <h1 className="text-xs sm:text-sm font-extrabold uppercase text-black">
                  {schoolName}
                </h1>
              </div>

              {/* Logo OSIS */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Logo OSIS"
                  className="max-h-16 sm:max-h-20 max-w-16 sm:max-w-20 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = "none";
                    if (target.parentElement) target.parentElement.innerHTML = "👑";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Judul Dokumen */}
          <div className="text-center mb-5">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wide underline decoration-2">
              BERITA ACARA REKAPITULASI HASIL PENGHITUNGAN SUARA
            </h2>
            <p className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase mt-0.5">
              {electionTitle}
            </p>
            <p className="text-[10px] sm:text-xs font-mono text-slate-600 mt-1">
              Nomor: {docNo || `001/BA-PILKOSIS/${new Date().getFullYear()}`}
            </p>
          </div>

          {/* Isi Paragraf */}
          <div className="text-justify mb-5 text-[11px] sm:text-xs space-y-2 leading-relaxed">
            <p>
              Pada hari ini <b>{eventDate}</b>, bertempat di <b>{eventPlace}</b>, Panitia Pemilihan Suara Elektronik (E-Voting) telah melaksanakan rapat pleno rekapitulasi dan penghitungan suara untuk <b>{electionTitle}</b> di lingkungan <b>{schoolName}</b>.
            </p>
            <p>
              Pemungutan dan penghitungan suara berlangsung secara jujur, adil, transparan, dan rahasia mulai pukul <b>{eventTime}</b> dengan rincian perolehan suara sebagai berikut:
            </p>
          </div>

          {/* Detail Per Kategori */}
          {categoriesToShow.map((cat, idx) => {
            const catTurnout = turnout[cat.key] || {
              totalDpt: totalVoters,
              hadir: 0,
              tidakHadir: totalVoters,
              suaraSah: 0,
              persenHadir: "0",
            };
            const catCandidates = candidates.filter((c) => c.type === cat.key);
            const winner = [...catCandidates].sort((a, b) => b.votes - a.votes)[0];
            const totalCatVotes = catCandidates.reduce((acc, curr) => acc + curr.votes, 0);

            return (
              <div key={cat.key} className="mb-6 space-y-3">
                {categoriesToShow.length > 1 && (
                  <div className="bg-slate-100 border-l-4 border-black px-3 py-1 font-bold text-xs sm:text-sm uppercase">
                    {idx + 1}. {cat.label}
                  </div>
                )}

                {/* I. Data Pemilih */}
                <div>
                  <h4 className="font-bold text-[11px] sm:text-xs mb-1.5">
                    I. DATA PEMILIH DAN TINGKAT PARTISIPASI
                  </h4>
                  <table className="w-full border-collapse border border-black text-[10px] sm:text-xs">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="p-1.5 border-r border-black w-8 text-center font-medium">1</td>
                        <td className="p-1.5 border-r border-black font-medium">Jumlah Pemilih Terdaftar dalam DPT</td>
                        <td className="p-1.5 text-right font-bold w-28">{catTurnout.totalDpt.toLocaleString("id-ID")} Orang</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-1.5 border-r border-black w-8 text-center font-medium">2</td>
                        <td className="p-1.5 border-r border-black font-medium">Jumlah Pemilih yang Menggunakan Hak Pilih (Hadir)</td>
                        <td className="p-1.5 text-right font-bold w-28 text-emerald-800">{catTurnout.hadir.toLocaleString("id-ID")} Orang</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-1.5 border-r border-black w-8 text-center font-medium">3</td>
                        <td className="p-1.5 border-r border-black font-medium">Jumlah Pemilih yang Tidak Menggunakan Hak Pilih (Golput)</td>
                        <td className="p-1.5 text-right font-bold w-28 text-red-800">{catTurnout.tidakHadir.toLocaleString("id-ID")} Orang</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="p-1.5 border-r border-black text-center">4</td>
                        <td className="p-1.5 border-r border-black">Persentase Partisipasi Pemilih</td>
                        <td className="p-1.5 text-right">{catTurnout.persenHadir}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* II. Rincian Perolehan Suara */}
                <div>
                  <h4 className="font-bold text-[11px] sm:text-xs mb-1.5">
                    II. RINCIAN PEROLEHAN SUARA PASANGAN CALON / KANDIDAT
                  </h4>
                  <table className="w-full border-collapse border border-black text-[10px] sm:text-xs">
                    <thead>
                      <tr className="bg-slate-200 border-b border-black text-center font-bold">
                        <th className="p-1.5 border-r border-black w-14">No. Urut</th>
                        <th className="p-1.5 border-r border-black text-left">Nama Pasangan Calon / Kandidat</th>
                        <th className="p-1.5 border-r border-black w-24 text-right">Perolehan Suara</th>
                        <th className="p-1.5 border-r border-black w-18 text-right">Persentase</th>
                        <th className="p-1.5 w-24 text-center">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catCandidates.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-3 text-center italic text-slate-500">
                            Belum ada kandidat.
                          </td>
                        </tr>
                      ) : (
                        catCandidates.map((c) => {
                          const percent = totalCatVotes > 0 ? ((c.votes / totalCatVotes) * 100).toFixed(1) : "0";
                          const isWinner = winner && winner.id === c.id && c.votes > 0;
                          return (
                            <tr key={c.id} className={`border-b border-black ${isWinner ? "bg-emerald-50/60 font-semibold" : ""}`}>
                              <td className="p-1.5 border-r border-black text-center font-bold">
                                {c.noUrut < 10 ? `0${c.noUrut}` : c.noUrut}
                              </td>
                              <td className="p-1.5 border-r border-black font-bold">
                                {c.name}
                              </td>
                              <td className="p-1.5 border-r border-black text-right font-mono font-bold">
                                {c.votes.toLocaleString("id-ID")} Suara
                              </td>
                              <td className="p-1.5 border-r border-black text-right font-mono">
                                {percent}%
                              </td>
                              <td className="p-1.5 text-center font-bold text-[9px] sm:text-[10px]">
                                {isWinner ? (
                                  <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                                    TERPILIH ⭐
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                      <tr className="bg-slate-100 font-bold border-t-2 border-black">
                        <td colSpan={2} className="p-1.5 border-r border-black text-center uppercase">
                          Total Suara Sah Masuk
                        </td>
                        <td className="p-1.5 border-r border-black text-right font-mono">
                          {totalCatVotes.toLocaleString("id-ID")} Suara
                        </td>
                        <td className="p-1.5 border-r border-black text-right font-mono">100.0%</td>
                        <td className="p-1.5 text-center text-[10px]">SAH</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* III. Penetapan Hasil */}
                {winner && winner.votes > 0 && (
                  <div className="bg-slate-50 border border-black p-2.5 rounded-sm text-[10.5px] sm:text-xs">
                    <span className="font-bold uppercase block text-[10px] sm:text-[11px] mb-0.5">
                      III. PENETAPAN HASIL PEMILIHAN
                    </span>
                    <p className="leading-relaxed">
                      Berdasarkan perolehan suara sah terbanyak, Panitia menetapkan Paslon <b>Nomor Urut {winner.noUrut}</b> atas nama <b>{winner.name}</b> sebagai <b>{cat.role} Terpilih</b> dengan perolehan <b>{winner.votes.toLocaleString("id-ID")} suara</b>.
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {notes && (
            <div className="mb-4 text-xs">
              <h4 className="font-bold mb-1">CATATAN KHUSUS PELAKSANAAN:</h4>
              <div className="border border-slate-300 p-2.5 rounded text-justify italic bg-slate-50">
                {notes}
              </div>
            </div>
          )}

          {/* Paragraf Penutup */}
          <p className="text-justify text-[11px] sm:text-xs mb-6">
            Demikian Berita Acara ini dibuat dan ditandatangani oleh Panitia Pemilihan, Saksi-Saksi Pasangan Calon, serta disahkan oleh Kepala Sekolah untuk dipergunakan sebagaimana mestinya.
          </p>

          {/* Tanda Tangan */}
          <div className="mt-4 pt-2 border-t border-slate-200 text-xs">
            <div className="text-right text-[11px] sm:text-xs mb-4 font-medium">
              Ditetapkan di: <b>{signatureCity}</b><br />
              Pada tanggal: <b>{eventDate.split(",")[1] || eventDate}</b>
            </div>

            {/* Saksi */}
            <div className="mb-6">
              <div className="text-[10px] sm:text-xs font-bold text-center mb-2 uppercase">
                SAKSI-SAKSI PASANGAN CALON / PERWAKILAN PEMILIH:
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center text-[10px] sm:text-xs">
                {[saksi1, saksi2, saksi3].filter(Boolean).map((saksi, sIdx) => (
                  <div key={sIdx} className="border border-slate-300 p-2 rounded flex flex-col justify-between h-20">
                    <span className="font-bold text-slate-700 text-[10px]">Saksi {sIdx + 1}</span>
                    <div className="text-[9px] text-slate-400 italic">(................................)</div>
                    <span className="font-medium text-slate-800 truncate">{saksi}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panitia */}
            <div className="grid grid-cols-2 gap-6 text-center mt-4">
              <div className="flex flex-col justify-between h-28">
                <p className="font-bold uppercase">Sekretaris Panitia,</p>
                <div>
                  <p className="font-black underline uppercase">{committeeSecretary}</p>
                  <p className="text-[10px] text-slate-500 font-medium">NIP / NIS: -</p>
                </div>
              </div>
              <div className="flex flex-col justify-between h-28">
                <p className="font-bold uppercase">Ketua Panitia Pemilihan,</p>
                <div>
                  <p className="font-black underline uppercase">{committeeChairman}</p>
                  <p className="text-[10px] text-slate-500 font-medium">NIP / NIS: -</p>
                </div>
              </div>
            </div>

            {/* Kepala Sekolah */}
            <div className="text-center mt-6 flex flex-col items-center">
              <p className="font-bold uppercase mb-0.5">Mengetahui,</p>
              <p className="font-bold uppercase">{headmasterName.includes("Kepala") ? headmasterName : `Kepala ${schoolName}`}</p>
              
              <div className="h-20"></div>

              <div>
                <p className="font-black underline uppercase">{headmasterName}</p>
                <p className="text-[10px] text-slate-700 font-mono">NIP. {headmasterNip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
