import { useState, useCallback, useEffect } from 'react'
import { youtubeApi, YouTubeChannel, YouTubeVideo } from '../services/youtubeApi'
import { youtubeAuth, YouTubeAuthState } from '../services/youtubeAuth'
import { algorandService, CreatedASA } from '../services/algorandService'
import { VideoTokenInfo } from '../services/smartContractService'

interface YouTubeDataState {
  channel: YouTubeChannel | null
  videos: YouTubeVideo[]
  isLoading: boolean
  error: string | null
  createdASAs: CreatedASA[]
  videoTokens: VideoTokenInfo[]
  isAuthenticated: boolean
  authState: YouTubeAuthState | null
}

export const useYouTubeData = () => {
  const [state, setState] = useState<YouTubeDataState>({
    channel: null,
    videos: [],
    isLoading: false,
    error: null,
    createdASAs: [],
    videoTokens: [],
    isAuthenticated: false,
    authState: null
  })

  // Check authentication status on mount
  useEffect(() => {
    const authState = youtubeAuth.getAuthState()
    if (authState.isAuthenticated) {
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        authState,
        channel: {
          id: authState.channelId!,
          title: authState.channelName!,
          description: '',
          thumbnail: authState.channelThumbnail!,
          subscriberCount: 0,
          videoCount: 0,
          viewCount: 0
        }
      }))
      
      // Load channel details and videos
      loadChannelData()
    }
  }, [])

  const loadChannelData = useCallback(async () => {
    if (!youtubeAuth.isAuthenticated()) return
    
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Get full channel details
      const channel = await youtubeApi.getMyChannelInfo()
      
      // Get user's videos
      const videos = await youtubeApi.getMyVideos(20)

      setState(prev => ({
        ...prev,
        channel,
        videos,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load channel data'
      }))
    }
  }, [])

  const authenticateWithYouTube = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Redirect to YouTube OAuth
      const authUrl = youtubeAuth.getAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start authentication'
      }))
    }
  }, [])

  const handleOAuthCallback = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const authState = await youtubeAuth.handleCallback(code)
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        authState,
        channel: {
          id: authState.channelId!,
          title: authState.channelName!,
          description: '',
          thumbnail: authState.channelThumbnail!,
          subscriberCount: 0,
          videoCount: 0,
          viewCount: 0
        },
        isLoading: false,
        error: null
      }))
      
      // Load full channel data
      await loadChannelData()
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to authenticate with YouTube'
      }))
    }
  }, [loadChannelData])

  const disconnectChannel = useCallback(() => {
    youtubeAuth.disconnect()
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      authState: null,
      channel: null,
      videos: [],
      error: null
    }))
  }, [])

  const searchVideos = useCallback(async (query: string) => {
    if (!youtubeAuth.isAuthenticated()) {
      throw new Error('Please authenticate with YouTube first')
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const videos = await youtubeApi.searchMyVideos(query, 20)
      
      setState(prev => ({
        ...prev,
        videos,
        isLoading: false,
        error: null
      }))

      return videos
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to search videos'
      }))
      throw error
    }
  }, [])

  const createVideoToken = useCallback(async (
    video: YouTubeVideo,
    creatorAddress: string,
    totalSupply: number = 1000000,
    wallet?: any
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      console.log('🎬 Creating video token using MOCK implementation...')
      console.log('Video:', video.title)
      console.log('Creator address (for reference):', creatorAddress)
      console.log('Total supply:', totalSupply)
      
      // Always use mock implementation - no backend required
      const videoToken = await algorandService.createVideoTokenWithContract(
        video,
        creatorAddress || 'MOCK_CREATOR_ADDRESS',
        totalSupply,
        wallet
      )

      console.log('✅ Mock video token created successfully:', videoToken)

      setState(prev => ({
        ...prev,
        videoTokens: [...prev.videoTokens, videoToken],
        isLoading: false,
        error: null
      }))

      return videoToken
    } catch (error) {
      console.error('❌ Failed to create video token:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create video token'
      }))
      throw error
    }
  }, [])

  const mintVideoTokens = useCallback(async (
    videoId: string,
    amount: number,
    creatorAddress: string,
    wallet: any
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await algorandService.mintVideoTokens(
        videoId,
        amount,
        creatorAddress,
        wallet
      )

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }))

      return result
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to mint tokens'
      }))
      throw error
    }
  }, [])

  const updateTokenPrice = useCallback(async (
    videoId: string,
    newPrice: number,
    creatorAddress: string,
    wallet: any
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await algorandService.updateTokenPrice(
        videoId,
        newPrice,
        creatorAddress,
        wallet
      )

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }))

      return result
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update price'
      }))
      throw error
    }
  }, [])

  const getVideoInfo = useCallback(async (videoId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const video = await youtubeApi.getVideoInfo(videoId)
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }))

      return video
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get video info'
      }))
      throw error
    }
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    authenticateWithYouTube,
    handleOAuthCallback,
    disconnectChannel,
    loadChannelData,
    searchVideos,
    createVideoToken,
    mintVideoTokens,
    updateTokenPrice,
    getVideoInfo,
    clearError
  }
}
