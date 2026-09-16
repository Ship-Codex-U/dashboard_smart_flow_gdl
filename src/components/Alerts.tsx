"use client";

import { useTrafficSimulation } from '@/services/useTrafficSimulation';

export default function Alerts() {
  const { nodes } = useTrafficSimulation();

  // Filtrar las intersecciones que estén en estado de congestión alta
  const criticalNodes = nodes.filter(node => node.congestion === 'HIGH');

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-slate-800 text-center text-xl font-semibold mb-4 flex items-center justify-center gap-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" height="20" 
          viewBox="0 0 24 24" 
          fill="none" stroke="currentColor" 
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
          className="text-red-500"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Registro de Alertas
      </h2>
      
      {/* Contenedor con scroll para las alertas si hay demasiadas */}
      <div className="flex-grow max-h-[220px] overflow-y-auto pr-2 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-700">
        {criticalNodes.length > 0 ? (
          criticalNodes.map(node => (
            <div 
              key={node.id} 
              className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm transition-all duration-300 ease-in-out shadow-sm"
            >
              🚨 Congestión severa detectada en <span className="font-bold text-red-900">{node.name}</span>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm font-medium">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="28" height="28" 
              viewBox="0 0 24 24" 
              fill="none" stroke="currentColor" 
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
              className="mb-2 text-green-500 opacity-80"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Sistemas operando con normalidad.
          </div>
        )}
      </div>
    </div>
  );
}
