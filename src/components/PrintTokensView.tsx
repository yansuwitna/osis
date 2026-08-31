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
  schoolName?: string;
  eventDate?: string;
}

interface PrintTokensViewProps {
  voters: Voter[];
  settings: Settings;
  selectedClass: string;
  perPage: 30 | 60;
}

export default function PrintTokensView({
  voters,
  settings,
  selectedClass,
  perPage,
}: PrintTokensViewProps) {
  const pages: Voter[][] = [];
  for (let i = 0; i < voters.length; i += perPage) {
    pages.push(voters.slice(i, i + perPage));
  }

  const is60 = perPage === 60;
  const rows = is60 ? 20 : 10;
  const gridLabel = is60 ? "3 kolom × 20 baris" : "3 kolom × 10 baris";

  return (
    <div className="bg-slate-100 min-h-screen print:bg-white text-black font-sans print:m-0 print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 portrait;
          margin: 3mm 3mm 3mm 3mm;
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
          .print-token-page {
            width: 100% !important;
            max-width: 100% !important;
            height: 290mm !important;
            max-height: 290mm !important;
            margin: 0 !important;
            padding: 1mm !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
        }
      `}} />

      {/* Floating Toolbar (Screen only) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-sm flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Pratinjau Cetak Token ({voters.length} Token / {pages.length} Lembar A4)
          </h2>
          <p className="text-xs text-slate-500">
            Kelompok: {selectedClass === "ALL" ? "Semua Kelompok" : selectedClass} | Format {perPage} Token per Lembar A4 ({gridLabel}) | Pas 1 Lembar A4 per {perPage} Token.
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
      <div className="p-4 sm:p-8 flex flex-col items-center gap-8 print:p-0 print:gap-0 print:block print:m-0">
        {pages.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white rounded-2xl p-10 border border-slate-200">
            <p className="text-sm font-medium">Tidak ada data token untuk dicetak.</p>
          </div>
        ) : (
          pages.map((pageVoters, pageIndex) => (
            <div
              key={pageIndex}
              className="print-token-page bg-white shadow-xl border border-slate-200 print:shadow-none print:border-none w-[210mm] max-w-[210mm] h-[290mm] max-h-[290mm] p-[3mm] box-border relative overflow-hidden print:m-0 print:break-after-page print:page-break-after-always"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gap: "0px",
                pageBreakAfter: "always",
                breakAfter: "page",
                pageBreakInside: "avoid",
                breakInside: "avoid",
              }}
            >
              {pageVoters.map((voter) => (
                <div
                  key={voter.id}
                  style={{
                    border: "1px dashed #64748b",
                    padding: is60 ? "0.6mm 1.2mm" : "1.2mm 2mm",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    overflow: "hidden",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Baris 1: Nama */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      fontSize: is60 ? "6pt" : "7.5pt",
                      lineHeight: 1.2,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        width: is60 ? "11mm" : "14mm",
                        color: "#334155",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      Nama
                    </span>
                    <span
                      style={{
                        width: "2mm",
                        color: "#000",
                        fontWeight: 700,
                        flexShrink: 0,
                        textAlign: "center",
                      }}
                    >
                      :
                    </span>
                    <span
                      style={{
                        color: "#000",
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {voter.name || "(Nama Siswa)"}
                    </span>
                  </div>

                  {/* Baris 2: Kelompok */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      fontSize: is60 ? "6pt" : "7.5pt",
                      lineHeight: 1.2,
                      marginTop: is60 ? "0.3mm" : "0.6mm",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        width: is60 ? "11mm" : "14mm",
                        color: "#334155",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      Kelompok
                    </span>
                    <span
                      style={{
                        width: "2mm",
                        color: "#000",
                        fontWeight: 700,
                        flexShrink: 0,
                        textAlign: "center",
                      }}
                    >
                      :
                    </span>
                    <span
                      style={{
                        color: "#0f172a",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {voter.className}
                    </span>
                  </div>

                  {/* Baris 3: Token */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: is60 ? "6pt" : "7.5pt",
                      lineHeight: 1.2,
                      marginTop: is60 ? "0.5mm" : "1mm",
                    }}
                  >
                    <span
                      style={{
                        width: is60 ? "11mm" : "14mm",
                        color: "#334155",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      Token
                    </span>
                    <span
                      style={{
                        width: "2mm",
                        color: "#000",
                        fontWeight: 700,
                        flexShrink: 0,
                        textAlign: "center",
                      }}
                    >
                      :
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: is60 ? "0.4mm" : "0.7mm" }}>
                      {voter.token.split("").map((digit, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: is60 ? "3.6mm" : "4.8mm",
                            height: is60 ? "4.2mm" : "5.5mm",
                            border: "1px solid #000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: is60 ? "6.5pt" : "8.5pt",
                            fontFamily: "monospace",
                            fontWeight: 900,
                            color: "#000",
                            backgroundColor: "#fff",
                          }}
                        >
                          {digit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
