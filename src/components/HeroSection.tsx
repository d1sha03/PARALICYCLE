import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { HERO_IMAGE, SATELLITE_IMAGE } from '../data/paralicycleData';

interface HeroSectionProps {
  onExplore: () => void;
  onRequestPickup: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onRequestPickup }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Rich multi-layer scroll parallax
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.13]);
  const headlineY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.78], [1, 0.25]);
  const tilesY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);
  const floatCardY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);
  const floatCardRotate = useTransform(scrollYProgress, [0, 1], [0, -1.6]);

  return (
    <section id="hero" className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-2 pb-12 sm:pb-16">
      <div className="relative">
        {/* Main Hero Rounded Editorial Canvas */}
        <div
          ref={containerRef}
          className="relative w-full min-h-[580px] sm:min-h-[640px] rounded-[28px] overflow-hidden bg-[#EBF2F7] border border-[#E5E8DC] shadow-[0_24px_64px_rgba(26,27,25,0.08)] flex flex-col justify-between"
        >
          {/* Parallax Stubble-Burning Field Background (User's Requested First Background Image) */}
          <motion.div
            style={{ y: bgY, scale: bgScale }}
            className="absolute inset-0 will-change-transform pointer-events-none"
          >
            <img
              src={HERO_IMAGE}
              alt="Crop stubble burning across harvested field under blue sky and cumulus clouds"
              className="w-full h-full object-cover object-[center_45%]"
            />
            {/* Top-left editorial scrim so typography stays crisp while keeping sky, flames & smoke vivid */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(251,251,246,0.92) 0%, rgba(251,251,246,0.78) 28%, rgba(251,251,246,0.18) 54%, rgba(18,20,16,0.34) 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(96deg, rgba(251,251,246,0.88) 0%, rgba(251,251,246,0.52) 44%, rgba(251,251,246,0) 76%)',
              }}
            />
          </motion.div>

          {/* Upper Left Editorial Typography + Actions */}
          <motion.div
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="relative z-10 px-6 sm:px-10 lg:px-12 pt-7 sm:pt-11 max-w-[770px]"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7D4]/95 border border-[#C6E89F] text-[#264A15] text-[11px] font-semibold tracking-wide mb-4 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#65A30D] animate-pulse" />
              From Stubble to Sustainable · Punjab, India
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[34px] sm:text-[48px] lg:text-[56px] font-bold leading-[1.06] tracking-[-0.03em] text-[#1A1B19]"
            >
              PARALICYCLE turning Punjab crop residue{' '}
              <span className="font-serif-accent italic font-normal text-[#3F6212] tracking-[-0.01em]">
                into sustainable value
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7"
            >
              <p className="text-[13.5px] sm:text-[14.5px] leading-[1.6] text-[#353732] max-w-[350px] font-medium">
                AI-powered agricultural residue recovery and geospatial coordination platform.
                Estimate tonnage, match balers, and schedule pickups before burning starts.
              </p>

              {/* Signature Pill CTA + Light-Green Hover Circle */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={onExplore}
                  className="group inline-flex items-center cursor-pointer"
                >
                  <span className="px-5 py-3 rounded-full bg-[#1C1D1B] group-hover:bg-[#365314] text-white text-[13px] font-semibold transition-colors shadow-sm">
                    Explore Field Intelligence
                  </span>
                  <span className="w-10 h-10 -ml-1.5 rounded-full bg-[#D9F99D] border-[1.5px] border-[#1C1D1B] text-[#1A2E12] group-hover:bg-[#A3E635] flex items-center justify-center transition-all shadow-xs">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </button>

                <button
                  onClick={onRequestPickup}
                  className="px-4 py-2.5 rounded-full bg-white/92 hover:bg-[#E8F7D4] border border-[#D4DFC7] text-[#1A1B19] text-[13px] font-semibold backdrop-blur-sm transition-all cursor-pointer shadow-xs"
                >
                  Request Residue Pickup
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Metric Cards Row (Light Green + Soft Gold + Crisp White) */}
          <motion.div
            style={{ y: tilesY }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 px-6 sm:px-10 lg:px-12 pb-6 sm:pb-8 pt-20 flex flex-wrap items-end justify-between gap-4"
          >
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full sm:w-auto">
              <div className="rounded-[18px] bg-[#D9F99D]/95 backdrop-blur-md border border-[#BEF264] px-4 py-4 sm:px-5 sm:py-5 min-w-[100px] sm:min-w-[150px] shadow-[0_10px_28px_rgba(26,27,25,0.14)]">
                <div className="font-mono text-[22px] sm:text-[27px] font-semibold text-[#1A2E12] leading-none tabular-nums">
                  ~20M
                </div>
                <div className="text-[11px] text-[#284D16] leading-snug mt-2 font-semibold">
                  Tonnes of paddy straw
                  <span className="block text-[9.5px] font-normal opacity-80">generated in Punjab</span>
                </div>
              </div>

              <div className="rounded-[18px] bg-[#FCEAB6]/95 backdrop-blur-md border border-[#F5DC8E] px-4 py-4 sm:px-5 sm:py-5 min-w-[100px] sm:min-w-[150px] shadow-[0_10px_28px_rgba(26,27,25,0.14)]">
                <div className="font-mono text-[22px] sm:text-[27px] font-semibold text-[#1A1B19] leading-none tabular-nums">
                  15–20
                </div>
                <div className="text-[11px] text-[#5B4D25] leading-snug mt-2 font-semibold">
                  Days of pressure
                  <span className="block text-[9.5px] font-normal opacity-80">burning window</span>
                </div>
              </div>

              <div className="rounded-[18px] bg-white/95 backdrop-blur-md border border-white px-4 py-4 sm:px-5 sm:py-5 min-w-[100px] sm:min-w-[150px] shadow-[0_10px_28px_rgba(26,27,25,0.14)]">
                <div className="font-mono text-[22px] sm:text-[27px] font-semibold text-[#1A1B19] leading-none tabular-nums">
                  2.9%
                </div>
                <div className="text-[11px] text-[#5C5E59] leading-snug mt-2 font-semibold">
                  Farmers actually received payment
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Overlapping Matte Charcoal Geospatial Preview Card with Scroll Parallax & Light-Green Badge */}
        <motion.div
          style={{ y: floatCardY, rotate: floatCardRotate }}
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={onExplore}
          className="hidden md:block absolute -bottom-7 right-6 lg:right-8 z-20 w-[294px] rounded-[22px] bg-[#212220] text-white p-4 shadow-[0_24px_54px_rgba(26,27,25,0.34)] border border-white/12 cursor-pointer group hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div>
              <h3 className="font-display text-[14px] font-semibold leading-snug text-white">
                Punjab geospatial grid & burn-risk layer
              </h3>
              <p className="text-[11px] text-[#A4A6A0] leading-relaxed mt-1">
                Inspect 13 demo parcels across 5 villages with simulated residue & priority scores.
              </p>
            </div>
            <span className="shrink-0 w-8 h-8 rounded-full bg-[#D9F99D] text-[#1A2E12] flex items-center justify-center group-hover:bg-[#A3E635] transition-colors">
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
          <div className="relative h-[106px] rounded-[14px] overflow-hidden border border-white/10">
            <img
              src={SATELLITE_IMAGE}
              alt="Satellite geospatial preview of Punjab demo region"
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <span className="font-mono absolute bottom-2 left-2.5 px-2.5 py-0.5 rounded-full bg-[#D9F99D] text-[#1A2E12] text-[9.5px] font-semibold tracking-wide">
              SIMULATED OVERLAY
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
