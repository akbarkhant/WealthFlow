import { useState, useEffect } from "react";
import "../styles/pages/About.css";

const skills = [
  { name: "React", level: 90, color: "#10b981", icon: "⚛️" },
  { name: "Node.js", level: 82, color: "#006c49", icon: "🟢" },
  { name: "TypeScript", level: 78, color: "#005ac2", icon: "🔷" },
  { name: "Python", level: 74, color: "#545f73", icon: "🐍" },
  { name: "PostgreSQL", level: 68, color: "#10b981", icon: "🐘" },
  { name: "Docker", level: 65, color: "#006c49", icon: "🐳" },
];

const projects = [
  {
    title: "WealthFlow",
    description: "A modern budget management system with glassmorphic UI, real-time analytics, and smart categorization.",
    tags: ["React", "Node.js", "PostgreSQL"],
    accent: "#006c49",
  },
  {
    title: "DevTrack",
    description: "Full-stack issue tracker with Kanban boards, GitHub integration, and team collaboration tools.",
    tags: ["TypeScript", "Next.js", "Redis"],
    accent: "#005ac2",
  },
  {
    title: "PulseAPI",
    description: "High-performance REST API gateway with rate limiting, analytics dashboard, and auto-scaling.",
    tags: ["Python", "FastAPI", "Docker"],
    accent: "#545f73",
  },
];

const stats = [
  { label: "Projects Shipped", value: "24+" },
  { label: "Years Coding", value: "5+" },
  { label: "GitHub Stars", value: "1.2k" },
  { label: "Coffees/Day", value: "3" },
];

export default function About() {
  const [activeSection, setActiveSection] = useState("about");
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="about-root">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Nav */}
      <nav className="nav glass-card">
        <div className="nav-brand">
          <span className="nav-dot" />
          <span className="nav-name">Khant</span>
        </div>
        <div className="nav-links">
          {["about", "skills", "projects", "contact"].map((s) => (
            <button
              key={s}
              className={`nav-link ${activeSection === s ? "active" : ""}`}
              onClick={() => {
                setActiveSection(s);
                document.getElementById(s)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        {/* Hero */}
        <section id="about" className={`hero ${animated ? "visible" : ""}`}>
          <div className="hero-left">
            <div className="hero-badge glass-card">
              <span className="badge-dot" />
              Available for work
            </div>
            <h1 className="hero-title">
              Hey, I'm <span className="highlight">Khant</span>
            </h1>
            <p className="hero-subtitle">
              Developer & Engineer who loves building{" "}
              <span className="text-primary">fast</span>,{" "}
              <span className="text-tertiary">scalable</span>, and{" "}
              <span className="text-emerald">beautiful</span> software.
            </p>
            <p className="hero-bio">
              I craft full-stack products from database to deployment. Obsessed
              with clean architecture, great developer experience, and UIs that
              feel truly polished.
            </p>
            <div className="hero-cta">
              <a href="/contact_us" className="btn-primary">
                Get in touch
              </a>
              <a href="/projects" className="btn-ghost">
                View projects →
              </a>
            </div>
          </div>

          <div className="hero-right">
            <div className="avatar-wrapper glass-card">
              <div className="avatar-ring" />
              <div className="avatar-inner">
                <span className="avatar-initials">
                  <img className="my_img" src="../../public/my_pic_2.png" alt="Khant" />
                </span>
              </div>
              <div className="avatar-badge">
                <span>💻</span>
              </div>
            </div>
          </div>
        </section>

        {/* Continuous Tech Stack Marquee Line */}
        <div className="login-marquee glass-card">
          <div className="login-marquee__inner">
            {[...skills, ...skills].map((skill, index) => (
              <div key={`${skill.name}-${index}`} className="login-marquee__item">
                <span className="login-marquee__icon-fallback">{skill.icon}</span>
                <span>{skill.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <section className={`stats-grid ${animated ? "visible" : ""}`}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="stat-card glass-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section id="skills" className="section">
          <div className="section-header">
            <span className="section-eyebrow">EXPERTISE</span>
            <h2 className="section-title">Skills & Stack</h2>
          </div>
          <div className="skills-grid">
            {skills.map((skill, i) => (
              <div
                key={skill.name}
                className="skill-card glass-card"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="skill-header">
                  <span className="skill-name">
                    <span style={{ marginRight: "8px" }}>{skill.icon}</span>
                    {skill.name}
                  </span>
                  <span className="skill-pct">{skill.level}%</span>
                </div>
                <div className="skill-track">
                  <div
                    className="skill-bar"
                    style={{
                      width: animated ? `${skill.level}%` : "0%",
                      background: skill.color,
                      transitionDelay: `${i * 0.08 + 0.3}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="section">
          <div className="section-header">
            <span className="section-eyebrow">PORTFOLIO</span>
            <h2 className="section-title">Featured Projects</h2>
          </div>
          <div className="projects-grid">
            {projects.map((project, i) => (
              <div
                key={project.title}
                className="project-card glass-card"
                style={{ "--accent": project.accent, animationDelay: `${i * 0.12}s` }}
              >
                <div className="project-accent-bar" style={{ backgroundColor: project.accent }} />
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="project-link">
                  View project →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="section contact-section">
          <div className="contact-card glass-card">
            <div className="contact-inner">
              <span className="section-eyebrow">CONTACT</span>
              <h2 className="section-title">Let's Build Something</h2>
              <p className="contact-sub">
                Got a project in mind or just want to chat? My inbox is always open.
              </p>
              <div className="contact-links">
                <a href="mailto:akbarkhant101@example.com" className="btn-primary">
                  ✉️ Send an email
                </a>
                <a href="https://github.com/akbarkhant" target="_blank" rel="noreferrer" className="contact-social glass-card">
                  GitHub
                </a>
                <a href="https://linkedin.com/in/akbarkhant" target="_blank" rel="noreferrer" className="contact-social glass-card">
                  LinkedIn
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="contact-social glass-card">
                  Twitter
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <p>© {new Date().getFullYear()}  WealthFlow Financial Technologies.
              All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}