import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { toast } from 'react-hot-toast';
import { login } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Welcome back to Royal Mobiles Admin!');
        navigate('/');
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#080c0a] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      {/* Ambient Emerald Glow Backdrops */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-green-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Corner Theme Switch */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 dark:bg-[#111914]/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-gray-100 dark:border-emerald-950/70 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-8">
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="relative inline-block group">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-green-400 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300" />
              <img
                src="/royal-logo.png"
                alt="Royal Mobiles Logo"
                className="relative mx-auto h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-emerald-950/60 text-primary-700 dark:text-emerald-300 border border-primary-200 dark:border-emerald-800/40 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Admin Operations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                Welcome Back
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your credentials to manage Royal Mobiles store.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@royalmobiles.com"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-gray-50 dark:bg-[#16221b] text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-gray-50 dark:bg-[#16221b] text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In to Console
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;