import { useState, useEffect } from 'react'
import api from '../services/api'

const TrafficMap = ({ onRewardEarned }) => {
  const [trafficStatus, setTrafficStatus] = useState({
    speed: 0,
    isInTraffic: false,
    duration: 0
  })
  const [location, setLocation] = useState({ lat: 0, lng: 0 })
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isTracking && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          // Simulate speed for demo (in production, this would be real GPS data)
          const simulatedSpeed = Math.random() * 60 // 0-60 km/h
          setTrafficStatus({
            speed: simulatedSpeed,
            isInTraffic: simulatedSpeed < 10,
            duration: simulatedSpeed < 10 ? trafficStatus.duration + 1 : 0
          })
        },
        (err) => {
          setError('Location access denied')
          console.error(err)
        }
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [isTracking, trafficStatus.duration])

  const handleStartTracking = async () => {
    try {
      const response = await api.post('/traffic/start', { location })
      if (response.data.success) {
        setIsTracking(true)
        setError(null)
      }
    } catch (error) {
      setError('Failed to start tracking')
      console.error(error)
    }
  }

  const handleStopTracking = async () => {
    try {
      await api.post('/traffic/stop')
      setIsTracking(false)
      setError(null)
    } catch (error) {
      console.error('Failed to stop tracking', error)
    }
  }

  useEffect(() => {
    // Auto-report when in traffic for 5+ minutes
    if (trafficStatus.isInTraffic && trafficStatus.duration >= 5) {
      const reportTraffic = async () => {
        try {
          const response = await api.post('/traffic/report', {
            location,
            speed: trafficStatus.speed,
            duration: trafficStatus.duration
          })
          if (response.data.reward && onRewardEarned) {
            onRewardEarned(response.data.reward)
          }
        } catch (error) {
          console.error('Failed to report traffic', error)
        }
      }
      reportTraffic()
    }
  }, [trafficStatus.duration])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Traffic Tracker</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Current Speed</p>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(trafficStatus.speed)} km/h
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Traffic Duration</p>
          <p className="text-2xl font-bold text-green-600">
            {trafficStatus.duration} min
          </p>
        </div>
        <div className={`${trafficStatus.isInTraffic ? 'bg-red-50' : 'bg-gray-50'} rounded-lg p-4`}>
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p className={`text-2xl font-bold ${trafficStatus.isInTraffic ? 'text-red-600' : 'text-gray-600'}`}>
            {trafficStatus.isInTraffic ? '🚦 In Traffic' : '✅ Clear'}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
        <p className="text-sm text-gray-600">
          {location.lat === 0 ? 'Not tracking' : `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
        </p>
      </div>

      <div className="flex space-x-3">
        {!isTracking ? (
          <button
            onClick={handleStartTracking}
            className="btn-primary flex-1"
          >
            Start Tracking
          </button>
        ) : (
          <button
            onClick={handleStopTracking}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex-1"
          >
            Stop Tracking
          </button>
        )}
      </div>

      {trafficStatus.isInTraffic && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            🎯 You're earning rewards! Keep driving and stay in traffic for 5+ minutes
          </p>
        </div>
      )}
    </div>
  )
}

export default TrafficMap

