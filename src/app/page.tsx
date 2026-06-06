'use client';

import React from 'react';

export default function Home() {
  return (
    <div style={styles.container}>
      {/* The Canva Video Element covering the right half */}
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
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    background: '#FFFFFF',
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50vw',
    height: '100vh',
    objectFit: 'cover',
  }
};