"use client";

import { useTrafficSimulation } from '@/services/useTrafficSimulation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Metrics() {
  const { nodes } = useTrafficSimulation();

  // Calcular el total de vehículos
  const totalVehicles = nodes.reduce((sum, node) => sum + node.vehicles, 0);
  
  // Calcular la velocidad promedio
  const averageSpeed = nodes.length > 0 
    ? (nodes.reduce((sum, node) => sum + node.speed, 0) / nodes.length).toFixed(1)
    : 0;

  // Preparar los datos para la gráfica (nombre corto)
  const chartData = nodes.map((node) => ({
    ...node,
    // Mostrar solo las primeras 3 letras, por ejemplo: MIN, LÓP, CHA...
    shortName: node.name.substring(0, 3).toUpperCase(), 
  }));

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-slate-800 text-center text-xl font-semibold mb-6">Métricas y Semáforos</h2>
      
      {/* Tarjetas de Métricas Generales */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col items-center justify-center">
          <span className="text-slate-500 text-sm font-medium mb-1">Total Vehículos</span>
          <span className="text-slate-700 text-3xl font-bold text-center">{totalVehicles}</span>
        </div>
        
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col items-center justify-center">
          <span className="text-slate-500 text-sm font-medium mb-1">Vel. Promedio</span>
          <span className="text-slate-700 text-3xl font-bold text-center">
            {averageSpeed} <span className="text-lg text-slate-500 font-normal">km/h</span>
          </span>
        </div>
      </div>

      {/* Gráfica de Barras con Recharts */}
      <div className="flex-grow w-full flex flex-col justify-end">
        <h3 className="text-slate-500 text-sm font-medium mb-4 text-center">Volumen de Tráfico por Nodo</h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <XAxis 
                dataKey="shortName" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }} // Hover color slate-100
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '0.5rem', 
                  color: '#334155' 
                }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value} vehículos`, 'Cantidad']}
                labelFormatter={(label) => `Nodo: ${label}`}
              />
              <Bar 
                dataKey="vehicles" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} // Bordes redondeados superiores
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
