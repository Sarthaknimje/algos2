import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import TokenBalance from '../components/TokenBalance'
import TrafficMap from '../components/TrafficMap'
import Leaderboard from '../components/Leaderboard'
import RewardPopup from '../components/RewardPopup'
import api from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()
  const [tokenBalance, setTokenBalance] = useState(0)
  const [recentRewards, setRecentRewards] = useState([])
  const [showRewardPopup, setShowRewardPopup] = useState(false)
  const [latestReward, setLatestReward] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await api.get('/rewards')
      setTokenBalance(response.data.totalTokens || 0)
      setRecentRewards(response.data.recentRewards || [])
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRewardEarned = (reward) => {
    setLatestReward(reward)
    setShowRewardPopup(true)
    setTokenBalance(prev => prev + (reward.tokens || 0))
    
    // Refresh rewards list
    fetchUserData()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {showRewardPopup && latestReward && (
        <RewardPopup
          reward={latestReward}
          onClose={() => setShowRewardPopup(false)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Track your driving and earn rewards for contributing to traffic data
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Features */}
          <div className="lg:col-span-2 space-y-6">
            <TokenBalance balance={tokenBalance} />

            <TrafficMap onRewardEarned={handleRewardEarned} />

            {/* Recent Rewards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Rewards</h2>
              {recentRewards.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No rewards yet. Start tracking to earn tokens!
                </p>
              ) : (
                <div className="space-y-3">
                  {recentRewards.map((reward, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{reward.reason}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(reward.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        +{reward.tokens}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard currentUserId={user?._id} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

