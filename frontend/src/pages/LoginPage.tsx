import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, WifiOff, MailWarning, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { login, clearError } from '../features/auth/authSlice';
import registrationBg from '../img/registrationIMG.jpg';

// Maps error codes from authSlice to user-friendly UI
const ErrorBanner = ({ code }: { code: string }) => {
  if (code === 'EMAIL_NOT_VERIFIED') {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md mb-6 text-sm">
        <MailWarning size={18} className="shrink-0 mt-0.5 text-amber-500" />
        <span>
          Your email address hasn&apos;t been verified yet.{' '}
          <span className="font-medium">Please check your inbox</span> for the verification link
          we sent when you registered.
        </span>
      </div>
    );
  }

  if (code === 'NETWORK_ERROR') {
    return (
      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-md mb-6 text-sm">
        <WifiOff size={18} className="shrink-0 mt-0.5 text-slate-500" />
        <span>
          Unable to reach the server. Please{' '}
          <span className="font-medium">check your internet connection</span> and try again.
        </span>
      </div>
    );
  }

  const message =
    code === 'INVALID_CREDENTIALS'
      ? 'The email or password you entered is incorrect. Please try again.'
      : code;

  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6 text-sm">
      <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
      <span>{message}</span>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // Clear any stale errors when mounting
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Trigger shake animation on new error
  useEffect(() => {
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate('/menu');
    }
  };

  return (
    <div
      className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 animate-fade-in bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${registrationBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-brand-choco-dark/30 to-black/65 backdrop-blur-[3px]" />
      <div className={`w-full max-w-md animate-scale-in relative z-10 ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
        <div className="bg-brand-surface/90 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl">
          <h1 className="font-heading text-3xl font-bold text-brand-choco-dark text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-brand-text-secondary text-center mb-8">
            Sign in to your DailyPizza account
          </p>

          {error && <ErrorBanner code={error} />}

          {location.state?.message && !error && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6 text-sm animate-fade-in">
              <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-500" />
              <span>{location.state.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-white border rounded px-3 py-2.5 pl-10 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:ring-2 transition-colors duration-150 ${
                    error === 'INVALID_CREDENTIALS'
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                      : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/20'
                  }`}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-brand-text-secondary">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-orange hover:text-brand-orange-light font-medium transition-colors duration-150"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white border rounded px-3 py-2.5 pl-10 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:ring-2 transition-colors duration-150 ${
                    error === 'INVALID_CREDENTIALS'
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                      : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/20'
                  }`}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-choco text-white px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-choco-mid transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <LogIn size={18} />
              <span>{isLoading ? 'Signing in…' : 'Sign In'}</span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-orange hover:text-brand-orange-light font-medium transition-colors duration-150">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
