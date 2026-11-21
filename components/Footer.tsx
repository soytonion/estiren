import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-steren-900 text-slate-300 text-xs mt-auto border-t border-steren-800">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <img
              src="/EstirenLogoWhite.png"
              alt="Logo Estiren"
              className="h-8 w-8 object-contain"
            />
            <div className="text-white font-black text-xl italic">
              Estiren<span className="text-sky-400">.</span>
            </div>
          </div>
          <p className="text-sky-100/80 text-[11px] leading-relaxed">
            Soluciones en electrónica, herramientas, cables, energía y componentes para
            todos tus proyectos en casa, escuela o industria.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-2 uppercase text-[11px] tracking-wider">
            Conoce nuestras sucursales:
          </h4>
          <ul className="space-y-1 text-sky-100/80 text-[11px]">
            <li>
              🏬 <b className="text-white">Sucursal Torreón</b> - Calle Falsa #123 Zona
              Centro, Torreón, Coah.
            </li>
            <li>
              🏬 <b className="text-white">Sucursal Villa Juárez</b> - Av. Collazo #1 Cd.
              Juárez, Dgo.
            </li>
            <li>
              🏬 <b className="text-white">Sucursal Lerdo</b> - Av. 6 de Abril #1818 Pte.
              Lerdo, Dgo.
            </li>
            <li>
              🏢 <b className="text-white">CEDIS Gómez Palacio</b> - En algún lugar de
              Gómez Palacio, Dgo...
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-2 uppercase text-[11px] tracking-wider">
            Soporte Técnico y Horarios
          </h4>
          <p className="text-[11px] text-sky-100/80 mb-2">
            Para dudas de instalación, garantías o cotizaciones por volumen, acude a
            cualquiera de nuestras sucursales.
          </p>
          <div className="bg-steren-800 p-2.5 rounded-lg border border-steren-800 text-[10px] text-sky-100">
            🕒 Lun a Sáb: 9:00 a 20:00 hrs • Dom: 10:00 a 16:00 hrs
          </div>
        </div>
      </div>

      <div className="bg-slate-950 text-slate-400 py-3 text-center text-[11px] border-t border-steren-800">
        © 2026 Estiren &amp; Aflojen Electronics S.A. de C.V. Todos los derechos
        reservados.
      </div>
    </footer>
  );
};
