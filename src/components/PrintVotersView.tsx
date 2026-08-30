"use client";

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
  committeeSecretary?: string;
  headmasterName?: string;
  headmasterNip?: string;
  signatureCity?: string;
}

interface PrintVotersViewProps {
  voters: Voter[];
  settings: Settings;
  selectedClass: string;
}

export default function PrintVotersView({
  voters,
  settings,
  selectedClass,
}: PrintVotersViewProps) {
  const schoolName = settings.schoolName || "SMA / SMK NEGERI 1 INDONESIA";
  const electionTitle = settings.title || "PEMILIHAN OSIS, PKS & MPK";
  const eventDate = settings.eventDate || "Senin, 15 September 2026";
  const committeeChairman = settings.committeeChairman || "Ketua Panitia";
  const committeeSecretary = settings.committeeSecretary || "Sekretaris Panitia";
  const headmasterName = settings.headmasterName || "Kepala Sekolah";
  const headmasterNip = settings.headmasterNip || "-";
  const signatureCity = settings.signatureCity || "Karangasem";
  
  // Format tempat & tanggal untuk tanda tangan: jika eventDate mengandung "Senin, 15 September 2026", ubah menjadi "[Kota], 15 September 2026"
  const formattedSignatureDate = (() => {
    if (!eventDate) return `${signatureCity}, 15 September 2026`;
    // Jika formatnya 'Hari, Tanggal Bulan Tahun'
    const parts = eventDate.split(",");
    if (parts.length > 1) {
      return `${signatureCity},${parts.slice(1).join(",")}`;
    }
    return `${signatureCity}, ${eventDate}`;
  })();

  return (
    <div className="bg-slate-100 min-h-screen print:bg-white text-black font-sans print:m-0 print:p-0">
      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 portrait;
          margin: 10mm 12mm 10mm 12mm;
        }
        @media print {
          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-voters-sheet {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />

      {/* Floating Toolbar (Screen only) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-sm flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Pratinjau Cetak Daftar Pemilih Tetap ({voters.length} Siswa)
          </h2>
          <p className="text-xs text-slate-500">
            Kelompok: {selectedClass === "ALL" ? "Semua Kelompok" : selectedClass} | Siap dicetak / diekspor ke PDF resmi.
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
            Cetak Sekarang / Simpan PDF
          </button>
        </div>
      </div>

      {/* Sheet Container (Clean White Document Page) */}
      <div className="p-4 sm:p-8 flex flex-col items-center print:p-0">
        <div className="print-voters-sheet bg-white shadow-xl border border-slate-200 print:shadow-none print:border-none w-full max-w-[210mm] print:max-w-none print:w-full min-h-[297mm] print:min-h-0 p-6 sm:p-[10mm] print:p-0 flex flex-col justify-between box-border">
          <div>
            {/* Kop / Header Resmi dengan Logo Sekolah & Logo OSIS */}
            <div className="border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center justify-between gap-4">
                {/* Logo Sekolah di Kiri */}
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/sekolah.png"
                    alt="Logo Sekolah"
                    className="max-h-16 max-w-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Teks Kop Tengah */}
                <div className="text-center flex-1">
                  <h2 className="text-base font-black tracking-wider uppercase text-black">
                    {schoolName}
                  </h2>
                  <h3 className="text-sm font-bold uppercase text-black tracking-wide">
                    PANITIA PELAKSANA {electionTitle}
                  </h3>
                  <h4 className="text-xs font-semibold text-black mt-0.5">
                    DAFTAR PEMILIH TETAP (DPT) & DAFTAR TOKEN PEMILIHAN
                  </h4>
                </div>

                {/* Logo OSIS di Kanan */}
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="Logo OSIS"
                    className="max-h-16 max-w-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-black mt-2 font-medium border-t border-slate-300 pt-1.5">
                <span>Kelompok / Kelas: <b>{selectedClass === "ALL" ? "Semua Kelompok" : selectedClass}</b></span>
                <span>Tanggal Pelaksanaan: <b>{eventDate}</b></span>
                <span>Jumlah Pemilih: <b>{voters.length} Siswa</b></span>
              </div>
            </div>

            {/* Tabel Daftar Pemilih */}
            {voters.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <p className="text-sm font-medium">Tidak ada data pemilih yang sesuai kriteria.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs border border-black">
                <thead>
                  <tr className="border-b-2 border-black font-bold text-black uppercase tracking-wider text-[10px] bg-slate-50 print:bg-transparent">
                    <th className="p-2 border border-black w-10 text-center">NO</th>
                    <th className="p-2 border border-black w-24">KODE / NIS</th>
                    <th className="p-2 border border-black">NAMA LENGKAP</th>
                    <th className="p-2 border border-black w-28 text-center">TOKEN</th>
                    <th className="p-2 border border-black w-28">KELOMPOK</th>
                    <th className="p-2 border border-black w-24 text-center">PARAF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {voters.map((voter, index) => (
                    <tr key={voter.id} className="break-inside-avoid">
                      <td className="p-2 border border-black text-center font-medium text-black">{index + 1}</td>
                      <td className="p-2 border border-black font-mono font-bold text-black">{voter.code || "-"}</td>
                      <td className="p-2 border border-black font-medium text-black">{voter.name || "(Nama Siswa)"}</td>
                      <td className="p-2 border border-black font-mono font-extrabold text-black text-center tracking-widest">
                        {voter.token}
                      </td>
                      <td className="p-2 border border-black text-black">{voter.className}</td>
                      <td className="p-2 border border-black text-slate-400 font-mono text-[9px]">
                        {index + 1}. .........
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Blok Tanda Tangan Resmi */}
          <div className="mt-8 pt-4 break-inside-avoid text-black text-xs">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Sekolah</p>
                <div className="h-20" />
                <p className="font-bold underline">{headmasterName}</p>
                <p className="text-[10px]">NIP. {headmasterNip}</p>
              </div>

              <div>
                <p>{formattedSignatureDate}</p>
                <p className="font-bold">Ketua Panitia Pemilihan</p>
                <div className="h-20" />
                <p className="font-bold underline">{committeeChairman}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}