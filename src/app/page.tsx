'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 72 hours from now
    const targetDate = new Date().getTime() + (72 * 60 * 60 * 1000);

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
        <img src="/applogo.png" alt="EazyPost Logo" style={styles.logo} />
        <h1 style={styles.heading}>{t("Looking for something ?", "Vous cherchez quelque chose ?")}</h1>
        
        <p style={styles.subheading}>
          {t("It’s not here yet, but we'll let you know it’s coming really really soon. Sit tight and check back in on June 15.", "Ce n'est pas encore là, mais nous vous ferons savoir que cela arrive très bientôt. Restez dans le coin et revenez le 15 juin.")}
        </p>

        <div style={styles.countdown}>
          {formatTime(timeLeft.hours)} : {formatTime(timeLeft.minutes)} : {formatTime(timeLeft.seconds)}
        </div>
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
    width: 'clamp(400px, 50vw, 850px)',
    height: 'clamp(400px, 50vw, 850px)',
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
  logo: {
    height: '64px',
    width: 'auto',
    marginBottom: '16px',
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
  }
};