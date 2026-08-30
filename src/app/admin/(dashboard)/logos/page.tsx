import fs from "fs";
import path from "path";
import AdminLogos from "@/components/AdminLogos";

export const dynamic = "force-dynamic";

export default function AdminLogosPage() {
  const publicDir = path.join(process.cwd(), "public");
  const hasOsisLogo = fs.existsSync(path.join(publicDir, "logo.png"));
  const hasSchoolLogo = fs.existsSync(path.join(publicDir, "sekolah.png"));
  const hasTtd = fs.existsSync(path.join(publicDir, "ttd.png"));

  return <AdminLogos hasOsisLogo={hasOsisLogo} hasSchoolLogo={hasSchoolLogo} hasTtd={hasTtd} />;
}
