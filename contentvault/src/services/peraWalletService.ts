import algosdk from 'algosdk'
import { PeraWalletConnect } from '@perawallet/connect'

const ALGOD_TOKEN = ''
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = ''

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

/**
 * Helper function to convert string to Uint8Array
 */
function stringToUint8Array(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, 'utf-8'))
}

/**
 * Create ASA (Algorand Standard Asset) using Pera Wallet
 * Opens Pera Wallet popup for user to sign transaction
 */
export async function createASAWithPera({
  sender,           // User's Algorand address
  peraWallet,       // Pera Wallet instance
  assetName,
  unitName,
  totalSupply,
  decimals = 0,
  url = '',
  manager = '',
  reserve = '',
  freeze = '',
  clawback = ''
}: {
  sender: string
  peraWallet: PeraWalletConnect
  assetName: string
  unitName: string
  totalSupply: number
  decimals?: number
  url?: string
  manager?: string
  reserve?: string
  freeze?: string
  clawback?: string
}): Promise<{ txId: string; assetId: number }> {
  try {
    // 1️⃣ Get transaction params from Algorand
    const params = await algodClient.getTransactionParams().do()

    // 2️⃣ Create ASA transaction
    // Ensure totalSupply is a safe integer
    const safeTotalSupply = Math.round(totalSupply)
    if (!Number.isSafeInteger(safeTotalSupply)) {
      throw new Error(`Total supply ${totalSupply} is not a safe integer`)
    }
    if (safeTotalSupply <= 0) {
      throw new Error(`Total supply must be greater than 0`)
    }
    
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: sender,                    // ⚠️ IMPORTANT: Use "sender" not "from"
      suggestedParams: params,
      total: safeTotalSupply,
      decimals: decimals,
      defaultFrozen: false,
      unitName: unitName,
      assetName: assetName,
      url: url || undefined,
      manager: manager || sender,
      reserve: reserve || sender,
      freeze: freeze || sender,
      clawback: clawback || sender
    })

    // 3️⃣ Sign with Pera Wallet (opens Pera Wallet app)
    const singleTxnGroups = [{
      txn: txn,
      signers: [sender]
    }]

    const signedTxn = await peraWallet.signTransaction([singleTxnGroups])

    // 4️⃣ Extract signed transaction (Pera returns array)
    const signedTxnBlob = signedTxn[0]

    // 5️⃣ Send to Algorand blockchain
    const response = await algodClient.sendRawTransaction(signedTxnBlob).do()
    const txId = response.txId || txn.txID()

    console.log(`✅ ASA creation transaction submitted: ${txId}`)

    // 6️⃣ Wait for confirmation to get asset ID
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)
    
    // Asset ID should be in confirmedTxn['asset-index'] or in the transaction result
    let finalAssetId = confirmedTxn['asset-index'] || confirmedTxn['assetIndex']
    
    // If not found, check the transaction result object
    if ((!finalAssetId && finalAssetId !== 0) && confirmedTxn['txn']) {
      const txnResult = confirmedTxn['txn']
      finalAssetId = txnResult['xaid'] || txnResult['caid'] || txnResult['asset-index']
    }
    
    // If still not found, check the transaction application result
    if ((!finalAssetId && finalAssetId !== 0) && confirmedTxn['txn'] && confirmedTxn['txn']['txn']) {
      const innerTxn = confirmedTxn['txn']['txn']
      finalAssetId = innerTxn['xaid'] || innerTxn['caid']
    }
    
    // If still not found, try getting from pending transaction
    if ((!finalAssetId && finalAssetId !== 0)) {
      try {
        const txInfo = await algodClient.pendingTransactionInformation(txId).do()
        finalAssetId = txInfo['asset-index'] || txInfo['assetIndex'] || txInfo['xaid'] || txInfo['caid']
      } catch (e) {
        console.warn('Could not get asset ID from pending transaction:', e)
      }
    }
    
    // Last resort: Parse from transaction note or get from account
    if ((!finalAssetId && finalAssetId !== 0)) {
      // Wait a bit more for blockchain to update
      await new Promise(resolve => setTimeout(resolve, 3000))
      try {
        // Get transaction details
        const txDetails = await algodClient.transactionById(txId).do()
        if (txDetails && txDetails['created-asset-index'] !== undefined) {
          finalAssetId = txDetails['created-asset-index']
        } else if (txDetails && txDetails['asset-index'] !== undefined) {
          finalAssetId = txDetails['asset-index']
        }
      } catch (e) {
        console.warn('Could not get asset ID from transaction details:', e)
      }
    }
    
    if ((!finalAssetId && finalAssetId !== 0)) {
      throw new Error('Could not retrieve asset ID from transaction. Please check the transaction on AlgoExplorer.')
    }

    console.log(`✅ ASA created with ID: ${finalAssetId}`)

    return { txId, assetId: finalAssetId }
  } catch (error) {
    console.error('❌ Error creating ASA:', error)
    throw error
  }
}

