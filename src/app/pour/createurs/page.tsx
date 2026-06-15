import React from 'react';
import Navbar from '../../../components/Navbar';

export default function CreateursPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      <Navbar />
      
      {/* Main Container */}
      <main className="w-full relative min-h-screen">
        
        {/* Hero page createurs */}
        <section className="absolute top-[132px] left-[42px] w-[1241px] h-[637px]">
          
          {/* Rectangle 71 (Image) */}
          <div 
            className="absolute left-[512px] top-[0px] w-[729px] h-[637px] rounded-tl-[1000px] overflow-hidden shadow-[4px_4px_10px_rgba(0,0,0,0.15)] bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80')" }}
          >
          </div>

          {/* Eazypost */}
          <h1 className="absolute left-[8px] top-[77px] font-['Rubik_One'] font-normal text-[48px] leading-[59px] text-[#174CD2] w-[279px] m-0">
            Eazypost
          </h1>

          {/* pour les Createurs de contenus et Influenceurs */}
          <h2 className="absolute left-[11px] top-[136px] font-sans font-extrabold text-[40px] leading-[47px] text-[#000000] w-[492px] m-0">
            pour les Createurs de contenus et Influenceurs
          </h2>

          {/* publie régulièrement... */}
          <p className="absolute left-[11px] top-[285px] font-sans font-normal text-[24px] leading-[28px] text-[#000000] w-[503px] m-0">
            publie régulièrement, analyse tes performances et professionnalise ton image, sans passer ta vie sur les réseaux.
          </p>

          {/* Group 52 / Button */}
          <button className="absolute left-[0px] top-[481px] w-[444px] h-[57px] bg-[#174CD2] rounded-[50px] shadow-[0px_4px_4px_5px_rgba(23,76,210,0.53)] hover:scale-105 transition-transform flex items-center justify-center border-none cursor-pointer">
            <span className="font-sans font-bold text-[32px] leading-[38px] text-[#FFFFFF]">
              Commencez maintenant
            </span>
          </button>

        </section>
      </main>
    </div>
  );
}
