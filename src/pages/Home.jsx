import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { lessonsAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";
import "./Pages.css";

const HERO_SLIDES = [
  {
    title: "Turn life lessons into momentum",
    description:
      "Collect real-world insights from people who turned setbacks into breakthroughs.",
    cta: { label: "Explore lessons", to: "/lessons" },
    accent: "#7c3aed",
    badge: "Community",
  },
  {
    title: "Share your story, mentor others",
    description:
      "Publish your lived experiences so others can avoid pitfalls and grow faster.",
    cta: { label: "Start teaching", to: "/dashboard" },
    accent: "#2563eb",
    badge: "Teach",
  },
  {
    title: "Grow a habit of learning from life",
    description:
      "Save the lessons that resonate, revisit them weekly, and apply them intentionally.",
    cta: { label: "Save favorites", to: "/lessons" },
    accent: "#ea580c",
    badge: "Habits",
  },
];

const normalizeLessons = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const deriveFeatured = (lessons) => {
  const featured = lessons.filter(
    (lesson) =>
      lesson.isFeatured || lesson.featured || lesson.status === "featured"
  );

  const pool = featured.length ? featured : lessons;
  return pool.slice(0, 6);
};

const deriveTopContributors = (lessons) => {
  const counts = lessons.reduce((acc, lesson) => {
    const instructor =
      lesson.instructor?.name ||
      lesson.instructor?.displayName ||
      lesson.author?.name ||
      lesson.author ||
      "Community Mentor";

    if (!acc[instructor]) {
      acc[instructor] = {
        name: instructor,
        avatar: lesson.instructor?.photoURL || null,
        lessons: 0,
        highlights: lesson.category || "Life Lesson",
      };
    } else if (!acc[instructor].avatar && lesson.instructor?.photoURL) {
      acc[instructor].avatar = lesson.instructor.photoURL;
    }

    acc[instructor].lessons += 1;
    return acc;
  }, {});

  return Object.values(counts)
    .sort((a, b) => b.lessons - a.lessons)
    .slice(0, 4);
};

const deriveMostSaved = (lessons) => {
  const withSaves = lessons.map((lesson) => {
    const saves =
      lesson.favoritesCount ??
      lesson.favoriteCount ??
      lesson.savedCount ??
      lesson.saves ??
      (Array.isArray(lesson.savedBy) ? lesson.savedBy.length : 0) ??
      (Array.isArray(lesson.favorites) ? lesson.favorites.length : 0) ??
      (Array.isArray(lesson.enrolledStudents)
        ? lesson.enrolledStudents.length
        : 0);

    return { ...lesson, saves: saves || 0 };
  });

  return withSaves.sort((a, b) => (b.saves || 0) - (a.saves || 0)).slice(0, 4);
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [featuredLessons, setFeaturedLessons] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [mostSavedLessons, setMostSavedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      setLoading(true);
      setError("");

      try {
        // Try to fetch public lessons first
        let response;
        let lessons = [];

        try {
          response = await lessonsAPI.getPublic();
          lessons = normalizeLessons(response.data);
        } catch (publicErr) {
          // Fallback to getAll if getPublic fails
          console.log(
            "Public lessons failed, trying getAll:",
            publicErr.message
          );
          response = await lessonsAPI.getAll();
          lessons = normalizeLessons(response.data);
        }

        if (!isMounted) return;

        console.log("Fetched lessons:", lessons.length);

        setFeaturedLessons(deriveFeatured(lessons));
        setTopContributors(deriveTopContributors(lessons));
        setMostSavedLessons(deriveMostSaved(lessons));
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading home data:", err);
        setError(
          "Unable to load the latest lessons right now. Please try again shortly."
        );
        setFeaturedLessons([]);
        setTopContributors([]);
        setMostSavedLessons([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePrev = () => {
    setActiveSlide(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
    );
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="page home-page">
      <section className="hero-slider">
        <div className="hero-slider__content">
          {HERO_SLIDES.map((slide, index) => (
            <article
              key={slide.title}
              className={`hero-slide ${
                index === activeSlide ? "is-active" : ""
              }`}
              style={{
                background: `linear-gradient(120deg, ${slide.accent} 0%, #0f172a 100%)`,
              }}
            >
              <div className="hero-slide__badge">{slide.badge}</div>
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
              <div className="cta-buttons">
                <Link to={slide.cta.to} className="btn btn-primary">
                  {slide.cta.label}
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn btn-secondary">
                    Join free
                  </Link>
                )}
              </div>
            </article>
          ))}
          <div className="hero-slider__controls">
            <button onClick={handlePrev} aria-label="Previous slide">
              ◀
            </button>
            <div className="hero-slider__dots">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
                  className={index === activeSlide ? "active" : ""}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>
            <button onClick={handleNext} aria-label="Next slide">
              ▶
            </button>
          </div>
        </div>
        <div className="hero-slider__aside">
          <div className="mini-stats">
            <div>
              <span className="label">Featured lessons</span>
              <strong>{featuredLessons.length || "—"}</strong>
            </div>
            <div>
              <span className="label">Top contributors</span>
              <strong>{topContributors.length || "—"}</strong>
            </div>
            <div>
              <span className="label">Saved lessons</span>
              <strong>{mostSavedLessons.length || "—"}</strong>
            </div>
          </div>
          <p className="aside-note">
            Curated weekly by the admin team and surfaced automatically from the
            latest life lessons.
          </p>
        </div>
      </section>

      <section className="section featured-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Admin curated</p>
            <h2>Featured Life Lessons</h2>
            <p className="section-subtitle">
              Highlighted lessons surfaced from the manage-lessons dashboard.
            </p>
          </div>
          <Link to="/lessons" className="text-link">
            View all lessons →
          </Link>
        </div>

        {error && <div className="inline-alert">{error}</div>}

        <div className="featured-grid">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="lesson-card skeleton" />
            ))}

          {!loading && featuredLessons.length === 0 && !error && (
            <div className="empty-state">
              <p>No featured lessons yet. Check back soon.</p>
            </div>
          )}

          {!loading &&
            featuredLessons.map((lesson) => {
              const lessonId = lesson._id || lesson.id;
              return (
                <div key={lessonId} className="lesson-card featured-card">
                  <div className="lesson-card__meta">
                    <span className="pill">{lesson.category || "Life"}</span>
                    {lesson.isFeatured || lesson.featured ? (
                      <span className="pill pill-accent">Featured</span>
                    ) : null}
                  </div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description?.slice(0, 140) || "No description"}</p>
                  <div className="lesson-footer">
                    <div className="lesson-author">
                      <span role="img" aria-label="author">
                        👤
                      </span>
                      <span>
                        {lesson.instructor?.name ||
                          lesson.instructor?.displayName ||
                          lesson.author ||
                          "Community mentor"}
                      </span>
                    </div>
                    <Link
                      to={`/lessons/${lessonId}`}
                      className="btn btn-secondary"
                    >
                      View lesson
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      <section className="section benefits-section">
        <p className="eyebrow">Why Learning From Life Matters</p>
        <h2>Make every experience a lesson</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>Real-world wisdom</h3>
            <p>
              Skip theory. Learn from real people navigating real constraints.
            </p>
          </div>
          <div className="benefit-card">
            <h3>Compounding growth</h3>
            <p>
              Capture lessons, revisit weekly, and watch small actions compound.
            </p>
          </div>
          <div className="benefit-card">
            <h3>Save time and energy</h3>
            <p>
              Avoid costly detours by applying proven playbooks from the
              community.
            </p>
          </div>
          <div className="benefit-card">
            <h3>Build resilience</h3>
            <p>
              See how others handled setbacks so you can respond with
              confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="section contributors-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Top Contributors of the Week</p>
            <h2>Mentors keeping the community growing</h2>
          </div>
        </div>

        <div className="contributors-grid">
          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="contributor-card skeleton" />
            ))}

          {!loading && topContributors.length === 0 && (
            <div className="empty-state">
              <p>Contributors will appear here once lessons are published.</p>
            </div>
          )}

          {!loading &&
            topContributors.map((contributor) => (
              <div key={contributor.name} className="contributor-card">
                <div className="avatar" aria-hidden>
                  {contributor.avatar ? (
                    <img
                      src={contributor.avatar}
                      alt={contributor.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerText =
                          contributor.name.charAt(0);
                      }}
                    />
                  ) : (
                    <span>{contributor.name.charAt(0)}</span>
                  )}
                </div>
                <div className="contributor-meta">
                  <h3>{contributor.name}</h3>
                  <p>{contributor.lessons} lessons shared</p>
                  <span className="pill">{contributor.highlights}</span>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="section saved-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Most Saved Lessons</p>
            <h2>Community favorites this week</h2>
            <p className="section-subtitle">
              Pulled dynamically from lessons with the highest saves and
              enrollments.
            </p>
          </div>
          <Link to="/dashboard/favorites" className="text-link">
            See your favorites →
          </Link>
        </div>

        <div className="saved-grid">
          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="saved-card skeleton" />
            ))}

          {!loading && mostSavedLessons.length === 0 && (
            <div className="empty-state">
              <p>No saved lessons yet. Start bookmarking the ones you love.</p>
            </div>
          )}

          {!loading &&
            mostSavedLessons.map((lesson) => {
              const lessonId = lesson._id || lesson.id;
              return (
                <div key={lessonId} className="saved-card">
                  <div className="saved-card__top">
                    <span className="pill">{lesson.category || "Life"}</span>
                    <span className="saves">{lesson.saves} saves</span>
                  </div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description?.slice(0, 120) || "No description"}</p>
                  <div className="saved-card__footer">
                    <span className="price">
                      {lesson.price ? `$${lesson.price}` : "Free"}
                    </span>
                    <Link
                      to={`/lessons/${lessonId}`}
                      className="btn btn-secondary"
                    >
                      Read lesson
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
      <section className="section testimonials-section">
        <div className="section-header">
          <p className="eyebrow">What People Say</p>
          <h2>Stories from the Community</h2>
          <p className="section-subtitle">
            Hear from people who are changing their lives one lesson at a time.
          </p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"This platform has completely changed how I approach my daily habits. The lessons are short, actionable, and deeply impactful."</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar"></div>
              <div>
                <strong>Sarah Jenkins</strong>
                <p className="text-sm text-muted">Product Designer</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p>"I love that I can share my own experiences. Writing them down helps me process, and knowing it helps others is a bonus."</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar"></div>
              <div>
                <strong>David Chen</strong>
                <p className="text-sm text-muted">Software Engineer</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p>"The best way to learn is from the mistakes and successes of others. this site is a goldmine of practical wisdom."</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar"></div>
              <div>
                <strong>Emily Rodriguez</strong>
                <p className="text-sm text-muted">Teacher</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section stats-section">
        <div className="container">
          <p className="eyebrow">Our Impact</p>
          <h2>Growing Together</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>2k+</h3>
              <p>Active Learners</p>
            </div>
            <div className="stat-card">
              <h3>500+</h3>
              <p>Shared Lessons</p>
            </div>
            <div className="stat-card">
              <h3>15k+</h3>
              <p>Lessons Saved</p>
            </div>
            <div className="stat-card">
              <h3>50+</h3>
              <p>Countries</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="section-header">
          <p className="eyebrow">Common Questions</p>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Is it free to join?</h3>
            <p>Yes! You can explore public lessons for free. We also offer a Premium membership for advanced features like saving unlimited lessons and accessing exclusive content.</p>
          </div>
          <div className="faq-item">
            <h3>Can I contribute my own lessons?</h3>
            <p>Absolutely. We believe everyone has something to teach. Once you create an account, you can start drafting and publishing your lessons immediately.</p>
          </div>
          <div className="faq-item">
            <h3>How do I save lessons?</h3>
            <p>Simply click the "Save" or "Heart" icon on any lesson card. You can view your saved lessons in your dashboard at any time.</p>
          </div>
        </div>
      </section>

      <section className="section newsletter-section">
        <div className="container">
          <h2>Weekly Wisdom in Your Inbox</h2>
          <p>Join 5,000+ others receiving the top 3 life lessons of the week.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" required />
            <button type="button" className="btn btn-secondary">Subscribe</button>
          </form>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <h2>Ready to turn your experiences into wisdom?</h2>
          <p className="mb-4">Join our community today and start your journey.</p>
          <Link to="/register" className="btn btn-primary">Get Started for Free</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
