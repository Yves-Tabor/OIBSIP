import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { register } from '../features/auth/authSlice';
import registrationBg from '../img/registrationIMG.jpg';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const result = await dispatch(register({ name, email, password }));
    if (register.fulfilled.match(result)) {
      navigate('/login', { state: { message: 'Account created: login to continue' } });
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
          <h1 className="font-heading text-3xl font-bold text-brand-choco-dark text-center mb-2">
            Create Account
          </h1>
          <p className="text-brand-text-secondary text-center mb-8">
            Join DailyPizza today
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded px-3 py-2.5 pl-10 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                  placeholder="Yves Tabor"
                  required
                />
              </div>
            </div>

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
                  className="w-full bg-white border border-brand-border rounded px-3 py-2.5 pl-10 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded px-3 py-2.5 pl-10 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-text-secondary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded px-3 py-2.5 pl-10 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-orange text-white px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-orange-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <UserPlus size={18} />
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-orange hover:text-brand-orange-light font-medium transition-colors duration-150">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
