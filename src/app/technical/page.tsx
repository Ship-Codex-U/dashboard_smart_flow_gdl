"use client";

import { useState, useEffect } from 'react';
import { useTrafficSimulation } from '@/services/useTrafficSimulation';
import { BrainCircuit, Activity, Server, Cpu, Database } from 'lucide-react';

export default function TechnicalDashboard() {
  const { weather, traffic } = useTrafficSimulation();

  // Simulación de log de telemetría estilo terminal
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const msgs = [
        '[NET] SYN_ACK de Nodo INT-003 (14ms)',
        '[ALG] Recalculando rutas óptimas (V-1024)...',
        '[DB] Sincronizando estado de intersecciones...',
        `[SYS] Clima: ${weather}, Tráfico: ${traffic}`,
        '[NET] Pérdida de paquetes 0.01% en Sector 4',
        '[ALG] Mutación genética aplicada: fitness +0.02',
        '[SENS] Leyendo densidades de cámara de tráfico 4',
        '[SYS] Health check OK'
      ];
      const newLog = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => {
        // Mantener solo los últimos 15 mensajes
        const updated = [...prev, `> ${new Date().toISOString().substring(11, 19)} - ${newLog}`];
        return updated.slice(-15);
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [weather, traffic]);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Técnico</h1>
        <p className="text-slate-500 text-sm font-medium">Métricas de infraestructura, red y modelos de inteligencia artificial</p>
      </div>

      {/* KPIs Técnicos (3 Columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* KPI 2: Precisión IA */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Precisión IA (F1)</p>
            <BrainCircuit className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">87.4%</p>
          <p className="text-slate-400 text-[10px] mt-1">Modelo Random Forest</p>
        </div>

        {/* KPI 3: Latencia API */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Latencia API (P95)</p>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-700">142 ms</p>
          <p className="text-slate-400 text-[10px] mt-1">Meta: &lt; 200ms</p>
        </div>

        {/* KPI 4: Disponibilidad */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Disponibilidad</p>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">99.9%</p>
          <p className="text-slate-400 text-[10px] mt-1">Uptime del clúster</p>
        </div>
      </div>

      {/* Paneles Técnicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-[400px]">

        {/* Columna Izquierda: Algoritmo Genético */}
        <div className="bg-white border border-slate-200 text-slate-800 shadow-sm rounded-xl p-6 flex flex-col">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-purple-500" /> Estado del Algoritmo Genético
          </h2>
          <div className="space-y-8 flex-grow justify-center flex flex-col px-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Generación Actual</span>
                <span className="text-lg font-bold text-purple-600">12 / 50</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full transition-all duration-500" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Tasa de Mutación</span>
                <span className="text-lg font-bold text-slate-700">15%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-orange-400 h-3 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Fitness Score Global</span>
                <span className="text-2xl font-bold text-green-500">8.942</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Terminal / Logs de Telemetría */}
        <div className="bg-slate-900 border border-slate-800 shadow-lg rounded-xl p-4 flex flex-col overflow-hidden">
          <h2 className="font-semibold text-sm mb-3 text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800 shrink-0">
            <Database className="w-4 h-4 text-green-400" /> Telemetría en Tiempo Real
          </h2>
          <div className="flex-1 rounded p-2 overflow-y-auto font-mono text-xs text-green-400 flex flex-col justify-end tracking-wider">
            {logs.map((log, i) => (
              <div key={i} className="mb-2 opacity-90">{log}</div>
            ))}
            {logs.length === 0 && <div className="animate-pulse">Estableciendo conexión de red...</div>}
          </div>
        </div>

      </div>

    </div>
  );
}
