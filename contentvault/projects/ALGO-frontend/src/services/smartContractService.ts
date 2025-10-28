import { Algodv2, makeApplicationNoOpTxn, makeAssetCreateTxn, waitForConfirmation, encodeUint64, Transaction } from 'algosdk'
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

class SmartContractService {
  private appId: number

  constructor(appId: number) {
    this.appId = appId
  }

  /**
   * Create a new video token ASA through the smart contract
   */
  async createVideoToken(
    video: YouTubeVideo,
    creatorAddress: string,
    totalSupply: number = 1000000,
    wallet: PeraWalletConnect
  ): Promise<VideoTokenInfo> {
    try {
      console.log('Creating video token through smart contract...')
      
      // Get suggested parameters
      const params = await algodClient.getTransactionParams().do()
      
      // Create the ASA first
      const assetCreateTxn = makeAssetCreateTxn(

        
        creatorAddress,
        1000, // fee
        params.firstValid,
        params.lastValid,
        params.genesisHash,
        params.genesisID,
        totalSupply,
        0, // decimals
        false, // defaultFrozen
        creatorAddress, // manager
        creatorAddress, // reserve
        creatorAddress, // freeze
        creatorAddress, // clawback
        video.id.substring(0, 8).toUpperCase(), // unitName
        video.title.substring(0, 32), // assetName
        `https://socialcoin.app/video/${video.id}` // url
      )

      // Create application call to initialize the token
      const appCallTxn = makeApplicationNoOpTxn(
        creatorAddress,
        params,
        this.appId,
        [new TextEncoder().encode('create_asa')],
        [new TextEncoder().encode(video.id), new TextEncoder().encode(video.title), new TextEncoder().encode(`https://socialcoin.app/video/${video.id}`), encodeUint64(totalSupply)]
      )

      // Group transactions
      const txnGroup = [assetCreateTxn, appCallTxn]
      
      // Sign transactions with Pera wallet
      const signedTxns = await wallet.signTransaction([{
        txn: txnGroup[0],
        signers: [creatorAddress]
      }, {
        txn: txnGroup[1],
        signers: [creatorAddress]
      }])

      // Submit transactions
      const { txId } = await algodClient.sendRawTransaction(signedTxns[0].blob).do()
      const { txId: appTxId } = await algodClient.sendRawTransaction(signedTxns[1].blob).do()

      // Wait for confirmation
      const assetResult = await waitForConfirmation(algodClient, txId, 4)
      const appResult = await waitForConfirmation(algodClient, appTxId, 4)

      const assetId = assetResult['asset-index']

      console.log('Video token created successfully:', { assetId, appTxId })

      return {
        appId: this.appId,
        assetId,
        videoId: video.id,
        videoTitle: video.title,
        videoUrl: `https://socialcoin.app/video/${video.id}`,
        totalSupply,
        mintedSupply: 0,
        currentPrice: 1000, // Initial price in microAlgos
        creator: creatorAddress
      }

    } catch (error) {
      console.error('Error creating video token:', error)
      throw new Error(`Failed to create video token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Mint tokens for a video
   */
  async mintTokens(
    videoId: string,
    amount: number,
    creatorAddress: string,
    wallet: PeraWalletConnect
  ): Promise<MintResult> {
    try {
      console.log(`Minting ${amount} tokens for video ${videoId}...`)
      
      const params = await algodClient.getTransactionParams().do()
      
      // Create application call to mint tokens
      const mintTxn = makeApplicationNoOpTxn(
        creatorAddress,
        params,
        this.appId,
        [new TextEncoder().encode('mint')],
        [encodeUint64(amount)]
      )

      // Sign and submit transaction
      const signedTxn = await wallet.signTransaction([{
        txn: mintTxn,
        signers: [creatorAddress]
      }])

      const { txId } = await algodClient.sendRawTransaction(signedTxn[0].blob).do()
      const result = await waitForConfirmation(algodClient, txId, 4)

      console.log('Tokens minted successfully:', txId)

      return {
        assetId: 0, // This would be the actual asset ID
        transactionId: txId,
        amount,
        newPrice: 1000 // This would be fetched from contract
      }

    } catch (error) {
      console.error('Error minting tokens:', error)
      throw new Error(`Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update token price
   */
  async updatePrice(
    videoId: string,
    newPrice: number,
    creatorAddress: string,
    wallet: PeraWalletConnect
  ): Promise<{ transactionId: string; newPrice: number }> {
    try {
      console.log(`Updating price to ${newPrice} microAlgos for video ${videoId}...`)
      
      const params = await algodClient.getTransactionParams().do()
      
      // Create application call to update price
      const updatePriceTxn = makeApplicationNoOpTxn(
        creatorAddress,
        params,
        this.appId,
        [new TextEncoder().encode('update_price')],
        [encodeUint64(newPrice)]
      )

      // Sign and submit transaction
      const signedTxn = await wallet.signTransaction([{
        txn: updatePriceTxn,
        signers: [creatorAddress]
      }])

      const { txId } = await algodClient.sendRawTransaction(signedTxn[0].blob).do()
      const result = await waitForConfirmation(algodClient, txId, 4)

      console.log('Price updated successfully:', txId)

      return {
        transactionId: txId,
        newPrice
      }

    } catch (error) {
      console.error('Error updating price:', error)
      throw new Error(`Failed to update price: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get current token price
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
   * Get token information
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
export const smartContractService = new SmartContractService(CONTRACT_APP_ID)
