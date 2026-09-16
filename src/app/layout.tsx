import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { LayoutDashboard, Users, Search, User, Activity, Server } from "lucide-react";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SmartFlow GDL",
  description: "Sistema Inteligente de Tráfico Urbano",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen bg-slate-100">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-900 text-white flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
              <Activity className="w-6 h-6 text-blue-500 mr-2" />
              <span className="text-lg font-bold">SmartFlow GDL</span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              <Link href="/" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              <Link href="/technical" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                <Server className="w-5 h-5 mr-3" />
                Técnico
              </Link>
              <Link href="/laboratory" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                <Activity className="w-5 h-5 mr-3" />
                Laboratorio
              </Link>
            </nav>

            <div className="p-4 border-t border-slate-800">
              <Link href="/about" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                <Users className="w-5 h-5 mr-3" />
                Acerca de
              </Link>
            </div>
          </aside>

          {/* Columna Principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navbar (Header) */}
            <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 shrink-0">
              {/* Fake Search */}
              <div className="flex items-center bg-slate-100 px-3 py-2 rounded-md w-96">
                <Search className="w-5 h-5 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-slate-600"
                />
              </div>
              {/* User Profile */}
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors">
                <User className="w-5 h-5 text-slate-600" />
              </div>
            </header>

            {/* Main Content con scroll */}
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
