import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register(name, email, password, phone);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-lg shadow-[#0062E3]/25 mx-auto bg-white dark:bg-[#02122c] p-1 border border-slate-200 dark:border-white/15 flex items-center justify-center">
            <img
              src="/images/skyhaven-logo.png"
              alt="SkyHaven Logo"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h1 className="text-xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            Join SkyHaven
          </h1>
          <p className="text-xs text-slate-500">Create your account for instant flight bookings & seat maps.</p>
        </div>

        {/* Form Card */}
        <Card className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Alex Mercer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Phone Number (Optional)"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="glow"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-500 hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
