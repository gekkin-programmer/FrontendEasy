'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Target date: June 15, 2026
    const targetDate = new Date('2026-06-15T00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const h = Math.floor(difference / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div style={styles.container}>
      {/* Video on the Left */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        style={styles.video}
      >
        <source src="/coming-soon.mp4" type="video/mp4" />
      </video>

      {/* Text Content on the Right */}
      <div style={styles.contentColumn}>
        <h1 style={styles.heading}>Looking for something ?</h1>
        
        <p style={styles.subheading}>
          It’s not here yet, but we'll let you know it’s coming really really soon. Sit tight and check back in on June 15.
        </p>

        <div style={styles.countdown}>
          {formatTime(timeLeft.hours)} : {formatTime(timeLeft.minutes)} : {formatTime(timeLeft.seconds)}
        </div>

        <button 
          style={styles.button}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#3C48F6';
            e.currentTarget.style.color = '#FCE7E8';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#FCE7E8';
            e.currentTarget.style.color = '#3C48F6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Stay in Touch
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&display=swap');
        
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '40px 64px',
    width: '100%',
    minHeight: '100vh',
    background: '#FFFFFF',
    gap: '64px',
  },
  video: {
    width: 'clamp(350px, 45vw, 700px)',
    height: 'clamp(350px, 45vw, 700px)',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '16px',
  },
  contentColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '32px',
    maxWidth: '750px',
    flex: '1 1 500px',
  },
  heading: {
    fontFamily: "'Rubik', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(48px, 6vw, 96px)',
    lineHeight: '1.1',
    color: '#FCE7E8',
    WebkitTextStroke: '3px #3C48F6',
  },
  subheading: {
    fontFamily: "'Rubik', sans-serif",
    fontWeight: 500,
    fontSize: 'clamp(18px, 2.2vw, 32px)',
    lineHeight: '1.2',
    color: '#000000',
    maxWidth: '730px',
  },
  countdown: {
    fontFamily: "'Rubik', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(48px, 6vw, 96px)',
    lineHeight: '1.1',
    color: '#FCE7E8',
    WebkitTextStroke: '3px #3C48F6',
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 30px',
    width: '100%',
    maxWidth: '501px',
    height: '98px',
    background: '#FCE7E8',
    border: '3px solid #3C48F6',
    borderRadius: '30px',
    fontFamily: "'Rubik', sans-serif",
    fontWeight: 500,
    fontSize: '32px',
    color: '#3C48F6',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }
};