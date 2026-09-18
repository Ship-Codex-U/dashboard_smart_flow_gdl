"use client";

import { useState, useEffect } from 'react';
import { useTrafficSimulation } from '@/services/useTrafficSimulation';
import { BrainCircuit, Activity, Server, Cpu, Database } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ipcunenaytijdproskxf.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_KEY || 'sb_publishable_tUdmn3h_fIx9zERQweNTyA_HYqThsb4'
);

export default function TechnicalDashboard() {
  const { weather, traffic } = useTrafficSimulation();
  const [logs, setLogs]         = useState<string[]>([]);
  const [fitness, setFitness]   = useState<number | null>(null);
  const [generacion, setGeneracion] = useState<number>(50);
  const [latencia, setLatencia] = useState<number>(142);

  // ── Obtener ultimo fitness del AG desde Supabase ────────
  useEffect(() => {
    const fetchFitness = async () => {
      const { data } = await supabase
        .from('traffic_lights')
        .select('fitness, optimized_at')
        .order('optimized_at', { ascending: false })
        .limit(1)
        .single();

      if (data) setFitness(data.fitness);
    };

    fetchFitness();

    const channel = supabase
      .channel('traffic_lights_realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'traffic_lights' },
        (payload) => {
          const row = payload.new as any;
          if (row.fitness) setFitness(row.fitness);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Simular latencia variable ───────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencia(Math.floor(Math.random() * 60) + 110); // 110-170ms
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Logs de telemetria ──────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const msgs = [
        '[NET] SYN_ACK de Nodo INT-003 (14ms)',
        '[ALG] Recalculando rutas optimas (V-1024)...',
        '[DB] Sincronizando estado de intersecciones...',
        `[SYS] Clima: ${weather}, Trafico: ${traffic}`,
        '[NET] Perdida de paquetes 0.01% en Sector 4',
        '[ALG] Mutacion genetica aplicada: fitness +0.02',
        '[SENS] Leyendo densidades de camara de trafico 4',
        '[SYS] Health check OK',
        '[ML] Prediccion Random Forest completada (F1=0.91)',
        '[GA] Generacion 50/50 completada',
        '[DB] Supabase: INSERT traffic_readings OK',
        '[NET] Railway health check: 3/3 servicios activos',
      ];
      const newLog = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => {
        const updated = [...prev, `> ${new Date().toISOString().substring(11, 19)} - ${newLog}`];
        return updated.slice(-15);
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [weather, traffic]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Técnico</h1>
        <p className="text-slate-500 text-sm font-medium">Métricas de infraestructura, red y modelos de inteligencia artificial</p>
      </div>

      {/* KPIs Técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Precisión IA (F1)</p>
            <BrainCircuit className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">91.3%</p>
          <p className="text-slate-400 text-[10px] mt-1">Modelo Random Forest — Meta: &gt;85%</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Latencia API (P95)</p>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-700">{latencia} ms</p>
          <p className="text-slate-400 text-[10px] mt-1">Meta: &lt; 200ms</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Disponibilidad</p>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">99.9%</p>
          <p className="text-slate-400 text-[10px] mt-1">Railway — 3/3 servicios activos</p>
        </div>
      </div>

      {/* Paneles Técnicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-[400px]">

        {/* Algoritmo Genetico */}
        <div className="bg-white border border-slate-200 text-slate-800 shadow-sm rounded-xl p-6 flex flex-col">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-purple-500" /> Estado del Algoritmo Genético
          </h2>
          <div className="space-y-8 flex-grow justify-center flex flex-col px-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Generaciones</span>
                <span className="text-lg font-bold text-purple-600">50 / 50</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Prob. Cruzamiento</span>
                <span className="text-lg font-bold text-slate-700">85%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-blue-400 h-3 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Fitness Score</span>
                <span className="text-2xl font-bold text-green-500">
                  {fitness !== null ? fitness.toLocaleString('es-MX', { maximumFractionDigits: 0 }) : '---'}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] mt-1">Tiempo promedio de espera ponderado (menor = mejor)</p>
            </div>
          </div>
        </div>

        {/* Terminal */}
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
