import { NextResponse } from "next/server"
import { COINGECKO_PRO_API_KEY } from "@/env"

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3"

async function fetchFromAPI(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "X-CoinGecko-Pro-API-Key": COINGECKO_PRO_API_KEY,
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `CoinGecko API request failed: ${response.status} ${response.statusText}. URL: ${url}. Details: ${errorText}`,
      )
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error)
    throw error
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint is required" }, { status: 400 })
  }

  try {
    let data
    switch (endpoint) {
      case "global":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/global`)
        break
      case "trending_searches":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/search/trending`)
        break
      case "categories":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/coins/categories`)
        break
      case "derivatives_exchanges":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/derivatives/exchanges`)
        break
      case "trending":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/search/trending`)
        data = data.coins.slice(0, 7)
        break
      case "top":
        data = await fetchFromAPI(
          `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`,
        )
        break
      case "defi":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/global/decentralized_finance_defi`)
        break
      case "coin":
        const coinId = searchParams.get("coinId")
        if (!coinId) {
          return NextResponse.json({ error: "CoinId is required for coin data" }, { status: 400 })
        }
        data = await fetchFromAPI(
          `${COINGECKO_API_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
        )
        break
      case "chart":
        const coinIdChart = searchParams.get("coinId")
        const days = searchParams.get("days")
        if (!coinIdChart || !days) {
          return NextResponse.json({ error: "CoinId and days are required for chart data" }, { status: 400 })
        }
        data = await fetchFromAPI(`${COINGECKO_API_URL}/coins/${coinIdChart}/market_chart?vs_currency=usd&days=${days}`)
        break
      case "exchange_rates":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/exchange_rates`)
        break
      case "markets":
        const vs_currency = searchParams.get("vs_currency")
        const order = searchParams.get("order")
        const per_page = searchParams.get("per_page")
        const page = searchParams.get("page")
        const sparkline = searchParams.get("sparkline")
        data = await fetchFromAPI(
          `${COINGECKO_API_URL}/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${per_page}&page=${page}&sparkline=${sparkline}`,
        )
        break
      case "public_companies":
        const coinIdPublic = searchParams.get("coinId")
        if (!coinIdPublic) {
          return NextResponse.json({ error: "CoinId is required for public companies data" }, { status: 400 })
        }
        data = await fetchFromAPI(`${COINGECKO_API_URL}/companies/public_treasury/${coinIdPublic}`)
        break
      case "exchanges":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/exchanges`)
        break
      default:
        return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

