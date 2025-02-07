import { headers } from "next/headers"

export async function fetchWithAuth(url: string, apiKey: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.status}`)
  }

  return res.json()
}

export function getApiKey(name: string): string {
  const apiKey = headers().get(name)
  if (!apiKey) {
    throw new Error(`${name} is not set`)
  }
  return apiKey
}

