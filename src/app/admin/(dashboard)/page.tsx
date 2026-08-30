import { getElectionStats } from "@/lib/actions";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getElectionStats();

  return <AdminDashboard initialStats={stats} />;
}
