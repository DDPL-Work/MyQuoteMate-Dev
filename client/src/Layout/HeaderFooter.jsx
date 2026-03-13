import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  FileText
} from 'lucide-react';

import logo from '../assets/logo.png';
import { useAuth } from '../hooks/useAuth';

const HeaderFooter = ({ children }) => {
  const { user, isAuthenticated, logout, showLogin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ---------------------------
  // Effects
  // ---------------------------
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuOpen && !e.target.closest('.profile-menu')) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  // ---------------------------
  // Helpers
  // ---------------------------
  const isActive = (path) => location.pathname === path;

  const avatarInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'U';

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Guides', path: '/guides' },
    { name: 'Contact', path: '/contact' }
  ];

  const footerLinks = {
    'Quick Links': navigationItems,
    Support: [
      { name: 'FAQ', path: '/faq' },
      { name: 'Check Your Quote', path: '/check-quote' }
    ],
    Legal: [
      { name: 'Terms & Conditions', path: '/terms' },
      { name: 'Privacy Notice', path: '/privacy' },
      { name: 'About Us', path: '/about' }
    ]
  };

  const handleProfileAction = (action) => {
    setProfileMenuOpen(false);

    switch (action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'logout':
        logout();
        navigate('/');
        break;
      default:
        break;
    }
  };


  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* HEADER */}
      <header
        className={`sticky top-0 z-50 transition-all ${scrolled
          ? 'bg-white/95 backdrop-blur shadow-lg border-b'
          : 'bg-white border-b'
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 h-16 lg:h-20 flex items-center justify-between">
          {/* Logo */}

          <img
            src={logo}
            alt="MyQuoteMate"
            className="h-80 lg:h-84 object-contain"
          />


          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isActive(item.path)
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {item.name}
              </Link>
            ))}

            <Link
              to="/check-quote"
              className="ml-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-700 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Check Your Quote
            </Link>

            {/* Auth Section - Only Sign In button */}
            {isAuthenticated ? (
              <div className="relative profile-menu ml-4">
                <button
                  onClick={() => setProfileMenuOpen((p) => !p)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {avatarInitials}
                    </div>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition ${profileMenuOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border overflow-hidden">
                    <div className="p-4 border-b">
                      <p className="font-semibold">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                      {user.accountStatus === 'active' && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                          Active Account
                        </span>
                      )}
                    </div>

                    <div className="py-2">
                      <ProfileItem
                        icon={<User className="w-4 h-4" />}
                        label="My Profile"
                        onClick={() => handleProfileAction('profile')}
                      />
                    </div>

                    <div className="border-t p-3">
                      <button
                        onClick={() => handleProfileAction('logout')}
                        className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={showLogin}
                className="ml-4 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pb-4 space-y-2 bg-white border-t">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                  ? 'bg-orange-50 text-orange-600'
                  : 'hover:bg-gray-50'
                  }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-2 border-t">
              <Link
                to="/check-quote"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-700 text-white rounded-lg font-semibold text-center"
              >
                Check Your Quote
              </Link>
            </div>

            {!isAuthenticated && (
              <div className="pt-2 border-t">
                <button
                  onClick={() => {
                    showLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold text-center"
                >
                  Sign In
                </button>
              </div>
            )}

            {isAuthenticated && (
              <div className="pt-2 border-t">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {avatarInitials}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="flex-grow">{children}</main>

      {/* FOOTER */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <img
              src={logo}
              alt="MyQuoteMate"
              className="h-70 object-contain"
            />


            <p className="text-sm text-gray-600 max-w-md">
              Helping Australian homeowners understand tradie quotes with
              confidence using AI-powered analysis.
            </p>
          </div>


          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MyQuoteMate. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

/* ---------------------------------- */
/* Reusable Profile Item */
/* ---------------------------------- */
const ProfileItem = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
  >
    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
      {icon}
    </div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default HeaderFooter;