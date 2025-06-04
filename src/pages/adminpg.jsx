// pages/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUserId = session?.user?.id;
      if (!currentUserId) return;

      const { data: adminData } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUserId)
        .single();

      setCurrentAdmin(adminData);
      setNameInput(adminData.full_name);
      setEmailInput(adminData.email);

      const { data: userList } = await supabase
        .from('users')
        .select('id, full_name, email, role');

      setUsers(userList || []);

      const { data: contactMessages } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      setMessages(contactMessages || []);
    };

    fetchData();
  }, []);

  const promoteToAdmin = async (userId) => {
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: 'admin' } : u)));
    }
  };

  const updateProfile = async () => {
    const { error } = await supabase
      .from('users')
      .update({
        full_name: nameInput,
        email: emailInput,
      })
      .eq('id', currentAdmin.id);

    if (!error) {
      setCurrentAdmin({ ...currentAdmin, full_name: nameInput, email: emailInput });
      setEditMode(false);
    }
  };

  const deleteMessage = async (id) => {
    await supabase.from('messages').delete().eq('id', id);
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const markAsRead = async (id) => {
    await supabase.from('messages').update({ read: true }).eq('id', id);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, read: true } : msg
      )
    );
  };

  const totalPages = Math.ceil(messages.length / messagesPerPage);
  const currentMessages = messages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* My Profile */}
      <div className="mb-10 bg-gray-100 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">My Profile</h2>
        {editMode ? (
          <div className="space-y-3">
            <input
              type="text"
              className="border px-3 py-1 w-full"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <input
              type="email"
              className="border px-3 py-1 w-full"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <button
              className="bg-green-500 text-white px-4 py-1 rounded"
              onClick={updateProfile}
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div>
            <p><strong>Name:</strong> {currentAdmin?.full_name}</p>
            <p><strong>Email:</strong> {currentAdmin?.email}</p>
            <button
              className="mt-2 text-blue-600 underline"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white p-4 shadow rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2">{u.full_name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">
                  {u.role !== 'admin' && (
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                      onClick={() => promoteToAdmin(u.id)}
                    >
                      Promote to Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Messages */}
      <div className="bg-white p-4 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">User Messages</h2>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <div className="space-y-4">
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => !msg.read && markAsRead(msg.id)}
                className={`border p-4 rounded-lg cursor-pointer ${
                  !msg.read ? 'border-blue-500 font-semibold bg-blue-50' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p><strong>Name:</strong> {msg.name}</p>
                    <p><strong>Email:</strong> {msg.email}</p>
                    <p><strong>Message:</strong> {msg.message}</p>
                    <p className="text-sm text-gray-500">
                      Sent on {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(msg.id);
                    }}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
