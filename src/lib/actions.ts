"use server";

import type { Prisma, ElectionType } from "@prisma/client";
import db from "./db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

// GENERATE 6-DIGIT NUMERIC ONLY TOKEN (0-9)
function generateNumericToken(): string {
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += Math.floor(Math.random() * 10).toString();
  }
  return token;
}

// ==========================================
// 1. ELECTION SETTINGS ACTIONS
// ==========================================

export async function getElectionSettings() {
  try {
    if (!db.electionSetting) {
      return {
        id: "active_setting",
        activePilcosis: true,
        activePks: false,
        activeMpk: false,
        title: "PEMILIHAN OSIS, PKS & MPK",
        schoolName: "SMA / SMK NEGERI 1 INDONESIA",
        eventDate: "Senin, 15 September 2026",
        eventTime: "08:00 - 12:00 WIB",
        eventPlace: "Bilik Suara Lab Komputer",
        signatureCity: "Karangasem",
        updatedAt: new Date(),
      };
    }

    let setting = await db.electionSetting.findUnique({
      where: { id: "active_setting" },
    });

    if (!setting) {
      setting = await db.electionSetting.create({
        data: {
          id: "active_setting",
          activePilcosis: true,
          activePks: true,
          activeMpk: true,
          title: "PEMILIHAN OSIS, PKS & MPK",
          schoolName: "SMA / SMK NEGERI 1 INDONESIA",
          eventDate: "Senin, 15 September 2026",
          eventTime: "08:00 - 12:00 WIB",
          eventPlace: "Bilik Suara Lab Komputer",
          committeeChairman: "Ketua Panitia",
          committeeSecretary: "Sekretaris Panitia",
          headmasterName: "Kepala Sekolah",
          headmasterNip: "-",
        },
      });
    }

    return setting;
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return {
      id: "active_setting",
      activePilcosis: true,
      activePks: false,
      activeMpk: false,
      title: "PEMILIHAN OSIS, PKS & MPK",
      schoolName: "SMA / SMK NEGERI 1 INDONESIA",
      eventDate: "Senin, 15 September 2026",
      eventTime: "08:00 - 12:00 WIB",
      eventPlace: "Bilik Suara Lab Komputer",
      committeeChairman: "Ketua Panitia",
      committeeSecretary: "Sekretaris Panitia",
      headmasterName: "Kepala Sekolah",
      headmasterNip: "-",
      updatedAt: new Date(),
    };
  }
}

