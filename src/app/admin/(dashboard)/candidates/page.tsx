import { getCandidates } from "@/lib/actions";
import AdminCandidates from "@/components/AdminCandidates";

export const dynamic = "force-dynamic";

export default async function AdminCandidatesPage() {
  const candidates = await getCandidates();

  return <AdminCandidates initialCandidates={candidates} />;
}
