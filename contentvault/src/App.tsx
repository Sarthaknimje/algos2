import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import VideoTokenization from './pages/VideoTokenization'
import Profile from './pages/Profile'
import TokenDetails from './pages/TokenDetails'
import CreatorMarketplace from './pages/CreatorMarketplace'
import CreatorProfile from './pages/CreatorProfile'
import ContentTokenization from './pages/ContentTokenization'
import TradingMarketplace from './pages/TradingMarketplace'
import YouTubeCallback from './pages/YouTubeCallback'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="launchpad" element={<VideoTokenization />} />
              <Route path="profile" element={<Profile />} />
              <Route path="token/:id" element={<TokenDetails />} />
              <Route path="creator-marketplace" element={<CreatorMarketplace />} />
              <Route path="creator/:id" element={<CreatorProfile />} />
              <Route path="content-tokenization" element={<ContentTokenization />} />
              <Route path="trade/:symbol" element={<TradingMarketplace />} />
              <Route path="auth/youtube/callback" element={<YouTubeCallback />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

export default App
