import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estiren - Soluciones en Tecnología... o lo que se pueda",
  description:
    "Tienda de electrónica, herramientas, cables, energía y componentes en la Comarca Lagunera.",
  icons: {
    icon: "/EstirenLogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-100 text-slate-800 font-sans antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

