import React, { createContext, useContext, useEffect, useState } from 'react'
import { PeraWalletConnect } from '@perawallet/connect'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: number
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isLoading: boolean
  peraWallet: PeraWalletConnect | null
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  balance: 0,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isLoading: false,
  peraWallet: null
})

export const useWallet = () => useContext(WalletContext)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [peraWallet] = useState(new PeraWalletConnect())
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Reconnect to session if it exists
    peraWallet.reconnectSession().then((accounts) => {
      if (accounts.length) {
        setAddress(accounts[0])
        fetchBalance(accounts[0])
      }
    })

    // Listen for disconnect
    peraWallet.connector?.on('disconnect', () => {
      setAddress(null)
      setBalance(0)
    })
  }, [peraWallet])

  const fetchBalance = async (addr: string) => {
    try {
      // Mock balance for now - in production, fetch from Algorand
      setBalance(Math.random() * 100)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      const accounts = await peraWallet.connect()
      setAddress(accounts[0])
      await fetchBalance(accounts[0])
    } catch (error) {
      console.error('Error connecting wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    peraWallet.disconnect()
    setAddress(null)
    setBalance(0)
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected: !!address,
        address,
        balance,
        connectWallet,
        disconnectWallet,
        isLoading,
        peraWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
