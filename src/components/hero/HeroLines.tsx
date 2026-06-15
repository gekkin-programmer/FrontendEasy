import React from 'react';
import AnimatedIcons from './AnimatedIcons';

export default function HeroLines({ right = false }: { right?: boolean }) {
  return (
    <svg className="overflow-visible" width="550" height="319" viewBox="0 0 550 319" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="-1589" y1="-1040" x2="411.16" y2="344.66" stroke="white" strokeWidth="7"/>
      <line x1="-1499" y1="-1096" x2="491.16" y2="288.66" stroke="white" strokeWidth="7"/>
      <line x1="-1405" y1="-1160" x2="550.16" y2="224.66" stroke="white" strokeWidth="7"/>
      <AnimatedIcons right={right} />
    </svg>
  );
}
