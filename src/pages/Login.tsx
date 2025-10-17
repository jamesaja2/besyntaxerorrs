import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, User, Lock, AlertCircle, Chrome } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } catch (error) {
        console.error('Login failed', error);
        // Error is handled by the AuthContext
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed', error);
      // Error is handled by the AuthContext
    }
  };

  return (
    <>
      <SEO 
        title="Login - SMA Katolik St. Louis 1 Surabaya"
        description="Login ke sistem informasi SMA Katolik St. Louis 1 Surabaya untuk mengakses portal siswa, orang tua, dan staff."
        keywords="login, portal siswa, sistem informasi sekolah, akses SMA St. Louis 1"
      />

      <div className="min-h-screen pt-20 flex items-center bg-school-secondary">
        <Section className="flex-1">
          <SectionHeader>
            <SectionTitle>
              Login 
              <span className="gradient-text">Portal</span>
            </SectionTitle>
            <SectionDescription>
              Masuk ke sistem informasi SMA Katolik St. Louis 1 Surabaya 
              untuk mengakses layanan digital sekolah.
            </SectionDescription>
          </SectionHeader>

          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white border-school-border shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-school-accent to-school-accent-dark rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-school-text">Masuk ke Akun Anda</CardTitle>
                </CardHeader>
                
                <CardContent>
                  {/* Demo Login Info */}
                  <div className="mb-6 p-4 bg-school-accent/10 rounded-lg border border-school-accent/20">
                    <h4 className="font-medium text-school-accent-dark mb-3">Demo Login</h4>
                    <div className="text-sm text-school-text space-y-2">
                      <p>
                        <strong className="text-school-accent-dark">Admin:</strong>
                        <span className="ml-2">admin@sinlui.id</span>
                        <span className="ml-2 inline-flex items-center rounded-full bg-school-accent/20 px-2 py-0.5 text-xs font-medium text-school-accent-dark">Admin!2025</span>
                      </p>
                      <p>
                        <strong className="text-school-accent-dark">Guru:</strong>
                        <span className="ml-2">guru@sinlui.id</span>
                        <span className="ml-2 inline-flex items-center rounded-full bg-school-accent/20 px-2 py-0.5 text-xs font-medium text-school-accent-dark">Guru!2025</span>
                      </p>
                      <p>
                        <strong className="text-school-accent-dark">Siswa:</strong>
                        <span className="ml-2">siswa@sinlui.id</span>
                        <span className="ml-2 inline-flex items-center rounded-full bg-school-accent/20 px-2 py-0.5 text-xs font-medium text-school-accent-dark">Siswa!2025</span>
                      </p>
                      <p>
                        <strong className="text-school-accent-dark">Orang Tua:</strong>
                        <span className="ml-2">orangtua@sinlui.id</span>
                        <span className="ml-2 inline-flex items-center rounded-full bg-school-accent/20 px-2 py-0.5 text-xs font-medium text-school-accent-dark">Ortu!2025</span>
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Global Error */}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-700 text-sm">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {error}
                        </div>
                      </div>
                    )}

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-school-text mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-school-text-muted w-5 h-5" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Masukkan email"
                          className={`pl-10 ${
                            errors.email ? 'border-red-500' : ''
                          }`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </div>
                      )}
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-school-text mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-school-text-muted w-5 h-5" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Masukkan password"
                          className={`pl-10 pr-10 ${
                            errors.password ? 'border-red-500' : ''
                          }`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-school-text-muted hover:text-school-accent"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.password}
                        </div>
                      )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-school-border text-school-accent focus:ring-school-accent focus:ring-offset-0"
                          disabled={isLoading}
                        />
                        <span className="ml-2 text-sm text-school-text-muted">Ingat saya</span>
                      </label>
                      <button
                        type="button"
                        className="text-sm text-school-accent hover:text-school-accent-dark transition-colors"
                        disabled={isLoading}
                      >
                        Lupa password?
                      </button>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full bg-school-accent hover:bg-school-accent-dark text-white font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Memproses...</span>
                        </div>
                      ) : (
                        'Masuk'
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-school-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-school-text-muted">atau</span>
                    </div>
                  </div>

                  {/* SSO Login Options */}
                  <div className="space-y-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full border-school-border text-school-text hover:bg-school-surface"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <Chrome className="w-5 h-5 mr-2" />
                      Login dengan Google SSO
                    </Button>
                  </div>

                  {/* Role-based Access Info */}
                    <div className="mt-6 p-4 bg-school-surface rounded-lg">
                    <h4 className="font-medium text-school-text mb-2">Akses Berdasarkan Role:</h4>
                    <div className="text-sm text-school-text-muted space-y-1">
                        <p><span className="inline-block w-3 h-3 bg-school-admin rounded-full mr-2"></span><strong>Admin:</strong> Full system access</p>
                        <p><span className="inline-block w-3 h-3 bg-school-teacher rounded-full mr-2"></span><strong>Guru:</strong> LMS, Grading, Classes</p>
                        <p><span className="inline-block w-3 h-3 bg-school-student rounded-full mr-2"></span><strong>Siswa:</strong> Courses, Assignments, Library</p>
                        <p><span className="inline-block w-3 h-3 bg-school-parent rounded-full mr-2"></span><strong>Orang Tua:</strong> Children progress, Payments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center"
            >
              <div className="bg-white rounded-xl p-6 border border-school-border shadow-sm">
                <h3 className="text-lg font-semibold text-school-text mb-2">
                  Butuh Bantuan?
                </h3>
                <p className="text-school-text-muted text-sm mb-4">
                  Hubungi admin sekolah untuk mendapatkan akun atau reset password
                </p>
                <div className="space-y-2 text-sm text-school-text-muted">
                  <p>📞 (031) 5676522, 5677494, 5681758</p>
                  <p>✉️ info@smakstlouis1sby.sch.id</p>
                  <p>🕒 Senin-Jumat 07.00-15.00, Sabtu 07.00-12.00</p>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>
      </div>
    </>
  );
}