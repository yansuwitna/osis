import { getVoterSession, getCandidates, getElectionSettings } from "@/lib/actions";
import { redirect } from "next/navigation";
import VotingBooth from "@/components/VotingBooth";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const voter = await getVoterSession();
  const settings = await getElectionSettings();

  if (!voter) {
    redirect("/");
  }

  // Cek apakah voter sudah memilih semua pemilihan yang aktif
  const needsPilcosis = settings.activePilcosis && !voter.votedPilcosis;
  const needsPks = settings.activePks && !voter.votedPks;
  const needsMpk = settings.activeMpk && !voter.votedMpk;

  if (!needsPilcosis && !needsPks && !needsMpk) {
    redirect("/");
  }

  const candidates = await getCandidates();

  return <VotingBooth voter={voter as any} candidates={candidates as any} settings={settings} />;
}

