import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Tractor,
  Clock,
  IndianRupee,
  User,
  Radar,
  ShieldCheck,
  Route,
  RefreshCw,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { EDITORIAL_IMAGES, OPERATORS } from '../data/paralicycleData';
import { CollectionSchedule, Machinery, MachineStatus, ScheduleStrategy } from '../types/paralicycle';

interface MachinerySectionProps {
  machinery: Machinery[];
  optimisedSchedule: CollectionSchedule;
  baselineSchedule: CollectionSchedule;
  onToggleMachineStatus: (machineId: string, nextStatus: MachineStatus) => void;
  onRecompute: () => void;
}

const MACHINE_STATUS: Record<MachineStatus, { label: string; bg: string; color: string; next: MachineStatus }> = {
  available: { label: 'Available', bg: '#E6F7D4', color: '#284D16', next: 'on-field' },
  'on-field': { label: 'On field', bg: '#FEF5DC', color: '#8D5F08', next: 'service' },
  service: { label: 'Service due', bg: '#FDECE9', color: '#B93822', next: 'available' },
};

export const MachinerySection: React.FC<MachinerySectionProps> = ({
  machinery,
  optimisedSchedule,
  baselineSchedule,
  onToggleMachineStatus,
  onRecompute,
}) => {
  const [activeMachine, setActiveMachine] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<ScheduleStrategy>('optimised');
  const [showOperators, setShowOperators] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ['start end', 'end start'],
  });
  const bannerImgY = useTransform(scrollYProgress, [0, 1], ['-9%', '9%']);
  const bannerImgScale = useTransform(scrollYProgress, [0, 1], [1.14, 1.04]);

  const currentSchedule = strategy === 'optimised' ? optimisedSchedule : baselineSchedule;
  const { metrics, assignments, infeasibilityNotes } = currentSchedule;

  const optM = optimisedSchedule.metrics;
  const baseM = baselineSchedule.metrics;
  const costSavings = baseM.totalCost - optM.totalCost;

  return (
    <section id="machinery" className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Full-Width Sunlit Editorial Banner with Scroll Parallax */}
      <motion.div
        ref={bannerRef}
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full min-h-[340px] sm:min-h-[410px] rounded-[28px] overflow-hidden mb-10 shadow-[0_20px_54px_rgba(26,27,25,0.1)] flex flex-col justify-between p-6 sm:p-9"
      >
        <motion.div
          style={{ y: bannerImgY, scale: bannerImgScale }}
          className="absolute inset-0 will-change-transform pointer-events-none"
        >
          <img
            src={EDITORIAL_IMAGES.farmerDroneBanner}
            alt="Agronomist coordinating residue recovery operations in a sunlit wheat field"
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(226,238,245,0.86) 0%, rgba(226,238,245,0.22) 38%, rgba(25,24,18,0.14) 65%, rgba(20,19,14,0.62) 100%)',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-start gap-4">
          <div className="hidden md:block md:col-span-3 text-[11px] font-semibold text-[#334039] leading-relaxed">
            Consistency · Optimisation
            <br />
            and priority-aware dispatch.
          </div>

          <h2 className="font-display md:col-span-6 md:text-center text-[24px] sm:text-[32px] font-bold leading-[1.16] tracking-[-0.025em] text-[#1A1B19]">
            We coordinate balers, operators, and field priorities{' '}
            <span className="font-serif-accent italic font-normal text-[#365314]">
              with precision.
            </span>
          </h2>

          <div className="hidden md:flex md:col-span-3 justify-end items-center gap-1.5 text-[12px] font-display font-bold text-[#1A1B19]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16]" />
            <span>PARALICYCLE</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-16">
          <div className="flex items-center gap-2.5">
            {[
              { icon: Tractor, title: 'Baler matching' },
              { icon: Route, title: 'Cost & distance routing' },
              { icon: ShieldCheck, title: 'Deadline adherence' },
            ].map(({ icon: Icon, title }) => (
              <div
                key={title}
                title={title}
                className="w-11 h-11 rounded-full bg-[#1C2A16]/75 backdrop-blur-md border border-[#D9F99D]/45 flex items-center justify-center text-[#D9F99D] shadow-sm"
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="rounded-[16px] bg-[#D9F99D]/95 backdrop-blur-md border border-[#BEF264] px-4 py-3 text-center min-w-[96px] shadow-md">
              <div className="font-mono text-[19px] sm:text-[22px] font-bold text-[#1A2E12] leading-none">
                {optM.deadlineAdherencePct}%
              </div>
              <div className="text-[10px] text-[#284D16] mt-1 font-semibold leading-tight">
                On-time (opt.)
              </div>
            </div>
            <div className="rounded-[16px] bg-white/95 backdrop-blur-md px-4 py-3 text-center min-w-[96px] shadow-md">
              <div className="font-mono text-[19px] sm:text-[22px] font-bold text-[#1A1B19] leading-none">
                {machinery.filter((m) => m.status !== 'service').length}/{machinery.length}
              </div>
              <div className="text-[10px] text-[#6C6E6A] mt-1 font-medium leading-tight">
                Active units
              </div>
            </div>
            <div className="rounded-[16px] bg-white/95 backdrop-blur-md px-4 py-3 text-center min-w-[96px] shadow-md">
              <div className="font-mono text-[19px] sm:text-[22px] font-bold text-[#3F6212] leading-none tabular-nums">
                ₹{optM.avgCostPerTonne}/t
              </div>
              <div className="text-[10px] text-[#6C6E6A] mt-1 font-medium leading-tight">
                Sim. avg cost
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Machinery Matching & Scheduler Section */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="font-mono inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4D7C0F] mb-1.5">
            <Radar className="w-3.5 h-3.5 text-[#65A30D]" />
            Machinery Management & Smart Scheduler
          </div>
          <h3 className="font-display text-[23px] sm:text-[29px] font-bold text-[#1A1B19] tracking-[-0.025em]">
            Fleet capacities, operators & constraint-based schedule
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOperators((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold border transition-colors cursor-pointer ${
              showOperators
                ? 'bg-[#1D1E1C] border-[#1D1E1C] text-[#D9F99D]'
                : 'bg-white border-[#DFE4D5] text-[#52544F] hover:border-[#84CC16]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Operators ({OPERATORS.length})
          </button>
          <button
            type="button"
            onClick={onRecompute}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E8F7D4] hover:bg-[#D9F99D] border border-[#C6E89F] text-[#284D16] text-[11.5px] font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-run scheduler
          </button>
        </div>
      </div>

      {/* Optional Operators Directory */}
      {showOperators && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {OPERATORS.map((op) => (
            <div
              key={op.id}
              className="rounded-[18px] bg-white border border-[#E5E8DC] p-3.5 text-[12px]"
            >
              <div className="font-display font-bold text-[#1A1B19]">{op.name}</div>
              <div className="font-mono text-[11px] text-[#6C6E6A] mt-0.5">{op.phone}</div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-[#4D7C0F] font-semibold">
                <span>{op.experienceYears} yrs exp</span>
                <span>★ {op.rating}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Optimiser vs FCFS Baseline Summary Strip */}
      <div className="rounded-[22px] bg-[#F1F4EA] border border-[#DFE4D4] p-4 sm:p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-[#6C6E6A] font-semibold">
            Strategy Comparison (Same Inputs)
          </div>
          <div className="font-display text-[15px] font-bold text-[#1A1B19] mt-0.5">
            Priority Optimiser vs FCFS
          </div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-[#6C6E6A] font-semibold">
            Missed Deadlines
          </div>
          <div className="font-mono text-[16px] font-bold text-[#1A1B19] mt-0.5 tabular-nums">
            <span className="text-[#4D7C0F]">{optM.missedDeadlinesCount}</span>
            <span className="text-[#8A8C86] text-[12px] font-normal"> vs {baseM.missedDeadlinesCount} (FCFS)</span>
          </div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-[#6C6E6A] font-semibold">
            Total Cost (Op + Travel)
          </div>
          <div className="font-mono text-[16px] font-bold text-[#1A1B19] mt-0.5 tabular-nums">
            ₹{optM.totalCost.toLocaleString('en-IN')}
            <span className="text-[#4D7C0F] text-[11.5px] font-semibold ml-1.5">
              {costSavings >= 0 ? `(-₹${costSavings.toLocaleString('en-IN')})` : `(+₹${Math.abs(costSavings).toLocaleString('en-IN')})`}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-[#6C6E6A] font-semibold">
            Fleet Utilisation
          </div>
          <div className="font-mono text-[16px] font-bold text-[#1A1B19] mt-0.5 tabular-nums">
            {optM.machineryUtilisationPct}%
            <span className="text-[#8A8C86] text-[12px] font-normal"> vs {baseM.machineryUtilisationPct}% (FCFS)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Fleet Cards with Status Toggle */}
        <div className="lg:col-span-5 space-y-3">
          {machinery.map((m, i) => {
            const st = MACHINE_STATUS[m.status];
            const active = activeMachine === m.id;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                onClick={() => setActiveMachine(active ? null : m.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveMachine(active ? null : m.id);
                  }
                }}
                className={`w-full text-left rounded-[20px] border p-4 sm:p-5 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#212220] border-[#212220] text-white shadow-lg'
                    : 'bg-white border-[#E5E8DC] text-[#1A1B19] hover:border-[#84CC16] shadow-[0_4px_16px_rgba(26,27,25,0.03)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        active
                          ? 'bg-[#D9F99D] text-[#1A2E12]'
                          : 'bg-[#E8F7D4] text-[#284D16]'
                      }`}
                    >
                      <Tractor className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-display text-[14.5px] font-bold leading-tight">
                        {m.name}
                      </div>
                      <div
                        className={`text-[11.5px] ${
                          active ? 'text-[#A6A8A2]' : 'text-[#787A74]'
                        }`}
                      >
                        <span className="font-mono">{m.code}</span> · {m.type}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Click to cycle machine availability"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMachineStatus(m.id, st.next);
                    }}
                    className="px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-transform hover:scale-105 cursor-pointer"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {st.label} ↻
                  </button>
                </div>

                <div
                  className={`grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] ${
                    active ? 'text-[#C8CAC4]' : 'text-[#5C5E59]'
                  }`}
                >
                  <span>
                    Cap{' '}
                    <strong className={`font-mono ${active ? 'text-white' : 'text-[#1A1B19]'}`}>
                      {m.capacityTDay} t/d
                    </strong>
                  </span>
                  <span className="inline-flex items-center gap-1 truncate">
                    <User className="w-3 h-3 shrink-0 opacity-70" />
                    <span className="truncate">{m.operator}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-[11px]">
                    <Clock className="w-3 h-3 shrink-0 opacity-70" />
                    {m.window}
                  </span>
                  <span className="font-mono inline-flex items-center gap-0.5 font-bold tabular-nums">
                    <IndianRupee className="w-3 h-3 shrink-0" />
                    <span className={active ? 'text-[#D9F99D]' : 'text-[#3F6212]'}>
                      {m.costPerHr.toLocaleString('en-IN')}/hr
                    </span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right: Dynamic Collection Schedule Table */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 rounded-[24px] bg-white border border-[#E5E8DC] shadow-[0_10px_34px_rgba(26,27,25,0.04)] overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-[#EFECE4] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-display text-[17px] font-bold text-[#1A1B19]">
                Generated collection schedule
              </h4>
              <p className="text-[12px] text-[#787A74] mt-0.5">
                {strategy === 'optimised'
                  ? 'Priority-weighted & cost-minimised schedule (Nov 04 – Nov 13)'
                  : 'First-come-first-served (FCFS) baseline on identical constraints'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-[#F6F8F2] p-1 border border-[#E5E8DC]">
              <button
                type="button"
                onClick={() => setStrategy('optimised')}
                className={`px-3 py-1 rounded-full text-[11.5px] font-semibold transition-colors cursor-pointer ${
                  strategy === 'optimised'
                    ? 'bg-[#1D1E1C] text-[#D9F99D]'
                    : 'text-[#5C5E59] hover:text-[#1A1B19]'
                }`}
              >
                Smart Optimiser
              </button>
              <button
                type="button"
                onClick={() => setStrategy('fcfs')}
                className={`px-3 py-1 rounded-full text-[11.5px] font-semibold transition-colors cursor-pointer ${
                  strategy === 'fcfs'
                    ? 'bg-[#1D1E1C] text-[#D9F99D]'
                    : 'text-[#5C5E59] hover:text-[#1A1B19]'
                }`}
              >
                FCFS Baseline
              </button>
            </div>
          </div>

          {infeasibilityNotes.length > 0 && (
            <div className="px-6 py-3 bg-[#FEF2F0] border-b border-[#F7C9C1] text-[12px] text-[#B93822] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Capacity / availability constraint:</strong> {infeasibilityNotes[0]}
                {infeasibilityNotes.length > 1 && ` (+${infeasibilityNotes.length - 1} more)`}
              </div>
            </div>
          )}

          {activeMachine && (
            <div className="px-6 py-2 bg-[#E8F7D4]/60 border-b border-[#D9E6C9] flex items-center justify-between text-[12px]">
              <span className="text-[#284D16] font-medium">
                Filtering schedule by selected unit
              </span>
              <button
                type="button"
                onClick={() => setActiveMachine(null)}
                className="font-semibold text-[#365314] hover:underline cursor-pointer"
              >
                Show all units
              </button>
            </div>
          )}

          <div className="overflow-x-auto flex-1 max-h-[520px] overflow-y-auto">
            {assignments.length === 0 ? (
              <div className="p-8 text-center text-[13.5px] text-[#6C6E6A]">
                No assignments generated. Enable at least one machinery unit or add recovery requests.
              </div>
            ) : (
              <table className="w-full min-w-[580px] text-[12.5px]">
                <thead className="sticky top-0 z-10">
                  <tr className="text-left text-[10.5px] uppercase tracking-[0.08em] text-[#7C8275] bg-[#F6F8F2]">
                    <th className="px-5 py-3 font-semibold">Day</th>
                    <th className="px-3 py-3 font-semibold">Field</th>
                    <th className="px-3 py-3 font-semibold">Machine</th>
                    <th className="px-3 py-3 font-semibold">Load</th>
                    <th className="px-3 py-3 font-semibold">Window</th>
                    <th className="px-3 py-3 font-semibold">Priority</th>
                    <th className="px-5 py-3 font-semibold text-right">Est. cost</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => {
                    const dim = activeMachine !== null && activeMachine !== a.machineId;
                    const hi = activeMachine === a.machineId;
                    return (
                      <tr
                        key={a.id}
                        className={`border-t border-[#F0EFE7] transition-all ${
                          hi
                            ? 'bg-[#E8F7D4]/75'
                            : dim
                              ? 'opacity-30'
                              : 'hover:bg-[#F8FAF4]'
                        }`}
                      >
                        <td className="px-5 py-3 font-mono font-semibold text-[#1A1B19] whitespace-nowrap">
                          {a.day}
                          {!a.deadlineMet && (
                            <span className="ml-1.5 text-[10px] text-[#B93822] font-bold">LATE</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-mono font-semibold text-[#1A1B19]">{a.fieldCode}</div>
                          <div className="text-[11px] text-[#787A74]">{a.village}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-mono font-semibold text-[#1A1B19]">{a.machineCode}</div>
                          <div className="text-[11px] text-[#787A74]">{a.travelKm} km deadhead</div>
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-[#1A1B19] tabular-nums whitespace-nowrap">
                          {a.tons} t
                        </td>
                        <td className="px-3 py-3 font-mono text-[#5C5E59] tabular-nums whitespace-nowrap">
                          {a.window}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`font-mono px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                              a.priority === 'P1'
                                ? 'bg-[#FDECE9] text-[#B93822]'
                                : a.priority === 'P2'
                                  ? 'bg-[#E8F7D4] text-[#284D16]'
                                  : 'bg-[#F0EFE7] text-[#5C5E59]'
                            }`}
                          >
                            {a.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-bold text-[#1A1B19] tabular-nums whitespace-nowrap">
                          ₹{a.cost.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-6 py-4 border-t border-[#EFECE4] bg-[#F6F8F2] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-[#787A74] font-semibold">
                Scheduled load
              </div>
              <div className="font-mono text-[18px] font-bold text-[#1A1B19] tabular-nums">
                {metrics.totalResidueScheduledT} t
              </div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-[#787A74] font-semibold">
                Est. total cost
              </div>
              <div className="font-mono text-[18px] font-bold text-[#1A1B19] tabular-nums">
                ₹{metrics.totalCost.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-[#787A74] font-semibold">
                Avg cost / t
              </div>
              <div className="font-mono text-[18px] font-bold text-[#4D7C0F] tabular-nums">
                ₹{metrics.avgCostPerTonne}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-[#787A74] font-semibold">
                Missed deadlines
              </div>
              <div className={`font-mono text-[18px] font-bold tabular-nums ${metrics.missedDeadlinesCount > 0 ? 'text-[#B93822]' : 'text-[#284D16]'}`}>
                {metrics.missedDeadlinesCount}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
