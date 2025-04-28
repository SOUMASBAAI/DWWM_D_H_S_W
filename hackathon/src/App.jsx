import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router';
import Detection from './pages/Detection';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Detection />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;