import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Wheat, Ruler, CalendarDays, ArrowUpRight, Info, AlertCircle } from 'lucide-react';
import { CROPS, VILLAGES, EDITORIAL_IMAGES, Crop } from '../data/paralicycleData';
import { calculateResidueEstimate } from '../lib/residueEstimator';

interface EstimatorSectionProps {
  onSubmitRequest: (prefill: {
    village: string;
    crop: Crop;
    area: number;
    estimateT: number;
    harvest: string;
    pickup: string;
  }) => void;
}

const RISK_STYLES = {
  error: { bg: '#FEF2F0', border: '#F7C9C1', text: '#B93822' },
  info: { bg: '#F0F6FE', border: '#C9DDFB', text: '#285B9E' },
  optimal: { bg: '#E8F7D4', border: '#BCE48F', text: '#284D16' },
  warning: { bg: '#FEF7E6', border: '#F7DDA1', text: '#8D5F08' },
  critical: { bg: '#FEF2F0', border: '#F7C9C1', text: '#B93822' },
} as const;

export const EstimatorSection: React.FC<EstimatorSectionProps> = ({ onSubmitRequest }) => {
  const [village, setVillage] = useState(VILLAGES[2].name);
  const [crop, setCrop] = useState<Crop>('wheat');
  const [areaInput, setAreaInput] = useState('12');
  const [harvest, setHarvest] = useState('2026-11-01');
  const [pickup, setPickup] = useState('2026-11-09');

  const introRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: introScroll } = useScroll({
    target: introRef,
    offset: ['start end', 'end start'],
  });
  const leftThumbY = useTransform(introScroll, [0, 1], [-14, 18]);
  const rightThumbY = useTransform(introScroll, [0, 1], [18, -18]);

  const parsedArea = areaInput.trim() === '' ? 0 : Number(areaInput);
  const c = CROPS[crop];
  const est = calculateResidueEstimate({
    crop,
    areaHa: parsedArea,
    harvestDate: harvest,
    preferredCollectionDate: pickup,
  });

  const riskStyle = RISK_STYLES[est.riskTone];
  const clampedArea = Math.min(50, Math.max(1, Number.isFinite(parsedArea) ? parsedArea : 1));
  const fill = ((clampedArea - 1) / (50 - 1)) * 100;

  return (
    <section id="estimator" className="max-w-[1180px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Editorial Narrative Strip with Scroll-Parallax Flanking Photos */}
      <div
        ref={introRef}
        className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 mb-10 sm:mb-14"
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
            <span>PARALICYCLE · Residue Model</span>
          </div>
          <motion.div
            style={{ y: leftThumbY }}
            className="hidden md:block w-[148px] h-[90px] rounded-[18px] overflow-hidden shadow-md border border-[#D9E2CC]"
          >
            <img
              src={EDITORIAL_IMAGES.balerField}
              alt="Baler working across harvested wheat field"
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
          <h2 className="font-display text-[26px] sm:text-[34px] font-bold leading-[1.14] tracking-[-0.025em] text-[#1A1B19] mb-4">
            Our recovery path:{' '}
            <span className="font-serif-accent italic font-normal text-[#3F6212]">
              from harvest estimation
            </span>{' '}
            to scheduled collection
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#5C5E59] leading-[1.65] mb-3">
            Across Punjab, tight sowing windows between paddy harvest and wheat planting leave
            millions of tonnes of stubble unmanaged.{' '}
            <strong className="text-[#1A1B19]">PARALICYCLE</strong> replaces guesswork with AI
            residue tonnage estimates and coordinated machinery routing.
          </p>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#5C5E59] leading-[1.65]">
            Test our <strong className="text-[#1A1B19]">simulated Residue Estimator</strong> below
            to calculate expected tonnes, availability range, and optimal recovery window for any
            demo village parcel.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="hidden md:flex md:col-span-3 justify-end items-end h-full"
        >
          <motion.div
            style={{ y: rightThumbY }}
            className="w-[162px] h-[148px] rounded-[22px] overflow-hidden shadow-md border border-[#D9E2CC]"
          >
            <img
              src={EDITORIAL_IMAGES.wheatSunset}
              alt="Golden wheat stalks at sunset"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive Light Editorial Estimator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Form Inputs */}
        <motion.div
          initial={{ opacity: 0, x: -22 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 rounded-[24px] bg-white border border-[#E5E8DC] shadow-[0_12px_36px_rgba(26,27,25,0.04)] p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-[19px] font-bold text-[#1A1B19]">
                Residue Estimator
              </h3>
              <p className="text-[12.5px] text-[#6C6E6A]">
                Configure parcel parameters to preview simulated AI tonnage output
              </p>
            </div>
            <span className="font-mono px-3 py-1 rounded-full bg-[#E8F7D4] border border-[#C6E89F] text-[#284D16] text-[10.5px] font-semibold tracking-wide">
              MODEL v0.4 · DEMO
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.09em] text-[#6C6E6A] mb-2">
              Village / location
            </label>
            <select
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#F8F9F4] border border-[#DFE4D5] focus:border-[#65A30D] outline-none text-[14px] font-medium text-[#1A1B19] cursor-pointer transition-colors"
            >
              {VILLAGES.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name} · {v.block}
                </option>
              ))}
              <option value="Other Punjab village">Other Punjab village (manual pin)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.09em] text-[#6C6E6A] mb-2">
              Crop type
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(Object.keys(CROPS) as Crop[]).map((key) => {
                const active = crop === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCrop(key)}
                    className={`px-3 py-2.5 rounded-full border text-[13px] font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#1D1E1C] border-[#1D1E1C] text-[#D9F99D] shadow-xs'
                        : 'bg-[#F8F9F4] border-[#DFE4D5] text-[#52544F] hover:border-[#84CC16]'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Wheat className="w-3.5 h-3.5" />
                      {CROPS[key].short}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11.5px] text-[#7A7C76] mt-2">
              Simulated yield ratio: <span className="font-mono">{c.min}–{c.max}</span> t
              residue/ha for {c.label.toLowerCase()} (±12% variance).
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5 gap-3">
              <label htmlFor="estimator-area-number" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.09em] text-[#6C6E6A]">
                <Ruler className="w-3.5 h-3.5 text-[#65A30D]" />
                Field area (ha)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="estimator-area-number"
                  type="number"
                  step={0.5}
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  aria-label="Field area in hectares"
                  className="font-mono w-24 px-3 py-1 rounded-full bg-[#D9F99D] text-[#1A2E12] text-[13px] font-semibold tabular-nums text-right outline-none border border-[#BEF264] focus:border-[#4D7C0F]"
                />
                <span className="font-mono text-[12px] font-semibold text-[#5C5E59]">ha</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={0.5}
              value={clampedArea}
              onChange={(e) => setAreaInput(e.target.value)}
              aria-label="Field area slider"
              className="pc-range"
              style={{ '--fill': `${fill}%` } as React.CSSProperties}
            />
            <div className="flex justify-between font-mono text-[11px] text-[#8A8C86] mt-1.5">
              <span>1 ha</span>
              <span>25 ha</span>
              <span>50+ ha (type above up to 250)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="estimator-harvest-date" className="block text-[11px] font-bold uppercase tracking-[0.09em] text-[#6C6E6A] mb-2">
                Harvest date
              </label>
              <input
                id="estimator-harvest-date"
                type="date"
                value={harvest}
                onChange={(e) => setHarvest(e.target.value)}
                className="font-mono w-full px-4 py-2.5 rounded-2xl bg-[#F8F9F4] border border-[#DFE4D5] focus:border-[#65A30D] outline-none text-[13.5px] font-medium text-[#1A1B19]"
              />
            </div>
            <div>
              <label htmlFor="estimator-pickup-date" className="block text-[11px] font-bold uppercase tracking-[0.09em] text-[#6C6E6A] mb-2">
                Preferred collection date
              </label>
              <input
                id="estimator-pickup-date"
                type="date"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="font-mono w-full px-4 py-2.5 rounded-2xl bg-[#F8F9F4] border border-[#DFE4D5] focus:border-[#65A30D] outline-none text-[13.5px] font-medium text-[#1A1B19]"
              />
            </div>
          </div>
        </motion.div>

        {/* Live Simulated Output Card */}
        <motion.div
          initial={{ opacity: 0, x: 22 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 rounded-[24px] bg-[#F1F4EA] border border-[#DFE4D4] p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#4D7C0F]">
                Simulated Recovery Output
              </div>
              {est.valid && (
                <span
                  className={`font-mono px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                    est.priority === 'P1'
                      ? 'bg-[#FDECE9] text-[#B93822]'
                      : est.priority === 'P2'
                        ? 'bg-[#D9F99D] text-[#284D16]'
                        : 'bg-[#E5E4DC] text-[#52544F]'
                  }`}
                >
                  Priority {est.priority}
                </span>
              )}
            </div>

            <motion.div
              key={est.estimatedResidueT}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-[20px] bg-white p-5 border border-[#E4E7DC] shadow-xs mb-4"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[44px] sm:text-[50px] font-semibold text-[#1A1B19] leading-none tabular-nums tracking-tight">
                  {est.estimatedResidueT}
                </span>
                <span className="text-[17px] font-semibold text-[#6C6E6A]">tonnes</span>
              </div>
              <div className="text-[13px] text-[#5C5E59] mt-2">
                Availability range:{' '}
                <strong className="font-mono text-[#1A1B19] tabular-nums">
                  {est.availabilityRange[0]} – {est.availabilityRange[1]} t
                </strong>
              </div>
            </motion.div>

            {/* Light-Green Recommended Recovery Window Box */}
            <div className="rounded-[18px] bg-[#D9F99D] border border-[#BEF264] p-4 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#284D16]">
                  Recommended recovery window
                </span>
                <CalendarDays className="w-4 h-4 text-[#284D16]" />
              </div>
              <div className="font-mono text-[18px] font-semibold text-[#1A2E12] tabular-nums">
                {est.winStartLabel} – {est.winEndLabel}
              </div>
              <div className="text-[11.5px] text-[#365314] mt-0.5">
                {c.window[0]}–{c.window[1]} days post-harvest for {c.label.toLowerCase()}
              </div>
            </div>

            <div
              className="rounded-[18px] p-4 mb-5"
              style={{ background: riskStyle.bg, border: `1px solid ${riskStyle.border}` }}
            >
              <div className="flex items-center gap-1.5 text-[13px] font-bold mb-0.5" style={{ color: riskStyle.text }}>
                {!est.valid && <AlertCircle className="w-4 h-4 shrink-0" />}
                {est.riskLabel}
              </div>
              <p className="text-[12px] text-[#4C4E4A] leading-relaxed">{est.riskNote}</p>
            </div>
          </div>

          <div>
            <div className="flex items-start gap-2 text-[11px] text-[#6C6E6A] leading-relaxed mb-4">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#4D7C0F]" />
              <span>
                Simulated estimate for prototype preview. Production runs fuse Sentinel-2 NDVI
                passes via FastAPI and Supabase.
              </span>
            </div>

            <button
              type="button"
              disabled={!est.valid}
              onClick={() =>
                onSubmitRequest({
                  village,
                  crop,
                  area: parsedArea,
                  estimateT: est.estimatedResidueT,
                  harvest,
                  pickup,
                })
              }
              className="group w-full inline-flex items-center justify-center cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <span className="flex-1 py-3.5 px-6 rounded-full bg-[#1C1D1B] group-hover:bg-[#365314] text-white text-[13.5px] font-semibold transition-colors text-center">
                Submit recovery request
              </span>
              <span className="w-11 h-11 -ml-2 rounded-full bg-[#D9F99D] border-[1.5px] border-[#1C1D1B] text-[#1A2E12] group-hover:bg-[#A3E635] flex items-center justify-center transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
