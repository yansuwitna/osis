import { getVoters } from '@/lib/actions';
import AdminUploadVoters from '@/components/AdminUploadVoters';

export const dynamic = 'force-dynamic';

export default async function UploadVotersPage() {
  const voters = await getVoters();
  return <AdminUploadVoters initialVoters={voters} />;
}
