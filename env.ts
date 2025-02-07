export const COINGECKO_PRO_API_KEY = process.env.COINGECKO_PRO_API_KEY as string
export const MESSARI_API_KEY = process.env.MESSARI_API_KEY as string
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY as string

if (!COINGECKO_PRO_API_KEY) {
  console.warn("COINGECKO_PRO_API_KEY is not defined")
}

if (!MESSARI_API_KEY) {
  console.warn("MESSARI_API_KEY is not defined")
}

if (!OPENROUTER_API_KEY) {
  console.warn("OPENROUTER_API_KEY is not defined")
}

