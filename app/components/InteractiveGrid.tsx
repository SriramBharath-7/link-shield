'use client';

import { useEffect } from 'react';

export default function InteractiveGrid() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      // Calculate offset for grid float effect
      const offsetX = (e.clientX / window.innerWidth - 0.5) * 10;
      const offsetY = (e.clientY / window.innerHeight - 0.5) * 10;
      
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
      
      const gridReveal = document.querySelector('.grid-reveal') as HTMLElement;
      if (gridReveal) {
        gridReveal.classList.add('active');
        gridReveal.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (gridReveal) {
          gridReveal.classList.remove('active');
          gridReveal.style.transform = 'translate(0, 0)';
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
