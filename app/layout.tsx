import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'Just Conduite — Auto-école 2.0 en Île-de-France',
  description: 'Trouvez votre moniteur auto-école idéal en Île-de-France. Commission 15%, suivi pédagogique, code gratuit.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00B37D',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
