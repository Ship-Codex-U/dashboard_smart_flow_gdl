"use client";

import { MapContainer, TileLayer, Popup, CircleMarker, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTrafficSimulation, CongestionLevel } from '@/services/useTrafficSimulation';
import TrafficSwarm from './TrafficSwarm';
import { Map as MapIcon } from 'lucide-react';

interface MapProps {
  hideTitle?: boolean;
  zoomControl?: boolean;
}

export default function Map({ hideTitle = false, zoomControl = true }: MapProps = {}) {
  // Centro ajustado para ver desde López Mateos Norte hasta Plaza del Sol Sur
  const position: [number, number] = [20.6650, -103.3900]; 
  const { nodes } = useTrafficSimulation();

  const getColor = (congestion: CongestionLevel) => {
    switch (congestion) {
      case 'HIGH': return '#ef4444'; // red-500
      case 'MEDIUM': return '#eab308'; // yellow-500
      case 'LOW': return '#22c55e'; // green-500
      default: return '#3b82f6'; // blue-500
    }
  };

  return (
    <div className="w-full h-full flex flex-col z-0 relative">
      {!hideTitle && (
        <h2 className="text-slate-800 text-left text-xl font-semibold mb-4 flex items-center gap-2">
          <MapIcon className="w-6 h-6 text-blue-600" />
          Mapa Interactivo
        </h2>
      )}
      
      <div className="flex-grow w-full rounded-lg overflow-hidden">
        <MapContainer 
          center={position} 
          zoom={12.5} 
          zoomControl={zoomControl}
          style={{ height: '100%', width: '100%' }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Estándar (OSM)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satélite (Esri)">
              <TileLayer
                attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Relieve (OpenTopoMap)">
              <TileLayer
                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            {/* Overlays (Capas de Datos) */}
            <LayersControl.Overlay checked name="Estado de Intersecciones">
              <LayerGroup>
                {nodes.map((node) => (
                  <CircleMarker
                    key={node.id}
                    center={node.coords}
                    radius={12}
                    pathOptions={{ 
                      color: getColor(node.congestion),
                      fillColor: getColor(node.congestion),
                      fillOpacity: 0.7,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="text-slate-800">
                        <h3 className="font-bold text-base mb-1">{node.name}</h3>
                        <div className="text-sm flex flex-col gap-1">
                          <p><span className="font-semibold">Nivel:</span> {node.congestion}</p>
                          <p><span className="font-semibold">Velocidad:</span> {node.speed} km/h</p>
                          <p><span className="font-semibold">Vehículos:</span> {node.vehicles}</p>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
            
            <LayersControl.Overlay checked name="Tráfico Simulado (IA)">
              <LayerGroup>
                <TrafficSwarm />
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>
    </div>
  );
}
