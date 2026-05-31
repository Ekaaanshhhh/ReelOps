import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Zap,
  Upload,
  Shield,
  Sparkles,
  MessageSquare,
  Users,
  ArrowRight,
  CheckCircle2,
  Play,
  Star,
  ChevronRight,
} from 'lucide-react';

/* ─── Reusable fade-up wrapper ─────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Feature card ─────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, accentColor = 'purple' }) {
  const colors = {
    purple: {
      bg: 'bg-accent-purple/10',
      text: 'text-accent-purple',
      glow: 'group-hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]',
    },
    cyan: {
      bg: 'bg-accent-cyan/10',
      text: 'text-accent-cyan',
      glow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    },
    green: {
      bg: 'bg-success/10',
      text: 'text-success',
      glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    },
  };
  const c = colors[accentColor] || colors.purple;

  return (
    <div
      className={`group relative p-6 rounded-2xl bg-card border border-border
                   hover:border-border-light transition-all duration-300 ${c.glow}`}
    >
      <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <h3 className="text-lg font-semibold font-heading text-text mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── Stat pill ────────────────────────────────────────────────── */
function Stat({ value, label }) {
  return (
    <div className="text-center px-6">
      <div className="text-3xl lg:text-4xl font-bold font-heading gradient-text mb-1">{value}</div>
      <div className="text-sm text-text-muted">{label}</div>
    </div>
  );
}

/* ─── Testimonial card ─────────────────────────────────────────── */
function TestimonialCard({ name, role, quote }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-border-light transition-all duration-300">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-warning text-warning" />
        ))}
      </div>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-sm font-bold text-white">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-text">{name}</p>
          <p className="text-xs text-text-muted">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero dashboard card with 3D tilt + glassmorphism + glow ── */
