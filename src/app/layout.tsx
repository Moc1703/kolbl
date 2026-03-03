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
        {/* Navbar */}
        <nav className="fixed w-full z-50 top-0 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              {/* Logo */}
              <a href="/" className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 bg-red-700 flex items-center justify-center rounded-[3px] group-hover:bg-red-600 transition-colors">
                  <span className="text-white text-sm font-black font-mono leading-none">B</span>
                </div>
                <span className="font-black text-white text-sm tracking-tight">KOLBL</span>
              </a>

              {/* Nav Links */}
              <div className="flex items-center gap-0.5">
                <a href="/" className="hidden sm:block px-3 py-1.5 text-[11px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors">
                  Home
                </a>
                <a href="/daftar" className="hidden sm:block px-3 py-1.5 text-[11px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors">
                  Database
                </a>
                <a href="/indikasi" className="px-3 py-1.5 text-[11px] font-bold text-amber-500/80 hover:text-amber-400 uppercase tracking-widest transition-colors">
                  Indikasi
                </a>
                <a href="/fraud" className="px-3 py-1.5 text-[11px] font-bold text-red-500/80 hover:text-red-400 uppercase tracking-widest transition-colors">
                  Fraud
                </a>
                <a href="/lapor" className="ml-2 px-4 py-1.5 text-[10px] font-black text-white bg-red-700 hover:bg-red-600 uppercase tracking-widest transition-colors rounded-[3px]">
                  Lapor
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-neutral-800/50 bg-neutral-950">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[11px] text-neutral-600 font-mono uppercase tracking-widest">
                &copy; 2024-{new Date().getFullYear()} Blacklist KOL Indonesia
              </p>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                <a href="/disclaimer" className="text-[11px] text-neutral-600 hover:text-neutral-400 uppercase tracking-widest transition-colors">Disclaimer</a>
                <a href="/banding" className="text-[11px] text-neutral-600 hover:text-neutral-400 uppercase tracking-widest transition-colors">Banding</a>
                <a href="/saran" className="text-[11px] text-neutral-600 hover:text-neutral-400 uppercase tracking-widest transition-colors">Saran</a>
                <a href="/admin" className="text-[11px] text-neutral-700 hover:text-neutral-500 uppercase tracking-widest transition-colors">Admin</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
