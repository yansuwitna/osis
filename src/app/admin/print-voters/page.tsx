import { getVoters, getElectionSettings } from "@/lib/actions";
import PrintVotersView from "@/components/PrintVotersView";

export const dynamic = "force-dynamic";

export default async function PrintVotersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const [allVoters, settings] = await Promise.all([
    getVoters(),
    getElectionSettings(),
  ]);

  const selectedClass = params.class || "ALL";
  const search = params.q || "";
  const filterStatus = params.status || "all";

  const filteredVoters = allVoters.filter((v) => {
    const matchClass = selectedClass === "ALL" || v.className === selectedClass;
    const matchSearch =
      !search ||
      (v.code && v.code.toLowerCase().includes(search.toLowerCase())) ||
      (v.name && v.name.toLowerCase().includes(search.toLowerCase())) ||
      v.token.toLowerCase().includes(search.toLowerCase()) ||
      v.className.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "voted" && v.voted) ||
      (filterStatus === "not_voted" && !v.voted);

    return matchClass && matchSearch && matchStatus;
  });

  return (
    <PrintVotersView
      voters={filteredVoters}
      settings={settings}
      selectedClass={selectedClass}
    />
  );
}