function HeroDashboardCard() {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Spring-damped rotation for buttery 3D feel
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 200, damping: 30 });

  // Glare position follows mouse
  const glareX = useTransform(mouseX, [0, 1], ['0%', '100%']);
  const glareY = useTransform(mouseY, [0, 1], ['0%', '100%']);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative max-w-5xl mx-auto"
      style={{ perspective: 1200 }}
    >
      {/* Animated glow border — rotates continuously behind the card */}
      <div
        className="absolute -inset-[2px] rounded-[18px] z-0 opacity-60 blur-[1px]"
        style={{
          background: 'conic-gradient(from var(--glow-angle, 0deg), #7C3AED, #06B6D4, #7C3AED)',
          animation: 'spin-glow 4s linear infinite',
        }}
      />

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative z-10 rounded-2xl overflow-hidden cursor-default"
      >
        {/* Glassmorphic frosted backdrop */}
        <div
          className="absolute inset-0 z-0 rounded-2xl"
          style={{
            background: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        />

        {/* Inner padding + image */}
        <div className="relative z-10 p-2.5">
          <div className="relative rounded-xl overflow-hidden">
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-bg/20 to-transparent z-10 pointer-events-none" />

            <img
              src="/hero-dashboard.png"
              alt="ReelOps Dashboard — AI-powered content publishing platform"
              className="w-full block"
              loading="eager"
            />

            {/* Mouse-tracking glare overlay */}
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300"
              style={{
                opacity: isHovered ? 0.12 : 0,
                background: useTransform(
                  [glareX, glareY],
                  ([x, y]) => `radial-gradient(600px circle at ${x} ${y}, rgba(255,255,255,0.15), transparent 60%)`
                ),
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Reflection glow — amplified on hover */}
      <div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 rounded-full pointer-events-none transition-all duration-500"
        style={{
          background: isHovered
            ? 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.08) 60%, transparent 100%)'
            : 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 80%)',
          filter: 'blur(24px)',
        }}
      />

      {/* CSS for animated conic glow rotation */}
      <style>{`
        @property --glow-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes spin-glow {
          to { --glow-angle: 360deg; }
        }
      `}</style>
    </motion.div>
  );
}
/*  HomePage                                                      */
/* ═══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-text overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-heading">
              Reel<span className="text-accent-purple">Ops</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-text-secondary hover:text-text transition-colors">Features</a>
            <a href="#workflow" className="text-sm text-text-secondary hover:text-text transition-colors">Workflow</a>
            <a href="#testimonials" className="text-sm text-text-secondary hover:text-text transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary
                         hover:text-text hover:bg-card transition-all"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white gradient-bg
                         hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Ambient gradient blurs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-purple/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-60 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-purple/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-purple/30 bg-accent-purple/5 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-purple" />
              <span className="text-xs font-medium text-accent-purple-light">AI-Powered Content Workflow</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-[1.1] tracking-tight mb-6"
            >
              Ship content faster with{' '}
              <span className="gradient-text">AI-powered</span>{' '}
              collaboration
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-text-secondary max-w-2xl mx-auto mb-8"
            >
              Upload, optimize, review, and publish your short-form content across Instagram and YouTube 
              — all in one workspace with real-time team collaboration.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link
                to="/signup"
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-semibold text-white gradient-bg
                           hover:opacity-90 transition-opacity flex items-center justify-center gap-2
                           shadow-[0_0_30px_rgba(124,58,237,0.25)]"
              >
                Start for Free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#workflow"
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-semibold text-text-secondary
                           bg-card border border-border hover:bg-card-hover hover:text-text
                           transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> See How It Works
              </a>
            </motion.div>
          </div>

          {/* Hero image — dashboard screenshot with 3D tilt + glassmorphism */}
          <HeroDashboardCard />
        </div>
      </section>

      {/* ── Social proof stats ──────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-border/50">
        <FadeUp>
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            <Stat value="10K+" label="Creators" />
            <div className="hidden sm:block w-px h-12 bg-border" />
            <Stat value="500K+" label="Videos Published" />
            <div className="hidden sm:block w-px h-12 bg-border" />
            <Stat value="99.9%" label="Uptime" />
            <div className="hidden sm:block w-px h-12 bg-border" />
            <Stat value="4.9/5" label="User Rating" />
          </div>
        </FadeUp>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent-purple mb-3 block">
              Features
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold font-heading mb-4">
              Everything you need to{' '}
              <span className="gradient-text">publish at scale</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              A single workspace where creators, editors, and managers collaborate on short-form
              content from upload to publish.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FadeUp delay={0.05}>
              <FeatureCard
                icon={Upload}
                title="Drag & Drop Uploads"
                description="Upload MP4, MOV, or WebM files up to 100 MB. Video is auto-stored in the cloud with thumbnail generation."
                accentColor="purple"
              />
            </FadeUp>
            <FadeUp delay={0.1}>
              <FeatureCard
                icon={Sparkles}
                title="AI Metadata Generator"
                description="One click to generate optimized captions, hashtags, and descriptions using AI — tailored per platform."
                accentColor="cyan"
              />
            </FadeUp>
            <FadeUp delay={0.15}>
              <FeatureCard
                icon={Shield}
                title="Approval Workflow"
                description="Channel owners review, approve, or reject submissions. Every action is tracked with full audit history."
                accentColor="green"
              />
            </FadeUp>
            <FadeUp delay={0.2}>
              <FeatureCard
                icon={MessageSquare}
                title="Real-Time Channel Chat"
                description="Built-in Socket.IO chat per channel. Discuss revisions instantly — no more switching to Slack or WhatsApp."
                accentColor="purple"
              />
            </FadeUp>
            <FadeUp delay={0.25}>
              <FeatureCard
                icon={Users}
                title="Team Channels"
                description="Create private channels with invite codes. Manage editors and owners with role-based access control."
                accentColor="cyan"
              />
            </FadeUp>
            <FadeUp delay={0.3}>
              <FeatureCard
                icon={Zap}
                title="Email Notifications"
                description="Owners are automatically notified via email when new submissions arrive — with a direct review link."
                accentColor="green"
              />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Workflow ────────────────────────────────────────────── */}
      <section id="workflow" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-bg-secondary/40">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent-cyan mb-3 block">
              Workflow
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold font-heading mb-4">
              From upload to publish in{' '}
              <span className="gradient-text">four steps</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              A streamlined pipeline designed for speed without sacrificing quality control.
            </p>
          </FadeUp>

          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Upload Your Video',
                description: 'Drag and drop your video into a channel. Cloudinary stores it instantly with a generated thumbnail.',
              },
              {
                step: '02',
                title: 'Generate AI Metadata',
                description: 'One-click AI generates platform-optimized titles, captions, hashtags, and descriptions using Groq.',
              },
              {
                step: '03',
                title: 'Review & Approve',
                description: 'Channel owners get an email notification with a direct link. Approve or request revisions — all tracked.',
              },
              {
                step: '04',
                title: 'Publish & Collaborate',
                description: 'Discuss in real-time channel chat, manage your team, and push approved content live.',
              },
            ].map((item, i) => (
              <FadeUp key={item.step} delay={i * 0.08}>
                <div className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border hover:border-border-light transition-all group">
                  <div className="shrink-0 w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-lg font-bold text-white">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-heading text-text mb-1 group-hover:text-accent-purple-light transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted ml-auto mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent-purple mb-3 block">
              Testimonials
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold font-heading mb-4">
              Loved by <span className="gradient-text">creators worldwide</span>
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            <FadeUp delay={0.05}>
              <TestimonialCard
                name="Aditya Verma"
                role="YouTube Creator, 2M+ subscribers"
                quote="ReelOps cut our content review cycle from 3 days to 3 hours. The AI caption generator alone saves us hours every week."
              />
            </FadeUp>
            <FadeUp delay={0.1}>
              <TestimonialCard
                name="Priya Singh"
                role="Social Media Manager, BrandVault"
                quote="Managing 12 channels with different editors used to be a nightmare. Now everything's organized, tracked, and auditable in one place."
              />
            </FadeUp>
            <FadeUp delay={0.15}>
              <TestimonialCard
                name="Marcus Chen"
                role="Instagram Reels Creator"
                quote="The real-time chat per channel is a game-changer. I can discuss edits with my team right next to the video — no context switching."
              />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="relative max-w-4xl mx-auto text-center p-10 lg:p-16 rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 gradient-bg opacity-10" />
            <div className="absolute inset-0 border border-accent-purple/20 rounded-3xl" />
            <div className="absolute top-0 right-0 w-60 h-60 bg-accent-cyan/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-purple/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold font-heading mb-4">
                Ready to streamline your{' '}
                <span className="gradient-text">content pipeline?</span>
              </h2>
              <p className="text-text-secondary max-w-lg mx-auto mb-8">
                Join thousands of creators who ship content faster with ReelOps. Free to start, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-white gradient-bg
                             hover:opacity-90 transition-opacity flex items-center justify-center gap-2
                             shadow-[0_0_30px_rgba(124,58,237,0.3)]"
                >
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex items-center justify-center gap-4 mt-5 text-xs text-text-muted">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Free forever plan</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> No credit card</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Set up in 60 seconds</span>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-heading">
              Reel<span className="text-accent-purple">Ops</span>
            </span>
          </div>
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} ReelOps. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-text-muted hover:text-text transition-colors">Privacy</a>
            <a href="#" className="text-sm text-text-muted hover:text-text transition-colors">Terms</a>
            <a href="#" className="text-sm text-text-muted hover:text-text transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
