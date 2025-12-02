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
        <nav className="bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <a href="/" className="text-base md:text-lg font-bold flex items-center gap-2">
                <span className="bg-white/20 rounded-lg p-1">🚫</span>
                <span className="hidden sm:inline">Blacklist KOL</span>
                <span className="sm:hidden">BLKOL</span>
              </a>
              <div className="flex gap-1 md:gap-2 text-xs md:text-sm">
                <a href="/" className="hover:bg-white/20 px-2 py-1.5 rounded-lg transition">Cek</a>
                <a href="/daftar" className="hover:bg-white/20 px-2 py-1.5 rounded-lg transition">Daftar</a>
                <a href="/saran" className="hover:bg-white/20 px-2 py-1.5 rounded-lg transition hidden sm:block">Saran</a>
                <a href="/lapor" className="bg-white text-red-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-50 transition">Lapor</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-900 text-white py-6 mt-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-400">🚫 Blacklist KOL/MG Indonesia</p>
                <a href="/disclaimer" className="text-[10px] text-gray-500 hover:text-yellow-400 transition">⚠️ Baca Disclaimer</a>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <a href="/banding" className="hover:text-white transition">Banding</a>
                <a href="/saran" className="hover:text-white transition">Saran</a>
                <a href="/lapor" className="hover:text-white transition">Lapor</a>
                <a href="/admin" className="hover:text-white transition">Admin</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
