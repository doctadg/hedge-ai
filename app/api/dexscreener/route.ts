import { NextResponse } from "next/server"

const DEX_SCREENER_API = "https://api.dexscreener.com/latest/dex"

async function fetchDexScreenerData(searchQuery: string) {
  try {
    const response = await fetch(`${DEX_SCREENER_API}/search?q=${searchQuery}`)
    if (!response.ok) {
      throw new Error(`DexScreener API request failed: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching from DexScreener:", error)
    throw error
  }
}

async function analyzePairWithAI(pairData: any) {
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
              "You are a crypto market analyst. Analyze the provided trading pair data and provide a brief, focused analysis of key metrics including liquidity, price action, and market sentiment. Keep responses under 50 words and focus on actionable insights.",
          },
          {
            role: "user",
            content: `Analyze these key trading metrics: Price: ${pairData.priceUsd}, Liquidity: ${pairData.liquidity?.usd}, Volume: ${pairData.volume?.h24}, Price Change: ${pairData.priceChange?.h24}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`OpenRouter API request failed: ${response.status}. Body: ${errorBody}`)
    }

    const aiResponse = await response.json()
    return aiResponse.choices[0].message.content
  } catch (error) {
    console.error("Error getting AI analysis:", error)
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred during AI analysis")
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const dexData = await fetchDexScreenerData(query)

    if (!dexData.pairs || dexData.pairs.length === 0) {
      return NextResponse.json({ error: "No pairs found" }, { status: 404 })
    }

    // Get AI analysis for the first pair
    const aiAnalysis = await analyzePairWithAI(dexData.pairs[0])

    return NextResponse.json({
      pair: dexData.pairs[0],
      analysis: aiAnalysis,
    })
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

