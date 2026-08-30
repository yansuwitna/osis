import { getVoters, getElectionSettings } from '@/lib/actions';
import AdminInvitations from '@/components/AdminInvitations';

export const dynamic = 'force-dynamic';

export default async function AdminInvitationsPage() {
  const voters = await getVoters();
  const settings = await getElectionSettings();
  return <AdminInvitations initialVoters={voters} settings={settings} />;
}
