async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`)
  }
  return response.json()
}

const API_BASE_URL = "/api/data" // Old base URL for existing functions

async function fetchData(endpoint: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams({ endpoint, ...params })
  try {
    const response = await fetch(`${API_BASE_URL}?${searchParams}`)
    const text = await response.text()
    try {
      const data = JSON.parse(text)
      if (!response.ok) {
        console.error(`Error response from API for ${endpoint}:`, data)
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      return data
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError)
      console.error("Raw response:", text)
      throw new Error(`Failed to parse response as JSON for ${endpoint}`)
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    throw error
  }
}

export async function fetchGlobalData() {
  return fetchData("global");
}

export async function fetchTrendingCoins() {
  const response = await fetch(`${API_BASE_URL}?endpoint=trending_searches`)
  return handleApiResponse(response)
}

export async function fetchTopCoins() {
  return fetchData("top")
}

export async function fetchCoinData() {
  return fetchData("coin");
}

export async function fetchMarketChart(coinId: string, days: string) {
  return fetchData("chart", { coinId, days })
}

export async function fetchExchangeRates() {
  return fetchData("exchange_rates")
}

export async function fetchCoinMarkets(
  vs_currency = "usd",
  order = "market_cap_desc",
  per_page = 250,
  page = 1,
  sparkline = true,
) {
  return fetchData("markets", {
    vs_currency,
    order,
    per_page: per_page.toString(),
    page: page.toString(),
    sparkline: sparkline.toString(),
  })
}

export async function fetchCoinCategories() {
  const response = await fetch(`${API_BASE_URL}?endpoint=categories`)
  return handleApiResponse(response)
}

export async function fetchTrendingSearches() {
  return fetchData("trending_searches")
}

export async function fetchExchangesList() {
  return fetchData("exchanges")
}

export async function fetchPublicCompaniesHoldings(coinId: string) {
  return fetchData("public_companies", { coinId })
}

export async function fetchDerivativesExchanges() {
  const response = await fetch(`${API_BASE_URL}?endpoint=derivatives_exchanges`)
  return handleApiResponse(response)
}

export async function fetchGlobalDefiData() {
  return fetchData("defi")
}

// --- New CoinGecko API utility functions ---
const CG_API_BASE_URL = "/api/coingecko";

async function fetchCg(endpoint: string, params?: Record<string, string | number | boolean>) {
  const urlParams = new URLSearchParams();
  if (params) {
    for (const key in params) {
      if (params[key] !== undefined) {
        urlParams.append(key, String(params[key]));
      }
    }
  }
  const queryString = urlParams.toString();
  const fullUrl = `${CG_API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(fullUrl);
  return handleApiResponse(response); // Reusing the existing handler
}

export async function fetchCoinGeckoGlobal() {
  return fetchCg("/global");
}

export async function fetchCoinGeckoGlobalDefi() {
  return fetchCg("/global_defi");
}

export interface FetchCoinGeckoMarketsParams {
  vs_currency?: string;
  ids?: string; // Comma-separated string of coin ids
  category?: string;
  order?: string;
  per_page?: number;
  page?: number;
  sparkline?: boolean;
  price_change_percentage?: string;
  locale?: string;
  precision?: string;
}
export async function fetchCoinGeckoMarkets(params?: FetchCoinGeckoMarketsParams) {
  return fetchCg("/markets", params as Record<string, string | number | boolean> | undefined);
}

export async function fetchCoinGeckoTrending() {
  return fetchCg("/trending");
}

export interface FetchCoinGeckoCategoriesParams {
  order?: string;
}
export async function fetchCoinGeckoCategories(params?: FetchCoinGeckoCategoriesParams) {
  return fetchCg("/categories", params as Record<string, string | number | boolean> | undefined);
}

export interface FetchCoinGeckoDerivativesExchangesParams {
  order?: string;
  per_page?: number;
  page?: number;
}
export async function fetchCoinGeckoDerivativesExchanges(params?: FetchCoinGeckoDerivativesExchangesParams) {
  return fetchCg("/derivatives_exchanges", params as Record<string, string | number | boolean> | undefined);
}

export interface FetchCoinGeckoCoinMarketChartParams {
  id: string; // Coin ID
  vs_currency?: string;
  days: string | number; // e.g., 1, 7, "max"
  interval?: "daily";
  precision?: string;
}
export async function fetchCoinGeckoCoinMarketChart(params: FetchCoinGeckoCoinMarketChartParams) {
  return fetchCg("/coin_market_chart", params as unknown as Record<string, string | number | boolean>);
}
