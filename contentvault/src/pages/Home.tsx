import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  Rocket, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  Play,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  TrendingDown,
  BarChart3,
  Sparkles,
  Globe,
  Wallet,
  Coins,
  ChevronDown
} from 'lucide-react'
import { YouTubeIcon, InstagramIcon, TwitterIcon, LinkedInIcon, TokenIcon } from '../assets/icons'

const Home: React.FC = () => {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  
  const [currentStat, setCurrentStat] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: Rocket,
      title: 'Creator Tokens',
      description: 'Launch your own creator token like a cryptocurrency. Each creator gets their own coin with real-time metrics, charts, and market cap.',
      color: 'from-violet-500 to-fuchsia-500',
      glow: 'shadow-violet-500/30'
    },
    {
      icon: DollarSign,
      title: 'Tokenize Content',
      description: 'Tokenize your posts, YouTube videos, Instagram reels, and Twitter content. Each piece becomes a tradeable digital asset.',
      color: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/30'
    },
    {
      icon: Users,
      title: 'Premium Access',
      description: 'Token holders get exclusive premium content, early access, and special perks only available on our platform.',
      color: 'from-purple-500 to-violet-500',
      glow: 'shadow-purple-500/30'
    },
    {
      icon: Shield,
      title: 'Verified Ownership',
      description: 'Only content owners can tokenize their work. Connect your accounts and prove ownership before minting.',
      color: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/30'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Connect & Verify',
      description: 'Connect your YouTube channel and verify ownership. Your content, your tokens - nobody else can tokenize your work.',
      icon: Shield,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      number: '02',
      title: 'Tokenize Content',
      description: 'Turn your videos and posts into tradeable tokens. Set your supply, price curve, and launch your creator economy.',
      icon: Coins,
      color: 'from-violet-500 to-purple-600'
    },
    {
      number: '03',
      title: 'Earn & Grow',
      description: 'Earn 5% from every trade. Token holders get exclusive benefits. Watch your creator empire grow with real value.',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-600'
    }
  ]

  const liveStats = [
    { label: 'Total Tokens Created', value: '1,247+', icon: Coins },
    { label: 'Creators Onboarded', value: '500+', icon: Users },
    { label: 'Trading Volume', value: '$2.4M+', icon: BarChart3 },
    { label: 'Creator Earnings', value: '$180K+', icon: DollarSign }
  ]

  const platforms = [
    { icon: YouTubeIcon, name: 'YouTube', status: 'API Connected', color: 'text-red-500' },
    { icon: InstagramIcon, name: 'Instagram', status: 'Coming Soon', color: 'text-pink-500' },
    { icon: TwitterIcon, name: 'Twitter/X', status: 'Coming Soon', color: 'text-blue-400' },
    { icon: LinkedInIcon, name: 'LinkedIn', status: 'Coming Soon', color: 'text-blue-600' }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient mesh */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, rgba(120, 0, 255, 0.15), transparent),
              radial-gradient(ellipse 60% 40% at 80% 60%, rgba(0, 200, 255, 0.1), transparent),
              radial-gradient(ellipse 40% 60% at 50% 80%, rgba(255, 0, 128, 0.08), transparent)
            `
          }}
        />
        
        {/* Animated grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5,
            }}
          />
        ))}
        
        {/* Cursor glow effect */}
        <motion.div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(120, 0, 255, 0.1) 0%, transparent 70%)',
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div style={{ y, opacity }} className="absolute inset-0">
          {/* Large gradient orbs */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/20 to-fuchsia-600/10 rounded-full blur-[100px]"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-cyan-600/20 to-blue-600/10 rounded-full blur-[100px]"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        <div className="relative max-w-7xl mx-auto text-center z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Powered by Algorand Blockchain</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full">LIVE</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-white">Own Your</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Content Empire
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transform your YouTube videos into tradeable tokens. 
            <span className="text-white font-medium"> Only you can tokenize your content.</span>
            <br />
            <span className="text-cyan-400">Fans invest. You earn 5% on every trade.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link to="/tokenize">
              <motion.button
                className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl text-white font-bold text-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Start Tokenizing
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-violet-600"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
            
            <Link to="/marketplace">
              <motion.button
                className="px-8 py-4 border-2 border-white/20 rounded-2xl text-white font-bold text-lg hover:bg-white/5 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="w-5 h-5" />
                Explore Marketplace
              </motion.button>
            </Link>
          </motion.div>

          {/* Platform Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center items-center gap-8 mb-16"
          >
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                className="group flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/30 transition-colors ${platform.color}`}>
                  <platform.icon className="w-8 h-8" />
                </div>
                <span className="text-xs text-gray-500">{platform.status}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Live Stats Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {liveStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <stat.icon className="w-6 h-6 text-violet-400 mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-gray-500"
            >
              <span className="text-sm">Scroll to explore</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The Creator Economy is <span className="text-red-500">Broken</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Platforms profit billions while creators struggle. We're fixing that.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Problems */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-red-400">The Problems</h3>
              </div>

              {[
                { title: 'Platforms Take 30-50%', desc: 'YouTube, Instagram take massive cuts. Creators get pennies.' },
                { title: 'Fans Can\'t Invest', desc: 'Supporters get nothing in return. Just likes and comments.' },
                { title: 'No True Ownership', desc: 'Platform algorithms control your audience and income.' }
              ].map((problem, i) => (
                <motion.div
                  key={i}
                  className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-all"
                  whileHover={{ x: 10 }}
                >
                  <h4 className="text-lg font-semibold text-white mb-2">{problem.title}</h4>
                  <p className="text-gray-400">{problem.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Solutions */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-green-400">Our Solution</h3>
              </div>

              {[
                { title: 'Earn 5% on Every Trade', desc: 'Your fans buy & sell your tokens. You earn from every transaction.' },
                { title: 'Fans Become Investors', desc: 'Token holders unlock premium content. Real value for real support.' },
                { title: 'Verified Ownership', desc: 'Only YOU can tokenize YOUR content. Connect channel = prove ownership.' }
              ].map((solution, i) => (
                <motion.div
                  key={i}
                  className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all"
                  whileHover={{ x: 10 }}
                >
                  <h4 className="text-lg font-semibold text-white mb-2">{solution.title}</h4>
                  <p className="text-gray-400">{solution.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Built for <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Creators</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to launch your creator economy on blockchain.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-500 hover:shadow-2xl ${feature.glow}`}
                  whileHover={{ y: -10 }}
                >
                  <motion.div 
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32 px-4 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              How It <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Launch your creator economy in three simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-green-500 opacity-30" />
            
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 transition-all text-center group">
                    {/* Step number */}
                    <motion.div 
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {step.number}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${step.color} bg-opacity-20 flex items-center justify-center mx-auto mb-6 mt-4`}
                      whileHover={{ rotate: 5, scale: 1.05 }}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-[600px] h-[600px] bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-full blur-[120px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 p-12 rounded-[40px] bg-gradient-to-r from-white/5 to-white/10 border border-white/20 backdrop-blur-xl"
          >
            <motion.div 
              className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <TokenIcon className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Own Your <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Content Empire?
              </span>
            </h2>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join the creator revolution. Tokenize your content, earn from every trade, 
              and give your fans real value.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/profile">
                <motion.button
                  className="group px-10 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl text-white font-bold text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-3">
                    <Wallet className="w-6 h-6" />
                    Connect & Start
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
              
              <Link to="/dashboard">
                <motion.button
                  className="px-10 py-5 border-2 border-white/20 rounded-2xl text-white font-bold text-lg hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6" />
                    View Dashboard
                  </span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-20" />
    </div>
  )
}

export default Home