export async function updateElectionSettings(formData: {
  activePilcosis: boolean;
  activePks: boolean;
  activeMpk: boolean;
  title?: string;
  schoolName?: string;
  eventDate?: string;
  eventTime?: string;
  eventPlace?: string;
  signatureCity?: string;
  committeeChairman?: string;
  committeeSecretary?: string;
  headmasterName?: string;
  headmasterNip?: string;
}) {
  try {
    // Validasi minimal 1 pemilihan harus aktif
    if (!formData.activePilcosis && !formData.activePks && !formData.activeMpk) {
      return { success: false, error: "Minimal harus mengaktifkan 1 jenis pemilihan!" };
    }

    const updateData: any = {
      activePilcosis: formData.activePilcosis,
      activePks: formData.activePks,
      activeMpk: formData.activeMpk,
    };

    if (formData.title !== undefined) updateData.title = formData.title.trim();
    if (formData.schoolName !== undefined) updateData.schoolName = formData.schoolName.trim();
    if (formData.eventDate !== undefined) updateData.eventDate = formData.eventDate.trim();
    if (formData.eventTime !== undefined) updateData.eventTime = formData.eventTime.trim();
    if (formData.eventPlace !== undefined) updateData.eventPlace = formData.eventPlace.trim();
    if (formData.signatureCity !== undefined) updateData.signatureCity = formData.signatureCity.trim();
    if (formData.committeeChairman !== undefined) updateData.committeeChairman = formData.committeeChairman.trim();
    if (formData.committeeSecretary !== undefined) updateData.committeeSecretary = formData.committeeSecretary.trim();
    if (formData.headmasterName !== undefined) updateData.headmasterName = formData.headmasterName.trim();
    if (formData.headmasterNip !== undefined) updateData.headmasterNip = formData.headmasterNip.trim();

    const existing = await db.electionSetting.findUnique({
      where: { id: "active_setting" },
    });

    if (existing) {
      await db.electionSetting.update({
        where: { id: "active_setting" },
        data: updateData,
      });
    } else {
      await db.electionSetting.create({
        data: {
          id: "active_setting",
          activePilcosis: formData.activePilcosis,
          activePks: formData.activePks,
          activeMpk: formData.activeMpk,
          title: formData.title?.trim() || "PEMILIHAN OSIS, PKS & MPK",
          schoolName: formData.schoolName?.trim() || "SMA / SMK NEGERI 1 INDONESIA",
          eventDate: formData.eventDate?.trim() || "Senin, 15 September 2026",
          eventTime: formData.eventTime?.trim() || "08:00 - 12:00 WIB",
          eventPlace: formData.eventPlace?.trim() || "Bilik Suara Lab Komputer",
          signatureCity: formData.signatureCity?.trim() || "Karangasem",
          committeeChairman: formData.committeeChairman?.trim() || "Ketua Panitia",
          committeeSecretary: formData.committeeSecretary?.trim() || "Sekretaris Panitia",
          headmasterName: formData.headmasterName?.trim() || "Kepala Sekolah",
          headmasterNip: formData.headmasterNip?.trim() || "-",
        },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/committee");
    revalidatePath("/admin/invitations");
    revalidatePath("/admin/voters");
    revalidatePath("/vote");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menyimpan pengaturan: " + error.message };
  }
}

// ==========================================
// 2. VOTER ACTIONS (SISWA / BILIK SUARA)
// ==========================================

export async function voterLogin(token: string) {
  try {
    const cleanToken = token.trim();
    const voter = await db.voter.findUnique({
      where: { token: cleanToken },
    });

    if (!voter) {
      return { success: false, error: "Token tidak valid! Pastikan 6 digit angka benar." };
    }

    const settings = await getElectionSettings();

    // Periksa apakah semua pemilihan aktif sudah dipilih oleh pemilih ini
    const needsPilcosis = settings.activePilcosis && !voter.votedPilcosis;
    const needsPks = settings.activePks && !voter.votedPks;
    const needsMpk = settings.activeMpk && !voter.votedMpk;

    if (!needsPilcosis && !needsPks && !needsMpk) {
      return { success: false, error: "Token ini sudah selesai digunakan untuk semua pemilihan yang aktif." };
    }

    // Set voter session cookie
    const cookieStore = await cookies();
    cookieStore.set("voter_id", voter.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 20, // 20 menit
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Terjadi kesalahan sistem: " + error.message };
  }
}

export async function getVoterSession() {
  const cookieStore = await cookies();
  const voterId = cookieStore.get("voter_id")?.value;

  if (!voterId) return null;

  try {
    return await db.voter.findUnique({
      where: { id: voterId },
    });
  } catch {
    return null;
  }
}

export async function voterLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("voter_id");
  return { success: true };
}

// Submit voting untuk 1 kategori atau paket multi-kategori
export async function submitVoteElection(votes: { type: ElectionType; candidateId: string }[]) {
  try {
    const cookieStore = await cookies();
    const voterId = cookieStore.get("voter_id")?.value;

    if (!voterId) {
      return { success: false, error: "Sesi pemilihan berakhir, silakan login kembali." };
    }

    const voter = await db.voter.findUnique({
      where: { id: voterId },
    });

    if (!voter) {
      return { success: false, error: "Data pemilih tidak ditemukan." };
    }

    const settings = await getElectionSettings();

    // Eksekusi transaksi simpan suara dan update status
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of votes) {
        // Cek apakah sudah pernah vote di jenis ini
        const existingVote = await tx.vote.findUnique({
          where: {
            type_voterId: {
              type: item.type,
              voterId: voterId,
            },
          },
        });

        if (!existingVote) {
          await tx.vote.create({
            data: {
              type: item.type,
              candidateId: item.candidateId,
              voterId: voterId,
            },
          });
        }
      }

      // Update voter flags
      const updateData: any = {};
      const now = new Date();

      for (const item of votes) {
        if (item.type === "PILKOSIS") {
          updateData.votedPilcosis = true;
          updateData.votedPilcosisAt = now;
        } else if (item.type === "PKS") {
          updateData.votedPks = true;
          updateData.votedPksAt = now;
        } else if (item.type === "MPK") {
          updateData.votedMpk = true;
          updateData.votedMpkAt = now;
        }
      }

      // Cek apakah semua aktif sudah voted
      const willBePilcosis = updateData.votedPilcosis || voter.votedPilcosis;
      const willBePks = updateData.votedPks || voter.votedPks;
      const willBeMpk = updateData.votedMpk || voter.votedMpk;

      const allCompleted =
        (!settings.activePilcosis || willBePilcosis) &&
        (!settings.activePks || willBePks) &&
        (!settings.activeMpk || willBeMpk);

      if (allCompleted) {
        updateData.voted = true;
        updateData.votedAt = now;
      }

      await tx.voter.update({
        where: { id: voterId },
        data: updateData,
      });
    });

    // Hapus sesi voter
    cookieStore.delete("voter_id");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal mengirim suara: " + error.message };
  }
}

