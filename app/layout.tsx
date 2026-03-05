import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cocoir-Mart',
  description: 'Sustainable coconut coir products from the Philippines',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}