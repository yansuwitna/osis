import { getVoters, getElectionSettings } from '@/lib/actions';
import AdminTokens from '@/components/AdminTokens';

export const dynamic = 'force-dynamic';

export default async function AdminTokensPage() {
  const [voters, settings] = await Promise.all([
    getVoters(),
    getElectionSettings(),
  ]);
  return <AdminTokens initialVoters={voters} settings={settings} />;
}
