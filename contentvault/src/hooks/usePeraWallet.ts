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

  const algodClient = new Algodv2('', 'https://mainnet-api.algonode.cloud', '')

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
        .then((newAccounts) => {
          // Setup the disconnect event listener
          peraWallet.connector?.on("disconnect", handleDisconnectWallet);
          
          if (newAccounts.length > 0) {
            const address = newAccounts[0]
            // For now, set a mock balance since we're using testnet
            setWalletState({
              isConnected: true,
              address,
              balance: 100.0, // Mock balance for demo
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
  }, [handleDisconnectWallet])

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
      const accountInfo = await algodClient.accountInformation(walletState.address).do()
      const balance = accountInfo.amount / 1000000
      
      setWalletState(prev => ({
        ...prev,
        balance,
      }))
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh balance',
      }))
    }
  }, [walletState.address])

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        peraWallet.reconnectSession().then((accounts) => {
          // Setup the disconnect event listener
          peraWallet.connector?.on("disconnect", handleDisconnectWallet);
          
          if (peraWallet.isConnected && accounts.length) {
            const address = accounts[0]
            setWalletState({
              isConnected: true,
              address,
              balance: 100.0, // Mock balance for demo
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
      }
    }

    checkConnection()
  }, [handleDisconnectWallet])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  }
}
