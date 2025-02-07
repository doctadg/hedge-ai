import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { messages } = await request.json()

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "HTTP-Referer": "https://v0.dev",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant specializing in cryptocurrency portfolio management. Provide helpful insights and answer questions about portfolio strategies, risk management, and market trends.",
          },
          ...messages,
        ],
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get response from AI")
    }

    const data = await response.json()
    return NextResponse.json({ response: data.choices[0].message.content })
  } catch (error) {
    console.error("Error in portfolio chat:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}

