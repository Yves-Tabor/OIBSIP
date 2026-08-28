import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { resetPassword, clearError } from '../features/auth/authSlice';
import registrationBg from '../img/registrationIMG.jpg';

const StrengthBar = ({ password }: { password: string }) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-500'];
  const textColors = ['', 'text-red-500', 'text-amber-500', 'text-yellow-600', 'text-green-600'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : 'bg-brand-border'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
};

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientError, setClientError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');

    if (password.length < 6) {
      setClientError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setClientError('Passwords do not match.');
      return;
    }

    if (!token) {
      setClientError('Invalid or missing reset token.');
      return;
    }

    const result = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  const displayError = clientError || error;

  return (
    <div
      className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 animate-fade-in bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${registrationBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-brand-choco-dark/30 to-black/65 backdrop-blur-[3px]" />
      <div className="w-full max-w-md animate-scale-in relative z-10">
        <div className="bg-brand-surface/90 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl">

          {success ? (
            /* ── Success state ── */
            <div className="text-center animate-fade-up">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={36} className="text-green-600" />
                </div>
              </div>
              <h1 className="font-heading text-2xl font-bold text-brand-choco-dark mb-3">
                Password Reset!
              </h1>
              <p className="text-brand-text-secondary text-sm mb-4">
                Your password has been updated successfully. Redirecting you to the sign in
                page…
              </p>
              <Link
                to="/login"
                className="text-brand-orange hover:text-brand-orange-light text-sm font-medium transition-colors duration-150"
              >
                Go to Sign In now →
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-orange-pale flex items-center justify-center">
                  <ShieldCheck size={24} className="text-brand-orange" />
                </div>
              </div>
              <h1 className="font-heading text-3xl font-bold text-brand-choco-dark text-center mb-2">
                Reset Password
              </h1>
              <p className="text-brand-text-secondary text-center text-sm mb-8">
                Choose a strong new password for your account.
              </p>

              {displayError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                  <span>{displayError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-brand-text-secondary mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-brand-border rounded px-3 py-2.5 pl-10 pr-10 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text-primary transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <StrengthBar password={password} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-brand-text-secondary mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-white border rounded px-3 py-2.5 pl-10 pr-10 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:ring-2 transition-colors duration-150 ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                          : confirmPassword && confirmPassword === password
                          ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
                          : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/20'
                      }`}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text-primary transition-colors"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-choco text-white px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-choco-mid transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShieldCheck size={18} />
                  <span>{isLoading ? 'Resetting…' : 'Reset Password'}</span>
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-brand-text-muted">
                Remember your password?{' '}
                <Link to="/login" className="text-brand-orange hover:text-brand-orange-light font-medium transition-colors duration-150">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
