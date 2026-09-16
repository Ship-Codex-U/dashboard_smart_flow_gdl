// src/services/routeData.ts

type Coordinate = [number, number];

// Ruta 1: Av. Vallarta (Con la curva de La Minerva)
const vallartaRoute: Coordinate[] = [
  [20.67250, -103.37500], [20.67270, -103.37650], [20.67290, -103.37800],
  [20.67310, -103.37950], [20.67329, -103.38120], [20.67350, -103.38220],
  [20.67365, -103.38315], [20.67385, -103.38410], [20.67402, -103.38505],
  [20.67415, -103.38570], [20.67425, -103.38620], [20.67440, -103.38650],
  [20.67450, -103.38680], [20.67470, -103.38700], [20.67485, -103.38710],
  [20.67510, -103.38705], [20.67530, -103.38700], [20.67550, -103.38685],
  [20.67570, -103.38670], [20.67590, -103.38645], [20.67610, -103.38620],
  [20.67645, -103.38560], [20.67680, -103.38500], [20.67715, -103.38450],
  [20.67750, -103.38400], [20.67785, -103.38350]
];

// Ruta 2: Av. López Mateos (De norte a sur cruzando la ciudad)
// Generado interpolando desde el norte hacia el sur de manera lineal (aproximadamente)
const generateLopezMateos = (): Coordinate[] => {
  const points: Coordinate[] = [];
  const startLat = 20.6830;
  const endLat = 20.6630;
  const startLng = -103.3905;
  const endLng = -103.3830;
  const steps = 25; // Alta densidad

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lat = startLat + (endLat - startLat) * fraction;
    const lng = startLng + (endLng - startLng) * fraction;
    points.push([lat, lng]);
  }
  return points;
};

// Ruta 3: Glorieta Chapalita
// Generamos puntos describiendo un círculo perfecto alrededor del centro
const generateChapalita = (): Coordinate[] => {
  const centerLat = 20.6628;
  const centerLng = -103.4025;
  const radiusLat = 0.0006;
  const radiusLng = 0.00065; // Ajustado ligeramente por la deformación del mapa
  const points: Coordinate[] = [];
  const steps = 24; // Puntos muy unidos

  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    // Empezar en un punto y dar la vuelta en el sentido de la rotonda
    const lat = centerLat + radiusLat * Math.sin(angle);
    const lng = centerLng + radiusLng * Math.cos(angle);
    points.push([lat, lng]);
  }
  return points;
};

export const cityRoutes = {
  vallarta: vallartaRoute,
  lopezMateos: generateLopezMateos(),
  chapalita: generateChapalita()
};
