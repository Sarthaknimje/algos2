import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { PeraWalletConnect } from '@perawallet/connect'

interface WalletContextType {
  wallet: { address: string | null; isConnected: boolean; loading: boolean }
  isConnectedToPeraWallet: boolean
  isConnected: boolean
  accounts: string[]
  address: string | null
  balance: number
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  peraWallet: PeraWalletConnect | null
  isLoading: boolean
}

const WalletContext = createContext<WalletContextType>({
  wallet: { address: null, isConnected: false, loading: false },
  isConnectedToPeraWallet: false,
  isConnected: false,
  accounts: [],
  address: null,
  balance: 0,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  peraWallet: null,
  isLoading: false
})

export const useWallet = () => useContext(WalletContext)

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null)
  const [accounts, setAccounts] = useState<string[]>([])
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [isConnectedToPeraWallet, setIsConnectedToPeraWallet] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)

  // 🔌 CONNECT WALLET
  const connectWallet = async () => {
    if (!peraWallet) return

    setIsLoading(true)
    try {
      // Open Pera Wallet modal
      const accounts = await peraWallet.connect()

      // Setup disconnect listener
      peraWallet.connector?.on("disconnect", handleDisconnect)

      // Save account info
      setAccounts(accounts)
      setAddress(accounts[0])
      setIsConnectedToPeraWallet(true)
      await fetchBalance(accounts[0])
    } catch (error) {
      console.error('Error connecting to Pera Wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ❌ DISCONNECT WALLET
  const disconnectWallet = async () => {
    if (!peraWallet) return

    try {
      await peraWallet.disconnect()
      handleDisconnect()
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  const handleDisconnect = () => {
    setAccounts([])
    setAddress(null)
    setIsConnectedToPeraWallet(false)
    setBalance(0)
  }

  const fetchBalance = async (addr: string) => {
    try {
      // Fetch real balance from Algorand
      const response = await fetch(`https://testnet-api.algonode.cloud/v2/accounts/${addr}`)
      if (response.ok) {
        const data = await response.json()
        setBalance(data.amount / 1000000) // Convert microAlgos to Algos
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  // 🚀 INITIALIZE on mount
  useEffect(() => {
    const peraWalletInstance = new PeraWalletConnect({
      chainId: 416002 // TestNet
    })
    setPeraWallet(peraWalletInstance)

    // Check for existing session
    const checkConnection = async () => {
      try {
        const accounts = await peraWalletInstance.reconnectSession()
        peraWalletInstance.connector?.on("disconnect", handleDisconnect)

        if (accounts.length > 0) {
          setAccounts(accounts)
          setAddress(accounts[0])
          setIsConnectedToPeraWallet(true)
          await fetchBalance(accounts[0])
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }

    checkConnection()
  }, [])

  const value: WalletContextType = {
    wallet: { address, isConnected: isConnectedToPeraWallet, loading: isLoading },
    isConnectedToPeraWallet,
    isConnected: isConnectedToPeraWallet,
    accounts,
    address,
    balance,
    connectWallet,
    disconnectWallet,
    peraWallet,
    isLoading
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
