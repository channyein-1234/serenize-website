import React, { useEffect, useState, useCallback } from 'react';
import Calendar from 'react-calendar';
import '../css/homepg.css';
import Navbar from './navbar';
import Footer from './footerpg';
import supabase from './supabaseClient';
import { format } from 'date-fns';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const moodScores = {
  "Happy": 5,
  "Content": 4,
  "Okay": 3,
  "Sad": 2,
  "Angry": 1,
};


const HomePage = () => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('Loading...');
  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [mood, setMood] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [reminders, setReminders] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const today = new Date().toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'
  const [notes, setNotes] = useState([]);
  const [, setUpdateMessage] = useState('');


  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
  
      if (error || !user) {
        setStatus('Error fetching user');
        return;
      }
  
      setUser(user);
      setStatus('Loaded');
    };
  
    fetchUser();
  }, []);
  

useEffect(() => {
  const fetchGoals = async () => {
    const today = format(new Date(), 'yyyy-MM-dd'); // format to 'YYYY-MM-DD'

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching today\'s goals:', error);
    } else {
      setGoals(data);
    }
  };

  if (user) {
    fetchGoals();
  }
}, [user]);


const fetchNotes = useCallback(async () => {
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching notes:', error);
  } else {
    setNotes(data);
    if (data.length > 0 && data[0].text) {
      setQuickNote(data[0].text);
      setEditingNoteId(null);
    } else {
      setQuickNote('');
    }
  }
}, [user]);

useEffect(() => {
  fetchNotes();
}, [fetchNotes]);




  useEffect(() => {
    const fetchMoodData = async () => {
      if (!user) return;
  
      const { data, error } = await supabase
        .from('moods')
        .select('mood, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
  
      if (error) {
        console.error('Error fetching mood data:', error);
        return;
      }
  
      const formattedData = data.map((entry) => ({
        date: new Date(entry.created_at).toLocaleDateString(),
        moodScore: moodScores[entry.mood] || 0, // fallback in case mood is missing
      }));
  
      setMoodData(formattedData);
    };
  
    fetchMoodData();
  }, [user]);
  
  useEffect(() => {
    const fetchReminders = async () => {
      const today = new Date().toISOString().split('T')[0];
  
      const { data, error } = await supabase
        .from('reminders')
        .select('id, title, date, time, sent')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('time', { ascending: true });
  
      if (error) {
        console.error('Error fetching reminders:', error);
      } else {
        setReminders(data);
      }
    };
  
    if (user) {
      fetchReminders();
    }
  }, [user]);
  
  
  const handleGoalAdd = async () => {
    if (!newGoal.trim() || !user) return;
  
    const { data, error } = await supabase
      .from('goals')
      .insert([{ goal: newGoal, user_id: user.id, done: false, date: today }])
      .select();
  
    if (error) {
      console.error('Error adding goal:', error);
      return;
    }
  
    setGoals((prevGoals) => [...prevGoals, ...data]);
    setNewGoal('');
  };
  
  const toggleGoalDone = async (id, currentDone) => {
    const { error } = await supabase
      .from('goals')
      .update({ done: !currentDone })
      .eq('id', id);
  
    if (error) {
      console.error('Error toggling goal done status:', error);
      return;
    }
  
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, done: !currentDone } : goal
      )
    );
  };
  
  const handleGoalDelete = async (id) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.error('Error deleting goal:', error);
      return;
    }
  
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };
  
  
  
  const handleSaveQuickNote = async () => {
    if (notes.length > 0) {
      alert("You've already added a note today. You can edit it instead.");
      return;
    }
  
    const today = new Date().toISOString().split('T')[0];
  
    const { data, error } = await supabase.from('notes').insert([
      {
        user_id: user.id,
        text: quickNote,
        date: today,
      },
    ]).select();
  
    if (error) {
      console.error('Error saving note:', error);
    } else {
      const newNote = data[0];
      setEditingNoteId(newNote.id); // Start editing right after save
      setNotes([newNote]); //  Set notes with the new one
    }
  };
  
  
  const handleUpdateQuickNote = async () => {
    const { error } = await supabase
      .from('notes')
      .update({ text: quickNote, updated_at: new Date().toISOString() }) // use 'note' if that's your column name
      .eq('id', editingNoteId);
  
    if (error) {
      console.error('Error updating note:', error);
    } else {
      fetchNotes(); // Refresh notes in UI
      setUpdateMessage(' Note updated!');
      setEditingNoteId(null); // Exit edit mode if needed
      setTimeout(() => setUpdateMessage(''), 3000); // Hide after 3s
    }
  };
  
  


  
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user || !mood || !difficulty) {
      alert("Please select both mood and difficulty.");
      return;
    }
  
    const { error } = await supabase.from('moods').insert([
      {
        user_id: user.id,
        mood,
        difficulty,
      }
    ]);
  
    if (error) {
      console.error('Error saving mood entry:', error);
      alert("There was an error saving your entry.");
      return;
    }
  
    alert("Mood entry submitted!");
    // Optionally clear selections
    setMood('');
    setDifficulty('');
  };
  
 
  
  


  const moods = [
    { emoji: "😄", label: "Happy" },
    { emoji: "😊", label: "Content" },
    { emoji: "😐", label: "Okay" },
    { emoji: "😞", label: "Sad" },
    { emoji: "😡", label: "Angry" },
  ];

  const difficulties = ["Easy", "Moderate", "Hard"];

  if (!user) return <div>{status}</div>;

  return (
    <div className="page-container">
      <Navbar />

      <div className='home-container'>
        <div className="top-section">
        <div className="reminder-box">
            <h3>Today's Reminders</h3>
            <div className='reminder-container'>
              {reminders.length === 0 ? (
                <p>No reminders today.</p>
              ) : (
                <ul>
                  {reminders.map((rem) => (
                    <li key={rem.id}>
                      <input className='check-box' type="checkbox" checked={rem.done} readOnly />
                      {rem.time} - {rem.title}
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
              {goals.filter(goal => !goal.done).length === 0 ? (
                <p>No goals for this day.</p>
              ) : (
                goals.filter(goal => !goal.done).map(goal => (
                  <li key={goal.id}>
                    <input
                      type="checkbox"
                      checked={goal.done}
                      onChange={() => toggleGoalDone(goal.id, goal.done)}
                    />
                    <span>{goal.goal}</span>
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
              <button onClick={handleGoalAdd} className="action-btn">Add Goal</button>
            </div>
          </div>

          <div className="quick-note-box">
            <h3>Quick Note</h3>
            <textarea
              placeholder="🌷🫧💭₊˚ෆ˚Write a quick note..."
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              maxLength={500}
              disabled={notes.length > 0 && !editingNoteId}
            />

            {editingNoteId ? (
              <button onClick={handleUpdateQuickNote} className="action-btn">Update Note</button>
            ) : (
              <button
                onClick={handleSaveQuickNote}
                className="action-btn"
                disabled={notes.length > 0}
              >
                Save Note
              </button>
            )}
            {notes.length > 0 && !editingNoteId && (
              <p className="note-limit-msg">✅ You've already added today's note.</p>
            )}
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
                <button type="submit" className="action-btn">Submit Entry</button>
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


