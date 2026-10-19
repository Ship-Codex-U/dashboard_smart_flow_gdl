"use client";

import { useState, useEffect } from 'react';

export type CongestionLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type WeatherEvent = 'CLEAR' | 'STORM';
export type TrafficEvent = 'NORMAL' | 'RUSH_HOUR';

export interface IntersectionData {
  id: string;
  name: string;
  coords: [number, number];
  congestion: CongestionLevel;
  vehicles: number;
  speed: number;
  weather: string;
  is_peak_hour: boolean;
}

const INTERSECTION_CONFIG: Record<string, { name: string; coords: [number, number] }> = {
  'INT-001': { name: 'Av. Vallarta - Av. Yaquis',              coords: [20.6743,    -103.3937]    },
  'INT-002': { name: 'Av. López Mateos - Av. de las Américas', coords: [20.6963551, -103.3734237] },
  'INT-003': { name: 'Av. Guadalupe - San Ignacio',            coords: [20.6706347, -103.4050178] },
  'INT-004': { name: 'Av. Vallarta - Niños Héroes',            coords: [20.6668608, -103.3689243] },
  'INT-005': { name: 'Av. López Mateos Sur - Mariano Otero',   coords: [20.6475138, -103.4048619] },
};

const DEFAULT_NODES: IntersectionData[] = Object.entries(INTERSECTION_CONFIG).map(([id, config]) => ({
  id,
  name:         config.name,
  coords:       config.coords,
  congestion:   'LOW',
  vehicles:     0,
  speed:        50,
  weather:      'clear',
  is_peak_hour: false,
}));

// Crear cliente de Supabase solo en el browser.
// URL y anon key son valores PÚBLICOS por diseño (no son secretos:
// el acceso real lo controla RLS en la base de datos), pero deben
// apuntar al proyecto Supabase actual, no a uno viejo/migrado.
// Configurables por variable de entorno; si no están definidas se
// usa el proyecto activo (smartflow-gdl-v2) como valor por defecto.
function createSupabaseClient() {
  if (typeof window === 'undefined') return null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      || 'https://fejxijloxyxzdshgymvz.supabase.co';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlanhpamxveHl4emRzaGd5bXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNTAwNjUsImV4cCI6MjEwNzkyNjA2NX0.v1LRG8HeJ_UjwMHGzTfR8bYRCAmTlSFryXKxAOpCJT8';
    return createClient(url, key);
  } catch {
    return null;
  }
}

export function useTrafficSimulation() {
  const [nodes, setNodes]     = useState<IntersectionData[]>(DEFAULT_NODES);
  const [weather, setWeather] = useState<WeatherEvent>('CLEAR');
  const [traffic, setTraffic] = useState<TrafficEvent>('NORMAL');
  // Reduccion de espera EN VIVO: promedio real de las optimizaciones del
  // Algoritmo Genetico de los ultimos 5 minutos, calculado en la base de
  // datos (funcion kpi_reduccion_espera_vivo). Null mientras carga o si
  // no hay suficientes datos recientes.
  const [reduccionEsperaVivo, setReduccionEsperaVivo] = useState<number | null>(null);
  const [muestrasVivo, setMuestrasVivo]                = useState<number>(0);

  // Cargar datos iniciales y suscribirse a cambios
  useEffect(() => {
    const sb = createSupabaseClient();
    if (!sb) return;

    const fetchKpiVivo = async () => {
      try {
        const { data, error } = await sb.rpc('kpi_reduccion_espera_vivo', { minutos: 5 });
        if (!error && data && data[0] && data[0].mejora_pct !== null) {
          setReduccionEsperaVivo(Number(data[0].mejora_pct));
          setMuestrasVivo(Number(data[0].muestras));
        }
      } catch (err) {
        console.error('Error fetching KPI en vivo:', err);
      }
    };

    fetchKpiVivo();
    const kpiInterval = setInterval(fetchKpiVivo, 15000); // refresca cada 15s

    // Cargar ultimas lecturas
    const fetchLatest = async () => {
      try {
        for (const id of Object.keys(INTERSECTION_CONFIG)) {
          const { data, error } = await sb
            .from('traffic_readings')
            .select('vehicles_count, avg_speed_kmh, congestion_level, weather, is_peak_hour')
            .eq('intersection_id', id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

          if (!error && data) {
            setNodes(prev => prev.map(node =>
              node.id === id
                ? {
                    ...node,
                    vehicles:     data.vehicles_count,
                    speed:        Math.round(data.avg_speed_kmh),
                    congestion:   data.congestion_level.toUpperCase() as CongestionLevel,
                    weather:      data.weather,
                    is_peak_hour: data.is_peak_hour,
                  }
                : node
            ));
          }
        }
      } catch (err) {
        console.error('Error fetching readings:', err);
      }
    };

    fetchLatest();

    // Suscribirse a cambios en tiempo real
    const channel = sb
      .channel('traffic_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'traffic_readings' },
        (payload: any) => {
          const row = payload.new;
          const id  = row.intersection_id;
          if (!INTERSECTION_CONFIG[id]) return;

          setNodes(prev => prev.map(node =>
            node.id === id
              ? {
                  ...node,
                  vehicles:     row.vehicles_count,
                  speed:        Math.round(row.avg_speed_kmh),
                  congestion:   row.congestion_level.toUpperCase() as CongestionLevel,
                  weather:      row.weather,
                  is_peak_hour: row.is_peak_hour,
                }
              : node
          ));
        }
      )
      .subscribe();

    return () => {
      clearInterval(kpiInterval);
      sb.removeChannel(channel);
    };
  }, []);

  const triggerWeather = (event: WeatherEvent) => setWeather(event);
  const triggerTraffic = (event: TrafficEvent) => setTraffic(event);

  return {
    nodes, weather, traffic, triggerWeather, triggerTraffic,
    reduccionEsperaVivo, muestrasVivo,
  };
}
