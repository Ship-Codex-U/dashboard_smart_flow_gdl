"use client";

import { useState, useEffect } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

// Crear el icono de div personalizado con Tailwind y el emoji
const carIcon = L.divIcon({
  // Se añaden las clases solicitadas. (Nota: Para que el movimiento sea fluido en Leaflet, 
  // la clase de transición también debe pasarse al contenedor padre a través de className)
  html: `<div class="text-2xl text-black transition-transform duration-1000 ease-linear">➤</div>`,
  className: 'bg-transparent transition-transform duration-1000 ease-linear',
  iconSize: [30, 30],
  iconAnchor: [15, 15] // Centra el emoji en la coordenada
});

interface MovingVehicleProps {
  route: [number, number][];
  initialPosition?: number;
}

export default function MovingVehicle({ route, initialPosition = 0 }: MovingVehicleProps) {
  const [currentPos, setCurrentPos] = useState(initialPosition);

  useEffect(() => {
    if (!route || route.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPos((prevPos) => {
        // Si el índice llega al final de la ruta, reinícialo a 0
        if (prevPos >= route.length - 1) {
          return 0;
        }
        // De lo contrario, avanza a la siguiente posición
        return prevPos + 1;
      });
    }, 1000); // Se actualizó a 1000ms

    return () => clearInterval(interval);
  }, [route]);

  if (!route || route.length === 0) return null;

  return <Marker position={route[currentPos]} icon={carIcon} />;
}
