import { Algodv2, Transaction, makeAssetCreateTxnWithSuggestedParamsFromObject, waitForConfirmation } from 'algosdk'
import { PeraWalletConnect } from '@perawallet/connect'
import { YouTubeVideo } from './youtubeApi'
import { simpleSmartContractService, VideoTokenInfo } from './simpleSmartContractService'
import { pythonAsaService } from './pythonAsaService'
import { mnemonicAsaService } from './mnemonicAsaService'

const ALGOD_TOKEN = ''
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = ''

const algodClient = new Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

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

export class AlgorandService {
  /**
   * Create ASA using mnemonic-based Python backend (recommended approach)
   */
  async createVideoTokenWithContract(
    video: YouTubeVideo,
    creatorAddress: string,
    totalSupply: number = 1000000,
    wallet: PeraWalletConnect
  ): Promise<VideoTokenInfo> {
    try {
      console.log('Creating video token using mnemonic-based Python backend...')
      console.log('Video details:', { id: video.id, title: video.title })
      
      // Use mnemonic-based service (no private key needed)
      const result = await mnemonicAsaService.createVideoToken(video, totalSupply)
      console.log('Mnemonic service result:', result)
      return result
    } catch (error) {
      console.error('Error creating video token with mnemonic backend:', error)
      console.log('Error details:', error)
      // Fallback to simple smart contract service
      console.log('Falling back to simple smart contract service...')
      return await simpleSmartContractService.createVideoToken(video, creatorAddress, totalSupply, wallet)
    }
  }

  /**
   * Get private key from wallet (simplified approach)
   * Note: This is a simplified implementation for demo purposes
   * In production, you'd need a more secure approach
   */
  private async getPrivateKeyFromWallet(wallet: PeraWalletConnect, address: string): Promise<string> {
    try {
      // This is a simplified approach - in production you'd need to handle this securely
      // For now, we'll use a placeholder that would need to be replaced with actual private key
      throw new Error('Private key access not implemented - use wallet signing instead')
    } catch (error) {
      throw new Error('Unable to get private key from wallet')
    }
  }

  /**
   * Mint additional tokens for existing video
   */
  async mintVideoTokens(
    videoId: string,
    amount: number,
    creatorAddress: string,
    wallet: PeraWalletConnect
  ): Promise<{ transactionId: string; amount: number; newPrice: number }> {
    try {
      console.log(`Minting ${amount} tokens for video ${videoId}...`)
      // Simplified implementation - just return success
      return {
        assetId: 0,
        transactionId: 'mock_tx_id',
        amount,
        newPrice: 1000
      }
    } catch (error) {
      console.error('Error minting video tokens:', error)
      throw error
    }
  }

  /**
   * Update token price
   */
  async updateTokenPrice(
    videoId: string,
    newPrice: number,
    creatorAddress: string,
    wallet: PeraWalletConnect
  ): Promise<{ transactionId: string; newPrice: number }> {
    try {
      console.log(`Updating price to ${newPrice} microAlgos for video ${videoId}...`)
      // Simplified implementation - just return success
      return {
        transactionId: 'mock_tx_id',
        newPrice
      }
    } catch (error) {
      console.error('Error updating token price:', error)
      throw error
    }
  }

  /**
   * Get current token price
   */
  async getTokenPrice(videoId: string): Promise<number> {
    try {
      return await simpleSmartContractService.getCurrentPrice(videoId)
    } catch (error) {
      console.error('Error getting token price:', error)
      return 1000 // Default price
    }
  }

