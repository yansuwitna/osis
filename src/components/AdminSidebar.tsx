"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminLogout } from "@/lib/actions";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await adminLogout();
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard Hasil", icon: "📊", path: "/admin" },
    { name: "Live Quick Count", icon: "🔴", path: "/results" },
    { name: "Berita Acara Hasil", icon: "📜", path: "/admin/berita-acara" },
    { name: "Pengaturan Pemilihan", icon: "⚙️", path: "/admin/settings" },
    { name: "Data Panitia", icon: "👔", path: "/admin/committee" },
    { name: "Logo & Favicon", icon: "🎨", path: "/admin/logos" },
    { name: "Kelola Kandidat", icon: "👥", path: "/admin/candidates" },
    { name: "Upload DPT / Pemilih", icon: "📥", path: "/admin/upload-voters" },
    { name: "Cetak Surat Panggilan", icon: "✉️", path: "/admin/invitations" },
    { name: "Cetak Daftar Pemilih", icon: "🖨️", path: "/admin/voters" },
    { name: "Cetak Token", icon: "🎟️", path: "/admin/tokens" },
    { name: "Backup & Restore", icon: "💾", path: "/admin/backup" },
    { name: "Ubah Password", icon: "🔑", path: "/admin/password" },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-violet-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 print:hidden shadow-sm">
        <div className="flex items-center gap-2.5">
          {/* Logo OSIS di Samping Kiri */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-violet-50/50 border border-violet-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Logo OSIS"
              className="max-h-7 max-w-7 object-contain"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = "none";
                if (target.parentElement) target.parentElement.innerHTML = "👑";
              }}
            />
          </div>
          <div>
            <h2 className="font-black text-xs text-slate-800 leading-tight">Panel Panitia</h2>
            <span className="text-[10px] text-pink-500 font-bold">PILKOSIS · PKS · MPK</span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all active:scale-95"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden print:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white lg:bg-white/80 backdrop-blur-xl border-r border-violet-100 text-slate-600 flex flex-col min-h-screen shrink-0 shadow-xl lg:shadow-lg lg:shadow-violet-100/20 print:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-violet-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo OSIS di Samping Kiri */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-violet-50/50 border border-violet-100 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo OSIS"
                className="max-h-8 max-w-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = "none";
                  if (target.parentElement) target.parentElement.innerHTML = "👑";
                }}
              />
            </div>
            <div>
              <h2 className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600 leading-tight">
                Panel Panitia
              </h2>
              <span className="text-[10px] text-pink-400 font-bold block">PILKOSIS · PKS · MPK</span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-300/30"
                    : "hover:bg-violet-50 hover:text-violet-700 text-slate-500"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-violet-100 space-y-3">
          <div className="bg-violet-50 rounded-2xl p-3 border border-violet-100 text-center">
            <span className="text-[10px] text-violet-400 block uppercase font-bold tracking-wider">Login Sebagai</span>
            <span className="text-xs font-bold text-violet-700">Administrator</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-slate-500 font-semibold py-2.5 px-4 rounded-2xl transition-all duration-300 transform active:scale-95 text-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout Admin
          </button>
        </div>
      </aside>
    </>
  );
}


