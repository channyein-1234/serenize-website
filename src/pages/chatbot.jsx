// src/pages/chatbot.jsx
import React, { useEffect, useState } from "react";
import "../css/chatbot.css";
import Navbar from "./navbar";
import Footer from "./footerpg";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import supabase from "./supabaseClient";

const Chatbot = () => {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello! How can I assist you today?",
      sender: "ChatBot",
      direction: "incoming",
    },
  ]);
  const [userId, setUserId] = useState(null);

  // Retrieve current user ID from Supabase auth session
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Handle sending user message and getting AI suggestions
  const handleSendMessage = async (message) => {
    if (!userId) {
      setMessages((prev) => [
        ...prev,
        {
          message: "Please log in to chat with the assistant.",
          sender: "ChatBot",
          direction: "incoming",
        },
      ]);
      return;
    }
  
    const newMessage = {
      message,
      sender: "user",
      direction: "outgoing",
    };
  
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setTyping(true);
  
    // Build chat history for OpenAI
    const chatHistory = updatedMessages
      .filter((m) => m.sender !== "system") // skip system messages
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.message,
      }));
  
    try {
      const res = await fetch("/api/chatReply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          message, // user's latest message
          history: chatHistory.slice(0, -1), // exclude latest message from history (it's in `message`)
        }),
      });
  
      if (!res.ok) throw new Error("Failed to fetch AI response");
  
      const data = await res.json();
  
      const botReply = {
        message: data?.suggestions || "Sorry, I couldn't think of a response!",
        sender: "ChatBot",
        direction: "incoming",
      };
  
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      setMessages((prev) => [
        ...prev,
        {
          message: "Something went wrong! Please try again later.",
          sender: "ChatBot",
          direction: "incoming",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };
  

  return (
    <div className="page-container">
      <Navbar />
      <div className="whole-chat-container">
        <div className="chat-container">
          <MainContainer>
            <ChatContainer>
              <MessageList
                typingIndicator={
                  typing ? <TypingIndicator content="AI is typing..." /> : null
                }
              >
                {messages.map((msg, i) => (
                  <Message key={i} model={msg} />
                ))}
              </MessageList>
              <MessageInput
                placeholder="Type message here"
                onSend={handleSendMessage}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Chatbot;
