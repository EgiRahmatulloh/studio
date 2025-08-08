
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Jika pengguna sudah login, arahkan ke dashboard
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      toast({
        title: 'Login berhasil',
        description: 'Selamat datang kembali!',
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selama loading atau jika user sudah ada, tampilkan loading screen
  // untuk mencegah form login berkedip.
  if (authLoading || user) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2">Memuat...</p>
              </div>
          </div>
      )
  }

  // Add overflow hidden to prevent scrolling
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 bg-white">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
        {/* Left side - System Info */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col items-center justify-center" style={{ background: '#A020F0' }}>
          <div className="text-center text-white">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-12 h-12 sm:w-20 sm:h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">SIPOPAY</h1>
            <p className="text-sm sm:text-lg text-white/90">Sistem Informasi Posyandu</p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Login</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Masukkan email dan password untuk mengakses aplikasi
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-6 text-sm sm:text-base py-2 sm:py-2.5 bg-[#A020F0] hover:bg-[#8A1BD5] text-white" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Memproses...' : 'Login'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
