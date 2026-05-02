'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-md border-b border-gray-800'
          : 'bg-transparent border-b border-transparent'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="px-8 h-20 flex items-center justify-between">
        {/* Left: Logo - Fixed at edge */}
        <motion.div
          className="flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/" className="block group flex items-center gap-2">
            <motion.div
              className="relative flex items-center"
              animate={{ y: [0, -1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="absolute -inset-x-4 -inset-y-2 rounded-full bg-cyan-400/10 blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
              <motion.span
                className="relative text-[1.05rem] sm:text-[1.15rem] md:text-[1.2rem] font-black tracking-[0.18em] whitespace-nowrap uppercase"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                style={{
                  backgroundImage: 'linear-gradient(90deg, #ffffff 0%, #7cecff 18%, #2fb8ff 35%, #ffffff 55%, #d9fbff 72%, #2fb8ff 88%, #ffffff 100%)',
                  backgroundSize: '300% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 22px rgba(59, 130, 246, 0.18), 0 0 42px rgba(34, 211, 238, 0.18)',
                }}
              >
                Twinstitute <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">AI</span>
              </motion.span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Center: Menu Items - Single line with pipe separators */}
        <div className="hidden lg:flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
          {[
            { name: 'Home', href: '#home' },
            { name: 'Why Different', href: '#program' },
            { name: 'How It Works', href: '#framework' },
            { name: 'Our System', href: '#features' },
            { name: 'The Difference', href: '#journey' },
            { name: 'What you get', href: '#proof' },
            { name: 'Get Started', href: '#portal' },
          ].map((item, idx, arr) => (
            <div key={item.name} className="flex items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById(item.href.substring(1));
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-medium text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                {item.name}
              </button>
              {idx < arr.length - 1 && (
                <span className="text-gray-600 text-xs">|</span>
              )}
            </div>
          ))}
        </div>

        {/* Right: CTA Buttons - Fixed at edge */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/auth/signup">
            <button className="text-xs font-medium text-gray-400 hover:text-white transition-colors whitespace-nowrap">
              Enter System
            </button>
          </Link>

          <span className="text-gray-600 text-xs">|</span>

          <Link href="/auth/login">
            <motion.button
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-1.5 whitespace-nowrap"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Login
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar;
