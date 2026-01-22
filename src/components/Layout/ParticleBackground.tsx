
import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  size: number;
}

const ParticleBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  
  useEffect(() => {
    // Create initial particles
    const initialParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    
    setParticles(initialParticles);
    
    // Create random explosions
    const explosionInterval = setInterval(() => {
      const newExplosion = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 50 + 20,
      };
      
      setExplosions(prev => [...prev, newExplosion]);
      
      // Remove explosion after animation
      setTimeout(() => {
        setExplosions(prev => prev.filter(e => e.id !== newExplosion.id));
      }, 5000);
      
    }, 8000);
    
    return () => {
      clearInterval(explosionInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
        />
      ))}
      
      {explosions.map(explosion => (
        <div
          key={explosion.id}
          className="explosion"
          style={{
            left: `${explosion.x}%`,
            top: `${explosion.y}%`,
            width: `${explosion.size}px`,
            height: `${explosion.size}px`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
