import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EstimatorSection } from './components/EstimatorSection';
import { FieldIntelligenceBento } from './components/FieldIntelligenceBento';
import { MachinerySection } from './components/MachinerySection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { CtaFooter } from './components/CtaFooter';
import { RecoveryRequestModal, RequestPrefill } from './components/RecoveryRequestModal';

export function App() {
  const [requestOpen, setRequestOpen] = useState(false);
  const [prefill, setPrefill] = useState<RequestPrefill | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 560);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openRequest = (p?: RequestPrefill) => {
    setPrefill(p ?? null);
    setRequestOpen(true);
  };

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#FBFBF6] text-[#1A1B19]">
      <Navbar onOpenRequest={() => openRequest()} />

      <main>
        <HeroSection
          onExplore={() => scrollTo('#map')}
          onRequestPickup={() => openRequest()}
        />

        <EstimatorSection onSubmitRequest={(p) => openRequest(p)} />

        <FieldIntelligenceBento onRequestPickup={(p) => openRequest(p)} />

        <MachinerySection />

        <HowItWorksSection onStartRequest={() => openRequest()} />
      </main>

      <CtaFooter />

      <RecoveryRequestModal
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
        prefill={prefill}
      />

      {/* Scroll-to-top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 14 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full bg-[#1C1D1B] hover:bg-[#65A30D] text-[#D9F99D] hover:text-white shadow-[0_10px_28px_rgba(26,27,25,0.25)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
