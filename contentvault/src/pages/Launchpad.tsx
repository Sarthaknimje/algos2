import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Rocket, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Info,
  CheckCircle,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Zap
} from 'lucide-react'
import { usePeraWallet } from '../hooks/usePeraWallet'
import { TokenIcon, PeraWalletIcon } from '../assets/icons'

interface TokenFormData {
  name: string
  symbol: string
  description: string
  totalSupply: string
  initialPrice: string
  socialLinks: {
    youtube: string
    instagram: string
    twitter: string
  }
  profileImage: File | null
}

const Launchpad: React.FC = () => {
  const { isConnected, address, connectWallet, isLoading } = usePeraWallet()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLaunching, setIsLaunching] = useState(false)
  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    description: '',
    totalSupply: '1000000',
    initialPrice: '0.01',
    socialLinks: {
      youtube: '',
      instagram: '',
      twitter: ''
    },
    profileImage: null
  })

  const steps = [
    { id: 1, title: 'Token Details', description: 'Basic token information' },
    { id: 2, title: 'Social Links', description: 'Connect your platforms' },
    { id: 3, title: 'Launch Settings', description: 'Configure launch parameters' },
    { id: 4, title: 'Review & Launch', description: 'Final review and deployment' }
  ]

  const handleInputChange = (field: keyof TokenFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialLinkChange = (platform: keyof TokenFormData['socialLinks'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }))
    }
  }

  const handleLaunch = async () => {
    if (!isConnected) return
    
    setIsLaunching(true)
    // Simulate token launch process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsLaunching(false)
    setCurrentStep(4)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-white font-medium mb-2">Token Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., CreatorCoin"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Token Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                placeholder="e.g., CREATOR"
                maxLength={10}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your token and what it represents..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Profile Image</label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Upload your profile image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="profile-upload"
                />
                <label
                  htmlFor="profile-upload"
                  className="btn-secondary cursor-pointer"
                >
                  Choose File
                </label>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Connect Your Social Platforms</h3>
              <p className="text-gray-400">Link your social media accounts to verify your creator status</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">YouTube Channel URL</label>
                <input
                  type="url"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Instagram Profile URL</label>
                <input
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourusername"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Twitter Profile URL</label>
                <input
                  type="url"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourusername"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Launch Configuration</h3>
              <p className="text-gray-400">Set up your token's initial parameters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Total Supply</label>
                <input
                  type="number"
                  value={formData.totalSupply}
                  onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                  placeholder="1000000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <p className="text-gray-400 text-sm mt-1">Total number of tokens to be created</p>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Initial Price (ALGO)</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.initialPrice}
                  onChange={(e) => handleInputChange('initialPrice', e.target.value)}
                  placeholder="0.01"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <p className="text-gray-400 text-sm mt-1">Starting price per token in ALGO</p>
              </div>
            </div>

            <div className="card">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary-400" />
                Launch Fees & Rewards
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Platform Launch Fee</span>
                  <span className="text-white">2.5 ALGO</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Your Trading Fee Share</span>
                  <span className="text-green-400">85%</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Platform Trading Fee Share</span>
                  <span className="text-gray-400">15%</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-white font-medium">
                    <span>Estimated Monthly Earnings*</span>
                    <span className="text-green-400">$500 - $5,000</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">*Based on average trading volume</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Token Launch Successful!</h3>
              <p className="text-gray-400">Your token has been deployed to the Algorand blockchain</p>
            </div>

            <div className="card">
              <h4 className="text-white font-semibold mb-4">Token Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Name</span>
                  <span className="text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Symbol</span>
                  <span className="text-white">{formData.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Supply</span>
                  <span className="text-white">{Number(formData.totalSupply).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Initial Price</span>
                  <span className="text-white">{formData.initialPrice} ALGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract Address</span>
                  <span className="text-primary-400 font-mono text-sm">0x1234...5678</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary flex-1 flex items-center justify-center space-x-2">
                <LinkIcon className="w-5 h-5" />
                <span>Share Your Token</span>
              </button>
              <button className="btn-secondary flex-1 flex items-center justify-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>View Trading</span>
              </button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            You need to connect your Pera wallet to launch a token. This ensures you have the necessary permissions and ALGO for transaction fees.
          </p>
          <button 
            onClick={connectWallet}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2 mx-auto disabled:opacity-50"
          >
            <PeraWalletIcon className="w-5 h-5" />
            <span>{isLoading ? 'Connecting...' : 'Connect Wallet to Continue'}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Launch Your <span className="gradient-text">Token</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Create and deploy your own token in minutes. Start earning from trading fees immediately.
            </p>
          </motion.div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="card">
          {renderStepContent()}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep === 3 ? (
                <button
                  onClick={handleLaunch}
                  disabled={isLaunching}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isLaunching ? (
                    <>
                      <div className="loading-dots w-4 h-4">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <span>Launching...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Launch Token</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  className="btn-primary"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Launchpad