// ==========================================
// 3. ADMIN AUTH ACTIONS
// ==========================================

export async function adminLogin(username: string, password: string) {
  try {
    let admin = await db.admin.findUnique({
      where: { username },
    });

    if (!admin && username === "admin") {
      admin = await db.admin.create({
        data: {
          username: "admin",
          password: "admin",
        },
      });
    }

    if (!admin || admin.password !== password) {
      return { success: false, error: "Username atau Password salah!" };
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_token", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 4, // 4 jam
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal login admin: " + error.message };
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token")?.value;

  if (!adminToken) return null;

  try {
    return await db.admin.findUnique({
      where: { id: adminToken },
    });
  } catch {
    return null;
  }
}

export async function changeAdminPassword(oldPassword: string, newPassword: string) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return { success: false, error: "Sesi admin berakhir, silakan login kembali." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password baru minimal 6 karakter!" };
    }

    if (admin.password !== oldPassword) {
      return { success: false, error: "Password lama yang Anda masukkan salah!" };
    }

    await db.admin.update({
      where: { id: admin.id },
      data: {
        password: newPassword,
      },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal mengubah password: " + error.message };
  }
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  return { success: true };
}

// ==========================================
// 4. CANDIDATE MANAGEMENT (CRUD KANDIDAT MULTI-PEMILIHAN)
// ==========================================

export async function getCandidates(type?: ElectionType) {
  try {
    return await db.candidate.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: "asc" }, { noUrut: "asc" }],
    });
  } catch (error) {
    console.error("Error getCandidates:", error);
    return [];
  }
}

export async function addCandidate(formData: FormData) {
  try {
    const type = (formData.get("type") as ElectionType) || "PILKOSIS";
    const noUrut = parseInt(formData.get("noUrut") as string);
    const name = formData.get("name") as string;
    const vision = formData.get("vision") as string;
    const mission = formData.get("mission") as string;
    const file = formData.get("photo") as File;

    if (isNaN(noUrut) || !name || !vision || !mission) {
      return { success: false, error: "Semua form nomor urut, nama, visi, dan misi wajib diisi!" };
    }

    // Cek duplikasi nomor urut pada jenis pemilihan yang sama
    const existing = await db.candidate.findUnique({
      where: {
        type_noUrut: {
          type,
          noUrut,
        },
      },
    });

    if (existing) {
      return { success: false, error: `Nomor urut ${noUrut} untuk kategori ${type} sudah digunakan!` };
    }

    let photoUrl = "";
    if (file && typeof (file as any).arrayBuffer === "function" && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const fileExt = path.extname(file.name) || ".jpg";
      const fileName = `kandidat_${type.toLowerCase()}_${noUrut}_${Date.now()}${fileExt}`;
      const filePath = path.join(uploadsDir, fileName);

      await writeFile(filePath, buffer);
      photoUrl = `/uploads/${fileName}`;
    }

    await db.candidate.create({
      data: {
        type,
        noUrut,
        name,
        vision,
        mission,
        photoUrl,
        isActive: true,
      },
    });

    revalidatePath("/vote");
    revalidatePath("/admin/candidates");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menyimpan kandidat: " + error.message };
  }
}

