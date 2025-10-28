import { useState, useEffect, useCallback } from 'react'
import { PeraWalletConnect } from '@perawallet/connect'
import { Algodv2 } from 'algosdk'

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number
  isLoading: boolean
  error: string | null
}

const peraWallet = new PeraWalletConnect({
  chainId: 416002, // Algorand Testnet
  shouldShowSignTxnToast: true
})

export const usePeraWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    isLoading: false,
    error: null,
  })

  const testnetClient = new Algodv2('', 'https://testnet-api.algonode.cloud', '')
  const mainnetClient = new Algodv2('', 'https://mainnet-api.algonode.cloud', '')

  const fetchAccountBalance = useCallback(async (address: string): Promise<number> => {
    console.log('Fetching balance for address:', address)
    
    // Try testnet first (since wallet is configured for testnet)
    try {
      console.log('Trying testnet endpoint...')
      const accountInfo = await testnetClient.accountInformation(address).do()
      console.log('Testnet account info received:', accountInfo)
      console.log('Raw amount (microAlgos):', accountInfo.amount, typeof accountInfo.amount)
      
      const balance = Number(accountInfo.amount) / 1000000 // Convert from microAlgos to ALGOs
      console.log('Testnet balance (ALGO):', balance)
      
      if (balance > 0) {
        return balance
      }
    } catch (error) {
      console.log('Testnet fetch failed:', error instanceof Error ? error.message : 'Unknown error')
    }

    // If testnet fails or returns 0, try mainnet
    try {
      console.log('Trying mainnet endpoint...')
      const accountInfo = await mainnetClient.accountInformation(address).do()
      console.log('Mainnet account info received:', accountInfo)
      console.log('Raw amount (microAlgos):', accountInfo.amount, typeof accountInfo.amount)
      
      const balance = Number(accountInfo.amount) / 1000000 // Convert from microAlgos to ALGOs
      console.log('Mainnet balance (ALGO):', balance)
      
      return balance
    } catch (error) {
      console.error('Both testnet and mainnet fetch failed')
      console.error('Final error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      return 0
    }
  }, [])

  const handleDisconnectWallet = useCallback(() => {
    peraWallet.disconnect()
    setWalletState({
      isConnected: false,
      address: null,
      balance: 0,
      isLoading: false,
      error: null,
    })
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: null }))
      
      peraWallet
        .connect()
        .then(async (newAccounts) => {
          // Setup the disconnect event listener
          peraWallet.connector?.on("disconnect", handleDisconnectWallet);
          
          if (newAccounts.length > 0) {
            const address = newAccounts[0]
            console.log('Wallet connected with address:', address)
            
            // Validate address format
            if (!address || typeof address !== 'string' || address.length !== 58) {
              throw new Error('Invalid wallet address format')
            }
            
            const base32Regex = /^[A-Z2-7]+$/
            if (!base32Regex.test(address)) {
              throw new Error('Invalid Algorand address format')
            }
            
            // Fetch real balance from testnet
            const balance = await fetchAccountBalance(address)
            console.log('Setting wallet state:', { isConnected: true, address, balance })
            setWalletState({
              isConnected: true,
              address,
              balance,
              isLoading: false,
              error: null,
            })
          }
        })
        .catch((error) => {
          // Handle the reject because once the user closes the modal, peraWallet.connect() promise will be rejected
          if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
            setWalletState(prev => ({
              ...prev,
              isLoading: false,
              error: 'Failed to connect wallet',
            }))
          } else {
            setWalletState(prev => ({
              ...prev,
              isLoading: false,
              error: null,
            }))
          }
        })
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }))
    }
  }, [handleDisconnectWallet, fetchAccountBalance])

  const disconnectWallet = useCallback(async () => {
    try {
      await peraWallet.disconnect()
      setWalletState({
        isConnected: false,
        address: null,
        balance: 0,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disconnect wallet',
      }))
    }
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!walletState.address) return

    try {
      setWalletState(prev => ({ ...prev, isLoading: true }))
      const balance = await fetchAccountBalance(walletState.address)
      
      setWalletState(prev => ({
        ...prev,
        balance,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh balance',
      }))
    }
  }, [walletState.address, fetchAccountBalance])

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        peraWallet.reconnectSession().then(async (accounts) => {
          // Setup the disconnect event listener
          peraWallet.connector?.on("disconnect", handleDisconnectWallet);
          
          if (peraWallet.isConnected && accounts.length) {
            const address = accounts[0]
            console.log('Wallet reconnected with address:', address)
            
            // Validate address format
            if (!address || typeof address !== 'string' || address.length !== 58) {
              console.error('Invalid reconnected address format:', address)
              return
            }
            
            const base32Regex = /^[A-Z2-7]+$/
            if (!base32Regex.test(address)) {
              console.error('Invalid reconnected Algorand address format:', address)
              return
            }
            
            // Fetch real balance from testnet
            const balance = await fetchAccountBalance(address)
            console.log('Setting reconnected wallet state:', { isConnected: true, address, balance })
            setWalletState({
              isConnected: true,
              address,
              balance,
              isLoading: false,
              error: null,
            })
          }
        }).catch((error) => {
          // Wallet not connected, this is normal
          console.log('No existing session:', error)
        })
      } catch (error) {
        // Wallet not connected, this is normal
        console.log('Wallet connection check failed:', error)
      }
    }

    checkConnection()
  }, [handleDisconnectWallet, fetchAccountBalance])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  }
}
