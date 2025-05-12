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
          ? 'bg-gradient-to-br from-emerald-900/80 to-green-900/80 border border-emerald-500/30' // Changed indigo/purple to emerald/green
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
      {/* Glow effect for highlighted cards */}
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-30"></div> // Changed indigo/purple to emerald/green
      )}
      
      <div className="flex justify-between items-start">
        <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
      </div>
      
      <div className="flex flex-col">
        <span className="text-white text-2xl font-bold tracking-tight">{value}</span>
        {change && (
          <span className={`text-sm font-medium mt-1 ${
            isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-gray-400'
          }`}>
            {change}
          </span>
        )}
      </div>
      
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
    </motion.div>
  );
};

// Enhanced Market Pulse Component
const MarketPulse = ({ 
  ethChangePercent, 
  btcChangePercent 
}: { 
  ethChangePercent: number | undefined;
  btcChangePercent: number | undefined;
}) => {
  const ethControls = useAnimation();
  const btcControls = useAnimation();
  
  useEffect(() => {
    // Animate based on market movement
    const ethAnimation = {
      scale: [1, ethChangePercent && ethChangePercent > 0 ? 1.05 : 0.95, 1],
      opacity: [0.8, 1, 0.8],
    };
    
    const btcAnimation = {
      scale: [1, btcChangePercent && btcChangePercent > 0 ? 1.05 : 0.95, 1],
      opacity: [0.8, 1, 0.8],
    };
    
    ethControls.start({
      ...ethAnimation,
      transition: { 
        repeat: Infinity, 
        duration: 4,
        ease: "easeInOut"
      }
    });
    
    btcControls.start({
      ...btcAnimation,
      transition: { 
        repeat: Infinity, 
        duration: 4,
        ease: "easeInOut",
        delay: 1 // Offset animation
      }
    });
  }, [ethChangePercent, btcChangePercent, ethControls, btcControls]);

  const getEthColor = () => {
    if (ethChangePercent === undefined) return 'from-gray-600 to-gray-800';
    return ethChangePercent >= 0 
      ? 'from-emerald-500 to-emerald-700' 
      : 'from-rose-500 to-rose-700';
  };
  
  const getBtcColor = () => {
    if (btcChangePercent === undefined) return 'from-gray-600 to-gray-800';
    return btcChangePercent >= 0 
      ? 'from-amber-500 to-amber-700' 
      : 'from-rose-500 to-rose-700';
  };

  return (
    <div className="relative h-64 flex justify-center items-center">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-emerald-900/20 to-transparent rounded-full blur-3xl"></div> // Changed indigo to emerald
      
      {/* Ethereum Pulse */}
      <motion.div
        className={`absolute w-40 h-40 rounded-full bg-gradient-to-br ${getEthColor()} shadow-lg shadow-emerald-900/30 border border-white/10 flex items-center justify-center z-20`} // Changed shadow-indigo to shadow-emerald
        animate={ethControls}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, type: 'spring', stiffness: 100 }}
      >
        <div className="text-center">
          <div className="text-white font-bold text-lg">ETH</div>
          {ethChangePercent !== undefined && (
            <div className="font-bold text-xl text-white">
              {formatPercentage(ethChangePercent)}
            </div>
          )}
        </div>
        
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/20 to-transparent opacity-70"></div>
      </motion.div>
      
      {/* Bitcoin Pulse (smaller, positioned to the side) */}
      <motion.div
        className={`absolute w-28 h-28 rounded-full bg-gradient-to-br ${getBtcColor()} shadow-lg shadow-amber-900/30 border border-white/10 flex items-center justify-center z-10 -ml-32 -mt-16`} // Kept amber for BTC
        animate={btcControls}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3, type: 'spring', stiffness: 100 }}
      >
        <div className="text-center">
          <div className="text-white font-bold text-sm">BTC</div>
          {btcChangePercent !== undefined && (
            <div className="font-bold text-base text-white">
              {formatPercentage(btcChangePercent)}
            </div>
          )}
        </div>
        
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/20 to-transparent opacity-70"></div>
      </motion.div>
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" /> {/* Changed indigo to emerald */}
            <stop offset="100%" stopColor="rgba(5, 150, 105, 0.3)" /> {/* Changed purple to green */}
          </linearGradient>
        </defs>
        <path 
          d="M200,200 L120,140" 
          stroke="url(#lineGradient)" 
          strokeWidth="1.5" 
          fill="none"
          strokeDasharray="5,5"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};

// Enhanced Data Stream Component
const DataStream = ({ streamData }: { streamData: Array<{ label: string; value: string | undefined }> }) => {
  const validData = streamData.filter(item => item.value !== undefined && item.value !== 'N/A');
  
  if (validData.length === 0) return null;
  
  // Calculate animation duration based on content length
  const estimatedCharWidth = 8;
  const separatorWidth = 40;
  const totalContentWidth = validData.reduce((acc, item) => {
    const labelWidth = item.label.length * estimatedCharWidth;
    const valueWidth = (item.value || '').length * estimatedCharWidth;
    return acc + labelWidth + valueWidth + separatorWidth;
  }, 0);
  
  const scrollDuration = Math.max(25, totalContentWidth / 35);

  return (
    <div className="w-full overflow-hidden relative h-14 bg-gradient-to-r from-black/60 via-emerald-950/30 to-black/60 backdrop-blur-md border-t border-b border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"> {/* Changed indigo to emerald */}
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
        {/* Render items twice for seamless loop */}
        {[...validData, ...validData].map((item, index) => (
          <div key={index} className="mx-5 flex items-center h-full group">
            <span className="text-emerald-300/80 mr-2 text-sm font-medium">{item.label}:</span> {/* Changed indigo to emerald */}
            <span className="text-white font-semibold text-sm tracking-wide group-hover:text-emerald-300 transition-colors">{item.value}</span> {/* Changed indigo to emerald */}
          </div>
        ))}
      </motion.div>
      
      {/* Gradient overlays for fade effect */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
    </div>
  );
};

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]"></div>
      
      {/* Gradient orbs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600 rounded-full filter blur-[100px] opacity-10"></div> {/* Changed indigo to emerald */}
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-green-600 rounded-full filter blur-[100px] opacity-10"></div> {/* Changed purple to green */}
    </div>
  );
};

