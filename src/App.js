import React from "react"; // Bunu ekleyin
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GeminiComponent from "./GeminiComponent";
import GeminiVision from "./GeminiVision";

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<GeminiComponent />} />
          <Route path="/geminivision" element={<GeminiVision />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
