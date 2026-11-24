import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Menu, X, Sprout } from 'lucide-react';

interface NavbarProps {
  onOpenRequest: () => void;
}

const NAV_LINKS = [
  { id: 'hero', label: 'Overview', href: '#hero' },
  { id: 'estimator', label: 'Estimator', href: '#estimator' },
  { id: 'map', label: 'Field Intelligence', href: '#map' },
  { id: 'machinery', label: 'Machinery', href: '#machinery' },
  { id: 'how', label: 'How it works', href: '#how' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenRequest }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState('hero');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
      const y = window.scrollY + 200;
      for (let i = NAV_LINKS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_LINKS[i].id);
        if (el && el.offsetTop <= y) {
          setActiveId(NAV_LINKS[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setDrawerOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Light-green to harvest-gold scroll progress bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#65A30D] via-[#A3E635] to-[#EAB308] origin-left z-50"
      />

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FBFBF6]/92 backdrop-blur-md border-b border-[#E7E9DE] py-2.5 shadow-[0_6px_24px_rgba(26,27,25,0.04)]'
            : 'bg-[#FBFBF6]/95 py-4'
        }`}
      >
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Left: Light-green emblem + Display Brand */}
          <button
            onClick={() => scrollTo('#hero')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <span className="w-8 h-8 rounded-full bg-[#A3E635] border border-[#65A30D]/25 flex items-center justify-center text-[#1A2E12] shadow-xs group-hover:scale-105 transition-transform">
              <Sprout className="w-4 h-4" strokeWidth={2.3} />
            </span>
            <span className="font-display text-[16px] font-bold tracking-[0.02em] text-[#1A1B19]">
              PARALICYCLE
            </span>
          </button>

          {/* Center: Floating pure-white pill bar with animated active pill */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full bg-white border border-[#ECEBE3] p-1.5 shadow-[0_2px_18px_rgba(26,27,25,0.05)]">
            {NAV_LINKS.map((link) => {
              const isActive = activeId === link.id;
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`relative px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive ? 'text-white' : 'text-[#52544F] hover:text-[#1A1B19]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-[#1D1E1C] shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Light-green Demo badge + solid charcoal CTA pill */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4F6CF] border border-[#C7E9A1] text-[#284D16] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#65A30D] animate-pulse" />
              Punjab Demo
            </span>

            <button
              onClick={onOpenRequest}
              className="px-4 sm:px-5 py-2.5 rounded-full bg-[#1D1E1C] hover:bg-[#4D7C0F] active:scale-[0.98] text-white text-[13px] font-semibold transition-all shadow-xs cursor-pointer"
            >
              Request pickup
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="lg:hidden w-9 h-9 rounded-full bg-white border border-[#E5E4DC] flex items-center justify-center text-[#1A1B19] hover:bg-[#E4F6CF] transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-out drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-xs z-50"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[330px] bg-[#FBFBF6] z-50 p-6 flex flex-col justify-between shadow-2xl border-l border-[#E7E6DE]"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 font-display font-bold tracking-[0.02em] text-[#1A1B19]">
                    <span className="w-7 h-7 rounded-full bg-[#A3E635] text-[#1A2E12] flex items-center justify-center">
                      <Sprout className="w-3.5 h-3.5" />
                    </span>
                    <span>PARALICYCLE</span>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="w-9 h-9 rounded-full bg-[#F2F1EA] flex items-center justify-center text-[#1A1B19] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {NAV_LINKS.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => scrollTo(item.href)}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium transition-colors cursor-pointer ${
                        activeId === item.id
                          ? 'bg-[#1D1E1C] text-white'
                          : 'text-[#3C3E3A] hover:bg-[#E8F7D4]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-6 p-4 rounded-2xl bg-[#E8F7D4] border border-[#CFEBA9] text-[12px] text-[#284D16] leading-relaxed">
                  <strong>Simulated demo mode:</strong> All Punjab fields, residue tonnes,
                  machinery schedules and charts use illustrative demo data.
                </div>
              </div>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenRequest();
                }}
                className="w-full py-3.5 rounded-full bg-[#1D1E1C] hover:bg-[#4D7C0F] text-white text-[14px] font-semibold transition-colors cursor-pointer"
              >
                Request Residue Pickup
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
