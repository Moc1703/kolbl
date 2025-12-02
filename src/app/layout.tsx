import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Blacklist KOL/MG Indonesia',
  description: 'Database KOL dan Management yang bermasalah - Lindungi dirimu sebelum kerjasama',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-red-600 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <a href="/" className="text-lg md:text-xl font-bold">🚫 Blacklist KOL/MG</a>
              <div className="flex gap-2 md:gap-4 text-sm md:text-base">
                <a href="/" className="hover:underline px-2 py-1">Cek</a>
                <a href="/daftar" className="hover:underline px-2 py-1">Daftar</a>
                <a href="/lapor" className="bg-white text-red-600 px-3 py-1 rounded-full font-medium hover:bg-red-50">Lapor</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-800 text-white text-center py-6 mt-12">
          <p className="text-sm">Blacklist KOL/MG Indonesia - Lindungi sesama dari kerjasama yang merugikan</p>
        </footer>
      </body>
    </html>
  )
}
