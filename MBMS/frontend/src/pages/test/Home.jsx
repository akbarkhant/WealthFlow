import React from 'react';
import Navbar from '../../components/HomeComponents/Navbar';
import Sections from '../../components/HomeComponents/Section';
import Footer from '../../components/HomeComponents/Footer';

export default function LandingPage() {
  return (
    <div className="landing-page-root">
      <Navbar />
      <Sections />
      <Footer />
    </div>
  );
}