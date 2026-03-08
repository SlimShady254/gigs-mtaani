import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  BriefcaseBusiness, 
  Users, 
  Shield, 
  Heart, 
  Globe, 
  Award,
  ChevronRight,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useThemeStore } from "../state/themeStore";

// Icons as components for reusability
const IconWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export function AboutPage() {
  const { theme } = useThemeStore();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  const stats = [
    { value: "10K+", label: "Active Gigs" },
    { value: "5K+", label: "Workers" },
    { value: "50+", label: "Campuses" },
    { value: "98%", label: "Satisfaction" }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Verified workers, secure payments, and transparent reviews ensure every gig is safe and reliable."
    },
    {
      icon: Heart,
      title: "Community First",
      description: "We build connections that matter, fostering a supportive ecosystem for students and workers."
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Easy to use platform available to everyone, regardless of background or experience."
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "Rigorous quality standards and continuous improvement for exceptional service delivery."
    }
  ];

  const whyChooseUs = [
    {
      title: "Fast Payment",
      description: "Get paid within 24 hours of completing your gig."
    },
    {
      title: "Flexible Schedule",
      description: "Work on your own time, choose gigs that fit your schedule."
    },
    {
      title: "Skill Building",
      description: "Gain real-world experience and develop valuable professional skills."
    },
    {
      title: "Network Growth",
      description: "Connect with peers and professionals in your field."
    }
  ];

  const faqs = [
    {
      question: "How do I get started?",
      answer: "Simply sign up, create your profile, and start browsing available gigs in your area. Verification typically takes 24-48 hours."
    },
    {
      question: "Is it free to join?",
      answer: "Yes! Joining Gigs Mtaani is completely free. We only charge a small service fee on completed transactions."
    },
    {
      question: "How do payments work?",
      answer: "Payments are processed securely through our platform. Workers receive funds within 24 hours after gig completion and approval."
    },
    {
      question: "What if something goes wrong?",
      answer: "Our support team is available 24/7 to help resolve any issues. We also offer buyer protection and worker guarantees."
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="landing-header-content">
          <Link to="/" className="landing-brand">
            <div className="landing-brand-icon">
              <BriefcaseBusiness size={24} />
            </div>
            <span className="landing-brand-text">Gigs Mtaani</span>
          </Link>
          <nav className="landing-nav">
            <Link to="/" className="landing-nav-link">Home</Link>
            <Link to="/about" className="landing-nav-link active">About</Link>
            <Link to="/contact" className="landing-nav-link">Contact</Link>
            <Link to="/auth" className="landing-nav-cta">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <div className="about-hero-orb about-hero-orb-1"></div>
          <div className="about-hero-orb about-hero-orb-2"></div>
        </div>
        <div className="about-hero-content">
          <h1 className="about-hero-title">
            Empowering <span className="text-gradient">Communities</span>, 
            <br />One Gig at a Time
          </h1>
          <p className="about-hero-subtitle">
            We're on a mission to transform how people find work and get things done. 
            Connecting talent with opportunity across Kenya and beyond.
          </p>
          <div className="about-hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="about-stat-item">
                <span className="about-stat-value">{stat.value}</span>
                <span className="about-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="about-section-container">
          <div className="about-mission-grid">
            <div className="about-mission-content">
              <span className="about-kicker">Our Mission</span>
              <h2 className="about-section-title">
                Connecting People to 
                <span className="text-gradient"> Meaningful Work</span>
              </h2>
              <p className="about-section-desc">
                Gigs Mtaani was founded with a simple belief: everyone deserves access to 
                flexible, reliable work opportunities. We bridge the gap between talented 
                individuals and businesses needing their skills.
              </p>
              <p className="about-section-desc">
                Whether you're a student looking for part-time work, a professional seeking 
                additional income, or a business needing reliable help — we've got you covered.
              </p>
              <div className="about-mission-features">
                <div className="about-mission-feature">
                  <CheckCircle2 size={20} />
                  <span>Verified & Vetted Workers</span>
                </div>
                <div className="about-mission-feature">
                  <CheckCircle2 size={20} />
                  <span>Secure Payment Processing</span>
                </div>
                <div className="about-mission-feature">
                  <CheckCircle2 size={20} />
                  <span>24/7 Support Available</span>
                </div>
              </div>
            </div>
            <div className="about-mission-visual">
              <div className="about-mission-card about-mission-card-1">
                <Users size={32} />
                <h4>Community</h4>
                <p>Building stronger connections</p>
              </div>
              <div className="about-mission-card about-mission-card-2">
                <BriefcaseBusiness size={32} />
                <h4>Opportunity</h4>
                <p>Creating meaningful work</p>
              </div>
              <div className="about-mission-card about-mission-card-3">
                <Heart size={32} />
                <h4>Trust</h4>
                <p>Fostering reliable relationships</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section about-section-alt">
        <div className="about-section-container">
          <div className="about-section-header">
            <span className="about-kicker">Our Values</span>
            <h2 className="about-section-title">
              What <span className="text-gradient">Drives Us</span>
            </h2>
            <p className="about-section-subtitle">
              These core values guide everything we do at Gigs Mtaani
            </p>
          </div>
          <div className="about-values-grid">
            {values.map((value, index) => (
              <div key={index} className="about-value-card">
                <div className="about-value-icon">
                  <value.icon size={28} />
                </div>
                <h3 className="about-value-title">{value.title}</h3>
                <p className="about-value-desc">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-section">
        <div className="about-section-container">
          <div className="about-why-grid">
            <div className="about-why-content">
              <span className="about-kicker">Why Gigs Mtaani</span>
              <h2 className="about-section-title">
                Your Trusted 
                <span className="text-gradient"> Gig Platform</span>
              </h2>
              <p className="about-section-desc">
                We understand the challenges of finding reliable work. That's why we've 
                built a platform that prioritizes transparency, fairness, and reliability.
              </p>
              <div className="about-why-list">
                {whyChooseUs.map((item, index) => (
                  <div key={index} className="about-why-item">
                    <div className="about-why-icon">
                      <ArrowRight size={18} />
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/auth" className="btn btn-primary btn-lg about-why-cta">
                Start Your Journey <ChevronRight size={20} />
              </Link>
            </div>
            <div className="about-why-visual">
              <div className="about-why-image-container">
                <div className="about-why-image about-why-image-1">
                  <div className="about-why-image-content">
                    <span className="about-why-image-stat">500+</span>
                    <span>Businesses Served</span>
                  </div>
                </div>
                <div className="about-why-image about-why-image-2">
                  <div className="about-why-image-content">
                    <span className="about-why-image-stat">$2M+</span>
                    <span>Paid to Workers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="about-cta-container">
          <div className="about-cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of workers and businesses already using Gigs Mtaani</p>
            <div className="about-cta-buttons">
              <Link to="/auth" className="btn btn-primary btn-lg">
                Sign Up Free
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-brand">
              <Link to="/" className="landing-brand">
                <div className="landing-brand-icon">
                  <BriefcaseBusiness size={20} />
                </div>
                <span className="landing-brand-text">Gigs Mtaani</span>
              </Link>
              <p>Connecting talent with opportunity. Your trusted platform for flexible work.</p>
            </div>
            <div className="landing-footer-links">
              <h4>Platform</h4>
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/auth">Get Started</Link>
            </div>
            <div className="landing-footer-links">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Safety</a>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
            </div>
            <div className="landing-footer-contact">
              <h4>Contact Us</h4>
              <div className="landing-footer-contact-item">
                <Mail size={16} />
                <span>hello@gigsmtaani.com</span>
              </div>
              <div className="landing-footer-contact-item">
                <Phone size={16} />
                <span>+254 700 000 000</span>
              </div>
              <div className="landing-footer-contact-item">
                <MapPin size={16} />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <p>&copy; 2024 Gigs Mtaani. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-page {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* Header */
        .landing-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--bg-tertiary);
        }

        [data-theme="dark"] .landing-header {
          background: rgba(15, 23, 42, 0.85);
        }

        .landing-header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .landing-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .landing-brand-icon {
          width: 42px;
          height: 42px;
          background: var(--gradient-primary);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);
        }

        .landing-brand-text {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .landing-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .landing-nav-link {
          padding: 0.6rem 1rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }

        .landing-nav-link:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .landing-nav-link.active {
          color: var(--primary-600);
          background: color-mix(in srgb, var(--primary-500) 12%, transparent);
        }

        .landing-nav-cta {
          padding: 0.65rem 1.25rem;
          background: var(--gradient-primary);
          color: white;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          border-radius: var(--radius-lg);
          margin-left: 0.5rem;
          transition: all var(--transition-base);
        }

        .landing-nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        /* About Hero */
        .about-hero {
          position: relative;
          padding: 160px 1.5rem 100px;
          overflow: hidden;
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
        }

        .about-hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .about-hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
        }

        .about-hero-orb-1 {
          width: 400px;
          height: 400px;
          background: var(--primary-400);
          top: -100px;
          left: -100px;
        }

        .about-hero-orb-2 {
          width: 300px;
          height: 300px;
          background: var(--accent-500);
          bottom: -50px;
          right: -50px;
        }

        .about-hero-content {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .about-hero-title {
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .about-hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          max-width: 650px;
          margin: 0 auto 3rem;
          line-height: 1.7;
        }

        .about-hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .about-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .about-stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .about-stat-label {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Sections */
        .about-section {
          padding: 80px 1.5rem;
        }

        .about-section-alt {
          background: var(--bg-secondary);
        }

        .about-section-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .about-section-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .about-kicker {
          display: inline-block;
          padding: 0.4rem 1rem;
          background: color-mix(in srgb, var(--primary-500) 12%, transparent);
          color: var(--primary-600);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-radius: var(--radius-full);
          margin-bottom: 1rem;
        }

        .about-section-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 800;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .about-section-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 550px;
          margin: 0 auto;
        }

        .about-section-desc {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.75;
          margin-bottom: 1.25rem;
        }

        /* Mission Grid */
        .about-mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        @media (max-width: 900px) {
          .about-mission-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }

        .about-mission-features {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-top: 1.5rem;
        }

        .about-mission-feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--primary-600);
          font-weight: 600;
        }

        .about-mission-visual {
          position: relative;
          height: 400px;
        }

        .about-mission-card {
          position: absolute;
          background: var(--bg-secondary);
          border: 1px solid var(--bg-tertiary);
          border-radius: var(--radius-xl);
          padding: 1.75rem;
          text-align: center;
          box-shadow: var(--shadow-lg);
          transition: all 0.3s ease;
        }

        .about-mission-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
        }

        .about-mission-card-1 {
          top: 0;
          left: 10%;
          animation: float 6s ease-in-out infinite;
        }

        .about-mission-card-2 {
          top: 35%;
          right: 5%;
          animation: float 6s ease-in-out infinite 1s;
        }

        .about-mission-card-3 {
          bottom: 5%;
          left: 25%;
          animation: float 6s ease-in-out infinite 2s;
        }

        .about-mission-card svg {
          color: var(--primary-500);
          margin-bottom: 0.75rem;
        }

        .about-mission-card h4 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
        }

        .about-mission-card p {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          margin: 0;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        /* Values Grid */
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .about-values-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .about-values-grid {
            grid-template-columns: 1fr;
          }
        }

        .about-value-card {
          background: var(--bg-primary);
          border: 1px solid var(--bg-tertiary);
          border-radius: var(--radius-xl);
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .about-value-card:hover {
          border-color: var(--primary-500);
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .about-value-icon {
          width: 64px;
          height: 64px;
          background: var(--gradient-primary);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1.25rem;
        }

        .about-value-title {
          font-size: 1.25rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .about-value-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        /* Why Choose Us */
        .about-why-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        @media (max-width: 900px) {
          .about-why-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }

        .about-why-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin: 2rem 0;
        }

        .about-why-item {
          display: flex;
          gap: 1rem;
        }

        .about-why-icon {
          width: 36px;
          height: 36px;
          background: color-mix(in srgb, var(--primary-500) 15%, transparent);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-500);
          flex-shrink: 0;
        }

        .about-why-item h4 {
          font-size: 1.05rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .about-why-item p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .about-why-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .about-why-visual {
          position: relative;
        }

        .about-why-image-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .about-why-image {
          border-radius: var(--radius-xl);
          padding: 2rem;
          display: flex;
          align-items: flex-end;
          min-height: 200px;
          transition: all 0.3s ease;
        }

        .about-why-image:hover {
          transform: scale(1.02);
        }

        .about-why-image-1 {
          background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
        }

        .about-why-image-2 {
          background: linear-gradient(135deg, #f59e0b 0%, #fb923c 100%);
          align-items: flex-start;
        }

        .about-why-image-content {
          display: flex;
          flex-direction: column;
          color: white;
        }

        .about-why-image-stat {
          font-size: 2rem;
          font-weight: 800;
        }

        /* CTA Section */
        .about-cta-section {
          padding: 80px 1.5rem;
          background: var(--gradient-hero);
        }

        .about-cta-container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .about-cta-content h2 {
          font-size: 2.25rem;
          color: white;
          margin-bottom: 1rem;
        }

        .about-cta-content p {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 2rem;
        }

        .about-cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .about-cta-buttons .btn-primary {
          background: white;
          color: var(--primary-600);
        }

        .about-cta-buttons .btn-primary:hover {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: var(--shadow-xl);
        }

        .about-cta-buttons .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .about-cta-buttons .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }

        /* Footer */
        .landing-footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--bg-tertiary);
          padding: 4rem 1.5rem 2rem;
        }

        .landing-footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .landing-footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 3rem;
        }

        @media (max-width: 900px) {
          .landing-footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .landing-footer-grid {
            grid-template-columns: 1fr;
          }
        }

        .landing-footer-brand p {
          margin-top: 1rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .landing-footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .landing-footer-links h4 {
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .landing-footer-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .landing-footer-links a:hover {
          color: var(--primary-500);
        }

        .landing-footer-contact h4 {
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .landing-footer-contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
        }

        .landing-footer-contact-item svg {
          color: var(--primary-500);
        }

        .landing-footer-bottom {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--bg-tertiary);
          text-align: center;
        }

        .landing-footer-bottom p {
          color: var(--text-tertiary);
          font-size: 0.875rem;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .landing-nav {
            display: none;
          }

          .about-hero {
            padding: 120px 1.5rem 60px;
          }

          .about-hero-stats {
            gap: 1.5rem;
          }

          .about-stat-value {
            font-size: 2rem;
          }

          .about-section {
            padding: 60px 1.5rem;
          }

          .about-mission-visual {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

