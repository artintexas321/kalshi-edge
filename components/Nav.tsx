'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Market Scanner' },
  { href: '/calculator', label: 'Bet Sizing' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/injuries', label: 'Injury Intel' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-800 bg-[#0d1424]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-xl tracking-tight">
              ◈ KALSHI
            </span>
            <span className="text-gray-400 font-light text-xl">EDGE</span>
          </div>

          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">LIVE</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    </nav>
  )
}
