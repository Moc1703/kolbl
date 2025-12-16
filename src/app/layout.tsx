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
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">
        {/* Floating Glass Navbar */}
        <nav className="fixed w-full z-50 transition-all duration-300 top-0">
          <div className="absolute inset-0 glass border-b-0 shadow-sm opacity-95"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center h-16">
              {/* Logo / Brand */}
              <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
                  <span className="text-xl font-bold">B</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 leading-tight">Blacklist KOL</span>
                  <span className="text-[10px] text-gray-500 font-medium tracking-wider">INDONESIA</span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-1 sm:gap-2">
                <a href="/" className="hidden sm:block px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 transition-all">
                  Home
                </a>
                <a href="/daftar" className="px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 transition-all">
                  Database
                </a>
                <a href="/lapor" className="ml-1 sm:ml-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
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
        <footer className="mt-auto bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm">🛡️</span>
                </div>
                <p className="text-sm text-gray-500">
                  &copy; 2024-{new Date().getFullYear()} Blacklist KOL Indonesia. Community Driven.
                </p>
              </div>
              
              <div className="flex gap-6">
                <a href="/disclaimer" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">Disclaimer</a>
                <a href="/banding" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">Banding</a>
                <a href="/saran" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">Saran</a>
                <a href="/admin" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">Admin Login</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
