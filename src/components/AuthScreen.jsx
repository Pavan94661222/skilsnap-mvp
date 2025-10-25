import React, { useState } from 'react';
import { Phone, User, Shield, Sparkles, Zap, Users, Award } from 'lucide-react';
import { initializeRecaptcha, sendOTP, verifyOTP, signInAnonymous } from '../firebase/auth';

const AuthScreen = ({ auth, onAuthSuccess }) => {
  const [step, setStep] = useState('welcome'); // 'welcome', 'phone', 'otp', 'profile'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isGuru, setIsGuru] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle phone number submission
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Initialize reCAPTCHA
      const recaptchaVerifier = initializeRecaptcha(auth);
      
      // Send OTP
      const confirmation = await sendOTP(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (error) {
      setError(error.message);
      console.error('Phone auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await verifyOTP(confirmationResult, otp);
      setStep('profile');
    } catch (error) {
      setError('Invalid OTP. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle profile completion
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    onAuthSuccess({ isGuru });
  };

  // Handle anonymous sign-in
  const handleAnonymousSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInAnonymous(auth);
      onAuthSuccess({ isGuru: false });
    } catch (error) {
      setError('Failed to sign in anonymously');
      console.error('Anonymous auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-screen blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full mix-blend-screen blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mix-blend-screen blur-3xl opacity-15 animate-blob animation-delay-4000"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Welcome Screen */}
        {step === 'welcome' && (
          <div className="glass-premium rounded-3xl p-8 shadow-2xl">
            {/* Premium Logo and Header */}
            <div className="text-center mb-10">
              <div className="relative mb-8">
                {/* Multi-layered Logo */}
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-500 rounded-2xl animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-1 bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
                  </div>
                </div>

                {/* Glow Effects */}
                <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce shadow-lg shadow-yellow-500/50"></div>
              </div>

              <h1 className="text-5xl font-black mb-3 tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent animate-gradient">SkilSnap</span>
              </h1>
              <p className="text-gray-300 text-xl font-medium">Learn Skills, Hire Experts</p>
              <p className="text-gray-400 text-sm mt-2">Your gateway to vocational excellence</p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-white text-sm">Quick skill tutorials</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                <Users className="w-5 h-5 text-secondary" />
                <span className="text-white text-sm">Connect with local experts</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                <Award className="w-5 h-5 text-accent" />
                <span className="text-white text-sm">Earn V-Coins for expertise</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => setStep('phone')}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started with Phone
              </button>
              
              <button
                onClick={handleAnonymousSignIn}
                disabled={loading}
                className="w-full bg-dark-100/50 hover:bg-dark-100 text-gray-300 hover:text-white font-medium py-4 rounded-xl transition-all duration-300 border border-gray-600 hover:border-gray-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Continue as Guest'}
              </button>
            </div>

            <p className="text-center text-gray-500 text-xs mt-6">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        )}

        {/* Phone Number Step */}
        {step === 'phone' && (
          <div className="bg-dark-200/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Enter Phone Number</h2>
              <p className="text-gray-400">We'll send you a verification code</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-12 pr-4 py-4 bg-dark-100/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Back to Welcome
              </button>
            </form>
          </div>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <div className="bg-dark-200/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verify Code</h2>
              <p className="text-gray-400">Enter the 6-digit code sent to</p>
              <p className="text-primary font-medium">{phoneNumber}</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full py-4 bg-dark-100/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-center text-3xl tracking-[0.5em] font-mono transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify Code'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Back to Phone Number
              </button>
            </form>
          </div>
        )}

        {/* Profile Setup Step */}
        {step === 'profile' && (
          <div className="bg-dark-200/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to SkilSnap!</h2>
              <p className="text-gray-400">Choose your role to get started</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setIsGuru(false)}
                  className={`w-full p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    !isGuru 
                      ? 'border-primary bg-gradient-to-r from-primary/20 to-secondary/20 text-white shadow-lg' 
                      : 'border-gray-600 bg-dark-100/50 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      !isGuru ? 'bg-primary/30' : 'bg-gray-600/30'
                    }`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-lg">I'm a Learner</h3>
                      <p className="text-sm opacity-80">I want to learn new skills and hire experts</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGuru(true)}
                  className={`w-full p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    isGuru 
                      ? 'border-secondary bg-gradient-to-r from-secondary/20 to-accent/20 text-white shadow-lg' 
                      : 'border-gray-600 bg-dark-100/50 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isGuru ? 'bg-secondary/30' : 'bg-gray-600/30'
                    }`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-lg">I'm a Guru</h3>
                      <p className="text-sm opacity-80">I want to share my skills and earn V-Coins</p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-accent to-yellow-500 hover:from-accent/80 hover:to-yellow-500/80 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start My SkilSnap Journey
              </button>
            </form>
          </div>
        )}

        {/* reCAPTCHA container */}
        <div id="recaptcha-container" className="mt-4"></div>
      </div>
    </div>
  );
};

export default AuthScreen;
