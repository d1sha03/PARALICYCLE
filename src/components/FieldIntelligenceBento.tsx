import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  MapPin,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  X,
  Layers,
} from 'lucide-react';
import {
  SATELLITE_IMAGE,
  EDITORIAL_IMAGES,
  VILLAGES,
  STATUS_META,
  URGENCY_META,
  CROPS,
  STACKED_HORIZON_BARS,
  Field,
  FieldStatus,
  Crop,
} from '../data/paralicycleData';
import { CollectionSchedule, RecoveryRequest } from '../types/paralicycle';

interface FieldIntelligenceBentoProps {
  fields: Field[];
  requests: RecoveryRequest[];
  optimisedSchedule: CollectionSchedule;
  baselineSchedule: CollectionSchedule;
  onRequestPickup: (prefill?: {
    village?: string;
    crop?: Crop;
    area?: number;
    estimateT?: number;
    harvest?: string;
    pickup?: string;
  }) => void;
}

type CropFilter = 'all' | Crop;
type StatusFilter = 'all' | FieldStatus;
type AnalyticsTab = 'stacked' | 'compare' | 'verified';

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BurnDot {
  x: number;
  y: number;
  r: number;
  o: number;
  delay: number;
  pulse: boolean;
}

function buildBurnDots(): BurnDot[] {
  const rng = mulberry32(77031);
  const dots: BurnDot[] = [];
  let i = 0;
  const cluster = (cx: number, cy: number, sx: number, sy: number, n: number) => {
    for (let k = 0; k < n; k++) {
      dots.push({
        x: cx + (rng() + rng() - 1) * sx,
        y: cy + (rng() + rng() - 1) * sy,
        r: 2 + rng() * 2.4,
        o: 0.6 + rng() * 0.4,
        delay: 200 + i * 4,
        pulse: i % 32 === 0,
      });
      i++;
    }
  };
  cluster(560, 285, 145, 90, 90);
  cluster(680, 415, 75, 50, 32);
  cluster(700, 160, 65, 42, 20);
  cluster(220, 200, 65, 48, 12);
  return dots;
}

