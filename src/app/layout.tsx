import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Software Developer | Luciano Cortez',
  description: 'Desarrollador de software con talento para crear soluciones elegantes en diferentes plataformas.',
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
      </body>

      {/*
        GoogleAnalytics va FUERA del <body> pero DENTRO del <html>.
        Esto garantiza que el script se cargue correctamente en App Router.
        El gaId viene de la variable de entorno NEXT_PUBLIC_GA_ID.
        En producción Next.js inyecta el gtag.js con strategy="afterInteractive"
        automáticamente, por lo que no bloquea el render inicial.
      */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}