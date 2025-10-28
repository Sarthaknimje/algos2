import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Settings, 
  Link as LinkIcon, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Edit3,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Plus
} from 'lucide-react'
import { usePeraWallet } from '../hooks/usePeraWallet'
import { useYouTubeData } from '../hooks/useYouTubeData'
import { YouTubeIcon, InstagramIcon, TwitterIcon, LinkedInIcon, TokenIcon, PeraWalletIcon } from '../assets/icons'

interface CreatorProfile {
  name: string
  bio: string
  profileImage: string
  socialLinks: {
    youtube: string
    instagram: string
    twitter: string
    linkedin: string
  }
  stats: {
    subscribers: number
    totalViews: number
    videos: number
    joinedDate: string
  }
  tokens: Array<{
    id: string
    name: string
    symbol: string
    price: number
    marketCap: number
    volume24h: number
    change24h: number
    holders: number
  }>
  earnings: {
    totalEarned: number
    monthlyEarned: number
    tradingFees: number
    platformFees: number
  }
}

const Profile: React.FC = () => {
  const { isConnected, address, balance, connectWallet, isLoading } = usePeraWallet()
  const { channel, videos, createdASAs, connectChannel, isLoading: youtubeLoading } = useYouTubeData()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false)
  const [channelInput, setChannelInput] = useState('')

  // Use real YouTube data or fallback to default
  const profile: CreatorProfile = {
    name: channel?.title || 'YouTube Creator',
    bio: channel?.description || 'Connect your YouTube channel to see your real data.',
    profileImage: channel?.thumbnail || '',
    socialLinks: {
      youtube: channel ? `https://youtube.com/channel/${channel.id}` : '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    stats: {
      subscribers: channel?.subscriberCount || 0,
      totalViews: channel?.viewCount || 0,
      videos: channel?.videoCount || 0,
      joinedDate: '2024-01-15'
    },
    tokens: createdASAs.map((asa, index) => ({
      id: asa.assetId.toString(),
      name: asa.assetName,
      symbol: asa.unitName,
      price: 0.01, // Mock price for now
      marketCap: asa.totalSupply * 0.01,
      volume24h: Math.random() * 1000,
      change24h: (Math.random() - 0.5) * 20,
      holders: Math.floor(Math.random() * 100) + 10
    })),
    earnings: {
      totalEarned: createdASAs.length * 100, // Mock earnings
      monthlyEarned: createdASAs.length * 25,
      tradingFees: createdASAs.length * 85,
      platformFees: createdASAs.length * 15
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'tokens', label: 'My Tokens', icon: TokenIcon },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const handleConnectYouTube = async () => {
    if (!channelInput.trim()) return
    
    setIsConnectingYouTube(true)
    try {
      await connectChannel(channelInput.trim())
      setChannelInput('')
    } catch (error) {
      console.error('Failed to connect YouTube:', error)
    } finally {
      setIsConnectingYouTube(false)
    }
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      // Show toast notification
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Edit3 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>
                <p className="text-gray-400 mb-4 max-w-md">{profile.bio}</p>
                
                {/* Social Links */}
                <div className="flex items-center space-x-4">
                  {profile.socialLinks.youtube ? (
                    <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors">
                      <YouTubeIcon className="w-5 h-5" />
                      <span className="text-sm">YouTube Connected</span>
                    </a>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={channelInput}
                        onChange={(e) => setChannelInput(e.target.value)}
                        placeholder="Channel ID or Username"
                        className="px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-red-400"
                      />
                      <button 
                        onClick={handleConnectYouTube} 
                        disabled={isConnectingYouTube || !channelInput.trim()} 
                        className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <YouTubeIcon className="w-4 h-4" />
                        <span className="text-sm">{isConnectingYouTube ? 'Connecting...' : 'Connect'}</span>
                      </button>
                    </div>
                  )}
                  
                  {profile.socialLinks.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-pink-400 hover:text-pink-300 transition-colors">
                      <InstagramIcon className="w-5 h-5" />
                      <span className="text-sm">Instagram</span>
                    </a>
                  )}
                  
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <TwitterIcon className="w-5 h-5" />
                      <span className="text-sm">Twitter</span>
                    </a>
                  )}
                  
                  {profile.socialLinks.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 transition-colors">
                      <LinkedInIcon className="w-5 h-5" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Launch New Token
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Users className="w-8 h-8 text-primary-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{formatNumber(profile.stats.subscribers)}</div>
          <div className="text-gray-400 text-sm">Subscribers</div>
        </div>
        
        <div className="card text-center">
          <Eye className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{formatNumber(profile.stats.totalViews)}</div>
          <div className="text-gray-400 text-sm">Total Views</div>
        </div>
        
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{profile.tokens.length}</div>
          <div className="text-gray-400 text-sm">Active Tokens</div>
        </div>
        
        <div className="card text-center">
          <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">${formatNumber(profile.earnings.totalEarned)}</div>
          <div className="text-gray-400 text-sm">Total Earned</div>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Wallet Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Wallet Address</span>
            <div className="flex items-center space-x-2">
              <span className="text-white font-mono text-sm">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
              <button onClick={handleCopyAddress} className="p-1 hover:bg-white/10 rounded">
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">ALGO Balance</span>
            <span className="text-white font-semibold">{balance.toFixed(2)} ALGO</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTokens = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">My Tokens</h3>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Launch New Token
        </button>
      </div>

      <div className="grid gap-4">
        {profile.tokens.map((token) => (
          <div key={token.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <TokenIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{token.name}</h4>
                  <p className="text-gray-400">${token.symbol}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-white">${token.price.toFixed(4)}</div>
                <div className={`text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-gray-400 text-sm">Market Cap</div>
                <div className="text-white font-semibold">${formatNumber(token.marketCap)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-sm">24h Volume</div>
                <div className="text-white font-semibold">${formatNumber(token.volume24h)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-sm">Holders</div>
                <div className="text-white font-semibold">{formatNumber(token.holders)}</div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button className="btn-secondary flex-1">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Trading
              </button>
              <button className="btn-secondary flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderEarnings = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Earnings Overview</h3>
      
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">${formatNumber(profile.earnings.totalEarned)}</div>
          <div className="text-gray-400 text-sm">Total Earned</div>
        </div>
        
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">${formatNumber(profile.earnings.monthlyEarned)}</div>
          <div className="text-gray-400 text-sm">This Month</div>
        </div>
        
        <div className="card text-center">
          <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">85%</div>
          <div className="text-gray-400 text-sm">Your Share</div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="card">
        <h4 className="text-lg font-semibold text-white mb-4">Earnings Breakdown</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Trading Fees (Your Share)</span>
            <span className="text-green-400 font-semibold">${formatNumber(profile.earnings.tradingFees)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Platform Fees</span>
            <span className="text-gray-400">${formatNumber(profile.earnings.platformFees)}</span>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Net Earnings</span>
              <span className="text-white font-bold text-lg">${formatNumber(profile.earnings.totalEarned)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Information */}
      <div className="card">
        <h4 className="text-lg font-semibold text-white mb-4">Payout Information</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Next Payout</span>
            <span className="text-white">Monthly (1st of each month)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Minimum Payout</span>
            <span className="text-white">10 ALGO</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Payout Method</span>
            <span className="text-white">Direct to Wallet</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Settings</h3>
      
      {/* Profile Settings */}
      <div className="card">
        <h4 className="text-lg font-semibold text-white mb-4">Profile Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={profile.name}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Bio</label>
            <textarea
              value={profile.bio}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Social Connections */}
      <div className="card">
        <h4 className="text-lg font-semibold text-white mb-4">Social Connections</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <YouTubeIcon className="w-6 h-6 text-red-500" />
              <span className="text-white">YouTube</span>
            </div>
            <button className="btn-secondary">
              {profile.socialLinks.youtube ? 'Connected' : 'Connect'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <InstagramIcon className="w-6 h-6" />
              <span className="text-white">Instagram</span>
            </div>
            <button className="btn-secondary">
              {profile.socialLinks.instagram ? 'Connected' : 'Connect'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TwitterIcon className="w-6 h-6 text-blue-500" />
              <span className="text-white">Twitter</span>
            </div>
            <button className="btn-secondary">
              {profile.socialLinks.twitter ? 'Connected' : 'Connect'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LinkedInIcon className="w-6 h-6 text-blue-600" />
              <span className="text-white">LinkedIn</span>
            </div>
            <button className="btn-secondary">
              {profile.socialLinks.linkedin ? 'Connected' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <h4 className="text-lg font-semibold text-white mb-4">Notifications</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Trading Notifications</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Earnings Updates</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">New Follower Alerts</span>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </div>
    </div>
  )

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your Pera wallet to access your creator profile and manage your tokens.
          </p>
          <button 
            onClick={connectWallet}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2 mx-auto disabled:opacity-50"
          >
            <PeraWalletIcon className="w-5 h-5" />
            <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Creator <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-gray-400">Manage your tokens, earnings, and social connections</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'tokens' && renderTokens()}
          {activeTab === 'earnings' && renderEarnings()}
          {activeTab === 'settings' && renderSettings()}
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
