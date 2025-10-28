import axios from 'axios'

const YOUTUBE_API_KEY = 'AIzaSyBYVrcI-3CGBzVQplilpDT0oEmjL7Xl5gk'

export interface SocialStats {
  followers: number
  following: number
  posts: number
  verified: boolean
}

export interface YouTubeStats {
  subscribers: number
  views: number
  videos: number
  channelId: string
  thumbnailUrl: string
}

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  viewCount: number
  likeCount: number
  duration: string
}

// YouTube API Integration
export async function getYouTubeChannelStats(channelUrl: string): Promise<YouTubeStats | null> {
  try {
    let channelId = ''
    
    // Check if it's already a channel ID (starts with UC and is 24 chars)
    if (channelUrl.startsWith('UC') && channelUrl.length === 24) {
      channelId = channelUrl
    } else {
      // Extract channel ID or username from URL
      const channelIdMatch = channelUrl.match(/channel\/([^\/\?]+)/)
      const handleMatch = channelUrl.match(/@([^\/\?]+)/)
      const customMatch = channelUrl.match(/c\/([^\/\?]+)/)
      
      if (channelIdMatch) {
        channelId = channelIdMatch[1]
      } else if (handleMatch || customMatch) {
        const identifier = handleMatch ? handleMatch[1] : customMatch![1]
        
        // Search for channel by handle/custom name
        const searchResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${identifier}&type=channel&key=${YOUTUBE_API_KEY}&maxResults=1`
        )
        
        if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
          console.error('Channel not found in search')
          return null
        }
        
        channelId = searchResponse.data.items[0].id.channelId
      } else {
        // Try to search directly
        const searchResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channelUrl}&type=channel&key=${YOUTUBE_API_KEY}&maxResults=1`
        )
        
        if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
          console.error('No channel found for:', channelUrl)
          return null
        }
        
        channelId = searchResponse.data.items[0].id.channelId
      }
    }
    
    console.log('Fetching channel with ID:', channelId)
    
    // Get channel statistics
    const channelResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
    )
    
    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      console.error('Channel not found with ID:', channelId)
      return null
    }
    
    const channel = channelResponse.data.items[0]
    
    console.log('Channel found:', channel.snippet.title)
    
    return {
      subscribers: parseInt(channel.statistics.subscriberCount) || 0,
      views: parseInt(channel.statistics.viewCount) || 0,
      videos: parseInt(channel.statistics.videoCount) || 0,
      channelId: channelId,
      thumbnailUrl: channel.snippet.thumbnails.default.url
    }
  } catch (error: any) {
    console.error('YouTube API Error:', error.response?.data || error.message)
    return null
  }
}

export async function getYouTubeVideos(channelId: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
  try {
    console.log('Fetching videos for channel:', channelId)
    
    // Get channel uploads playlist
    const channelResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    )
    
    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      console.error('No channel found for videos')
      return []
    }
    
    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads
    console.log('Uploads playlist ID:', uploadsPlaylistId)
    
    // Get videos from playlist
    const playlistResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    )
    
    if (!playlistResponse.data.items || playlistResponse.data.items.length === 0) {
      console.log('No videos found in playlist')
      return []
    }
    
    const videoIds = playlistResponse.data.items.map((item: any) => item.snippet.resourceId.videoId).join(',')
    console.log(`Fetching stats for ${playlistResponse.data.items.length} videos`)
    
    // Get video statistics
    const videosResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )
    
    const videos = videosResponse.data.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
      publishedAt: video.snippet.publishedAt,
      viewCount: parseInt(video.statistics.viewCount) || 0,
      likeCount: parseInt(video.statistics.likeCount) || 0,
      duration: video.contentDetails.duration
    }))
    
    console.log(`Successfully fetched ${videos.length} videos`)
    return videos
  } catch (error: any) {
    console.error('YouTube Videos Error:', error.response?.data || error.message)
    return []
  }
}

// Instagram scraping (note: Instagram blocks direct scraping, this is for demonstration)
export async function getInstagramStats(username: string): Promise<SocialStats | null> {
  try {
    // For production, you'd use Instagram Graph API
    // This is a fallback that tries to fetch public data
    const response = await axios.get(`https://www.instagram.com/${username}/?__a=1&__d=dis`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const userData = response.data.graphql?.user || response.data.user
    
    if (!userData) return null
    
    return {
      followers: userData.edge_followed_by?.count || 0,
      following: userData.edge_follow?.count || 0,
      posts: userData.edge_owner_to_timeline_media?.count || 0,
      verified: userData.is_verified || false
    }
  } catch (error) {
    console.error('Instagram fetch error:', error)
    // Return mock data as fallback for demo
    return {
      followers: 47600000, // Rashmika Mandanna followers
      following: 333,
      posts: 849,
      verified: true
    }
  }
}

// Twitter/X API (requires authentication, using mock data)
export async function getTwitterStats(username: string): Promise<SocialStats | null> {
  try {
    // For production, use Twitter API v2 with authentication
    // This returns mock data for demonstration
    return {
      followers: 128, // Sarthak Nimje followers
      following: 1681,
      posts: 482,
      verified: false
    }
  } catch (error) {
    console.error('Twitter fetch error:', error)
    return null
  }
}

// LinkedIn scraping (LinkedIn blocks scraping, using mock data)
export async function getLinkedInStats(profileUrl: string): Promise<SocialStats | null> {
  try {
    // For production, use LinkedIn API with OAuth
    // This returns mock data for demonstration
    return {
      followers: 5487, // Sarthak Nimje LinkedIn followers
      following: 0,
      posts: 0,
      verified: true
    }
  } catch (error) {
    console.error('LinkedIn fetch error:', error)
    return null
  }
}

// Aggregate all social stats
export async function getAllSocialStats(socialLinks: {
  youtube?: string
  instagram?: string
  twitter?: string
  linkedin?: string
}): Promise<{
  youtube: YouTubeStats | null
  instagram: SocialStats | null
  twitter: SocialStats | null
  linkedin: SocialStats | null
  totalFollowers: number
}> {
  const results = await Promise.all([
    socialLinks.youtube ? getYouTubeChannelStats(socialLinks.youtube) : null,
    socialLinks.instagram ? getInstagramStats(socialLinks.instagram) : null,
    socialLinks.twitter ? getTwitterStats(socialLinks.twitter) : null,
    socialLinks.linkedin ? getLinkedInStats(socialLinks.linkedin) : null
  ])
  
  const [youtube, instagram, twitter, linkedin] = results
  
  const totalFollowers = 
    (youtube?.subscribers || 0) +
    (instagram?.followers || 0) +
    (twitter?.followers || 0) +
    (linkedin?.followers || 0)
  
  return {
    youtube,
    instagram,
    twitter,
    linkedin,
    totalFollowers
  }
}

