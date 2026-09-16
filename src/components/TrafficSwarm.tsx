import { useMemo } from 'react';
import MovingVehicle from './MovingVehicle';
import { cityRoutes } from '@/services/routeData';

type Coordinate = [number, number];

interface VehicleData {
  id: string;
  route: Coordinate[];
  initialPosition: number;
}

export default function TrafficSwarm() {
  const swarm = useMemo<VehicleData[]>(() => {
    const vehicles: VehicleData[] = [];
    const routeKeys = Object.keys(cityRoutes) as Array<keyof typeof cityRoutes>;
    
    for (let i = 0; i < 40; i++) {
      // Seleccionar una ruta aleatoria
      const randomRouteKey = routeKeys[Math.floor(Math.random() * routeKeys.length)];
      const route = cityRoutes[randomRouteKey];
      
      // Asignar una posición inicial aleatoria
      const initialPosition = Math.floor(Math.random() * route.length);
      
      vehicles.push({
        id: `vehicle-${i}`,
        route,
        initialPosition
      });
    }
    
    return vehicles;
  }, []);

  return (
    <>
      {swarm.map((v) => (
        <MovingVehicle
          key={v.id}
          route={v.route}
          initialPosition={v.initialPosition}
        />
      ))}
    </>
  );
}
