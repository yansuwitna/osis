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
  signatureCity?: string;
}

interface PrintInvitationsViewProps {
  voters: Voter[];
  settings: Settings;
  schoolName?: string;
  date?: string;
  time?: string;
  place?: string;
  showToken?: boolean;
}

export default function PrintInvitationsView({
  voters,
  settings,
  schoolName,
  date,
  time,
  place,
  showToken = false,
}: PrintInvitationsViewProps) {
  const customSchoolName = schoolName || settings.schoolName || "SMA / SMK NEGERI 1 INDONESIA";
  const customDate = date || settings.eventDate || "Senin, 15 September 2026";
  const customTime = time || settings.eventTime || "08:00 - 12:00 WIB";
  const customPlace = place || settings.eventPlace || "Bilik Suara Lab Komputer";
  const committeeChairman = settings.committeeChairman || "Ketua Panitia";
  const signatureCity = settings.signatureCity || "Karangasem";

  // Tanggal TTD
  const formattedSignatureDate = (() => {
    if (!customDate) return `${signatureCity}, 15 September 2026`;
    const parts = customDate.split(",");
    if (parts.length > 1) {
      return `${signatureCity},${parts.slice(1).join(",")}`;
    }
    return `${signatureCity}, ${customDate}`;
  })();

  const electionLabels: string[] = [];
  if (settings.activePilcosis) electionLabels.push("PILKOSIS");
  if (settings.activePks) electionLabels.push("PKS");
  if (settings.activeMpk) electionLabels.push("MPK");
  const electionText = electionLabels.join(" · ");

  // Pecah daftar pemilih menjadi kelompok 10 per halaman (2 Kolom x 5 Baris)
  const pages: Voter[][] = [];
  for (let i = 0; i < voters.length; i += 10) {
    pages.push(voters.slice(i, i + 10));
  }

  return (
    <div className="bg-slate-100 min-h-screen print:bg-white text-black font-sans print:m-0 print:p-0">
      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 portrait;
          margin: 4mm 4mm 4mm 4mm;
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
          .print-invitation-page {
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 2mm !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />

      {/* Floating Toolbar (Screen only) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-sm flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Pratinjau Cetak Surat Panggilan ({voters.length} Kartu / {pages.length} Lembar A4)
          </h2>
          <p className="text-xs text-slate-500">
            Format 10 Kartu per Lembar A4 (2 Kolom × 5 Baris) | TTD di atas Kotak Token Panjang.
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

      {/* Pages Container */}
      <div className="p-4 sm:p-8 flex flex-col items-center gap-8 print:p-0 print:gap-0">
        {pages.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white rounded-2xl p-10 border border-slate-200">
            <p className="text-sm font-medium">Tidak ada data pemilih untuk dicetak.</p>
          </div>
        ) : (
          pages.map((pageVoters, pageIndex) => (
            <div
              key={pageIndex}
              className="print-invitation-page bg-white shadow-xl border border-slate-200 print:shadow-none print:border-none w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[3.5mm] grid grid-cols-2 grid-rows-5 gap-[2mm] box-border relative print:break-after-page print:page-break-after-always overflow-hidden"
              style={{
                pageBreakAfter: "always",
                breakAfter: "page",
              }}
            >
              {pageVoters.map((voter, cardIndex) => {
                const globalIndex = pageIndex * 10 + cardIndex + 1;
                return (
                  <div
                    key={voter.id}
                    className="border border-dashed border-slate-500 rounded-lg p-2 flex flex-col justify-between h-full box-border bg-white text-[7px] leading-tight"
                  >
                    {/* Header Surat */}
                    <div className="border-b border-slate-300 pb-0.5 flex items-center justify-between">
                      <div className="overflow-hidden pr-1">
                        <h3 className="text-[8px] font-black text-black uppercase tracking-tight leading-tight truncate">
                          {customSchoolName}
                        </h3>
                        <h4 className="text-[7px] font-bold text-slate-800 tracking-wide leading-none mt-0.5">
                          SURAT PANGGILAN PEMILIH ELEKTRONIK
                        </h4>
                        <p className="text-[6px] text-slate-600 font-bold uppercase leading-none mt-0.5">
                          {electionText}
                        </p>
                      </div>
                      <div className="w-5.5 h-5.5 border border-slate-800 rounded flex items-center justify-center font-black text-[7.5px] bg-slate-50 shrink-0">
                        TPS
                      </div>
                    </div>

                    {/* Tengah: Data Pemilih (Kiri) & TTD Ketua Panitia (Kanan) */}
                    <div className="grid grid-cols-12 gap-1.5 my-0.5 items-center">
                      {/* Kiri: Data Pemilih (7 Kolom) */}
                      <div className="col-span-7 space-y-0.5 text-[7px]">
                        <div className="flex">
                          <span className="w-11 text-slate-600">KODE/NIS</span>
                          <span className="font-mono font-bold">: {voter.code || "-"}</span>
                        </div>
                        <div className="flex">
                          <span className="w-11 text-slate-600">NAMA</span>
                          <span className="font-bold truncate">: {voter.name || "(Nama Siswa)"}</span>
                        </div>
                        <div className="flex">
                          <span className="w-11 text-slate-600">KELAS</span>
                          <span className="font-semibold">: {voter.className}</span>
                        </div>
                        <div className="flex">
                          <span className="w-11 text-slate-600">WAKTU</span>
                          <span className="truncate">: {customTime}</span>
                        </div>
                        <div className="flex">
                          <span className="w-11 text-slate-600">LOKASI</span>
                          <span className="truncate">: {customPlace}</span>
                        </div>
                      </div>

                      {/* Kanan: TTD Ketua Panitia (5 Kolom) */}
                      <div className="col-span-5 text-right flex flex-col items-end justify-center text-[6px]">
                        <span className="text-[5.5px] text-slate-600 block leading-none truncate max-w-full">
                          {formattedSignatureDate}
                        </span>
                        <span className="font-bold block leading-none mt-0.5">
                          Ketua Panitia,
                        </span>

                        {/* Gambar TTD Digital */}
                        <div className="h-5.5 w-16 relative flex items-center justify-end my-0.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/ttd.png"
                            alt="TTD"
                            className="max-h-5.5 max-w-16 object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>

                        <span className="font-bold underline text-[6px] block leading-none truncate max-w-full">
                          {committeeChairman}
                        </span>
                      </div>
                    </div>

                    {/* Bawah: Kotak Token Panjang Penuh */}
                    <div className="border border-slate-600 rounded p-1 bg-slate-50/70 flex items-center justify-between gap-1">
                      <div className="shrink-0">
                        <span className="text-[6.5px] font-black text-black uppercase tracking-wider block leading-none">
                          {showToken ? "TOKEN PEMILIH" : "KOTAK TOKEN (DIISI PANITIA)"}
                        </span>
                        <span className="text-[5px] text-slate-500 block leading-none mt-0.5">
                          {showToken ? "Rahasia — jangan diperlihatkan" : "Ditulis petugas KPPS di TPS"}
                        </span>
                      </div>

                      {/* 6 Kotak Angka Memanjang */}
                      <div className="flex items-center justify-center gap-1">
                        {voter.token.split("").map((digit, box) => (
                          <div
                            key={box}
                            className="w-4 h-5 border border-slate-900 bg-white rounded-xs flex items-center justify-center text-[7px] font-mono font-black"
                          >
                            {showToken ? digit : ""}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Petunjuk */}
                    <div className="border-t border-slate-200 pt-0.5 flex items-center justify-between text-[5.5px] text-slate-500 leading-none">
                      <span>* Bawa surat ini saat pencoblosan di bilik suara</span>
                      <span className="font-mono font-bold text-slate-700">#{globalIndex}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
