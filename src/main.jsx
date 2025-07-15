// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css'; // استيراد ملف التصميم الرئيسي

// هذا الكود يجد عنصر 'root' في index.html ويقوم بتركيب تطبيق React بالكامل بداخله
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);