"use client";

import { DashboardTopBar } from "@/components/dashboard/top-bar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import type React from "react";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, onOpenChange } = useDashboardAccess();

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <DashboardTopBar />
      <Dialog open={isOpen} onOpenChange={onOpenChange} className="data-[state=open]:bg-black/95">
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Premium Access Required</DialogTitle>
            <DialogDescription>
              This feature is available to premium users only. Please participate in the presale to unlock this feature.
            </DialogDescription>
          </DialogHeader>
          {/* Add a link or button to the presale here later */}
          <div>
            Presale information will go here.
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
