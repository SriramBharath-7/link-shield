'use client';

import { useEffect } from 'react';

export default function InteractiveGrid() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
      
      const gridReveal = document.querySelector('.grid-reveal');
      if (gridReveal) {
        gridReveal.classList.add('active');
      }
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (gridReveal) {
          gridReveal.classList.remove('active');
        }
      }, 150);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);
  
  return <div className="grid-reveal" />;
}
