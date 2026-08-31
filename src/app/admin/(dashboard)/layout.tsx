import { getAdminSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();

  // Proteksi: Jika belum login admin, redirect ke login
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-pink-50/30 w-full overflow-x-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 w-full min-h-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
