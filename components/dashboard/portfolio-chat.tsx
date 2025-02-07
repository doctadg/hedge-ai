"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function PortfolioChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hello! I'm your AI portfolio assistant. How can I help you today?" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: "user", content: input }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/portfolio-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI")
      }

      const data = await response.json()
      setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error in chat:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
      <CardHeader>
        <CardTitle className="text-white">Portfolio Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                message.role === "user" ? "bg-green-500 text-white ml-auto" : "bg-gray-700 text-gray-200"
              } max-w-[80%]`}
            >
              {message.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your portfolio..."
            className="flex-grow bg-[#1a1a1a] text-white border-gray-700"
          />
          <Button type="submit" className="bg-green-500 text-white" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

