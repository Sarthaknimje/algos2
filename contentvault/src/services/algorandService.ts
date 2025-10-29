import { Algodv2, Transaction, makeAssetCreateTxnWithSuggestedParamsFromObject, waitForConfirmation } from 'algosdk'
import { YouTubeVideo } from './youtubeApi'

/**
 * Algorand node configuration
 * Using public Algonode testnet endpoint
 */
const ALGOD_TOKEN = ''
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = ''

const algodClient: Algodv2 = new Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

export interface ASACreationParams {
  creator: string
  totalSupply: number
  decimals: number
  unitName: string
  assetName: string
  url: string
  metadataHash?: string
  manager?: string
  reserve?: string
  freeze?: string
  clawback?: string
}

export interface CreatedASA {
  assetId: number
  transactionId: string
  assetName: string
  unitName: string
  totalSupply: number
  decimals: number
  creator: string
  url: string
}

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
  transactionId: string
  assetName: string
  unitName: string
  url: string
  decimals: number
}

/**
 * Asset balance information for a specific account
 */
export interface AssetBalance {
  assetId: number
  amount: number
  name: string
  unitName: string
  decimals: number
  totalSupply: number
  creator: string
  url: string
}

/**
 * Algorand account asset holding
 */
export interface AccountAsset {
  'asset-id': number
  amount: number
  'is-frozen'?: boolean
}

/**
 * Service class for interacting with Algorand blockchain
 * Handles ASA creation, asset management, and account queries
 */
