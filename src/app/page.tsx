'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ hours: 74, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set target exactly 74 hours from now
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 74);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
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
      <div style={styles.column}>
        <div style={styles.content}>
          <h1 style={styles.heading}>
            Our website is Coming Soon, follow us for update now!
          </h1>
          
          <div style={styles.countdownWrapper}>
            <div style={styles.countdownItem}>
              <span style={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span style={styles.countdownLabel}>Hours</span>
            </div>
            <span style={styles.countdownSeparator}>:</span>
            <div style={styles.countdownItem}>
              <span style={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span style={styles.countdownLabel}>Minutes</span>
            </div>
            <span style={styles.countdownSeparator}>:</span>
            <div style={styles.countdownItem}>
              <span style={styles.countdownNumber}>{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span style={styles.countdownLabel}>Seconds</span>
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <div style={styles.form}>
            <input 
              type="email" 
              placeholder="Placeholder" 
              style={styles.input} 
            />
            <button 
              style={styles.button}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Button
            </button>
          </div>
          <p style={styles.terms}>
            By clicking Sign Up you're confirming that you agree with our Terms and Conditions.
          </p>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
      `}} />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px 64px',
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    // Using a light elegant placeholder image since Figma didn't specify the exact .jpg
    background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url("https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=2536&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: "'Roboto', sans-serif",
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    gap: '24px',
    width: '100%',
    maxWidth: '709px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    gap: '24px',
    width: '100%',
  },
  heading: {
    margin: 0,
    width: '100%',
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: 'clamp(40px, 5vw, 56px)',
    lineHeight: '120%',
    color: '#3C48F6',
  },
  countdownWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '16px',
    width: '100%',
    padding: '10px 0',
  },
  countdownItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  countdownNumber: {
    fontWeight: 700,
    fontSize: 'clamp(32px, 5vw, 56px)',
    color: '#3C48F6',
    lineHeight: '100%',
    fontVariantNumeric: 'tabular-nums',
  },
  countdownLabel: {
    fontWeight: 400,
    fontSize: '16px',
    color: '#676767',
    marginTop: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  countdownSeparator: {
    fontWeight: 700,
    fontSize: 'clamp(32px, 5vw, 56px)',
    color: '#3C48F6',
    lineHeight: '90%',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '16px 0px 0px',
    gap: '16px',
    width: '100%',
    maxWidth: '513px',
  },
  form: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '0px',
    gap: '16px',
    width: '100%',
    flexWrap: 'wrap',
  },
  input: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '12px',
    gap: '8px',
    flex: '1 1 200px',
    height: '48px',
    background: '#FFFFFF',
    border: '1px solid #000000',
    borderRadius: '5px',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 400,
    fontSize: '16px',
    color: '#1E1E1E',
    outline: 'none',
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px 30px',
    gap: '8px',
    width: '126px',
    height: '48px',
    background: '#3C48F6',
    border: '1px solid #3C48F6',
    borderRadius: '30px',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 400,
    fontSize: '16px',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  terms: {
    margin: 0,
    width: '100%',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '150%',
    color: '#1E1E1E',
  }
};