export async function updateCandidate(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const type = (formData.get("type") as ElectionType) || "PILKOSIS";
    const noUrut = parseInt(formData.get("noUrut") as string);
    const name = formData.get("name") as string;
    const vision = formData.get("vision") as string;
    const mission = formData.get("mission") as string;
    const isActive = formData.get("isActive") === "true";
    const file = formData.get("photo") as File;

    if (!id || isNaN(noUrut) || !name || !vision || !mission) {
      return { success: false, error: "Data kandidat tidak lengkap!" };
    }

    const candidate = await db.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      return { success: false, error: "Kandidat tidak ditemukan!" };
    }

    // Cek duplikasi nomor urut jika berubah
    if (candidate.noUrut !== noUrut || candidate.type !== type) {
      const existing = await db.candidate.findUnique({
        where: {
          type_noUrut: {
            type,
            noUrut,
          },
        },
      });

      if (existing && existing.id !== id) {
        return { success: false, error: `Nomor urut ${noUrut} untuk kategori ${type} sudah digunakan kandidat lain!` };
      }
    }

    let photoUrl = candidate.photoUrl;
    if (file && typeof (file as any).arrayBuffer === "function" && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const fileExt = path.extname(file.name) || ".jpg";
      const fileName = `kandidat_${type.toLowerCase()}_${noUrut}_${Date.now()}${fileExt}`;
      const filePath = path.join(uploadsDir, fileName);

      await writeFile(filePath, buffer);
      photoUrl = `/uploads/${fileName}`;

      // Hapus foto lama jika ada
      if (candidate.photoUrl && candidate.photoUrl.startsWith("/uploads/")) {
        try {
          await unlink(path.join(process.cwd(), "public", candidate.photoUrl));
        } catch {}
      }
    }

    await db.candidate.update({
      where: { id },
      data: {
        type,
        noUrut,
        name,
        vision,
        mission,
        photoUrl,
        isActive,
      },
    });

    revalidatePath("/vote");
    revalidatePath("/admin/candidates");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal memperbarui kandidat: " + error.message };
  }
}

export async function toggleCandidateStatus(id: string, isActive: boolean) {
  try {
    await db.candidate.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/vote");
    revalidatePath("/admin/candidates");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal mengubah status kandidat: " + error.message };
  }
}

export async function deleteCandidate(id: string) {
  try {
    const candidate = await db.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      return { success: false, error: "Kandidat tidak ditemukan!" };
    }

    // Proteksi: Jika kandidat berstatus aktif, tolak penghapusan
    if (candidate.isActive) {
      return {
        success: false,
        error: "Kandidat berstatus AKTIF tidak dapat dihapus! Nonaktifkan status kandidat terlebih dahulu jika ingin menghapusnya.",
      };
    }

    if (candidate.photoUrl && candidate.photoUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", candidate.photoUrl);
      try {
        await unlink(filePath);
      } catch (e) {
        console.error("Gagal menghapus file gambar: ", e);
      }
    }

    await db.vote.deleteMany({
      where: { candidateId: id },
    });

    await db.candidate.delete({
      where: { id },
    });

    revalidatePath("/vote");
    revalidatePath("/admin/candidates");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menghapus kandidat: " + error.message };
  }
}

// ==========================================
// 5. VOTER & DPT MANAGEMENT (UPLOAD KODE, NAMA, KELOMPOK)
// ==========================================

export async function getVoters() {
  try {
    return await db.voter.findMany({
      orderBy: [{ className: "asc" }, { name: "asc" }],
    });
  } catch (error) {
    console.error("Error getVoters:", error);
    return [];
  }
}

