import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Upload,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Users,
  Bell,
  Play
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
function FeatureCard({ icon: Icon, title, description, highlight = false }) {
  return (
    <div className="bg-bg rounded-[20px] pt-8 pb-8 px-6 neu-out hover:shadow-[8px_8px_20px_var(--color-sh-dark),-8px_-8px_20px_var(--color-sh-light)] transition-shadow">
      <div className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mb-[22px] ${highlight ? 'bg-accent-purple shadow-[0_4px_16px_rgba(139,124,248,0.5)] text-white' : 'bg-bg neu-in text-accent-purple'}`}>
        <Icon className="w-[22px] h-[22px]" />
      </div>
      <div className="text-[16px] font-bold text-text-bright mb-2.5 leading-[1.3]">{title}</div>
      <div className="text-[13px] font-light text-text-dim leading-[1.85]">{description}</div>
    </div>
  );
}

/* ─── Testimonial card ─────────────────────────────────────────── */
function TestimonialCard({ name, role, quote }) {
  return (
    <div className="bg-bg rounded-[20px] py-7 px-5 neu-out">
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-3.5 h-3.5 bg-bg rounded shadow-[inset_4px_4px_10px_var(--color-sh-dark),inset_-4px_-4px_10px_var(--color-sh-light)] flex items-center justify-center text-[10px] text-accent-purple">
            ★
          </div>
        ))}
      </div>
      <p className="text-[13px] font-light text-text leading-[1.85] mb-5 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-xl bg-bg neu-out flex items-center justify-center text-[14px] font-bold text-accent-purple">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-[13px] font-bold text-text-bright mb-0.5">{name}</div>
          <div className="text-[11px] font-normal text-text-dim">{role}</div>
        </div>
      </div>
    </div>
  );
}

/*  HomePage                                                      */
/* ═══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-text overflow-x-hidden font-sans w-full">
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className="bg-bg px-6 lg:px-12 h-[68px] flex items-center justify-between shadow-[0_4px_20px_var(--color-sh-dark)] fixed top-0 w-full z-50">
        <Link to="/" className="text-[20px] font-bold text-text-bright tracking-tight">
          Reel<span className="text-accent-purple">Ops</span>
        </Link>

        <div className="hidden md:flex gap-9">
          <a href="#features" className="text-[13px] font-medium text-text-dim no-underline tracking-wide hover:text-text transition-colors">Features</a>
          <a href="#workflow" className="text-[13px] font-medium text-text-dim no-underline tracking-wide hover:text-text transition-colors">Workflow</a>
          <a href="#testimonials" className="text-[13px] font-medium text-text-dim no-underline tracking-wide hover:text-text transition-colors">Testimonials</a>
        </div>

        <div className="flex items-center gap-3.5">
          <Link
            to="/login"
            className="bg-bg text-text-dim py-[9px] px-5 text-[12px] font-semibold rounded-[10px] neu-sm tracking-wider hover:text-text transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-accent-purple text-white py-[9px] px-[22px] text-[12px] font-bold rounded-[10px] shadow-[4px_4px_12px_rgba(139,124,248,0.4),-2px_-2px_8px_rgba(139,124,248,0.1)] tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Get Started &rarr;
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-[132px] pb-14 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-bg rounded-[20px] py-[7px] px-4 neu-sm text-[11px] font-semibold text-accent-purple tracking-widest uppercase mb-7">
              <div className="w-[7px] h-[7px] bg-accent-cyan rounded-full shadow-[0_0_6px_var(--color-accent-cyan)] animate-pulse" />
              AI-Powered Content Workflow
            </div>
            
            <h1 className="text-5xl lg:text-[58px] font-bold leading-none text-text-bright tracking-tight mb-6">
              Ship content faster<br />
              with <em className="not-italic text-accent-purple">AI-powered</em><br />
              collaboration
            </h1>
            
            <p className="text-[15px] font-light text-text-dim leading-[1.85] max-w-[460px] mb-10">
              Upload, optimize, review, and publish your short-form content across Instagram and YouTube — all in one workspace with real-time team collaboration.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="bg-accent-purple text-white py-3.5 px-9 text-[13px] font-bold rounded-2xl shadow-[5px_5px_16px_rgba(139,124,248,0.5),-2px_-2px_8px_rgba(139,124,248,0.15)] tracking-wider hover:opacity-90 transition-opacity"
              >
                Start for Free &rarr;
              </Link>
              <a
                href="#workflow"
                className="bg-bg text-text py-3.5 px-7 text-[13px] font-semibold rounded-2xl neu-out flex items-center gap-2 tracking-wide hover:text-text-bright transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> See How It Works
              </a>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="bg-bg rounded-[24px] p-7 neu-lg">
              <div className="text-[10px] font-semibold text-text-dim tracking-[0.15em] uppercase mb-5">Platform at a glance</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg rounded-2xl py-[18px] px-4 neu-in text-center">
                  <div className="text-[28px] font-bold text-text-bright leading-none tracking-tight">10<span className="text-accent-purple">K+</span></div>
                  <div className="text-[10px] font-medium text-text-dim tracking-widest uppercase mt-1.5">Creators</div>
                </div>
                <div className="bg-bg rounded-2xl py-[18px] px-4 neu-in text-center">
                  <div className="text-[28px] font-bold text-text-bright leading-none tracking-tight">500<span className="text-accent-purple">K</span></div>
                  <div className="text-[10px] font-medium text-text-dim tracking-widest uppercase mt-1.5">Videos</div>
                </div>
                <div className="bg-bg rounded-2xl py-[18px] px-4 neu-in text-center">
                  <div className="text-[28px] font-bold text-text-bright leading-none tracking-tight">99.9<span className="text-accent-purple">%</span></div>
                  <div className="text-[10px] font-medium text-text-dim tracking-widest uppercase mt-1.5">Uptime</div>
                </div>
                <div className="bg-bg rounded-2xl py-[18px] px-4 neu-in text-center">
                  <div className="text-[28px] font-bold text-text-bright leading-none tracking-tight">4.9<span className="text-accent-purple">/5</span></div>
                  <div className="text-[10px] font-medium text-text-dim tracking-widest uppercase mt-1.5">Rating</div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Divider Strip ───────────────────────────────────────── */}
      <div className="bg-bg-secondary py-[18px] px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4 shadow-[inset_0_2px_8px_var(--color-sh-dark),inset_0_-2px_8px_var(--color-sh-light)]">
        {['Drag & Drop Uploads', 'AI Metadata Generator', 'Approval Workflow', 'Real-Time Chat', 'Team Channels'].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[12px] font-semibold text-text-dim tracking-wider">
            <div className="w-[5px] h-[5px] bg-accent-purple rounded-full shadow-[0_0_5px_var(--color-accent-purple)]" />
            {item}
          </div>
        ))}
      </div>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="py-16 px-6 lg:px-12 bg-bg">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-12">
            <div className="text-[10px] font-bold text-accent-purple tracking-[0.2em] uppercase mb-3">Features</div>
            <h2 className="text-4xl lg:text-[40px] font-bold text-text-bright tracking-tight leading-[1.1] mb-2.5">
              Everything you need to<br />
              <em className="not-italic text-accent-purple">publish at scale</em>
            </h2>
            <p className="text-[14px] font-light text-text-dim leading-[1.85] max-w-[500px]">
              A single workspace where creators, editors, and managers collaborate on short-form content from upload to publish.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FadeUp delay={0.05}>
              <FeatureCard
                icon={Upload}
                title="Drag & Drop Uploads"
                description="Upload MP4, MOV, or WebM files up to 100 MB. Video is auto-stored in the cloud with thumbnail generation."
              />
            </FadeUp>
            <FadeUp delay={0.1}>
              <FeatureCard
                icon={Sparkles}
                title="AI Metadata Generator"
                description="One click to generate optimized captions, hashtags, and descriptions using AI — tailored per platform."
                highlight={true}
              />
            </FadeUp>
            <FadeUp delay={0.15}>
              <FeatureCard
                icon={ShieldCheck}
                title="Approval Workflow"
                description="Channel owners review, approve, or reject submissions. Every action is tracked with full audit history."
              />
            </FadeUp>
            <FadeUp delay={0.2}>
              <FeatureCard
                icon={MessageCircle}
                title="Real-Time Channel Chat"
                description="Built-in Socket.IO chat per channel. Discuss revisions instantly — no more switching to Slack or WhatsApp."
              />
            </FadeUp>
            <FadeUp delay={0.25}>
              <FeatureCard
                icon={Users}
                title="Team Channels"
                description="Create private channels with invite codes. Manage editors and owners with role-based access control."
              />
            </FadeUp>
            <FadeUp delay={0.3}>
              <FeatureCard
                icon={Bell}
                title="Email Notifications"
                description="Owners are automatically notified via email when new submissions arrive — with a direct review link."
              />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Workflow ────────────────────────────────────────────── */}
      <section id="workflow" className="py-16 px-6 lg:px-12 bg-bg-secondary shadow-[inset_0_4px_16px_var(--color-sh-dark),inset_0_-4px_16px_var(--color-sh-light)]">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-10">
            <div className="text-[10px] font-bold text-accent-purple tracking-[0.2em] uppercase mb-3">Workflow</div>
            <h2 className="text-4xl lg:text-[40px] font-bold text-text-bright tracking-tight leading-[1.1] mb-2.5">
              From upload to publish<br />
              in <em className="not-italic text-accent-purple">four steps</em>
            </h2>
            <p className="text-[14px] font-light text-text-dim leading-[1.85] max-w-[500px]">
              A streamlined pipeline designed for speed without sacrificing quality control.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-14 items-start">
            <div className="flex flex-col gap-1 mt-2">
              {[
                { num: '01', title: 'Upload Your Video', desc: 'Drag and drop into a channel. Cloudinary stores it with a thumbnail.', active: true },
                { num: '02', title: 'Generate AI Metadata', desc: 'One-click AI generates titles, captions, hashtags via Groq.', active: false },
                { num: '03', title: 'Review & Approve', desc: 'Owners get notified via email with a direct review link.', active: false },
                { num: '04', title: 'Publish & Collaborate', desc: 'Real-time chat, team management, push content live.', active: false },
              ].map((step, i) => (
                <FadeUp key={step.num} delay={i * 0.1}>
                  <div className={`rounded-2xl p-5 grid grid-cols-[44px_1fr] gap-3.5 items-start ${step.active ? 'bg-bg neu-out' : 'bg-bg-secondary'}`}>
                    <div className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center text-[15px] font-bold ${step.active ? 'bg-accent-purple shadow-[0_4px_14px_rgba(139,124,248,0.45)] text-white' : 'bg-bg-secondary neu-in text-text-dim'}`}>
                      {step.num}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-text-bright mb-1 leading-[1.3]">{step.title}</div>
                      <div className="text-[12px] font-light text-text-dim leading-[1.8]">{step.desc}</div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>

            <FadeUp delay={0.4}>
              <div className="bg-bg rounded-[24px] p-7 neu-lg">
                <div className="flex items-center justify-between mb-5">
                  <div className="text-[13px] font-bold text-text-bright">Content Pipeline</div>
                  <div className="text-[10px] font-semibold text-accent-cyan bg-accent-cyan/10 py-1 px-2.5 rounded-lg shadow-[inset_2px_2px_5px_var(--color-sh-dark),inset_-2px_-2px_5px_var(--color-sh-light)]">3 active</div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="bg-bg rounded-[14px] py-3.5 px-4 neu-in flex items-center justify-between">
                    <span className="text-[13px] font-medium text-text">reel_final_v3.mp4</span>
                    <span className="text-[10px] font-bold py-1 px-2.5 rounded-lg tracking-wider bg-accent-cyan/15 text-accent-cyan">Approved</span>
                  </div>
                  <div className="bg-bg rounded-[14px] py-3.5 px-4 neu-in flex items-center justify-between">
                    <span className="text-[13px] font-medium text-text">summer_drop_cut2.mp4</span>
                    <span className="text-[10px] font-bold py-1 px-2.5 rounded-lg tracking-wider bg-accent-purple/15 text-accent-purple">In Review</span>
                  </div>
                  <div className="bg-bg rounded-[14px] py-3.5 px-4 neu-in flex items-center justify-between">
                    <span className="text-[13px] font-medium text-text">collab_teaser.mp4</span>
                    <span className="text-[10px] font-bold py-1 px-2.5 rounded-lg tracking-wider bg-text-dim/10 text-text-dim">Queued</span>
                  </div>
                  <div className="bg-bg rounded-[14px] py-3.5 px-4 neu-in flex items-center justify-between">
                    <span className="text-[13px] font-medium text-text">brand_spot_v1.mp4</span>
                    <span className="text-[10px] font-bold py-1 px-2.5 rounded-lg tracking-wider bg-text-dim/10 text-text-dim">Queued</span>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex justify-between mb-2">
                    <span className="text-[11px] font-semibold text-text-dim tracking-wider uppercase">Pipeline Progress</span>
                    <span className="text-[11px] font-semibold text-text-dim tracking-wider uppercase">65%</span>
                  </div>
                  <div className="bg-bg rounded-md h-2 neu-in">
                    <div className="bg-accent-purple h-2 rounded-md w-[65%] shadow-[0_2px_8px_rgba(139,124,248,0.5)]"></div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section id="testimonials" className="py-16 px-6 lg:px-12 bg-bg max-w-7xl mx-auto">
        <FadeUp className="mb-12">
          <div className="text-[10px] font-bold text-accent-purple tracking-[0.2em] uppercase mb-3">Testimonials</div>
          <h2 className="text-4xl lg:text-[40px] font-bold text-text-bright tracking-tight leading-[1.1]">
            Loved by <em className="not-italic text-accent-purple">creators worldwide</em>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              quote="Managing 12 channels with different editors used to be a nightmare. Now everything's organized, tracked, and auditable."
            />
          </FadeUp>
          <FadeUp delay={0.15}>
            <TestimonialCard
              name="Marcus Chen"
              role="Instagram Reels Creator"
              quote="The real-time chat per channel is a game-changer. I can discuss edits with my team right next to the video — no switching."
            />
          </FadeUp>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <section className="py-16 px-6 lg:px-12 bg-bg-secondary shadow-[inset_0_4px_16px_var(--color-sh-dark)]">
        <FadeUp>
          <div className="max-w-4xl mx-auto bg-bg rounded-[28px] py-12 px-6 lg:px-12 neu-lg text-center">
            <h2 className="text-[44px] font-bold text-text-bright tracking-tight leading-[1.05] mb-4">
              Ready to streamline your<br />
              <em className="not-italic text-accent-purple">content pipeline?</em>
            </h2>
            <p className="text-[15px] font-light text-text-dim leading-[1.85] mb-9">
              Join thousands of creators who ship content faster with ReelOps.<br />
              Free to start, no credit card required.
            </p>
            <div>
              <Link
                to="/signup"
                className="bg-accent-purple text-white py-4 px-12 text-[14px] font-bold rounded-2xl shadow-[6px_6px_20px_rgba(139,124,248,0.5),-3px_-3px_10px_rgba(139,124,248,0.1)] tracking-wider mb-6 inline-block hover:opacity-90 transition-opacity"
              >
                Create Free Account &rarr;
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-7 mt-6">
              {[
                'Free forever plan',
                'No credit card',
                'Set up in 60 seconds'
              ].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[12px] font-medium text-text-dim">
                  <div className="w-5 h-5 rounded-md bg-bg neu-in flex items-center justify-center text-[11px] text-accent-cyan">
                    ✓
                  </div>
                  {perk}
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-bg py-6 px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_-2px_12px_var(--color-sh-dark)] relative z-10">
        <div className="text-[17px] font-bold text-text-bright">
          Reel<span className="text-accent-purple">Ops</span>
        </div>
        <div className="text-[11px] text-text-dim tracking-wider">
          &copy; {new Date().getFullYear()} ReelOps. All rights reserved.
        </div>
        <div className="flex gap-5">
          <a href="#" className="text-[11px] text-text-dim font-medium hover:text-text transition-colors">Privacy</a>
          <a href="#" className="text-[11px] text-text-dim font-medium hover:text-text transition-colors">Terms</a>
          <a href="#" className="text-[11px] text-text-dim font-medium hover:text-text transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
