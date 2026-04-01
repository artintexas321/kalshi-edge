import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kalshi Edge',
  description: 'Prediction markets dashboard — market scanner, bet sizing, portfolio tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">{children}</body>
    </html>
  )
}
