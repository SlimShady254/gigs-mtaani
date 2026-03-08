import { Link } from "react-router-dom";
import { 
  BriefcaseBusiness, 
  Search, 
  Shield, 
  Clock, 
  CreditCard, 
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
  Zap,
  Globe,
  ChevronRight,
  Play,
  Quote
} from "lucide-react";
import { useThemeStore } from "../state/themeStore";

export function HomePage() {
  const { theme } = useThemeStore();

  const features = [
    {
      icon: Search,
      title: "Find Gigs Easily",
      description: "Browse hundreds of available gigs in your area. Filter by location, pay, and category to find your perfect match."
    },
    {
      icon: Shield,
      title: "Verified & Secure",
      description: "Every worker is vetted. Secure payments with escrow protection ensure you're paid for every job completed."
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Work on your own time. Choose gigs that fit your schedule and earn money on your terms."
    },
    {
      icon: CreditCard,
      title: "Fast Payments",
      description: "Get paid within 24-48 hours after completing a job. Multiple payment methods available."
    },
    {
      icon: Star,
      title: "Build Your Rep",
      description: "Earn reviews and ratings to build your reputation. Stand out to clients and command higher rates."
    },
    {
      icon: Zap,
      title: "Instant Matching",
      description: "Our smart algorithm matches you with the right gigs instantly. No more endless searching."
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Your Profile",
      description: "Sign up and build your profile. Add your skills, experience, and preferences to get started."
    },
    {
      step: "02",
      title: "Browse & Apply",
      description: "Explore available gigs that match your skills. Apply directly and wait for client approval."
    },
    {
      step: "03",
      title: "Complete the Work",
      description: "Once matched, complete the gig professionally. Communicate clearly and deliver quality work."
    },
    {
      step: "04",
      title: "Get Paid",
      description: "After approval, receive payment directly to your account. Build your reputation with every job."
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Gigs" },
    { value: "5K+", label: "Verified Workers" },
    { value: "50+", label: "Campuses" },
    { value: "98%", label: "Satisfaction Rate" }
  ];

  const testimonials = [
    {
      quote: "Gigs Mtaani changed my life! I can now work around my classes and earn money for my tuition.",
      author: "Sarah W.",
      role: "University Student",
      avatar: "S"
    },
    {
      quote: "As a business owner, I found reliable help within hours. The quality of workers is impressive.",
      author: "James M.",
      role: "Business Owner",
      avatar: "J"
    },
    {
      quote: "The payment process is seamless. I've never had any issues getting paid on time.",
      author: "Emily K.",
      role: "Freelancer",
      avatar: "E"
    }
  ];

  const categories = [
    "Delivery", "Tutoring", "Cleaning", "Moving", "Event Staff", 
    "Photography", "Graphic Design", "Web Dev", "Writing", "More"
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
            <Link to="/" className="landing-nav-link active">Home</Link>
            <Link to="/about" className="landing-nav-link">About</Link>
            <Link to="/contact" className="landing-nav-link">Contact</Link>
            <Link to="/auth" className="landing-nav-cta">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-badge">
              <Zap size={14} />
              Kenya's #1 Gig Platform
            </span>
            <h1 className="hero-title">
              Find <span className="text-gradient">Flexible Work</span> <br />
              On Your Terms
            </h1>
            <p className="hero-subtitle">
              Connect with thousands of gigs and opportunities. Whether you're a student, 
              freelancer, or looking for extra income — your next job is here.
            </p>
            <div className="hero-actions">
              <Link to="/auth" className="btn btn-primary btn-lg">
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn btn-secondary btn-lg">
                Learn More
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">10K+</span>
                <span className="hero-stat-label">Active Gigs</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-value">5K+</span>
                <span className="hero-stat-label">Workers</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-value">98%</span>
                <span className="hero-stat-label">Satisfaction</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card hero-card-main">
              <div className="hero-card-header">
                <div className="hero-card-avatar">JD</div>
                <div>
                  <h4>John Doe</h4>
                  <span>Verified Worker ⭐ 4.9</span>
                </div>
              </div>
              <div className="hero-card-body">
                <div className="hero-gig-info">
                  <span className="hero-gig-label">Completed Gig</span>
                  <h3>Office Cleaning</h3>
                  <p>Westlands, Nairobi</p>
                </div>
                <div className="hero-gig-pay">
                  <span>Earned</span>
                  <strong>KSh 2,500</strong>
                </div>
              </div>
            </div>
            <div className="hero-card hero-card-float hero-card-1">
              <CheckCircle2 size={20} />
              <span>Payment Received</span>
            </div>
            <div className="hero-card hero-card-float hero-card-2">
              <Star size={20} />
              <span>5.0 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Strip */}
      <section className="categories-strip">
        <div className="categories-container">
          <p>Popular Categories:</p>
          <div className="categories-list">
            {categories.map((cat, i) => (
              <Link key={i} to="/auth" className="category-tag">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <span className="section-kicker">Why Choose Us</span>
            <h2 className="section-title">
              Everything You Need to <span className="text-gradient">Succeed</span>
            </h2>
            <p className="section-subtitle">
              We provide all the tools and support you need to find work and get paid securely
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="how-container">
          <div className="section-header">
            <span className="section-kicker">Simple Process</span>
            <h2 className="section-title">
              How <span className="text-gradient">It Works</span>
            </h2>
            <p className="section-subtitle">
              Get started in minutes and start earning
            </p>
          </div>
          <div className="how-steps">
            {howItWorks.map((step, index) => (
              <div key={index} className="how-step">
                <div className="how-step-number">{step.step}</div>
                <div className="how-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="how-step-arrow">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-bg"></div>
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header">
            <span className="section-kicker">Testimonials</span>
            <h2 className="section-title">
              What Our Users <span className="text-gradient">Say</span>
            </h2>
            <p className="section-subtitle">
              Join thousands of satisfied workers and clients
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-quote">
                  <Quote size={32} />
                </div>
                <p className="testimonial-text">{testimonial.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{testimonial.avatar}</div>
                  <div>
                    <h4>{testimonial.author}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Start Earning?</h2>
            <p>Join thousands of workers already earning with Gigs Mtaani. It takes less than 2 minutes to sign up.</p>
            <div className="cta-actions">
              <Link to="/auth" className="btn btn-primary btn-lg">
                Create Free Account
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                Have Questions?
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
              <p>Connecting talent with opportunity. Your trusted platform for flexible work across Kenya.</p>
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
                <span>📧</span>
                <span>hello@gigsmtaani.com</span>
              </div>
              <div className="landing-footer-contact-item">
                <span>📱</span>
                <span>+254 700 000 000</span>
              </div>
              <div className="landing-footer-contact-item">
                <span>📍</span>
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
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--bg-tertiary);
        }

        [data-theme="dark"] .landing-header {
          background: rgba(15, 23, 42, 0.9);
        }

        .landing-header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.9rem 1.5rem;
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
          gap: 0.3rem;
        }

        .landing-nav-link {
          padding: 0.55rem 1rem;
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
          padding: 0.6rem 1.2rem;
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

        /* Hero Section */
        .hero-section {
          position: relative;
          padding: 140px 1.5rem 80px;
          overflow: hidden;
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          min-height: 90vh;
          display: flex;
          align-items: center;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
        }

        .hero-orb-1 {
          width: 500px;
          height: 500px;
          background: var(--primary-400);
          top: -150px;
          right: -100px;
        }

        .hero-orb-2 {
          width: 350px;
          height: 350px;
          background: var(--accent-500);
          bottom: -100px;
          left: -50px;
        }

        .hero-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(var(--bg-tertiary) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.5;
        }

        .hero-container {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 3rem;
          }

          .hero-visual {
            display: none;
          }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: color-mix(in srgb, var(--primary-500) 12%, transparent);
          color: var(--primary-600);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: var(--radius-full);
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 3.75rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 520px;
        }

        @media (max-width: 1024px) {
          .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
          }
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        @media (max-width: 1024px) {
          .hero-actions {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .hero-actions {
            flex-direction: column;
          }

          .hero-actions .btn {
            width: 100%;
          }
        }

        .hero-actions .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .hero-actions .btn-primary {
          background: var(--gradient-primary);
          color: white;
        }

        .hero-actions .btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--bg-quaternary);
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .hero-stats {
            justify-content: center;
          }
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
        }

        .hero-stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .hero-stat-label {
          font-size: 0.85rem;
          color: var(--text-tertiary);
        }

        .hero-stat-divider {
          width: 1px;
          height: 40px;
          background: var(--bg-quaternary);
        }

        /* Hero Visual */
        .hero-visual {
          position: relative;
          height: 450px;
        }

        .hero-card {
          background: var(--bg-secondary);
          border: 1px solid var(--bg-tertiary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
        }

        .hero-card-main {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 1.5rem;
          width: 320px;
          animation: float 6s ease-in-out infinite;
        }

        .hero-card-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .hero-card-avatar {
          width: 48px;
          height: 48px;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
        }

        .hero-card-header h4 {
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.15rem;
        }

        .hero-card-header span {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }

        .hero-card-body {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 1rem;
          border-top: 1px solid var(--bg-tertiary);
        }

        .hero-gig-label {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero-gig-info h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin: 0.25rem 0 0.15rem;
        }

        .hero-gig-info p {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          margin: 0;
        }

        .hero-gig-pay {
          text-align: right;
        }

        .hero-gig-pay span {
          display: block;
          font-size: 0.7rem;
          color: var(--text-tertiary);
          margin-bottom: 0.15rem;
        }

        .hero-gig-pay strong {
          font-size: 1.35rem;
          color: var(--success-500);
        }

        .hero-card-float {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .hero-card-float svg {
          color: var(--success-500);
        }

        .hero-card-1 {
          top: 15%;
          right: 5%;
          animation: float 5s ease-in-out infinite 0.5s;
        }

        .hero-card-2 {
          bottom: 15%;
          left: 0;
          animation: float 5s ease-in-out infinite 1s;
        }

        .hero-card-2 svg {
          color: var(--warning-500);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        /* Categories Strip */
        .categories-strip {
          background: var(--bg-secondary);
          border-top: 1px solid var(--bg-tertiary);
          border-bottom: 1px solid var(--bg-tertiary);
          padding: 1rem 1.5rem;
          overflow-x: auto;
        }

        .categories-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .categories-container p {
          color: var(--text-tertiary);
          font-size: 0.9rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .categories-list {
          display: flex;
          gap: 0.75rem;
          flex-wrap: nowrap;
        }

        .category-tag {
          padding: 0.4rem 0.9rem;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          white-space: nowrap;
          transition: all var(--transition-base);
        }

        .category-tag:hover {
          background: var(--primary-500);
          color: white;
        }

        /* Sections Common */
        .section-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .section-kicker {
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

        .text-gradient {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 800;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 550px;
          margin: 0 auto;
        }

        /* Features Section */
        .features-section {
          padding: 80px 1.5rem;
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        .feature-card {
          background: var(--bg-secondary);
          border: 1px solid var(--bg-tertiary);
          border-radius: var(--radius-xl);
          padding: 2rem;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          border-color: var(--primary-500);
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          background: var(--gradient-primary);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 1.25rem;
        }

        .feature-title {
          font-size: 1.2rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .feature-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        /* How It Works */
        .how-section {
          padding: 80px 1.5rem;
          background: var(--bg-secondary);
        }

        .how-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .how-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .how-steps {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .how-steps {
            grid-template-columns: 1fr;
          }
        }

        .how-step {
          position: relative;
          padding: 1.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--bg-tertiary);
          border-radius: var(--radius-xl);
          transition: all 0.3s ease;
        }

        .how-step:hover {
          border-color: var(--primary-500);
          transform: translateY(-3px);
        }

        .how-step-number {
          font-size: 3rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
          margin-bottom: 1rem;
        }

        .how-step-content h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .how-step-content p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .how-step-arrow {
          position: absolute;
          top: 50%;
          right: -1.25rem;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          z-index: 1;
        }

        @media (max-width: 900px) {
          .how-step-arrow {
            display: none;
          }
        }

        /* Stats Section */
        .stats-section {
          position: relative;
          padding: 60px 1.5rem;
          background: var(--gradient-hero);
          overflow: hidden;
        }

        .stats-bg {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 50%);
        }

        .stats-container {
          position: relative;
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          text-align: center;
        }

        @media (max-width: 640px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
        }

        .stat-label {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.8);
        }

        /* Testimonials */
        .testimonials-section {
          padding: 80px 1.5rem;
        }

        .testimonials-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: 0 auto;
          }
        }

        .testimonial-card {
          background: var(--bg-secondary);
          border: 1px solid var(--bg-tertiary);
          border-radius: var(--radius-xl);
          padding: 2rem;
          position: relative;
        }

        .testimonial-quote {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          color: var(--primary-400);
          opacity: 0.3;
        }

        .testimonial-text {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .testimonial-avatar {
          width: 48px;
          height: 48px;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
        }

        .testimonial-author h4 {
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.15rem;
        }

        .testimonial-author span {
          font-size: 0.85rem;
          color: var(--text-tertiary);
        }

        /* CTA Section */
        .cta-section {
          padding: 80px 1.5rem;
          background: var(--bg-secondary);
        }

        .cta-container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.25rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.15rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 550px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        @media (max-width: 500px) {
          .cta-actions {
            flex-direction: column;
            align-items: center;
          }
        }

        .cta-actions .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-lg);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          border: none;
          text-decoration: none;
        }

        .btn-primary {
          background: var(--gradient-primary);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--bg-quaternary);
        }

        .btn-secondary:hover {
          background: var(--bg-quaternary);
          color: var(--text-primary);
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1rem;
        }

        /* Footer */
        .landing-footer {
          background: var(--bg-primary);
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

          .hero-section {
            padding: 100px 1.5rem 50px;
            min-height: auto;
          }

          .features-section,
          .how-section,
          .testimonials-section,
          .cta-section {
            padding: 60px 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

