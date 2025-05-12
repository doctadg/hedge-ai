"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, LayoutGrid, LineChart, Layers, MessageSquare, Settings, Shield, PlusIcon } from "lucide-react" // Added PlusIcon
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useWallet } from "@/contexts/WalletContext"
import { useChat } from "@/contexts/ChatContext" // Import useChat
import { ScrollArea } from "@/components/ui/scroll-area" // Import ScrollArea

const categories = [
  {
    title: "TOOLS",
    items: [{ label: "Overview", icon: "LayoutGrid", href: "/dashboard" }],
  },
  {
    title: "PNL ANALYSIS",
    items: [{ label: "Performance", icon: "LineChart", href: "/dashboard/performance" }],
  },
  {
    title: "HEDGING",
    items: [
      { label: "Generate Strategy", icon: "LineChart", href: "/dashboard/generate-strategy" },
    ],
  },
  {
    title: "PORTFOLIO MANAGEMENT",
    items: [{ label: "Allocations", icon: "Layers", href: "/dashboard/allocations" }],
  },
  {
    title: "AI ASSISTANT",
    items: [
      { label: "Genius (TM)", icon: "MessageSquare", href: "/dashboard/chat" },
    ],
  },
]

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { status } = useWallet();
  const isConnected = status === 'authenticated';
  // Get chat context
  const { 
    conversations, 
    selectConversation, 
    startNewChat, 
    currentConversationId, 
    isLoadingConversations, 
    errorConversations 
  } = useChat(); 
  
  const isChatPage = pathname === "/dashboard/chat";

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-[#1a1a1a] bg-[#0a0a0a] lg:static lg:block`}
      >
        <div className="p-4">
          <input
            type="search"
            placeholder="Search metrics"
            className="w-full rounded-md border-0 bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        {/* Use flex column for the entire nav area */}
        <nav className="flex flex-col flex-1 p-2 overflow-hidden"> 
          {/* Main navigation items */}
          <div className="space-y-6 mb-4"> 
            {categories.map((category) => (
              <div key={category.title} className="space-y-2">
                <h2 className="px-2 text-xs font-semibold text-gray-400">{category.title}</h2>
              {category.items.map((item) => {
                const Icon =
                  item.icon === "LayoutGrid"
                    ? LayoutGrid
                    : item.icon === "LineChart"
                      ? LineChart
                      : item.icon === "Layers"
                        ? Layers
                        : item.icon === "MessageSquare"
                          ? MessageSquare
                          : item.icon === "Shield"
                            ? Shield
                            : Settings
                const isActive = pathname === item.href;

                // Only show the Overview option if not connected
                if (!isConnected && item.label !== "Overview") {
                  return null
                }

                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    asChild
                    className={`w-full justify-start ${
                      isActive ? "bg-[#1a1a1a] text-white" : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                    }`}
                  >
                    <Link href={item.href} onClick={() => isOpen && setIsOpen(false)}> {/* Close mobile sidebar on link click */}
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
              </div>
            ))}
          </div>

          {/* Conditionally render Conversations section - make it take remaining space */}
          {isChatPage && (
            <div className="flex flex-col flex-1 space-y-2 pt-4 border-t border-[#1a1a1a] overflow-hidden"> {/* Added flex-1 and overflow-hidden */}
              <div className="flex justify-between items-center px-2"> {/* Container for title and button */}
                 <h2 className="text-xs font-semibold text-gray-400">CONVERSATIONS</h2>
                 <Button
                   variant="ghost"
                   size="sm" // Smaller button
                   onClick={() => {
                     startNewChat();
                     if (isOpen) setIsOpen(false); // Close mobile sidebar
                   }}
                   className="text-gray-400 hover:bg-[#1a1a1a] hover:text-white px-1 py-0.5" // Reduced padding
                 >
                   <PlusIcon className="h-4 w-4" /> 
                   {/* Optionally hide text on small sidebar widths later */}
                   {/* <span className="ml-1">New</span> */}
                 </Button>
              </div>
              {/* Removed explicit height, use flex-1 on parent */}
              <ScrollArea className="flex-1"> 
                <div className="space-y-1 pr-2"> {/* Add padding-right for scrollbar */}
                  {isLoadingConversations && <p className="px-2 text-xs text-gray-500">Loading...</p>}
                  {errorConversations && <p className="px-2 text-xs text-red-500">Error loading chats</p>}
                  {!isLoadingConversations && conversations.map((conv) => (
                    <Button
                      key={conv.id}
                      variant="ghost"
                      onClick={() => {
                        selectConversation(conv.id);
                        if (isOpen) setIsOpen(false); // Close mobile sidebar
                      }}
                      className={`w-full justify-start text-left truncate h-8 px-2 py-1 ${ // Adjusted height/padding
                        currentConversationId === conv.id
                          ? "bg-[#1a1a1a] text-white"
                          : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                      }`}
                    >
                      <span className="flex-1 truncate text-sm">{conv.title}</span> {/* Ensure text size */}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}
