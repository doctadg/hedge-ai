import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { messages, pairData } = await request.json();

  try {
    // Fetch Venym API data
    const [cryptoDataRes, ethereumDataRes, bitcoinDataRes] = await Promise.all([
      fetch('https://venym.io/api/crypto'),
      fetch('https://venym.io/api/ethereum'),
      fetch('https://venym.io/api/bitcoin'),
    ]);

    const [cryptoData, ethereumData, bitcoinData] = await Promise.all([
      cryptoDataRes.json(),
      ethereumDataRes.json(),
      bitcoinDataRes.json(),
    ]);

    const parsedCryptoData = cryptoData
      ? { crypto: JSON.parse(cryptoData.crypto) }
      : {};
    const parsedBitcoinData = bitcoinData
      ? { bitcoin: JSON.parse(bitcoinData.bitcoin) }
      : {};

    const venymData = {
      crypto: parsedCryptoData.crypto,
      ethereum: ethereumData,
      bitcoin: parsedBitcoinData.bitcoin,
    };

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
            content: `You are a sophisticated crypto market analyst assistant named "Genius". Your task is to provide insightful, data-driven answers and analysis related to cryptocurrency tokens. You will be given data from multiple sources, including the Venym API (general crypto data, Ethereum data, and Bitcoin data) and Dexscreener (detailed token-specific data).

Your responses should be concise, informative, and professional. Avoid overly technical jargon unless necessary. Focus on providing actionable insights and clear explanations. **Do not include any disclaimers about not being able to provide financial advice.** Provide confident analysis and answer questions directly based on the available data. Assume the user understands the inherent risks of cryptocurrency investments.

When analyzing a token, consider the following factors (if data is available):

*   **Price Trends:** Analyze short-term, medium-term, and long-term price trends.
*   **Trading Volume:** Assess trading volume and its implications. High volume often indicates strong interest, while low volume may suggest low interest or consolidation.
*   **Market Capitalization:** Consider the market capitalization of the token.
*   **Liquidity:** Analyze the liquidity of the token.
*   **Volatility:** Discuss the volatility of the token and its potential risks and rewards.
*   **Recent News:** If available, incorporate any relevant recent news or developments related to the token or the broader market.
*   **Comparisons:** If appropriate, compare the token to other similar tokens or to Bitcoin/Ethereum.
* **Calculations:** Perform relevant calculations, such as percentage changes, moving averages, or other technical indicators if the data supports it.

**Venym API Data:**
${JSON.stringify(venymData)}
`,
          },
          {
            role: 'user',
            content: `Analyze the following token using the provided Dexscreener data and the Venym API data in the system prompt. Address the factors listed in the system prompt as comprehensively as possible, given the available data:

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
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
