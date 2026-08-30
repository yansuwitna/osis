import { getVoters, getElectionSettings } from "@/lib/actions";
import AdminVoters from "@/components/AdminVoters";

export const dynamic = "force-dynamic";

export default async function AdminVotersPage() {
  const [voters, settings] = await Promise.all([
    getVoters(),
    getElectionSettings(),
  ]);

  return <AdminVoters initialVoters={voters} settings={settings} />;
}