/**
 * Transfer ASA tokens using Pera Wallet
 * Opens Pera Wallet popup for user to sign transaction
 */
export async function transferASAWithPera({
  sender,           // User's Algorand address
  peraWallet,       // Pera Wallet instance
  receiver,         // Recipient address
  assetId,          // ASA ID to transfer
  amount            // Amount to transfer
}: {
  sender: string
  peraWallet: PeraWalletConnect
  receiver: string
  assetId: number
  amount: number
}): Promise<string> {
  try {
    // 1️⃣ Get transaction params
    const params = await algodClient.getTransactionParams().do()

    // 2️⃣ Create asset transfer transaction
    // Ensure amount is a safe integer (tokens must be whole numbers)
    const tokenAmount = Math.floor(amount)
    if (!Number.isSafeInteger(tokenAmount)) {
      throw new Error(`Token amount ${amount} is not a safe integer. Please use a whole number.`)
    }
    if (tokenAmount <= 0) {
      throw new Error(`Token amount must be greater than 0`)
    }
    
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: sender,
      suggestedParams: params,
      receiver: receiver,
      amount: tokenAmount,
      assetIndex: assetId
    })

    // 3️⃣ Sign with Pera Wallet
    const singleTxnGroups = [{
      txn: txn,
      signers: [sender]
    }]

    const signedTxn = await peraWallet.signTransaction([singleTxnGroups])
    const signedTxnBlob = signedTxn[0]

    // 4️⃣ Send to blockchain
    const response = await algodClient.sendRawTransaction(signedTxnBlob).do()
    const txId = response.txId || txn.txID()

    console.log(`✅ Asset transfer transaction submitted: ${txId}`)
    return txId
  } catch (error) {
    console.error('❌ Error transferring ASA:', error)
    throw error
  }
}

/**
 * Opt-in to ASA (required before receiving tokens)
 * Opens Pera Wallet popup for user to sign transaction
 */
export async function optInToASAWithPera({
  sender,           // User's Algorand address
  peraWallet,       // Pera Wallet instance
  assetId           // ASA ID to opt-in
}: {
  sender: string
  peraWallet: PeraWalletConnect
  assetId: number
}): Promise<string> {
  try {
    // 1️⃣ Get transaction params
    const params = await algodClient.getTransactionParams().do()

    // 2️⃣ Create opt-in transaction (transfer 0 amount to self)
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: sender,
      suggestedParams: params,
      receiver: sender,  // Transfer to self
      amount: 0,         // Zero amount for opt-in
      assetIndex: assetId
    })

    // 3️⃣ Sign with Pera Wallet
    const singleTxnGroups = [{
      txn: txn,
      signers: [sender]
    }]

    const signedTxn = await peraWallet.signTransaction([singleTxnGroups])
    const signedTxnBlob = signedTxn[0]

    // 4️⃣ Send to blockchain
    const response = await algodClient.sendRawTransaction(signedTxnBlob).do()
    const txId = response.txId || txn.txID()

    console.log(`✅ Opt-in transaction submitted: ${txId}`)
    return txId
  } catch (error) {
    console.error('❌ Error opting in to ASA:', error)
    throw error
  }
}

