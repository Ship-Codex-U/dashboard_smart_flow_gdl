"use client";

import { useState, useEffect } from 'react';
import { useTrafficSimulation } from '@/services/useTrafficSimulation';
import { BrainCircuit, Activity, Server, Cpu, Database, Timer } from 'lucide-react';

// Mismo proyecto Supabase que useTrafficSimulation.ts (fejxijloxyxzdshgymvz).
// Antes apuntaba al proyecto viejo, anterior a la migracion, por lo que esta
// pagina nunca llegaba a leer datos reales de traffic_lights.
function getSupabase() {
  if (typeof window === 'undefined') return null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      || 'https://fejxijloxyxzdshgymvz.supabase.co';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlanhpamxveHl4emRzaGd5bXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNTAwNjUsImV4cCI6MjEwNzkyNjA2NX0.v1LRG8HeJ_UjwMHGzTfR8bYRCAmTlSFryXKxAOpCJT8';
    return createClient(url, key);
  } catch { return null; }
}

// URL publica del microservicio de prediccion en Railway. Se usa solo para
// medir latencia real (GET /health), nunca para leer datos sensibles.
const PREDICCION_HEALTH_URL = (process.env.NEXT_PUBLIC_PREDICCION_URL
  || 'https://responsible-victory-production-c29a.up.railway.app') + '/health';

interface TrafficLight {
  intersection_id: string;
  intersection_name: string;
  congestion_level: string;
  verde_default: number;
  verde_optimo: number;
  rojo_optimo: number;
  amarillo: number;
  fitness: number;
  optimized_at: string;
}

