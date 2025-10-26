import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import TokenBalance from '../components/TokenBalance'
import api from '../services/api'

const Marketplace = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [tokenBalance, setTokenBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    fetchMarketplaceData()
  }, [])

  const fetchMarketplaceData = async () => {
    try {
      const [itemsResponse, balanceResponse] = await Promise.all([
        api.get('/marketplace/items'),
        api.get('/rewards')
      ])
      setItems(itemsResponse.data)
      setTokenBalance(balanceResponse.data.totalTokens || 0)
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (itemId) => {
    setPurchasing(itemId)
    setMessage({ text: '', type: '' })

    try {
      const response = await api.post('/marketplace/spend', { itemId })
      
      if (response.data.success) {
        setMessage({
          text: response.data.message || 'Purchase successful!',
          type: 'success'
        })
        // Update balance
        setTokenBalance(prev => {
          const item = items.find(i => i._id === itemId)
          return prev - (item?.price || 0)
        })
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Purchase failed',
        type: 'error'
      })
    } finally {
      setPurchasing(null)
      setTimeout(() => setMessage({ text: '', type: '' }), 5000)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">
          Spend your earned tokens on exclusive rewards and benefits
        </p>
      </div>

      {message.text && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <TokenBalance balance={tokenBalance} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No items available in the marketplace yet</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-6xl">{item.icon || '🎁'}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    {item.price} tokens
                  </div>
                  <button
                    onClick={() => handlePurchase(item._id)}
                    disabled={
                      purchasing === item._id ||
                      item.price > tokenBalance ||
                      !item.available
                    }
                    className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${
                      purchasing === item._id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : item.price > tokenBalance
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : !item.available
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-primary hover:bg-blue-700 text-white'
                    }`}
                  >
                    {purchasing === item._id
                      ? 'Processing...'
                      : !item.available
                      ? 'Unavailable'
                      : item.price > tokenBalance
                      ? 'Insufficient'
                      : 'Purchase'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Marketplace

