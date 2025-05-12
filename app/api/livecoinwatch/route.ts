import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing symbol parameter' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const apiKey = process.env.LIVECOINWATCH_API_KEY;

    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing API key' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        currency: 'USD',
        code: symbol.toUpperCase(),
        meta: true,
      }),
    };

    const res = await fetch('https://api.livecoinwatch.com/coins/single', options);

    if (!res.ok) {
      const errorData = await res.json().catch(() => null); // Try to parse JSON, but don't fail if it's not valid JSON
      let errorMessage = `LiveCoinWatch API Error: ${res.statusText}`;

      if (res.status === 429) {
        errorMessage = 'LiveCoinWatch API Error: Rate limit exceeded';
      } else if (errorData && errorData.message) {
        errorMessage += `: ${errorData.message}`;
      }
      console.error(errorMessage);

      return new NextResponse(
        JSON.stringify({ error: errorMessage }),
        {
          status: res.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await res.json();

    const simplifiedData = {
      name: data.name,
      symbol: data.symbol,
      rank: data.rank,
      age: data.age,
      color: data.color,
      rate: data.rate,
      volume: data.volume,
      cap: data.cap,
      liquidity: data.liquidity,
      delta: data.delta,
      images: {
        png32: data.png32,
        png64: data.png64,
        webp32: data.webp32,
        webp64: data.webp64,
      },
    };

    return new NextResponse(JSON.stringify(simplifiedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching data from LiveCoinWatch:', error);
     let errorMessage = 'Internal Server Error';
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Failed to fetch data from LiveCoinWatch. Check your internet connection or CORS settings.';
    }
    return new NextResponse(
      JSON.stringify({ error: errorMessage, details: error }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
