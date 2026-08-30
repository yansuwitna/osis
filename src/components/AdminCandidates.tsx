"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { addCandidate, updateCandidate, toggleCandidateStatus, deleteCandidate } from "@/lib/actions";
import Swal from "sweetalert2";

interface Candidate {
  id: string;
  type: string;
  noUrut: number;
  name: string;
  vision: string;
  mission: string;
  photoUrl: string;
  isActive: boolean;
}

interface AdminCandidatesProps {
  initialCandidates: Candidate[];
}

export default function AdminCandidates({ initialCandidates }: AdminCandidatesProps) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [activeTab, setActiveTab] = useState<"PILKOSIS" | "PKS" | "MPK">("PILKOSIS");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Mode Edit / Tambah
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  // State Form
  const [formType, setFormType] = useState<"PILKOSIS" | "PKS" | "MPK">("PILKOSIS");
  const [noUrut, setNoUrut] = useState("");
  const [name, setName] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const resetForm = () => {
    setEditingCandidate(null);
    setFormType(activeTab);
    setNoUrut("");
    setName("");
    setVision("");
    setMission("");
    setIsActive(true);
    setPhoto(null);
    setPreviewPhoto(null);
    if (formRef.current) formRef.current.reset();
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormType(candidate.type as any);
    setNoUrut(candidate.noUrut.toString());
    setName(candidate.name);
    setVision(candidate.vision);
    setMission(candidate.mission);
    setIsActive(candidate.isActive);
    setPreviewPhoto(candidate.photoUrl || null);
    setPhoto(null);

    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noUrut || !name || !vision || !mission) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi Data",
        text: "Kolom Nomor Urut, Nama Paslon, Visi, dan Misi wajib diisi!",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    const formData = new FormData();
    if (editingCandidate) {
      formData.append("id", editingCandidate.id);
    }
    formData.append("type", formType);
    formData.append("noUrut", noUrut);
    formData.append("name", name);
    formData.append("vision", vision);
    formData.append("mission", mission);
    formData.append("isActive", isActive ? "true" : "false");
    if (photo) formData.append("photo", photo);

    startTransition(async () => {
      try {
        const res = editingCandidate
          ? await updateCandidate(formData)
          : await addCandidate(formData);

        if (res.success) {
          const actionText = editingCandidate ? "diperbarui" : "ditambahkan";
          await Swal.fire({
            icon: "success",
            title: editingCandidate ? "Kandidat Diperbarui!" : "Kandidat Ditambahkan!",
            text: "Data paslon nomor urut " + noUrut + " (" + formType + ") berhasil " + actionText + ".",
            confirmButtonColor: "#7c3aed",
            timer: 1500,
            showConfirmButton: false,
          });

          resetForm();
          router.refresh();
          window.location.reload();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Menyimpan",
            text: res.error || "Terjadi kesalahan.",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error Sistem",
          text: err.message,
          confirmButtonColor: "#dc2626",
        });
      }
    });
  };

  const handleToggleStatus = async (candidate: Candidate) => {
    const nextStatus = !candidate.isActive;
    startTransition(async () => {
      try {
        const res = await toggleCandidateStatus(candidate.id, nextStatus);
        if (res.success) {
          setCandidates((prev) =>
            prev.map((c) => (c.id === candidate.id ? { ...c, isActive: nextStatus } : c))
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: res.error,
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message,
          confirmButtonColor: "#dc2626",
        });
      }
    });
  };

  const handleDelete = async (candidate: Candidate) => {
    if (candidate.isActive) {
      Swal.fire({
        icon: "warning",
        title: "Kandidat Masih Aktif!",
        text: "Kandidat yang berstatus AKTIF tidak dapat dihapus. Silakan nonaktifkan status kandidat terlebih dahulu jika ingin menghapusnya.",
        confirmButtonColor: "#7c3aed",
        confirmButtonText: "Saya Mengerti",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Hapus Paslon No. " + candidate.noUrut + "?",
      text: "Nama: " + candidate.name + ". Semua suara yang telah masuk untuk kandidat ini juga akan terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus Sekarang!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    startTransition(async () => {
      try {
        const res = await deleteCandidate(candidate.id);
        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "Kandidat Dihapus",
            text: "Data kandidat telah berhasil dihapus dari sistem.",
            confirmButtonColor: "#7c3aed",
            timer: 1500,
            showConfirmButton: false,
          });
          router.refresh();
          window.location.reload();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Menghapus",
            text: res.error,
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message,
          confirmButtonColor: "#dc2626",
        });
      }
    });
  };

  const filteredCandidates = candidates.filter((c) => c.type === activeTab);

  const badgeColors = [
    "from-violet-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-orange-400 to-amber-500",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-green-600",
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="w-10 h-10 bg-violet-100 text-violet-700 rounded-2xl flex items-center justify-center font-bold text-lg">
            👥
          </span>
          <span>Kelola <span className="text-gradient-vivid">Kandidat & Paslon</span></span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Kelola data nomor urut, foto paslon, visi misi, status aktif, dan pengaturan kandidat.
        </p>
      </div>

      {/* Tabs Kategori Pemilihan */}
      <div className="flex flex-wrap gap-2 border-b border-violet-100 pb-3">
        <button
          onClick={() => {
            setActiveTab("PILKOSIS");
            if (!editingCandidate) setFormType("PILKOSIS");
          }}
          className={
            "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs transition-all " +
            (activeTab === "PILKOSIS"
              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200"
              : "bg-white text-slate-600 hover:bg-violet-50 border border-slate-200")
          }
        >
          👑 PILKOSIS ({candidates.filter((c) => c.type === "PILKOSIS").length})
        </button>

        <button
          onClick={() => {
            setActiveTab("PKS");
            if (!editingCandidate) setFormType("PKS");
          }}
          className={
            "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs transition-all " +
            (activeTab === "PKS"
              ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-200"
              : "bg-white text-slate-600 hover:bg-pink-50 border border-slate-200")
          }
        >
          🛡️ PKS ({candidates.filter((c) => c.type === "PKS").length})
        </button>

        <button
          onClick={() => {
            setActiveTab("MPK");
            if (!editingCandidate) setFormType("MPK");
          }}
          className={
            "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs transition-all " +
            (activeTab === "MPK"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200"
              : "bg-white text-slate-600 hover:bg-amber-50 border border-slate-200")
          }
        >
          🏛️ MPK ({candidates.filter((c) => c.type === "MPK").length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Form Tambah / Edit */}
        <div
          className={
            "bg-white border-2 rounded-3xl p-6 shadow-sm transition-all " +
            (editingCandidate ? "border-amber-300 ring-4 ring-amber-100" : "border-violet-100")
          }
        >
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <span
                className={
                  "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm " +
                  (editingCandidate ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700")
                }
              >
                {editingCandidate ? "✏️" : "+"}
              </span>
              <span>{editingCandidate ? "Edit Data Kandidat" : "Tambah Kandidat Baru"}</span>
            </h3>

            {editingCandidate && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 py-1 px-2.5 rounded-lg transition-all"
              >
                ✕ Batal Edit
              </button>
            )}
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="formType" className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-1.5">
                Jenis Pemilihan
              </label>
              <select
                id="formType"
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 rounded-xl py-2.5 px-3 text-slate-700 text-xs sm:text-sm font-bold focus:outline-none transition-all"
              >
                <option value="PILKOSIS">PILKOSIS (Ketua OSIS)</option>
                <option value="PKS">PKS (Patroli Keamanan)</option>
                <option value="MPK">MPK (Majelis Perwakilan)</option>
              </select>
            </div>

            <div>
              <label htmlFor="noUrut" className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-1.5">
                Nomor Urut Paslon
              </label>
              <input
                id="noUrut"
                type="number"
                min={1}
                value={noUrut}
                onChange={(e) => setNoUrut(e.target.value)}
                placeholder="Contoh: 1"
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-2.5 px-3 text-slate-700 text-xs sm:text-sm focus:outline-none transition-all"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-1.5">
                Nama Calon / Pasangan Calon
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi & Lestari"
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-2.5 px-3 text-slate-700 text-xs sm:text-sm focus:outline-none transition-all"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label htmlFor="vision" className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-1.5">
                Visi Paslon
              </label>
              <textarea
                id="vision"
                rows={3}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Tulis visi kandidat..."
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-2 px-3 text-slate-700 focus:outline-none transition-all text-xs sm:text-sm leading-relaxed"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label htmlFor="mission" className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-1.5">
                Misi Paslon
              </label>
              <textarea
                id="mission"
                rows={4}
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder={"1. Meningkatkan kedisiplinan\n2. Menyelenggarakan pentas seni..."}
                className="w-full bg-violet-50/50 border-2 border-violet-200 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 rounded-xl py-2 px-3 text-slate-700 focus:outline-none transition-all text-xs sm:text-sm leading-relaxed"
                disabled={isPending}
                required
              />
            </div>

            {/* Status Aktif Switch */}
            <div className="bg-violet-50/60 border border-violet-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Status Kandidat</span>
                <span className="text-[10px] text-slate-500">
                  {isActive ? "Aktif (Tampil di bilik suara & terlindungi)" : "Nonaktif (Tidak tampil di bilik suara)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none " +
                  (isActive ? "bg-emerald-500" : "bg-slate-300")
                }
              >
                <span
                  className={
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out " +
                    (isActive ? "translate-x-5" : "translate-x-0")
                  }
                />
              </button>
            </div>

            {/* Upload Foto */}
            <div>
              <label htmlFor="photo" className="block text-xs font-bold text-violet-700 uppercase tracking-wider mb-1.5">
                Foto Paslon
              </label>
              {previewPhoto && (
                <div className="mb-2 w-24 h-24 rounded-xl overflow-hidden border-2 border-violet-200 bg-slate-50 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewPhoto} alt="Preview Foto" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full bg-violet-50/50 border-2 border-violet-200 rounded-xl py-2 px-3 text-slate-500 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-100 file:text-violet-700 file:hover:bg-violet-200 file:cursor-pointer"
                disabled={isPending}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={
                "w-full font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-300 transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm text-white " +
                (editingCandidate
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-200"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-200")
              }
            >
              {isPending
                ? "Menyimpan Data..."
                : editingCandidate
                ? "Simpan Perubahan Kandidat ✏️"
                : "Simpan & Upload Paslon 💾"}
            </button>
          </form>
        </div>

        {/* Daftar Kandidat */}
        <div className="lg:col-span-2 bg-white border border-violet-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-violet-100">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-xl">📋</span>
              <span>Daftar Calon: <b>{activeTab}</b></span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold bg-violet-50 border border-violet-200 px-3 py-1 rounded-full">
              {filteredCandidates.length} Paslon Terdaftar
            </span>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <span className="text-4xl block mb-3">👤</span>
              <p className="font-medium text-xs sm:text-sm">Belum ada kandidat untuk {activeTab}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCandidates.map((candidate, idx) => (
                <div
                  key={candidate.id}
                  className={
                    "bg-white border-2 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between " +
                    (candidate.isActive ? "border-violet-100" : "border-slate-200 opacity-70 bg-slate-50/50")
                  }
                >
                  <div>
                    {/* Header Foto Paslon */}
                    <div className="relative aspect-4/3 w-full bg-gradient-to-br from-violet-100 to-pink-50">
                      {candidate.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-violet-300 text-5xl">👤</div>
                      )}

                      {/* Badge Nomor Urut */}
                      <div className={"absolute top-3 left-3 bg-gradient-to-br " + badgeColors[idx % badgeColors.length] + " text-white font-black text-lg w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-lg"}>
                        {candidate.noUrut}
                      </div>

                      {/* Badge Status Aktif */}
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleToggleStatus(candidate)}
                          disabled={isPending}
                          title={candidate.isActive ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
                          className={
                            "text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-sm transition-all flex items-center gap-1 " +
                            (candidate.isActive
                              ? "bg-emerald-500 text-white border-emerald-400"
                              : "bg-slate-600 text-white border-slate-500")
                          }
                        >
                          <span className={"w-1.5 h-1.5 rounded-full " + (candidate.isActive ? "bg-white animate-pulse" : "bg-slate-300")} />
                          <span>{candidate.isActive ? "AKTIF" : "NONAKTIF"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="text-slate-800 font-bold text-base line-clamp-1">{candidate.name}</h4>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block">Visi</span>
                          <p className="text-slate-600 text-xs italic line-clamp-2">&ldquo;{candidate.vision}&rdquo;</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">Misi</span>
                          <p className="text-slate-600 text-xs line-clamp-3 whitespace-pre-line">{candidate.mission}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Edit & Hapus */}
                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleEdit(candidate)}
                      disabled={isPending}
                      className="bg-amber-50 hover:bg-amber-100 hover:text-amber-700 border border-amber-200 text-amber-700 font-bold py-2 px-3 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span>✏️</span>
                      <span>Edit Data</span>
                    </button>

                    <button
                      onClick={() => handleDelete(candidate)}
                      disabled={isPending || candidate.isActive}
                      title={candidate.isActive ? "Nonaktifkan status terlebih dahulu untuk menghapus" : "Hapus Kandidat"}
                      className={
                        "font-bold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border " +
                        (candidate.isActive
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-red-50 hover:bg-red-100 text-red-600 border-red-200 active:scale-95 cursor-pointer")
                      }
                    >
                      <span>{candidate.isActive ? "🔒" : "🗑️"}</span>
                      <span>{candidate.isActive ? "Terkunci" : "Hapus"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
