import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { logout as logoutApi } from '../api/auth'
import { getUnreadCount } from '../api/notifications'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [unreadCount, setUnreadCount] = useState(0)
  // New state to control mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    getUnreadCount()
      .then((res) => setUnreadCount(res.data.unread_count))
      .catch(() => {})
  }, [user, location.pathname])

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // Silent fallback if API fails during logout
    }
    logout()
    navigate('/login')
  }

  if (!user) return null

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path
    return `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between md:justify-start gap-2 ${
      isActive
        ? 'bg-green-50 text-green-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Branding & Desktop Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-green-800 transition-colors">
                <span className="text-white font-bold text-lg leading-none">S</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                Smart Notes
              </span>
            </Link>

            {/* Desktop Links (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                My Notes
              </Link>

              <Link to="/shared" className={getLinkClass('/shared')}>
                Shared With Me
              </Link>

              <Link to="/notifications" className={getLinkClass('/notifications')}>
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {user?.role === 'admin' && (
                <Link to="/admin" className={getLinkClass('/admin')}>
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* Right Side: Desktop User Profile & Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center text-sm font-bold border border-blue-200 shadow-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{user.email}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg pb-4">
          <div className="px-4 py-3 space-y-1">
            <Link to="/dashboard" className={getLinkClass('/dashboard')}>
              My Notes
            </Link>

            <Link to="/shared" className={getLinkClass('/shared')}>
              Shared With Me
            </Link>

            <Link to="/notifications" className={getLinkClass('/notifications')}>
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {user?.role === 'admin' && (
              <Link to="/admin" className={getLinkClass('/admin')}>
                Admin Panel
              </Link>
            )}
          </div>

          {/* Mobile User Profile & Logout */}
          <div className="px-4 pt-4 mt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center text-base font-bold border border-blue-200 shadow-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                {user.email}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}