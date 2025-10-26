import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="bg-primary text-white px-3 py-1 rounded-lg font-bold">
              DriveFi
            </div>
            <span className="text-gray-700 font-semibold hidden md:block">
              Traffic to Earn
            </span>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary transition"
              >
                Dashboard
              </Link>
              <Link
                to="/marketplace"
                className="text-gray-700 hover:text-primary transition"
              >
                Marketplace
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-primary transition"
              >
                Profile
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 hidden md:block">
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

