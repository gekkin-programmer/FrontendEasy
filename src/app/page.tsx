'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set target date 14 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      {/* Dynamic Animated Blobs for Glassmorphism */}
      <div style={{...styles.blob, ...styles.blob1}} />
      <div style={{...styles.blob, ...styles.blob2}} />
      <div style={{...styles.blob, ...styles.blob3}} />
      
      <div style={styles.glassCard}>
        <div style={styles.badge}>REBUILDING THE FUTURE</div>
        
        <h1 style={styles.title}>EazyPost <span style={styles.gradientText}>V2.0</span></h1>
        
        <p style={styles.subtitle}>
          We are currently operating offline to completely redesign and engineer a next-generation social media management experience. Get ready for something beautiful.
        </p>

        <div style={styles.countdownContainer}>
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} style={styles.timeBox}>
              <div style={styles.timeValue}>{value.toString().padStart(2, '0')}</div>
              <div style={styles.timeLabel}>{unit.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <button 
          style={styles.notifyButton}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Notify Me When Live
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
        
        @keyframes float1 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes float2 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 60px) scale(1.2); }
          66% { transform: translate(30px, -30px) scale(0.8); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes float3 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 50px) scale(1.3); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 20px rgba(120, 0, 255, 0.4); }
          50% { box-shadow: 0 0 40px rgba(120, 0, 255, 0.7), 0 0 20px rgba(0, 212, 255, 0.5); }
          100% { box-shadow: 0 0 20px rgba(120, 0, 255, 0.4); }
        }
      `}} />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030305',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: "'Outfit', sans-serif",
    color: '#ffffff'
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(120px)',
    opacity: 0.6,
    zIndex: 0,
  },
  blob1: {
    top: '-10%',
    left: '-10%',
    width: '45vw',
    height: '45vw',
    backgroundColor: '#4f00ff',
    animation: 'float1 14s ease-in-out infinite',
  },
  blob2: {
    bottom: '-10%',
    right: '-10%',
    width: '40vw',
    height: '40vw',
    backgroundColor: '#00d4ff',
    animation: 'float2 16s ease-in-out infinite',
  },
  blob3: {
    top: '30%',
    left: '30%',
    width: '30vw',
    height: '30vw',
    backgroundColor: '#ff007b',
    animation: 'float3 18s ease-in-out infinite',
    opacity: 0.3,
  },
  glassCard: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(20, 20, 25, 0.4)',
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '32px',
    padding: '70px 50px',
    maxWidth: '850px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
  },
  badge: {
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: '30px',
    background: 'rgba(255, 255, 255, 0.05)',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '3px',
    marginBottom: '30px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#a0a0a0',
  },
  title: {
    fontSize: 'clamp(3rem, 8vw, 5.5rem)',
    fontWeight: 900,
    margin: '0 0 25px 0',
    lineHeight: 1.1,
    letterSpacing: '-2px',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #00d4ff, #4f00ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    color: '#9ba1a6',
    lineHeight: 1.7,
    marginBottom: '60px',
    maxWidth: '650px',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontWeight: 400,
  },
  countdownContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'clamp(10px, 3vw, 25px)',
    marginBottom: '60px',
  },
  timeBox: {
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    padding: 'clamp(15px, 4vw, 35px) clamp(10px, 3vw, 25px)',
    minWidth: 'clamp(80px, 15vw, 130px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.02)',
  },
  timeValue: {
    fontSize: 'clamp(2rem, 5vw, 4rem)',
    fontWeight: 800,
    color: '#ffffff',
    fontVariantNumeric: 'tabular-nums',
    marginBottom: '10px',
    lineHeight: 1,
  },
  timeLabel: {
    fontSize: 'clamp(10px, 1.5vw, 13px)',
    fontWeight: 600,
    color: '#707070',
    letterSpacing: '3px',
  },
  notifyButton: {
    background: '#ffffff',
    color: '#000000',
    border: 'none',
    padding: '18px 45px',
    fontSize: '17px',
    fontWeight: 800,
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    animation: 'pulseGlow 3s infinite',
    letterSpacing: '1px',
  }
};