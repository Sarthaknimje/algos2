import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import TokenBalance from '../components/TokenBalance'
import api from '../services/api'

const Profile = () => {
  const { user } = useAuth()
  const [tokenBalance, setTokenBalance] = useState(0)
  const [totalRewards, setTotalRewards] = useState(0)
  const [trafficReports, setTrafficReports] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/rewards')
      setTokenBalance(response.data.totalTokens || 0)
      setTotalRewards(response.data.totalRewards || 0)
      setTrafficReports(response.data.trafficReports || 0)
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">View your account information and statistics</p>
      </div>

      <TokenBalance balance={tokenBalance} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Info</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistics</h2>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Rewards</p>
              <p className="text-3xl font-bold text-green-600">{totalRewards}</p>
              <p className="text-xs text-gray-500 mt-1">rewards earned</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Traffic Reports</p>
              <p className="text-3xl font-bold text-blue-600">{trafficReports}</p>
              <p className="text-xs text-gray-500 mt-1">reports submitted</p>
            </div>
          </div>
        </div>

        {/* Achievements Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Achievements</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold text-gray-900">First Report</p>
                <p className="text-xs text-gray-500">Submit your first traffic report</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-semibold text-gray-900">Consistency</p>
                <p className="text-xs text-gray-500">Report traffic 5 days in a row</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold text-gray-900">Milestone</p>
                <p className="text-xs text-gray-500">Earn 1000 tokens</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

