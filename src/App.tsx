import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Clock } from 'lucide-react';

import Header from './components/Header';
import Hero from './components/Hero';
import ProductGallery from './components/ProductGallery';
import InternationalOrders from './components/InternationalOrders';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminDashboard from './components/AdminDashboard';
import BottomNav from './components/BottomNav';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
    
    :root {
      --font-main: 'Inter', sans-serif;
    }

    body {
      font-family: var(--font-main);
    }

    /* Forzamos que nada tenga colitas */
    .font-serif, h1, h2, h3, h4 {
      font-family: var(--font-main) !important;
      font-variant-ligatures: none;
    }
  `}</style>
);

function MaintenanceMode() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-center">
      <div className="bg-white p-12 rounded-[2rem] shadow-2xl max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="text-black" size={40} />
        </div>
        <h2 className="text-3xl font-black text-black tracking-tighter mb-4 uppercase">Pausa Estratégica</h2>
        <p className="text-gray-400 font-bold leading-relaxed mb-8 uppercase text-[9px] tracking-[0.2em]">
          Actualizando nuestra galería para tu próxima experiencia.
        </p>
        <div className="h-[1px] w-12 bg-black mx-auto mb-4"></div>
        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em]">RORIMPORT</div>
      </div>
    </div>
  );
}

function StoreFront() {
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "configuracion", "tienda"), (snapshot) => {
      if (snapshot.exists()) {
        setIsMaintenance(snapshot.data().modoMantenimiento);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-[1px] border-gray-100 border-t-black rounded-full animate-spin mb-6"></div>
      <span className="text-[9px] font-bold text-black uppercase tracking-[0.5em] animate-pulse">RORIMPORT</span>
    </div>
  );

  if (isMaintenance) return <MaintenanceMode />;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
      <Header />
      <main className="flex-grow pt-24 md:pt-32">
        <Hero />
        <ProductGallery />
        <InternationalOrders />
      </main>
      <Footer />
      <BottomNav onCartClick={() => {}} /> 
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <GlobalStyles />
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<StoreFront />} />
          <Route path="/admin-ror" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}