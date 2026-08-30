import { getBeritaAcaraData } from "@/lib/actions";
import PrintBeritaAcaraView from "@/components/PrintBeritaAcaraView";

export const dynamic = "force-dynamic";

export default async function PrintBeritaAcaraPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const data = await getBeritaAcaraData();

  const selectedCategory = params.category || "ALL";
  const documentNumber = params.docNo || `001/BA-PILKOSIS/${new Date().getFullYear()}`;
  const notes = params.notes || "";
  
  const saksiList = [
    params.saksi1 || "Saksi Paslon 01",
    params.saksi2 || "Saksi Paslon 02",
    params.saksi3 || "Saksi Perwakilan Siswa / MPK",
  ].filter(Boolean);

  return (
    <PrintBeritaAcaraView
      settings={data.settings}
      candidates={data.candidates}
      turnout={data.turnout}
      totalVoters={data.totalVoters}
      votedGeneral={data.votedGeneral}
      selectedCategory={selectedCategory}
      documentNumber={documentNumber}
      notes={notes}
      saksiList={saksiList}
    />
  );
}
