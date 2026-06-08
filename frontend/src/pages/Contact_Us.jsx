import { useState, useRef, useEffect } from "react";
import { 
  Mail, 
  MessageSquare, 
  MapPin, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  SendHorizontal, 
  Lock 
} from "lucide-react";
import api from "../api/client";
import "../styles/pages/contact-us.css";

const CONTACT_INFO = [
  {
    icon: <Mail size={20} />,
    label: "Email",
    value: "khant@example.com",
    href: "mailto:khant@example.com",
    desc: "Best for detailed inquiries",
  },
  {
    icon: <MessageSquare size={20} />,
    label: "Discord",
    value: "khant#0001",
    href: "#",
    desc: "Quick chats & collabs",
  },
  {
    icon: <MapPin size={20} />,
    label: "Location",
    value: "Rawalpindi, Pakistan",
    href: null,
    desc: "GMT+5:00 timezone",
  },
];

const TOPICS = [
  "Project Inquiry",
  "Freelance Work",
  "Job Opportunity",
  "Open Source",
  "Just Saying Hi",
  "Other",
];

const SOCIALS = [
  { label: "Github"   , href: "https://github.com/", color: "#24292e" },
  { label: "Linkedin" , href: "https://linkedin.com", color: "#0077b5" },
  { label: "Twitter"  , href: "https://twitter.com", color: "#000" },
  { label: "Dev.to"   , icon: <Terminal size={18} />, href: "https://dev.to", color: "#0a0a0a" },
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "", email: "", topic: "", message: "", budget: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [focusedField, setFocusedField] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const heroRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const heroInView = useInView(heroRef);
  const formInView = useInView(formRef);
  const infoInView = useInView(infoRef);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.trim().length < 2) e.name = "Name too short";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.topic) e.topic = "Please select a topic";
    if (!form.message.trim()) e.message = "Message is required";
    else if (form.message.trim().length < 20)
      e.message = "Message must be at least 20 characters";
    return e;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "message") setCharCount(value.length);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const formEl = document.querySelector(".contact-form");
      if (formEl) {
        formEl.classList.add("shake");
        setTimeout(() => formEl.classList.remove("shake"), 500);
      }
      return;
    }

    try {
      setStatus("sending");
      
      // Hit your real backend submission handler route
      await api.post("/contact", form);
      
      setStatus("success");
    } catch (err) {
      console.error("Submission failed:", err);
      setStatus("error");
      setErrors({ submit: err.response?.data?.message || err.message || "Network issue encountered." });
    }
  };

  const handleReset = () => {
    setForm({ name: "", email: "", topic: "", message: "", budget: "" });
    setErrors({});
    setStatus("idle");
    setCharCount(0);
  };

  return (
    <div className="cu-root">
      {/* Background Layer */}
      <div className="cu-bg">
        <div className="cu-blob cu-blob-1" />
        <div className="cu-blob cu-blob-2" />
        <div className="cu-blob cu-blob-3" />
        <div className="cu-grid-overlay" />
      </div>

      <div className="cu-container">
        {/* Hero Header */}
        <header ref={heroRef} className={`cu-hero ${heroInView ? "visible" : ""}`}>
          <div className="cu-hero-pill">
            <span className="cu-pill-dot" />
            <span>Response within 24 hours</span>
          </div>
          <h1 className="cu-hero-title">
            Let's build something<br />
            <span className="cu-hero-gradient">great together.</span>
          </h1>
          <p className="cu-hero-sub">
            Whether it's a dream project, freelance gig, or just a hello —
            I'm all ears and ready to collaborate.
          </p>
        </header>

        {/* Main Layout Grid */}
        <div className="cu-main-grid">
          {/* Left: Information Aside Panel */}
          <aside ref={infoRef} className={`cu-info-panel ${infoInView ? "visible" : ""}`}>
            <div className="cu-avail-card glass-card">
              <div className="cu-avail-header">
                <div className="cu-avail-indicator">
                  <span className="cu-avail-dot" />
                  <span className="cu-avail-text">Available for work</span>
                </div>
                <span className="cu-avail-badge">Open</span>
              </div>
              <p className="cu-avail-body">
                Currently taking on freelance projects and open to full-time
                opportunities starting Q3 2026.
              </p>
              <div className="cu-avail-tags">
                <span className="cu-tag">Full-Stack Dev</span>
                <span className="cu-tag">React / Node</span>
                <span className="cu-tag">Remote</span>
              </div>
            </div>

            {/* List Contact Cards mapping updated lucide elements */}
            <div className="cu-info-list">
              {CONTACT_INFO.map((item, i) => (
                <div
                  key={item.label}
                  className="cu-info-item glass-card"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <div className="cu-info-icon">{item.icon}</div>
                  <div className="cu-info-body">
                    <span className="cu-info-label">{item.label}</span>
                    {item.href ? (
                      <a href={item.href} className="cu-info-value cu-link">
                        {item.value}
                      </a>
                    ) : (
                      <span className="cu-info-value">{item.value}</span>
                    )}
                    <span className="cu-info-desc">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Online Social Handles */}
            <div className="cu-socials glass-card">
              <span className="cu-socials-label">Find me online</span>
              <div className="cu-socials-grid">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="cu-social-btn"
                    style={{ "--social-color": s.color }}
                    title={s.label}
                  >
                    <span className="cu-social-icon">{s.icon}</span>
                    <span className="cu-social-name">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Right: Functional Form Workspace Wrapper */}
          <div ref={formRef} className={`cu-form-wrap ${formInView ? "visible" : ""}`}>
            {status === "success" ? (
              <div className="cu-success glass-card">
                <div className="cu-success-icon" style={{ color: "#10b981", display: "flex", justifyContent: "center" }}>
                  <CheckCircle2 size={56} strokeWidth={1.5} />
                </div>
                <h2 className="cu-success-title">Message sent!</h2>
                <p className="cu-success-body">
                  Thanks for reaching out, <strong>{form.name}</strong>. I'll get
                  back to you at <strong>{form.email}</strong> within 24 hours.
                </p>
                <button className="cu-btn-primary" onClick={handleReset}>
                  Send another message
                </button>
              </div>
            ) : (
              <form
                className="contact-form cu-form glass-card"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="cu-form-header">
                  <h2 className="cu-form-title">Send a message</h2>
                  <p className="cu-form-sub">All fields marked * are required</p>
                </div>

                {errors.submit && (
                  <div className="error-box" style={{ display: "flex", gap: "10px", padding: "12px", background: "rgba(239,68,68,0.1)", borderRadius: "8px", color: "#ef4444", marginBottom: "20px", fontSize: "14px" }}>
                    <AlertTriangle size={18} />
                    <span>{errors.submit}</span>
                  </div>
                )}

                {/* Name + Email Inputs Row */}
                <div className="cu-row">
                  <div className={`cu-field ${focusedField === "name" ? "focused" : ""} ${errors.name ? "has-error" : ""} ${form.name ? "has-value" : ""}`}>
                    <label className="cu-label" htmlFor="name">
                      Full Name <span className="cu-req">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="cu-input"
                      placeholder="Khant Htet"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="name"
                      disabled={status === "sending"}
                    />
                    {errors.name && (
                      <span className="cu-error-msg">
                        <AlertTriangle size={12} style={{ display: "inline", marginRight: "4px" }} />
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div className={`cu-field ${focusedField === "email" ? "focused" : ""} ${errors.email ? "has-error" : ""} ${form.email ? "has-value" : ""}`}>
                    <label className="cu-label" htmlFor="email">
                      Email Address <span className="cu-req">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="cu-input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="email"
                      disabled={status === "sending"}
                    />
                    {errors.email && (
                      <span className="cu-error-msg">
                        <AlertTriangle size={12} style={{ display: "inline", marginRight: "4px" }} />
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Topic Selector Block */}
                <div className={`cu-field ${errors.topic ? "has-error" : ""}`}>
                  <label className="cu-label">
                    Topic <span className="cu-req">*</span>
                  </label>
                  <div className="cu-topic-grid">
                    {TOPICS.map((t) => (
                      <button
                        type="button"
                        key={t}
                        className={`cu-topic-btn ${form.topic === t ? "selected" : ""}`}
                        onClick={() => handleChange("topic", t)}
                        disabled={status === "sending"}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {errors.topic && (
                    <span className="cu-error-msg">
                      <AlertTriangle size={12} style={{ display: "inline", marginRight: "4px" }} />
                      {errors.topic}
                    </span>
                  )}
                </div>

                {/* Budget Selection (Optional Dropdown) */}
                <div className={`cu-field ${focusedField === "budget" ? "focused" : ""}`}>
                  <label className="cu-label" htmlFor="budget">
                    Budget Range{" "}
                    <span className="cu-optional">(optional)</span>
                  </label>
                  <select
                    id="budget"
                    className="cu-input cu-select"
                    value={form.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    onFocus={() => setFocusedField("budget")}
                    onBlur={() => setFocusedField(null)}
                    disabled={status === "sending"}
                  >
                    <option value="">Select a range...</option>
                    <option value="<1k">Under $1,000</option>
                    <option value="1k-5k">$1,000 – $5,000</option>
                    <option value="5k-15k">$5,000 – $15,000</option>
                    <option value="15k+">$15,000+</option>
                    <option value="discuss">Let's discuss</option>
                  </select>
                </div>

                {/* Message Body Field */}
                <div className={`cu-field cu-field-grow ${focusedField === "message" ? "focused" : ""} ${errors.message ? "has-error" : ""}`}>
                  <label className="cu-label" htmlFor="message">
                    Message <span className="cu-req">*</span>
                  </label>
                  <textarea
                    id="message"
                    className="cu-input cu-textarea"
                    placeholder="Tell me about your project, idea, or anything on your mind..."
                    rows={5}
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    maxLength={1000}
                    disabled={status === "sending"}
                  />
                  <div className="cu-textarea-footer">
                    {errors.message ? (
                      <span className="cu-error-msg">
                        <AlertTriangle size={12} style={{ display: "inline", marginRight: "4px" }} />
                        {errors.message}
                      </span>
                    ) : <div />}
                    <span className={`cu-char-count ${charCount > 900 ? "warn" : ""}`}>
                      {charCount}/1000
                    </span>
                  </div>
                </div>

                {/* Form Pipeline Triggers */}
                <div className="cu-form-actions">
                  <button
                    type="submit"
                    className={`cu-btn-primary cu-submit ${status === "sending" ? "loading" : ""}`}
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 size={16} className="cu-spinner" style={{ animation: "spin 1s linear infinite" }} />
                        Sending…
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <SendHorizontal size={16} className="cu-send-arrow" />
                      </>
                    )}
                  </button>
                  <p className="cu-privacy-note">
                    <Lock size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                    Your info is never shared with third parties.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Main Canvas Footer */}
        <footer className="cu-footer">
          <p>© {new Date().getFullYear()} WealthFlow Financial Technologies. All rights reserved.</p>
          <span className="cu-footer-divider">·</span>
          <span>Usually responds within a day</span>
        </footer>
      </div>
    </div>
  );
}