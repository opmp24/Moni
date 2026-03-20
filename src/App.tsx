import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type Page = 'inicio' | 'historial' | 'agregar' | 'compromisos' | 'ajustes';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  type: 'gasto' | 'compromiso';
  paymentMethod: 'efectivo' | 'tarjeta' | 'banco';
  icon: string;
  priority?: 'critical' | 'normal' | 'low';
  dueDate?: string;
}

// --- Mock Data ---
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', name: 'Supermercado Central', amount: 142.50, category: 'Alimentación', date: 'Mar 18, 2026', type: 'gasto', paymentMethod: 'tarjeta', icon: 'shopping_bag' },
  { id: '2', name: 'Servicio de Electricidad', amount: 85.00, category: 'Servicios', date: 'Mar 15, 2026', type: 'compromiso', paymentMethod: 'banco', icon: 'electric_bolt', priority: 'critical', dueDate: 'En 2 días' },
  { id: '3', name: 'Cena Terraza Azul', amount: 62.30, category: 'Ocio', date: 'Mar 14, 2026', type: 'gasto', paymentMethod: 'efectivo', icon: 'restaurant' },
  { id: '4', name: 'Gimnasio Mensualidad', amount: 45.00, category: 'Salud', date: 'Mar 10, 2026', type: 'gasto', paymentMethod: 'tarjeta', icon: 'fitness_center' },
  { id: '5', name: 'Gasolinera Shell', amount: 55.00, category: 'Transporte', date: 'Mar 08, 2026', type: 'gasto', paymentMethod: 'banco', icon: 'directions_car' },
  { id: '6', name: 'Alquiler Loft', amount: 2100.00, category: 'Vivienda', date: 'Mar 01, 2026', type: 'compromiso', paymentMethod: 'banco', icon: 'home_work', priority: 'normal', dueDate: 'Vencido' },
];

const CATEGORIES = [
  { name: 'Vivienda', icon: 'home', color: 'text-primary', bcolor: 'bg-primary/10' },
  { name: 'Alimentación', icon: 'restaurant', color: 'text-secondary', bcolor: 'bg-secondary/10' },
  { name: 'Transporte', icon: 'directions_car', color: 'text-blue-400', bcolor: 'bg-blue-400/10' },
  { name: 'Ocio', icon: 'movie', color: 'text-tertiary', bcolor: 'bg-tertiary/10' },
  { name: 'Salud', icon: 'medical_services', color: 'text-error', bcolor: 'bg-error/10' },
  { name: 'Otros', icon: 'more_horiz', color: 'text-outline', bcolor: 'bg-outline/10' },
];

// --- Navigation Components ---

