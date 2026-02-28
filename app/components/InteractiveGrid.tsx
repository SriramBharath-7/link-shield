'use client';

import { useEffect, useState } from 'react';

export default function InteractiveGrid() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Detect mobile/touch device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (isMobile) return;
    
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
  }, [isMobile]);
  
  // Don't render on mobile
  if (isMobile) return null;
  
  return <div className="grid-reveal" />;
}
