"use client";

import { useTrafficSimulation } from '@/services/useTrafficSimulation';
import { Sliders } from 'lucide-react';

export default function SimulationPanel() {
  const { weather, traffic, triggerWeather, triggerTraffic } = useTrafficSimulation();

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-slate-800 text-left text-xl font-semibold mb-6 flex items-center gap-2">
        <Sliders className="w-6 h-6 text-blue-600" />
        Simulador de Escenarios
      </h2>
      
      <div className="flex flex-col gap-6 flex-grow">
        
        {/* Sección Clima */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
          <h3 className="text-slate-500 font-medium mb-3 text-sm uppercase tracking-wider">Condiciones Climáticas</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => triggerWeather('CLEAR')}
              className={`p-2 rounded-md font-medium transition-all ${
                weather === 'CLEAR' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Despejado
            </button>
            <button 
              onClick={() => triggerWeather('STORM')}
              className={`p-2 rounded-md font-medium transition-all ${
                weather === 'STORM' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Tormenta
            </button>
          </div>
        </div>

        {/* Sección Tráfico */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
          <h3 className="text-slate-500 font-medium mb-3 text-sm uppercase tracking-wider">Flujo Vehicular</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => triggerTraffic('NORMAL')}
              className={`p-2 rounded-md font-medium transition-all ${
                traffic === 'NORMAL' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Normal
            </button>
            <button 
              onClick={() => triggerTraffic('RUSH_HOUR')}
              className={`p-2 rounded-md font-medium transition-all ${
                traffic === 'RUSH_HOUR' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Hora Pico
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
