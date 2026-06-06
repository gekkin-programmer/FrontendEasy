'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
        <div style={styles.logoContainer}>
          <img src="/applogo.png" alt="E" style={styles.logo} />
          <span style={styles.logoText}>azypost</span>
        </div>
        <h1 style={styles.heading}>{t("Looking for something ?", "Vous cherchez quelque chose ?")}</h1>
        
        <p style={styles.subheading}>
          {t("It’s not here yet, but we'll let you know it’s coming really really soon. Sit tight and check back in on June 27.", "Ce n'est pas encore là, mais nous vous ferons savoir que cela arrive très bientôt. Restez dans le coin et revenez le 27 juin.")}
        </p>
      </div>
      
      <img src="/logos/BC-violet.png" alt="BestCorp Logo" style={styles.bestcorpLogo} />
      
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
    position: 'relative',
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
    marginTop: '-64px',
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
  logoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '16px',
  },
  logo: {
    height: '80px',
    width: 'auto',
  },
  logoText: {
    fontFamily: "'Rubik', sans-serif",
    fontWeight: 700,
    fontSize: '72px',
    color: '#3C48F6',
    letterSpacing: '-1px',
  },
  bestcorpLogo: {
    position: 'absolute',
    bottom: '32px',
    right: '64px',
    height: '144px',
    width: 'auto',
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
  }
};