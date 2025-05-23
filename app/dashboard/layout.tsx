"use client";

import { DashboardTopBar } from "@/components/dashboard/top-bar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import type React from "react";
import { useState, useEffect } from "react"; // Import useState and useEffect
import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatProvider } from "@/contexts/ChatContext"; // Import ChatProvider

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpenModal, onOpenModalChange } = useDashboardAccess();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <DashboardTopBar />
      {/* Conditionally render Dialog after client has mounted to avoid hydration issues with isOpenModal */}
      {hasMounted && (
        <Dialog open={isOpenModal} onOpenChange={onOpenModalChange}> 
          <DialogContent className="sm:max-w-[425px] data-[state=open]:bg-black/95"> 
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
      )}
      {/* Wrap the sidebar and main content with ChatProvider */}
      <ChatProvider>
        <div className="flex flex-1 overflow-hidden"> {/* Added overflow-hidden here */}
          {hasMounted && <DashboardSidebar />} {/* Conditionally render Sidebar */}
          {/* Removed overflow-auto from main, let children handle scroll */}
          <main className="flex-1 p-6">{children}</main> 
        </div>
      </ChatProvider>
    </div>
  );
}
