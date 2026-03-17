import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

// Optimizamos la carga de la fuente a nivel servidor
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ALEX.D | Portafolio',
  description: 'Diseñador multidisciplinar y desarrollador creativo.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body 
        className={`${spaceGrotesk.variable} font-display antialiased selection:bg-primary selection:text-white flex min-h-screen w-full flex-col overflow-x-hidden`}
      >
        {children}
        
        {/* Componente oficial de GA4 - Reemplazar gaId cuando el backend te lo envíe */}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}