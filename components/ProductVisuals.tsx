"use client";

import React from "react";

export type PhotoAngle = "front" | "detail" | "box" | "specs";

export interface ProductPhotoMeta {
  angle: PhotoAngle;
  label: string;
  caption: string;
}

export const PRODUCT_PHOTOS_META: ProductPhotoMeta[] = [
  {
    angle: "front",
    label: "Vista Principal",
    caption: "Fotografía de estudio del artículo",
  },
  {
    angle: "detail",
    label: "Detalle en Uso",
    caption: "Acercamiento de conectores y funcionamiento real",
  },
  {
    angle: "box",
    label: "Empaque Estiren",
    caption: "Presentación en blíster oficial de tienda",
  },
  {
    angle: "specs",
    label: "Dimensiones y Plano",
    caption: "Diagrama técnico de medidas y especificaciones",
  },
];

interface ProductPhotoRenderProps {
  sku: string;
  angle?: PhotoAngle;
  className?: string;
}

/**
 * Renderiza la ilustración fotográfica de estudio de cada producto según el ángulo seleccionado
 */
export const ProductPhotoRender: React.FC<ProductPhotoRenderProps> = ({
  sku,
  angle = "front",
  className = "w-full h-full",
}) => {
  // Si el ángulo es "box", renderizamos el empaque blíster oficial de Estiren con el artículo adentro
  if (angle === "box") {
    return (
      <svg viewBox="0 0 320 320" className={className} fill="none">
        <defs>
          <linearGradient id="blisterBg" x1="0" y1="0" x2="320" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="sterenHeader" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#005697" />
            <stop offset="100%" stopColor="#003e6d" />
          </linearGradient>
        </defs>
        <rect width="320" height="320" rx="16" fill="url(#blisterBg)" />
        {/* Cartón del blíster */}
        <rect x="55" y="22" width="210" height="276" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
        {/* Cabecera Azul Estiren */}
        <path d="M55 36C55 28.268 61.268 22 69 22H251C258.732 22 265 28.268 265 36V88H55V36Z" fill="url(#sterenHeader)" />
        {/* Orificio para colgar en gancho de tienda */}
        <rect x="135" y="32" width="50" height="12" rx="6" fill="#e2e8f0" />
        {/* Texto de marca en el empaque */}
        <text x="72" y="68" fill="#ffffff" fontSize="22" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">
          Estiren.
        </text>
        <rect x="190" y="52" width="62" height="20" rx="4" fill="#fbbf24" />
        <text x="221" y="66" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="900" fontFamily="monospace">
          {sku}
        </text>
        {/* Franja amarilla inferior del header */}
        <rect x="55" y="84" width="210" height="5" fill="#fbbf24" />

        {/* Burbuja de plástico transparente con el producto miniatura adentro */}
        <rect x="75" y="102" width="170" height="135" rx="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
        <g transform="translate(88, 108) scale(0.45)">
          <CoreProductArtwork sku={sku} angle="front" />
        </g>
        {/* Brillo del plástico del blíster */}
        <path d="M82 108L125 108L90 230L82 230Z" fill="#ffffff" fillOpacity="0.45" />

        {/* Pie del empaque con código de barras */}
        <text x="160" y="254" textAnchor="middle" fill="#005697" fontSize="10" fontWeight="800" fontFamily="sans-serif">
          GARANTÍA DE 30 MINUTOS EN TIENDA
        </text>
        {/* Código de barras */}
        <g transform="translate(95, 262)">
          {[0, 6, 10, 18, 22, 28, 36, 40, 46, 54, 60, 64, 72, 78, 84, 90, 96, 104, 108, 114, 122, 126].map((x, i) => (
            <rect key={i} x={x} y="0" width={i % 3 === 0 ? "4" : "2"} height="20" fill="#1e293b" />
          ))}
          <text x="65" y="29" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">
            7 501234 567890
          </text>
        </g>
      </svg>
    );
  }

  // Si el ángulo es "specs", renderizamos el plano técnico acotado estilo ingeniería
  if (angle === "specs") {
    return (
      <svg viewBox="0 0 320 320" className={className} fill="none">
        <rect width="320" height="320" rx="16" fill="#0f172a" />
        {/* Cuadrícula de plano blueprint */}
        <g stroke="#1e293b" strokeWidth="1">
          {[40, 80, 120, 160, 200, 240, 280].map((pos) => (
            <React.Fragment key={pos}>
              <line x1={pos} y1="0" x2={pos} y2="320" />
              <line x1="0" y1={pos} x2="320" y2={pos} />
            </React.Fragment>
          ))}
        </g>
        {/* Marco técnico */}
        <rect x="14" y="14" width="292" height="292" rx="8" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="26" y="34" fill="#38bdf8" fontSize="10" fontWeight="700" fontFamily="monospace">
          PLANO TÉCNICO ESTIREN • MODELO: {sku}
        </text>
        <line x1="14" y1="42" x2="306" y2="42" stroke="#38bdf8" strokeWidth="1" />

        {/* Silueta central del producto */}
        <g transform="translate(72, 54) scale(0.55)" opacity="0.92">
          <CoreProductArtwork sku={sku} angle="front" />
        </g>

        {/* Líneas de cotas dimensionales */}
        <line x1="65" y1="232" x2="255" y2="232" stroke="#fbbf24" strokeWidth="1.5" />
        <line x1="65" y1="226" x2="65" y2="238" stroke="#fbbf24" strokeWidth="1.5" />
        <line x1="255" y1="226" x2="255" y2="238" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="160" y="245" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="700" fontFamily="monospace">
          ◄ ANCHO NOMINAL: 142.5 mm (±5 cm) ►
        </text>

        {/* Cajetín de especificaciones inferior */}
        <rect x="24" y="256" width="272" height="40" rx="6" fill="#1e293b" stroke="#334155" />
        <text x="34" y="272" fill="#e2e8f0" fontSize="9" fontFamily="monospace">
          TENSIÓN: 5V - 127V~ (según suerte) | TOLERANCIA: ±25%
        </text>
        <text x="34" y="287" fill="#38bdf8" fontSize="9" fontWeight="700" fontFamily="monospace">
          CERTIFICACIÓN: NOM-ESTIREN-LAGUNA-2026 • APROBADO
        </text>
      </svg>
    );
  }

  return <CoreProductArtwork sku={sku} angle={angle} className={className} />;
};

