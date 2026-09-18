"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────
// CLIENTE SUPABASE
// ─────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ipcunenaytijdproskxf.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_KEY || 'sb_publishable_tUdmn3h_fIx9zERQweNTyA_HYqThsb4'
);

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

// ─────────────────────────────────────────────────────────────
// CONFIGURACION DE INTERSECCIONES
// Coordenadas verificadas en Google Maps Street View
// ─────────────────────────────────────────────────────────────
const INTERSECTION_CONFIG: Record<string, { name: string; coords: [number, number] }> = {
  'INT-001': { name: 'Av. Vallarta - Av. Yaquis',              coords: [20.6743,    -103.3937]    },
  'INT-002': { name: 'Av. López Mateos - Av. de las Américas', coords: [20.6963551, -103.3734237] },
  'INT-003': { name: 'Av. Guadalupe - San Ignacio',            coords: [20.6706347, -103.4050178] },
  'INT-004': { name: 'Av. Vallarta - Niños Héroes',            coords: [20.6668608, -103.3689243] },
  'INT-005': { name: 'Av. López Mateos Sur - Mariano Otero',   coords: [20.6475138, -103.4048619] },
};

const DEFAULT_NODES: IntersectionData[] = Object.entries(INTERSECTION_CONFIG).map(([id, config]) => ({
  id,
  name:        config.name,
  coords:      config.coords,
  congestion:  'LOW',
  vehicles:    0,
  speed:       50,
  weather:     'clear',
  is_peak_hour: false,
}));


// ─────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────
export function useTrafficSimulation() {
  const [nodes, setNodes]   = useState<IntersectionData[]>(DEFAULT_NODES);
  const [weather, setWeather] = useState<WeatherEvent>('CLEAR');
  const [traffic, setTraffic] = useState<TrafficEvent>('NORMAL');

  // ── Cargar ultimas lecturas de cada interseccion ────────────
  const fetchLatestReadings = async () => {
    try {
      const updates: Record<string, Partial<IntersectionData>> = {};

      for (const id of Object.keys(INTERSECTION_CONFIG)) {
        const { data, error } = await supabase
          .from('traffic_readings')
          .select('vehicles_count, avg_speed_kmh, congestion_level, weather, is_peak_hour')
          .eq('intersection_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          updates[id] = {
            vehicles:     data.vehicles_count,
            speed:        Math.round(data.avg_speed_kmh),
            congestion:   data.congestion_level.toUpperCase() as CongestionLevel,
            weather:      data.weather,
            is_peak_hour: data.is_peak_hour,
          };
        }
      }

      setNodes(prev => prev.map(node => ({
        ...node,
        ...(updates[node.id] || {}),
      })));

    } catch (err) {
      console.error('Error fetching readings:', err);
    }
  };

  // ── Carga inicial ───────────────────────────────────────────
  useEffect(() => {
    fetchLatestReadings();
  }, []);

  // ── Suscripcion en tiempo real con Supabase Realtime ────────
  useEffect(() => {
    const channel = supabase
      .channel('traffic_readings_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'traffic_readings' },
        (payload) => {
          const row = payload.new as any;
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
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Eventos del laboratorio (simulacion manual) ─────────────
  const triggerWeather = (event: WeatherEvent) => setWeather(event);
  const triggerTraffic = (event: TrafficEvent) => setTraffic(event);

  return { nodes, weather, traffic, triggerWeather, triggerTraffic };
}
