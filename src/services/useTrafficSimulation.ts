import { useState, useEffect } from 'react';

export type CongestionLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type WeatherEvent = 'CLEAR' | 'STORM';
export type TrafficEvent = 'NORMAL' | 'RUSH_HOUR';

export interface IntersectionData {
  id: string;
  name: string;
  coords: [number, number];
  congestion: CongestionLevel;
  vehicles: number;
  speed: number;
}

const INITIAL_NODES: IntersectionData[] = [
  { id: 'INT-001', name: 'La Minerva', coords: [20.6744, -103.3874], congestion: 'LOW', vehicles: 12, speed: 50 },
  { id: 'INT-002', name: 'López Mateos', coords: [20.6800, -103.3820], congestion: 'LOW', vehicles: 15, speed: 45 },
  { id: 'INT-003', name: 'Chapalita', coords: [20.6628, -103.4025], congestion: 'LOW', vehicles: 8, speed: 55 },
  { id: 'INT-004', name: 'Vallarta', coords: [20.6720, -103.3760], congestion: 'LOW', vehicles: 10, speed: 48 },
  { id: 'INT-005', name: 'Plaza del Sol', coords: [20.6480, -103.4000], congestion: 'LOW', vehicles: 20, speed: 40 },
];

export function useTrafficSimulation() {
  const [nodes, setNodes] = useState<IntersectionData[]>(INITIAL_NODES);
  const [weather, setWeather] = useState<WeatherEvent>('CLEAR');
  const [traffic, setTraffic] = useState<TrafficEvent>('NORMAL');

  const triggerWeather = (event: WeatherEvent) => setWeather(event);
  const triggerTraffic = (event: TrafficEvent) => setTraffic(event);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          let levels: CongestionLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
          
          // Si el evento es RUSH_HOUR, aumenta drásticamente la probabilidad de HIGH
          if (traffic === 'RUSH_HOUR') {
            levels = ['MEDIUM', 'HIGH', 'HIGH', 'HIGH', 'HIGH'];
          }

          const randomLevel = levels[Math.floor(Math.random() * levels.length)];
          
          let randomVehicles = 0;
          let randomSpeed = 0;

          switch (randomLevel) {
            case 'HIGH':
              randomVehicles = Math.floor(Math.random() * 40) + 60; // 60-100
              randomSpeed = Math.floor(Math.random() * 15) + 5;     // 5-20 km/h
              break;
            case 'MEDIUM':
              randomVehicles = Math.floor(Math.random() * 30) + 30; // 30-60
              randomSpeed = Math.floor(Math.random() * 20) + 20;    // 20-40 km/h
              break;
            case 'LOW':
              randomVehicles = Math.floor(Math.random() * 30);      // 0-30
              randomSpeed = Math.floor(Math.random() * 30) + 40;    // 40-70 km/h
              break;
          }

          // Si es hora pico (RUSH_HOUR), sumar una cantidad fuerte extra de vehículos
          if (traffic === 'RUSH_HOUR') {
            randomVehicles += Math.floor(Math.random() * 50) + 50;
          }

          // Si hay tormenta (STORM), reducir la velocidad a la mitad (mínimo 5 km/h)
          if (weather === 'STORM') {
            randomSpeed = Math.max(Math.floor(randomSpeed / 2), 5);
          }

          return {
            ...node,
            congestion: randomLevel,
            vehicles: randomVehicles,
            speed: randomSpeed,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [weather, traffic]);

  return { nodes, weather, traffic, triggerWeather, triggerTraffic };
}
