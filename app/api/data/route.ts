import { NextResponse } from "next/server"
import { COINGECKO_PRO_API_KEY } from "@/env"

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3"

async function fetchFromAPI(url: string, retries = 3, delay = 1000) {
  try {
    const response = await fetch(url, {
      headers: {
        "X-CoinGecko-Pro-API-Key": COINGECKO_PRO_API_KEY,
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      const errorText = await response.text()

      // Retry on rate limit (429) errors
      if (response.status === 429 && retries > 0) {
        console.warn(`Rate limited. Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return fetchFromAPI(url, retries - 1, delay * 2) // Exponential backoff
      }

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
        // Try Venym API for global data
        const cryptoDataRes = await fetch("https://venym.io/api/crypto")
        if (!cryptoDataRes.ok) {
          throw new Error(
            `Venym API request failed: ${cryptoDataRes.status} ${cryptoDataRes.statusText}`,
          );
        }
        const cryptoDataString = await cryptoDataRes.text(); // Get raw text first
        let cryptoData;
        try {
           cryptoData = JSON.parse(cryptoDataString).crypto; // Parse the JSON string *once*
        } catch (parseError) {
          console.error("Error parsing Venym /api/crypto response:", parseError);
          console.error("Raw response:", cryptoDataString);
          return NextResponse.json(
            {
              error: "Failed to parse Venym /api/crypto response",
              rawResponse: cryptoDataString,
            },
            { status: 500 },
          );
        }

        interface GlobalData {
          Coins: string;
          Exchanges: string;
          "Market Cap": string;
          "Market Cap Change": string;
          "24h Volume": string;
          "BTC Dominance": string;
          "ETH Dominance": string;
          "Gas Fees": string;
        }
        data = cryptoData as GlobalData;
        break;
      case "trending_searches":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/search/trending`);
        break;
      case "categories":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/coins/categories`);
        break;
      case "derivatives_exchanges":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/derivatives/exchanges`);
        break;
      case "trending":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/search/trending`);
        data = data.coins.slice(0, 7);
        break;
      case "top":
        break;
      case "defi":
        data = await fetchFromAPI(
          `${COINGECKO_API_URL}/global/decentralized_finance_defi`,
        );
        break;

      interface MarketData {
        high_24h: { usd: number };
        low_24h: { usd: number };
        total_volume: { btc: number; usd: number };
        ath: { usd: number };
        market_cap: { usd: number };
        circulating_supply: number;
        price_change_percentage_24h: number;
      }

      case "coin":
        const bitcoinDataRes = await fetch("https://venym.io/api/bitcoin");
        if (!bitcoinDataRes.ok) {
          throw new Error(
            `Venym API request failed: ${bitcoinDataRes.status} ${bitcoinDataRes.statusText}`,
          );
        }
        const bitcoinDataString = await bitcoinDataRes.text();
        const bitcoinData = JSON.parse(JSON.parse(bitcoinDataString).bitcoin);
        // Extract values and create a structure similar to CoinGecko
        console.log(bitcoinData);
        data = {
          market_data: {
            high_24h: { usd: parseFloat(bitcoinData["24h High"]?.replace(/[^0-9.-]+/g,"")) || 0 },
            low_24h: { usd: parseFloat(bitcoinData["24h Low"]?.replace(/[^0-9.-]+/g,"")) || 0 },
            total_volume: {
              btc: parseFloat(bitcoinData["24h Trading Volume"]?.replace(/[^0-9.-]+/g,"") / parseFloat(bitcoinData["Bitcoin Price"]?.replace(/[^0-9.-]+/g,""))) || 0 as number,
              usd: parseFloat(bitcoinData["24h Trading Volume"]?.replace(/[^0-9.-]+/g,"")) || 0 as number,
            },
            ath: { usd: 0 }, // No ATH data from Venym
            market_cap: { usd: parseFloat(bitcoinData["Market Cap"]?.replace(/[^0-9.-]+/g,"")) || 0 },
            circulating_supply: parseFloat(bitcoinData["Circulating Supply"]?.replace(/[^0-9.-]+/g,"")) || 0,
            price_change_percentage_24h: parseFloat(bitcoinData["24h Change"]?.replace(/[^0-9.-]+/g,"")) || 0,
          },
        } as { market_data: MarketData };
    break;
      case "chart":
        const coinIdChart = searchParams.get("coinId")
        const days = searchParams.get("days")
        if (!coinIdChart || !days) {
          return NextResponse.json(
            { error: "CoinId and days are required for chart data" },
            { status: 400 },
          )
        }
        data = await fetchFromAPI(
          `${COINGECKO_API_URL}/coins/${coinIdChart}/market_chart?vs_currency=usd&days=${days}`,
        )
        break
      case "exchange_rates":
        data = await fetchFromAPI(`${COINGECKO_API_URL}/exchange_rates`)
        break
      // case "markets":  // Removing markets endpoint
      //   const vs_currency = searchParams.get("vs_currency")
      //   const order = searchParams.get("order")
      //   const per_page = searchParams.get("per_page")
      //   const page = searchParams.get("page")
      //   const sparkline = searchParams.get("sparkline")
      //   data = await fetchFromAPI(
      //     `${COINGECKO_API_URL}/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${per_page}&page=${page}&sparkline=${sparkline}`,
      //   )
      //   break
      case "public_companies":
        const coinIdPublic = searchParams.get("coinId")
        if (!coinIdPublic) {
          return NextResponse.json(
            { error: "CoinId is required for public companies data" },
            { status: 400 },
          )
        }
        data = await fetchFromAPI(
          `${COINGECKO_API_URL}/companies/public_treasury/${coinIdPublic}`,
        )
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
    const errorDetails = error instanceof Error ? error.message : "Unknown error"
    const errorStack =
      error instanceof Error && process.env.NODE_ENV === "development"
        ? error.stack
        : undefined

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: errorDetails,
        stack: errorStack,
      },
      { status: 500 },
    )
  }
}
