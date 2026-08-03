'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './GridMotion.css';

/**
 * @param {{ items?: string[], gradientColor?: string }} props
 */
const GridMotion = ({ items = [], gradientColor = 'black' }) => {
  const gridRef = useRef(null);
  const rowRefs = useRef([]);

  const totalItems = 28;
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  // Continuous back-and-forth drift per row (no mouse involved) — reads as a
  // looping background-video effect rather than a hover-reactive one. Rows
  // alternate direction and use slightly different durations so they don't
  // all sync up.
  useEffect(() => {
    const maxMoveAmount = 300;

    const tweens = rowRefs.current.map((row, index) => {
      if (!row) return null;
      const direction = index % 2 === 0 ? 1 : -1;
      return gsap.fromTo(
        row,
        { x: -maxMoveAmount * direction },
        {
          x: maxMoveAmount * direction,
          duration: 6 + index * 1.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        }
      );
    });

    return () => {
      tweens.forEach((tween) => tween && tween.kill());
    };
  }, []);

  return (
    <div className="noscroll loading" ref={gridRef}>
      <section
        className="intro"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`
        }}
      >
        <div className="gridMotion-container">
          {[...Array(4)].map((_, rowIndex) => (
            <div key={rowIndex} className="row" ref={el => {
                rowRefs.current[rowIndex] = el;
              }}>
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className="row__item">
                    <div className="row__item-inner" style={{ backgroundColor: '#174CD2' }}>
                      {typeof content === 'string' && (content.startsWith('http') || content.startsWith('/')) ? (
                        <div
                          className="row__item-img"
                          style={{
                            backgroundImage: `url("${encodeURI(content)}")`
                          }}
                        ></div>
                      ) : (
                        <div className="row__item-content">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="fullview"></div>
      </section>
    </div>
  );
};

export default GridMotion;
