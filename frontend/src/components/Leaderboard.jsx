import { useEffect, useState } from 'react'
import api from '../services/api'

const Leaderboard = ({ currentUserId }) => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/rewards/leaderboard')
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Top Earners
      </h2>
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No rankings yet</p>
        ) : (
          leaderboard.map((user, index) => (
            <div
              key={user._id}
              className={`flex items-center justify-between p-4 rounded-lg transition ${
                user._id === currentUserId
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : index < 3
                  ? 'bg-yellow-50'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : index === 2
                      ? 'bg-orange-500'
                      : 'bg-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className={`font-semibold ${user._id === currentUserId ? 'text-blue-700' : 'text-gray-900'}`}>
                    {user.name}
                    {user._id === currentUserId && ' (You)'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.totalTokens || 0} tokens
                  </p>
                </div>
              </div>
              {index < 3 && (
                <div className="text-2xl">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Leaderboard

