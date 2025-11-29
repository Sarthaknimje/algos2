import React from 'react'

export const BlockchainIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="blockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
        <linearGradient id="chainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      
      {/* Blockchain Blocks */}
      <g opacity="0.9">
        {/* Block 1 */}
        <rect x="50" y="100" width="80" height="80" rx="8" fill="url(#blockGradient)" />
        <rect x="60" y="110" width="60" height="60" rx="4" fill="rgba(255,255,255,0.1)" />
        <text x="100" y="150" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">1</text>
        
        {/* Chain Link 1 */}
        <path d="M 130 140 L 150 140" stroke="url(#chainGradient)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="150" cy="140" r="6" fill="url(#chainGradient)" />
        
        {/* Block 2 */}
        <rect x="170" y="100" width="80" height="80" rx="8" fill="url(#blockGradient)" />
        <rect x="180" y="110" width="60" height="60" rx="4" fill="rgba(255,255,255,0.1)" />
        <text x="210" y="150" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">2</text>
        
        {/* Chain Link 2 */}
        <path d="M 250 140 L 270 140" stroke="url(#chainGradient)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="270" cy="140" r="6" fill="url(#chainGradient)" />
        
        {/* Block 3 */}
        <rect x="290" y="100" width="80" height="80" rx="8" fill="url(#blockGradient)" />
        <rect x="300" y="110" width="60" height="60" rx="4" fill="rgba(255,255,255,0.1)" />
        <text x="330" y="150" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">3</text>
      </g>
      
      {/* Glow Effects */}
      <ellipse cx="100" cy="140" rx="50" ry="30" fill="url(#blockGradient)" opacity="0.2" />
      <ellipse cx="210" cy="140" rx="50" ry="30" fill="url(#blockGradient)" opacity="0.2" />
      <ellipse cx="330" cy="140" rx="50" ry="30" fill="url(#blockGradient)" opacity="0.2" />
    </svg>
  )
}

