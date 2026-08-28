import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { forgotPassword, clearError } from '../features/auth/authSlice';
import registrationBg from '../img/registrationIMG.jpg';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(forgotPassword(email));
    if (forgotPassword.fulfilled.match(result)) {
      setSubmitted(true);
    }
  };

  return (
    <div
      className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 animate-fade-in bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${registrationBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-brand-choco-dark/30 to-black/65 backdrop-blur-[3px]" />
      <div className="w-full max-w-md animate-scale-in relative z-10">
        <div className="bg-brand-surface/90 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl">

          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-brand-text-muted hover:text-brand-orange transition-colors duration-150 mb-6"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>

          {submitted ? (
            /* ── Success state ── */
            <div className="text-center animate-fade-up">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={36} className="text-green-600" />
                </div>
              </div>
              <h1 className="font-heading text-2xl font-bold text-brand-choco-dark mb-3">
                Check your inbox
              </h1>
              <p className="text-brand-text-secondary text-sm mb-6">
                If <span className="font-medium text-brand-choco-dark">{email}</span> is
                registered with DailyPizza, you&apos;ll receive a password reset link shortly.
                The link expires in <span className="font-medium">1 hour</span>.
              </p>
              <p className="text-xs text-brand-text-muted">
                Didn&apos;t receive an email? Check your spam folder or{' '}
                <button
                  onClick={() => { setSubmitted(false); }}
                  className="text-brand-orange hover:text-brand-orange-light font-medium transition-colors duration-150"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h1 className="font-heading text-3xl font-bold text-brand-choco-dark text-center mb-2">
                Forgot Password?
              </h1>
              <p className="text-brand-text-secondary text-center text-sm mb-8">
                Enter your account email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-brand-text-secondary mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                    <input
                      type="email"
                      id="forgot-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-brand-border rounded px-3 py-2.5 pl-10 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-orange text-white px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-orange-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send size={16} />
                  <span>{isLoading ? 'Sending…' : 'Send Reset Link'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
