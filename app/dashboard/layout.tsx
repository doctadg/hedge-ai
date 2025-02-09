"use client";

import { DashboardTopBar } from "@/components/dashboard/top-bar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import type React from "react";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { renderContent } = useDashboardAccess();

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <DashboardTopBar />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto p-6">{renderContent(children)}</main>
      </div>
    </div>
  );
}
