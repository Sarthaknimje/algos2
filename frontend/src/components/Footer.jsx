const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold">DriveFi Network</h3>
            <p className="text-gray-400 text-sm">
              Earn rewards while stuck in traffic
            </p>
          </div>
          <div className="text-center md:text-right text-sm text-gray-400">
            <p>&copy; 2024 DriveFi. All rights reserved.</p>
            <p className="mt-1">Traffic-to-Earn Platform</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

