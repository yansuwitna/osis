"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { importVotersBatch, deleteVoter } from "@/lib/actions";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

interface Voter {
  id: string;
  code: string | null;
  name: string | null;
  className: string;
  token: string;
  voted: boolean;
  createdAt: Date;
}

interface AdminUploadVotersProps {
  initialVoters: Voter[];
}

export default function AdminUploadVoters({ initialVoters }: AdminUploadVotersProps) {
  const router = useRouter();
  const [voters, setVoters] = useState<Voter[]>(initialVoters);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual / Paste Input
  const [manualText, setManualText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<Array<{ code: string; name: string; className: string }>>([]);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("ALL");

  // Parse CSV or tab-separated text (KODE, NAMA, KELOMPOK)
  const parseVoterText = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const parsed: Array<{ code: string; name: string; className: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && (line.toLowerCase().includes("kode") || line.toLowerCase().includes("nama"))) {
        continue;
      }

      let parts: string[] = [];
      if (line.includes("\t")) {
        parts = line.split("\t");
      } else if (line.includes(";")) {
        parts = line.split(";");
      } else if (line.includes(",")) {
        parts = line.split(",");
      } else {
        parts = [line];
      }

      const p = parts.map(x => x.trim().replace(/^["']|["']$/g, ""));
      
      if (p.length >= 3) {
        parsed.push({ code: p[0], name: p[1], className: p[2] });
      } else if (p.length === 2) {
        parsed.push({ code: p[0], name: p[1], className: "UMUM" });
      } else if (p.length === 1 && p[0]) {
        parsed.push({ code: "ID" + (i + 1), name: p[0], className: "UMUM" });
      }
    }

    setParsedPreview(parsed);
  };

  // Eksekusi import & auto-generate token
  const executeImport = async (dataToImport: Array<{ code: string; name: string; className: string }>) => {
    if (dataToImport.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Data",
        text: "Data yang dipilih tidak memiliki baris pemilih yang valid!",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    startTransition(async () => {
      try {
        Swal.fire({
          title: "Memproses & Generate Token...",
          html: `Sedang mengimpor <b>${dataToImport.length} pemilih</b> dan membuatkan <b>token 6 angka unik</b>...`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await importVotersBatch(dataToImport);
        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "Upload & Token Selesai! 🎉",
            text: `Berhasil mengimpor ${res.imported} pemilih dan langsung dibuatkan token 6 angka unik.`,
            confirmButtonColor: "#7c3aed",
          });
          setManualText("");
          setParsedPreview([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
          router.refresh();
          window.location.reload();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Import",
            text: res.error || "Terjadi kesalahan saat import data.",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Terjadi kesalahan sistem: " + err.message,
          confirmButtonColor: "#dc2626",
        });
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    // Jika file berupa Excel (.xlsx atau .xls)
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Ambil data dalam bentuk array of arrays (AOA)
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        if (jsonData.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "File Kosong",
            text: "File Excel tidak memiliki data!",
            confirmButtonColor: "#7c3aed",
          });
          return;
        }

        const parsed: Array<{ code: string; name: string; className: string }> = [];

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const col0 = String(row[0] || "").trim();
          const col1 = String(row[1] || "").trim();
          const col2 = String(row[2] || "").trim();

          // Skip baris header jika ada kata KODE/NAMA/NIS
          if (
            i === 0 &&
            (col0.toLowerCase().includes("kode") ||
              col1.toLowerCase().includes("nama") ||
              col0.toLowerCase().includes("nis"))
          ) {
            continue;
          }

          if (col0 || col1 || col2) {
            parsed.push({
              code: col0 || `ID${i + 1}`,
              name: col1 || col0 || "(Tanpa Nama)",
              className: col2 || "UMUM",
            });
          }
        }

        if (parsed.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "Data Tidak Ditemukan",
            text: "Tidak ada baris data pemilih yang valid di dalam file Excel.",
            confirmButtonColor: "#7c3aed",
          });
          return;
        }

        setParsedPreview(parsed);
        // Langsung eksekusi simpan dan generate token otomatis
        await executeImport(parsed);
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal Membaca File Excel",
          text: "Pastikan format file .xlsx valid: " + err.message,
          confirmButtonColor: "#dc2626",
        });
      }
    } else {
      // Jika file berupa CSV atau teks biasa
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        setManualText(content);
        
        const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
        const parsed: Array<{ code: string; name: string; className: string }> = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (i === 0 && (line.toLowerCase().includes("kode") || line.toLowerCase().includes("nama") || line.toLowerCase().includes("nis"))) {
            continue;
          }

          let parts: string[] = [];
          if (line.includes("\t")) {
            parts = line.split("\t");
          } else if (line.includes(";")) {
            parts = line.split(";");
          } else if (line.includes(",")) {
            parts = line.split(",");
          } else {
            parts = [line];
          }

          const p = parts.map((x) => x.trim().replace(/^["']|["']$/g, ""));
          if (p.length >= 3) {
            parsed.push({ code: p[0], name: p[1], className: p[2] });
          } else if (p.length === 2) {
            parsed.push({ code: p[0], name: p[1], className: "UMUM" });
          } else if (p.length === 1 && p[0]) {
            parsed.push({ code: "ID" + (i + 1), name: p[0], className: "UMUM" });
          }
        }

        setParsedPreview(parsed);
        if (parsed.length > 0) {
          await executeImport(parsed);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleProcessImport = async () => {
    if (parsedPreview.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Data",
        text: "Masukkan atau unggah data dengan kolom KODE, NAMA, KELOMPOK terlebih dahulu!",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    await executeImport(parsedPreview);
  };

  const classes = Array.from(new Set(voters.map(v => v.className))).sort();

  const filteredVoters = voters.filter(v => {
    const matchSearch = 
      (v.code && v.code.toLowerCase().includes(search.toLowerCase())) ||
      (v.name && v.name.toLowerCase().includes(search.toLowerCase())) ||
      v.className.toLowerCase().includes(search.toLowerCase()) ||
      v.token.includes(search);

    const matchClass = filterClass === "ALL" || v.className === filterClass;
    return matchSearch && matchClass;
  });

  // Download template Excel (.XLSX)
  const downloadSampleExcelTemplate = () => {
    // Buat data header dan contoh baris
    const worksheetData = [
      ["KODE", "NAMA", "KELOMPOK"],
      ["NIS001", "Ahmad Fauzi", "X MIPA 1"],
      ["NIS002", "Budi Santoso", "X MIPA 1"],
      ["NIS003", "Citra Lestari", "XI IPS 2"],
      ["NIS004", "Dewi Sartika", "XII RPL 1"],
      ["NIS005", "Eko Prasetyo", "XII RPL 1"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Atur lebar kolom agar rapi
    worksheet["!cols"] = [
      { wch: 15 }, // KODE
      { wch: 30 }, // NAMA
      { wch: 20 }, // KELOMPOK
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DPT_PEMILIH");

    // Simpan file Excel (.xlsx)
    XLSX.writeFile(workbook, "format_upload_dpt_pemilih.xlsx");
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5 sm:gap-3">
            <span className="text-2xl sm:text-3xl">📥</span>
            <span>Upload <span className="text-gradient-vivid">Nama Pemilih (DPT)</span></span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
            Unggah file Excel <b>.xlsx</b> berisi <b>KODE</b>, <b>NAMA</b>, dan <b>KELOMPOK</b> untuk otomatis dibuatkan token 6 angka unik & surat panggilan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadSampleExcelTemplate}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transform active:scale-95"
          >
            <span>📊</span> Unduh Format Excel (.xlsx)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Upload Box (Clean & Focused) */}
        <div className="lg:col-span-5 bg-white border border-violet-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-xs border border-emerald-100">
              📂
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Upload Dokumen Excel</h3>
              <p className="text-[11px] text-slate-400">File langsung diproses & token dibuat seketika</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50/50 via-white to-pink-50/30 border-2 border-dashed border-violet-200 hover:border-violet-400 rounded-2xl p-6 text-center space-y-3 transition-all">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-2xl border border-violet-100">
              📊
            </div>
            <div>
              <label htmlFor="file-upload" className="block text-xs font-bold text-violet-700 uppercase tracking-wider cursor-pointer hover:underline">
                Pilih File Excel (.xlsx / .xls)
              </label>
              <p className="text-[11px] text-slate-400 mt-1">
                Atau file .csv / .txt
              </p>
            </div>

            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv, .txt, .tsv"
              onChange={handleFileUpload}
              className="w-full bg-white border border-violet-200 rounded-xl py-2 px-3 text-slate-600 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-emerald-600 file:text-white file:hover:bg-emerald-700 file:cursor-pointer"
              disabled={isPending}
            />
          </div>

          {/* Format Guide Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>💡</span>
              <span>Struktur Kolom Excel:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-violet-600 font-bold block">Kolom A</span>
                <span className="text-slate-500">KODE / NIS</span>
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-violet-600 font-bold block">Kolom B</span>
                <span className="text-slate-500">NAMA</span>
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-violet-600 font-bold block">Kolom C</span>
                <span className="text-slate-500">KELOMPOK</span>
              </div>
            </div>
          </div>
        </div>

        {/* List Data Pemilih */}
        <div className="lg:col-span-7 bg-white border border-violet-100 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[500px] lg:h-[680px]">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4 pb-4 border-b border-violet-100">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>👥</span> Daftar Pemilih Terdaftar
              </h3>
              <span className="text-xs text-slate-400">Total {voters.length} Pemilih Terdaftar</span>
            </div>

            <button
              onClick={() => router.push("/admin/invitations")}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-md shadow-pink-200 flex items-center justify-center gap-1.5"
            >
              <span>✉️</span> Cetak Surat Panggilan
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
            <input
              type="text"
              placeholder="🔍 Cari KODE, NAMA, KELOMPOK, TOKEN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-2 px-3.5 text-xs text-slate-700 placeholder-violet-300 focus:outline-none flex-1 transition-all"
            />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-violet-50/50 border-2 border-violet-200 rounded-xl py-2 px-3 text-xs text-slate-600 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">Semua Kelompok ({voters.length})</option>
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Table (Responsive with horizontal scrolling) */}
          <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
            {filteredVoters.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <span className="text-4xl block mb-3">📋</span>
                <p className="font-medium text-xs sm:text-sm">Belum ada data pemilih. Silakan upload file Excel pada panel di samping.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs min-w-[500px]">
                <thead className="sticky top-0 bg-white shadow-xs z-10">
                  <tr className="border-b-2 border-violet-100 font-bold text-violet-600 uppercase tracking-wider text-[11px]">
                    <th className="pb-2.5 pr-2">KODE</th>
                    <th className="pb-2.5 pr-2">NAMA</th>
                    <th className="pb-2.5 pr-2">KELOMPOK</th>
                    <th className="pb-2.5 pr-2">TOKEN 6 ANGKA</th>
                    <th className="pb-2.5 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-50">
                  {filteredVoters.map((v) => (
                    <tr key={v.id} className="hover:bg-violet-50/50 transition-colors">
                      <td className="py-2.5 pr-2 font-mono font-bold text-slate-700">{v.code || "-"}</td>
                      <td className="py-2.5 pr-2 font-medium text-slate-800">{v.name || "(Tanpa Nama)"}</td>
                      <td className="py-2.5 pr-2">
                        <span className="bg-violet-50 border border-violet-200 text-violet-700 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                          {v.className}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 font-mono font-extrabold text-pink-600 tracking-widest text-xs sm:text-sm">
                        {v.token}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={async () => {
                            if (confirm("Hapus pemilih " + (v.name || v.token) + "?")) {
                              await deleteVoter(v.id);
                              router.refresh();
                              window.location.reload();
                            }
                          }}
                          className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-all"
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
    </div>
  );
}
