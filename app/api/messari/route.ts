import { NextResponse } from "next/server"
import { fetchWithAuth, getApiKey } from "../utils"

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = getApiKey("MESSARI_API_KEY")
    const data = await fetchWithAuth("https://data.messari.io/api/v1/assets/bitcoin/metrics", apiKey)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching Messari data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
