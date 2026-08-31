import { getVoters, getElectionSettings } from "@/lib/actions";
import PrintTokensView from "@/components/PrintTokensView";

export const dynamic = "force-dynamic";

export default async function PrintTokensPage({
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
  const perPage = params.perPage === "60" ? 60 : 30;

  const filteredVoters = allVoters.filter((v) => {
    const matchClass = selectedClass === "ALL" || v.className === selectedClass;
    const matchSearch =
      !search ||
      (v.code && v.code.toLowerCase().includes(search.toLowerCase())) ||
      (v.name && v.name.toLowerCase().includes(search.toLowerCase())) ||
      v.token.toLowerCase().includes(search.toLowerCase()) ||
      v.className.toLowerCase().includes(search.toLowerCase());

    return matchClass && matchSearch;
  });

  return (
    <PrintTokensView
      voters={filteredVoters}
      settings={settings}
      selectedClass={selectedClass}
      perPage={perPage}
    />
  );
}
