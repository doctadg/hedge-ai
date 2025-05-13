"use client"

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView, AnimatePresence } from "framer-motion";
import {
  fetchCoinGeckoGlobal,
  fetchCoinGeckoGlobalDefi,
  fetchCoinGeckoMarkets,
} from "@/utils/api";

// Utility functions
const formatCurrency = (value: number | string | undefined, compact: boolean = true) => {
  if (value === undefined || value === null) return 'N/A';
  const numValue = Number(value);
  if (isNaN(numValue)) return 'N/A';

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
  }).format(numValue);
};

const formatPercentage = (value: number | string | undefined) => { // Allow string input
  if (value === undefined || value === null) return 'N/A';
  const numValue = Number(value); // Convert to number
  if (isNaN(numValue)) return 'N/A'; // Handle cases where conversion fails
  return `${numValue > 0 ? "+" : ""}${numValue.toFixed(2)}%`; // Use the converted number
};

// Enhanced Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  change, 
  delay = 0,
  highlight = false
}: { 
  title: string; 
  value: string; 
  change?: string; 
  delay?: number;
  highlight?: boolean;
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const isPositive = change && change.includes('+');
  const isNegative = change && change.includes('-');
  
  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-xl backdrop-blur-md p-6 ${
        highlight 
          ? 'bg-gradient-to-br from-emerald-900/80 to-green-900/80 border border-emerald-500/30'
          : 'bg-black/40 border border-gray-800/50'
      } shadow-xl`}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6, 
            delay: delay,
            ease: [0.22, 1, 0.36, 1]
          }
        }
      }}
    >
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-30"></div>
      )}
      
      <div className="flex justify-between items-start">
        <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
      </div>
      
      <div className="flex flex-col">
        <span className="text-white text-2xl font-bold tracking-tight">{value}</span>
        {change && (
          <span className={`text-sm font-medium mt-1 ${
            isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-gray-400'
          }`} >
            {change}
          </span>
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
    </motion.div>
  );
};

// Define a type for the market data
interface MarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: any; 
  last_updated: string;
  high_24h?: number; 
  low_24h?: number;  
}

// --- Bubble Component ---
interface BubbleProps {
  coin: MarketData;
  index: number;
  totalBubbles: number;
}

const Bubble = ({ coin, index, totalBubbles }: BubbleProps) => {
  const outerControls = useAnimation(); 
  const innerControls = useAnimation(); 
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const changePercent = coin.price_change_percentage_24h ?? 0;
  const isPositive = changePercent >= 0;

  const baseSize = 70; 
  const maxSizeScaleFactor = 1.7; 
  const minSizeScaleFactor = 0.7; 
  const changeMagnitude = Math.abs(changePercent);
  const scaleFactor = Math.min(1 + (changeMagnitude / 10), maxSizeScaleFactor); 
  
  let dynamicSize = baseSize * scaleFactor;
  dynamicSize = Math.max(dynamicSize, baseSize * minSizeScaleFactor); 

  const positiveColor = 'from-emerald-500/70 to-green-600/70';
  const negativeColor = 'from-rose-500/70 to-red-600/70';
  const neutralColor = 'from-gray-500/70 to-gray-700/70';
  
  const getColor = () => {
    if (changePercent > 0.1) return positiveColor;
    if (changePercent < -0.1) return negativeColor;
    return neutralColor;
  };

  const angle = (index / totalBubbles) * 2 * Math.PI + (Math.random() - 0.5) * 0.1; 
  const radius = 160; 
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  
  const floatDelay = Math.random() * 2; 

  useEffect(() => {
    if (isInView) {
      outerControls.start("visible");
      innerControls.start({
        y: [0, -6, 0],
        scale: 1, 
        transition: {
          y: {
            duration: 3.5 + Math.random() * 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: floatDelay + 0.5 
          },
          scale: { duration: 0.2 } 
        }
      });
    }
  }, [isInView, y, innerControls, outerControls, floatDelay]);

  const handleHoverStart = () => {
    innerControls.start({ scale: 1.15, transition: { type: 'spring', stiffness: 300, damping: 20 } });
  };

  const handleHoverEnd = () => {
    innerControls.start({ scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } });
  };

  return (
    <motion.div
      ref={ref}
      className="absolute group cursor-pointer" // z-index on group hover will be handled by whileHover
      initial="hidden"
      animate={outerControls} 
      variants={{
        hidden: { opacity: 0, scale: 0.5, y: y + 20 }, 
        visible: { 
          opacity: 1,
          scale: 1, 
          y: y, 
          transition: {
            opacity: { duration: 0.5, delay: index * 0.08 },
            scale: { type: 'spring', stiffness: 100, damping: 15, delay: index * 0.08 },
            y: { type: 'spring', stiffness: 100, damping: 15, delay: index * 0.08 }
          }
        }
      }}
      style={{ x: x }} 
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      whileHover={{ zIndex: 50 }} // This zIndex applies to the motion.div itself
    >
      <motion.div
        animate={innerControls} 
        className={`relative rounded-full shadow-2xl border border-white/10 flex items-center justify-center backdrop-blur-md`}
        style={{ 
          width: `${dynamicSize}px`, 
          height: `${dynamicSize}px`,
          background: `
            radial-gradient(circle at 25% 20%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 25%, transparent 55%), 
            radial-gradient(circle at 70% 85%, rgba(0,0,0,0.25) 0%, transparent 60%), 
            linear-gradient(to bottom right, ${getColor().split(' ')[0]} 0%, ${getColor().split(' ')[1]} 100%)
          ` 
        }}
      >
        <div className="text-center text-white p-1 relative z-10 flex flex-col items-center justify-center">
           <img 
             src={coin.image} 
             alt={coin.name} 
             className="w-1/3 h-1/3 max-w-[32px] max-h-[32px] mb-1 opacity-95 filter drop-shadow-md"
           />
           <div className="font-bold text-[11px] leading-tight uppercase tracking-wider" style={{textShadow: '0px 1px 2px rgba(0,0,0,0.5)'}}>
             {coin.symbol}
           </div>
           <div className={`font-semibold text-[12px] leading-tight ${isPositive ? 'text-emerald-200' : 'text-rose-200'}`} style={{textShadow: '0px 1px 2px rgba(0,0,0,0.5)'}}>
             {formatPercentage(changePercent)}
           </div>
         </div>
        <div 
          className="absolute inset-0 rounded-full opacity-25 mix-blend-lighten"
          style={{
            background: `radial-gradient(circle at 60% 40%, rgba(255,255,255,0.5), transparent 70%)`
          }}
        ></div>
      </motion.div>
      {/* Tooltip with high z-index */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900/80 backdrop-blur-sm text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-[60] pointer-events-none"> {/* Increased z-index for tooltip */}
        <div className="font-bold mb-0.5">{coin.name}</div>
        <div>Price: {formatCurrency(coin.current_price, false)}</div>
        <div>Mkt Cap: {formatCurrency(coin.market_cap)}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900/80"></div>
      </div>
    </motion.div>
  );
};

// Enhanced Market Pulse Component
const MarketPulse = ({ marketData }: { marketData: MarketData[] }) => {
  if (!marketData || marketData.length === 0) {
    return (
      <div className="relative h-96 flex justify-center items-center text-gray-500">
        No market data available for pulse visualization.
      </div>
    );
  }

  return (
    // Added z-index to this container to help with tooltip visibility
    <div className="relative min-h-[450px] flex justify-center items-center p-4 my-12 z-20"> 
      <div className="absolute inset-0 bg-gradient-radial from-emerald-900/10 via-transparent to-transparent rounded-full blur-[80px] opacity-40"></div>
      <div className="relative w-full h-full flex justify-center items-center scale-90 md:scale-100">
        {marketData.map((coin, index) => (
          <Bubble 
            key={coin.id} 
            coin={coin} 
            index={index} 
            totalBubbles={marketData.length} 
          />
        ))}
      </div>
    </div>
  );
};


// Enhanced Data Stream Component
const DataStream = ({ streamData }: { streamData: Array<{ label: string; value: string | undefined }> }) => {
  const validData = streamData.filter(item => item.value !== undefined && item.value !== 'N/A');
  
  if (validData.length === 0) return null;
  
  const estimatedCharWidth = 8;
  const separatorWidth = 40;
  const totalContentWidth = validData.reduce((acc, item) => {
    const labelWidth = item.label.length * estimatedCharWidth;
    const valueWidth = (item.value || '').length * estimatedCharWidth;
    return acc + labelWidth + valueWidth + separatorWidth;
  }, 0);
  
  const scrollDuration = Math.max(25, totalContentWidth / 35);

  return (
    <div className="w-full overflow-hidden relative h-14 bg-gradient-to-r from-black/60 via-emerald-950/30 to-black/60 backdrop-blur-md border-t border-b border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
      <motion.div
        className="absolute top-0 left-0 whitespace-nowrap flex items-center h-full"
        animate={{ x: ['0%', `-${100 * validData.length / (validData.length || 1)}%`] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: scrollDuration,
            ease: "linear",
          },
        }}
      >
        {[...validData, ...validData].map((item, index) => (
          <div key={index} className="mx-5 flex items-center h-full group">
            <span className="text-emerald-300/80 mr-2 text-sm font-medium">{item.label}:</span>
            <span className="text-white font-semibold text-sm tracking-wide group-hover:text-emerald-300 transition-colors">{item.value}</span>
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
    </div>
  );
};

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600 rounded-full filter blur-[100px] opacity-10"></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-green-600 rounded-full filter blur-[100px] opacity-10"></div>
    </div>
  );
};

// Main Data Section Component
export function DataSection() {
  const [globalData, setGlobalData] = useState<any>(null);
  const [globalDefiData, setGlobalDefiData] = useState<any>(null);
  const [topMarketData, setTopMarketData] = useState<MarketData[]>([]); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'market' | 'defi'>('market');
  
  const sectionRef = useRef(null);
  const dataSectionControls = useAnimation(); 
  const sectionIsInView = useInView(sectionRef, { once: false, amount: 0.2 }); 
  
  useEffect(() => {
    if (sectionIsInView) { 
      dataSectionControls.start("visible"); 
    }
  }, [dataSectionControls, sectionIsInView]); 

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [gData, gDefiData, topMarkets] = await Promise.all([
          fetchCoinGeckoGlobal(),
          fetchCoinGeckoGlobalDefi(),
          fetchCoinGeckoMarkets({ 
            vs_currency: "usd", 
            order: "market_cap_desc", 
            per_page: 8, 
            page: 1,
            sparkline: false, 
            price_change_percentage: '24h' 
          }), 
        ]);

        if (!gData || !gDefiData) {
          throw new Error("Missing global or DeFi data");
        }
        if (!topMarkets || topMarkets.length === 0) {
          throw new Error("Failed to fetch top market data");
        }

        setGlobalData(gData);
        setGlobalDefiData(gDefiData);
        setTopMarketData(topMarkets as MarketData[]); 

      } catch (err: any) {
        console.error("Error fetching CoinGecko data for DataSection:", err);
        setError(`Failed to load market data: ${err.message || "Unknown error"}`);
        setGlobalData(null);
        setGlobalDefiData(null);
        setTopMarketData([]); 
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <section className="bg-black py-24 px-4 min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto relative z-10 text-center">
          <div className="text-white text-xl font-light">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-3"></div>
            Loading Market Intelligence...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-black py-24 px-4 min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">Error Loading Data</h2>
          <p className="text-gray-400">{error}</p>
          <button 
            className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const cgGlobal = globalData?.data;
  const cgDefi = globalDefiData?.data;
  
  const ethData = topMarketData.find(coin => coin.id === 'ethereum');
  const btcData = topMarketData.find(coin => coin.id === 'bitcoin');

  const ethBtcRatio = (ethData?.current_price && btcData?.current_price)
    ? (ethData.current_price / btcData.current_price).toFixed(6)
    : 'N/A';

  const streamData = [
    { label: "ETH Price", value: formatCurrency(ethData?.current_price, false) },
    { label: "ETH Mkt Cap", value: formatCurrency(ethData?.market_cap) },
    { label: "ETH Dom", value: formatPercentage(cgGlobal?.market_cap_percentage?.eth) },
    { label: "ETH/BTC", value: ethBtcRatio },
    { label: "ETH Supply", value: ethData?.circulating_supply?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 'N/A' },
    { label: "ETH High (24h)", value: formatCurrency(ethData?.high_24h, false) },
    { label: "ETH Low (24h)", value: formatCurrency(ethData?.low_24h, false) },
    { label: "DeFi Mkt Cap", value: formatCurrency(cgDefi?.defi_market_cap) },
    { label: "DeFi Vol (24h)", value: formatCurrency(cgDefi?.trading_volume_24h) },
    { label: "Top DeFi Coin", value: cgDefi?.top_coin_name || 'N/A' },
    { label: "Active Cryptos", value: cgGlobal?.active_cryptocurrencies?.toLocaleString() || 'N/A' },
    { label: "Total Markets", value: cgGlobal?.markets?.toLocaleString() || 'N/A' },
    { label: "Total Mkt Cap", value: formatCurrency(cgGlobal?.total_market_cap?.usd) },
  ].filter(item => item.value !== undefined && item.value !== 'N/A');

  const marketMetrics = [
    {
      title: "ETH Price",
      value: formatCurrency(ethData?.current_price, false),
      change: formatPercentage(ethData?.price_change_percentage_24h),
      highlight: true
    },
    {
      title: "BTC Price",
      value: formatCurrency(btcData?.current_price, false),
      change: formatPercentage(btcData?.price_change_percentage_24h)
    },
    {
      title: "ETH Market Cap",
      value: formatCurrency(ethData?.market_cap),
      change: formatPercentage(ethData?.market_cap_change_percentage_24h)
    },
    {
      title: "ETH/BTC Ratio",
      value: ethBtcRatio,
      change: (ethData?.price_change_percentage_24h !== undefined && btcData?.price_change_percentage_24h !== undefined)
        ? formatPercentage(ethData.price_change_percentage_24h - btcData.price_change_percentage_24h)
        : undefined
    }
  ];

  const defiMetrics = [
    {
      title: "DeFi Market Cap",
      value: formatCurrency(cgDefi?.defi_market_cap),
      highlight: true
    },
    {
      title: "DeFi Volume (24h)",
      value: formatCurrency(cgDefi?.trading_volume_24h)
    },
    {
      title: "DeFi Dominance",
      value: formatPercentage(cgDefi?.defi_dominance)
    },
    {
      title: "Top DeFi Coin",
      value: cgDefi?.top_coin_name || 'N/A'
    }
  ];

  return (
    <section ref={sectionRef} className="bg-black py-24 px-4 min-h-screen flex flex-col justify-center relative overflow-hidden"> {/* Ensure this section itself doesn't clip if it's the root cause */}
      <AnimatedBackground />
      <div className="container mx-auto relative z-10"> {/* This container might need a z-index if tabs are outside it but visually overlapping */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.7 }}
         >
           <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tighter">
             Enterprise-Grade Analytics
           </h2>
           <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed mb-10">
             Access institutional-quality market intelligence and DeFi analytics powered by our proprietary algorithms. Make informed decisions with real-time data visualization.
           </p>
         </motion.div>

        {/* Tab Navigation - This is likely above MarketPulse in DOM order or has its own z-index */}
        <div className="flex justify-center mb-12 relative z-30"> {/* Added z-30 to tabs to ensure they are above MarketPulse's z-20 if they are siblings */}
          <div className="inline-flex rounded-md p-1 bg-black/30 backdrop-blur-sm border border-gray-800/50">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'market'
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('market')}
            >
              Market Overview
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'defi'
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('defi')}
            >
              DeFi Insights
            </button>
          </div>
        </div>

        <div className="mb-12"> {/* This div contains MarketPulse */}
          <AnimatePresence mode="wait">
            {activeTab === 'market' ? (
              <motion.div
                key="market"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                {topMarketData.length > 0 && (
                  <MarketPulse 
                    marketData={topMarketData} 
                  />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                  {marketMetrics.map((metric, index) => (
                    <MetricCard
                      key={index}
                      title={metric.title}
                      value={metric.value}
                      change={metric.change}
                      delay={index * 0.1}
                      highlight={metric.highlight}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="defi"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                  {defiMetrics.map((metric, index) => (
                    <MetricCard
                      key={index}
                      title={metric.title}
                      value={metric.value}
                      delay={index * 0.1}
                      highlight={metric.highlight}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <DataStream streamData={streamData} />
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <a 
            href="#" 
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all"
          >
            Explore Advanced Analytics
          </a>
        </motion.div>
      </div>
    </section>
  );
}
