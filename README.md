# Smart Flow GDL - Dashboard Ejecutivo

Smart Flow GDL es un **Dashboard Ejecutivo** diseñado para la monitorización, análisis y simulación del flujo de tráfico vehicular en puntos estratégicos y principales intersecciones de la ciudad de Guadalajara (GDL).

## 🚀 Características Principales

- **Simulación en Tiempo Real:** Visualización del estado del tráfico generado dinámicamente, con fluctuaciones aleatorias y posibilidad de inyectar eventos específicos (Ej: Horas pico, tormentas).
- **Mapa Interactivo:** Integración de mapas multicapa (OpenStreetMap, Satélite, Relieve) utilizando Leaflet, destacando intersecciones clave (La Minerva, López Mateos, Chapalita, etc.) con códigos de color basados en el nivel de congestión.
- **Indicadores Clave de Rendimiento (KPIs):**
  - Análisis de reducción de tiempos de espera frente a semáforos estáticos.
  - Flujo vehicular comparado contra históricos y promedios semanales.
  - Estimación de mitigación de emisiones de CO2.
- **Panel de Monitoreo:** Tabla en vivo detallando el estado exacto de cada intersección (velocidad promedio y cantidad de vehículos).

## 🛠️ Tecnologías y Stack

El proyecto es una aplicación web moderna construida bajo el ecosistema de React:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **UI & Estilos:** React 18 y [Tailwind CSS](https://tailwindcss.com/)
- **Mapas:** [Leaflet](https://leafletjs.com/) y `react-leaflet`
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Preparado para Tiempo Real:** `socket.io-client` para futuras conexiones a un backend de datos IoT reales.

## 💻 Implementación y Ejecución Local

Para ejecutar este proyecto en tu máquina local para desarrollo o pruebas:

### Prerrequisitos
- Node.js (v18.x o superior recomendado)
- NPM, Yarn o pnpm (el proyecto utiliza `pnpm-lock.yaml`, por lo que se sugiere `pnpm`)

### Instalación

1. Clona el repositorio o descarga el código fuente.
2. Navega al directorio del proyecto e instala las dependencias:

```bash
# Recomendado
pnpm install

# O alternativas:
npm install
# yarn install
```

### Ejecutar el Servidor de Desarrollo

Una vez instaladas las dependencias, inicia el servidor:

```bash
npm run dev
# o pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación. La página se recargará automáticamente al editar archivos como `src/app/page.tsx`.

## 🌐 Despliegue (Deployment)

El proyecto está construido sobre Next.js, por lo que la plataforma más sencilla y recomendada para su despliegue es **Vercel**, aunque es compatible con cualquier proveedor de hosting que soporte Node.js o contenedores Docker.

### Despliegue Rápido en Vercel
La forma más sencilla de desplegar tu aplicación Next.js es utilizar la [Plataforma de Vercel](https://vercel.com/new). 
1. Sube tu código a un repositorio de GitHub, GitLab o Bitbucket.
2. Importa el repositorio en Vercel.
3. Vercel detectará automáticamente que es una aplicación Next.js y configurará los comandos de compilación adecuados (`next build`).

### Despliegue Manual o Contenedores
Para desplegar manualmente en servidores propios (ej. AWS EC2, DigitalOcean, Azure):
1. Construye el proyecto para producción:
   ```bash
   npm run build
   ```
2. Inicia el servidor de producción:
   ```bash
   npm run start
   ```

Para más detalles, revisa la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying).
