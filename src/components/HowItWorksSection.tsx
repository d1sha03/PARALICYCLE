import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { WORKFLOW_STEPS, EDITORIAL_IMAGES } from '../data/paralicycleData';

interface HowItWorksSectionProps {
  onStartRequest: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartRequest }) => {
  const [activeIdx, setActiveIdx] = useState(1);

  const missionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: missionScroll } = useScroll({
    target: missionRef,
    offset: ['start end', 'end start'],
  });
  const leftImgY = useTransform(missionScroll, [0, 1], [-16, 16]);
  const rightImgY = useTransform(missionScroll, [0, 1], [16, -16]);

  const workflowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: workflowScroll } = useScroll({
    target: workflowRef,
    offset: ['start 85%', 'center 55%'],
  });
  const trackScaleX = useTransform(workflowScroll, [0, 1], [0.05, 1]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + WORKFLOW_STEPS.length) % WORKFLOW_STEPS.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % WORKFLOW_STEPS.length);
  };

  return (
    <section id="how" className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14">
      {/* Editorial Mission & Final CTA Strip with Opposing Photo Scroll Parallax */}
      <div
        ref={missionRef}
        className="grid grid-cols-1 md:grid-cols-12 items-center gap-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="md:col-span-3 flex flex-col justify-between h-full gap-6"
        >
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#3C4636]">
            <span className="w-3 h-3 rounded-full bg-[#84CC16]" />
            <span>PARALICYCLE · Mission</span>
          </div>
          <motion.div
            style={{ y: leftImgY }}
            className="hidden md:block w-[172px] h-[132px] rounded-[22px] overflow-hidden shadow-md border border-[#D9E2CC]"
          >
            <img
              src={EDITORIAL_IMAGES.indianFarmer}
              alt="Farmer in Punjab wheat field"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="md:col-span-6"
        >
          <h2 className="font-display text-[28px] sm:text-[38px] font-bold leading-[1.12] tracking-[-0.025em] text-[#1A1B19] mb-4">
            Turn agricultural residue into a{' '}
            <span className="font-serif-accent italic font-normal text-[#3F6212]">
              resource.
            </span>
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#5C5E59] leading-[1.65] mb-6 max-w-[490px]">
            Our goal is to help Punjab farmers, baler operators, and bio-energy offtakers clear
            crop stubble rapidly without burning — pairing modern AI estimation with transparent
            geospatial scheduling.
          </p>

          <button
            onClick={onStartRequest}
            className="group inline-flex items-center cursor-pointer"
          >
            <span className="px-6 py-3.5 rounded-full bg-[#1C1D1B] group-hover:bg-[#365314] text-white text-[13.5px] font-semibold transition-colors shadow-sm">
              Start a Recovery Request
            </span>
            <span className="w-11 h-11 -ml-2 rounded-full bg-[#D9F99D] border-[1.5px] border-[#1C1D1B] text-[#1A2E12] group-hover:bg-[#A3E635] flex items-center justify-center transition-colors shadow-xs">
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="hidden md:flex md:col-span-3 justify-end items-end h-full"
        >
          <motion.div
            style={{ y: rightImgY }}
            className="w-[204px] h-[140px] rounded-[22px] overflow-hidden shadow-md border border-[#D9E2CC]"
          >
            <img
              src={EDITORIAL_IMAGES.modernHarvester}
              alt="Modern baler harvesting agricultural residue"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Warm-Stone Workflow Showcase with Scroll-Driven Progress Track */}
      <motion.div
        ref={workflowRef}
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
        className="rounded-[30px] bg-[#F1F4EA] border border-[#DCE3D1] p-6 sm:p-9 lg:p-10"
      >
        {/* Scroll-scrubbed light-green pipeline progress track */}
        <div className="mb-7">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#5C6652] mb-2">
            <span>End-to-End Recovery Pipeline</span>
            <span className="text-[#3F6212] font-semibold">4 Automated Stages</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#E1E7D7] overflow-hidden">
            <motion.div
              style={{ scaleX: trackScaleX }}
              className="h-full w-full bg-gradient-to-r from-[#65A30D] via-[#A3E635] to-[#EAB308] origin-left rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
          {/* Left title + prev/next circular buttons */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-6">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4D7C0F]">
                How It Works
              </span>
              <h3 className="font-display text-[24px] sm:text-[28px] font-bold leading-[1.16] tracking-[-0.025em] text-[#1A1B19] mt-2">
                Our workflow, step by step:
              </h3>
              <p className="text-[12.5px] text-[#5C6357] mt-3 leading-relaxed">
                Click any card or use the arrows to inspect how fields move from submission to
                scheduled recovery.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrev}
                aria-label="Previous step"
                className="w-10 h-10 rounded-full bg-white border border-[#DCE3D1] hover:border-[#1A1B19] text-[#1A1B19] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next step"
                className="w-10 h-10 rounded-full bg-[#84CC16] hover:bg-[#65A30D] text-[#1A2E12] hover:text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="font-mono text-[12px] font-semibold text-[#5C6357] ml-1 tabular-nums">
                0{activeIdx + 1} / 0{WORKFLOW_STEPS.length}
              </span>
            </div>
          </div>

          {/* Right 4-Step Alternating White / Matte Charcoal Pill-Tag Cards */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {WORKFLOW_STEPS.map((step, i) => {
              const isDark = activeIdx === i;
              return (
                <motion.button
                  key={step.id}
                  type="button"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setActiveIdx(i)}
                  className={`text-left rounded-[22px] p-5 flex flex-col justify-between transition-all cursor-pointer border ${
                    isDark
                      ? 'bg-[#212220] text-white border-[#212220] shadow-[0_18px_40px_rgba(26,27,25,0.22)]'
                      : 'bg-white text-[#1A1B19] border-[#E4E8DB] hover:border-[#84CC16] shadow-[0_4px_18px_rgba(26,27,25,0.03)]'
                  }`}
                >
                  <div>
                    <div className="font-display text-[15px] font-bold leading-snug mb-4">
                      <span
                        className={`font-mono mr-1.5 ${
                          isDark ? 'text-[#D9F99D]' : 'text-[#4D7C0F]'
                        }`}
                      >
                        ({step.id})
                      </span>
                      {step.title}
                    </div>

                    {/* Signature keyword pill tags inside each card */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {step.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-medium ${
                            isDark
                              ? 'bg-[#D9F99D] text-[#1A2E12]'
                              : 'bg-[#F5F8F0] border border-[#DFE6D5] text-[#4C5642]'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p
                    className={`text-[12px] leading-[1.55] ${
                      isDark ? 'text-[#B8BAB4]' : 'text-[#5C5E59]'
                    }`}
                  >
                    {step.text}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

      </motion.div>
    </section>
  );
};
