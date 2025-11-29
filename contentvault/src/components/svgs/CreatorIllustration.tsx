import React from 'react'

export const CreatorIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="creatorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      
      {/* Creator Figure */}
      <circle cx="200" cy="120" r="40" fill="url(#creatorGradient)" opacity="0.9" />
      
      {/* Body */}
      <rect x="170" y="160" width="60" height="80" rx="30" fill="url(#creatorGradient)" opacity="0.9" />
      
      {/* Arms */}
      <rect x="140" y="170" width="20" height="60" rx="10" fill="url(#creatorGradient)" opacity="0.9" />
      <rect x="240" y="170" width="20" height="60" rx="10" fill="url(#creatorGradient)" opacity="0.9" />
      
      {/* Content Icons Around */}
      <circle cx="100" cy="100" r="25" fill="rgba(139, 92, 246, 0.3)" stroke="url(#creatorGradient)" strokeWidth="2">
        <animate attributeName="r" values="25;30;25" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="100" y="108" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">YT</text>
      
      <circle cx="300" cy="100" r="25" fill="rgba(217, 70, 239, 0.3)" stroke="url(#creatorGradient)" strokeWidth="2">
        <animate attributeName="r" values="25;30;25" dur="3s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <text x="300" y="108" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">IG</text>
      
      <circle cx="100" cy="200" r="25" fill="rgba(6, 182, 212, 0.3)" stroke="url(#creatorGradient)" strokeWidth="2">
        <animate attributeName="r" values="25;30;25" dur="3s" begin="1s" repeatCount="indefinite" />
      </circle>
      <text x="100" y="208" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">X</text>
      
      <circle cx="300" cy="200" r="25" fill="rgba(139, 92, 246, 0.3)" stroke="url(#creatorGradient)" strokeWidth="2">
        <animate attributeName="r" values="25;30;25" dur="3s" begin="1.5s" repeatCount="indefinite" />
      </circle>
      <text x="300" y="208" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">LI</text>
      
      {/* Connection Lines */}
      <path d="M 140 120 L 100 100" stroke="url(#creatorGradient)" strokeWidth="2" opacity="0.5" strokeDasharray="5,5">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M 260 120 L 300 100" stroke="url(#creatorGradient)" strokeWidth="2" opacity="0.5" strokeDasharray="5,5">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </path>
      <path d="M 140 200 L 100 200" stroke="url(#creatorGradient)" strokeWidth="2" opacity="0.5" strokeDasharray="5,5">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="1s" repeatCount="indefinite" />
      </path>
      <path d="M 260 200 L 300 200" stroke="url(#creatorGradient)" strokeWidth="2" opacity="0.5" strokeDasharray="5,5">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="1.5s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