// Generate token 6 angka manual untuk kelas
export async function generateTokens(count: number, className: string) {
  try {
    if (count <= 0 || !className.trim()) {
      return { success: false, error: "Jumlah token dan nama kelas tidak boleh kosong!" };
    }

    const createdVoters: Array<{ token: string; className: string }> = [];
    let attempts = 0;

    while (createdVoters.length < count && attempts < count * 10) {
      const token = generateNumericToken();
      attempts++;

      const existing = await db.voter.findUnique({
        where: { token },
      });

      if (!existing && !createdVoters.some((v) => v.token === token)) {
        createdVoters.push({
          token,
          className: className.trim(),
        });
      }
    }

    await db.voter.createMany({
      data: createdVoters,
    });

    revalidatePath("/admin/voters");
    revalidatePath("/admin/upload-voters");
    revalidatePath("/admin/invitations");
    return { success: true, count: createdVoters.length };
  } catch (error: any) {
    return { success: false, error: "Gagal generate token: " + error.message };
  }
}

// Batch Import Pemilih (KODE, NAMA, KELOMPOK) dengan auto-generate 6-digit numeric token
export interface VoterImportItem {
  code: string;
  name: string;
  className: string;
}

export async function importVotersBatch(dataList: VoterImportItem[]) {
  try {
    if (!dataList || dataList.length === 0) {
      return { success: false, error: "Data pemilih yang diupload kosong!" };
    }

    let successCount = 0;
    let skippedCount = 0;

    for (const item of dataList) {
      const code = item.code ? String(item.code).trim() : undefined;
      const name = item.name ? String(item.name).trim() : "";
      const className = item.className ? String(item.className).trim() : "UMUM";

      if (!name) {
        skippedCount++;
        continue;
      }

      // Cek apakah code sudah ada
      if (code) {
        const existingCode = await db.voter.findUnique({
          where: { code },
        });
        if (existingCode) {
          // Update data jika code sudah ada
          await db.voter.update({
            where: { code },
            data: {
              name,
              className,
            },
          });
          successCount++;
          continue;
        }
      }

      // Generate 6 digit angka unik yang belum ada di DB
      let token = "";
      let isUnique = false;
      let loopCount = 0;
      while (!isUnique && loopCount < 30) {
        token = generateNumericToken();
        loopCount++;
        const check = await db.voter.findUnique({ where: { token } });
        if (!check) isUnique = true;
      }

      await db.voter.create({
        data: {
          code: code || null,
          name,
          className,
          token,
        },
      });

      successCount++;
    }

    revalidatePath("/admin/voters");
    revalidatePath("/admin/upload-voters");
    revalidatePath("/admin/invitations");
    return {
      success: true,
      imported: successCount,
      skipped: skippedCount,
    };
  } catch (error: any) {
    return { success: false, error: "Gagal import data pemilih: " + error.message };
  }
}

export async function deleteVoter(id: string) {
  try {
    await db.vote.deleteMany({
      where: { voterId: id },
    });

    await db.voter.delete({
      where: { id },
    });

    revalidatePath("/admin/voters");
    revalidatePath("/admin/upload-voters");
    revalidatePath("/admin/invitations");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menghapus pemilih: " + error.message };
  }
}

export async function deleteAllVotersAndData() {
  try {
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.vote.deleteMany();
      await tx.voter.deleteMany();
    });

    revalidatePath("/admin/voters");
    revalidatePath("/admin/upload-voters");
    revalidatePath("/admin/invitations");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal mengosongkan data pemilih: " + error.message };
  }
}

// Kosongkan SELURUH DATA database (Suara, Pemilih/DPT, Kandidat, dan Reset Pengaturan/Panitia - HANYA SISAKAN AKUN ADMIN)
export async function wipeEntireDatabase() {
  try {
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.vote.deleteMany();
      await tx.voter.deleteMany();
      await tx.candidate.deleteMany();
      await tx.electionSetting.deleteMany();
    });

    revalidatePath("/admin");
    revalidatePath("/admin/candidates");
    revalidatePath("/admin/voters");
    revalidatePath("/admin/upload-voters");
    revalidatePath("/admin/invitations");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/committee");
    revalidatePath("/admin/backup");
    revalidatePath("/vote");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal mengosongkan seluruh database: " + error.message };
  }
}

