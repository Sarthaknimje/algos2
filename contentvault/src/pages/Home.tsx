import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  BarChart3
} from 'lucide-react'
import { YouTubeIcon, InstagramIcon, TwitterIcon, LinkedInIcon, TokenIcon } from '../assets/icons'

const Home: React.FC = () => {
  const features = [
    {
      icon: Rocket,
      title: 'Creator Tokens',
      description: 'Launch your own creator token like a cryptocurrency. Each creator gets their own coin with metrics, charts, and market cap.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: DollarSign,
      title: 'Tokenize Content',
      description: 'Tokenize your posts, YouTube videos, Instagram reels, and Twitter content. Each piece becomes a tradeable asset.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Premium Access',
      description: 'Token holders get exclusive premium content, early access, and special perks only on our platform.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Creator Profile',
      description: 'Showcase your roadmap, achievements, plans, and potential. Like a whitepaper for your creator journey.',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Launch Your Token',
      description: 'Connect your social accounts and launch your creator token. Set your vision, roadmap, and goals.',
      icon: Rocket
    },
    {
      number: '02',
      title: 'Tokenize Content',
      description: 'Turn your posts, videos, and reels into tokens. Investors get premium access to exclusive content.',
      icon: Star
    },
    {
      number: '03',
      title: 'Earn & Grow',
      description: 'Earn from trading fees and content sales. Token holders get benefits. You control your content empire.',
      icon: TrendingUp
    }
  ]

  const stats = [
    { label: 'Creator Tokens', value: 'Like Crypto Coins' },
    { label: 'Content Tokens', value: 'Posts & Videos' },
    { label: 'Premium Access', value: 'For Holders' },
    { label: 'Creator Earnings', value: '85% Share' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Main gradient orbs */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          
          {/* Floating particles */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/20 to-yellow-500/10 rounded-full blur-2xl"
            animate={{ 
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Smaller accent orbs */}
          <motion.div 
            className="absolute top-3/4 left-1/6 w-32 h-32 bg-gradient-to-r from-yellow-500/25 to-orange-500/15 rounded-full blur-xl"
            animate={{ 
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, 90, 0]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div 
            className="absolute bottom-1/6 right-1/6 w-48 h-48 bg-gradient-to-r from-cyan-500/25 to-blue-500/15 rounded-full blur-2xl"
            animate={{ 
              y: [0, 25, 0],
              x: [0, -20, 0],
              rotate: [0, -90, 0]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />
          
          {/* Animated grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-12"
            >
              <motion.h1 
                className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <motion.span 
                  className="block"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Tokenize Your
                </motion.span>
                <motion.span 
                  className="gradient-text block"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Content Empire
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-5xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                Create your creator token, tokenize your posts, videos & reels. 
                <br className="hidden md:block" />
                <span className="text-white font-semibold">Investors get premium content access.</span> 
                <br className="hidden md:block" />
                <span className="text-cyan-400 font-semibold">Holders unlock exclusive benefits.</span>
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link to="/launchpad" className="btn-primary text-lg px-10 py-5 flex items-center space-x-3 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
                  <Rocket className="w-6 h-6" />
                  <span>Launch Your Token</span>
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link to="/creator-marketplace" className="btn-secondary text-lg px-10 py-5 flex items-center space-x-3 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
                  <BarChart3 className="w-6 h-6" />
                  <span>Trade Tokens</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Enhanced Social Platform Icons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex justify-center items-center space-x-8 mb-20"
            >
              <div className="flex items-center space-x-3 text-gray-400">
                <span className="text-sm font-medium">Connect with:</span>
              </div>
              <div className="flex items-center space-x-8">
                {[
                  { icon: YouTubeIcon, href: "https://youtube.com", color: "hover:text-red-500" },
                  { icon: InstagramIcon, href: "https://instagram.com", color: "hover:text-pink-500" },
                  { icon: TwitterIcon, href: "https://twitter.com", color: "hover:text-blue-400" },
                  { icon: LinkedInIcon, href: "https://linkedin.com", color: "hover:text-blue-600" }
                ].map((platform, index) => (
                  <motion.a
                    key={index}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${platform.color} transition-all duration-300 hover:scale-125`}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                  >
                    <platform.icon className="w-10 h-10" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div 
                    className="text-3xl md:text-4xl font-bold text-white mb-2"
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 relative overflow-hidden bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              The Creator Economy is <span className="text-red-400">Broken</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Creators work hard but platforms take most of the revenue. Fans want to support but get nothing in return. 
              It's time for a change.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
            {/* Problem Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-8">
                <XCircle className="w-8 h-8 text-red-400" />
                <h3 className="text-3xl font-bold text-red-400">The Problems</h3>
              </div>

              <motion.div 
                className="card bg-red-500/5 border-red-500/20 hover:border-red-500/40 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-4">
                  <TrendingDown className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Platforms Take 30-50% Revenue</h4>
                    <p className="text-gray-400">YouTube, Instagram, and other platforms take a huge cut. Creators get pennies while platforms profit billions.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card bg-red-500/5 border-red-500/20 hover:border-red-500/40 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-4">
                  <Lock className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Fans Can't Really Invest</h4>
                    <p className="text-gray-400">Fans support creators but get nothing in return. No ownership, no benefits, just likes and comments.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card bg-red-500/5 border-red-500/20 hover:border-red-500/40 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-4">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">No Direct Creator-Fan Relationship</h4>
                    <p className="text-gray-400">Everything goes through platforms. Creators don't own their audience or revenue streams.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Solution Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-8">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <h3 className="text-3xl font-bold text-green-400">Our Solution</h3>
              </div>

              <motion.div 
                className="card bg-green-500/5 border-green-500/20 hover:border-green-500/40 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-4">
                  <Rocket className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Launch Your Own Creator Token</h4>
                    <p className="text-gray-400">Create your own cryptocurrency-like token. Set your own price, market cap, and trading rules. You're in control.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card bg-green-500/5 border-green-500/20 hover:border-green-500/40 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-4">
                  <Unlock className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Fans Become Investors & Get Benefits</h4>
                    <p className="text-gray-400">Token holders unlock premium content, early access, and exclusive perks. True fans get rewarded.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card bg-green-500/5 border-green-500/20 hover:border-green-500/40 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-4">
                  <DollarSign className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">85% Revenue Share + Trading Fees</h4>
                    <p className="text-gray-400">Keep 85% of all earnings. Earn from content sales AND trading fees. Premium content hosted on CreatorVault only.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Premium Content Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary-500/30 p-8"
          >
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Lock className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Premium Content Lives on CreatorVault Only</h3>
                <p className="text-gray-300 text-lg mb-4">
                  When you tokenize content, <strong>premium versions are hosted exclusively on our platform</strong>. 
                  Only token holders can unlock and access this content. This creates real value for your tokens and keeps your community engaged.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ x: 5 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Exclusive premium videos</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ x: 5 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Behind-the-scenes content</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ x: 5 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Early access releases</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ x: 5 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Exclusive tutorials</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ x: 5 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Community perks</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ x: 5 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">1-on-1 sessions</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Why Choose <span className="gradient-text">CreatorVault</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built for creators, by creators. The all-in-one platform for content tokenization and monetization.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="card group card-hover"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                >
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                    whileHover={{ rotate: 5 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Launch your creator economy in three simple steps. Build your content empire today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                >
                  <div className="card text-center group hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
                    <motion.div 
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.number}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="w-20 h-20 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 mt-6 group-hover:from-primary-500/30 group-hover:to-secondary-500/30 transition-all duration-300"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <Icon className="w-10 h-10 text-primary-400 group-hover:text-primary-300 transition-colors" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Enhanced Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent"></div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card group hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-500"
          >
            <motion.div 
              className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300"
              whileHover={{ rotate: 10 }}
            >
              <TokenIcon className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-6xl font-display font-bold text-white mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to Build Your <span className="gradient-text">Content Empire</span>?
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of creators who are tokenizing their content and building their own economies. 
              <br className="hidden md:block" />
              <span className="text-white font-semibold">Launch your token today</span> and give your community premium access.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link to="/launchpad" className="btn-primary text-lg px-10 py-5 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-primary-500/25 transition-all duration-300">
                  <Rocket className="w-6 h-6" />
                  <span>Launch Your Token</span>
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link to="/creator-marketplace" className="btn-secondary text-lg px-10 py-5 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
                  <Users className="w-6 h-6" />
                  <span>Explore Creators</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
