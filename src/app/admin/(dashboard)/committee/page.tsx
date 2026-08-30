import { getElectionSettings } from "@/lib/actions";
import AdminCommittee from "@/components/AdminCommittee";

export const dynamic = "force-dynamic";

export default async function CommitteePage() {
  const settings = await getElectionSettings();

  return <AdminCommittee settings={settings} />;
}
