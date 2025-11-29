import React from 'react'

export const TokenIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <radialGradient id="tokenShine">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Main Token */}
      <circle cx="150" cy="150" r="80" fill="url(#tokenGradient)" />
      <circle cx="150" cy="150" r="80" fill="url(#tokenShine)" />
      
      {/* Inner Circle */}
      <circle cx="150" cy="150" r="60" fill="rgba(255,255,255,0.1)" />
      
      {/* ContentVault Symbol */}
      <path
        d="M 120 130 L 150 110 L 180 130 L 180 170 L 150 190 L 120 170 Z"
        fill="white"
        opacity="0.9"
      />
      
      {/* Sparkles */}
      <circle cx="100" cy="100" r="3" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="100" r="3" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="200" r="3" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" begin="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="200" r="3" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" begin="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

