"use client";

import dynamic from 'next/dynamic';
import { useTrafficSimulation } from '@/services/useTrafficSimulation';
import { Timer, Leaf, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="bg-slate-50 border border-slate-200 text-slate-800 shadow-sm rounded-xl p-4 w-full h-full flex items-center justify-center">Cargando mapa...</div>
});

export default function Home() {
  const { nodes } = useTrafficSimulation();

  // ── KPIs ──────────────────────────────────────────────────
  // Reduccion de espera y mitigacion de CO2: resultado real y
  // validado del experimento del Algoritmo Genetico (30 corridas
  // reales en produccion, media ponderada por volumen vehicular,
  // IC 95% = [23.90%, 28.27%]). Ver metodologia completa en el
  // informe final. No son valores inventados ni recalculados en
  // el navegador: son el mismo hallazgo fijo reportado en el PDF.
  //
  // "Flujo vs Historico" se elimino: no existe en el sistema una
  // metodologia de medicion real para esa metrica (ver informe,
  // seccion de Resultados) — el simulador de sensores genera el
  // volumen vehicular de forma independiente a la optimizacion de
  // semaforos, por lo que no hay relacion causal que medir.
  const kpis = useMemo(() => ({ reduccion: -26.09, co2: -26.09 }), []);

  // Promedio de vehiculos en vivo (si viene de las 5 intersecciones
  // reales via Supabase): metrica real, medida, no derivada.
  const promedioVehiculos = useMemo(() => {
    if (!nodes.length) return 0;
    return Math.round(nodes.reduce((sum, n) => sum + n.vehicles, 0) / nodes.length);
  }, [nodes]);

  const getBadgeColor = (congestion: string) => {
    switch (congestion) {
      case 'HIGH':   return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW':    return 'bg-green-100 text-green-700 border-green-200';
      default:       return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Ejecutivo</h1>
        <p className="text-slate-500 text-sm font-medium">Resumen global de KPIs de tráfico</p>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Estadísticas de Tráfico y Medio Ambiente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Reducción de Espera</p>
                <Timer className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{kpis.reduccion}%</p>
              <p className="text-slate-400 text-[10px] mt-1">vs. semáforo estático</p>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Vehículos en Vivo</p>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{promedioVehiculos}</p>
              <p className="text-slate-400 text-[10px] mt-1">promedio actual, 5 intersecciones</p>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Mitigación CO2</p>
                <Leaf className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{kpis.co2}%</p>
              <p className="text-slate-400 text-[10px] mt-1">Reducción de ralentí</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow min-h-[400px]">
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200 text-slate-800 shadow-sm rounded-xl p-4 flex flex-col">
          <h3 className="text-slate-800 font-semibold mb-4 text-center">Vista Rápida del Sistema</h3>
          <div className="flex-grow w-full rounded-lg overflow-hidden border border-slate-100 min-h-[350px] pointer-events-none">
            <Map hideTitle={true} zoomControl={false} />
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200 text-slate-800 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
            <h3 className="text-slate-800 font-semibold">Estado de Intersecciones</h3>
          </div>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-100 text-slate-500 text-[10px] uppercase tracking-wider">
                  <th className="p-3 font-medium">Nombre</th>
                  <th className="p-3 font-medium text-center">Flujo</th>
                  <th className="p-3 font-medium text-center">Nivel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800 text-sm">{node.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{node.id}</div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="text-slate-700 font-medium text-sm">{node.vehicles} <span className="text-[10px] text-slate-400">veh</span></div>
                      <div className="text-slate-500 text-xs">{node.speed} km/h</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getBadgeColor(node.congestion)}`}>
                        {node.congestion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