function CountUp({ value, suffix = '', active }: { value: number; suffix?: string; active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value]);
  return (
    <span className="font-mono tabular-nums">
      {n.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}

const W = 440;
const H = 175;
const PAD_L = 38;
const PAD_R = 46;
const PAD_T = 14;
const PAD_B = 26;
const xAt = (i: number, n: number) => PAD_L + (i * (W - PAD_L - PAD_R)) / (n - 1);

export const FieldIntelligenceBento: React.FC<FieldIntelligenceBentoProps> = ({
  fields,
  requests,
  optimisedSchedule,
  baselineSchedule,
  onRequestPickup,
}) => {
  const [selected, setSelected] = useState<Field | null>(fields[3] ?? fields[0] ?? null);
  const [cropF, setCropF] = useState<CropFilter>('all');
  const [statusF, setStatusF] = useState<StatusFilter>('all');
  const [urgencyHigh, setUrgencyHigh] = useState(false);
  const [layers, setLayers] = useState({ fields: true, villages: true, burn: true });
  const [tab, setTab] = useState<AnalyticsTab>('stacked');

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 90%', 'center 55%'],
  });
  const cardScale = useTransform(scrollYProgress, [0, 1], [0.965, 1]);

  const burnDots = useMemo(buildBurnDots, []);

  const passes = (f: Field) =>
    (cropF === 'all' || f.crop === cropF) &&
    (statusF === 'all' || f.status === statusF) &&
    (!urgencyHigh || f.urgency === 'critical' || f.urgency === 'high');

  const maxStacked = Math.max(
    ...STACKED_HORIZON_BARS.map((b) => b.wheat + b.rice + b.mustard)
  );

  const optM = optimisedSchedule.metrics;
  const baseM = baselineSchedule.metrics;

  const costReductionPct =
    baseM.avgCostPerTonne > 0
      ? Math.round(((baseM.avgCostPerTonne - optM.avgCostPerTonne) / baseM.avgCostPerTonne) * 100)
      : 0;

  const liveComparisonMetrics = [
    {
      label: 'Residue scheduled (t)',
      baseline: baseM.totalResidueScheduledT,
      ai: optM.totalResidueScheduledT,
      unit: 't',
    },
    {
      label: 'Missed deadlines (fields)',
      baseline: baseM.missedDeadlinesCount,
      ai: optM.missedDeadlinesCount,
      unit: '',
    },
    {
      label: 'Avg cost (₹ / t)',
      baseline: baseM.avgCostPerTonne,
      ai: optM.avgCostPerTonne,
      unit: '₹',
    },
    {
      label: 'Deadline adherence (%)',
      baseline: baseM.deadlineAdherencePct,
      ai: optM.deadlineAdherencePct,
      unit: '%',
    },
  ];

  // Build cumulative series dynamically from actual assignments
  const cumulativeData = useMemo(() => {
    const days = Array.from(
      new Set([
        ...optimisedSchedule.assignments.map((a) => a.dateIso),
        ...baselineSchedule.assignments.map((a) => a.dateIso),
      ])
    ).sort();
    if (days.length < 2) {
      return { ai: [0, optM.totalResidueScheduledT], base: [0, baseM.totalResidueScheduledT] };
    }
    let aiSum = 0;
    let baseSum = 0;
    const aiSeries: number[] = [];
    const baseSeries: number[] = [];
    for (const d of days) {
      aiSum += optimisedSchedule.assignments
        .filter((a) => a.dateIso === d)
        .reduce((s, a) => s + a.tons, 0);
      baseSum += baselineSchedule.assignments
        .filter((a) => a.dateIso === d)
        .reduce((s, a) => s + a.tons, 0);
      aiSeries.push(Math.round(aiSum * 10) / 10);
      baseSeries.push(Math.round(baseSum * 10) / 10);
    }
    return { ai: aiSeries, base: baseSeries };
  }, [optimisedSchedule, baselineSchedule, optM.totalResidueScheduledT, baseM.totalResidueScheduledT]);

  const maxCum = Math.max(10, ...cumulativeData.ai, ...cumulativeData.base);
  const yAtDyn = (v: number) => H - PAD_B - (v / maxCum) * (H - PAD_T - PAD_B);
  const buildDynLine = (series: number[]) =>
    'M ' +
    series
      .map((v, i) => `${xAt(i, Math.max(2, series.length)).toFixed(1)},${yAtDyn(v).toFixed(1)}`)
      .join(' L ');
  const aiLine = buildDynLine(cumulativeData.ai);
  const baseLine = buildDynLine(cumulativeData.base);

  return (
    <section id="map" className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Matte Dark Charcoal Centerpiece Bento Container with scroll-driven elevation */}
      <motion.div
        ref={sectionRef}
        style={{ scale: cardScale }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[30px] bg-[#212220] text-white p-5 sm:p-8 lg:p-10 shadow-[0_28px_70px_rgba(26,27,25,0.18)] will-change-transform"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ==================== LEFT COLUMN: INTERACTIVE MAP + OPERATIONS KPIs ==================== */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display text-[25px] sm:text-[32px] font-bold leading-[1.12] tracking-[-0.025em] text-white">
                    Field Intelligence &
                    <br />
                    <span className="font-serif-accent italic font-normal text-[#D9F99D]">
                      Regional Operations
                    </span>
                  </h2>
                </div>
                <span className="font-mono inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/8 border border-[#A3E635]/35 text-[#D9F99D] text-[10.5px] font-semibold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse" />
                  SIMULATED DEMO
                </span>
              </div>

              {/* Layer + Filter Strip */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-[#9A9C96] mr-1">
                  <Layers className="w-3 h-3 text-[#A3E635]" /> Layers
                </span>
                {(
                  [
                    ['fields', 'Fields'],
                    ['villages', 'Villages'],
                    ['burn', 'Burn risk'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                      layers[key]
                        ? 'bg-[#D9F99D] border-[#D9F99D] text-[#1A2E12]'
                        : 'bg-white/5 border-white/15 text-[#B5B7B1] hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}

                <select
                  value={cropF}
                  onChange={(e) => setCropF(e.target.value as CropFilter)}
                  className="px-2.5 py-1 rounded-full bg-[#2C2E2B] border border-white/15 text-[11px] font-medium text-white outline-none cursor-pointer"
                >
                  <option value="all">All crops</option>
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="mustard">Mustard</option>
                </select>

                <select
                  value={statusF}
                  onChange={(e) => setStatusF(e.target.value as StatusFilter)}
                  className="px-2.5 py-1 rounded-full bg-[#2C2E2B] border border-white/15 text-[11px] font-medium text-white outline-none cursor-pointer"
                >
                  <option value="all">All statuses</option>
                  <option value="registered">Registered</option>
                  <option value="estimated">AI-estimated</option>
                  <option value="assigned">Assigned</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="recovered">Recovered</option>
                </select>

                <button
                  onClick={() => setUrgencyHigh((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                    urgencyHigh
                      ? 'bg-[#E04F33] border-[#E04F33] text-white'
                      : 'bg-white/5 border-white/15 text-[#B5B7B1] hover:bg-white/10'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  Urgent
                </button>
              </div>

              {/* Interactive Dark Geospatial Satellite Map */}
              <div
                className={`relative w-full aspect-[16/11] min-h-[300px] rounded-[20px] overflow-hidden bg-[#171816] border border-white/12 ${
                  inView ? 'burns-in' : ''
                }`}
              >
                <img
                  src={SATELLITE_IMAGE}
                  alt="Punjab simulated satellite field grid"
                  className="absolute inset-0 w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-[#171816]/55 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171816]/85 via-transparent to-[#171816]/35" />

                <svg
                  viewBox="0 0 1000 620"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full"
                >
                  <defs>
                    <filter id="bentoGlow" x="-60%" y="-60%" width="220%" height="220%">
                      <feGaussianBlur stdDeviation="12" />
                    </filter>
                  </defs>

                  {/* Burn risk overlay */}
                  {layers.burn && (
                    <g>
                      <g filter="url(#bentoGlow)">
                        <ellipse className="burn-glow" cx="560" cy="285" rx="115" ry="68" fill="#E04F33" />
                        <ellipse className="burn-glow" cx="690" cy="420" rx="68" ry="44" fill="#EAB308" />
                      </g>
                      {burnDots.map((d, idx) => (
                        <circle
                          key={idx}
                          className="burn-dot"
                          cx={d.x}
                          cy={d.y}
                          r={d.r}
                          fill={idx % 3 === 0 ? '#F0563F' : '#F3B72B'}
                          style={{ '--o': d.o * 0.85, animationDelay: `${d.delay}ms` } as React.CSSProperties}
                        >
                          {d.pulse && (
                            <>
                              <animate attributeName="r" values={`${d.r};${d.r + 3.5};${d.r}`} dur="1.6s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" />
                            </>
                          )}
                        </circle>
                      ))}
                    </g>
                  )}

                  {/* Clickable Field Polygons */}
                  {layers.fields &&
                    fields.map((f, idx) => {
                      const meta = STATUS_META[f.status];
                      const dim = !passes(f);
                      const isSel = selected?.id === f.id;
                      const cx = f.points.reduce((a, p) => a + p[0], 0) / f.points.length;
                      const cy = f.points.reduce((a, p) => a + p[1], 0) / f.points.length;
                      return (
                        <motion.g
                          key={f.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: dim ? 0.16 : 1 }}
                          transition={{ duration: 0.35, delay: inView ? idx * 0.03 : 0 }}
                          onClick={() => setSelected(isSel ? null : f)}
                          className="cursor-pointer"
                        >
                          <polygon
                            points={f.points.map((p) => p.join(',')).join(' ')}
                            fill={isSel ? 'rgba(163,230,53,0.34)' : meta.fill}
                            stroke={isSel ? '#D9F99D' : meta.color}
                            strokeWidth={isSel ? 3.2 : 1.7}
                            strokeDasharray={meta.dashed ? '6 6' : undefined}
                            className={isSel ? 'dash-flow' : ''}
                          />
                          <circle
                            cx={cx}
                            cy={cy}
                            r="4.5"
                            fill={URGENCY_META[f.urgency].color}
                            stroke="#171816"
                            strokeWidth="1.5"
                          />
                          <text
                            x={cx}
                            y={cy + 17}
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="11"
                            fontWeight="700"
                            style={{ pointerEvents: 'none' }}
                          >
                            {f.code}
                          </text>
                        </motion.g>
                      );
                    })}
                </svg>

                {/* Village labels */}
                {layers.villages &&
                  VILLAGES.map((v) => (
                    <div
                      key={v.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: `${v.x / 10}%`, top: `${(v.y / 620) * 100}%` }}
                    >
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1A1B19]/88 border border-[#A3E635]/30 backdrop-blur-xs">
                        <MapPin className="w-2.5 h-2.5 text-[#A3E635]" />
                        <span className="text-[9.5px] font-semibold text-white whitespace-nowrap">
                          {v.name}
                        </span>
                      </div>
                    </div>
                  ))}

                <div className="scanline" />

                <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-2 px-2.5 py-1.5 rounded-xl bg-[#1A1B19]/88 border border-white/10 backdrop-blur-sm">
                  {(Object.keys(STATUS_META) as FieldStatus[]).map((s) => (
                    <span key={s} className="flex items-center gap-1 text-[9.5px] text-[#D0D1CC]">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: STATUS_META[s].color }}
                      />
                      {STATUS_META[s].label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected Field Inspector Strip */}
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3.5 rounded-[18px] bg-[#2B2D2A] border border-white/10 p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono px-2.5 py-0.5 rounded-full bg-[#D9F99D] text-[#1A2E12] text-[11px] font-bold">
                        {selected.code}
                      </span>
                      <span className="font-display text-[15px] font-semibold text-white">
                        {selected.village}
                      </span>
                      <span className="text-[12px] text-[#9A9C96]">· {CROPS[selected.crop].short}</span>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#C6C8C2] cursor-pointer"
                      aria-label="Close field details"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11.5px] mb-3">
                    <div className="rounded-xl bg-[#212220] px-3 py-2">
                      <div className="text-[#9A9C96] text-[10px]">Est. residue</div>
                      <div className="font-mono font-bold text-[#D9F99D] text-[14px] tabular-nums">
                        {selected.residueT} t
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#212220] px-3 py-2">
                      <div className="text-[#9A9C96] text-[10px]">Urgency</div>
                      <div
                        className="font-bold text-[13px]"
                        style={{ color: URGENCY_META[selected.urgency].color }}
                      >
                        {URGENCY_META[selected.urgency].label}
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#212220] px-3 py-2">
                      <div className="text-[#9A9C96] text-[10px]">Window</div>
                      <div className="font-mono font-semibold text-white text-[11px] truncate">
                        {selected.window}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#9A9C96]">
                      Area <span className="font-mono text-white">{selected.areaHa} ha</span> · Status:{' '}
                      <strong className="text-white">{STATUS_META[selected.status].label}</strong>
                    </span>
                    <button
                      onClick={() =>
                        onRequestPickup({
                          village: selected.village,
                          crop: selected.crop,
                          area: selected.areaHa,
                          estimateT: selected.residueT,
                          harvest: selected.harvestDate,
                          pickup: selected.preferredCollectionDate,
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#D9F99D] hover:bg-[#A3E635] text-[#1A2E12] text-[11.5px] font-bold transition-colors cursor-pointer"
                    >
                      Request pickup
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="mt-3.5 rounded-[18px] bg-[#2B2D2A] border border-white/10 px-4 py-3 text-[12px] text-[#A4A6A0] flex items-center justify-between">
                  <span>Tap any field polygon on the map to inspect residue & schedule window.</span>
                  <span className="font-mono text-[#D9F99D] font-semibold shrink-0 ml-2">{fields.length} parcels</span>
                </div>
              )}
            </div>

            {/* Bottom-Left 3 Operations Dashboard Metric Tiles (Light Green + Gold + White) */}
            <div id="operations" className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-[#9A9C96] mb-2.5">
                <span>
                  Operations Dashboard · Registered:{' '}
                  <strong className="font-mono text-white">{fields.length} fields</strong>
                </span>
                <span>
                  Utilisation: <strong className="font-mono text-[#D9F99D]">{optM.machineryUtilisationPct}%</strong>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-[18px] bg-[#D9F99D] text-[#1A2E12] p-3.5 sm:p-4">
                  <div className="text-[17px] sm:text-[20px] font-bold leading-tight">
                    <CountUp value={Math.round(optM.totalResidueAvailableT)} suffix=" t" active={inView} />
                  </div>
                  <div className="text-[10.5px] text-[#284D16] mt-1 font-semibold">
                    Residue available
                  </div>
                </div>
                <div className="rounded-[18px] bg-[#FCEAB6] text-[#1A1B19] p-3.5 sm:p-4">
                  <div className="text-[17px] sm:text-[20px] font-bold leading-tight">
                    <CountUp value={requests.length} active={inView} />
                  </div>
                  <div className="text-[10.5px] text-[#5B4D25] mt-1 font-semibold">
                    Recovery requests
                  </div>
                </div>
                <div className="rounded-[18px] bg-white text-[#1A1B19] p-3.5 sm:p-4">
                  <div className="text-[17px] sm:text-[20px] font-bold leading-tight">
                    <CountUp value={Math.round(optM.totalResidueScheduledT)} suffix=" t" active={inView} />
                  </div>
                  <div className="text-[10.5px] text-[#6C6E6A] mt-1 font-semibold">
                    Scheduled ({optM.assignedFieldsCount} fields)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN: WHITE ANALYTICS CARD + LIGHT-GREEN CTA CARD ==================== */}
          <div id="analytics" className="lg:col-span-6 flex flex-col gap-5">
            {/* Crisp White Analytics & Impact Card */}
            <div className="rounded-[24px] bg-white text-[#1A1B19] p-5 sm:p-7 flex-1 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div>
                    <h3 className="font-display text-[19px] sm:text-[21px] font-bold text-[#1A1B19] leading-snug">
                      Analysis of residue recovery & scheduling
                    </h3>
                    <p className="text-[12px] text-[#7A7C76] mt-0.5">
                      Simulated model outputs vs verified audit balance
                    </p>
                  </div>

                  {/* Interactive Chart Mode Switcher */}
                  <div className="inline-flex rounded-full bg-[#F2F1EA] p-1 text-[11px] font-semibold">
                    {(
                      [
                        ['stacked', 'Crops'],
                        ['compare', 'AI vs Base'],
                        ['verified', 'Verified'],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                          tab === id
                            ? 'bg-[#1D1E1C] text-[#D9F99D] shadow-xs'
                            : 'text-[#6C6E6A] hover:text-[#1A1B19]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3 KPI Columns with Light-Green & Warm Borders */}
                <div className="grid grid-cols-3 gap-3 pb-5 mb-5 border-b border-[#EFECE4]">
                  <div className="border-l-[2.5px] border-[#84CC16] pl-3">
                    <div className="text-[10.5px] text-[#787A74] leading-tight">
                      Scheduled recovery (sim.)
                    </div>
                    <div className="font-mono text-[19px] sm:text-[22px] font-bold text-[#1A1B19] mt-1 tabular-nums">
                      {optM.totalResidueScheduledT} t
                    </div>
                  </div>
                  <div className="border-l-2 border-[#EAB308] pl-3">
                    <div className="text-[10.5px] text-[#787A74] leading-tight">
                      Cost vs FCFS baseline
                    </div>
                    <div className="font-mono text-[19px] sm:text-[22px] font-bold text-[#4D7C0F] mt-1 tabular-nums">
                      {costReductionPct >= 0 ? `−${costReductionPct}%` : `+${Math.abs(costReductionPct)}%`}
                    </div>
                  </div>
                  <div className="border-l-2 border-[#D4D3CA] pl-3">
                    <div className="text-[10.5px] text-[#787A74] leading-tight">
                      Deadline adherence (sim.)
                    </div>
                    <div className="font-mono text-[19px] sm:text-[22px] font-bold text-[#1A1B19] mt-1 tabular-nums">
                      {optM.deadlineAdherencePct}%
                    </div>
                  </div>
                </div>

                {/* TAB 1: Stacked Charcoal + Light Green + Soft Gold Bars */}
                {tab === 'stacked' && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#787A74] mb-4">
                      <span className="font-semibold text-[#1A1B19]">
                        Simulated harvest horizon (tonnes)
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#212220]" /> Wheat
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#84CC16]" /> Rice
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#FCE295]" /> Mustard
                        </span>
                      </div>
                    </div>

                    <div className="h-[195px] flex items-end justify-between gap-1.5 sm:gap-2.5 pt-2">
                      {STACKED_HORIZON_BARS.map((bar, idx) => {
                        const total = bar.wheat + bar.rice + bar.mustard;
                        const totalH = (total / maxStacked) * 100;
                        const wPct = (bar.wheat / total) * 100;
                        const rPct = (bar.rice / total) * 100;
                        const mPct = (bar.mustard / total) * 100;

                        return (
                          <div
                            key={bar.label}
                            className="flex-1 h-full flex flex-col items-center justify-end group"
                          >
                            <div className="w-full h-[165px] flex items-end justify-center">
                              <motion.div
                                initial={{ height: 0 }}
                                whileInView={{ height: `${totalH}%` }}
                                viewport={{ once: true }}
                                transition={{
                                  duration: 0.75,
                                  delay: idx * 0.05,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                title={`${bar.label}: ${total}t simulated (Wheat ${bar.wheat}t, Rice ${bar.rice}t, Mustard ${bar.mustard}t)`}
                                className="w-full max-w-[26px] rounded-t-[6px] overflow-hidden flex flex-col-reverse shadow-xs group-hover:opacity-90 transition-opacity"
                              >
                                <div style={{ height: `${wPct}%` }} className="bg-[#212220]" />
                                <div style={{ height: `${rPct}%` }} className="bg-[#84CC16]" />
                                <div style={{ height: `${mPct}%` }} className="bg-[#FCE295]" />
                              </motion.div>
                            </div>
                            <span className="font-mono text-[9px] text-[#8A8C86] font-medium mt-2 truncate">
                              {bar.label.replace('Oct ', 'O').replace('Nov ', 'N')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: Scheduling Comparison + Animated Cumulative Curve */}
                {tab === 'compare' && (
                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      {liveComparisonMetrics.map((m) => {
                        const max = Math.max(1, m.baseline, m.ai);
                        return (
                          <div key={m.label}>
                            <div className="flex justify-between text-[11.5px] mb-1">
                              <span className="font-medium text-[#3C3E3A]">{m.label}</span>
                              <span className="font-mono text-[#6C6E6A] tabular-nums">
                                {m.baseline} →{' '}
                                <strong className="text-[#4D7C0F]">
                                  {m.ai} {m.unit}
                                </strong>
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <div className="h-2.5 rounded-full bg-[#EFECE4] overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(m.baseline / max) * 100}%` }}
                                  transition={{ duration: 0.6 }}
                                  className="h-full rounded-full bg-[#B4B6AE]"
                                />
                              </div>
                              <div className="h-2.5 rounded-full bg-[#EFECE4] overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(m.ai / max) * 100}%` }}
                                  transition={{ duration: 0.8 }}
                                  className="h-full rounded-full bg-[#84CC16]"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-[#EFECE4]">
                      <div className="text-[11px] font-semibold text-[#5C5E59] mb-1">
                        Cumulative tonnes scheduled (FCFS baseline vs Smart Optimiser)
                      </div>
                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[125px]">
                        {[0, Math.round(maxCum / 2), Math.round(maxCum)].map((v) => (
                          <line
                            key={v}
                            x1={PAD_L}
                            y1={yAtDyn(v)}
                            x2={W - PAD_R}
                            y2={yAtDyn(v)}
                            stroke="#EFECE4"
                            strokeWidth="1"
                          />
                        ))}
                        <motion.path
                          d={baseLine}
                          fill="none"
                          stroke="#9A9C96"
                          strokeWidth="2"
                          strokeDasharray="5 5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.9 }}
                        />
                        <motion.path
                          d={aiLine}
                          fill="none"
                          stroke="#65A30D"
                          strokeWidth="3"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.1 }}
                        />
                        <text
                          x={xAt(cumulativeData.ai.length - 1, Math.max(2, cumulativeData.ai.length)) + 6}
                          y={yAtDyn(cumulativeData.ai[cumulativeData.ai.length - 1] ?? 0) + 4}
                          fill="#365314"
                          fontSize="10"
                          fontWeight="700"
                        >
                          {optM.totalResidueScheduledT} t
                        </text>
                      </svg>
                    </div>
                  </div>
                )}

                {/* TAB 3: Verified Impact Integrity Card */}
                {tab === 'verified' && (
                  <div className="rounded-[18px] bg-[#F1F6EA] border border-[#CFE4B7] p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#365314] mb-2">
                      <ShieldCheck className="w-4 h-4 text-[#65A30D]" />
                      Verified Environmental Impact
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-mono text-[36px] font-bold text-[#1A1B19] leading-none">
                        0
                      </span>
                      <span className="text-[14px] font-medium text-[#5C6652]">tonnes verified</span>
                    </div>
                    <p className="text-[12.5px] text-[#4C5642] leading-relaxed mb-3.5">
                      Simulated model gains are kept strictly separate from verified climate
                      accounting. Verified tonnes publish only after commercial harvest audits:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {['Weighbridge slips', 'Field audit logs', 'Before/after sat pairs'].map(
                        (item) => (
                          <div
                            key={item}
                            className="rounded-xl bg-white border border-[#D9E6C9] px-3 py-2 text-[11px] font-semibold text-[#1A1B19]"
                          >
                            {item}
                            <span className="block text-[9.5px] font-normal text-[#6C7366]">
                              Required
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0EFE7] flex items-center justify-between text-[11px] text-[#8A8C86]">
                <span>Simulated model outputs · not verified emissions</span>
                <span className="font-mono font-semibold text-[#365314]">Verified: 0 t</span>
              </div>
            </div>

            {/* Fresh Light-Green Action Card matching Reference's Yellow Bottom-Right Bento Card */}
            <div className="rounded-[24px] bg-gradient-to-br from-[#DCF8BE] via-[#E9FAD5] to-[#FCEAB6] text-[#1A1B19] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-md">
              <div className="max-w-[300px]">
                <h3 className="font-display text-[21px] font-bold text-[#1A2E12] leading-snug mb-1.5">
                  Start a Recovery Request
                </h3>
                <p className="text-[12.5px] text-[#35531C] leading-relaxed mb-4">
                  Register a Punjab field parcel into the simulated triage queue and test operator
                  matching.
                </p>

                <button
                  onClick={() => onRequestPickup()}
                  className="group inline-flex items-center cursor-pointer"
                >
                  <span className="px-4 py-2.5 rounded-full bg-[#1C1D1B] group-hover:bg-[#365314] text-white text-[12.5px] font-semibold transition-colors">
                    Request residue pickup
                  </span>
                  <span className="w-9 h-9 -ml-1.5 rounded-full bg-white border-[1.5px] border-[#1C1D1B] text-[#1C1D1B] flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </button>
              </div>

              {/* Circular Agricultural Thumbnail Cluster */}
              <div className="flex items-center -space-x-3 self-end sm:self-center">
                {[
                  EDITORIAL_IMAGES.indianFarmer,
                  EDITORIAL_IMAGES.balerField,
                  EDITORIAL_IMAGES.grainField,
                  EDITORIAL_IMAGES.modernHarvester,
                ].map((src, i) => (
                  <div
                    key={i}
                    className={`rounded-full overflow-hidden border-[3px] border-[#E4F8CA] shadow-sm ${
                      i === 1 ? 'w-14 h-14 z-10' : 'w-11 h-11'
                    }`}
                  >
                    <img src={src} alt="Punjab harvest operations" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
