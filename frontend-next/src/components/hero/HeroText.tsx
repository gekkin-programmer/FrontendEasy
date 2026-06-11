import React from 'react';

export default function HeroText() {
  return (
    <div 
      className="absolute text-center text-white pointer-events-none"
      style={{
        width: '1000px',
        height: '80px',
        fontFamily: 'Rubik, sans-serif',
        fontStyle: 'normal',
        fontWeight: 800,
        fontSize: '34px',
        lineHeight: '42px',
        top: 'calc(50% + 200px)',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      Arrêtez de jongler. Planifiez, programmez et automatisez votre contenu sur Facebook, TikTok , LinkedIn et autres au même endroit.
    </div>
  );
}
