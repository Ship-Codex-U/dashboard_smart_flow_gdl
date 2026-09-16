"use client";

import dynamic from 'next/dynamic';
import { useTrafficSimulation } from '@/services/useTrafficSimulation';
import SimulationPanel from '@/components/SimulationPanel';
import { Cloud, CloudRain, Wind, Clock } from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="bg-white border border-slate-200 text-slate-800 shadow-sm rounded-xl p-4 w-full h-full flex items-center justify-center">Cargando mapa...</div> 
});

export default function LaboratoryPage() {
  const { weather, traffic } = useTrafficSimulation();

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-2rem)] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Laboratorio de Simulación</h1>
        <p className="text-slate-500 text-sm font-medium">Entorno interactivo para simulación de escenarios de tráfico</p>
      </div>
      
      <div className="grid grid-cols-12 gap-6 flex-grow">
        
        {/* Columna Izquierda (25%) - Controles */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          
          {/* Condiciones Ambientales */}
          <div className="bg-white border border-slate-200 text-slate-800 shadow-sm rounded-xl p-4 w-full">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-500"/> Entorno Actual
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400"/> <span className="text-sm font-medium">Hora</span></div>
                <span className="text-sm font-bold text-slate-700">{traffic === 'RUSH_HOUR' ? '08:30 AM (Pico)' : '01:15 PM'}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  {weather === 'STORM' ? <CloudRain className="w-4 h-4 text-slate-400"/> : <Cloud className="w-4 h-4 text-slate-400"/>} 
                  <span className="text-sm font-medium">Clima</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{weather === 'STORM' ? 'Tormenta' : 'Despejado'}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-slate-400"/> <span className="text-sm font-medium">Viento</span></div>
                <span className="text-sm font-bold text-slate-700">{weather === 'STORM' ? '45 km/h' : '14 km/h'}</span>
              </div>
            </div>
          </div>

          {/* Panel de Control de Eventos */}
          <div className="bg-white border border-slate-200 text-slate-800 shadow-sm rounded-xl p-4 w-full">
            <SimulationPanel />
          </div>

        </div>

        {/* Columna Derecha (75%) - Mapa Expandido */}
        <div className="col-span-12 lg:col-span-9 flex flex-col h-full min-h-[600px]">
          <div className="flex-1 bg-white border border-slate-200 text-slate-800 shadow-sm rounded-xl p-4 w-full overflow-hidden">
            <Map />
          </div>
        </div>

      </div>
    </div>
  );
}
