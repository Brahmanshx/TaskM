import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Zap, 
  Target, 
  Calendar,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-primary-400" />,
      title: "Smart Prioritization",
      description: "Our AI-driven system helps you focus on what actually moves the needle."
    },
    {
      icon: <Target className="w-6 h-6 text-primary-400" />,
      title: "Goal-Based Planning",
      description: "Connect your long-term vision to your daily tasks seamlessly."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary-400" />,
      title: "Progress Tracking",
      description: "Visualize your journey with detailed analytics and streak tracking."
    },
    {
      icon: <Layers className="w-6 h-6 text-primary-400" />,
      title: "Daily Focus System",
      description: "A clean, distraction-free interface designed for deep work."
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full animate-pulse-glow" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Taskify</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20">
                Go to App
              </Link>
            ) : (
              <>
                <Link to="/auth" className="px-6 py-2.5 text-surface-400 hover:text-white font-medium transition-colors">
                  Login
                </Link>
                <Link to="/auth" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Next Gen Productivity
            </div>
            <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Turn Your Goals Into <span className="text-gradient">Daily Action</span>
            </h1>
            <p className="text-xl text-surface-400 mb-10 leading-relaxed max-w-xl">
              Plan smarter, prioritize better, and stay consistent. Taskify connects your long-term vision with daily execution.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary-500/25 flex items-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-brand-900 border border-white/5 hover:border-white/10 text-white rounded-2xl font-bold text-lg transition-all">
                Learn More
              </button>
            </div>
          </div>

          <div className="relative animate-reveal stagger-1 lg:block hidden">
            <div className="absolute inset-0 bg-primary-600/20 blur-[100px] rounded-full" />
            <div className="relative glass-card p-4 rounded-3xl rotate-1 group hover:rotate-0 transition-transform duration-500">
              {/* Mock Dashboard UI */}
              <div className="bg-brand-950 rounded-2xl overflow-hidden border border-white/5 aspect-[4/3] flex flex-col shadow-2xl">
                <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-brand-900/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <div className="w-1/3 h-4 bg-white/5 rounded-lg" />
                  <div className="w-8 h-8 rounded-full bg-white/5" />
                </div>
                <div className="flex-1 p-6 grid grid-cols-5 gap-6">
                  <div className="col-span-1 space-y-4">
                    <div className="w-full h-8 bg-primary-500/20 rounded-lg" />
                    <div className="w-full h-2 bg-white/5 rounded-lg" />
                    <div className="w-full h-2 bg-white/5 rounded-lg" />
                    <div className="w-full h-2 bg-white/5 rounded-lg" />
                  </div>
                  <div className="col-span-4 space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                      {[1,2,3,4].map(i => <div key={i} className="h-20 bg-brand-900/50 rounded-xl border border-white/5" />)}
                    </div>
                    <div className="h-40 bg-brand-900/50 rounded-2xl border border-white/5 p-4">
                      <div className="w-1/4 h-4 bg-white/10 rounded-lg mb-4" />
                      <div className="space-y-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded border border-white/10" />
                            <div className={`h-2 rounded-lg bg-white/${i === 1 ? '20' : '5'}`} style={{width: `${80 - i*15}%`}} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-20 animate-reveal">
            <h2 className="text-4xl font-bold mb-4">Everything you need to ship faster</h2>
            <p className="text-surface-400 text-lg max-w-2xl mx-auto">
              Stop fighting your tools and start achieving your goals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className={`glass-card p-8 rounded-3xl animate-reveal stagger-${i+1}`}>
                <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-surface-400 leading-relaxed text-sm">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="glass-card rounded-[40px] p-12 lg:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-[100px] rounded-full -mr-20 -mt-20" />
            
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">
                  A simple system for <br/> 
                  <span className="text-primary-400">extraordinary results.</span>
                </h2>
                <div className="space-y-10">
                  {[
                    { title: "Define Your Vision", text: "Set long-term goals that define your North Star." },
                    { title: "Break It Down", text: "Turn big dreams into actionable short-term goals." },
                    { title: "Daily Execution", text: "Focus on top priorities every single day." }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-primary-500/20">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                        <p className="text-surface-400 leading-relaxed">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-brand-900 rounded-full border border-white/5 flex items-center justify-center p-12">
                  <div className="w-full h-full bg-brand-950 rounded-full border border-white/5 flex flex-col items-center justify-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-px bg-white/5 rotate-[45deg]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-px bg-white/5 -rotate-[45deg]" />
                    
                    <div className="z-10 bg-brand-950 p-4 border border-white/10 rounded-2xl shadow-2xl mb-4 group hover:scale-110 transition-transform">
                      <Target className="w-10 h-10 text-primary-400" />
                    </div>
                    <div className="z-10 flex gap-4">
                      <div className="bg-brand-950 p-4 border border-white/10 rounded-2xl shadow-2xl group hover:scale-110 transition-transform">
                        <Layers className="w-10 h-10 text-primary-400" />
                      </div>
                      <div className="bg-brand-950 p-4 border border-white/10 rounded-2xl shadow-2xl group hover:scale-110 transition-transform">
                        <Calendar className="w-10 h-10 text-primary-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-32 text-center">
          <div className="animate-reveal">
            <h2 className="text-5xl lg:text-6xl font-extrabold mb-8 tracking-tight">
              Start building <span className="text-gradient">consistency</span> today.
            </h2>
            <p className="text-xl text-surface-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of developers and creatives who are planning their way to success.
            </p>
            <button 
              onClick={() => navigate('/auth')}
              className="px-12 py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold text-xl transition-all shadow-2xl shadow-primary-500/25 inline-flex items-center gap-3 group"
            >
              Get Started for Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Taskify</span>
          </div>
          <p className="text-surface-500 text-sm">
            © 2026 Taskify Inc. Built for high achievers.
          </p>
          <div className="flex gap-8">
            {['Twitter', 'GitHub', 'Terms', 'Privacy'].map(link => (
              <a key={link} href="#" className="text-surface-400 hover:text-white text-sm transition-colors font-medium">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
