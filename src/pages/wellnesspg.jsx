import React from "react";
import "../css/wellnesspg.css";
import Navbar from './navbar';
import Footer from './footerpg';

const wellnessVideos = [
  { id: 1, title: "Morning Yoga", src: "/videos/morning-yoga.mp4", poster: "/posters/yoga.jpg" },
  { id: 2, title: "Deep Breathing", src: "/videos/deep-breathing.mp4", poster: "/posters/breathing.jpg" },
  { id: 3, title: "Stretch Break", src: "/videos/stretch.mp4", poster: "/posters/stretch.jpg" },
];

const aiRecommendations = [
  { id: 1, title: "Gratitude Journaling", url: "https://www.youtube.com/embed/L1v7hXEQhsQ" },
  { id: 2, title: "5-Minute Meditation", url: "https://www.youtube.com/embed/inpok4MKVLM" },
];

const Wellness = () => {
  return (
    <div>
      <Navbar />
      <div className="wellness-container">
      <section className="intro">
        <h1>˚˖𓍢🌷✧˚.🎀⋆Welcome to Your Wellness Hub🫧🎐‧₊˚♪ 𝄞₊˚⊹</h1>
        <p>Recharge your mind and body with recommended wellness resources and AI-suggested activities.</p>
      </section>

      <section className="scrollable-videos">
        <h2>Wellness Videos</h2>
        <div className="video-scroll">
          {wellnessVideos.map((video) => (
            <div key={video.id} className="video-card">
              <video
                width="100%"
                height="200"
                controls
                poster={video.poster}
                preload="metadata"
              >
                <source src={video.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>{video.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ai-suggestions">
        <h2>AI-Recommended Activities</h2>
        <div className="ai-grid">
          {aiRecommendations.map((rec) => (
            <div key={rec.id} className="activity-card">
              <iframe
                width="100%"
                height="200"
                src={rec.url}
                title={rec.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <p>{rec.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
      <Footer />
    </div>
  );
};

export default Wellness;
