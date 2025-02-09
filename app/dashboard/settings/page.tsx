"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDashboardAccess } from "@/hooks/useDashboardAccess"
import { PremiumModal } from "@/components/ui/PremiumModal"

const settings = [
  {
    category: "Account",
    items: [
      {
        name: "Profile Information",
        description: "Update your account details and preferences",
      },
      {
        name: "Security Settings",
        description: "Manage your password and security options",
      },
      { name: "API Keys", description: "View and manage your API keys" },
    ],
  },
  {
    category: "Preferences",
    items: [
      {
        name: "Notifications",
        description: "Configure your notification preferences",
      },
      {
        name: "Display Settings",
        description: "Customize your dashboard appearance",
      },
      { name: "Trading Defaults", description: "Set default values for trading" },
    ],
  },
  {
    category: "Integration",
    items: [
      {
        name: "Exchange Connections",
        description: "Manage your exchange API connections",
      },
      { name: "Wallet Integration", description: "Connect and manage your wallets" },
      { name: "Data Sources", description: "Configure external data providers" },
    ],
  },
]

export default function SettingsPage() {
  const { isPremium } = useDashboardAccess()

  return (
    <div className="space-y-6">
      {!isPremium ? (
        <PremiumModal>
          <Content />
        </PremiumModal>
      ) : (
        <Content />
      )}
    </div>
  )
}

function Content() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="grid gap-6">
        {settings.map((section) => (
          <Card key={section.category} className="bg-[#0A0A0A] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="text-white">{section.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a1a]"
                >
                  <div>
                    <h3 className="text-white font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-gray-800 text-gray-400 hover:text-white hover:border-white"
                  >
                    Configure
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