export class AlgorandService {
  /**
   * Create a generic Algorand Standard Asset (for creator tokens)
   * @param params - Asset creation parameters
   * @returns Promise resolving to the created asset ID
   * @throws Error if asset creation fails
   */
  async createAsset(params: {
    creator: string
    assetName: string
    unitName: string
    total: bigint
    decimals: number
    defaultFrozen: boolean
    manager?: string
    reserve?: string
    freeze?: string
    clawback?: string
    url?: string
    metadataHash?: Uint8Array
  }): Promise<number> {
    try {
      console.log('Creating ASA with params:', params)
      
      // This is a placeholder - in production, you'd need to:
      // 1. Get suggested params from Algorand
      // 2. Create the transaction
      // 3. Sign it with Pera Wallet
      // 4. Submit it to the network
      // 5. Wait for confirmation
      
      // For now, return a mock ASA ID
      const mockAsaId = Math.floor(Math.random() * 1000000000) + 100000000
      
      console.log('✅ ASA Created (mock) with ID:', mockAsaId)
      
      // TODO: Implement real ASA creation with Pera Wallet signing
      // const suggestedParams = await algodClient.getTransactionParams().do()
      // const assetCreateTxn = makeAssetCreateTxnWithSuggestedParamsFromObject({
      //   from: params.creator,
      //   suggestedParams,
      //   ...params
      // })
      // Sign with Pera Wallet and submit
      
      return mockAsaId
    } catch (error) {
      console.error('Error creating ASA:', error)
      throw new Error(`Failed to create ASA: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create an ASA for a YouTube video
   * @param video - YouTube video data
   * @param creatorAddress - Creator's Algorand address
   * @param totalSupply - Total token supply (default: 1,000,000)
   * @param decimals - Number of decimal places (default: 0)
   * @returns Promise resolving to created ASA information
   * @throws Error if ASA creation fails
   */
  async createASAForVideo(
    video: YouTubeVideo,
    creatorAddress: string,
    totalSupply: number = 1000000,
    decimals: number = 0
  ): Promise<CreatedASA> {
    try {
      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Create asset name from video title (max 32 chars)
      const assetName = video.title.substring(0, 32).replace(/[^a-zA-Z0-9\s]/g, '')
      const unitName = video.id.substring(0, 8).toUpperCase()

      // Create metadata URL
      const metadataUrl = `https://socialcoin.app/video/${video.id}`

      // Create the asset
      const assetCreateTxn = makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: creatorAddress,
        suggestedParams,
        total: totalSupply,
        decimals: decimals,
        defaultFrozen: false,
        unitName: unitName,
        assetName: assetName,
        url: metadataUrl,
        manager: creatorAddress,
        reserve: creatorAddress,
        freeze: creatorAddress,
        clawback: creatorAddress,
        note: new Uint8Array(Buffer.from(`YouTube Video Token: ${video.title}`))
      })

      // Sign and submit transaction
      const { txId } = await algodClient.sendRawTransaction(assetCreateTxn.toByte()).do()
      
      // Wait for confirmation
      const confirmedTxn = await waitForConfirmation(algodClient, txId, 4)
      const assetId = confirmedTxn['asset-index']

      return {
        assetId,
        transactionId: txId,
        assetName,
        unitName,
        totalSupply,
        decimals,
        creator: creatorAddress,
        url: metadataUrl
      }
    } catch (error) {
      console.error('Error creating ASA:', error)
      throw new Error(`Failed to create ASA: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get detailed information about a specific asset
   * @param assetId - The asset ID to query
   * @returns Promise resolving to asset information
   * @throws Error if asset query fails
   */
  async getAssetInfo(assetId: number): Promise<any> {
    try {
      const assetInfo = await algodClient.getAssetByID(assetId).do()
      return assetInfo
    } catch (error) {
      console.error('Error fetching asset info:', error)
      throw new Error(`Failed to fetch asset info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all assets held by an account
   * @param accountAddress - The account address to query
   * @returns Promise resolving to array of account assets
   * @throws Error if account query fails
   */
  async getAccountAssets(accountAddress: string): Promise<AccountAsset[]> {
    try {
      const accountInfo = await algodClient.accountInformation(accountAddress).do()
      return accountInfo.assets || []
    } catch (error) {
      console.error('Error fetching account assets:', error)
      throw new Error(`Failed to fetch account assets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get detailed balance information for all assets held by an account
   * @param accountAddress - The account address to query
   * @returns Promise resolving to array of asset balances with full details
   * @throws Error if balance query fails
   */
  async getAssetBalances(accountAddress: string): Promise<AssetBalance[]> {
    try {
      const accountInfo = await algodClient.accountInformation(accountAddress).do()
      const assets = accountInfo.assets || []
      
      // Get detailed info for each asset
      const assetBalances = await Promise.all(
        assets.map(async (asset: any) => {
          try {
            const assetInfo = await this.getAssetInfo(asset['asset-id'])
            return {
              assetId: asset['asset-id'],
              amount: asset.amount,
              name: assetInfo.params.name,
              unitName: assetInfo.params['unit-name'],
              decimals: assetInfo.params.decimals,
              totalSupply: assetInfo.params.total,
              creator: assetInfo.params.creator,
              url: assetInfo.params.url
            }
          } catch (error) {
            console.error(`Error fetching asset ${asset['asset-id']}:`, error)
            return {
              assetId: asset['asset-id'],
              amount: asset.amount,
              name: 'Unknown',
              unitName: 'UNK',
              decimals: 0,
              totalSupply: 0,
              creator: '',
              url: ''
            }
          }
        })
      )

      return assetBalances
    } catch (error) {
      console.error('Error fetching asset balances:', error)
      throw new Error(`Failed to fetch asset balances: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a video token using REAL Python backend
   */
  async createVideoToken(
    video: YouTubeVideo,
    creatorAddress: string,
    totalSupply: number = 1000000
  ): Promise<VideoTokenInfo> {
    try {
      console.log('🎬 Creating video token using REAL Python backend...')
      console.log('Video:', video.title)
      console.log('Creator address (for reference):', creatorAddress)
      console.log('Total supply:', totalSupply)
      
      // Import the Python backend service
      const { pythonBackendService } = await import('./pythonBackendService')
      
      // Check if Python backend is healthy
      const isHealthy = await pythonBackendService.healthCheck()
      if (!isHealthy) {
        throw new Error('Python backend is not available. Please start the backend server.')
      }
      
      // Create the video token using Python backend
      const videoTokenInfo = await pythonBackendService.createVideoToken(video, totalSupply)
      
      console.log('✅ Real video token created successfully:', videoTokenInfo)
      return videoTokenInfo

    } catch (error) {
      console.error('❌ Error creating real video token:', error)
      throw new Error(`Failed to create video token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const algorandService = new AlgorandService()