// Reset Suara tanpa menghapus pemilih
export async function clearAllVoteData() {
  try {
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.vote.deleteMany();
      await tx.voter.updateMany({
        data: {
          voted: false,
          votedAt: null,
          votedPilcosis: false,
          votedPilcosisAt: null,
          votedPks: false,
          votedPksAt: null,
          votedMpk: false,
          votedMpkAt: null,
        },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/vote");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal mereset data voting: " + error.message };
  }
}

// ==========================================
// 6. MULTI-ELECTION STATISTICS & DASHBOARD
// ==========================================

export async function getElectionStats(type?: ElectionType) {
  try {
    const settings = await getElectionSettings();
    const totalVoters = await db.voter.count();

    // Suara PILKOSIS
    const votesPilcosis = await db.vote.count({ where: { type: "PILKOSIS" } });
    // Suara PKS
    const votesPks = await db.vote.count({ where: { type: "PKS" } });
    // Suara MPK
    const votesMpk = await db.vote.count({ where: { type: "MPK" } });

    // Ambil perolehan kandidat
    const candidates = await db.candidate.findMany({
      where: type ? { type } : undefined,
      select: {
        id: true,
        type: true,
        noUrut: true,
        name: true,
        _count: {
          select: { votes: true },
        },
      },
      orderBy: [{ type: "asc" }, { noUrut: "asc" }],
    });

    const chartData = candidates.map((c) => ({
      id: c.id,
      type: c.type,
      name: `No. ${c.noUrut}`,
      fullName: c.name,
      votes: c._count.votes,
    }));

    return {
      settings,
      totalVoters,
      votesPilcosis,
      votesPks,
      votesMpk,
      candidates,
      chartData,
    };
  } catch (error: any) {
    console.error("Gagal memuat statistik:", error);
    return {
      settings: {
        id: "active_setting",
        activePilcosis: true,
        activePks: false,
        activeMpk: false,
        title: "PEMILIHAN OSIS",
        updatedAt: new Date(),
      },
      totalVoters: 0,
      votesPilcosis: 0,
      votesPks: 0,
      votesMpk: 0,
      candidates: [],
      chartData: [],
    };
  }
}

// ==========================================
// 7. BACKUP & RESTORE ACTIONS
// ==========================================

export async function backupAllData() {
  try {
    const settings = await getElectionSettings();
    const candidates = await db.candidate.findMany({
      orderBy: [{ type: "asc" }, { noUrut: "asc" }],
    });
    const voters = await db.voter.findMany({
      orderBy: [{ className: "asc" }, { name: "asc" }],
    });
    const votes = await db.vote.findMany({
      orderBy: { createdAt: "asc" },
    });

    const backupData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      appName: "E-VOTING (PILKOSIS, PKS, MPK)",
      data: {
        settings,
        candidates,
        voters,
        votes,
      },
    };

    return {
      success: true,
      backup: backupData,
      data: backupData,
    };
  } catch (error: any) {
    return { success: false, error: "Gagal membuat backup data: " + error.message };
  }
}

export async function restoreAllData(jsonString: string) {
  return restoreDatabase(jsonString);
}

