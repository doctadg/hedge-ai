import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { asset, riskTolerance } = await request.json()

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
              "You are an AI assistant specializing in cryptocurrency hedging strategies. Provide concise, practical advice based on the given asset and risk tolerance.",
          },
          {
            role: "user",
            content: `Generate a hedging strategy for ${asset} with ${riskTolerance} risk tolerance.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate strategy")
    }

    const data = await response.json()
    return NextResponse.json({ strategy: data.choices[0].message.content })
  } catch (error) {
    console.error("Error generating strategy:", error)
    return NextResponse.json({ error: "Failed to generate strategy" }, { status: 500 })
  }
}