const CoreProductArtwork: React.FC<{
  sku: string;
  angle: PhotoAngle;
  className?: string;
}> = ({ sku, angle, className = "w-full h-full" }) => {
  switch (sku) {
    // =========================================================================
    // 1. BATERÍA CUADRADA 9V SABOR LIMÓN ÁCIDO (BAT-9V-LEMON)
    // =========================================================================
    case "BAT-9V-LEMON":
      return (
        <svg viewBox="0 0 320 320" className={className} fill="none">
          <defs>
            <radialGradient id="bgLemon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fefce8" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </radialGradient>
            <linearGradient id="batBody" x1="90" y1="80" x2="230" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="55%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>
          <rect width="320" height="320" rx="16" fill="url(#bgLemon)" />
          {/* Sombra de piso */}
          <ellipse cx="160" cy="276" rx="72" ry="12" fill="#cbd5e1" />

          {/* Terminales metálicos de 9V (+ y -) */}
          <rect x="122" y="54" width="22" height="22" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <rect x="118" y="48" width="30" height="8" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <polygon points="172,76 178,50 202,50 208,76" fill="#94a3b8" stroke="#475569" strokeWidth="2" />

          {/* Cuerpo prismático de la batería 9V */}
          <rect x="95" y="74" width="130" height="192" rx="14" fill="url(#batBody)" stroke="#1e293b" strokeWidth="3" />
          {/* Franja superior negra/azul */}
          <path d="M95 88C95 80.268 101.268 74 109 74H211C218.732 74 225 80.268 225 88V122H95V88Z" fill="#005697" />
          <text x="160" y="102" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">
            Estiren
          </text>
          <text x="160" y="116" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="800" fontFamily="monospace">
            ALCALINA • 9 VOLTS
          </text>

          {/* Símbolos + y - */}
          <circle cx="133" cy="140" r="10" fill="#ef4444" />
          <text x="133" y="145" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">+</text>
          <circle cx="190" cy="140" r="10" fill="#1e293b" />
          <text x="190" y="144" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900">-</text>

          {/* Ilustración de rodaja de limón en la etiqueta */}
          <circle cx="160" cy="190" r="32" fill="#fef08a" stroke="#15803d" strokeWidth="4" />
          <circle cx="160" cy="190" r="24" fill="#fde047" />
          <line x1="160" y1="166" x2="160" y2="214" stroke="#fefce8" strokeWidth="2" />
          <line x1="136" y1="190" x2="184" y2="190" stroke="#fefce8" strokeWidth="2" />
          <line x1="143" y1="173" x2="177" y2="207" stroke="#fefce8" strokeWidth="2" />
          <line x1="177" y1="173" x2="143" y2="207" stroke="#fefce8" strokeWidth="2" />

          <rect x="107" y="232" width="106" height="20" rx="5" fill="#14532d" />
          <text x="160" y="245" textAnchor="middle" fill="#bbf7d0" fontSize="10" fontWeight="800" fontFamily="sans-serif">
            SABOR LIMÓN ÁCIDO
          </text>

          {angle === "detail" && (
            <g>
              {/* Chispas de acidez y prueba en los polos */}
              <path d="M133 44L142 22L155 38L168 18L178 40L192 26" stroke="#eab308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="55" y="18" width="210" height="24" rx="12" fill="#0f172a" />
              <text x="160" y="34" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                ⚡ PRUEBA DE LENGUA: COSQUILLEO CÍTRICO 9.2V
              </text>
            </g>
          )}
        </svg>
      );

    // =========================================================================
    // 2. CAUTÍN 60W CON MANGO CALEFACTABLE INVOLUNTARIO (EST-4020)
    // =========================================================================
    case "EST-4020":
      return (
        <svg viewBox="0 0 320 320" className={className} fill="none">
          <rect width="320" height="320" rx="16" fill="#f8fafc" />
          <ellipse cx="160" cy="278" rx="95" ry="12" fill="#e2e8f0" />

          {/* Cable de alimentación */}
          <path d="M45 260C20 230 40 190 78 205" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />

          {/* Cuerpo del cautín en diagonal */}
          <g transform="rotate(-32 160 160)">
            {/* Mango azul/naranja */}
            <rect x="50" y="142" width="120" height="36" rx="16" fill={angle === "detail" ? "#ef4444" : "#005697"} stroke="#1e293b" strokeWidth="3" />
            <rect x="65" y="149" width="75" height="10" rx="5" fill="#ffffff" fillOpacity="0.25" />
            <text x="108" y="165" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900" fontFamily="sans-serif">
              ESTIREN 60W
            </text>
            {/* Tope guardamano */}
            <rect x="166" y="134" width="12" height="52" rx="4" fill="#334155" stroke="#0f172a" strokeWidth="2" />
            {/* Tubo metálico calefactor */}
            <rect x="178" y="148" width="68" height="24" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
            <circle cx="195" cy="160" r="3" fill="#475569" />
            <circle cx="215" cy="160" r="3" fill="#475569" />
            <circle cx="235" cy="160" r="3" fill="#475569" />
            {/* Punta cónica al rojo vivo */}
            <polygon points="246,150 296,160 246,170" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
          </g>

          {/* Ondas de calor en punta y mango */}
          <path d="M245 70C240 55 255 50 250 35" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M265 82C260 67 275 62 270 47" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />

          {angle === "detail" && (
            <g>
              {/* Termómetro indicando que el mango quema igual que la punta */}
              <path d="M95 160C90 140 105 135 100 115" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              <path d="M115 150C110 130 125 125 120 105" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              <rect x="42" y="24" width="236" height="28" rx="8" fill="#7f1d1d" />
              <text x="160" y="42" textAnchor="middle" fill="#fecaca" fontSize="10" fontWeight="800" fontFamily="monospace">
                🔥 PUNTA: 420°C | MANGO DE PLÁSTICO: 395°C
              </text>
            </g>
          )}
        </svg>
      );

    // =========================================================================
    // 3. ADAPTADOR VGA A MANGUERA DE JARDÍN 1/2" (CAB-VGA-HOSE)
    // =========================================================================
    case "CAB-VGA-HOSE":
      return (
        <svg viewBox="0 0 320 320" className={className} fill="none">
          <rect width="320" height="320" rx="16" fill="#f0f9ff" />
          <ellipse cx="160" cy="276" rx="90" ry="12" fill="#bae6fd" />

          {/* Conector VGA Azul (Lado Izquierdo) */}
          <rect x="36" y="116" width="82" height="88" rx="10" fill="#005697" stroke="#1e293b" strokeWidth="3" />
          {/* Tornillos laterales del VGA */}
          <rect x="22" y="124" width="16" height="12" rx="3" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
          <rect x="22" y="184" width="16" height="12" rx="3" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
          {/* Trapecio metálico de 15 pines */}
          <polygon points="50,136 104,142 104,178 50,184" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
          {[148, 160, 172].map((y) =>
            [60, 70, 80, 90, 98].map((x) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#1e293b" />
            ))
          )}
          <text x="77" y="200" textAnchor="middle" fill="#bfdbfe" fontSize="8" fontWeight="800" fontFamily="monospace">
            VGA 15-PIN
          </text>

          {/* Cable puente central */}
          <rect x="118" y="144" width="52" height="32" fill="#1e293b" />
          <line x1="130" y1="144" x2="130" y2="176" stroke="#475569" strokeWidth="3" />
          <line x1="144" y1="144" x2="144" y2="176" stroke="#475569" strokeWidth="3" />
          <line x1="158" y1="144" x2="158" y2="176" stroke="#475569" strokeWidth="3" />

          {/* Cople de Latón y Manguera Verde de 1/2" (Lado Derecho) */}
          <rect x="170" y="126" width="38" height="68" rx="4" fill="#eab308" stroke="#854d0e" strokeWidth="3" />
          {/* Roscas de latón */}
          <line x1="180" y1="126" x2="180" y2="194" stroke="#a16207" strokeWidth="3" />
          <line x1="190" y1="126" x2="190" y2="194" stroke="#a16207" strokeWidth="3" />
          <line x1="200" y1="126" x2="200" y2="194" stroke="#a16207" strokeWidth="3" />
          {/* Tramo de manguera verde */}
          <rect x="208" y="134" width="64" height="52" rx="4" fill="#16a34a" stroke="#14532d" strokeWidth="3" />
          <text x="240" y="164" textAnchor="middle" fill="#dcfce7" fontSize="9" fontWeight="900" fontFamily="monospace">
            1/2&quot; NPT
          </text>

          {angle === "detail" && (
            <g>
              {/* Chorro de agua con pixeles RGB saliendo de la manguera */}
              <path d="M274 148C292 142 304 130 314 118" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
              <path d="M274 160C295 160 306 162 316 165" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />
              <path d="M274 172C292 180 304 192 312 206" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
              <rect x="44" y="28" width="232" height="26" rx="8" fill="#0369a1" />
              <text x="160" y="45" textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="800" fontFamily="monospace">
                🚿 RESOLUCIÓN: 1080p HIDRÁULICOS A 60 PSI
              </text>
            </g>
          )}
        </svg>
      );

    // =========================================================================
    // 4. MULTÍMETRO PARA MEDIR LA FE DE TUS CIRCUITOS (MUL-FE-900)
    // =========================================================================
    case "MUL-FE-900":
      return (
        <svg viewBox="0 0 320 320" className={className} fill="none">
          <rect width="320" height="320" rx="16" fill="#f8fafc" />
          <ellipse cx="160" cy="284" rx="75" ry="10" fill="#cbd5e1" />

          {/* Carcasa Amarilla Protectora y Cuerpo del Multímetro */}
          <rect x="92" y="36" width="136" height="236" rx="18" fill="#eab308" stroke="#854d0e" strokeWidth="3" />
          <rect x="100" y="44" width="120" height="220" rx="12" fill="#1e293b" />

          {/* Pantalla LCD */}
          <rect x="112" y="56" width="96" height="52" rx="6" fill="#84cc16" stroke="#3f6212" strokeWidth="3" />
          <text x="200" y="88" textAnchor="end" fill="#1a2e05" fontSize="22" fontWeight="900" fontFamily="monospace">
            {angle === "detail" ? "AMÉN" : "99.8%"}
          </text>
          <text x="118" y="69" fill="#365314" fontSize="8" fontWeight="800" fontFamily="monospace">
            NIVEL DE FE DC
          </text>

          {/* Perilla selectora rotativa */}
          <circle cx="160" cy="164" r="38" fill="#334155" stroke="#64748b" strokeWidth="2" />
          <circle cx="160" cy="164" r="28" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <line x1="160" y1="164" x2="180" y2="144" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
          <text x="160" y="120" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="700" fontFamily="monospace">
            MILAGRO Ω
          </text>

          {/* Conectores inferiores (COM, VΩ, 10A) */}
          <circle cx="126" cy="236" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          <circle cx="160" cy="236" r="10" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
          <circle cx="194" cy="236" r="10" fill="#eab308" stroke="#ffffff" strokeWidth="2" />

          {/* Puntas de prueba */}
          <line x1="56" y1="90" x2="56" y2="210" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
          <line x1="56" y1="70" x2="56" y2="90" stroke="#94a3b8" strokeWidth="3" />
          <line x1="264" y1="90" x2="264" y2="210" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          <line x1="264" y1="70" x2="264" y2="90" stroke="#94a3b8" strokeWidth="3" />
        </svg>
      );

    // =========================================================================
    // 5. ARDUINO UNO QUE SOLO PARPADEA EL PIN 13 (ARD-BLINK-13)
    // =========================================================================
    case "ARD-BLINK-13":
      return (
        <svg viewBox="0 0 320 320" className={className} fill="none">
          <rect width="320" height="320" rx="16" fill="#f0fdfa" />
          <ellipse cx="160" cy="268" rx="95" ry="12" fill="#ccfbf1" />

          {/* Placa PCB Azul Turquesa */}
          <rect x="46" y="76" width="228" height="164" rx="10" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />
          {/* Puerto USB tipo B plateado */}
          <rect x="30" y="96" width="36" height="42" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          {/* Jack de alimentación negro */}
          <rect x="34" y="180" width="38" height="36" rx="4" fill="#0f172a" />

          {/* Headers de pines superiores e inferiores */}
          <rect x="86" y="84" width="168" height="14" fill="#0f172a" />
          <rect x="86" y="218" width="168" height="14" fill="#0f172a" />
          {[96, 110, 124, 138, 152, 166, 180, 194, 208, 222, 236].map((x) => (
            <React.Fragment key={x}>
              <rect x={x} y="88" width="6" height="6" fill="#fbbf24" />
              <rect x={x} y="222" width="6" height="6" fill="#fbbf24" />
            </React.Fragment>
          ))}

          {/* Microcontrolador ATmega DIP-28 */}
          <rect x="114" y="156" width="126" height="38" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          <text x="177" y="179" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700" fontFamily="monospace">
            ATMEGA-BLINK-ONLY
          </text>

          {/* LED del Pin 13 brillando intensamente */}
          <circle cx="142" cy="118" r="14" fill="#fde047" fillOpacity="0.45" />
          <circle cx="142" cy="118" r="7" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <text x="164" y="122" fill="#ffffff" fontSize="10" fontWeight="900" fontFamily="monospace">
            PIN 13 (ON)
          </text>

          <text x="218" y="142" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">
            ESTIREN UNO
          </text>

          {angle === "detail" && (
            <g>
              <rect x="42" y="26" width="236" height="28" rx="8" fill="#0f172a" />
              <text x="160" y="44" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700" fontFamily="monospace">
                💡 MEMORIA ROM BLOQUEADA CON BLINK.INO
              </text>
            </g>
          )}
        </svg>
      );

    // =========================================================================
    // 6. CABLE USB-C A CONTACTO BIFÁSICO PELADO (CAB-USB-PELADO)
    // =========================================================================
    case "CAB-USB-PELADO":
      return (
        <svg viewBox="0 0 320 320" className={className} fill="none">
          <rect width="320" height="320" rx="16" fill="#fff7ed" />
          <ellipse cx="160" cy="276" rx="90" ry="10" fill="#fed7aa" />

          {/* Clavija doméstica de 127V (Izquierda) */}
          <rect x="28" y="132" width="26" height="10" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <rect x="28" y="178" width="26" height="10" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <rect x="52" y="118" width="54" height="84" rx="10" fill="#1e293b" />
          <text x="79" y="164" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="900" fontFamily="monospace">
            127V~
          </text>

          {/* Empalme con cinta de aislar y cables de cobre pelados */}
          <path d="M106 145C135 130 155 130 185 152" stroke="#dc2626" strokeWidth="6" fill="none" />
          <path d="M106 175C135 190 155 190 185 168" stroke="#16a34a" strokeWidth="6" fill="none" />
          {/* Cobre pelado brillante */}
          <path d="M142 136L162 142" stroke="#f59e0b" strokeWidth="4" />
          <path d="M142 184L162 178" stroke="#f59e0b" strokeWidth="4" />
          {/* Chispas eléctricas en el empalme */}
          <polygon points="154,112 146,130 158,130 150,148 168,126 156,126" fill="#eab308" />

          {/* Conector USB-C (Derecha) */}
          <rect x="185" y="138" width="66" height="44" rx="8" fill="#005697" stroke="#1e293b" strokeWidth="3" />
          <text x="218" y="164" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900" fontFamily="monospace">
            USB-C
          </text>
          <rect x="251" y="148" width="28" height="24" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />

          {angle === "detail" && (
            <g>
              <rect x="36" y="28" width="248" height="28" rx="8" fill="#991b1b" />
              <text x="160" y="46" textAnchor="middle" fill="#fef08a" fontSize="10" fontWeight="800" fontFamily="monospace">
                ⚡ CARGA DEL 0% AL 100% EN 0.02 SEGUNDOS
              </text>
            </g>
          )}
        </svg>
      );

    // =========================================================================
    // 7. EXTRACTOR DE HUMO MÁGICO DE CIRCUITOS (PROT-HUMO-300)
    // =========================================================================
    case "PROT-HUMO-300":
      return (
        <svg viewBox="0 0 320 320" className={className} fill="none">
          <rect width="320" height="320" rx="16" fill="#f8fafc" />
          <ellipse cx="160" cy="278" rx="80" ry="12" fill="#cbd5e1" />

          {/* Base de escritorio */}
          <rect x="104" y="246" width="112" height="22" rx="6" fill="#1e293b" />
          <rect x="148" y="218" width="24" height="32" fill="#334155" />

          {/* Carcasa cuadrada del ventilador extractor */}
          <rect x="84" y="64" width="152" height="152" rx="18" fill="#005697" stroke="#0f172a" strokeWidth="4" />
          <circle cx="160" cy="140" r="60" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />

          {/* Aspas del ventilador */}
          <g transform={angle === "detail" ? "rotate(45 160 140)" : ""}>
            <ellipse cx="160" cy="102" rx="16" ry="26" fill="#475569" />
            <ellipse cx="160" cy="178" rx="16" ry="26" fill="#475569" />
            <ellipse cx="122" cy="140" rx="26" ry="16" fill="#475569" />
            <ellipse cx="198" cy="140" rx="26" ry="16" fill="#475569" />
          </g>
          <circle cx="160" cy="140" r="18" fill="#fbbf24" stroke="#0f172a" strokeWidth="3" />

          {/* Nubes de humo mágico violeta/gris siendo absorbidas */}
          <circle cx="62" cy="112" r="16" fill="#94a3b8" fillOpacity="0.5" />
          <circle cx="78" cy="126" r="12" fill="#64748b" fillOpacity="0.5" />
          <circle cx="256" cy="108" r="14" fill="#94a3b8" fillOpacity="0.5" />

          {angle === "detail" && (
            <g>
              <rect x="44" y="22" width="232" height="26" rx="8" fill="#1e293b" />
              <text x="160" y="39" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="800" fontFamily="monospace">
                💨 FILTRO AROMATIZANTE SABOR PINO INCLUIDO
              </text>
            </g>
          )}
        </svg>
      );

    // =========================================================================
    // 8. LED AZUL ULTRABRILLANTE ROMPE-RETINAS 10MM (LED-AZUL-CEGADOR)
    // =========================================================================
    case "LED-AZUL-CEGADOR":
    default:
      return (
        <svg viewBox="0 0 320 320" className={className} fill="none">
          <defs>
            <radialGradient id="ledGlow" cx="50%" cy="38%" r="48%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#f0f9ff" stopOpacity="1" />
            </radialGradient>
          </defs>
          <rect width="320" height="320" rx="16" fill="url(#ledGlow)" />

          {/* Rayos de luz ultrabrillantes */}
          <g stroke="#0284c7" strokeWidth="3" strokeLinecap="round" opacity={angle === "detail" ? "1" : "0.55"}>
            <line x1="160" y1="22" x2="160" y2="48" />
            <line x1="82" y1="54" x2="102" y2="74" />
            <line x1="238" y1="54" x2="218" y2="74" />
            <line x1="56" y1="126" x2="84" y2="126" />
            <line x1="264" y1="126" x2="236" y2="126" />
          </g>

          {/* Patitas metálicas (Ánodo más largo y Cátodo) */}
          <rect x="138" y="182" width="8" height="106" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          <rect x="174" y="182" width="8" height="86" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />

          {/* Cápsula epóxica de 10mm del LED Azul */}
          <path d="M116 120C116 95.6995 135.699 76 160 76C184.301 76 204 95.6995 204 120V176H116V120Z" fill="#0284c7" fillOpacity="0.88" stroke="#0369a1" strokeWidth="3" />
          {/* Base biselada del LED */}
          <rect x="108" y="172" width="104" height="14" rx="4" fill="#0369a1" />
          {/* Núcleo incandescente interno */}
          <circle cx="160" cy="134" r="18" fill="#e0f2fe" />
          <path d="M130 98C136 88 148 84 156 84" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />

          {angle === "detail" && (
            <g>
              <rect x="44" y="22" width="232" height="26" rx="8" fill="#0c4a6e" />
              <text x="160" y="39" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="800" fontFamily="monospace">
                🔦 INTENSIDAD: 50,000 LUMENS DE MADRUGADA
              </text>
            </g>
          )}
        </svg>
      );
  }
};
