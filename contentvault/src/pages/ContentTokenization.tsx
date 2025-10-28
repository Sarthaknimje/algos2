import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  ImageIcon,
  FileText,
  Users,
  Globe,
  Lock,
  Unlock,
  DollarSign,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  Download,
  Search,
  Loader,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Upload,
  Video,
  Image,
  Film,
  Shield,
  Coins,
  Info,
  Rocket
} from 'lucide-react'
import { YouTubeIcon, InstagramIcon, TwitterIcon, LinkedInIcon } from '../assets/icons'
import { useWallet } from '../contexts/WalletContext'
import { PeraWalletIcon } from '../assets/icons'
import { getYouTubeChannelStats, getYouTubeVideos } from '../services/socialMediaService'

interface ContentItem {
  id: string
  type: 'youtube' | 'instagram' | 'twitter' | 'linkedin' | 'premium'
  title: string
  description?: string
  thumbnail?: string
  isPremium: boolean
  price?: number
  tokenId?: string
  asaId?: number
  views?: number
  likes?: number
  createdAt: string
  url?: string
  fileUrl?: string
  holders?: number
}

const ContentTokenization: React.FC = () => {
  const { isConnected, address, connectWallet, isLoading } = useWallet()
  const [activeMainTab, setActiveMainTab] = useState<'public' | 'premium'>('premium')
  const [activePlatform, setActivePlatform] = useState('youtube')
  
  // Premium content states
  const [premiumContent, setPremiumContent] = useState<ContentItem[]>([])
  const [uploadModal, setUploadModal] = useState(false)
  const [newContentTitle, setNewContentTitle] = useState('')
  const [newContentDescription, setNewContentDescription] = useState('')
  const [newContentType, setNewContentType] = useState<'video' | 'image' | 'document'>('video')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  // Tokenization states
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [tokenizeModal, setTokenizeModal] = useState(false)
  const [tokenPrice, setTokenPrice] = useState('')
  const [tokenSupply, setTokenSupply] = useState('1000')
  const [isCreatingToken, setIsCreatingToken] = useState(false)
  
  // Input states for public platforms
  const [youtubeInput, setYoutubeInput] = useState('')
  const [instagramInput, setInstagramInput] = useState('')
  const [twitterInput, setTwitterInput] = useState('')
  const [linkedinInput, setLinkedinInput] = useState('')
  
  // Public content states
  const [youtubeContent, setYoutubeContent] = useState<ContentItem[]>([])
  const [instagramContent, setInstagramContent] = useState<ContentItem[]>([])
  const [twitterContent, setTwitterContent] = useState<ContentItem[]>([])
  const [linkedinContent, setLinkedinContent] = useState<ContentItem[]>([])
  
  // Loading states
  const [fetchingYoutube, setFetchingYoutube] = useState(false)
  const [fetchingInstagram, setFetchingInstagram] = useState(false)
  const [fetchingTwitter, setFetchingTwitter] = useState(false)
  const [fetchingLinkedin, setFetchingLinkedin] = useState(false)
  
  // Error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Auto-fetch connected YouTube channel videos
  useEffect(() => {
    const autoFetchYouTubeVideos = async () => {
      // Check if YouTube channel is connected (simulated for now)
      const isConnected = true // In real app, check session/localStorage
      
      if (isConnected) {
        try {
          setFetchingYoutube(true)
          const channelId = 'UCdvfFy61LgeqzOeLb4RlPPA' // Connected channel ID
          const videos = await getYouTubeVideos(channelId, 20)
          
          const formattedVideos = videos.map((video: any) => ({
            id: video.id,
            type: 'youtube' as const,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            isPremium: false,
            views: video.viewCount,
            likes: video.likeCount,
            createdAt: video.publishedAt,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            holders: 0
          }))
          
          setYoutubeContent(formattedVideos)
          console.log('✅ Auto-fetched YouTube videos:', formattedVideos.length)
        } catch (error) {
          console.error('Error auto-fetching YouTube videos:', error)
        } finally {
          setFetchingYoutube(false)
        }
      }
    }

    autoFetchYouTubeVideos()
  }, [])

  // Fetch YouTube videos (for reference only)
  const fetchYouTubeContent = async () => {
    if (!youtubeInput.trim()) {
      setErrors(prev => ({ ...prev, youtube: 'Please enter a YouTube channel URL or ID' }))
      return
    }

    setFetchingYoutube(true)
    setErrors(prev => ({ ...prev, youtube: '' }))

    try {
      const channelStats = await getYouTubeChannelStats(youtubeInput)
      
      if (!channelStats) {
        setErrors(prev => ({ ...prev, youtube: 'Could not find YouTube channel. Try: Channel ID (UC...), @username, or full URL' }))
        setFetchingYoutube(false)
        return
      }

      console.log(`Found channel with ${channelStats.subscribers} subscribers, ${channelStats.videos} videos`)

      const videos = await getYouTubeVideos(channelStats.channelId, 20)
      
      const content: ContentItem[] = videos.map(video => ({
        id: video.id,
        type: 'youtube',
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        isPremium: false,
        views: video.viewCount,
        likes: video.likeCount,
        createdAt: video.publishedAt,
        url: `https://youtube.com/watch?v=${video.id}`
      }))

      setYoutubeContent(content)
      setErrors(prev => ({ ...prev, youtube: '' }))
      
      if (content.length > 0) {
        console.log(`✅ Successfully loaded ${content.length} videos!`)
        setActivePlatform('youtube')
      }
    } catch (error: any) {
      console.error('YouTube fetch error:', error)
      const errorMessage = error.response?.data?.error?.message || 'Error fetching YouTube videos. Please check your API key and quota.'
      setErrors(prev => ({ ...prev, youtube: errorMessage }))
    } finally {
      setFetchingYoutube(false)
    }
  }

  // Fetch Instagram content (mock)
  const fetchInstagramContent = async () => {
    if (!instagramInput.trim()) {
      setErrors(prev => ({ ...prev, instagram: 'Please enter an Instagram username' }))
      return
    }

    setFetchingInstagram(true)
    setErrors(prev => ({ ...prev, instagram: '' }))

    try {
      const username = instagramInput.replace('@', '').trim()
      
      const mockContent: ContentItem[] = Array.from({ length: 12 }, (_, i) => ({
        id: `ig_${i}`,
        type: 'instagram' as const,
        title: `Instagram Reel ${i + 1} from @${username}`,
        thumbnail: `https://picsum.photos/400/400?random=${i}`,
        isPremium: false,
        views: Math.floor(Math.random() * 100000) + 10000,
        likes: Math.floor(Math.random() * 10000) + 1000,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        url: `https://instagram.com/${username}`
      }))

      setInstagramContent(mockContent)
      setErrors(prev => ({ ...prev, instagram: '' }))
      setActivePlatform('instagram')
    } catch (error) {
      console.error('Instagram fetch error:', error)
      setErrors(prev => ({ ...prev, instagram: 'Error fetching Instagram content.' }))
    } finally {
      setFetchingInstagram(false)
    }
  }

  // Fetch Twitter content (mock)
  const fetchTwitterContent = async () => {
    if (!twitterInput.trim()) {
      setErrors(prev => ({ ...prev, twitter: 'Please enter a Twitter/X username' }))
      return
    }

    setFetchingTwitter(true)
    setErrors(prev => ({ ...prev, twitter: '' }))

    try {
      const username = twitterInput.replace('@', '').trim()
      
      const mockContent: ContentItem[] = Array.from({ length: 15 }, (_, i) => ({
        id: `tw_${i}`,
        type: 'twitter' as const,
        title: `Tweet ${i + 1} from @${username}`,
        description: `Interesting thoughts about Web3, blockchain, and the creator economy...`,
        isPremium: false,
        views: Math.floor(Math.random() * 50000) + 5000,
        likes: Math.floor(Math.random() * 5000) + 500,
        createdAt: new Date(Date.now() - i * 43200000).toISOString(),
        url: `https://twitter.com/${username}`
      }))

      setTwitterContent(mockContent)
      setErrors(prev => ({ ...prev, twitter: '' }))
      setActivePlatform('twitter')
    } catch (error) {
      console.error('Twitter fetch error:', error)
      setErrors(prev => ({ ...prev, twitter: 'Error fetching Twitter content.' }))
    } finally {
      setFetchingTwitter(false)
    }
  }

  // Fetch LinkedIn content (mock)
  const fetchLinkedInContent = async () => {
    if (!linkedinInput.trim()) {
      setErrors(prev => ({ ...prev, linkedin: 'Please enter a LinkedIn profile URL' }))
      return
    }

    setFetchingLinkedin(true)
    setErrors(prev => ({ ...prev, linkedin: '' }))

    try {
      const mockContent: ContentItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `li_${i}`,
        type: 'linkedin' as const,
        title: `LinkedIn Post ${i + 1}`,
        description: `Professional insights on technology, startups, and career growth...`,
        isPremium: false,
        views: Math.floor(Math.random() * 20000) + 2000,
        likes: Math.floor(Math.random() * 2000) + 200,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        url: linkedinInput
      }))

      setLinkedinContent(mockContent)
      setErrors(prev => ({ ...prev, linkedin: '' }))
      setActivePlatform('linkedin')
    } catch (error) {
      console.error('LinkedIn fetch error:', error)
      setErrors(prev => ({ ...prev, linkedin: 'Error fetching LinkedIn content.' }))
    } finally {
      setFetchingLinkedin(false)
    }
  }

  // Handle premium content upload
  const handleUploadContent = () => {
    if (!newContentTitle.trim()) {
      alert('Please enter a title for your content')
      return
    }

    if (!uploadedFile) {
      alert('Please select a file to upload')
      return
    }

    // Create premium content item
    const newContent: ContentItem = {
      id: `premium_${Date.now()}`,
      type: 'premium',
      title: newContentTitle,
      description: newContentDescription,
      thumbnail: URL.createObjectURL(uploadedFile),
      isPremium: true,
      createdAt: new Date().toISOString(),
      fileUrl: URL.createObjectURL(uploadedFile),
      holders: 0
    }

    setPremiumContent(prev => [newContent, ...prev])
    
    // Reset form
    setUploadModal(false)
    setNewContentTitle('')
    setNewContentDescription('')
    setUploadedFile(null)
    
    // Show success message
    alert('✅ Premium content uploaded successfully! Now you can tokenize it.')
  }

  // Handle tokenization (create ASA)
  const handleTokenize = async () => {
    if (!selectedContent) return
    
    if (!tokenPrice || parseFloat(tokenPrice) <= 0) {
      alert('Please enter a valid token price')
      return
    }

    if (!tokenSupply || parseInt(tokenSupply) <= 0) {
      alert('Please enter a valid token supply')
      return
    }

    setIsCreatingToken(true)

    try {
      const BACKEND_URL = 'http://localhost:5001'
      
      // Call backend to create video token
      const response = await fetch(`${BACKEND_URL}/create-video-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: selectedContent.id,
          video_title: selectedContent.title,
          token_name: `${selectedContent.title} Token`,
          token_symbol: selectedContent.title.substring(0, 4).toUpperCase(),
          total_supply: parseInt(tokenSupply),
          token_price: parseFloat(tokenPrice)
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update content with token info
        const updatedContent = premiumContent.map(item => 
          item.id === selectedContent.id 
            ? { ...item, tokenId: result.data.transaction_id, asaId: result.data.asset_id, price: parseFloat(tokenPrice) }
            : item
        )
        
        setPremiumContent(updatedContent)
        setTokenizeModal(false)
        
        // Show success with video metrics and explorer link
        const metrics = result.data.video_metrics
        const asaId = result.data.asset_id
        const explorerUrl = `https://testnet.explorer.perawallet.app/asset/${asaId}`
        
        const userConfirmed = confirm(`🎉 Video Investment Token Created!\n\nASA ID: ${asaId}\nToken Symbol: ${selectedContent.title.substring(0, 6).toUpperCase()}\nPrice: ${result.data.current_price.toFixed(4)} ALGO\nSupply: ${tokenSupply} tokens\nMarket Cap: $${result.data.market_cap.toFixed(0)}\n\n📊 Video Metrics:\n👀 Views: ${metrics.views.toLocaleString()}\n❤️ Likes: ${metrics.likes.toLocaleString()}\n💬 Comments: ${metrics.comments.toLocaleString()}\n📈 Engagement Score: ${metrics.engagement_score.toFixed(2)}\n\n💰 Early investors will profit as video metrics grow!\n\n🔍 Click OK to view your token on Pera Wallet Explorer`)
        
        if (userConfirmed) {
          window.open(explorerUrl, '_blank')
        }
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Tokenization error:', error)
      alert('Error creating token. Make sure backend is running.')
    } finally {
      setIsCreatingToken(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  // Handle video tokenization
  const handleTokenizeVideo = (content: ContentItem) => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    setSelectedContent(content)
    setTokenizeModal(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const getPublicContent = () => {
    if (activePlatform === 'youtube') return youtubeContent
    if (activePlatform === 'instagram') return instagramContent
    if (activePlatform === 'twitter') return twitterContent
    if (activePlatform === 'linkedin') return linkedinContent
    return [...youtubeContent, ...instagramContent, ...twitterContent, ...linkedinContent]
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your wallet to upload premium content and create tokens.
          </p>
          <button 
            onClick={connectWallet}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <PeraWalletIcon className="w-5 h-5" />
            <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Content Tokenization</h1>
          <p className="text-gray-400 text-lg">Upload premium content and create tokens. Only holders can access.</p>
        </motion.div>

        {/* Main Tabs */}
        <div className="flex space-x-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveMainTab('premium')}
            className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
              activeMainTab === 'premium'
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-2xl shadow-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <Shield className="w-6 h-6" />
              <span>Premium Content</span>
              <Lock className="w-5 h-5" />
              {premiumContent.length > 0 && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {premiumContent.length}
                </span>
              )}
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveMainTab('public')}
            className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
              activeMainTab === 'public'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl shadow-blue-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <Globe className="w-6 h-6" />
              <span>Public Content</span>
              <span className="text-xs">(Reference Only)</span>
            </div>
          </motion.button>
        </div>

        {/* Premium Content Tab */}
        {activeMainTab === 'premium' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Upload Button */}
            <div className="card bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Upload Exclusive Content</h3>
                    <p className="text-gray-400">Upload videos, images, or documents that only token holders can access</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUploadModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold shadow-lg shadow-purple-500/50 flex items-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Content</span>
                </motion.button>
              </div>
            </div>

            {/* Premium Content Grid */}
            {premiumContent.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Premium Content Yet</h3>
                <p className="text-gray-400 mb-6">
                  Upload exclusive content that only your token holders can access
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {premiumContent.map((content, index) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/60 transition-all"
                  >
                    {/* Thumbnail */}
                    {content.thumbnail && (
                      <div className="relative mb-4 rounded-xl overflow-hidden">
                        <img 
                          src={content.thumbnail} 
                          alt={content.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 left-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center space-x-1">
                          <Lock className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-bold">PREMIUM</span>
                        </div>
                        {content.tokenId && (
                          <div className="absolute top-2 right-2 px-3 py-1 bg-green-500/90 rounded-lg flex items-center space-x-1">
                            <Coins className="w-4 h-4 text-white" />
                            <span className="text-white text-xs font-bold">TOKENIZED</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Info */}
                    <h3 className="text-white font-semibold mb-2">{content.title}</h3>
                    {content.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{content.description}</p>
                    )}

                    {/* Token Info */}
                    {content.tokenId && (
                      <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">ASA ID</div>
                        <div className="text-green-400 font-mono font-semibold">{content.asaId}</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">Price:</span>
                          <span className="text-white font-semibold">{content.price} ALGO</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">Holders:</span>
                          <span className="text-white font-semibold">{content.holders || 0}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {!content.tokenId ? (
                        <button
                          onClick={() => {
                            setSelectedContent(content)
                            setTokenizeModal(true)
                          }}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white text-sm font-semibold transition-all flex items-center justify-center space-x-1"
                        >
                          <Coins className="w-4 h-4" />
                          <span>Create Token</span>
                        </button>
                      ) : (
                        <>
                          <button className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-colors flex items-center justify-center space-x-1">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Public Content Tab - Sync Social & Launch Creator Coin */}
        {activeMainTab === 'public' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Creator Stats Summary */}
            {(youtubeContent.length > 0 || instagramContent.length > 0 || twitterContent.length > 0 || linkedinContent.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 border-purple-500/30 mb-8"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Ready to Launch Your Creator Coin?</h3>
                      <div className="flex items-center space-x-6">
                        {youtubeContent.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <YouTubeIcon className="w-5 h-5" />
                            <span className="text-gray-300">{youtubeContent.length} videos</span>
                          </div>
                        )}
                        {instagramContent.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <InstagramIcon className="w-5 h-5" />
                            <span className="text-gray-300">{instagramContent.length} posts</span>
                          </div>
                        )}
                        {twitterContent.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <TwitterIcon className="w-5 h-5" />
                            <span className="text-gray-300">{twitterContent.length} tweets</span>
                          </div>
                        )}
                        {linkedinContent.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <LinkedInIcon className="w-5 h-5" />
                            <span className="text-gray-300">{linkedinContent.length} posts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/launchpad'}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl text-white font-bold text-lg shadow-2xl shadow-orange-500/50 flex items-center space-x-3"
                  >
                    <Rocket className="w-6 h-6" />
                    <span>Launch Creator Coin</span>
                    <Zap className="w-6 h-6" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Platform Input Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* YouTube */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <YouTubeIcon className="w-8 h-8" />
                  <h3 className="text-xl font-bold text-white">YouTube</h3>
                  {youtubeContent.length > 0 && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                      {youtubeContent.length} videos
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Channel ID or @username"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchYouTubeContent()}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchYouTubeContent}
                    disabled={fetchingYoutube}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center"
                  >
                    {fetchingYoutube ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </motion.button>
                </div>
                {errors.youtube && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.youtube}</span>
                  </p>
                )}
              </motion.div>

              {/* Instagram */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <InstagramIcon className="w-8 h-8" />
                  <h3 className="text-xl font-bold text-white">Instagram</h3>
                  {instagramContent.length > 0 && (
                    <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm font-semibold">
                      {instagramContent.length} posts
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="@username"
                    value={instagramInput}
                    onChange={(e) => setInstagramInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchInstagramContent()}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchInstagramContent}
                    disabled={fetchingInstagram}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center"
                  >
                    {fetchingInstagram ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </motion.button>
                </div>
                {errors.instagram && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.instagram}</span>
                  </p>
                )}
              </motion.div>

              {/* Twitter/X */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <TwitterIcon className="w-8 h-8" />
                  <h3 className="text-xl font-bold text-white">Twitter / X</h3>
                  {twitterContent.length > 0 && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
                      {twitterContent.length} posts
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="@username"
                    value={twitterInput}
                    onChange={(e) => setTwitterInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchTwitterContent()}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchTwitterContent}
                    disabled={fetchingTwitter}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center"
                  >
                    {fetchingTwitter ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </motion.button>
                </div>
                {errors.twitter && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.twitter}</span>
                  </p>
                )}
              </motion.div>

              {/* LinkedIn */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="card bg-gradient-to-br from-blue-600/10 to-indigo-500/10 border-blue-600/20"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <LinkedInIcon className="w-8 h-8" />
                  <h3 className="text-xl font-bold text-white">LinkedIn</h3>
                  {linkedinContent.length > 0 && (
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-semibold">
                      {linkedinContent.length} posts
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Profile URL or username"
                    value={linkedinInput}
                    onChange={(e) => setLinkedinInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchLinkedInContent()}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchLinkedInContent}
                    disabled={fetchingLinkedin}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center"
                  >
                    {fetchingLinkedin ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </motion.button>
                </div>
                {errors.linkedin && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.linkedin}</span>
                  </p>
                )}
              </motion.div>
            </div>

            {/* Platform Tabs */}
            {getPublicContent().length > 0 && (
              <>
                <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                  {[
                    { id: 'all', label: 'All Content', icon: Globe, count: getPublicContent().length },
                    { id: 'youtube', label: 'YouTube', icon: Play, count: youtubeContent.length },
                    { id: 'instagram', label: 'Instagram', icon: ImageIcon, count: instagramContent.length },
                    { id: 'twitter', label: 'Twitter', icon: FileText, count: twitterContent.length },
                    { id: 'linkedin', label: 'LinkedIn', icon: Users, count: linkedinContent.length }
                  ].map((tab) => {
                    if (tab.count === 0 && tab.id !== 'all') return null
                    const Icon = tab.icon
                    return (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActivePlatform(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                          activePlatform === tab.id
                            ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/50'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                          <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                            {tab.count}
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Public Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getPublicContent().map((content, index) => (
                    <motion.div 
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="card bg-white/5 border-white/10 hover:border-primary-500/50 transition-all"
                    >
                      {content.thumbnail && (
                        <div className="relative mb-3 rounded-xl overflow-hidden">
                          <img src={content.thumbnail} alt={content.title} className="w-full h-48 object-cover" />
                          <div className="absolute top-2 right-2">
                            {content.type === 'youtube' && <YouTubeIcon className="w-6 h-6" />}
                            {content.type === 'instagram' && <InstagramIcon className="w-6 h-6" />}
                            {content.type === 'twitter' && <TwitterIcon className="w-6 h-6" />}
                            {content.type === 'linkedin' && <LinkedInIcon className="w-6 h-6" />}
                          </div>
                        </div>
                      )}
                      <h3 className="text-white font-semibold mb-2 line-clamp-2">{content.title}</h3>
                      {content.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{content.description}</p>
                      )}
                      {(content.views || content.likes) && (
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                          {content.views && (
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{formatNumber(content.views)}</span>
                            </div>
                          )}
                          {content.likes && (
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{formatNumber(content.likes)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="space-y-2">
                        {content.url && (
                          <a 
                            href={content.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm font-medium transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View on Platform</span>
                          </a>
                        )}
                        
                        {/* Invest in Video Button for YouTube */}
                        {content.type === 'youtube' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTokenizeVideo(content)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-white text-sm font-semibold transition-all"
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span>Invest in Video</span>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {uploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setUploadModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/20 p-6 max-w-2xl w-full"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Upload Premium Content</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Content Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Exclusive Web3 Tutorial - Part 1"
                      value={newContentTitle}
                      onChange={(e) => setNewContentTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      placeholder="Describe your exclusive content..."
                      value={newContentDescription}
                      onChange={(e) => setNewContentDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Content Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { type: 'video', icon: Video, label: 'Video' },
                        { type: 'image', icon: Image, label: 'Image' },
                        { type: 'document', icon: FileText, label: 'Document' }
                      ].map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          onClick={() => setNewContentType(type as any)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            newContentType === type
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                        >
                          <Icon className="w-8 h-8 text-white mx-auto mb-2" />
                          <div className="text-white text-sm font-medium">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Upload File *</label>
                    <input
                      type="file"
                      accept={newContentType === 'video' ? 'video/*' : newContentType === 'image' ? 'image/*' : '*/*'}
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white"
                    />
                    {uploadedFile && (
                      <p className="text-green-400 text-sm mt-2">✓ {uploadedFile.name}</p>
                    )}
                  </div>

                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <p className="text-sm text-gray-300">
                      <strong className="text-purple-400">Note:</strong> This content will be uploaded to CreatorVault and only accessible to your token holders.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setUploadModal(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadContent}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-semibold"
                  >
                    Upload Content
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Tokenize Modal */}
        <AnimatePresence>
          {tokenizeModal && selectedContent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setTokenizeModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-purple-500/50 p-6 max-w-md w-full"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Invest in Video</h3>
                    <p className="text-gray-400 text-sm">Create Investment Token</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 line-clamp-2">{selectedContent.title}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Token Price (ALGO) *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="5.00"
                      value={tokenPrice}
                      onChange={(e) => setTokenPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-gray-400 text-xs mt-1">Price per token for buyers</p>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Total Supply *</label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={tokenSupply}
                      onChange={(e) => setTokenSupply(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-gray-400 text-xs mt-1">Total number of tokens to create</p>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-300">
                          <strong className="text-green-400">Smart Contract:</strong> An Algorand ASA will be created. Only token holders can access this premium content on CreatorVault.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setTokenizeModal(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium"
                    disabled={isCreatingToken}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTokenize}
                    disabled={isCreatingToken}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-semibold disabled:opacity-50"
                  >
                    {isCreatingToken ? (
                      <span className="flex items-center justify-center space-x-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Creating Investment Token...</span>
                      </span>
                    ) : (
                      'Create Investment Token'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ContentTokenization
