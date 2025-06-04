import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import '../css/homepg.css';
import Navbar from './navbar';
import Footer from './footerpg';
import { useUser } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const moodScores = {
  "Happy": 5,
  "Content": 4,
  "Okay": 3,
  "Sad": 2,
  "Angry": 1,
};

const HomePage = () => {
  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [mood, setMood] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [moodData, setMoodData] = useState([]);

  const user = useUser();

  

  useEffect(() => {
    const fetchGoalsAndReminders = async () => {
      const selectedDate = date.toISOString().split('T')[0];

      if (user) {
        const { data: goalsData, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', selectedDate)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching goals:', error.message);
        } else {
          setGoals(goalsData);
        }
      }

      const storedReminders = JSON.parse(localStorage.getItem('reminders')) || [];
      const dateReminders = storedReminders.filter(r => r.date === selectedDate);
      setReminders(dateReminders);
    };

    fetchGoalsAndReminders();
  }, [date, user]);

  useEffect(() => {
    const fetchMoodData = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('moods')
        .select('created_at, mood')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching mood data:', error.message);
      } else {
        const formattedData = data.map(entry => ({
          date: new Date(entry.created_at).toISOString().split('T')[0],
          moodScore: moodScores[entry.mood] || 0,
        }));
        setMoodData(formattedData);
      }
    };

    fetchMoodData();
  }, [user]);

  const handleGoalAdd = async () => {
    if (!newGoal.trim() || !user) return;

    const selectedDate = date.toISOString().split('T')[0];

    const { data, error } = await supabase.from('goals').insert([
      {
        user_id: user.id,
        text: newGoal.trim(),
        date: selectedDate,
        done: false,
      },
    ]);

    if (error) {
      console.error('Error adding goal:', error.message);
    } else {
      setGoals(prev => [...prev, ...data]);
      setNewGoal('');
    }
  };

  const toggleGoalDone = async (id, currentStatus) => {
    const { error } = await supabase
      .from('goals')
      .update({ done: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating goal status:', error.message);
    } else {
      setGoals(prev =>
        prev.map(goal =>
          goal.id === id ? { ...goal, done: !currentStatus } : goal
        )
      );
    }
  };

  const handleGoalDelete = async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error.message);
    } else {
      setGoals(prev => prev.filter(goal => goal.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !mood || !difficulty) return;

    const { error } = await supabase.from('moods').insert([
      {
        user_id: user.id,
        mood,
        difficulty,
      },
    ]);

    if (error) {
      console.error('Error saving mood entry:', error.message);
    } else {
      alert('Mood entry submitted!');
      setMood(null);
      setDifficulty(null);
    }
  };

  const handleSaveQuickNote = async () => {
    if (!quickNote.trim() || !user) return;

    const { error } = await supabase.from('quick_notes').insert([
      {
        note: quickNote.trim(),
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error('Error saving quick note:', error.message);
    } else {
      alert('Quick note saved!');
      setQuickNote('');
    }
  };

  const moods = [
    { emoji: "😄", label: "Happy" },
    { emoji: "😊", label: "Content" },
    { emoji: "😐", label: "Okay" },
    { emoji: "😞", label: "Sad" },
    { emoji: "😡", label: "Angry" },
  ];

  const difficulties = ["Easy", "Moderate", "Hard"];

  return (
    <div className="page-container">
      <Navbar />

      <div className='home-container'>
        <div className="top-section">
          <div className="reminder-box">
            <h3>Today's Reminders</h3>
            <div className='reminder-container'>
              {reminders.length === 0 ? <p>No reminders today.</p> : (
                <ul>
                  {reminders.map((rem, idx) => (
                    <li key={idx}>
                      <input className='check-box' type="checkbox" /> {rem.time} - {rem.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="calendar-container">
            <h3 className="calendar-title">
              {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
            </h3>
            <Calendar
              onChange={setDate}
              value={date}
              onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
              tileClassName={({ date: d, view }) => {
                if (view === 'month') {
                  const today = new Date();
                  const isToday =
                    d.getDate() === today.getDate() &&
                    d.getMonth() === today.getMonth() &&
                    d.getFullYear() === today.getFullYear();
                  const isCurrentViewMonth =
                    d.getMonth() === activeStartDate.getMonth() &&
                    d.getFullYear() === activeStartDate.getFullYear();
                  return !isCurrentViewMonth ? 'hidden-day' : isToday ? 'blue-day' : 'pink-day';
                }
                return null;
              }}
            />
          </div>
        </div>

        <div className="middle-section">
          <div className="goals-box">
            <h3>Today's Goals</h3>
            <ul>
              {goals.length === 0 ? (
                <p>No goals for this day.</p>
              ) : (
                goals.map(goal => (
                  <li key={goal.id}>
                    <input
                      type="checkbox"
                      checked={goal.done}
                      onChange={() => toggleGoalDone(goal.id, goal.done)}
                    />
                    <span className={goal.done ? 'goal-done' : ''}>{goal.text}</span>
                    <button onClick={() => handleGoalDelete(goal.id)} className="delete-goal-btn">❌</button>
                  </li>
                ))
              )}
            </ul>

            <input
              type="text"
              placeholder="Add new goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
            />
            <div className='button-container'>
              <button onClick={handleGoalAdd}>Add Goal</button>
            </div>
          </div>

          <div className="quick-note-box">
            <h3>Quick Note</h3>
            <textarea
              placeholder="🌷🫧💭₊˚ෆ˚Write a quick note..."
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              maxLength={100}
            />
            <button onClick={handleSaveQuickNote}>Save Note</button>
          </div>
        </div>

        <div className="bottom-section">
          <div className="progress-chart">
            <h3>Progress Chart</h3>
            {moodData.length === 0 ? (
              <p>No mood data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} tickCount={6} />
                  <Tooltip />
                  <Line type="monotone" dataKey="moodScore" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className='mood-container'>
            <form className="mood-difficulty-form" onSubmit={handleSubmit}>
              <div className="mood-logger">
                <h3>How are you feeling today?</h3>
                <div className="mood-options">
                  {moods.map(({ emoji, label }) => (
                    <button
                      type="button"
                      key={label}
                      className={`mood-btn ${mood === label ? 'selected' : ''}`}
                      onClick={() => setMood(label)}
                    >
                      {emoji}
                      <span className="mood-label">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="difficulty-level">
                <h3>How is your today?</h3>
                <div className="difficulty-options">
                  {difficulties.map(level => (
                    <button
                      type="button"
                      key={level}
                      className={`difficulty-btn ${difficulty === level ? 'selected' : ''}`}
                      onClick={() => setDifficulty(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="save-entry">
                <button type="submit" className="save-btn">Submit Entry</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
