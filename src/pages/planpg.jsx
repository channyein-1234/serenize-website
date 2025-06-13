import React, { useEffect, useState, useRef } from 'react';
import '../css/planning.css';
import supabase from './supabaseClient';
import Navbar from './navbar';
import Footer from './footerpg';
import { Carousel } from 'react-responsive-carousel';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import 'react-responsive-carousel/lib/styles/carousel.min.css';



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
  const [reminderEditTime, setReminderEditTime] = useState([{ text: '', time: '12:00' }]);
  const [userId, setUserId] = useState(null);
  const calendarStripRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteEditText, setNoteEditText] = useState('');
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];


  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  const selectedISO = formatDate(selectedDate);

  const publicVapidKey = 'BNATpZBdUEvf7Ywzv4SAtDaGCY_7dZh8U2gNIk0bWAM_8G7LG2xAJUtj2B0PtQuSkNMqF8gR8C7dZyymN-mIfKU';

  //Retrieving user from supabase
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



function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Function to subscribe user to push notifications
useEffect(() => {
  async function askNotificationAndSubscribe() {
    if (!userId) return;

    if (!('Notification' in window)) {
      console.warn('Notification API not supported in this environment.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });

          console.log('Push subscription:', subscription);

          new Notification('Subscribed to reminders!', {
            body: 'You will now receive notifications.',
            icon: '/serenize_logo.png',
          });

          // Save subscription to Supabase
          const { data, error } = await supabase
            .from('push_subscriptions')
            .insert([
              {
                user_id: userId,
                subscription: JSON.stringify(subscription),
                created_at: new Date().toISOString(),
              },
            ]);

          if (error) {
            console.error('Failed to save subscription to Supabase:', error);
          } else {
            console.log('Subscription saved to Supabase:', data);
          }
        } else {
          console.warn('Service workers are not supported in this browser.');
        }
      } else {
        console.log('Notification permission denied.');
      }
    } catch (error) {
      console.error('Error during notification permission or subscription:', error);
    }
  }

  askNotificationAndSubscribe();

  // We only want to run this when userId changes
}, [userId]);





  // Generate calendar dates for the strip
  const calendarDates = [];
  for (let i = -15; i <= 15; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    calendarDates.push(new Date(date));
  }

  useEffect(() => {
    const todayElement = document.querySelector('.calendar-day.today');
    if (todayElement && calendarStripRef.current) {
      calendarStripRef.current.scrollTo({
        left: todayElement.offsetLeft - 100,
        behavior: 'smooth',
      });
    }
  }, []);

  // Function to reorder the tasks after drag
  const reorderTasks = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  //fetching tasks and reminders from supabase
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

    

    const sel = new Date(selectedDate).setHours(0, 0, 0, 0);
    setEditingEnabled(sel >= new Date().setHours(0, 0, 0, 0));

    fetchTasks();
  }, [selectedDate, selectedISO, userId]);

  
  //Fetching notes from the supabase
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
  
  //adding new task to supabase
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

  // Function to toggle task done status
  const toggleDone = async (id, current) => {
    if (!editingEnabled) return;
    const { error } = await supabase.from('tasks').update({ done: true }).eq('id', id);
    if (error) console.error('Error updating task:', error);
    else setSelectedDate(new Date(selectedDate));
  };

  //deleting task from supabase

  const handleDeleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error('Error deleting task:', error);
    else setSelectedDate(new Date(selectedDate));
  };

  // Updating task in supabase

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

  //////////////////////////////////////////////////////reminders//////
   // Convert local date + time to UTC ISO
   const localDateTimeToUTCISO = (dateStr, timeStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const localDate = new Date(year, month - 1, day, hours, minutes);
    return localDate.toISOString();
  };

  // Convert UTC ISO to local display info
  const utcISOToLocalDateTime = (isoString) => {
    const dt = new Date(isoString);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
      display: dt.toLocaleString(),
    };
  };

  // Fetch reminders
  const fetchReminders = async () => {
    if (!userId) return;
    const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('sent', false) // Only fetch unsent reminders
    .order('reminder_at', { ascending: true });


    if (error) console.error('Error fetching reminders:', error);
    else setReminders(data);
  };

  /// Set a new reminder
  const handleSetReminder = async (index) => {
    if (!userId) return;
    const { text, time } = reminderInputs[index];
    if (!text.trim()) return;

    const selectedISO = formatDate(selectedDate);
    const reminderAtUTC = localDateTimeToUTCISO(selectedISO, time);

    const { error } = await supabase.from('reminders').insert([
      { user_id: userId, title: text, reminder_at: reminderAtUTC },
    ]);

    if (error) {
      console.error('Error saving reminder:', error);
    } else {
      const updatedInputs = [...reminderInputs];
      updatedInputs[index] = { text: '', time: '12:00' };
      setReminderInputs(updatedInputs);
      fetchReminders(); // refresh list
    }
  };

  /// Delete reminder
  const handleDeleteReminder = async (id) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) console.error('Error deleting reminder:', error);
    else fetchReminders();
  };

  useEffect(() => {
    fetchReminders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

const updateReminderInput = (index, field, value) => {
  const updatedInputs = [...reminderInputs];
  updatedInputs[index][field] = value;
  setReminderInputs(updatedInputs);
};

const saveReminderEdit = async () => {
  if (!editingReminderId) return;

  const { error } = await supabase
    .from('reminders')
    .update({ title: reminderEditText, time: reminderEditTime })
    .eq('id', editingReminderId);

  if (!error) {
    fetchReminders(); // Make sure this is defined
    setEditingReminderId(null);
    setReminderEditText('');
    setReminderEditTime('');
  }
};



  

  //Editing notes and Updating in supabase
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
  
  //Deleting notes from supabase
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
            <DragDropContext
                onDragEnd={(result) => {
                  if (!result.destination) return;
                  const reordered = reorderTasks(tasks, result.source.index, result.destination.index);
                  setTasks(reordered); // Update local state
                  // Optional: Update Supabase order here
                }}
              >
                <Droppable droppableId="taskList">
                  {(provided) => (
                    <ul
                      className="task-list"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {tasks.length === 0 ? (
                        <li className="no-tasks">No tasks for this day.</li>
                      ) : (
                        tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`task-item ${task.done ? 'task-done' : ''}`}
                              >
                                <div className="tasks">
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
                                    <span className="task-text">
                                      {task.task} {task.time && `(${task.time})`}
                                    </span>
                                  )}
                                </div>

                                {editingEnabled && editingTaskId !== task.id && (
                                  <div className="task-actions">
                                    <button className='action-btn'  onClick={() => handleEditTask(task)}>Edit</button>
                                    <button className='action-btn' onClick={() => handleDeleteTask(task.id)}>Delete</button>
                                  </div>
                                )}
                              </li>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
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
      reminders.map((reminder) => {
        const { date, time } = utcISOToLocalDateTime(reminder.reminder_at);
        const isEditing = editingReminderId === reminder.id;
        const isToday = date === formatDate(selectedDate);

        return (
          isToday && (
            <li key={reminder.id} className="reminder-item">
              <div className="tasks">
                {isEditing ? (
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
                    <button className="action-btn" onClick={saveReminderEdit}>Save</button>
                  </>
                ) : (
                  <>
                    {reminder.title} ({time})
                    {editingEnabled && (
                      <div className="task-actions">
                        <button className="action-btn" onClick={() => handleDeleteReminder(reminder.id)}>Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </li>
          )
        );
      })
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
