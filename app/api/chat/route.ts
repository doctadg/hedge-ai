import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { messages, pairData } = await request.json()

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
              "You are a crypto market analyst assistant. Provide helpful insights and answer questions about the given token based on the provided data. Keep your responses concise and informative.",
          },
          {
            role: "user",
            content: `Here's the data for the token: ${JSON.stringify(pairData)}. Please answer the following questions based on this data.`,
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
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}

