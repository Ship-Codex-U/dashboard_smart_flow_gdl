import { GraduationCap, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">SmartFlow GDL: Sistema Inteligente de Tráfico Urbano</h1>
        <p className="text-slate-500 text-sm font-medium">Proyecto Modular Universitario</p>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        {/* Sección: Información General */}
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Información General</h2>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Columna Izquierda: Tarjetas */}
            <div className="flex flex-col gap-4 flex-grow">
              {/* Objetivo */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h3 className="text-slate-700 font-semibold">Objetivo del Proyecto</h3>
                </div>
                <p className="text-slate-600 text-sm flex-grow">
                  Diseñar e implementar un sistema inteligente distribuido que optimice el flujo vehicular utilizando Inteligencia Artificial y Algoritmos Genéticos.
                </p>
              </div>

              {/* Asesor */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  <h3 className="text-slate-700 font-semibold">Asesor del Proyecto</h3>
                </div>
                <p className="text-slate-800 font-medium">Mtro. Francisco Javier Quintanilla Moreno</p>
              </div>
            </div>

            {/* Columna Derecha: Logo */}
            <div className="hidden md:flex flex-col shrink-0 w-80 lg:w-96 bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <div className="flex-grow flex items-center justify-center p-2">
                <img src="/cucei-logo.png" alt="CUCEI Logo" className="w-full max-h-56 object-contain drop-shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Equipo */}
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Equipo de Desarrollo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "José Aron Covarrubias Castillo", role: "Ingeniería en Computación (INCO)" },
              { name: "Luis Gerardo Aceves Sepulveda", role: "Ingeniería Informática (INNI)" },
              { name: "Gustavo Hernández Martinez", role: "Ingeniería en Computación (INCO)" }
            ].map((member, idx) => {
              const initials = member.name.split(' ').slice(0, 2).map(n => n[0]).join('');

              return (
                <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col items-center text-center transition-all">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg mb-3">
                    {initials}
                  </div>
                  <p className="text-slate-800 font-semibold text-sm">{member.name}</p>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">{member.role}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
