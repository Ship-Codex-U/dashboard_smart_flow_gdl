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

// Crear cliente de Supabase solo en el browser
function createSupabaseClient() {
  if (typeof window === 'undefined') return null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(
      'https://ipcunenaytijdproskxf.supabase.co',
      'sb_publishable_tUdmn3h_fIx9zERQweNTyA_HYqThsb4'
    );
  } catch {
    return null;
  }
}

export function useTrafficSimulation() {
  const [nodes, setNodes]     = useState<IntersectionData[]>(DEFAULT_NODES);
  const [weather, setWeather] = useState<WeatherEvent>('CLEAR');
  const [traffic, setTraffic] = useState<TrafficEvent>('NORMAL');

  // Cargar datos iniciales y suscribirse a cambios
  useEffect(() => {
    const sb = createSupabaseClient();
    if (!sb) return;

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
      sb.removeChannel(channel);
    };
  }, []);

  const triggerWeather = (event: WeatherEvent) => setWeather(event);
  const triggerTraffic = (event: TrafficEvent) => setTraffic(event);

  return { nodes, weather, traffic, triggerWeather, triggerTraffic };
}
