import { NextResponse } from 'next/server';

async function fetchLiveCoinWatchData(code: string, start: number, end: number) {
  const response = await fetch('https://api.livecoinwatch.com/coins/single/history', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.LIVECOINWATCH_API_KEY!,
    },
    body: JSON.stringify({
      currency: 'USD',
      code,
      start,
      end,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LiveCoinWatch API request failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function POST(request: Request) {
  const { messages, pairData } = await request.json();

  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const code = pairData?.baseToken?.symbol;

    if (!code) {
      throw new Error("Could not determine token symbol for LiveCoinWatch data.");
    }

    const liveCoinWatchData = await fetchLiveCoinWatchData(code, twentyFourHoursAgo, now);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'HTTP-Referer': 'https://v0.dev',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a sophisticated crypto market analyst assistant named "Genius". Your task is to provide insightful, data-driven answers and analysis related to cryptocurrency tokens. You will be given data from Dexscreener (detailed token-specific data) and LiveCoinWatch (historical data).

Your responses should be concise, informative, and professional. Avoid overly technical jargon unless necessary. Focus on providing actionable insights, analysis, and **direct recommendations** based on the available data. Assume the user understands the inherent risks of cryptocurrency investments and is seeking your expert opinion.

When analyzing a token, consider the following factors (if data is available), and provide clear buy/sell/hold recommendations based on your analysis:

*   **Price Trends:** Analyze short-term, medium-term, and long-term price trends.
*   **Trading Volume:** Assess trading volume and its implications. High volume often indicates strong interest, while low volume may suggest low interest or consolidation.
*   **Market Capitalization:** Consider the market capitalization of the token.
*   **Liquidity:** Analyze the liquidity of the token.
*   **Volatility:** Discuss the volatility of the token and its potential risks and rewards.
*   **Recent News:** If available, incorporate any relevant recent news or developments related to the token or the broader market.
*   **Comparisons:** If appropriate, compare the token to other similar tokens or to Bitcoin/Ethereum.
*   **Historical Data:** Use historical data from the LiveCoinWatch API to inform your analysis.
* **Calculations:** Perform relevant calculations, such as percentage changes, moving averages, or other technical indicators if the data supports it.

**LiveCoinWatch Historical Data:**
${JSON.stringify(liveCoinWatchData)}
`,
          },
          {
            role: 'user',
            content: `Analyze the following token using the provided Dexscreener data. Address the factors listed in the system prompt as comprehensively as possible, given the available data:

${JSON.stringify(pairData)}`,
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    return NextResponse.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message: "Unknown Error" },
      { status: 500 }
    );
  }
}
