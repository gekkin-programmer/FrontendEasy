import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main>
        {/* 
          This is the crucial part. The <Outlet> component will render 
          whatever child route is currently active. 
          - If the URL is '/', it will render <HomePage /> here.
          - If the URL is '/pricing', it will render <PricingPage /> here.
        */}
        <Outlet />  {/* <--- 2. ADD THE OUTLET COMPONENT */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;