// Main Data Section Component
export function DataSection() {
  const [globalData, setGlobalData] = useState<any>(null);
  const [globalDefiData, setGlobalDefiData] = useState<any>(null);
  const [ethMarketData, setEthMarketData] = useState<any>(null);
  const [btcMarketData, setBtcMarketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'market' | 'defi'>('market');
  
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all data concurrently
        const [gData, gDefiData, ethMData, btcMData] = await Promise.all([
          fetchCoinGeckoGlobal(),
          fetchCoinGeckoGlobalDefi(),
          fetchCoinGeckoMarkets({ ids: "ethereum", vs_currency: "usd" }),
          fetchCoinGeckoMarkets({ ids: "bitcoin", vs_currency: "usd" }),
        ]);

        // Basic validation
        if (!gData || !gDefiData) {
          throw new Error("Missing global or DeFi data");
        }

        setGlobalData(gData);
        setGlobalDefiData(gDefiData);

        if (ethMData && ethMData.length > 0) {
          setEthMarketData(ethMData[0]);
        } else {
          console.warn("Ethereum market data not found.");
          setEthMarketData(null);
        }

        if (btcMData && btcMData.length > 0) {
          setBtcMarketData(btcMData[0]);
        } else {
          console.warn("Bitcoin market data not found.");
          setBtcMarketData(null);
        }

      } catch (err: any) {
        console.error("Error fetching CoinGecko data for DataSection:", err);
        setError(`Failed to load market data: ${err.message || "Unknown error"}`);
        // Clear potentially partial data
        setGlobalData(null);
        setGlobalDefiData(null);
        setEthMarketData(null);
        setBtcMarketData(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Loading State
  if (loading) {
    return (
      <section className="bg-black py-24 px-4 min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto relative z-10 text-center">
          <div className="text-white text-xl font-light">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-3"></div> {/* Changed indigo to emerald */}
            Loading Market Intelligence...
          </div>
        </div>
      </section>
    );
  }

  // Error State
  if (error) {
    return (
      <section className="bg-black py-24 px-4 min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">Error Loading Data</h2>
          <p className="text-gray-400">{error}</p>
          <button 
            className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors" // Changed indigo to emerald
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Data Extraction (after loading and error checks)
  const cgGlobal = globalData?.data;
  const cgDefi = globalDefiData?.data;
  const ethData = ethMarketData;
  const btcData = btcMarketData;

  // Calculate ETH/BTC Ratio safely
  const ethBtcRatio = (ethData?.current_price && btcData?.current_price)
    ? (ethData.current_price / btcData.current_price).toFixed(6)
    : 'N/A';

  // Prepare Pulse Data
  const ethChangePercent = ethData?.price_change_percentage_24h;
  const btcChangePercent = btcData?.price_change_percentage_24h;

  // Prepare Stream Data (Safely access properties)
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

  // Prepare Market Metrics
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
      change: ethData?.price_change_percentage_24h && btcData?.price_change_percentage_24h
        ? formatPercentage(ethData.price_change_percentage_24h - btcData.price_change_percentage_24h)
        : undefined
    }
  ];

  // Prepare DeFi Metrics with proper typing
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
    <section ref={sectionRef} className="bg-black py-24 px-4 min-h-screen flex flex-col justify-center relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      <div className="container mx-auto relative z-10">
        {/* Title and Description */}
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

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-md p-1 bg-black/30 backdrop-blur-sm border border-gray-800/50">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'market'
                  ? 'bg-emerald-600 text-white shadow-lg' // Changed indigo to emerald
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('market')}
            >
              Market Overview
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'defi'
                  ? 'bg-emerald-600 text-white shadow-lg' // Changed indigo to emerald
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('defi')}
            >
              DeFi Insights
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mb-12">
          <AnimatePresence mode="wait">
            {activeTab === 'market' ? (
              <motion.div
                key="market"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Market Pulse Visualization */}
                {ethData && btcData && (
                  <MarketPulse 
                    ethChangePercent={ethChangePercent} 
                    btcChangePercent={btcChangePercent} 
                  />
                )}
                
                {/* Market Metrics Grid */}
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
                {/* DeFi Metrics Grid */}
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

        {/* Data Stream */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <DataStream streamData={streamData} />
        </motion.div>
        
        {/* Call to Action */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <a 
            href="#" 
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all" // Changed indigo/purple to emerald/green
          >
            Explore Advanced Analytics
          </a>
        </motion.div>
      </div>
    </section>
  );
}
