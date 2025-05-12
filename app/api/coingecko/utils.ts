// COINGECKO_PRO_API_KEY might not be used if it's a demo key causing issues.
// import { COINGECKO_PRO_API_KEY } from "@/env"; 

const API_BASE_URL = "https://api.coingecko.com/api/v3"; // Switched to free tier URL

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes, crucial for free tier

export async function fetchCoinGeckoData<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  // Pro API key check removed as we are targeting the public API endpoint.
  // if (!COINGECKO_PRO_API_KEY) {
  //   throw new Error("COINGECKO_PRO_API_KEY is not defined");
  // }

  const urlParams = new URLSearchParams();
  if (params) {
    for (const key in params) {
      if (params[key] !== undefined) {
        urlParams.append(key, String(params[key]));
      }
    }
  }

  const queryString = urlParams.toString();
  // Using the public API base URL
  const fullUrl = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
  const cacheKey = fullUrl;

  // Check cache
  const cachedEntry = cache.get(cacheKey);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS) {
    // console.log(`[CoinGecko Cache HIT] ${cacheKey}`);
    return cachedEntry.data as T;
  }
  // console.log(`[CoinGecko Cache MISS] ${cacheKey}`);

  // Headers for public API (no API key needed for most free endpoints)
  const headers = {
    "Content-Type": "application/json",
  };
  // If COINGECKO_PRO_API_KEY was intended for a paid plan that allows query param key:
  // if (COINGECKO_PRO_API_KEY) {
  //   // Some paid plans might use x_cg_demo_api_key or similar as query param
  //   // For now, assuming standard free tier which doesn't require a key.
  // }


  const response = await fetch(fullUrl, { headers });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`CoinGecko API Error (${response.status}) for ${fullUrl}:`, errorData);
    throw new Error(
      `Failed to fetch data from CoinGecko: ${response.status} ${response.statusText}. Details: ${errorData}`
    );
  }

  const data = await response.json();

  // Store in cache
  cache.set(cacheKey, { data, timestamp: Date.now() });

  return data as T;
}