export async function restoreDatabase(jsonString: string) {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed.appName || !parsed.appName.includes("E-VOTING")) {
      return { success: false, error: "Format file backup tidak valid! Pastikan file berasal dari E-VOTING." };
    }

    const payload = parsed.data || parsed;
    const { settings, candidates, voters, votes } = payload;

    // Jalankan dalam transaksi: bersihkan dan import
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Hapus seluruh data lama
      await tx.vote.deleteMany();
      await tx.voter.deleteMany();
      await tx.candidate.deleteMany();

      // 2. Restore settings jika ada
      if (settings) {
        await tx.electionSetting.upsert({
          where: { id: "active_setting" },
          update: {
            activePilcosis: settings.activePilcosis ?? true,
            activePks: settings.activePks ?? false,
            activeMpk: settings.activeMpk ?? false,
            title: settings.title ?? "PEMILIHAN OSIS, PKS & MPK",
            schoolName: settings.schoolName ?? "SMA / SMK NEGERI 1 INDONESIA",
            eventDate: settings.eventDate ?? "Senin, 15 September 2026",
            eventTime: settings.eventTime ?? "08:00 - 12:00 WIB",
            eventPlace: settings.eventPlace ?? "Bilik Suara Lab Komputer",
            signatureCity: settings.signatureCity ?? "Karangasem",
            committeeChairman: settings.committeeChairman ?? "Ketua Panitia",
            committeeSecretary: settings.committeeSecretary ?? "Sekretaris Panitia",
            headmasterName: settings.headmasterName ?? "Kepala Sekolah",
            headmasterNip: settings.headmasterNip ?? "-",
          },
          create: {
            id: "active_setting",
            activePilcosis: settings.activePilcosis ?? true,
            activePks: settings.activePks ?? false,
            activeMpk: settings.activeMpk ?? false,
            title: settings.title ?? "PEMILIHAN OSIS, PKS & MPK",
            schoolName: settings.schoolName ?? "SMA / SMK NEGERI 1 INDONESIA",
            eventDate: settings.eventDate ?? "Senin, 15 September 2026",
            eventTime: settings.eventTime ?? "08:00 - 12:00 WIB",
            eventPlace: settings.eventPlace ?? "Bilik Suara Lab Komputer",
            signatureCity: settings.signatureCity ?? "Karangasem",
            committeeChairman: settings.committeeChairman ?? "Ketua Panitia",
            committeeSecretary: settings.committeeSecretary ?? "Sekretaris Panitia",
            headmasterName: settings.headmasterName ?? "Kepala Sekolah",
            headmasterNip: settings.headmasterNip ?? "-",
          },
        });
      }

      // 3. Masukkan kandidat
      for (const c of candidates) {
        await tx.candidate.create({
          data: {
            id: c.id,
            type: c.type || "PILKOSIS",
            noUrut: c.noUrut,
            name: c.name,
            vision: c.vision,
            mission: c.mission,
            photoUrl: c.photoUrl || "",
          },
        });
      }

      // 4. Masukkan pemilih
      for (const v of voters) {
        await tx.voter.create({
          data: {
            id: v.id,
            code: v.code || null,
            name: v.name || null,
            className: v.className || "UMUM",
            token: v.token,
            voted: v.voted ?? false,
            votedAt: v.votedAt ? new Date(v.votedAt) : null,
            votedPilcosis: v.votedPilcosis ?? false,
            votedPilcosisAt: v.votedPilcosisAt ? new Date(v.votedPilcosisAt) : null,
            votedPks: v.votedPks ?? false,
            votedPksAt: v.votedPksAt ? new Date(v.votedPksAt) : null,
            votedMpk: v.votedMpk ?? false,
            votedMpkAt: v.votedMpkAt ? new Date(v.votedMpkAt) : null,
          },
        });
      }

      // 5. Masukkan data suara
      for (const vote of votes) {
        await tx.vote.create({
          data: {
            id: vote.id,
            type: vote.type || "PILKOSIS",
            candidateId: vote.candidateId,
            voterId: vote.voterId,
            createdAt: new Date(vote.createdAt),
          },
        });
      }
    });

    revalidatePath("/admin");
    revalidatePath("/admin/candidates");
    revalidatePath("/admin/voters");
    revalidatePath("/admin/upload-voters");
    revalidatePath("/admin/invitations");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/committee");
    revalidatePath("/admin/backup");
    revalidatePath("/admin/print-invitations");
    revalidatePath("/vote");
    revalidatePath("/");

    return {
      success: true,
      summary: {
        candidates: candidates.length,
        voters: voters.length,
        votes: votes.length,
      },
    };
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return { success: false, error: "File bukan format JSON yang valid!" };
    }
    return { success: false, error: "Gagal restore data: " + error.message };
  }
}

// 7. LOGO & TTD UPLOAD ACTION (Simpan logo.png, sekolah.png, & ttd.png ke public/)
export async function uploadLogoAction(type: "osis" | "sekolah" | "ttd", base64Data: string) {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    // Ekstrak data base64 murni
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }

    const fileName = type === "osis" ? "logo.png" : type === "sekolah" ? "sekolah.png" : "ttd.png";
    const publicDir = path.join(process.cwd(), "public");
    const filePath = path.join(publicDir, fileName);

    await fs.writeFile(filePath, buffer);

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/vote", "layout");
    revalidatePath("/admin/print-invitations");

    return { success: true, fileName };
  } catch (error: any) {
    return { success: false, error: "Gagal menyimpan file: " + error.message };
  }
}
