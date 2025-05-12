"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  MessageCircle, 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  Droplets, 
  ArrowRight, 
  ChevronRight, 
  BarChart3, 
  Lock, 
  Sparkles, 
  AlertCircle,
  ArrowUpRight,
  Zap
} from "lucide-react"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts"

// Utility functions
const formatCurrency = (value: number | string) => {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatLargeNumber = (value: number) => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`
  }
  return value.toFixed(2)
}

interface PairData {
  chainId: string
  dexId: string
  baseToken: {
    name: string
    symbol: string
  }
  quoteToken: {
    symbol: string
  }
  priceUsd: string
  liquidity: {
    usd: number
  }
  volume: {
    h24: number
  }
  priceChange: {
    h24: number
  }
}

// Animated section title component
const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
          }
        }
      }}
      className="mb-12 text-center"
    >
      <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1 mb-4">
         <Sparkles className="mr-2 h-4 w-4 text-emerald-400" />
         <span className="text-sm font-medium text-emerald-400">Meet Genius™</span>
       </div>
       <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tighter">
         {title}
       </h2>
       <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
         {subtitle}
       </p>
     </motion.div>
  )
}

// Animated metric card component
const MetricCard = ({ 
  icon, 
  title, 
  value, 
  change, 
  delay = 0 
}: { 
  icon: React.ReactNode
  title: string
  value: string
  change?: string
  delay?: number
}) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])
  
  const isPositive = change && change.includes('+')
  const isNegative = change && change.includes('-')
  
  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-xl backdrop-blur-md p-6 bg-gradient-to-br from-gray-900/80 to-black/80 border border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.1)]"
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
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-3xl -mr-16 -mt-16 opacity-70"></div>
      
      <div className="flex justify-between items-start">
        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
          {icon}
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-end">
          <span className="text-white text-2xl font-bold tracking-tight">{value}</span>
          {change && (
            <span className={`ml-2 text-sm font-medium ${
              isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-gray-400'
            }`}>
              {change}
            </span>
          )}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
    </motion.div>
  )
}

// Advanced chart component
const AdvancedChart = ({ data, pairData }: { data: any[]; pairData: PairData | null }) => {
  const chartData = [
    { name: "1D", price: 100 },
    { name: "2D", price: 120 },
    { name: "3D", price: 115 },
    { name: "4D", price: 130 },
    { name: "5D", price: 125 },
    { name: "6D", price: 140 },
    { name: "7D", price: 160 },
  ]
  
  const isPositive = pairData?.priceChange?.h24 && pairData.priceChange.h24 >= 0
  
  return (
    <div className="h-[300px] w-full mt-6 relative">
      <div className="absolute top-0 left-0 z-10 flex items-center space-x-2">
        <div className="text-xl font-bold text-white">
          {pairData ? formatCurrency(pairData.priceUsd) : "$0.00"}
        </div>
        {pairData?.priceChange?.h24 && (
          <div className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{pairData.priceChange.h24.toFixed(2)}%
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 40, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
          <YAxis stroke="#666" axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid #333",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: any) => [`${formatCurrency(value)}`, "Price"]}
            labelStyle={{ color: "#999" }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#10B981" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// AI Response component with typing animation
const AIResponse = ({ content, isLoading }: { content: string; isLoading: boolean }) => {
  const [displayedContent, setDisplayedContent] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  
  useEffect(() => {
    if (content && !isLoading) {
      setIsTyping(true)
      let i = 0
      const typingInterval = setInterval(() => {
        setDisplayedContent(content.substring(0, i))
        i++
        if (i > content.length) {
          clearInterval(typingInterval)
          setIsTyping(false)
        }
      }, 20) // Adjust typing speed here
      
      return () => clearInterval(typingInterval)
    }
  }, [content, isLoading])
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-400 p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Analyzing market data...</span>
      </div>
    )
  }
  
  if (!content) return null
  
  return (
    <div className="relative">
      <div className="rounded-lg bg-gradient-to-br from-gray-900 to-black p-6 text-gray-300 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <div className="flex items-center mb-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-medium text-white">Genius AI</div>
        </div>
        
        <div className="prose prose-sm prose-invert max-w-none">
          {displayedContent}
          {isTyping && <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse"></span>}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center text-sm text-gray-400">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Limited response. Sign up for full AI capabilities.</span>
            </div>
            <a 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-md transition-colors"
            >
              <span>Access Full Features</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="absolute -bottom-3 -right-3 h-24 w-24 bg-emerald-500/20 rounded-full filter blur-2xl opacity-70 z-0"></div>
    </div>
  )
}

// Feature card component
const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
}) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])
  
  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-xl backdrop-blur-md p-6 bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800/50 hover:border-emerald-500/30 transition-all group"
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
      <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 mb-4 inline-block">
        {icon}
      </div>
      
      <h3 className="text-white text-lg font-medium mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
      
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl -mr-16 -mb-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    </motion.div>
  )
}

// Main Genius Section component
export function GeniusSection() {
  const [pairData, setPairData] = useState<PairData | null>(null)
  const [analysis, setAnalysis] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [hasResponded, setHasResponded] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'metrics'>('analysis')
  
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 })
  const controls = useAnimation()
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = formData.get("query") as string

    setLoading(true)
    setError(null)
    setHasResponded(false)

    try {
      const response = await fetch(`/api/dexscreener?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      setPairData(data.pair)
      setAnalysis(data.analysis)
      setChatMessages([{ role: "assistant", content: data.analysis }])
      setHasResponded(true)
    } catch (err) {
      console.error("Error in handleSearch:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!chatInput.trim() || hasResponded) return

    const newMessage = { role: "user", content: chatInput }
    setChatMessages([...chatMessages, newMessage])
    setChatInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, newMessage],
          pairData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI")
      }

      const data = await response.json()
      setChatMessages([...chatMessages, newMessage, { role: "assistant", content: data.response }])
      setHasResponded(true)
    } catch (error) {
      console.error("Error in chat:", error)
      setChatMessages([
        ...chatMessages,
        newMessage,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const chartData = pairData
    ? [
        { name: "Price", value: Number(pairData.priceUsd) },
        { name: "Volume (24h)", value: pairData.volume?.h24 || 0 },
        { name: "Liquidity", value: pairData.liquidity?.usd || 0 },
      ]
    : []

  return (
    <section ref={sectionRef} className="relative bg-[#050505] py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]"></div>
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-600 rounded-full filter blur-[120px] opacity-[0.07]"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-emerald-500 rounded-full filter blur-[100px] opacity-[0.05]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionTitle 
          title="AI-Powered Market Intelligence" 
          subtitle="Harness the power of advanced AI to analyze any token in seconds. Get instant insights, risk assessments, and trading opportunities."
        />

        <div className="grid gap-8 lg:grid-cols-2 mt-16">
          {/* Left column - Analysis and Metrics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { 
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }
              }
            }}
            className="flex flex-col"
          >
            <div className="mb-6">
              <div className="inline-flex rounded-lg p-1 bg-black/30 backdrop-blur-sm border border-gray-800/50 mb-6">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'analysis'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('analysis')}
                >
                  AI Analysis
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'metrics'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('metrics')}
                >
                  Key Metrics
                </button>
              </div>
              
              <AnimatePresence mode="wait">
                {activeTab === 'analysis' ? (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {pairData ? (
                      <>
                        <div className="mb-6">
                          <div className="flex items-center mb-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mr-3 shadow-lg">
                              <span className="text-white font-bold">{pairData.baseToken.symbol.substring(0, 2)}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{pairData.baseToken.name}</h3>
                              <div className="flex items-center text-sm text-gray-400">
                                <span>{pairData.baseToken.symbol}</span>
                                <span className="mx-2">•</span>
                                <span>{pairData.chainId}</span>
                                <span className="mx-2">•</span>
                                <span>{pairData.dexId}</span>
                              </div>
                            </div>
                          </div>
                          
                          <AdvancedChart data={chartData} pairData={pairData} />
                        </div>
                        
                        <AIResponse content={analysis} isLoading={loading} />
                      </>
                    ) : (
                      <div className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800/50 p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Intelligent Token Analysis</h3>
                        <p className="text-gray-400 mb-6">
                          Enter a token address or symbol to get instant AI-powered market analysis, risk assessment, and trading insights.
                        </p>
                        {error && (
                          <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700/50 text-red-200 text-sm">
                            <div className="font-medium mb-1">Error:</div>
                            <div>{error}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="metrics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {pairData ? (
                      <div className="grid grid-cols-2 gap-4">
                        <MetricCard 
                          icon={<DollarSign className="h-5 w-5" />}
                          title="Price"
                          value={formatCurrency(pairData.priceUsd)}
                          change={`${pairData.priceChange?.h24 >= 0 ? '+' : ''}${pairData.priceChange?.h24.toFixed(2)}%`}
                          delay={0.1}
                        />
                        <MetricCard 
                          icon={<Droplets className="h-5 w-5" />}
                          title="Liquidity"
                          value={formatCurrency(pairData.liquidity?.usd || 0)}
                          delay={0.2}
                        />
                        <MetricCard 
                          icon={<TrendingUp className="h-5 w-5" />}
                          title="Volume (24h)"
                          value={formatCurrency(pairData.volume?.h24 || 0)}
                          delay={0.3}
                        />
                        <MetricCard 
                          icon={<BarChart3 className="h-5 w-5" />}
                          title="Market Rank"
                          value="#1,234"
                          delay={0.4}
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800/50 p-8 text-center h-[400px] flex flex-col items-center justify-center">
                        <Lock className="h-12 w-12 text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No Token Selected</h3>
                        <p className="text-gray-400">
                          Search for a token to view detailed metrics and analytics
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Features */}
            {!pairData && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                <FeatureCard 
                  icon={<Zap className="h-5 w-5" />}
                  title="Real-time Analysis"
                  description="Get instant insights on any token with our advanced AI algorithms"
                  delay={0.3}
                />
                <FeatureCard 
                  icon={<AlertCircle className="h-5 w-5" />}
                  title="Risk Assessment"
                  description="Identify potential risks and red flags before investing"
                  delay={0.4}
                />
                <FeatureCard 
                  icon={<BarChart3 className="h-5 w-5" />}
                  title="Market Metrics"
                  description="Access key performance indicators and market positioning"
                  delay={0.5}
                />
                <FeatureCard 
                  icon={<ArrowUpRight className="h-5 w-5" />}
                  title="Trading Signals"
                  description="Receive actionable trading insights based on market conditions"
                  delay={0.6}
                />
              </div>
            )}
          </motion.div>
          
          {/* Right column - Search and Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: 20 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { 
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }
              }
            }}
          >
            <Card className="border-gray-800/50 bg-gradient-to-br from-gray-900 to-black/90 overflow-hidden relative h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full filter blur-[80px] -mr-32 -mt-32 opacity-70"></div>
              
              <div className="p-8 h-full flex flex-col">
                {!pairData || (pairData && hasResponded) ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {!pairData ? "Analyze Any Token" : "Ask Follow-up Questions"}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {!pairData 
                          ? "Enter a token address or symbol to get comprehensive AI analysis" 
                          : "Sign up for our premium dashboard to continue the conversation and unlock advanced features"}
                      </p>
                    </div>
                    
                    <form onSubmit={handleSearch} className="space-y-4 flex-grow">
                      <div className="relative">
                        <Input
                          type="text"
                          name="query"
                          placeholder="Enter token address or symbol (e.g., ETH, 0x...)"
                          className="border-gray-800 bg-black/50 text-white placeholder:text-gray-500 h-12 pl-4 pr-12"
                          disabled={loading || hasResponded}
                        />
                        {!loading && !hasResponded && (
                          <button 
                            type="submit" 
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {hasResponded && (
                        <div className="mt-6 p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                          <div className="flex items-center mb-2">
                            <Lock className="h-4 w-4 text-emerald-400 mr-2" />
                            <h4 className="text-sm font-medium text-white">Premium Feature</h4>
                          </div>
                          <p className="text-sm text-gray-400 mb-4">
                            Sign up for our premium dashboard to continue the conversation and ask follow-up questions about this token.
                          </p>
                          <a 
                            href="/dashboard" 
                            className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-md transition-colors w-full justify-center"
                          >
                            <span>Access Premium Dashboard</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </div>
                      )}
                    </form>
                    
                    {!pairData && (
                      <div className="mt-auto pt-6 border-t border-gray-800/50">
                        <div className="flex items-center text-sm text-gray-400">
                          <Sparkles className="h-4 w-4 mr-2 text-emerald-400" />
                          <span>Powered by advanced AI and real-time market data</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">Chat with Genius AI</h3>
                      <p className="text-gray-400 text-sm">
                        Ask follow-up questions about {pairData.baseToken.name} ({pairData.baseToken.symbol})
                      </p>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto mb-4 space-y-4">
                      {chatMessages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`${
                            message.role === "user" 
                              ? "ml-auto bg-emerald-600 text-white" 
                              : "mr-auto bg-gray-800 text-gray-200"
                          } rounded-lg p-3 max-w-[80%]`}
                        >
                          {message.content}
                        </div>
                      ))}
                    </div>
                    
                    <form onSubmit={handleChatSubmit} className="mt-auto">
                      <div className="relative">
                        <Input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask a follow-up question..."
                          className="border-gray-800 bg-black/50 text-white placeholder:text-gray-500 h-12 pl-4 pr-12"
                          disabled={loading || hasResponded}
                        />
                        {!loading && !hasResponded && (
                          <button 
                            type="submit" 
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </form>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* Premium Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.8,
                delay: 0.6,
                ease: [0.22, 1, 0.36, 1]
              }
            }
          }}
          className="mt-20 rounded-xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-black/60"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]"></div>
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Unlock Premium Features</h3>
              <p className="text-gray-300 max-w-2xl">
                Get unlimited AI analysis, real-time alerts, portfolio tracking, and advanced trading signals with our premium dashboard.
              </p>
            </div>
            
            <a 
              href="/dashboard" 
              className="inline-flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Try Premium Free</span>
              <ChevronRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
