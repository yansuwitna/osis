import { getVoters, getElectionSettings } from "@/lib/actions";
import PrintInvitationsView from "@/components/PrintInvitationsView";

export const dynamic = "force-dynamic";

export default async function PrintInvitationsPage({
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

  const filteredVoters = allVoters.filter((v) => {
    const matchClass = selectedClass === "ALL" || v.className === selectedClass;
    const matchSearch =
      !search ||
      (v.code && v.code.toLowerCase().includes(search.toLowerCase())) ||
      (v.name && v.name.toLowerCase().includes(search.toLowerCase())) ||
      v.token.includes(search);
    return matchClass && matchSearch;
  });

  return (
    <PrintInvitationsView
      voters={filteredVoters}
      settings={settings}
      schoolName={params.school || settings.schoolName}
      date={params.date || settings.eventDate}
      time={params.time || settings.eventTime}
      place={params.place || settings.eventPlace}
    />
  );
}
