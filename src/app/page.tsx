'use client';

import React from 'react';

export default function Home() {
  return (
    <div style={styles.container}>
      {/* The Canva Video Element on the left */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        style={styles.video}
      >
        <source src="/coming-soon.mp4" type="video/mp4" />
      </video>
      
      <style dangerouslySetInnerHTML={{__html: `
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
      `}} />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '0px 64px',
    width: '100%',
    minHeight: '100vh',
    background: '#FFFFFF',
    overflow: 'hidden',
  },
  video: {
    width: 'clamp(350px, 45vw, 700px)',
    height: 'clamp(350px, 45vw, 700px)',
    objectFit: 'cover',
  }
};