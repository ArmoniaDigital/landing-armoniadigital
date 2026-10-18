import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Tags } from "lucide-react";
import "./Blog.css";

const blogImages = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1100&q=85",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85",
];

export default function Blog({ copy, contactHref }) {
  const isExternalContact = contactHref?.startsWith("http");

  return (
    <main className="blog-page" id="blog">
      <section className="blog-hero">
        <div className="container blog-hero-inner">
          <a className="blog-back" href="#inicio">
            <ArrowLeft size={18} />
            {copy.back}
          </a>

          <div className="blog-hero-copy">
            <span className="section-kicker">{copy.kicker}</span>
            <h1>
              {copy.titleStart} <span>{copy.titleHighlight}</span>
            </h1>
            <p>{copy.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="blog-list-section">
        <div className="container blog-list-layout">
          <article className="blog-featured-card">
            <div className="blog-featured-image">
              <img src={blogImages[0]} alt={copy.featured.title} loading="eager" fetchPriority="high" />
            </div>
            <div className="blog-featured-copy">
              <span className="blog-category">{copy.featured.category}</span>
              <h2>{copy.featured.title}</h2>
              <p>{copy.featured.excerpt}</p>
              <div className="blog-meta">
                <span>
                  <Clock3 size={15} />
                  {copy.featured.readTime}
                </span>
                <span>
                  <CalendarDays size={15} />
                  {copy.featured.date}
                </span>
              </div>
              <a className="blog-read-link" href="#contacto">
                {copy.readMore}
                <ArrowRight size={17} />
              </a>
            </div>
          </article>

          <div className="blog-grid">
            {copy.posts.map((post, index) => (
              <article className="blog-card" key={post.title}>
                <div className="blog-card-image">
                  <img src={blogImages[(index + 1) % blogImages.length]} alt={post.title} loading="lazy" />
                </div>
                <div className="blog-card-copy">
                  <span className="blog-category">{post.category}</span>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <div className="blog-meta">
                    <span>
                      <Clock3 size={15} />
                      {post.readTime}
                    </span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="blog-cta">
            <div>
              <span>{copy.ctaKicker}</span>
              <h2>{copy.ctaTitle}</h2>
              <p>{copy.ctaText}</p>
            </div>
            <div className="blog-cta-actions">
              <a className="blog-cta-primary" href="#precios">
                <Tags size={18} />
                {copy.plansButton}
              </a>
              <a
                className="blog-cta-secondary"
                href={contactHref || "#contacto"}
                target={isExternalContact ? "_blank" : undefined}
                rel={isExternalContact ? "noreferrer" : undefined}
              >
                <CalendarDays size={18} />
                {copy.callButton}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
