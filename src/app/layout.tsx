import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Blacklist KOL/MG Indonesia',
  description: 'Database KOL dan Management yang bermasalah - Lindungi dirimu sebelum kerjasama',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">
        {/* Solid Dark Navbar */}
        <nav className="fixed w-full z-50 transition-all duration-300 top-0 bg-neutral-950 border-b border-neutral-800 shadow-md shadow-black/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center h-16">
              {/* Logo / Brand */}
              <a href="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
                <div className="w-8 h-8 rounded-sm bg-red-700 flex items-center justify-center text-white shadow-sm group-hover:bg-red-600 transition-colors">
                  <span className="text-xl font-bold font-mono">B</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white leading-tight tracking-tight">BLACKLIST.ID</span>
                  <span className="text-[10px] text-red-500 font-bold tracking-widest">KOL/MG DATABASE</span>
                </div>
              </a>

              {/* Navigation Links */}
              <div className="flex items-center gap-1 sm:gap-2">
                <a href="/" className="hidden sm:block px-3 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                  Home
                </a>
                <a href="/daftar" className="hidden sm:block px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                  Database
                </a>
                <a href="/indikasi" className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span className="hidden sm:inline">⚠️</span> Indikasi
                </a>
                <a href="/fraud" className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-red-500 hover:text-red-400 transition-colors flex items-center gap-1">
                  <span className="hidden sm:inline">🚨</span> Fraud
                </a>
                <a href="/lapor" className="ml-1 sm:ml-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm text-xs sm:text-sm font-bold text-white bg-red-700 hover:bg-red-600 transition-colors uppercase tracking-wide">
                  Lapor
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content with top padding for fixed navbar */}
        <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Improved Footer */}
        <footer className="mt-auto bg-neutral-950 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <span className="text-sm">🛡️</span>
                </div>
                <p className="text-sm text-neutral-500">
                  &copy; 2024-{new Date().getFullYear()} Blacklist KOL Indonesia.<br className="sm:hidden" /> Community Driven.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
                <a href="/disclaimer" className="text-sm text-neutral-500 hover:text-white transition-colors">Disclaimer</a>
                <a href="/banding" className="text-sm text-neutral-500 hover:text-white transition-colors">Banding</a>
                <a href="/saran" className="text-sm text-neutral-500 hover:text-white transition-colors">Saran</a>
                <a href="/indikasi" className="text-sm text-amber-600 hover:text-amber-500 transition-colors">Indikasi</a>
                <a href="/fraud" className="text-sm text-red-600 hover:text-red-500 transition-colors">Fraud</a>
                <a href="/admin" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">Admin Login</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
