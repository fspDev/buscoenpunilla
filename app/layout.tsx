import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const BASE_URL = 'https://buscoenpunilla.com.ar'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'BUSCO en Punilla — Servicios y oficios locales',
    template: '%s | BUSCO en Punilla',
  },
  description: 'Encontrá electricistas, plomeros, albañiles y más en San Antonio de Arredondo, Cosquín y el Valle de Punilla. Todos con reseñas reales de vecinos.',
  keywords: ['servicios locales', 'oficios', 'Valle de Punilla', 'San Antonio de Arredondo', 'electricista', 'plomero', 'albañil', 'Cosquín', 'Córdoba'],
  authors: [{ name: 'BUSCO en Punilla' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: BASE_URL,
    siteName: 'BUSCO en Punilla',
    title: 'BUSCO en Punilla — Servicios y oficios locales',
    description: 'Encontrá electricistas, plomeros, albañiles y más en el Valle de Punilla. Con reseñas reales de vecinos.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BUSCO en Punilla' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BUSCO en Punilla — Servicios y oficios locales',
    description: 'Encontrá electricistas, plomeros, albañiles y más en el Valle de Punilla.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: BASE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-primary-container focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Saltar al contenido principal
        </a>
        <Navbar />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
