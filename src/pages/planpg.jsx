import React, { useEffect, useState, useRef } from 'react';
import '../css/planning.css';
import { createClient } from '@supabase/supabase-js';
import Navbar from './navbar';
import Footer from './footerpg';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const Planning = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('12:00');
  const [editingEnabled, setEditingEnabled] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [reminderInputs, setReminderInputs] = useState([{ text: '', time: '12:00' }]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskEditText, setTaskEditText] = useState('');
  const [taskEditTime, setTaskEditTime] = useState('');
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [reminderEditText, setReminderEditText] = useState('');
  const [reminderEditTime, setReminderEditTime] = useState('');
  const [userId, setUserId] = useState(null);
  const calendarStripRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteEditText, setNoteEditText] = useState('');


  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const selectedISO = selectedDate.toISOString().split('T')[0];

  const calendarDates = [];
  for (let i = -15; i <= 15; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    calendarDates.push(new Date(date));
  }

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      setUserId(data.user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('date', selectedISO)
        .order('time', { ascending: true });
      if (error) console.error('Error fetching tasks:', error);
      else setTasks(data);
    };

    const fetchReminders = async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('date', selectedISO)
        .order('time');
      if (error) console.error('Error fetching reminders:', error);
      else setReminders(data);
    };

    const sel = new Date(selectedDate).setHours(0, 0, 0, 0);
    setEditingEnabled(sel >= new Date().setHours(0, 0, 0, 0));

    fetchTasks();
    fetchReminders();
  }, [selectedDate, selectedISO, userId]);

  useEffect(() => {
    const todayElement = document.querySelector('.calendar-day.today');
    if (todayElement && calendarStripRef.current) {
      calendarStripRef.current.scrollTo({
        left: todayElement.offsetLeft - 100,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
  
      if (error) console.error('Error fetching notes:', error);
      else setNotes(data);
    };
  
    fetchNotes();
  }, [userId]);
  

  const handleAddTask = async () => {
    if (!newTask.trim() || !userId) return;

    const { error } = await supabase.from('tasks').insert([
      {
        user_id: userId,
        task: newTask,
        date: selectedISO,
        time: newTaskTime,
        done: false,
      },
    ]);

    if (error) console.error('Error adding task:', error);
    else {
      setNewTask('');
      setNewTaskTime('12:00');
      setSelectedDate(new Date(selectedDate));
    }
  };

  const toggleDone = async (id, current) => {
    if (!editingEnabled) return;
    const { error } = await supabase.from('tasks').update({ done: !current }).eq('id', id);
    if (error) console.error('Error updating task:', error);
    else setSelectedDate(new Date(selectedDate));
  };

  const handleDeleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error('Error deleting task:', error);
    else setSelectedDate(new Date(selectedDate));
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskEditText(task.task);
    setTaskEditTime(task.time || '');
  };

  const saveTaskEdit = async () => {
    if (!userId || !taskEditText.trim()) return;

    const { error } = await supabase
      .from('tasks')
      .update({ task: taskEditText, time: taskEditTime })
      .eq('id', editingTaskId)
      .eq('user_id', userId);

    if (error) console.error('Error updating task:', error);
    else {
      setEditingTaskId(null);
      setSelectedDate(new Date(selectedDate));
    }
  };

  const moveTask = async (index, direction) => {
    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;
    [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
    setTasks(newTasks);
  };

  const handleSetReminder = async (index) => {
    if (!userId) return;
    const { text, time } = reminderInputs[index];
    if (!text.trim()) return;

    const { error } = await supabase.from('reminders').insert([
      { user_id: userId, title: text, date: selectedISO, time },
    ]);

    if (error) console.error('Error saving reminder:', error);
    else {
      const updatedInputs = [...reminderInputs];
      updatedInputs[index] = { text: '', time: '12:00' };
      setReminderInputs(updatedInputs);
      setSelectedDate(new Date(selectedDate));
    }
  };

  const updateReminderInput = (index, key, value) => {
    const updated = [...reminderInputs];
    updated[index][key] = value;
    setReminderInputs(updated);
  };

  const handleDeleteReminder = async (id) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) console.error('Error deleting reminder:', error);
    else setSelectedDate(new Date(selectedDate));
  };

  const handleEditReminder = (reminder) => {
    setEditingReminderId(reminder.id);
    setReminderEditText(reminder.title);
    setReminderEditTime(reminder.time);
  };

  const saveReminderEdit = async () => {
    const { error } = await supabase
      .from('reminders')
      .update({ title: reminderEditText, time: reminderEditTime })
      .eq('id', editingReminderId);

    if (error) console.error('Error updating reminder:', error);
    else {
      setEditingReminderId(null);
      setSelectedDate(new Date(selectedDate));
    }
  };
  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setNoteEditText(note.note);
  };
  
  const saveNoteEdit = async () => {
    if (!noteEditText.trim()) return;
    const { error } = await supabase
      .from('notes')
      .update({ note: noteEditText })
      .eq('id', editingNoteId);
  
    if (error) console.error('Error updating note:', error);
    else {
      setEditingNoteId(null);
      setNoteEditText('');
      setSelectedDate(new Date(selectedDate));
    }
  };
  
  const handleDeleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) console.error('Error deleting note:', error);
    else setSelectedDate(new Date(selectedDate));
  };
  

  return (
    <div className="page-container">
      <Navbar />
      <div className="planning-container">
        <div className="calendar-strip" ref={calendarStripRef}>
          {calendarDates.map((date, idx) => {
            const iso = date.toISOString().split('T')[0];
            const isPast = date < new Date().setHours(0, 0, 0, 0);
            const isToday = iso === todayISO;
            const isSelected = iso === selectedISO;

            return (
              <div
                key={idx}
                className={`calendar-day ${isToday ? 'today' : isPast ? 'past' : 'future'} ${
                  isSelected ? 'selected' : ''
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <div>{date.toLocaleDateString('default', { weekday: 'short' })}</div>
                <div>{date.getDate()}</div>
              </div>
            );
          })}
        </div>

        <div className="main-sections">
          <div className="task-container">
            <h2>Tasks for {selectedDate.toDateString()}</h2>
            {editingEnabled ? (
              <div className="task-input">
                <input
                  type="text"
                  placeholder="Add new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <input
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                />
                <button className="add-task-btn" onClick={handleAddTask}>Add</button>
              </div>
            ) : (
              <p className="readonly-msg">Cannot add tasks for past dates.</p>
            )}
            <ul className="task-list">
              {tasks.length === 0 ? (
                <li className="no-tasks">No tasks for this day.</li>
              ) : (
                tasks.map((task, index) => (
                  <li key={task.id} className={`task-item ${task.done ? 'task-done' : ''}`}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleDone(task.id, task.done)}
                      disabled={!editingEnabled}
                    />
                    {editingTaskId === task.id ? (
                      <>
                        <input
                          type="text"
                          value={taskEditText}
                          onChange={(e) => setTaskEditText(e.target.value)}
                        />
                        <input
                          type="time"
                          value={taskEditTime}
                          onChange={(e) => setTaskEditTime(e.target.value)}
                        />
                        <button onClick={saveTaskEdit}>Save</button>
                      </>
                    ) : (
                      <>
                        {task.task} {task.time && `(${task.time})`}
                        {editingEnabled && (
                          <>
                            <button onClick={() => handleEditTask(task)}>Edit</button>
                            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                            <button onClick={() => moveTask(index, 'up')}>⬆️</button>
                            <button onClick={() => moveTask(index, 'down')}>⬇️</button>
                          </>
                        )}
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="reminder-container">
            <h2><i className="fa-solid fa-bell"></i> Reminders</h2>
            {reminderInputs.map((input, index) => (
              <div key={index} className="reminder-inputs">
                <input
                  type="text"
                  placeholder="🍓 Add reminder"
                  value={input.text}
                  onChange={(e) => updateReminderInput(index, 'text', e.target.value)}
                  disabled={!editingEnabled}
                />
                <input
                  type="time"
                  value={input.time}
                  onChange={(e) => updateReminderInput(index, 'time', e.target.value)}
                  disabled={!editingEnabled}
                />
                <button
                  className="reminder-set-btn"
                  onClick={() => handleSetReminder(index)}
                  disabled={!editingEnabled}
                >
                  Set Reminder
                </button>
              </div>
            ))}
            <ul className="reminder-list">
              {reminders.length === 0 ? (
                <li className="no-reminders">No reminders for this day.</li>
              ) : (
                reminders.map(reminder => (
                  <li key={reminder.id} className="reminder-item">
                    {editingReminderId === reminder.id ? (
                      <>
                        <input
                          type="text"
                          value={reminderEditText}
                          onChange={(e) => setReminderEditText(e.target.value)}
                        />
                        <input
                          type="time"
                          value={reminderEditTime}
                          onChange={(e) => setReminderEditTime(e.target.value)}
                        />
                        <button onClick={saveReminderEdit}>Save</button>
                      </>
                    ) : (
                      <>
                        {reminder.title} {reminder.time && `(${reminder.time})`}
                        {editingEnabled && (
                          <>
                            <button onClick={() => handleEditReminder(reminder)}>Edit</button>
                            <button onClick={() => handleDeleteReminder(reminder.id)}>Delete</button>
                          </>
                        )}
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="note-carousel-section">
          <h2><i className="fa-solid fa-note-sticky"></i> Your Notes</h2>
          <Carousel
            showThumbs={false}
            showStatus={false}
            infiniteLoop
            useKeyboardArrows
            autoPlay
            interval={5000}
          >
            {notes.map((note) => (
              <div key={note.id} className="note-carousel-item">
                {editingNoteId === note.id ? (
                  <textarea
                    value={noteEditText}
                    onChange={(e) => setNoteEditText(e.target.value)}
                  />
                ) : (
                  <p>{note.note}</p>
                )}

                <div className="note-actions">
                  {editingNoteId === note.id ? (
                    <button onClick={saveNoteEdit}>Save Note</button>
                  ) : (
                    <>
                      <button onClick={() => handleEditNote(note)}>Edit</button>
                      <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </Carousel>
        </div>


         
        

        <div className="ai-routine-section">
        <h2><i className="fa-solid fa-robot"></i> AI Routine Recommendations</h2>
        <p>Here are some personalized routines to enhance your productivity and well-being:</p>
        <ul className="routine-list">
          <li>🧘 Morning meditation at 7:00 AM</li>
          <li>🥗 Healthy breakfast at 8:00 AM</li>
          <li>📖 Focused work session from 9:00 AM - 11:00 AM</li>
          <li>🚶 Walk or light exercise at 4:00 PM</li>
          <li>🌙 Digital detox starting at 9:00 PM</li>
        </ul>
      </div>

      </div>
      <Footer />
    </div>
  );
};

export default Planning;
