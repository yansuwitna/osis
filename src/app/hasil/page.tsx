import { getElectionStats } from "@/lib/actions";
import LiveResultsView from "@/components/LiveResultsView";

export const dynamic = "force-dynamic";

export default async function HasilPage() {
  const stats = await getElectionStats();

  return <LiveResultsView initialStats={stats as any} />;
}
