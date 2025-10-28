/**
 * Python ASA Service Integration
 * Communicates with Python FastAPI backend for asset operations
 */

import { YouTubeVideo } from './youtubeApi'

const API_BASE_URL = 'http://localhost:8000'

export interface VideoTokenInfo {
  appId: number
  assetId: number
  videoId: string
  videoTitle: string
  videoUrl: string
  totalSupply: number
  mintedSupply: number
  currentPrice: number
  creator: string
}

export interface CreateVideoTokenRequest {
  creator_private_key: string
  video_id: string
  video_title: string
  total_supply: number
}

export interface TransferAssetRequest {
  sender_private_key: string
  receiver_address: string
  asset_id: number
  amount: number
}

export interface OptInRequest {
  account_private_key: string
  asset_id: number
}

class PythonASAService {
  private appId: number

  constructor(appId: number) {
    this.appId = appId
  }

  /**
   * Create a video token using Python backend
   */
  async createVideoToken(
    video: YouTubeVideo,
    creatorPrivateKey: string,
    totalSupply: number = 1000000
  ): Promise<VideoTokenInfo> {
    try {
      console.log('Creating video token using Python backend...')
      
      const request: CreateVideoTokenRequest = {
        creator_private_key: creatorPrivateKey,
        video_id: video.id,
        video_title: video.title,
        total_supply: totalSupply
      }

      const response = await fetch(`${API_BASE_URL}/create-video-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create video token')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error('Failed to create video token')
      }

      const data = result.data
      console.log('Video token created successfully:', data)

      return {
        appId: this.appId,
        assetId: data.asset_id,
        videoId: data.video_id,
        videoTitle: data.video_title,
        videoUrl: data.video_url,
        totalSupply: data.total_supply,
        mintedSupply: data.minted_supply,
        currentPrice: data.current_price,
        creator: data.creator
      }

    } catch (error) {
      console.error('Error creating video token:', error)
      throw new Error(`Failed to create video token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Transfer assets between accounts
   */
  async transferAssets(
    senderPrivateKey: string,
    receiverAddress: string,
    assetId: number,
    amount: number
  ): Promise<{ transactionId: string; amount: number }> {
    try {
      console.log(`Transferring ${amount} of asset ${assetId} to ${receiverAddress}`)
      
      const request: TransferAssetRequest = {
        sender_private_key: senderPrivateKey,
        receiver_address: receiverAddress,
        asset_id: assetId,
        amount: amount
      }

      const response = await fetch(`${API_BASE_URL}/transfer-asset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to transfer assets')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error('Failed to transfer assets')
      }

      const data = result.data
      console.log('Assets transferred successfully:', data)

      return {
        transactionId: data.transaction_id,
        amount: data.amount
      }

    } catch (error) {
      console.error('Error transferring assets:', error)
      throw new Error(`Failed to transfer assets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Opt-in to receive an asset
   */
  async optInAsset(
    accountPrivateKey: string,
    assetId: number
  ): Promise<{ transactionId: string }> {
    try {
      console.log(`Opting in to asset ${assetId}`)
      
      const request: OptInRequest = {
        account_private_key: accountPrivateKey,
        asset_id: assetId
      }

      const response = await fetch(`${API_BASE_URL}/opt-in-asset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to opt-in to asset')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error('Failed to opt-in to asset')
      }

      const data = result.data
      console.log('Opted in to asset successfully:', data)

      return {
        transactionId: data.transaction_id
      }

    } catch (error) {
      console.error('Error opting in to asset:', error)
      throw new Error(`Failed to opt-in to asset: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get asset information
   */
  async getAssetInfo(assetId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/asset-info/${assetId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get asset info')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error('Failed to get asset info')
      }

      return result.data

    } catch (error) {
      console.error('Error getting asset info:', error)
      throw new Error(`Failed to get asset info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get account assets
   */
  async getAccountAssets(accountAddress: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/account-assets/${accountAddress}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get account assets')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error('Failed to get account assets')
      }

      return result.data

    } catch (error) {
      console.error('Error getting account assets:', error)
      throw new Error(`Failed to get account assets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get current token price (mock implementation)
   */
  async getCurrentPrice(videoId: string): Promise<number> {
    try {
      // This would query the smart contract for current price
      // For now, return a mock price
      return 1000
    } catch (error) {
      console.error('Error getting current price:', error)
      return 1000
    }
  }

  /**
   * Get token information (mock implementation)
   */
  async getTokenInfo(videoId: string): Promise<VideoTokenInfo | null> {
    try {
      // This would query the smart contract for token info
      // For now, return null
      return null
    } catch (error) {
      console.error('Error getting token info:', error)
      return null
    }
  }
}

// Export singleton instance
export const pythonAsaService = new PythonASAService(745679244)
