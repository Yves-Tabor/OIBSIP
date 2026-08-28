import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as HamburgerIcon, X, User as UserIcon, LogOut, Shield, Mail, CheckCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/useAuth';
import { logout } from '../../features/auth/authSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  // Automatically close dropdowns on route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setIsUserOpen(false);
  };

  return (
    <nav className="border-b border-brand-border bg-brand-surface-elevated relative z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* LEFT SECTION: Hamburger Menu */}
          <div className="flex items-center w-1/3">
            {/* Hamburger Button */}
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsUserOpen(false);
              }}
              className="p-2 rounded-md text-brand-text-secondary hover:text-brand-choco hover:bg-brand-surface transition-all duration-200"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={22} /> : <HamburgerIcon size={22} />}
            </button>
          </div>

          {/* CENTER SECTION: Logo */}
          <div className="flex items-center justify-center w-1/3 text-center">
            <Link to="/" className="flex items-center justify-center space-x-2">
              <span className="font-heading text-2xl font-bold text-brand-choco-dark hover:text-brand-orange transition-colors duration-150">
                DailyPizza
              </span>
            </Link>
          </div>

          {/* RIGHT SECTION: User Profile or Quick Auth Links */}
          <div className="flex items-center justify-end w-1/3">
            {isAuthenticated ? (
              /* User Icon (when authenticated) */
              <button
                onClick={() => {
                  setIsUserOpen(!isUserOpen);
                  setIsMenuOpen(false);
                }}
                className={`p-2 rounded-md transition-all duration-200 ${
                  isUserOpen
                    ? 'text-brand-orange bg-brand-orange-pale'
                    : 'text-brand-text-secondary hover:text-brand-choco hover:bg-brand-surface'
                }`}
                aria-label="Toggle user profile info"
              >
                <UserIcon size={22} />
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-brand-text-secondary hover:text-brand-choco transition-colors duration-150"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-orange text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-brand-orange-light transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ABSOLUTE NAVIGATION DRAWER (Overlays elements) */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] mt-16"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Dropdown Menu */}
          <div className="absolute top-16 left-0 w-full bg-brand-surface-elevated/95 backdrop-blur-md border-b border-brand-border py-6 px-6 shadow-xl z-50 animate-fade-down">
            <div className="max-w-6xl mx-auto flex flex-col space-y-4">
              <Link
                to="/"
                className="text-base font-semibold text-brand-text-primary hover:text-brand-orange py-1 transition-colors border-b border-brand-border/30"
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/menu"
                    className="text-base font-semibold text-brand-text-primary hover:text-brand-orange py-1 transition-colors border-b border-brand-border/30"
                  >
                    Menu
                  </Link>
                  <Link
                    to="/orders"
                    className="text-base font-semibold text-brand-text-primary hover:text-brand-orange py-1 transition-colors border-b border-brand-border/30"
                  >
                    My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-base font-semibold text-brand-choco hover:text-brand-orange py-1 transition-colors border-b border-brand-border/30 flex items-center gap-1.5"
                    >
                      <Shield size={16} />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-base font-semibold text-red-600 hover:text-red-500 py-1 transition-colors text-left flex items-center gap-1.5"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-base font-semibold text-brand-text-primary hover:text-brand-orange py-1 transition-colors border-b border-brand-border/30"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-base font-semibold text-brand-orange hover:text-brand-orange-light py-1 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ABSOLUTE USER DETAIL CARD (Overlays elements) */}
      {isUserOpen && isAuthenticated && user && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/10 mt-16"
            onClick={() => setIsUserOpen(false)}
          />
          {/* Dropdown Card */}
          <div className="absolute top-16 right-4 w-72 bg-white border border-brand-border rounded-lg p-5 shadow-2xl z-50 animate-fade-down sm:right-8">
            <div className="flex items-center space-x-3 mb-4 border-b border-brand-border pb-3">
              <div className="w-10 h-10 rounded-full bg-brand-orange-pale text-brand-orange flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-brand-choco-dark">
                  {user.name}
                </h4>
                <span className="inline-flex items-center gap-1 bg-brand-orange-pale text-brand-orange text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full mt-0.5">
                  {user.role === 'admin' && <Shield size={10} />}
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm text-brand-text-secondary mb-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-brand-text-muted shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500 shrink-0" />
                <span className="text-green-700 font-medium">Verified Account</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-brand-choco text-white px-3 py-2 rounded text-xs font-semibold hover:bg-brand-choco-mid transition-colors duration-150 flex items-center justify-center gap-1.5"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </>
      )}

    </nav>
  );
};

export default Navbar;
