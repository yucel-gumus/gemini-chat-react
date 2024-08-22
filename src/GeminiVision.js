import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const FileUpload = () => {
  const [inlineData, setInlineData] = useState();
  const [inputText, setInputText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSending, setIsSending] = useState(false); 
  function fileToGenerativePart(file, mimeType) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result.split(",")[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const firstFile = files[0];

    try {
      const generativeParts = await Promise.all(
        files.map((file) => fileToGenerativePart(file, file.type))
      );
      setInlineData(generativeParts);

      const objectUrl = URL.createObjectURL(firstFile);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Dosya işleme hatası:", error);
    }
  };

  const handleSendMessage = async () => {
    setIsSending(true);
    try {
      const response = await axios.post("https://my-node-backend-kappa.vercel.app/api/generateImage", {
        prompt: inputText,
        imageParts: inlineData[0],
      });

      const text = response.data.text;
      setResponseText(text);
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
        {previewUrl && (
          <div style={{ marginTop: "20px" }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        )}
      </div>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <textarea
          id="prompt-textarea"
          placeholder="Mesajınızı buraya yazın"
          onChange={handleInputChange}
          style={{
            resize: "none",
            width: "100%",
            fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
            height: "150px",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
          value={inputText}
        />
        <button
          onClick={handleSendMessage}
          disabled={isSending}
          style={{
            position: "absolute",
            right: "10px",
            bottom: "10px",
            padding: "10px 20px",
            backgroundColor: isSending ? "#ccc" : "#4CAF50",
            color: isSending ? "#666" : "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: isSending ? "not-allowed" : "pointer",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            !isSending && (e.currentTarget.style.backgroundColor = "#45a049")
          }
          onMouseLeave={(e) =>
            !isSending && (e.currentTarget.style.backgroundColor = "#4CAF50")
          }
        >
          Gönder
        </button>
      </div>

      {responseText && (
        <div
          style={{
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ marginBottom: "10px", color: "#333" }}>Gemini Ai</h2>
          <p style={{ color: "#555" }}>{responseText}</p>
        </div>
      )}
      <Link to="/">Gemini Chat</Link>
    </div>
  );
};

export default FileUpload;
