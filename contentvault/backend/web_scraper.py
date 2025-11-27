"""
Web Scraper for Social Media Content
Scrapes Instagram Reels, Twitter Tweets, LinkedIn Posts without APIs
FREE - No API keys required!
"""

import requests
from bs4 import BeautifulSoup
import re
import json
import logging
from typing import Dict, Optional, List
from urllib.parse import urlparse, parse_qs
import time

logger = logging.getLogger(__name__)

class WebScraper:
    """Web scraper for social media platforms"""
    
    @staticmethod
    def get_headers() -> Dict[str, str]:
        """Get headers to mimic browser requests"""
        return {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    
    @staticmethod
    def scrape_instagram_reel(reel_url: str) -> Optional[Dict]:
        """
        Scrape Instagram Reel data from URL using multiple methods
        No API required - uses oEmbed endpoint and web scraping
        """
        try:
            # Instagram Reel URL format: https://www.instagram.com/reel/ABC123/ or /reels/ABC123/
            reel_id_match = re.search(r'/reels?/([A-Za-z0-9_-]+)', reel_url)
            if not reel_id_match:
                return None
            
            reel_id = reel_id_match.group(1)
            
            # Initialize data
            username = ''
            title_text = ''
            description_text = ''
            thumbnail_url = ''
            likes = 0
            comments = 0
            views = 0
            
            # METHOD 1: Try Instagram's oEmbed endpoint (FREE, no API key needed!)
            # oEmbed returns title in format: "2M likes, 10K comments - username on Nov 27: caption"
            # or "2,144,147 likes, 9,992 comments - username on Nov 27: caption"
            try:
                oembed_url = f'https://api.instagram.com/oembed/?url={reel_url}'
                oembed_response = requests.get(oembed_url, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
                })
                if oembed_response.status_code == 200:
                    oembed_data = oembed_response.json()
                    username = oembed_data.get('author_name', '')
                    raw_title = oembed_data.get('title', '')
                    thumbnail_url = oembed_data.get('thumbnail_url', '')
                    
                    logger.info(f"oEmbed raw title: {raw_title}")
                    
                    # Parse engagement from title format: "280K likes, 1,621 comments - username..."
                    if raw_title:
                        # LIKES: Try abbreviated FIRST (280K, 2M, 1.5B)
                        abbrev_likes = re.search(r'([\d.]+)\s*([KMB])\s*likes?', raw_title, re.IGNORECASE)
                        if abbrev_likes:
                            num = float(abbrev_likes.group(1))
                            suffix = abbrev_likes.group(2).upper()
                            multiplier = {'K': 1000, 'M': 1000000, 'B': 1000000000}.get(suffix, 1)
                            likes = int(num * multiplier)
                            logger.info(f"Found abbreviated likes: {abbrev_likes.group(0)} -> {likes:,}")
                        
                        # If no abbreviated, try exact (2,144,147 likes)
                        if likes == 0:
                            exact_likes = re.search(r'([\d,]+)\s*likes?', raw_title, re.IGNORECASE)
                            if exact_likes:
                                likes_str = exact_likes.group(1).replace(',', '')
                                if likes_str.isdigit():
                                    likes = int(likes_str)
                                    logger.info(f"Found exact likes: {likes:,}")
                        
                        # COMMENTS: Try abbreviated FIRST (10K, 2M)
                        abbrev_comments = re.search(r'([\d.]+)\s*([KMB])\s*comments?', raw_title, re.IGNORECASE)
                        if abbrev_comments:
                            num = float(abbrev_comments.group(1))
                            suffix = abbrev_comments.group(2).upper()
                            multiplier = {'K': 1000, 'M': 1000000, 'B': 1000000000}.get(suffix, 1)
                            comments = int(num * multiplier)
                            logger.info(f"Found abbreviated comments: {abbrev_comments.group(0)} -> {comments:,}")
                        
                        # If no abbreviated, try exact (1,621 comments)
                        if comments == 0:
                            exact_comments = re.search(r'([\d,]+)\s*comments?', raw_title, re.IGNORECASE)
                            if exact_comments:
                                comments_str = exact_comments.group(1).replace(',', '')
                                if comments_str.isdigit():
                                    comments = int(comments_str)
                                    logger.info(f"Found exact comments: {comments:,}")
                        
                        # Extract clean title (caption part after ":")
                        caption_match = re.search(r':\s*(.+)$', raw_title)
                        if caption_match:
                            title_text = caption_match.group(1).strip()
                        else:
                            # Remove engagement prefix
                            title_text = re.sub(r'^[\d,.]+[KMB]?\s*likes?,?\s*[\d,.]+[KMB]?\s*comments?\s*-?\s*', '', raw_title, flags=re.IGNORECASE)
                            title_text = re.sub(r'^\w+\s+on\s+\w+\s+\d+,?\s*\d*:\s*', '', title_text)
                    
                    # oEmbed sometimes includes HTML with the content
                    html_content = oembed_data.get('html', '')
                    if html_content and not title_text:
                        caption_match = re.search(r'<p[^>]*>([^<]+)</p>', html_content)
                        if caption_match:
                            title_text = caption_match.group(1)[:100]
            except Exception as e:
                logger.warning(f"oEmbed failed: {e}")
            
            # METHOD 2: Try the embed page which sometimes has more data
            try:
                embed_url = f'https://www.instagram.com/p/{reel_id}/embed/'
                embed_response = requests.get(embed_url, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                })
                if embed_response.status_code == 200:
                    embed_soup = BeautifulSoup(embed_response.text, 'html.parser')
                    
                    # Look for engagement in embed page
                    embed_text = embed_response.text
                    
                    # Try to find likes in various formats
                    likes_patterns = [
                        r'"edge_media_preview_like":\s*{\s*"count":\s*(\d+)',
                        r'"like_count":\s*(\d+)',
                        r'(\d+(?:,\d+)*)\s*likes?',
                        r'"likes":\s*(\d+)',
                    ]
                    for pattern in likes_patterns:
                        match = re.search(pattern, embed_text, re.IGNORECASE)
                        if match:
                            likes_str = match.group(1).replace(',', '')
                            likes = int(likes_str) if likes_str.isdigit() else 0
                            if likes > 0:
                                break
                    
                    # Try to find comments
                    comments_patterns = [
                        r'"edge_media_to_comment":\s*{\s*"count":\s*(\d+)',
                        r'"comment_count":\s*(\d+)',
                        r'(\d+(?:,\d+)*)\s*comments?',
                    ]
                    for pattern in comments_patterns:
                        match = re.search(pattern, embed_text, re.IGNORECASE)
                        if match:
                            comments_str = match.group(1).replace(',', '')
                            comments = int(comments_str) if comments_str.isdigit() else 0
                            if comments > 0:
                                break
                    
                    # Try to find views for videos/reels
                    views_patterns = [
                        r'"video_view_count":\s*(\d+)',
                        r'"play_count":\s*(\d+)',
                        r'(\d+(?:,\d+)*)\s*views?',
                    ]
                    for pattern in views_patterns:
                        match = re.search(pattern, embed_text, re.IGNORECASE)
                        if match:
                            views_str = match.group(1).replace(',', '')
                            views = int(views_str) if views_str.isdigit() else 0
                            if views > 0:
                                break
                    
                    # Extract username if not already found
                    if not username:
                        username_match = re.search(r'"username":\s*"([^"]+)"', embed_text)
                        if username_match:
                            username = username_match.group(1)
                    
                    # Extract thumbnail if not already found
                    if not thumbnail_url:
                        thumb_match = re.search(r'"display_url":\s*"([^"]+)"', embed_text)
                        if thumb_match:
                            thumbnail_url = thumb_match.group(1).replace('\\u0026', '&')
                        else:
                            # Try og:image from embed page
                            og_img = embed_soup.find('meta', property='og:image')
                            if og_img:
                                thumbnail_url = og_img.get('content', '')
            except Exception as e:
                logger.warning(f"Embed scraping failed: {e}")
            
            # METHOD 3: Try direct page scraping with Facebook bot UA (gets more access)
            try:
                headers = {
                    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                    'Accept': '*/*',
                }
                response = requests.get(reel_url, headers=headers, timeout=15)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Extract from meta tags
                    if not thumbnail_url:
                        og_image = soup.find('meta', property='og:image')
                        if og_image:
                            thumbnail_url = og_image.get('content', '')
                    
                    if not title_text:
                        og_title = soup.find('meta', property='og:title')
                        if og_title:
                            title_content = og_title.get('content', '')
                            # Extract username from title
                            username_match = re.search(r'^([^\s]+)\s+on\s+Instagram', title_content, re.IGNORECASE)
                            if username_match and not username:
                                username = username_match.group(1).replace('@', '')
                            title_text = re.sub(r'\s+on\s+Instagram.*$', '', title_content, flags=re.IGNORECASE)
                    
                    if not description_text:
                        og_desc = soup.find('meta', property='og:description')
                        if og_desc:
                            description_text = og_desc.get('content', '')
                    
                    # Parse engagement from og:description or og:title
                    # Format: "280K likes, 1,621 comments - username on Date: caption"
                    all_text = f"{title_text} {description_text}"
                    
                    # Extract likes from meta text if not found yet
                    if likes == 0:
                        abbrev_likes = re.search(r'([\d.]+)\s*([KMB])\s*likes?', all_text, re.IGNORECASE)
                        if abbrev_likes:
                            num = float(abbrev_likes.group(1))
                            suffix = abbrev_likes.group(2).upper()
                            multiplier = {'K': 1000, 'M': 1000000, 'B': 1000000000}.get(suffix, 1)
                            likes = int(num * multiplier)
                            logger.info(f"Found likes from meta: {likes:,}")
                        else:
                            exact_likes = re.search(r'([\d,]+)\s*likes?', all_text, re.IGNORECASE)
                            if exact_likes:
                                likes_str = exact_likes.group(1).replace(',', '')
                                if likes_str.isdigit():
                                    likes = int(likes_str)
                                    logger.info(f"Found exact likes from meta: {likes:,}")
                    
                    # Extract comments from meta text - THIS IS KEY!
                    if comments == 0:
                        abbrev_comments = re.search(r'([\d.]+)\s*([KMB])\s*comments?', all_text, re.IGNORECASE)
                        if abbrev_comments:
                            num = float(abbrev_comments.group(1))
                            suffix = abbrev_comments.group(2).upper()
                            multiplier = {'K': 1000, 'M': 1000000, 'B': 1000000000}.get(suffix, 1)
                            comments = int(num * multiplier)
                            logger.info(f"Found comments from meta: {comments:,}")
                        else:
                            exact_comments = re.search(r'([\d,]+)\s*comments?', all_text, re.IGNORECASE)
                            if exact_comments:
                                comments_str = exact_comments.group(1).replace(',', '')
                                if comments_str.isdigit():
                                    comments = int(comments_str)
                                    logger.info(f"Found exact comments from meta: {comments:,}")
                    
                    # Look for JSON data in script tags (fallback)
                    page_text = response.text
                    
                    # More patterns for engagement from JSON
                    if likes == 0:
                        for pattern in [r'"edge_liked_by":\s*{\s*"count":\s*(\d+)', r'"likeCount":\s*(\d+)']:
                            match = re.search(pattern, page_text)
                            if match:
                                likes = int(match.group(1))
                                break
                    
                    if views == 0:
                        for pattern in [r'"viewCount":\s*"?(\d+)"?', r'"video_view_count":\s*(\d+)']:
                            match = re.search(pattern, page_text)
                            if match:
                                views = int(match.group(1))
                                break
            except Exception as e:
                logger.warning(f"Direct scraping failed: {e}")
            
            # Extract username from URL if still not found
            if not username:
                url_username_match = re.search(r'instagram\.com/([^/?]+)/reels?/', reel_url)
                if url_username_match and url_username_match.group(1) not in ['reel', 'reels', 'p']:
                    username = url_username_match.group(1)
            
            # Clean up title and description - remove engagement prefix
            # Format: "280K likes, 1,621 comments - username on Date: caption"
            def clean_instagram_text(text):
                if not text:
                    return ''
                # Remove "X likes, Y comments - " prefix
                cleaned = re.sub(r'^[\d,.]+[KMB]?\s*likes?,?\s*[\d,.]+[KMB]?\s*comments?\s*-?\s*', '', text, flags=re.IGNORECASE)
                # Remove "username on Date: " prefix
                cleaned = re.sub(r'^[\w._]+\s+on\s+\w+\s+\d+,?\s*\d*:\s*', '', cleaned, flags=re.IGNORECASE)
                # Remove leading/trailing quotes and whitespace
                cleaned = cleaned.strip().strip('"').strip()
                return cleaned
            
            clean_title = clean_instagram_text(title_text)
            clean_description = clean_instagram_text(description_text)
            
            # Use title as description if description is empty or same as title
            final_description = clean_description if clean_description and clean_description != clean_title else clean_title
            
            # Build the result
            result = {
                'id': reel_id,
                'title': clean_title or (f'Instagram Reel by @{username}' if username else 'Instagram Reel'),
                'description': final_description or (f'Instagram Reel content by @{username}' if username else 'Instagram Reel content'),
                'thumbnailUrl': thumbnail_url,
                'url': reel_url,
                'platform': 'instagram',
                'authorName': username,
                'createdAt': '',
                'engagement': {
                    'likes': likes,
                    'comments': comments,
                    'views': 0  # Instagram oEmbed doesn't provide views, so we set to 0
                },
                'requiresVerification': True
            }
            
            logger.info(f"Instagram scrape: @{username} - {likes:,} likes, {comments:,} comments, title='{clean_title[:50]}...'")
            
            return result
            
        except Exception as e:
            logger.error(f"Error scraping Instagram reel: {e}")
            return None
    
    @staticmethod
    def scrape_twitter_tweet(tweet_url: str) -> Optional[Dict]:
        """
        Scrape Twitter/X Tweet data from URL
        Uses Twitter's syndication API for engagement data
        """
        try:
            # Twitter URL format: https://twitter.com/username/status/1234567890 or x.com
            tweet_id_match = re.search(r'/status/(\d+)', tweet_url)
            if not tweet_id_match:
                return None
            
            tweet_id = tweet_id_match.group(1)
            # Extract username from both twitter.com and x.com URLs
            username_match = re.search(r'(?:twitter\.com|x\.com)/([^/]+)', tweet_url)
            username = username_match.group(1) if username_match else ''
            
            # Initialize engagement
            likes = 0
            retweets = 0
            replies = 0
            views = 0
            tweet_text = ''
            thumbnail_url = ''
            author_name = username
            
            # METHOD 1: Try Twitter's Syndication API (returns JSON with engagement!)
            try:
                syndication_url = f'https://cdn.syndication.twimg.com/tweet-result?id={tweet_id}&lang=en'
                synd_response = requests.get(syndication_url, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://platform.twitter.com/'
                })
                
                if synd_response.status_code == 200:
                    try:
                        tweet_data = synd_response.json()
                        
                        # Extract engagement from JSON
                        likes = tweet_data.get('favorite_count', 0) or 0
                        retweets = tweet_data.get('retweet_count', 0) or 0
                        replies = tweet_data.get('reply_count', 0) or tweet_data.get('conversation_count', 0) or 0
                        views = tweet_data.get('views', {}).get('count', 0) if isinstance(tweet_data.get('views'), dict) else 0
                        
                        # Get tweet text
                        tweet_text = tweet_data.get('text', '')
                        
                        # Get author info
                        user_data = tweet_data.get('user', {})
                        author_name = user_data.get('screen_name', username) or username
                        
                        # Get media/thumbnail
                        media_list = tweet_data.get('mediaDetails', []) or tweet_data.get('entities', {}).get('media', [])
                        if media_list and len(media_list) > 0:
                            thumbnail_url = media_list[0].get('media_url_https', '') or media_list[0].get('media_url', '')
                        
                        # If no media, try user profile pic
                        if not thumbnail_url:
                            thumbnail_url = user_data.get('profile_image_url_https', '')
                        
                        logger.info(f"Twitter syndication API: {likes:,} likes, {retweets:,} retweets, {replies:,} replies")
                    except json.JSONDecodeError:
                        logger.warning("Twitter syndication returned non-JSON")
            except Exception as e:
                logger.warning(f"Twitter syndication API failed: {e}")
            
            # METHOD 2: Fallback to page scraping if syndication failed
            if likes == 0 and retweets == 0:
                headers_list = [
                    {
                        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                        'Accept': '*/*',
                    },
                    {
                        'User-Agent': 'Twitterbot/1.0',
                        'Accept': 'text/html',
                    },
                    WebScraper.get_headers()
                ]
                
                for headers in headers_list:
                    try:
                        response = requests.get(tweet_url, headers=headers, timeout=15)
                        if response.status_code == 200:
                            soup = BeautifulSoup(response.text, 'html.parser')
                            
                            # Extract from meta tags
                            og_title = soup.find('meta', property='og:title')
                            og_desc = soup.find('meta', property='og:description')
                            og_image = soup.find('meta', property='og:image')
                            
                            if not og_image:
                                og_image = soup.find('meta', attrs={'name': 'twitter:image'})
                            
                            title_text = og_title.get('content', '') if og_title else ''
                            desc_text = og_desc.get('content', '') if og_desc else ''
                            
                            if not thumbnail_url:
                                thumbnail_url = og_image.get('content', '') if og_image else ''
                            
                            # Get tweet text from meta
                            if not tweet_text:
                                tweet_text = desc_text or title_text
                                if tweet_text:
                                    tweet_text = re.sub(r'^.*? on (Twitter|X):\s*["\']?', '', tweet_text, flags=re.IGNORECASE)
                                    tweet_text = tweet_text.strip('"\'')
                            
                            # Combine title and description for parsing engagement
                            all_text = f"{title_text} {desc_text}"
                            
                            # Parse engagement from meta tags (fallback)
                            if likes == 0:
                                abbrev_likes = re.search(r'([\d.]+)\s*([KMB])\s*likes?', all_text, re.IGNORECASE)
                                if abbrev_likes:
                                    num = float(abbrev_likes.group(1))
                                    suffix = abbrev_likes.group(2).upper()
                                    multiplier = {'K': 1000, 'M': 1000000, 'B': 1000000000}.get(suffix, 1)
                                    likes = int(num * multiplier)
                                else:
                                    exact_likes = re.search(r'([\d,]+)\s*likes?', all_text, re.IGNORECASE)
                                    if exact_likes:
                                        likes_str = exact_likes.group(1).replace(',', '')
                                        if likes_str.isdigit():
                                            likes = int(likes_str)
                            
                            if likes > 0 or thumbnail_url:
                                break
                    except Exception as e:
                        logger.warning(f"Twitter page scrape failed: {e}")
                        continue
            
            logger.info(f"Twitter scrape: @{author_name} - {likes:,} likes, {replies:,} replies, {retweets:,} retweets")
            
            return {
                'id': tweet_id,
                'title': tweet_text[:100] if tweet_text else f'Tweet by @{author_name}',
                'description': tweet_text,
                'thumbnailUrl': thumbnail_url,
                'url': tweet_url,
                'platform': 'twitter',
                'authorName': author_name,
                'createdAt': '',
                'engagement': {
                    'likes': likes,
                    'comments': replies,
                    'shares': retweets,
                    'views': views
                }
            }
            
        except Exception as e:
            logger.error(f"Error scraping Twitter tweet: {e}")
            return None
    
    @staticmethod
    def scrape_linkedin_post(post_url: str) -> Optional[Dict]:
        """
        Scrape LinkedIn Post data from URL
        Extracts reactions, comments, reposts from meta tags
        LinkedIn format: "45 reactions · 30 comments" or "1.2K reactions"
        """
        try:
            # LinkedIn URL format: https://www.linkedin.com/posts/username_activity-1234567890-abcdef
            post_id_match = re.search(r'activity-(\d+)', post_url)
            if not post_id_match:
                # Try alternative format
                post_id_match = re.search(r'/posts/([^/?]+)', post_url)
            
            post_id = post_id_match.group(1) if post_id_match else ''
            
            # Initialize engagement
            likes = 0
            comments = 0
            shares = 0
            post_text = ''
            thumbnail_url = ''
            author = ''
            
            # Try multiple user agents
            headers_list = [
                {
                    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                    'Accept': '*/*',
                },
                {
                    'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
                    'Accept': 'text/html',
                },
                {
                    'User-Agent': 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
                    'Accept': 'text/html',
                },
                WebScraper.get_headers()
            ]
            
            for headers in headers_list:
                try:
                    response = requests.get(post_url, headers=headers, timeout=15)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.text, 'html.parser')
                        
                        # Extract from meta tags
                        og_title = soup.find('meta', property='og:title')
                        og_desc = soup.find('meta', property='og:description')
                        og_image = soup.find('meta', property='og:image')
                        
                        title_text = og_title.get('content', '') if og_title else ''
                        desc_text = og_desc.get('content', '') if og_desc else ''
                        thumbnail_url = og_image.get('content', '') if og_image else ''
                        
                        # Combine title and description for parsing
                        all_text = f"{title_text} {desc_text}"
                        
                        # Log for debugging
                        logger.info(f"LinkedIn meta text: {all_text[:300]}...")
                        
                        # Get post text (clean version) - remove "| X comments on LinkedIn" suffix
                        post_text = desc_text or title_text
                        post_text = re.sub(r'\s*\|\s*\d+\s*comments?\s+on\s+LinkedIn\s*$', '', post_text, flags=re.IGNORECASE)
                        
                        # Parse engagement from meta tags
                        # LinkedIn meta description format: "Post text... | 30 comments on LinkedIn"
                        # NOTE: LinkedIn does NOT include reactions/likes in meta tags
                        # Reactions are only visible in JavaScript-rendered content
                        
                        # Try to find reactions in rendered HTML (may not work without JS)
                        page_text = response.text
                        
                        # Look for reactions in the HTML (LinkedIn shows them as plain numbers)
                        # Pattern: look for standalone numbers near "reactions" or "likes"
                        reaction_patterns = [
                            r'>\s*([\d,]+)\s*<[^>]*>\s*(?:reactions?|likes?)',  # >317< reactions
                            r'([\d,]+)\s*(?:reactions?|likes?)',  # 317 reactions
                            r'([\d,.]+)\s*([KMB])\s*(?:reactions?|likes?)',  # 1.2K reactions
                        ]
                        
                        for pattern in reaction_patterns:
                            match = re.search(pattern, page_text, re.IGNORECASE)
                            if match:
                                num_str = match.group(1).replace(',', '')
                                suffix = match.group(2).upper() if len(match.groups()) > 1 and match.group(2) else ''
                                if num_str.replace('.', '').isdigit():
                                    num = float(num_str)
                                    if suffix:
                                        multiplier = {'K': 1000, 'M': 1000000, 'B': 1000000000}.get(suffix, 1)
                                        likes = int(num * multiplier)
                                    else:
                                        likes = int(num)
                                    if likes > 0:
                                        logger.info(f"LinkedIn found reactions: {match.group(0)} -> {likes:,}")
                                        break
                        
                        # Comments - LinkedIn format: "| 30 comments on LinkedIn"
                        comment_patterns = [
                            r'\|\s*([\d,]+)\s*comments?\s+on\s+LinkedIn',  # | 30 comments on LinkedIn
                            r'([\d,]+)\s*([KMB])?\s*comments?',  # 30 comments
                            r'>\s*([\d,]+)\s*<[^>]*>\s*[Cc]omments?',  # >30< Comments
                        ]
                        
                        for pattern in comment_patterns:
                            match = re.search(pattern, all_text + ' ' + page_text, re.IGNORECASE)
                            if match:
                                num_str = match.group(1).replace(',', '')
                                suffix = match.group(2).upper() if len(match.groups()) > 1 and match.group(2) else ''
                                if num_str.replace('.', '').isdigit():
                                    num = float(num_str)
                                    if suffix:
                                        multiplier = {'K': 1000, 'M': 1000000, 'B': 1000000000}.get(suffix, 1)
                                        comments = int(num * multiplier)
                                    else:
                                        comments = int(num)
                                    if comments > 0:
                                        logger.info(f"LinkedIn found comments: {match.group(0).strip()} -> {comments:,}")
                                        break
                        
                        # Reposts/Shares
                        share_patterns = [
                            r'([\d,]+)\s*([KMB])?\s*reposts?',
                            r'([\d,]+)\s*([KMB])?\s*shares?',
                            r'>\s*([\d,]+)\s*<[^>]*>\s*(?:reposts?|shares?)',
                        ]
                        
                        for pattern in share_patterns:
                            match = re.search(pattern, page_text, re.IGNORECASE)
                            if match:
                                num_str = match.group(1).replace(',', '')
                                suffix = match.group(2).upper() if len(match.groups()) > 1 and match.group(2) else ''
                                if num_str.replace('.', '').isdigit():
                                    num = float(num_str)
                                    if suffix:
                                        multiplier = {'K': 1000, 'M': 1000000, 'B': 1000000000}.get(suffix, 1)
                                        shares = int(num * multiplier)
                                    else:
                                        shares = int(num)
                                    if shares > 0:
                                        logger.info(f"LinkedIn found shares: {match.group(0)} -> {shares:,}")
                                        break
                        
                        if likes > 0 or comments > 0 or thumbnail_url:
                            break  # Got good data
                except Exception as e:
                    logger.warning(f"LinkedIn scrape attempt failed: {e}")
                    continue
            
            # Extract author from URL
            author_match = re.search(r'linkedin\.com/in/([^/?]+)', post_url)
            if not author_match:
                posts_match = re.search(r'linkedin\.com/posts/([^_]+)_', post_url)
                if posts_match:
                    author_match = posts_match
            author = author_match.group(1) if author_match else ''
            
            logger.info(f"LinkedIn scrape: @{author} - {likes:,} reactions, {comments:,} comments, {shares:,} shares")
            
            return {
                'id': post_id,
                'title': post_text[:100] or f'LinkedIn Post by {author}',
                'description': post_text,
                'thumbnailUrl': thumbnail_url,
                'url': post_url,
                'platform': 'linkedin',
                'authorName': author,
                'createdAt': '',
                'engagement': {
                    'likes': likes,
                    'comments': comments,
                    'shares': shares,
                    'views': 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error scraping LinkedIn post: {e}")
            return None
    
    @staticmethod
    def _parse_count(count_str: str) -> int:
        """Parse count string like '1.2K' or '5M' to integer"""
        try:
            count_str = count_str.upper().strip()
            if 'K' in count_str:
                return int(float(count_str.replace('K', '')) * 1000)
            elif 'M' in count_str:
                return int(float(count_str.replace('M', '')) * 1000000)
            elif 'B' in count_str:
                return int(float(count_str.replace('B', '')) * 1000000000)
            else:
                return int(count_str)
        except:
            return 0
    
    @staticmethod
    def verify_url_ownership(url: str, platform: str, claimed_username: str = '') -> Dict[str, any]:
        """
        Verify URL ownership through pattern matching
        Returns dict with 'verified' (bool) and 'message' (str)
        """
        try:
            if platform == 'instagram':
                # Extract username from Instagram URL
                # Format: https://www.instagram.com/username/reel/ABC123/ or /reel/ABC123/
                username_match = re.search(r'instagram\.com/([^/?]+)/reel/', url)
                if not username_match:
                    # Try alternative format: /reel/ABC123/ (no username in URL - common for reels)
                    username_match = re.search(r'instagram\.com/([^/?]+)', url)
                    # If it's just 'reel', there's no username in URL
                    if username_match and username_match.group(1) == 'reel':
                        username_match = None
                
                if username_match:
                    # Username found in URL - strict verification
                    url_username = username_match.group(1).lower()
                    if claimed_username:
                        claimed_lower = claimed_username.replace('@', '').lower()
                        if url_username != claimed_lower:
                            return {
                                'verified': False,
                                'message': f'Username mismatch! URL shows @{url_username} but you claimed @{claimed_username}. Only the content owner can tokenize.'
                            }
                        return {
                            'verified': True,
                            'message': f'Username verified: @{url_username} matches your claim.'
                        }
                    else:
                        # No username claimed - require it for verification
                        return {
                            'verified': False,
                            'message': f'Please enter your Instagram username (@{url_username}) to verify ownership. URL shows this reel belongs to @{url_username}.'
                        }
                else:
                    # No username in URL (common for reel URLs like /reel/ABC123/)
                    # Accept username if provided by user
                    if claimed_username:
                        return {
                            'verified': True,
                            'message': f'Instagram Reel URL detected. Username @{claimed_username} provided for verification. Please ensure this is your content.'
                        }
                    return {
                        'verified': False,
                        'message': 'Instagram Reel URL detected (no username in URL). Please enter your Instagram username to verify ownership.'
                    }
            
            elif platform == 'twitter':
                # Handle both twitter.com and x.com URLs
                username_match = re.search(r'(?:twitter\.com|x\.com)/([^/?]+)/status/', url)
                if username_match:
                    url_username = username_match.group(1).lower()
                    if claimed_username:
                        claimed_lower = claimed_username.replace('@', '').lower()
                        if url_username != claimed_lower:
                            return {
                                'verified': False,
                                'message': f'Username mismatch! URL shows @{url_username} but you claimed @{claimed_username}. Only the content owner can tokenize.'
                            }
                        return {
                            'verified': True,
                            'message': f'Username verified: @{url_username} matches your claim.'
                        }
                    return {
                        'verified': False,
                        'message': f'Please enter your Twitter/X username (@{url_username}) to verify ownership. URL shows this tweet belongs to @{url_username}.'
                    }
                return {
                    'verified': False,
                    'message': 'Could not extract username from Twitter/X URL. Please ensure the URL format is: https://twitter.com/username/status/... or https://x.com/username/status/...'
                }
            
            elif platform == 'linkedin':
                # LinkedIn URLs are harder to verify - extract username from URL
                # Format: /in/username/posts/... or /posts/username_activity-123456
                username_match = re.search(r'linkedin\.com/in/([^/?]+)', url)
                if not username_match:
                    # Try posts format: /posts/username_activity-123456
                    posts_match = re.search(r'linkedin\.com/posts/([^_]+)_', url)
                    if posts_match:
                        username_match = posts_match
                
                if username_match:
                    url_username = username_match.group(1).lower()
                    if claimed_username:
                        claimed_lower = claimed_username.replace('@', '').lower()
                        if url_username != claimed_lower:
                            return {
                                'verified': False,
                                'message': f'Username mismatch! URL shows @{url_username} but you claimed @{claimed_username}. Only the content owner can tokenize.'
                            }
                        return {
                            'verified': True,
                            'message': f'Username verified: @{url_username} matches your claim.'
                        }
                    return {
                        'verified': False,
                        'message': f'Please enter your LinkedIn username (@{url_username}) to verify ownership. URL shows this post belongs to @{url_username}.'
                    }
                
                # Fallback: If URL format is valid but username not found
                if 'linkedin.com/posts' in url or 'linkedin.com/feed' in url or 'linkedin.com/in/' in url:
                    if claimed_username:
                        return {
                            'verified': True,
                            'message': 'LinkedIn post detected. Username provided.'
                        }
                    return {
                        'verified': False,
                        'message': 'Please enter your LinkedIn username to verify ownership.'
                    }
                return {
                    'verified': False,
                    'message': 'Invalid LinkedIn URL format. Expected: https://www.linkedin.com/in/username/posts/... or https://www.linkedin.com/posts/username_activity-...'
                }
            
            return {
                'verified': False,
                'message': f'Unsupported platform: {platform}'
            }
            
        except Exception as e:
            logger.error(f"Error verifying URL ownership: {e}")
            return {
                'verified': False,
                'message': f'Verification error: {str(e)}'
            }

