import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Trash2, Calendar, MapPin, Wheat, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CROPS } from '../lib/residueEstimator';
import { CollectionSchedule, Priority, RecoveryRequest } from '../types/paralicycle';

interface RecoveryRequestsSectionProps {
  requests: RecoveryRequest[];
  optimisedSchedule: CollectionSchedule;
  onOpenNewRequest: () => void;
  onDeleteRequest: (requestId: string) => void;
  onResetDemo: () => void;
}

export const RecoveryRequestsSection: React.FC<RecoveryRequestsSectionProps> = ({
  requests,
  optimisedSchedule,
  onOpenNewRequest,
  onDeleteRequest,
  onResetDemo,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [villageFilter, setVillageFilter] = useState<string>('all');

  const assignmentByReq = useMemo(() => {
    const map = new Map<string, { days: string[]; machines: string[]; deadlineMet: boolean }>();
    for (const a of optimisedSchedule.assignments) {
      const existing = map.get(a.requestId) ?? { days: [], machines: [], deadlineMet: true };
      if (!existing.days.includes(a.day)) existing.days.push(a.day);
      if (!existing.machines.includes(a.machineCode)) existing.machines.push(a.machineCode);
      if (!a.deadlineMet) existing.deadlineMet = false;
      map.set(a.requestId, existing);
    }
    return map;
  }, [optimisedSchedule]);

  const villages = useMemo(
    () => Array.from(new Set(requests.map((r) => r.village))),
    [requests]
  );

  const filtered = useMemo(
    () =>
      requests.filter(
        (r) =>
          (priorityFilter === 'all' || r.priority === priorityFilter) &&
          (villageFilter === 'all' || r.village === villageFilter)
      ),
    [requests, priorityFilter, villageFilter]
  );

  const unassignedSet = new Set(optimisedSchedule.unassignedRequestIds);

  return (
    <section id="requests" className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6 }}
        className="rounded-[28px] bg-white border border-[#E5E8DC] shadow-[0_12px_36px_rgba(26,27,25,0.04)] p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="font-mono inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4D7C0F] mb-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-[#65A30D]" />
              Recovery Requests Queue · Simulated Triage
            </div>
            <h3 className="font-display text-[23px] sm:text-[28px] font-bold text-[#1A1B19] tracking-[-0.02em]">
              Active field recovery requests ({requests.length})
            </h3>
            <p className="text-[13px] text-[#6C6E6A] mt-1">
              Every submitted parcel is persisted locally, assigned a P1–P3 priority, and fed directly into the scheduler.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onResetDemo}
              className="px-3.5 py-2 rounded-full bg-[#F6F8F2] hover:bg-[#EAECE3] border border-[#DFE4D5] text-[12px] font-semibold text-[#52544F] transition-colors cursor-pointer"
            >
              Reset demo data
            </button>
            <button
              type="button"
              onClick={onOpenNewRequest}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1D1B] hover:bg-[#365314] text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New recovery request
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {(['all', 'P1', 'P2', 'P3'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition-colors cursor-pointer ${
                priorityFilter === p
                  ? 'bg-[#1D1E1C] border-[#1D1E1C] text-[#D9F99D]'
                  : 'bg-[#F8F9F4] border-[#DFE4D5] text-[#52544F] hover:border-[#84CC16]'
              }`}
            >
              {p === 'all' ? 'All priorities' : `${p} priority`}
            </button>
          ))}

          <select
            aria-label="Filter requests by village"
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-[#F8F9F4] border border-[#DFE4D5] text-[12px] font-medium text-[#1A1B19] outline-none cursor-pointer"
          >
            <option value="all">All villages</option>
            {villages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Requests Table */}
        {filtered.length === 0 ? (
          <div className="rounded-[20px] bg-[#F6F8F2] border border-[#E5E8DC] p-8 text-center">
            <p className="text-[14px] font-semibold text-[#1A1B19]">No recovery requests match these filters.</p>
            <p className="text-[12.5px] text-[#6C6E6A] mt-1">
              Clear filters or submit a new field recovery request above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[18px] border border-[#ECEBE3]">
            <table className="w-full min-w-[740px] text-[12.5px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-[0.08em] text-[#7C8275] bg-[#F6F8F2]">
                  <th className="px-4 py-3 font-semibold">Request</th>
                  <th className="px-3 py-3 font-semibold">Village & Crop</th>
                  <th className="px-3 py-3 font-semibold">Area / Residue</th>
                  <th className="px-3 py-3 font-semibold">Collection Deadline</th>
                  <th className="px-3 py-3 font-semibold">Priority</th>
                  <th className="px-3 py-3 font-semibold">Schedule Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => {
                  const assigned = assignmentByReq.get(req.id);
                  const isUnassigned = unassignedSet.has(req.id) || !assigned;
                  return (
                    <tr key={req.id} className="border-t border-[#F0EFE7] hover:bg-[#FAFBF7]">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-[#1A1B19]">{req.code}</div>
                        <div className="text-[11px] text-[#6C6E6A]">{req.farmerName}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="inline-flex items-center gap-1 font-semibold text-[#1A1B19]">
                          <MapPin className="w-3 h-3 text-[#65A30D]" />
                          {req.village}
                        </div>
                        <div className="inline-flex items-center gap-1 text-[11px] text-[#6C6E6A] ml-2">
                          <Wheat className="w-3 h-3" />
                          {CROPS[req.crop].short}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono tabular-nums">
                        <div className="font-bold text-[#1A1B19]">{req.estimatedResidueT} t</div>
                        <div className="text-[11px] text-[#6C6E6A]">
                          {req.areaHa} ha · {req.availabilityRange[0]}–{req.availabilityRange[1]} t
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[#1A1B19] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#65A30D]" />
                          {req.preferredCollectionDate}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`font-mono px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            req.priority === 'P1'
                              ? 'bg-[#FDECE9] text-[#B93822]'
                              : req.priority === 'P2'
                                ? 'bg-[#E8F7D4] text-[#284D16]'
                                : 'bg-[#F0EFE7] text-[#5C5E59]'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {isUnassigned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FDECE9] text-[#B93822] text-[11px] font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            Unassigned (cap/window)
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              assigned.deadlineMet
                                ? 'bg-[#E8F7D4] text-[#284D16]'
                                : 'bg-[#FEF7E6] text-[#8D5F08]'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {assigned.machines.join(', ')} · {assigned.days.join(', ')}
                            {!assigned.deadlineMet && ' (Late)'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteRequest(req.id)}
                          aria-label={`Remove request ${req.code}`}
                          className="p-1.5 rounded-full text-[#787A74] hover:text-[#B93822] hover:bg-[#FDECE9] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </section>
  );
};