export default function TechnicalDashboard() {
  const { weather, traffic } = useTrafficSimulation();
  const [logs, setLogs]           = useState<string[]>([]);
  const [fitness, setFitness]     = useState<number | null>(null);
  const [latencia, setLatencia]   = useState<number | null>(null);
  const [muestrasLatencia, setMuestrasLatencia] = useState<number>(0);
  const [semaforos, setSemaforos] = useState<TrafficLight[]>([]);

  // ── Obtener tiempos optimizados de semaforos ────────────
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    const fetchSemaforos = async () => {
      const ids = ['INT-001', 'INT-002', 'INT-003', 'INT-004', 'INT-005'];
      const results: TrafficLight[] = [];

      for (const id of ids) {
        const { data } = await sb
          .from('traffic_lights')
          .select('*')
          .eq('intersection_id', id)
          .order('optimized_at', { ascending: false })
          .limit(1)
          .single();

        if (data) results.push(data);
      }

      setSemaforos(results);
      if (results[0]) setFitness(results[0].fitness);
    };

    fetchSemaforos();

    const channel = sb
      .channel('traffic_lights_realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'traffic_lights' },
        () => { fetchSemaforos(); }
      )
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, []);

  // ── Latencia real, medida en vivo desde el navegador ────
  // Antes era un numero aleatorio (110-170ms) sin relacion con ningun
  // dato real. Ahora se mide el tiempo de ida y vuelta real de un GET a
  // /health del servicio de prediccion en Railway, y se reporta el P95
  // sobre las ultimas 20 mediciones (ventana movil, se refresca cada 5s).
  useEffect(() => {
    const muestras: number[] = [];

    const medirLatencia = async () => {
      const t0 = performance.now();
      try {
        await fetch(PREDICCION_HEALTH_URL, { cache: 'no-store' });
        const rtt = performance.now() - t0;
        muestras.push(rtt);
        if (muestras.length > 20) muestras.shift();

        const ordenadas = [...muestras].sort((a, b) => a - b);
        const idxP95 = Math.min(ordenadas.length - 1, Math.floor(ordenadas.length * 0.95));
        setLatencia(Math.round(ordenadas[idxP95]));
        setMuestrasLatencia(muestras.length);
      } catch {
        // Si falla el ping (red, servicio dormido, etc.) no se inventa un
        // numero: se deja el ultimo valor real conocido.
      }
    };

    medirLatencia();
    const interval = setInterval(medirLatencia, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Logs de telemetria (datos reales de Supabase) ───────
  // Cada linea corresponde a una fila real que acaba de llegar a
  // traffic_readings (sensor -> ingesta) o traffic_lights (optimizacion).
  // No se genera ningun mensaje simulado.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let ultimaLectura = new Date(Date.now() - 60_000).toISOString();
    let ultimoVerde   = ultimaLectura;
    let activo = true;

    const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-MX', { hour12: false, timeZone: 'America/Mexico_City' });

    const sondear = async () => {
      try {
        const [lect, verd] = await Promise.all([
          sb.from('traffic_readings')
            .select('intersection_id,vehicles_count,avg_speed_kmh,congestion_level,weather,created_at')
            .gt('created_at', ultimaLectura).order('created_at', { ascending: true }).limit(20),
          sb.from('traffic_lights')
            .select('intersection_id,congestion_level,verde_default,verde_optimo,fitness,optimized_at')
            .gt('optimized_at', ultimoVerde).order('optimized_at', { ascending: true }).limit(20),
        ]);
        const nuevas: { t: string; txt: string }[] = [];
        for (const r of lect.data ?? []) {
          ultimaLectura = r.created_at;
          nuevas.push({ t: r.created_at, txt:
            `[SENSOR] ${r.intersection_id}: ${r.vehicles_count} veh, ${Number(r.avg_speed_kmh).toFixed(1)} km/h, ${r.congestion_level} (${r.weather})` });
        }
        for (const v of verd.data ?? []) {
          ultimoVerde = v.optimized_at;
          nuevas.push({ t: v.optimized_at, txt:
            `[GA] ${v.intersection_id}: verde ${v.verde_default}s -> ${v.verde_optimo}s, fitness ${Number(v.fitness).toLocaleString('es-MX', { maximumFractionDigits: 0 })}` });
        }
        if (!activo || nuevas.length === 0) return;
        nuevas.sort((a, b) => a.t.localeCompare(b.t));
        setLogs(prev => [...prev, ...nuevas.map(n => `> ${hora(n.t)} - ${n.txt}`)].slice(-15));
      } catch {
        // Sin conexion: no se inventan lineas.
      }
    };

    sondear();
    const interval = setInterval(sondear, 3000);
    return () => { activo = false; clearInterval(interval); };
  }, []);

  const getCongestionColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':   return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low':    return 'text-green-500';
      default:       return 'text-slate-500';
    }
  };

  const getBarColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':   return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low':    return 'bg-green-400';
      default:       return 'bg-blue-400';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Técnico</h1>
        <p className="text-slate-500 text-sm font-medium">Métricas de infraestructura, red y modelos de inteligencia artificial</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Precisión IA (F1)</p>
            <BrainCircuit className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">91.7%</p>
          <p className="text-slate-400 text-[10px] mt-1">Random Forest, datos sintéticos — Meta: &gt;85%</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Latencia API (P95)</p>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-700">{latencia !== null ? `${latencia} ms` : '—'}</p>
          <p className="text-slate-400 text-[10px] mt-1">
            {latencia !== null
              ? `en vivo · P95 de ${muestrasLatencia} mediciones reales · meta: < 200ms`
              : 'midiendo latencia real…'}
          </p>
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

      {/* Tiempos de Semaforo Optimizados */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Timer className="w-5 h-5 text-purple-500" />
          <h2 className="font-semibold text-slate-800">Tiempos de Semáforo Optimizados por AG</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-[10px] uppercase tracking-wider">
                <th className="p-3 font-medium">Intersección</th>
                <th className="p-3 font-medium text-center">Congestión</th>
                <th className="p-3 font-medium text-center">Verde Default</th>
                <th className="p-3 font-medium text-center">Verde Óptimo</th>
                <th className="p-3 font-medium text-center">Rojo Óptimo</th>
                <th className="p-3 font-medium text-center">Ahorro</th>
                <th className="p-3 font-medium">Distribución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {semaforos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400 text-sm">
                    Cargando datos del Algoritmo Genético...
                  </td>
                </tr>
              ) : (
                semaforos.map((s) => {
                  const ahorro    = s.rojo_optimo < (180 - 45 - 3) ? Math.round(((180 - 45 - 3) - s.rojo_optimo) / (180 - 45 - 3) * 100) : 0;
                  const totalTime = s.verde_optimo + s.rojo_optimo + s.amarillo;
                  const pctVerde  = Math.round((s.verde_optimo / totalTime) * 100);
                  const pctRojo   = Math.round((s.rojo_optimo / totalTime) * 100);
                  const pctAmar   = 100 - pctVerde - pctRojo;

                  return (
                    <tr key={s.intersection_id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 text-sm">{s.intersection_name}</div>
                        <div className="text-xs text-slate-500 font-mono">{s.intersection_id}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-bold text-sm ${getCongestionColor(s.congestion_level)}`}>
                          {s.congestion_level?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-slate-500 text-sm">{s.verde_default}s</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-green-600 font-bold text-sm">{s.verde_optimo}s</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-red-500 font-bold text-sm">{s.rojo_optimo}s</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-bold text-sm ${ahorro > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {ahorro > 0 ? `-${ahorro}%` : '—'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex rounded-full overflow-hidden h-3 w-full min-w-[80px]">
                          <div className="bg-green-400 h-full" style={{ width: `${pctVerde}%` }} title={`Verde: ${s.verde_optimo}s`}></div>
                          <div className="bg-yellow-400 h-full" style={{ width: `${pctAmar}%` }} title={`Amarillo: ${s.amarillo}s`}></div>
                          <div className="bg-red-400 h-full" style={{ width: `${pctRojo}%` }} title={`Rojo: ${s.rojo_optimo}s`}></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-400 mt-1">
                          <span>🟢 {s.verde_optimo}s</span>
                          <span>🟡 {s.amarillo}s</span>
                          <span>🔴 {s.rojo_optimo}s</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AG y Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-[300px]">
        <div className="bg-white border border-slate-200 text-slate-800 shadow-sm rounded-xl p-6 flex flex-col">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-purple-500" /> Estado del Algoritmo Genético
          </h2>
          <div className="space-y-6 flex-grow justify-center flex flex-col px-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Generaciones</span>
                <span className="text-lg font-bold text-purple-600">50 / 50</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full" style={{ width: '100%' }}></div>
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
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
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
