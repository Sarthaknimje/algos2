const TokenBalance = ({ balance = 0 }) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm mb-1">Your Balance</p>
          <h2 className="text-3xl font-bold">{balance.toLocaleString()}</h2>
          <p className="text-blue-100 text-xs mt-1">DriveFi Tokens</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full p-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default TokenBalance

