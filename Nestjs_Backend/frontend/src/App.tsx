// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';

import Preloader from './components/Preloader'; 
import MainLayout from './Layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PricingPage from './pages/PricingPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // trigger vercel

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter basename="/EasyPostV2">
        {/*
          The BrowserRouter is now always rendered.
          We use a ternary operator to decide what to show inside it.
        */}
        {isLoading ? (
          // When loading, show the preloader.
          <Preloader isLoading={true} />
        ) : (
          // When done loading, show the Routes.
          <Routes>
            {/* Routes with Navbar/Footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/pricing" element={<PricingPage />} />
            </Route>

            {/* Full-screen routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} /> 
            
            {/* Catch-all 404 route MUST be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        )}
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;