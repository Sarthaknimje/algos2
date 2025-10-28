import { Algodv2, makeAssetCreateTxnWithSuggestedParamsFromObject, makeAssetTransferTxnWithSuggestedParamsFromObject, waitForConfirmation, encodeUint64, Transaction } from 'algosdk'
import { PeraWalletConnect } from '@perawallet/connect'
import { YouTubeVideo } from './youtubeApi'

// Contract configuration
const CONTRACT_APP_ID = 745679244 // Deployed contract App ID
const ALGOD_TOKEN = ''
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = ''

const algodClient = new Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

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

export interface MintResult {
  assetId: number
  transactionId: string
  amount: number
  newPrice: number
}

class SimpleSmartContractService {
  private appId: number

  constructor(appId: number) {
    this.appId = appId
  }

  /**
   * Create a new video token ASA (simplified version)
   */
  async createVideoToken(
    video: YouTubeVideo,
    creatorAddress: string,
    totalSupply: number = 1000000,
    wallet: PeraWalletConnect
  ): Promise<VideoTokenInfo> {
    try {
      console.log('Creating video token (simplified version)...')
      console.log('Creator address:', creatorAddress)
      console.log('Address type:', typeof creatorAddress)
      console.log('Address length:', creatorAddress?.length)
      console.log('Address is string:', typeof creatorAddress === 'string')
      console.log('Address is not empty:', creatorAddress && creatorAddress.length > 0)
      
      // Validate address - more comprehensive checks
      if (!creatorAddress) {
        throw new Error('Creator address is null or undefined')
      }
      
      if (typeof creatorAddress !== 'string') {
        throw new Error(`Creator address is not a string: ${typeof creatorAddress}`)
      }
      
      if (creatorAddress.length === 0) {
        throw new Error('Creator address is empty')
      }
      
      if (creatorAddress.length !== 58) {
        throw new Error(`Creator address length is ${creatorAddress.length}, expected 58 characters`)
      }
      
      // Check if address looks like a valid Algorand address
      if (!creatorAddress.match(/^[A-Z2-7]{58}$/)) {
        throw new Error(`Creator address does not match Algorand address format: ${creatorAddress}`)
      }
      
      // Additional validation for common issues
      if (creatorAddress === 'null' || creatorAddress === 'undefined') {
        throw new Error('Creator address is the string "null" or "undefined"')
      }
      
      // Get suggested parameters
      const sp = await algodClient.getTransactionParams().do()
      console.log('Network parameters received:', sp)
      
      // Prepare asset parameters following official Algorand documentation
      const unitName = video.id ? video.id.substring(0, 8).toUpperCase() : 'VIDEO'
      const assetName = video.title ? video.title.substring(0, 32).replace(/[^a-zA-Z0-9\s]/g, '') : 'Video Token'
      const metadataUrl = video.id ? `https://socialcoin.app/video/${video.id}` : 'https://socialcoin.app'
      
      // Validate parameters
      if (!unitName || unitName.length === 0) {
        throw new Error('Unit name is null or empty')
      }
      if (!assetName || assetName.length === 0) {
        throw new Error('Asset name is null or empty')
      }
      if (!metadataUrl || metadataUrl.length === 0) {
        throw new Error('Metadata URL is null or empty')
      }
      
      console.log('Asset parameters:', {
        unitName,
        assetName,
        metadataUrl,
        totalSupply,
        creatorAddress
      })
      
      // Convert BigInt values to numbers for compatibility
      const processedParams = {
        ...sp,
        fee: Number(sp.fee),
        firstValid: Number(sp.firstValid),
        lastValid: Number(sp.lastValid)
      }
      console.log('Processed parameters:', processedParams)
      
      // Create asset using makeAssetCreateTxnWithSuggestedParamsFromObject following official documentation
      console.log('Creating asset using makeAssetCreateTxnWithSuggestedParamsFromObject...')
      
      // Use makeAssetCreateTxnWithSuggestedParamsFromObject with proper error handling
      console.log('Creating asset using makeAssetCreateTxnWithSuggestedParamsFromObject...')
      
      let assetCreateTxn
      try {
        // First try with the original suggested params
        assetCreateTxn = makeAssetCreateTxnWithSuggestedParamsFromObject({
          from: creatorAddress,
          total: totalSupply,
          decimals: 0,
          defaultFrozen: false,
          manager: creatorAddress,
          reserve: creatorAddress,
          freeze: creatorAddress,
          clawback: creatorAddress,
          unitName: unitName,
          assetName: assetName,
          url: metadataUrl,
          suggestedParams: sp
        })
        console.log('Asset transaction created successfully with original params')
      } catch (error) {
        console.log('Original params failed, trying with processed params...', error)
        
        // Fallback with processed params
        assetCreateTxn = makeAssetCreateTxnWithSuggestedParamsFromObject({
          from: creatorAddress,
          total: totalSupply,
          decimals: 0,
          defaultFrozen: false,
          manager: creatorAddress,
          reserve: creatorAddress,
          freeze: creatorAddress,
          clawback: creatorAddress,
          unitName: unitName,
          assetName: assetName,
          url: metadataUrl,
          suggestedParams: processedParams
        })
        console.log('Asset transaction created successfully with processed params')
      }
      
      console.log('Asset transaction created successfully')

      // Sign and submit transaction
      console.log('Signing transaction with Pera wallet...')
      const signedTxn = await wallet.signTransaction([{
        txn: assetCreateTxn,
        signers: [creatorAddress]
      }])
      console.log('Transaction signed successfully')

      console.log('Submitting transaction to network...')
      const { txId } = await algodClient.sendRawTransaction(signedTxn[0].blob).do()
      console.log('Transaction submitted with ID:', txId)
      
      console.log('Waiting for confirmation...')
      const result = await waitForConfirmation(algodClient, txId, 4)
      console.log('Transaction confirmed in round:', result['confirmed-round'])

      const assetId = result['assetIndex']

      console.log('Video token created successfully:', { assetId, txId })

      // The asset is created with the full supply already minted to the creator
      // No additional minting transaction is needed as per Algorand documentation
      console.log('Asset created with full supply minted to creator')

      return {
        appId: this.appId,
        assetId,
        videoId: video.id,
        videoTitle: video.title,
        videoUrl: `https://socialcoin.app/video/${video.id}`,
        totalSupply,
        mintedSupply: totalSupply, // Full supply is minted to creator
        currentPrice: 1000, // Initial price in microAlgos
        creator: creatorAddress
      }

    } catch (error) {
      console.error('Error creating video token:', error)
      throw new Error(`Failed to create video token: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
   * Transfer assets between accounts (for trading)
   */
  async transferAssets(
    fromAddress: string,
    toAddress: string,
    assetId: number,
    amount: number,
    wallet: PeraWalletConnect
  ): Promise<{ transactionId: string; amount: number }> {
    try {
      console.log(`Transferring ${amount} of asset ${assetId} from ${fromAddress} to ${toAddress}`)
      
      // Get suggested parameters
      const sp = await algodClient.getTransactionParams().do()
      
      // Create asset transfer transaction following official documentation
      const transferTxn = makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: fromAddress,
        to: toAddress,
        amount: amount,
        assetIndex: assetId,
        suggestedParams: sp
      })
      
      console.log('Signing transfer transaction...')
      const signedTxn = await wallet.signTransaction([{
        txn: transferTxn,
        signers: [fromAddress]
      }])
      
      console.log('Submitting transfer transaction...')
      const { txId } = await algodClient.sendRawTransaction(signedTxn[0].blob).do()
      console.log('Transfer transaction submitted with ID:', txId)
      
      console.log('Waiting for confirmation...')
      const result = await waitForConfirmation(algodClient, txId, 4)
      console.log('Transfer confirmed in round:', result['confirmed-round'])
      
      return {
        transactionId: txId,
        amount: amount
      }
      
    } catch (error) {
      console.error('Error transferring assets:', error)
      throw new Error(`Failed to transfer assets: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
export const simpleSmartContractService = new SimpleSmartContractService(CONTRACT_APP_ID)
