import React, { useEffect } from 'react';
import './secondBackground.css';

const SecondBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById('test');
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }

    // Define the canvas width and height
    let w = window.innerWidth;
    let h = document.body.scrollHeight; // Use document height instead of viewport height
    const arc = 100;
    const size = 7;
    const parts = new Array(arc);
    const colors = ['#fbc02d','#fffd70','yellow','#fffd70','#fbc02d'];
    const mouse = { x: 0, y: 0 };

    // Set the canvas size dynamically
    function setCanvasSize() {
      w = window.innerWidth;
      h = document.body.scrollHeight; // Maintain full document height
      canvas.width = w; // Set the canvas width
      canvas.height = h; // Set the canvas height
    }
    setCanvasSize();

    // Resize the canvas if the window is resized
    window.addEventListener('resize', setCanvasSize);

    function createParticles() {
      for (let i = 0; i < arc; i++) {
        parts[i] = {
          x: Math.random() * w,
          y: Math.random() * h,
          toX: Math.random() * 5 - 1,
          toY: Math.random() * 2 - 1,
          c: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * size + 2 // Ensure particles are visible
        };
      }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < arc; i++) {
          const li = parts[i];
          const distanceFactor = Math.max(Math.min(15 - (distanceBetween(mouse, parts[i]) / 10), 10), 1);
          ctx.beginPath();
          ctx.arc(li.x, li.y, li.size * distanceFactor, 0, Math.PI * 2, false);
          ctx.fillStyle = li.c;
          ctx.strokeStyle = li.c;
          if (i % 2 === 0) ctx.stroke(); else ctx.fill();
  
          li.x += li.toX * 0.30;
          li.y += li.toY * 0.30;
  
          if (li.x > w) li.x = 0;
          if (li.y > h) li.y = 0;
          if (li.x < 0) li.x = w;
          if (li.y < 0) li.y = h;
        }
        requestAnimationFrame(drawParticles);
      }

    function handleMouseMove(e) {
      // Only update mouse position if it's within the bounds of the canvas
      if (e.clientY < h) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    }

    function distanceBetween(p1, p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    window.addEventListener('mousemove', handleMouseMove);

    // Create particles and start the animation
    createParticles();
    drawParticles();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return <canvas id="test"></canvas>;
};

export default SecondBackground;
