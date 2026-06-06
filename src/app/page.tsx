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
              placeholder="Email us" 
              style={styles.input} 
            />
            <button 
              style={styles.button}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.color = '#3C48F6';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#3C48F6';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Email us
            </button>
          </div>
          <p style={styles.terms}>
            By clicking Sign Up you're confirming that you agree with our Terms and Conditions.
          </p>
        </div>
      </div>
      
      {/* The new GIF element */}
      <div style={styles.imageBox} />
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Rubik+One&display=swap');
        
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
    justifyContent: 'space-between',
    padding: '0px 64px',
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    background: '#FFFFFF', // Solid white background
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
    flex: 'none',
    order: 0,
    flexGrow: 0,
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
    fontFamily: "'Rubik One', sans-serif",
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 'clamp(32px, 4vw, 56px)',
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
    fontFamily: "'Rubik One', sans-serif",
    fontWeight: 400,
    fontSize: 'clamp(32px, 5vw, 48px)',
    color: '#1E1E1E',
    lineHeight: '100%',
    fontVariantNumeric: 'tabular-nums',
  },
  countdownLabel: {
    fontWeight: 700,
    fontSize: '16px',
    color: '#1E1E1E',
    marginTop: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  countdownSeparator: {
    fontFamily: "'Rubik One', sans-serif",
    fontWeight: 400,
    fontSize: 'clamp(32px, 5vw, 48px)',
    color: '#1E1E1E',
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
    border: '1px solid #D1D5DB',
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
    transition: 'all 0.3s ease',
  },
  terms: {
    margin: 0,
    width: '100%',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '150%',
    color: '#1E1E1E',
  },
  imageBox: {
    width: 'clamp(350px, 45vw, 700px)',
    height: 'clamp(350px, 45vw, 700px)',
    background: 'url(/Update.gif)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    flex: 'none',
    order: 1,
    flexGrow: 0,
  }
};