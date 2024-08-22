import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "../src/index.css";

const ChatMessage = ({ role, content }) => (
  <div
    className={`card ${role}`}
    style={{
      borderRadius: "10px",
      padding: "10px",
      marginBottom: "10px",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: role === "user" ? "#f0f8ff" : "#e6e6e6",
    }}
  >
    <div
      style={{
        whiteSpace: "pre-wrap",
        fontSize: "16px",
        fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
        backgroundColor: role === "user" ? "#add8e6" : "#b0b0b0",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        padding: "10px",
        color: "#333",
        fontWeight: "bold",
      }}
    >
      {role}
    </div>
    <div
      style={{
        whiteSpace: "pre-wrap",
        fontSize: "14px",
        borderRadius: "10px",
        fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
        backgroundColor: "#ffffff",
        borderBottomLeftRadius: "10px",
        borderBottomRightRadius: "10px",
        padding: "10px",
        marginTop: "5px",
        color: "#555",
      }}
    >
      {content}
    </div>
  </div>
);

const ChatHistory = ({ messages, chatHistoryRef }) => (
  <div
    className="custom-scrollbar"
    ref={chatHistoryRef}
    style={{
      overflowY: "auto",
      maxHeight: "600px",
      overflowX: "hidden",
      maxWidth: "750px",
      borderRadius: "10px",
      padding: "10px",
      backgroundColor: "#f9f9f9",
    }}
  >
    {messages.map((message, index) => (
      <ChatMessage key={index} role={message.role} content={message.text} />
    ))}
  </div>
);

const GenerativeAIComponent = () => {
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://my-node-backend-kappa.vercel.app/api/generateContent",
        {
          prompt: inputText,
          past_messages: chatHistory
            .filter((msg) => msg.role === "assistant")
            .map((msg) => msg.text),
        }
      );

      const text =
        response.data.chatHistory[response.data.chatHistory.length - 1].text;
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "user", text: inputText },
        { role: "assistant", text },
      ]);
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleEnterPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div
      className="container"
      style={{ maxWidth: "800px", margin: "50px auto", borderRadius: "10px", backgroundColor: "#ffffff", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="row" style={{ margin: "10px 20px" }}>
        <strong
          className="title"
          style={{
            marginBottom: "10px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Sohbet Geçmişi
        </strong>

        <ChatHistory messages={chatHistory} chatHistoryRef={chatHistoryRef} />
      </div>

      <div
        className="footer"
        style={{
          padding: "10px 20px",
          borderRadius: "10px",
          boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#f9f9f9",
          position: "relative",
        }}
      >
        <textarea
          id="prompt-textarea"
          placeholder="Mesajınızı buraya yazın"
          onKeyDown={handleEnterPress}
          onChange={handleInputChange}
          style={{
            resize: "none",
            width: "calc(100% - 50px)",
            fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
            height: "100px",
            marginBottom: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
            padding: "10px",
            backgroundColor: "#ffffff",
          }}
          value={inputText}
        />
        <FontAwesomeIcon
          icon={faArrowUp}
          onClick={handleSendMessage}
          style={{
            cursor: "pointer",
            fontSize: "24px",
            color: loading ? "#ccc" : "#87CEEB",
            pointerEvents: loading ? "none" : "auto",
            position: "absolute",
            bottom: "15px",
            right: "15px",
          }}
        />
        <Link to="/geminivision" style={{ display: "block", textAlign: "center", marginTop: "10px", color: "#007bff", textDecoration: "none" }}>
          Gemini Vision
        </Link>
      </div>
    </div>
  );
};

export default GenerativeAIComponent;
