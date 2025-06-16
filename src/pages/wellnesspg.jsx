import React, { useEffect, useState } from "react";
import "../css/wellnesspg.css";
import Navbar from "./navbar";
import Footer from "./footerpg";
import supabase from "./supabaseClient";

const wellnessVideos = [
  { id: 1, title: "6 Habits to improve mental wellness", src: "/wellnessVds/6 Small Habits To Improve Mental Wellness(720P_HD).mp4", poster: "/vdPosters/vd1.png" },
  { id: 2, title: "Meditation for anxiety relief", src: "/wellnessVds/7 Minute Anxiety Relief Meditation _ Stop Overthinking Fast(720P_HD).mp4", poster: "/vdPosters/vd2.png" },
  { id: 3, title: "10 Mins guided meditation for clear mind", src: "/wellnessVds/10 MIN Guided Meditation To Clear Your Mind _ Start New Positive Habits(720P_HD).mp4", poster: "/vdPosters/vd3.png" },
  { id: 4, title: "10 Mins meditation for anxiety relief", src: "/wellnessVds/10-Minute Meditation For Anxiety _ Goodful(720P_HD).mp4", poster: "/vdPosters/vd4.png" },
  { id: 5, title: "Why procrastinate!", src: "/serenize/public/wellnessVds/Why you procrastinate even when it feels bad(720P_HD).mp4", poster: "/vdPosters/vd5.png" },
  { id: 8, title: "Are you feeling depressed?", src: "/wellnessVds/If You_re Feeling Depressed_ Watch This(720P_HD).mp4", poster: "/vdPosters/vd6.png" },
  { id: 7, title: "To anyone who has lost hope in life", src: "/wellnessVds/To Anyone Who Has Lost Hope in Life(720P_HD).mp4", poster: "/vdPosters/vd7.png" },
];

const Wellness = () => {
  const [aiRecommendations, setAiRecommendations] = useState({ videos: [], activity: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get current user ID from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch AI video/activity suggestions
  useEffect(() => {
    const fetchAIRecommendations = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/wellnessRecommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) {
          throw new Error(`Error fetching AI recommendations: ${response.statusText}`);
        }

        const data = await response.json();
        const suggestionsText = data.suggestions || "";
        const lines = suggestionsText.split("\n").map(line => line.trim()).filter(Boolean);

        const videos = [];
        let activity = "";

        lines.forEach(line => {
          const videoMatch = line.match(/^\d+\.\s*(.+?)\s*-\s*(https?:\/\/\S+)/);
          if (videoMatch) {
            videos.push({ title: videoMatch[1], url: videoMatch[2] });
          } else if (line.toLowerCase().startsWith("activity:")) {
            activity = line.replace(/^activity:\s*/i, "").trim();
          }
        });

        setAiRecommendations({ videos, activity });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAIRecommendations();
  }, [userId]);

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
                <video width="100%" height="200" controls poster={video.poster} preload="metadata">
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

          {loading && <p>Loading AI recommendations...</p>}
          {error && <p style={{ color: "red" }}>Error: {error}</p>}

          {!loading && !error && (
            <div className="ai-grid">
              {aiRecommendations.videos.map((rec, idx) => {
                const videoId = new URLSearchParams(new URL(rec.url).search).get("v");
                const embedUrl = `https://www.youtube.com/embed/${videoId}`;

                return (
                  <div key={idx} className="activity-card">
                    <iframe
                      width="100%"
                      height="200"
                      src={embedUrl}
                      title={rec.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <p>{rec.title}</p>
                  </div>
                );
              })}
              {aiRecommendations.activity && (
                <div className="activity-card">
                  <h4>Activity Suggestion</h4>
                  <p>{aiRecommendations.activity}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Wellness;
