import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' for React 18
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Update imports
import App from './App'; // Ensure App is correctly imported

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} /> {/* Ensure only App is used */}
    </Routes>
  </Router>
);
