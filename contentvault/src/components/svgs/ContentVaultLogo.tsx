import React from 'react'

export const ContentVaultLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Vault Shape */}
      <defs>
        <linearGradient id="vaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      
      {/* Vault Base */}
      <rect x="30" y="100" width="140" height="70" rx="10" fill="url(#vaultGradient)" opacity="0.9" />
      
      {/* Vault Door */}
      <rect x="50" y="110" width="100" height="50" rx="5" fill="url(#vaultGradient)" />
      
      {/* Lock */}
      <circle cx="100" cy="135" r="12" fill="url(#lockGradient)" />
      <rect x="92" y="135" width="16" height="8" rx="2" fill="url(#lockGradient)" />
      
      {/* Content Symbols */}
      <circle cx="70" cy="125" r="4" fill="white" opacity="0.8" />
      <circle cx="100" cy="125" r="4" fill="white" opacity="0.8" />
      <circle cx="130" cy="125" r="4" fill="white" opacity="0.8" />
      
      {/* Shine Effect */}
      <ellipse cx="100" cy="135" rx="30" ry="20" fill="white" opacity="0.2" />
    </svg>
  )
}

