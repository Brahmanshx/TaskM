import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const otpInputs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    
    setLoading(true);
    try {
      setError('');
      await authAPI.sendOtp(email);
      toast.success('OTP sent to your email!');
      setStep(2);
      setTimer(60);
      // Auto-focus first OTP input after step change
      setTimeout(() => otpInputs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return toast.error('Please enter 6-digit OTP');

    setLoading(true);
    try {
      setError('');
      const res = await authAPI.verifyOtp(email, otpString, name);
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Branding & Illustration */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-600/5 blur-[120px] rounded-full -left-20 -top-20" />
        
        <Link to="/" className="flex items-center gap-2 relative z-10 group">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Taskify</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            The workspace for <br/>
            <span className="text-primary-400">high-performance</span> teams.
          </h2>
          <p className="text-xl text-surface-400 max-w-md leading-relaxed">
            Join thousands of professionals who use Taskify to orchestrate their goals and daily tasks.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-surface-500 text-sm">
          <span>Trusted by creators at</span>
          <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            {['Linear', 'Vercel', 'Nextjs', 'Notion'].map(n => <span key={n} className="font-bold">{n}</span>)}
          </div>
        </div>
      </div>

      {/* Right: Auth Card */}
      <div className="flex items-center justify-center p-6 bg-brand-950">
        <div className="w-full max-w-md animate-reveal">
          <div className="glass-card p-8 lg:p-10 rounded-[32px]">
            <div className="mb-10">
              <h3 className="text-3xl font-bold text-white mb-3">
                {step === 1 ? 'Welcome back' : 'Check your mail'}
              </h3>
              <p className="text-surface-400">
                {step === 1 
                  ? 'Enter your email to sign in or create an account.' 
                  : `We've sent a 6-digit code to ${email}`}
              </p>
            </div>

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-300 ml-1">Email address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-primary-400 transition-colors" />
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-brand-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-surface-600"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-300 ml-1">Verify identity</label>
                    <div className="flex gap-3">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpInputs.current[i] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          className="w-full aspect-square text-center text-3xl font-bold bg-brand-900 border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                          disabled={loading}
                        />
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 animate-reveal">
                      <p className="text-xs text-danger font-bold text-center">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-sm text-surface-400 text-center">
                      Didn't receive a code? {' '}
                      <button 
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={timer > 0 || loading}
                        className="text-primary-400 hover:text-primary-300 font-semibold disabled:opacity-50 transition-colors"
                      >
                        {timer > 0 ? `Resend in ${timer}s` : 'Resend now'}
                      </button>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-surface-500 hover:text-surface-300 py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Use a different email
                  </button>
                </div>
              </form>
            )}

            <div className="mt-10 pt-10 border-t border-white/5 flex items-center gap-2 justify-center text-surface-500 text-xs">
              <ShieldCheck className="w-4 h-4" />
              Secure, encrypted authentication
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