/**
 * Send ALGO payment using Pera Wallet
 * Opens Pera Wallet popup for user to sign transaction
 */
export async function sendAlgoPaymentWithPera({
  sender,           // User's Algorand address
  peraWallet,       // Pera Wallet instance
  receiver,         // Recipient address
  amount            // Amount in Algos (will be converted to microAlgos)
}: {
  sender: string
  peraWallet: PeraWalletConnect
  receiver: string
  amount: number
}): Promise<string> {
  try {
    // Get account info to check balance
    const accountInfo = await algodClient.accountInformation(sender).do()
    const currentBalance = accountInfo.amount || 0
    
    // Algorand minimum balance requirements:
    // - Base minimum: 100,000 microAlgos (0.1 ALGO)
    // - Per asset: 100,000 microAlgos (0.1 ALGO)
    // - Transaction fee: 1,000 microAlgos (0.001 ALGO)
    const numAssets = accountInfo.assets?.length || 0
    const minBalance = 100_000 + (numAssets * 100_000) // Base + per asset
    const transactionFee = 1_000
    const requiredBalance = minBalance + transactionFee
    
    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount: ${amount} ALGO. Amount must be greater than 0.`)
    }
    
    // Convert Algos to microAlgos and ensure it's a safe integer
    const microAlgos = Math.round(amount * 1000000)
    if (!Number.isSafeInteger(microAlgos)) {
      throw new Error(`Amount ${amount} ALGO results in unsafe integer: ${microAlgos}. Please use a smaller amount.`)
    }
    if (microAlgos <= 0) {
      throw new Error(`Amount must be greater than 0. Received: ${amount} ALGO (${microAlgos} microAlgos)`)
    }
    
    // Check if account has sufficient balance (including minimum balance requirement)
    if (currentBalance < microAlgos + requiredBalance) {
      const needed = (microAlgos + requiredBalance - currentBalance) / 1_000_000
      throw new Error(
        `Insufficient balance! You need ${(microAlgos / 1_000_000).toFixed(4)} ALGO for payment ` +
        `plus ${(requiredBalance / 1_000_000).toFixed(4)} ALGO for minimum balance (${numAssets} assets). ` +
        `You need ${needed.toFixed(4)} more ALGO. Current balance: ${(currentBalance / 1_000_000).toFixed(4)} ALGO.`
      )
    }
    
    // 1️⃣ Get transaction params
    const params = await algodClient.getTransactionParams().do()

    // 2️⃣ Create payment transaction
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: sender,
      suggestedParams: params,
      receiver: receiver,
      amount: microAlgos
    })

    // 3️⃣ Sign with Pera Wallet
    const singleTxnGroups = [{
      txn: txn,
      signers: [sender]
    }]

    const signedTxn = await peraWallet.signTransaction([singleTxnGroups])
    const signedTxnBlob = signedTxn[0]

    // 4️⃣ Send to blockchain
    const response = await algodClient.sendRawTransaction(signedTxnBlob).do()
    const txId = response.txId || txn.txID()

    console.log(`✅ Payment transaction submitted: ${txId}`)
    return txId
  } catch (error) {
    console.error('❌ Error sending payment:', error)
    throw error
  }
}

/**
 * Get asset information from blockchain
 */
export async function getAssetInfo(assetId: number) {
  try {
    const assetInfo = await algodClient.getAssetByID(assetId).do()
    return assetInfo
  } catch (error) {
    console.error('❌ Error fetching asset info:', error)
    throw error
  }
}

/**
 * Get transaction ID from asset creation transaction
 */
export async function getAssetIdFromTransaction(txId: string): Promise<number> {
  try {
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)
    const assetId = confirmedTxn['asset-index']
    return assetId
  } catch (error) {
    console.error('❌ Error getting asset ID:', error)
    throw error
  }
}

