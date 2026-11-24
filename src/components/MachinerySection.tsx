import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Tractor, Clock, IndianRupee, User, Radar, ShieldCheck, Route } from 'lucide-react';
import { MACHINES, ASSIGNMENTS, FIELDS, EDITORIAL_IMAGES } from '../data/paralicycleData';

const MACHINE_STATUS = {
  available: { label: 'Available', bg: '#E6F7D4', color: '#284D16' },
  'on-field': { label: 'On field', bg: '#FEF5DC', color: '#8D5F08' },
  service: { label: 'Service due', bg: '#FDECE9', color: '#B93822' },
};

export const MachinerySection: React.FC = () => {
  const [activeMachine, setActiveMachine] = useState<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ['start end', 'end start'],
  });
  const bannerImgY = useTransform(scrollYProgress, [0, 1], ['-9%', '9%']);
  const bannerImgScale = useTransform(scrollYProgress, [0, 1], [1.14, 1.04]);

  const totalTons = Math.round(ASSIGNMENTS.reduce((a, r) => a + r.tons, 0) * 10) / 10;
  const totalCost = ASSIGNMENTS.reduce((a, r) => a + r.cost, 0);
  const fieldById = (id: string) => FIELDS.find((f) => f.id === id);

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

        {/* Soft sky readability wash + bottom subtle grounding gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(226,238,245,0.86) 0%, rgba(226,238,245,0.22) 38%, rgba(25,24,18,0.14) 65%, rgba(20,19,14,0.62) 100%)',
          }}
        />

        {/* Top row */}
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

        {/* Bottom row: 3 light-green medallions left + 3 crisp stat tiles right */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-16">
          <div className="flex items-center gap-2.5">
            {[
              { icon: Tractor, title: 'Baler matching' },
              { icon: Route, title: 'OR-Tools routing' },
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
                P1–P3
              </div>
              <div className="text-[10px] text-[#284D16] mt-1 font-semibold leading-tight">
                Urgency triage
              </div>
            </div>
            <div className="rounded-[16px] bg-white/95 backdrop-blur-md px-4 py-3 text-center min-w-[96px] shadow-md">
              <div className="font-mono text-[19px] sm:text-[22px] font-bold text-[#1A1B19] leading-none">
                5 units
              </div>
              <div className="text-[10px] text-[#6C6E6A] mt-1 font-medium leading-tight">
                Demo fleet
              </div>
            </div>
            <div className="rounded-[16px] bg-white/95 backdrop-blur-md px-4 py-3 text-center min-w-[96px] shadow-md">
              <div className="font-mono text-[19px] sm:text-[22px] font-bold text-[#3F6212] leading-none tabular-nums">
                ₹142/t
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
            Machinery Matching & Scheduler
          </div>
          <h3 className="font-display text-[23px] sm:text-[29px] font-bold text-[#1A1B19] tracking-[-0.025em]">
            Fleet capacities, operator windows & recommended schedule
          </h3>
        </div>
        <span className="font-mono px-3 py-1 rounded-full bg-[#E8F7D4] border border-[#C6E89F] text-[#284D16] text-[10.5px] font-semibold">
          Simulated OR-Tools Output · Click a unit
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Fleet Cards */}
        <div className="lg:col-span-5 space-y-3">
          {MACHINES.map((m, i) => {
            const st = MACHINE_STATUS[m.status];
            const active = activeMachine === m.id;
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                onClick={() => setActiveMachine(active ? null : m.id)}
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
                  <span
                    className="px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                    style={
                      active
                        ? { background: 'rgba(217,249,157,0.18)', color: '#D9F99D' }
                        : { background: st.bg, color: st.color }
                    }
                  >
                    {st.label}
                  </span>
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
              </motion.button>
            );
          })}
        </div>

        {/* Right: Crisp White Collection Schedule Table */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 rounded-[24px] bg-white border border-[#E5E8DC] shadow-[0_10px_34px_rgba(26,27,25,0.04)] overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-[#EFECE4] flex items-center justify-between">
            <div>
              <h4 className="font-display text-[17px] font-bold text-[#1A1B19]">
                Recommended collection schedule
              </h4>
              <p className="text-[12px] text-[#787A74] mt-0.5">
                Priority-weighted assignments across the Nov 04 – Nov 08 planning horizon
              </p>
            </div>
            {activeMachine && (
              <button
                onClick={() => setActiveMachine(null)}
                className="text-[11.5px] font-semibold text-[#4D7C0F] hover:underline cursor-pointer"
              >
                Show all units
              </button>
            )}
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full min-w-[540px] text-[12.5px]">
              <thead>
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
                {ASSIGNMENTS.map((a) => {
                  const f = fieldById(a.fieldId);
                  const m = MACHINES.find((x) => x.id === a.machineId);
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
                      <td className="px-5 py-3.5 font-mono font-semibold text-[#1A1B19] whitespace-nowrap">
                        {a.day}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-mono font-semibold text-[#1A1B19]">{f?.code}</div>
                        <div className="text-[11px] text-[#787A74]">{f?.village}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-mono font-semibold text-[#1A1B19]">{m?.code}</div>
                        <div className="text-[11px] text-[#787A74]">{m?.type}</div>
                      </td>
                      <td className="px-3 py-3.5 font-mono font-bold text-[#1A1B19] tabular-nums whitespace-nowrap">
                        {a.tons} t
                      </td>
                      <td className="px-3 py-3.5 font-mono text-[#5C5E59] tabular-nums whitespace-nowrap">
                        {a.window}
                      </td>
                      <td className="px-3 py-3.5">
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
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-[#1A1B19] tabular-nums whitespace-nowrap">
                        ₹{a.cost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-[#EFECE4] bg-[#F6F8F2] grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-[#787A74] font-semibold">
                Scheduled load
              </div>
              <div className="font-mono text-[19px] font-bold text-[#1A1B19] tabular-nums">
                {totalTons} t
              </div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-[#787A74] font-semibold">
                Est. operating cost
              </div>
              <div className="font-mono text-[19px] font-bold text-[#1A1B19] tabular-nums">
                ₹{totalCost.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-[#787A74] font-semibold">
                Simulated avg / t
              </div>
              <div className="font-mono text-[19px] font-bold text-[#4D7C0F] tabular-nums">
                ₹{Math.round(totalCost / totalTons)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
