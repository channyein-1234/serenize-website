// src/pages/chatbot.jsx
import React, { useState } from "react";
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
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";

const Chatbot = () => {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello! How can I assist you today?",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ]);

  const handleSendMessage = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);

    // Simulate a delay and bot response (replace this with OpenAI API later)
    setTimeout(() => {
      const botReply = {
        message: "Thanks for your message! I'm here to help 😊",
        sender: "ChatGPT",
        direction: "incoming"
      };
      setMessages(prev => [...prev, botReply]);
      setTyping(false);
    }, 1000);
  };

  return (
    <div className="page-container">
      <Navbar />
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
            <MessageInput placeholder="Type message here" onSend={handleSendMessage} />
          </ChatContainer>
        </MainContainer>
      </div>
      <Footer />
    </div>
  );
};

export default Chatbot;
