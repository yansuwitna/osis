"use client";

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

interface PrintBeritaAcaraViewProps {
  settings: Settings;
  candidates: CandidateResult[];
  turnout: {
    PILKOSIS: TurnoutItem;
    PKS: TurnoutItem;
    MPK: TurnoutItem;
  };
  totalVoters: number;
  votedGeneral: number;
  selectedCategory?: string; // "ALL" | "PILKOSIS" | "PKS" | "MPK"
  documentNumber?: string;
  notes?: string;
  saksiList?: string[];
}

export default function PrintBeritaAcaraView({
  settings,
  candidates,
  turnout,
  totalVoters,
  selectedCategory = "ALL",
  documentNumber,
  notes,
  saksiList = ["Saksi Paslon 01", "Saksi Paslon 02", "Saksi Perwakilan Siswa/MPK"],
}: PrintBeritaAcaraViewProps) {
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

  // Format tempat & tanggal untuk tanda tangan
  const formattedSignatureDate = (() => {
    if (!eventDate) return `${signatureCity}, 15 September 2026`;
    const parts = eventDate.split(",");
    if (parts.length > 1) {
      return `${signatureCity},${parts.slice(1).join(",")}`;
    }
    return `${signatureCity}, ${eventDate}`;
  })();

  // Filter kategori yang akan ditampilkan
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

  // Jika tidak ada yang cocok, fallback ke PILKOSIS
  if (categoriesToShow.length === 0) {
    categoriesToShow.push({ key: "PILKOSIS", label: "PEMILIHAN OSIS", role: "Ketua OSIS" });
  }

  const defaultDocNo = documentNumber || `001/BA-PILKOSIS/${new Date().getFullYear()}`;

  return (
    <div className="bg-slate-100 min-h-screen print:bg-white text-black font-sans print:m-0 print:p-0">
      {/* Floating Toolbar (Screen only) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-sm flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Pratinjau Cetak Berita Acara Hasil Rekapitulasi Suara
          </h2>
          <p className="text-xs text-slate-500">
            Kategori: {selectedCategory === "ALL" ? "Semua Pemilihan Aktif" : selectedCategory} | Format Standar Dokumen Resmi A4.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.close()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
          >
            Tutup Tab
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-violet-300/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.205-.37-2.456-.37-3.737 0-4.697 3.327-8.62 7.75-9.458a9.49 9.49 0 011.89-.19c4.97 0 9 4.03 9 9 0 1.281-.13 2.532-.37 3.737m-4.26 4.79v3.023a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5v-3.023m13.5 0A4.5 4.5 0 0018 13.5H6a4.5 4.5 0 00-4.25 4.62" />
            </svg>
            Cetak Sekarang / Simpan PDF
          </button>
        </div>
      </div>

      {/* Container Kertas Cetak A4 */}
      <div className="p-4 sm:p-8 flex flex-col items-center print:p-0">
        <div className="bg-white shadow-2xl border border-slate-200 print:shadow-none print:border-none w-[210mm] min-h-[297mm] p-[15mm] print:p-0 flex flex-col justify-between box-border text-[11pt] leading-relaxed">
          
          <div>
            {/* Kop / Header Resmi */}
            <div className="border-b-2 border-black pb-3 mb-5">
              <div className="flex items-center justify-between gap-4">
                {/* Logo Sekolah di Kiri */}
                <div className="w-20 h-20 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/sekolah.png"
                    alt="Logo Sekolah"
                    className="max-h-20 max-w-20 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.display = "none";
                      if (target.parentElement) target.parentElement.innerHTML = "🏛️";
                    }}
                  />
                </div>

                {/* Teks Kop Tengah */}
                <div className="text-center flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 leading-tight">
                    ORGANISASI SISWA INTRA SEKOLAH (OSIS)
                  </h3>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-black leading-snug">
                    PANITIA PEMILIHAN SUARA ELEKTRONIK (E-VOTING)
                  </h2>
                  <h1 className="text-sm sm:text-base font-extrabold uppercase text-black">
                    {schoolName}
                  </h1>
                </div>

                {/* Logo OSIS di Kanan */}
                <div className="w-20 h-20 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="Logo OSIS"
                    className="max-h-20 max-w-20 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.display = "none";
                      if (target.parentElement) target.parentElement.innerHTML = "👑";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Judul Berita Acara */}
            <div className="text-center mb-6">
              <h2 className="text-base font-black uppercase tracking-wide underline decoration-2">
                BERITA ACARA REKAPITULASI HASIL PENGHITUNGAN SUARA
              </h2>
              <p className="text-xs font-bold text-slate-800 uppercase mt-0.5">
                {electionTitle}
              </p>
              <p className="text-[10pt] font-mono text-slate-700 mt-1">
                Nomor: {defaultDocNo}
              </p>
            </div>

            {/* Paragraf Pembuka */}
            <div className="text-justify mb-5 text-[10.5pt] leading-normal space-y-2">
              <p>
                Pada hari ini <b>{eventDate}</b>, bertempat di <b>{eventPlace}</b>, Panitia Pemilihan Suara Elektronik (E-Voting) telah melaksanakan rapat pleno rekapitulasi dan penghitungan suara untuk <b>{electionTitle}</b> di lingkungan <b>{schoolName}</b>.
              </p>
              <p>
                Pemungutan dan penghitungan suara berlangsung secara jujur, adil, transparan, dan rahasia mulai pukul <b>{eventTime}</b> dengan hasil rekapitulasi sebagai berikut:
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
              
              // Temukan pemenang (kandidat suara terbanyak)
              const winner = [...catCandidates].sort((a, b) => b.votes - a.votes)[0];
              const totalCatVotes = catCandidates.reduce((acc, curr) => acc + curr.votes, 0);

              return (
                <div key={cat.key} className="mb-6">
                  {/* Sub Judul Kategori jika lebih dari 1 */}
                  {categoriesToShow.length > 1 && (
                    <div className="bg-slate-100 border-l-4 border-black px-3 py-1 font-bold text-[10.5pt] uppercase mb-3">
                      {idx + 1}. {cat.label}
                    </div>
                  )}

                  {/* 1. Data Pemilih & Partisipasi */}
                  <div className="mb-3">
                    <h4 className="font-bold text-[10pt] mb-1.5">
                      I. DATA PEMILIH DAN TINGKAT PARTISIPASI
                    </h4>
                    <table className="w-full border-collapse border border-black text-[9.5pt]">
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

                  {/* 2. Rincian Perolehan Suara Kandidat */}
                  <div className="mb-3">
                    <h4 className="font-bold text-[10pt] mb-1.5">
                      II. RINCIAN PEROLEHAN SUARA PASANGAN CALON / KANDIDAT
                    </h4>
                    <table className="w-full border-collapse border border-black text-[9.5pt]">
                      <thead>
                        <tr className="bg-slate-200 border-b border-black text-center font-bold">
                          <th className="p-1.5 border-r border-black w-14">No. Urut</th>
                          <th className="p-1.5 border-r border-black text-left">Nama Pasangan Calon / Kandidat</th>
                          <th className="p-1.5 border-r border-black w-28 text-right">Perolehan Suara</th>
                          <th className="p-1.5 border-r border-black w-20 text-right">Persentase</th>
                          <th className="p-1.5 w-28 text-center">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catCandidates.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-3 text-center italic text-slate-500">
                              Belum ada data kandidat untuk kategori ini.
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
                                <td className="p-1.5 border-r border-black">
                                  <div className="font-bold text-black">{c.name}</div>
                                </td>
                                <td className="p-1.5 border-r border-black text-right font-mono font-bold">
                                  {c.votes.toLocaleString("id-ID")} Suara
                                </td>
                                <td className="p-1.5 border-r border-black text-right font-mono">
                                  {percent}%
                                </td>
                                <td className="p-1.5 text-center font-bold text-[9pt]">
                                  {isWinner ? (
                                    <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                                      TERPILIH ⭐
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">-</span>
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
                          <td className="p-1.5 text-center text-xs">SAH</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 3. Penetapan Pemenang */}
                  {winner && winner.votes > 0 && (
                    <div className="bg-slate-50 border border-black p-2.5 rounded-sm text-[10pt] mb-4">
                      <span className="font-bold uppercase block text-[9.5pt] mb-1">
                        III. PENETAPAN HASIL PEMILIHAN
                      </span>
                      <p className="leading-relaxed">
                        Berdasarkan perolehan suara sah terbanyak, Panitia Pemilihan menetapkan Pasangan Calon / Kandidat <b>Nomor Urut {winner.noUrut}</b> atas nama <b>{winner.name}</b> sebagai <b>{cat.role} Terpilih</b> dengan perolehan sebanyak <b>{winner.votes.toLocaleString("id-ID")} suara</b>.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Catatan Pelaksanaan Tambahan jika ada */}
            {notes && (
              <div className="mb-4 text-[10pt]">
                <h4 className="font-bold text-[10pt] mb-1">CATATAN KHUSUS PELAKSANAAN:</h4>
                <div className="border border-slate-300 p-2.5 rounded text-justify italic text-slate-800 bg-slate-50">
                  {notes}
                </div>
              </div>
            )}

            {/* Paragraf Penutup */}
            <p className="text-justify text-[10.5pt] mb-6">
              Demikian Berita Acara ini dibuat dan ditandatangani oleh Panitia Pemilihan, Saksi-Saksi Pasangan Calon, serta disahkan oleh Kepala Sekolah untuk dipergunakan sebagaimana mestinya.
            </p>
          </div>

          {/* Kolom Tanda Tangan Resmi */}
          <div className="mt-4 pt-2 border-t border-slate-200">
            <div className="text-right text-[10.5pt] mb-4 font-medium">
              Ditetapkan di: <b>{signatureCity}</b><br />
              Pada tanggal: <b>{formattedSignatureDate.split(",")[1] || formattedSignatureDate}</b>
            </div>

            {/* Tabel Tanda Tangan Saksi */}
            {saksiList && saksiList.length > 0 && (
              <div className="mb-6">
                <div className="text-[10pt] font-bold text-center mb-2 uppercase">
                  SAKSI-SAKSI PASANGAN CALON / PERWAKILAN PEMILIH:
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-[9.5pt]">
                  {saksiList.slice(0, 3).map((saksi, sIdx) => (
                    <div key={sIdx} className="border border-slate-300 p-2 rounded flex flex-col justify-between h-24">
                      <span className="font-bold text-slate-700 text-xs">Saksi {sIdx + 1}</span>
                      <div className="text-xs text-slate-400 italic">(................................)</div>
                      <span className="font-medium text-slate-800 text-[9pt]">{saksi}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tanda Tangan Panitia & Kepala Sekolah */}
            <div className="grid grid-cols-2 gap-8 text-center text-[10pt] mt-4">
              {/* Kolom Kiri: Sekretaris */}
              <div className="flex flex-col justify-between h-36">
                <div>
                  <p className="font-bold uppercase">Sekretaris Panitia,</p>
                </div>
                <div>
                  <p className="font-black underline uppercase text-[10.5pt]">{committeeSecretary}</p>
                  <p className="text-[9pt] text-slate-500 font-medium">NIP / NIS: -</p>
                </div>
              </div>

              {/* Kolom Kanan: Ketua Panitia */}
              <div className="flex flex-col justify-between h-36">
                <div>
                  <p className="font-bold uppercase">Ketua Panitia Pemilihan,</p>
                </div>
                <div>
                  <p className="font-black underline uppercase text-[10.5pt]">{committeeChairman}</p>
                  <p className="text-[9pt] text-slate-500 font-medium">NIP / NIS: -</p>
                </div>
              </div>
            </div>

            {/* Mengetahui Kepala Sekolah (Tengah Bawah) */}
            <div className="text-center text-[10pt] mt-6 flex flex-col items-center">
              <p className="font-bold uppercase mb-1">Mengetahui,</p>
              <p className="font-bold uppercase text-[10.5pt]">{headmasterName.includes("Kepala") ? headmasterName : `Kepala ${schoolName}`}</p>
              
              <div className="h-24"></div>

              <div>
                <p className="font-black underline uppercase text-[11pt]">{headmasterName}</p>
                <p className="text-[9.5pt] text-slate-700 font-mono">NIP. {headmasterNip}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
