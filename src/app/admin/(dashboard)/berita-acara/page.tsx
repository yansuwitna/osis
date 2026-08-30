import { getBeritaAcaraData } from "@/lib/actions";
import AdminBeritaAcara from "@/components/AdminBeritaAcara";

export const dynamic = "force-dynamic";

export default async function AdminBeritaAcaraPage() {
  const data = await getBeritaAcaraData();

  return <AdminBeritaAcara initialData={data as any} />;
}
