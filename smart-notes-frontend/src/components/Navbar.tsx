import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { logout as logoutApi } from '../api/auth'
import { getUnreadCount } from '../api/notifications'
import ChangePasswordModal from './ChangePasswordModal'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    getUnreadCount()
      .then((res) => setUnreadCount(res.data.unread_count))
      .catch(() => {})
  }, [user, location.pathname])

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileDrawerOpen(false)
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
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left side: Logo & Desktop Links */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-green-800 transition-colors">
                  <span className="text-white font-bold text-lg leading-none">S</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">
                  Smart Notes
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <Link to="/dashboard" className={getLinkClass('/dashboard')}>My Notes</Link>
                <Link to="/shared" className={getLinkClass('/shared')}>Shared With Me</Link>
                <Link to="/notifications" className={getLinkClass('/notifications')}>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={getLinkClass('/admin')}>Admin Panel</Link>
                )}
              </div>
            </div>

            {/* Right side: Mobile Toggle & Profile Avatar */}
            <div className="flex items-center gap-3">
              {/* Profile Avatar Button (Desktop & Mobile) */}
              <button
                onClick={() => setIsProfileDrawerOpen(true)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center text-sm font-bold shadow-sm">
                  {user.email.charAt(0).toUpperCase()}
                </div>
              </button>

              {/* Mobile Menu Toggle Button */}
              <div className="md:hidden flex items-center border-l border-gray-200 pl-3">
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
        </div>

        {/* Mobile Menu Dropdown (Nav Links Only) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg pb-4">
            <div className="px-4 py-3 space-y-1">
              <Link to="/dashboard" className={getLinkClass('/dashboard')}>My Notes</Link>
              <Link to="/shared" className={getLinkClass('/shared')}>Shared With Me</Link>
              <Link to="/notifications" className={getLinkClass('/notifications')}>
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className={getLinkClass('/admin')}>Admin Panel</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for Profile Drawer */}
      {isProfileDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsProfileDrawerOpen(false)}
        />
      )}

      {/* Right-side Profile Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isProfileDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Account</h2>
          <button 
            onClick={() => setIsProfileDrawerOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Body - User Info */}
        <div className="p-6 flex flex-col items-center border-b border-gray-100">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md mb-4">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center truncate w-full px-4">
            {user.email}
          </h3>
          <span className="mt-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full capitalize">
            {user.role || 'User'} Account
          </span>
        </div>

        {/* Drawer Actions */}
        <div className="p-4 flex flex-col gap-2 flex-grow">
          <button
            onClick={() => {
              setIsProfileDrawerOpen(false); // Close drawer
              setIsPasswordModalOpen(true);  // Open modal
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white rounded-xl hover:bg-gray-50 border border-gray-100 shadow-sm transition-all"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Change Password
          </button>
        </div>

        {/* Drawer Footer - Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </>
  )
}