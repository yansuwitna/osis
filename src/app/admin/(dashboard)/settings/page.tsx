import { getElectionSettings, clearAllVoteData, deleteAllVotersAndData } from '@/lib/actions';
import AdminSettings from '@/components/AdminSettings';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getElectionSettings();
  return <AdminSettings initialSettings={settings} />;
}