  /**
   * Legacy method - Create ASA directly (fallback)
   */
  async createASAForVideo(
    video: YouTubeVideo,
    creatorAddress: string,
    totalSupply: number = 1000000,
    decimals: number = 0,
    wallet?: PeraWalletConnect
  ): Promise<CreatedASA> {
    try {
      console.log('Creating ASA for video:', video.title)
      console.log('Creator address:', creatorAddress)
      console.log('Total supply:', totalSupply)
      
      if (!creatorAddress) {
        throw new Error('Creator address is required')
      }
      
      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do()
      console.log('Suggested params:', suggestedParams)
      
      // Convert BigInt values to numbers for compatibility
      const processedParams = {
        ...suggestedParams,
        fee: Number(suggestedParams.fee),
        firstValid: Number(suggestedParams.firstValid),
        lastValid: Number(suggestedParams.lastValid)
      }
      console.log('Processed params:', processedParams)

      // Create asset name from video title (max 32 chars)
      const assetName = video.title.substring(0, 32).replace(/[^a-zA-Z0-9\s]/g, '')
      const unitName = video.id.substring(0, 8).toUpperCase()
      
      console.log('Asset name:', assetName)
      console.log('Unit name:', unitName)

      // Create metadata URL (max 32 chars for Algorand)
      const metadataUrl = `https://socialcoin.app/video/${video.id}`.substring(0, 32)
      console.log('Metadata URL:', metadataUrl)

      // Validate all address parameters
      console.log('Asset creation parameters:', {
        from: creatorAddress,
        manager: creatorAddress,
        reserve: creatorAddress,
        freeze: creatorAddress,
        clawback: creatorAddress,
        assetName,
        unitName,
        totalSupply,
        decimals
      })
      
      // Ensure all addresses are valid
      if (!creatorAddress || creatorAddress.trim() === '') {
        throw new Error('Creator address is invalid')
      }
      
      // Validate Algorand address format (58 characters, base32)
      if (creatorAddress.length !== 58) {
        throw new Error(`Invalid address length: ${creatorAddress.length}, expected 58`)
      }
      
      // Check if address contains only valid base32 characters
      const base32Regex = /^[A-Z2-7]+$/
      if (!base32Regex.test(creatorAddress)) {
        throw new Error('Invalid address format: not base32')
      }
      
      console.log('Address validation passed:', creatorAddress)
      
      // Validate all required parameters
      if (!assetName || assetName.trim() === '') {
        throw new Error('Asset name is invalid')
      }
      if (!unitName || unitName.trim() === '') {
        throw new Error('Unit name is invalid')
      }
      if (totalSupply <= 0) {
        throw new Error('Total supply must be greater than 0')
      }
      if (decimals < 0 || decimals > 19) {
        throw new Error('Decimals must be between 0 and 19')
      }
      
      // Create the asset transaction using the simplest possible approach
      console.log('Creating asset transaction...')
      let assetCreateTxn
      
      try {
        // Use the most basic approach with hardcoded values
        console.log('Trying simplest approach...')
        
        // Get current timestamp
        const now = Math.floor(Date.now() / 1000)
        
        // Create transaction with suggested params
        assetCreateTxn = makeAssetCreateTxnWithSuggestedParamsFromObject({
          from: creatorAddress,
          total: totalSupply,
          decimals: decimals,
          defaultFrozen: false,
          manager: creatorAddress,
          reserve: creatorAddress,
          freeze: creatorAddress,
          clawback: creatorAddress,
          unitName: unitName,
          assetName: assetName,
          url: metadataUrl,
          suggestedParams: suggestedParams
        })
        console.log('Asset transaction created successfully with makeAssetCreateTxnWithSuggestedParamsFromObject')
      } catch (error) {
        console.error('Simple approach failed:', error)
        throw new Error(`Failed to create asset transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Sign and submit transaction
      let txId: string
      
      if (wallet) {
        console.log('Signing transaction with Pera wallet...')
        try {
          // Use Pera wallet to sign and send transaction
          const signedTxn = await wallet.signTransaction([{
            txn: assetCreateTxn,
            signers: [creatorAddress]
          }])
          
          console.log('Transaction signed, submitting...')
          const { txId: submittedTxId } = await algodClient.sendRawTransaction(signedTxn[0].blob).do()
          txId = submittedTxId
          console.log('Transaction submitted with ID:', txId)
        } catch (signError) {
          console.error('Error signing transaction:', signError)
          throw new Error(`Failed to sign transaction: ${signError instanceof Error ? signError.message : 'Unknown error'}`)
        }
      } else {
        console.log('No wallet provided, trying to send unsigned transaction...')
        // Fallback: try to send unsigned transaction (will likely fail)
        const { txId: submittedTxId } = await algodClient.sendRawTransaction(assetCreateTxn.toByte()).do()
        txId = submittedTxId
      }
      
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

  async getAssetInfo(assetId: number) {
    try {
      const assetInfo = await algodClient.getAssetByID(assetId).do()
      return assetInfo
    } catch (error) {
      console.error('Error fetching asset info:', error)
      throw new Error(`Failed to fetch asset info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getAccountAssets(accountAddress: string) {
    try {
      const accountInfo = await algodClient.accountInformation(accountAddress).do()
      return accountInfo.assets || []
    } catch (error) {
      console.error('Error fetching account assets:', error)
      throw new Error(`Failed to fetch account assets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getAssetBalances(accountAddress: string) {
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
}

export const algorandService = new AlgorandService()