const Sidebar = ({ currentPage, setPage }: { currentPage: Page, setPage: (p: Page) => void }) => {
  const navItems: { id: Page, icon: string, label: string }[] = [
    { id: 'inicio', icon: 'home', label: 'Inicio' },
    { id: 'historial', icon: 'history', label: 'Historial' },
    { id: 'agregar', icon: 'add_circle', label: 'Agregar' },
    { id: 'compromisos', icon: 'handshake', label: 'Compromisos' },
    { id: 'ajustes', icon: 'settings', label: 'Ajustes' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-[#131315] border-r border-white/5 shadow-2xl shadow-purple-900/20 hidden lg:flex flex-col p-6 space-y-2 z-40">
      <div className="mb-8 text-left">
        <h1 className="text-xl font-black text-[#cdbdff] font-headline">Luminal Home</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Premium Management</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex items-center gap-3 w-full rounded-2xl px-4 py-3 font-medium text-sm transition-all ${
              currentPage === item.id 
                ? 'bg-[#7C4DFF]/10 text-[#cdbdff] border-l-4 border-[#7C4DFF]' 
                : 'text-slate-400 hover:bg-white/5 hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-6">
        <div className="bg-surface-container rounded-lg p-4 flex items-center gap-3 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-sm font-bold truncate text-on-surface">Alex Rivera</p>
            <p className="text-[10px] text-slate-500 truncate">Premium Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const BottomNav = ({ currentPage, setPage }: { currentPage: Page, setPage: (p: Page) => void }) => {
  const navItems: { id: Page, icon: string, label: string }[] = [
    { id: 'inicio', icon: 'home', label: 'Home' },
    { id: 'historial', icon: 'analytics', label: 'Historial' },
    { id: 'compromisos', icon: 'receipt_long', label: 'Fijos' },
    { id: 'ajustes', icon: 'account_balance_wallet', label: 'Ajustes' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-[#1c1c1e]/70 backdrop-blur-xl rounded-t-[32px] shadow-[0_-8px_40px_-12px_rgba(124,77,255,0.15)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setPage(item.id)}
          className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${
            currentPage === item.id 
              ? 'bg-[#7C4DFF]/10 text-[#cdbdff] rounded-2xl scale-110' 
              : 'text-slate-500 hover:text-[#cdbdff]'
          }`}
        >
          <span className={`material-symbols-outlined ${currentPage === item.id ? 'fill-1' : ''}`}>{item.icon}</span>
          <span className="font-['Manrope'] text-[8px] font-semibold uppercase tracking-widest mt-1">{item.label}</span>
        </button>
      ))}
      <button 
        onClick={() => setPage('agregar')}
        className="relative -top-6 w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(124,77,255,0.4)] active:scale-90 duration-200"
      >
        <span className="material-symbols-outlined text-on-primary text-4xl">add</span>
      </button>
    </nav>
  );
};

// --- Page Components ---

const Inicio = () => (
  <div className="px-8 pb-32 lg:pb-12 max-w-[1440px] mx-auto grid grid-cols-12 gap-6 pt-8 lg:pt-0">
    <div className="col-span-12 xl:col-span-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface-container rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[320px] shadow-[0_8px_32px_0_rgba(124,77,255,0.08)]">
          <div className="relative z-10 text-left">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Presupuesto Disponible</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold font-headline text-on-primary-container">$4,280.00</span>
              <span className="text-secondary text-sm font-bold flex items-center text-left">
                <span className="material-symbols-outlined text-xs">trending_up</span> 12%
              </span>
            </div>
          </div>
          <div className="absolute right-[-40px] top-[-20px] w-64 h-64 opacity-20">
            <svg className="w-full h-full transform rotate-[-90deg]" viewBox="0 0 100 100">
              <circle className="text-surface-container-highest" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-primary-container" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="60" strokeWidth="8"></circle>
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5 text-left">
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Total Planificado</p>
              <p className="text-xl font-bold font-headline">$12,500.00</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Días Restantes</p>
              <p className="text-xl font-bold font-headline">11 Días</p>
            </div>
          </div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
        </div>
        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between border border-white/5 text-left">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">Ahorro Mensual</p>
            <h3 className="text-2xl font-bold font-headline text-secondary">$1,450.00</h3>
          </div>
          <div className="mt-4 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-[85%] rounded-full shadow-[0_0_10px_rgba(2,201,83,0.5)]"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-surface-container rounded-3xl p-8 border border-white/5">
        <div className="flex justify-between items-end mb-10 text-left">
          <div>
            <h3 className="text-xl font-bold font-headline">Análisis de Ejecución</h3>
            <p className="text-sm text-on-surface-variant">Plan vs Gastado vs Compromisos</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-container"></div>
              <span className="text-xs text-on-surface-variant">Plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-tertiary"></div>
              <span className="text-xs text-on-surface-variant">Gastado</span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between h-48 gap-4 px-4">
          {[
            { label: 'Vivienda', p: 80, g: 65, c: 10 },
            { label: 'Ocio', p: 60, g: 75, c: 5 },
            { label: 'Servicios', p: 95, g: 40, c: 15 },
            { label: 'Auto', p: 70, g: 30, c: 40 },
            { label: 'Otros', p: 50, g: 45, c: 5 }
          ].map((item) => (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full flex justify-center gap-1 h-full items-end">
                <div className="w-4 bg-primary-container rounded-t-full opacity-80 group-hover:opacity-100 transition-all" style={{ height: `${item.p}%` }}></div>
                <div className="w-4 bg-tertiary rounded-t-full group-hover:opacity-100 transition-all" style={{ height: `${item.g}%` }}></div>
                <div className="w-4 bg-surface-container-highest rounded-t-full" style={{ height: `${item.c}%` }}></div>
              </div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="col-span-12 xl:col-span-4 space-y-6">
      <div className="bg-surface-container rounded-3xl p-6 border border-white/5 text-left">
        <h4 className="font-bold font-headline text-on-surface mb-8">Próximos Pagos</h4>
        <div className="space-y-6">
          <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-tertiary">
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm font-bold text-on-surface">Alquiler Loft</p>
              <span className="text-xs font-bold text-on-surface">$2,100</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">Vence en 2 días</p>
            <button className="w-full py-2 bg-surface-bright rounded-lg text-xs font-bold hover:bg-white/10 transition-colors text-on-surface">Pagar Ahora</button>
          </div>
          <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-primary">
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm font-bold text-on-surface">Internet Fibra</p>
              <span className="text-xs font-bold text-on-surface">$54.99</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">Vence en 5 días</p>
            <div className="px-2 py-1 bg-surface-container-highest rounded text-[10px] text-on-surface-variant inline-block">Auto-pago activado</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Historial = () => (
  <div className="px-8 pb-32 lg:pb-12 max-w-[1440px] mx-auto pt-8 lg:pt-0">
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-surface-container rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-6xl">trending_down</span>
        </div>
        <div className="z-10 text-left">
          <div className="text-xs font-bold uppercase tracking-widest text-outline mb-2">Total Mensual</div>
          <div className="text-4xl font-extrabold text-on-surface font-headline">-$3,450.00</div>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <span className="bg-tertiary-container/20 text-tertiary px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px]">arrow_upward</span> 12%
          </span>
          <span className="text-outline text-xs text-left">vs. mes anterior</span>
        </div>
      </div>
      <div className="bg-surface-container rounded-3xl p-8 flex flex-col justify-between border border-outline-variant/10 text-left">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-outline mb-2">Categoría Principal</div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">home_work</span>
            </div>
            <div className="text-2xl font-bold text-on-surface font-headline">Vivienda</div>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full w-[65%]"></div>
          </div>
          <div className="flex justify-between mt-2 text-xs font-bold text-outline">
            <span>$2,242.00</span>
            <span>65% del total</span>
          </div>
        </div>
      </div>
      <div className="bg-surface-container-high rounded-3xl p-8 flex flex-col justify-between border border-secondary-container/10 text-left">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-outline mb-2">Eficiencia</div>
          <div className="text-4xl font-extrabold text-secondary font-headline">88%</div>
        </div>
        <div className="mt-6">
          <p className="text-sm text-on-surface-variant leading-relaxed">Estás un <span className="text-secondary font-bold">5% por debajo</span> de tu presupuesto estimado.</p>
        </div>
      </div>
    </section>

    <section className="bg-surface-container-low rounded-3xl overflow-hidden shadow-2xl border border-white/5">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-container/50">
        <h2 className="text-xl font-headline font-bold text-on-surface">Transacciones Recientes</h2>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/5 rounded-full text-outline transition-colors">
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-widest text-outline bg-surface-container-lowest/50">
              <th className="px-8 py-4">Concepto</th>
              <th className="px-8 py-4">Categoría</th>
              <th className="px-8 py-4">Fecha</th>
              <th className="px-8 py-4 text-right">Monto</th>
              <th className="px-8 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {MOCK_TRANSACTIONS.map((t) => (
              <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors text-left">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">{t.icon}</span>
                    </div>
                    <div className="font-bold text-on-surface">{t.name}</div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant border border-white/5">{t.category}</span>
                </td>
                <td className="px-8 py-5 text-outline text-sm">{t.date}</td>
                <td className={`px-8 py-5 text-right font-headline font-bold ${t.type === 'gasto' ? 'text-tertiary' : 'text-primary'}`}>
                  -${t.amount.toFixed(2)}
                </td>
                <td className="px-8 py-5 text-center">
                  <button className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </div>
);

const AgregarGasto = ({ onBack }: { onBack: () => void }) => {
  const [method, setMethod] = useState<'efectivo' | 'tarjeta' | 'banco'>('tarjeta');
  
  return (
    <div className="px-6 pt-4 pb-32 max-w-2xl mx-auto w-full">
      <header className="flex justify-between items-center py-4 mb-4">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container-high text-on-surface hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h1 className="font-headline font-bold text-xl text-[#cdbdff]">Nuevo Gasto</h1>
        <div className="w-12"></div>
      </header>

      <section className="space-y-6 mb-10 text-left">
        <div className="relative group">
          <label className="block text-xs font-semibold uppercase tracking-widest text-outline mb-2 ml-1">Nombre</label>
          <input className="w-full bg-surface-container-lowest border-none rounded-2xl px-6 py-5 text-lg font-medium placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all" placeholder="Ej. Supermercado Mensual" type="text"/>
        </div>
        <div className="relative group">
          <label className="block text-xs font-semibold uppercase tracking-widest text-outline mb-2 ml-1">Monto</label>
          <div className="relative flex items-center">
            <span className="absolute left-6 text-2xl font-headline font-bold text-primary-fixed-dim">$</span>
            <input className="w-full bg-surface-container-lowest border-none rounded-2xl pl-12 pr-6 py-6 text-4xl font-headline font-extrabold text-on-surface placeholder:text-surface-container-highest focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all" placeholder="0.00" type="number"/>
          </div>
        </div>
      </section>

      <section className="mb-10 text-left">
        <label className="block text-xs font-semibold uppercase tracking-widest text-outline mb-4 ml-1">Método de pago</label>
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { id: 'efectivo', icon: 'payments', label: 'Efectivo' },
            { id: 'tarjeta', icon: 'credit_card', label: 'Tarjeta' },
            { id: 'banco', icon: 'account_balance', label: 'Banco' }
          ].map((m) => (
            <button 
              key={m.id}
              onClick={() => setMethod(m.id as any)}
              className={`flex flex-col items-center justify-center aspect-square rounded-2xl transition-all active:scale-95 ${
                method === m.id ? 'bg-primary-container text-on-primary-container shadow-xl' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined mb-2">{m.icon}</span>
              <span className="font-semibold text-[10px] uppercase tracking-tighter">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-12 text-left">
        <label className="block text-xs font-semibold uppercase tracking-widest text-outline mb-4 ml-1">Categoría</label>
        <div className="grid grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <button key={cat.name} className="group flex flex-col items-center justify-center aspect-square rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all active:scale-95 p-4 border-2 border-transparent hover:border-primary/10">
              <div className={`w-12 h-12 rounded-2xl ${cat.bcolor} flex items-center justify-center ${cat.color} mb-3 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined">{cat.icon}</span>
              </div>
              <span className="text-xs font-bold text-on-surface-variant group-hover:text-on-surface">{cat.name}</span>
            </button>
          ))}
          <button className="col-span-3 mt-2 flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-outline-variant hover:border-primary/40 hover:bg-primary/5 transition-all text-outline-variant hover:text-primary">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="font-bold text-sm">Añadir categoría</span>
          </button>
        </div>
      </section>

      <button className="w-full bg-gradient-to-br from-primary to-primary-container py-5 rounded-3xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
        <span className="material-symbols-outlined font-bold">check_circle</span>
        <span className="font-headline font-extrabold text-lg tracking-tight text-on-primary">Guardar</span>
      </button>
    </div>
  );
};

const Compromisos = () => (
  <div className="px-8 pb-32 lg:pb-12 max-w-[1440px] mx-auto pt-8 lg:pt-0">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 text-left">
      <div>
        <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block font-label">Resumen de Pagos Fijos</span>
        <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface mb-4">Compromisos</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-outline text-lg font-medium">$</span>
            <span className="text-4xl font-bold font-headline text-on-surface">12,450.00</span>
          </div>
          <div className="h-8 w-px bg-outline-variant/30"></div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-xs font-bold text-secondary tracking-tight">8 Pendientes</span>
            </div>
          </div>
        </div>
      </div>
      <button className="flex items-center gap-3 bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary-container/20">
        <span className="material-symbols-outlined">add_task</span>
        <span>Nuevo Compromiso</span>
      </button>
    </header>

    <div className="space-y-4">
      {MOCK_TRANSACTIONS.filter(t => t.type === 'compromiso').map((t) => (
        <div key={t.id} className={`bg-surface-container-low p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 ${t.priority === 'critical' ? 'border-tertiary' : 'border-primary'} transition-all hover:translate-x-1 border border-white/5`}>
          <div className="flex items-center gap-6 w-full md:w-auto text-left">
            <div className={`w-14 h-14 rounded-2xl ${t.priority === 'critical' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-3xl">{t.icon}</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-on-surface">{t.name}</h3>
              <div className="flex items-center gap-3 text-sm text-outline">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {t.date}</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">repeat</span> Mensual</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 text-right">
            <div>
              <div className={`text-2xl font-bold ${t.priority === 'critical' ? 'text-tertiary' : 'text-on-surface'}`}>${t.amount.toFixed(2)}</div>
              <div className={`text-xs font-bold uppercase tracking-widest ${t.priority === 'critical' ? 'text-tertiary/60' : 'text-outline'}`}>{t.dueDate}</div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 rounded-full hover:bg-white/5 text-outline"><span className="material-symbols-outlined">edit</span></button>
              <button className="px-6 py-2.5 rounded-full bg-surface-bright text-on-surface text-sm font-bold border border-outline-variant/20 hover:bg-white/5 transition-all">Pagar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Ajustes = () => (
  <div className="px-8 pb-32 lg:pb-12 max-w-2xl mx-auto pt-8 lg:pt-0 text-left">
    <h2 className="text-3xl font-black font-headline mb-8">Ajustes</h2>
    <div className="space-y-6">
      <section className="bg-surface-container rounded-3xl p-6 border border-white/5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-outline mb-6">Cuenta</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined text-3xl">person</span>
          </div>
          <div>
            <p className="font-bold text-lg text-on-surface">Alex Rivera</p>
            <p className="text-sm text-on-surface-variant">alex.rivera@gmail.com</p>
          </div>
        </div>
        <button className="w-full py-3 bg-error/10 text-error rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-error/20 transition-all">
          <span className="material-symbols-outlined">logout</span> Cerrar Sesión
        </button>
      </section>

      <section className="bg-surface-container rounded-3xl p-6 border border-white/5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-outline mb-6">Preferencias</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-bold text-on-surface">Moneda</p>
              <p className="text-xs text-on-surface-variant">CLP - Peso Chileno</p>
            </div>
            <span className="material-symbols-outlined text-outline">arrow_forward_ios</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-white/5">
            <div>
              <p className="font-bold text-on-surface">Tema Visual</p>
              <p className="text-xs text-on-surface-variant">Moderno (Oscuro)</p>
            </div>
            <span className="material-symbols-outlined text-outline">palette</span>
          </div>
        </div>
      </section>

      <section className="bg-surface-container rounded-3xl p-6 border border-white/5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-outline mb-6">Datos</h3>
        <button className="w-full py-4 px-6 mb-3 bg-surface-container-high rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all outline-none">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">upload_file</span>
            <span className="font-bold">Importar JSON/Excel</span>
          </div>
          <span className="material-symbols-outlined text-outline">add</span>
        </button>
        <button className="w-full py-4 px-6 bg-surface-container-high rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all outline-none">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">download</span>
            <span className="font-bold">Exportar Datos</span>
          </div>
          <span className="material-symbols-outlined text-outline">chevron_right</span>
        </button>
      </section>
    </div>
  </div>
);

// --- Main App ---

const App = () => {
  const [currentPage, setPage] = useState<Page>('inicio');

  return (
    <div className="flex min-h-screen bg-background text-on-background selection:bg-primary/30">
      <Sidebar currentPage={currentPage} setPage={setPage} />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto relative min-h-screen">
        <header className="lg:sticky top-0 z-30 bg-[#131315]/70 backdrop-blur-xl px-8 py-6 flex justify-between items-center max-w-[1440px] mx-auto">
          <div className="flex flex-col text-left">
            <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
              {currentPage === 'inicio' ? 'Panel de Control' : 
               currentPage === 'historial' ? 'Historial' :
               currentPage === 'agregar' ? 'Nuevo Gasto' :
               currentPage === 'compromisos' ? 'Compromisos' : 'Ajustes'}
            </h2>
            <p className="text-sm text-on-surface-variant">Marzo 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentPage === 'inicio' && <Inicio />}
            {currentPage === 'historial' && <Historial />}
            {currentPage === 'agregar' && <AgregarGasto onBack={() => setPage('inicio')} />}
            {currentPage === 'compromisos' && <Compromisos />}
            {currentPage === 'ajustes' && <Ajustes />}
          </motion.div>
        </AnimatePresence>

        <BottomNav currentPage={currentPage} setPage={setPage} />
      </main>
      
      {currentPage === 'inicio' && (
        <button 
          onClick={() => setPage('agregar')}
          className="fixed bottom-32 lg:bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-full shadow-2xl flex items-center justify-center text-on-primary hover:scale-110 active:scale-95 transition-all z-50 lg:flex hidden"
        >
          <span className="material-symbols-outlined text-2xl font-bold">add</span>
        </button>
      )}
    </div>
  );
};

export default App;
