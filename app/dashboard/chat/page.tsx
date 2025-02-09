"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { useDashboardAccess } from "@/hooks/useDashboardAccess"
import { PremiumModal } from "@/components/ui/PremiumModal"

export default function ChatPage() {
  const { isPremium } = useDashboardAccess()

  return (
    <div className="space-y-6 h-[calc(100vh-5rem)]">
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
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI portfolio assistant. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages([
      ...messages,
      { role: "user", content: input },
      { role: "assistant", content: "I'm analyzing your request..." },
    ])
    setInput("")
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Portfolio Chat</h1>

      <Card className="bg-[#0A0A0A] border-[#1a1a1a] h-[calc(100%-4rem)]">
        <CardHeader>
          <CardTitle className="text-white">AI Assistant</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-5rem)]">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-emerald-500 text-white"
                      : "bg-[#1a1a1a] text-gray-300"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your portfolio..."
              className="flex-1 rounded-md border-0 bg-[#1a1a1a] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
