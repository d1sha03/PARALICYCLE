import {
  Assignment,
  CollectionSchedule,
  Field,
  Machinery,
  Priority,
  RecoveryRequest,
  ScheduleStrategy,
  SchedulerMetrics,
  Village,
} from '../types/paralicycle';
import { formatShortDate, round1 } from './residueEstimator';

const KM_PER_SVG_UNIT = 0.045;
const PRIORITY_RANK: Record<Priority, number> = { P1: 0, P2: 1, P3: 2 };

export function buildHorizonDates(startIso: string, days: number): string[] {
  const result: string[] = [];
  const start = new Date(`${startIso}T00:00:00`);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function getFieldCoords(
  req: RecoveryRequest,
  fields: Field[],
  villages: Village[]
): [number, number] {
  const field = fields.find((f) => f.id === req.fieldId);
  if (field) return field.centroid;
  const village = villages.find((v) => v.name === req.village);
  if (village) return [village.x, village.y];
  return [500, 310];
}

function getVillageCoords(villageId: string, villages: Village[]): [number, number] {
  const v = villages.find((x) => x.id === villageId);
  return v ? [v.x, v.y] : [500, 310];
}

function distanceKm(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.round(Math.hypot(dx, dy) * KM_PER_SVG_UNIT * 10) / 10;
}

function formatTimeWindow(usedBeforeT: number, assignedT: number, capTDay: number): string {
  const shiftStartHr = 6;
  const shiftHours = 10;
  const startOffset = (usedBeforeT / capTDay) * shiftHours;
  const durHours = Math.max(1.5, (assignedT / capTDay) * shiftHours);
  const toHHMM = (hrFloat: number) => {
    const totalMins = Math.round((shiftStartHr + hrFloat) * 60);
    const hh = Math.min(20, Math.floor(totalMins / 60));
    const mm = totalMins % 60 < 30 ? '00' : '30';
    return `${String(hh).padStart(2, '0')}:${mm}`;
  };
  return `${toHHMM(startOffset)} – ${toHHMM(startOffset + durHours)}`;
}

/**
 * Constraint-based machinery allocation & scheduling engine.
 * Enforces:
 * - Machinery in 'service' status cannot be assigned.
 * - Machinery can only be assigned on days within [availableFrom, availableTo].
 * - Total tonnage assigned to a machine on any single day never exceeds capacityTDay.
 * - Supports multi-day chunking for large fields that exceed a single machine's daily capacity.
 * - Compares 'optimised' (priority + deadline + travel/operating cost) vs 'fcfs' (arrival order, first available).
 */
export function generateSchedule(params: {
  strategy: ScheduleStrategy;
  requests: RecoveryRequest[];
  fields: Field[];
  machinery: Machinery[];
  villages: Village[];
  horizonStart?: string;
  horizonDays?: number;
}): CollectionSchedule {
  const {
    strategy,
    requests,
    fields,
    machinery,
    villages,
    horizonStart = '2026-11-04',
    horizonDays = 10,
  } = params;

  const horizonDates = buildHorizonDates(horizonStart, horizonDays);
  const horizonEnd = horizonDates[horizonDates.length - 1];

  // Track remaining capacity per machine per day
  const remainingCap: Record<string, Record<string, number>> = {};
  const lastLocation: Record<string, Record<string, [number, number]>> = {};

  const activeMachines = machinery.filter((m) => m.status !== 'service');
  for (const m of activeMachines) {
    remainingCap[m.id] = {};
    lastLocation[m.id] = {};
    const homeCoords = getVillageCoords(m.homeVillageId, villages);
    for (const day of horizonDates) {
      if (day >= m.availableFrom && day <= m.availableTo) {
        remainingCap[m.id][day] = m.capacityTDay;
        lastLocation[m.id][day] = homeCoords;
      } else {
        remainingCap[m.id][day] = 0;
      }
    }
  }

  // Filter schedulable requests (exclude already completed)
  const queue = requests.filter((r) => r.status !== 'completed');

  const orderedRequests =
    strategy === 'optimised'
      ? [...queue].sort((a, b) => {
          const pDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
          if (pDiff !== 0) return pDiff;
          if (a.preferredCollectionDate !== b.preferredCollectionDate) {
            return a.preferredCollectionDate.localeCompare(b.preferredCollectionDate);
          }
          return b.estimatedResidueT - a.estimatedResidueT;
        })
      : [...queue].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const assignments: Assignment[] = [];
  const unassignedRequestIds: string[] = [];
  const missedDeadlineRequestIds: string[] = [];
  const infeasibilityNotes: string[] = [];

  if (activeMachines.length === 0 && orderedRequests.length > 0) {
    infeasibilityNotes.push('No operational machinery units available (all units in service).');
  }

  let assignSeq = 1;

  for (const req of orderedRequests) {
    const fieldCoords = getFieldCoords(req, fields, villages);
    const fieldObj = fields.find((f) => f.id === req.fieldId);
    const fieldCode = fieldObj ? fieldObj.code : req.code;
    let remainingToSchedule = req.estimatedResidueT;
    let reqMissedDeadline = false;
    const reqAssignments: Assignment[] = [];

    if (strategy === 'optimised') {
      // Try to assign to the lowest-cost feasible (machine, day) slots, preferring on-time days
      while (remainingToSchedule > 0.05) {
        let bestChoice: {
          machine: Machinery;
          day: string;
          tons: number;
          travelKm: number;
          operatingCost: number;
          travelCost: number;
          score: number;
        } | null = null;

        for (const m of activeMachines) {
          for (const day of horizonDates) {
            const cap = remainingCap[m.id]?.[day] ?? 0;
            if (cap < 1 && cap < remainingToSchedule) continue;
            if (cap <= 0) continue;

            const tons = round1(Math.min(remainingToSchedule, cap));
            const prevLoc = lastLocation[m.id][day];
            const travelKm = distanceKm(prevLoc, fieldCoords);
            const hoursRequired = (tons / m.capacityTDay) * 8;
            const operatingCost = Math.round(hoursRequired * m.costPerHr);
            const travelCost = Math.round(travelKm * m.travelCostPerKm);
            const isLate = day > req.preferredCollectionDate;
            const latePenalty = isLate ? 25000 : 0;
            // Prefer single-slot fit when possible
            const splitPenalty = tons < remainingToSchedule ? 1500 : 0;
            const score = operatingCost + travelCost + latePenalty + splitPenalty;

            if (!bestChoice || score < bestChoice.score) {
              bestChoice = {
                machine: m,
                day,
                tons,
                travelKm,
                operatingCost,
                travelCost,
                score,
              };
            }
          }
        }

        if (!bestChoice) break;

        const { machine, day, tons, travelKm, operatingCost, travelCost } = bestChoice;
        const usedBefore = machine.capacityTDay - remainingCap[machine.id][day];
        remainingCap[machine.id][day] = round1(remainingCap[machine.id][day] - tons);
        lastLocation[machine.id][day] = fieldCoords;
        remainingToSchedule = round1(remainingToSchedule - tons);

        const deadlineMet = day <= req.preferredCollectionDate;
        if (!deadlineMet) reqMissedDeadline = true;

        reqAssignments.push({
          id: `${strategy}-a${assignSeq++}`,
          requestId: req.id,
          fieldId: req.fieldId,
          fieldCode,
          village: req.village,
          machineId: machine.id,
          machineCode: machine.code,
          operatorName: machine.operator,
          day: formatShortDate(day),
          dateIso: day,
          tons,
          window: formatTimeWindow(usedBefore, tons, machine.capacityTDay),
          travelKm,
          operatingCost,
          travelCost,
          cost: operatingCost + travelCost,
          priority: req.priority,
          deadlineMet,
        });
      }
    } else {
      // FCFS baseline: iterate days chronologically, pick first machine with capacity
      for (const day of horizonDates) {
        if (remainingToSchedule <= 0.05) break;
        for (const m of activeMachines) {
          if (remainingToSchedule <= 0.05) break;
          const cap = remainingCap[m.id]?.[day] ?? 0;
          if (cap <= 0) continue;

          const tons = round1(Math.min(remainingToSchedule, cap));
          const prevLoc = lastLocation[m.id][day];
          const travelKm = distanceKm(prevLoc, fieldCoords);
          const hoursRequired = (tons / m.capacityTDay) * 8;
          const operatingCost = Math.round(hoursRequired * m.costPerHr);
          const travelCost = Math.round(travelKm * m.travelCostPerKm);
          const usedBefore = m.capacityTDay - cap;

          remainingCap[m.id][day] = round1(cap - tons);
          lastLocation[m.id][day] = fieldCoords;
          remainingToSchedule = round1(remainingToSchedule - tons);

          const deadlineMet = day <= req.preferredCollectionDate;
          if (!deadlineMet) reqMissedDeadline = true;

          reqAssignments.push({
            id: `${strategy}-a${assignSeq++}`,
            requestId: req.id,
            fieldId: req.fieldId,
            fieldCode,
            village: req.village,
            machineId: m.id,
            machineCode: m.code,
            operatorName: m.operator,
            day: formatShortDate(day),
            dateIso: day,
            tons,
            window: formatTimeWindow(usedBefore, tons, m.capacityTDay),
            travelKm,
            operatingCost,
            travelCost,
            cost: operatingCost + travelCost,
            priority: req.priority,
            deadlineMet,
          });
        }
      }
    }

    if (remainingToSchedule > 0.05) {
      unassignedRequestIds.push(req.id);
      infeasibilityNotes.push(
        `${fieldCode} (${req.village}): ${remainingToSchedule} t could not be scheduled within fleet capacity/windows.`
      );
    }
    if (reqMissedDeadline || remainingToSchedule > 0.05) {
      missedDeadlineRequestIds.push(req.id);
    }

    assignments.push(...reqAssignments);
  }

  // Sort final assignments chronologically by dateIso then machineCode
  assignments.sort((a, b) =>
    a.dateIso !== b.dateIso
      ? a.dateIso.localeCompare(b.dateIso)
      : a.machineCode.localeCompare(b.machineCode)
  );

  // Calculate metrics
  const totalResidueAvailableT = round1(
    orderedRequests.reduce((acc, r) => acc + r.estimatedResidueT, 0)
  );
  const totalResidueScheduledT = round1(
    assignments.reduce((acc, a) => acc + a.tons, 0)
  );
  const scheduledRequestIds = new Set(assignments.map((a) => a.requestId));
  const assignedFieldsCount = scheduledRequestIds.size;
  const unassignedFieldsCount = unassignedRequestIds.length;
  const missedDeadlinesCount = missedDeadlineRequestIds.length;

  let totalPossibleCapacityT = 0;
  for (const m of activeMachines) {
    for (const day of horizonDates) {
      if (day >= m.availableFrom && day <= m.availableTo) {
        totalPossibleCapacityT += m.capacityTDay;
      }
    }
  }
  const machineryUtilisationPct =
    totalPossibleCapacityT > 0
      ? Math.min(100, Math.round((totalResidueScheduledT / totalPossibleCapacityT) * 100))
      : 0;

  const totalOperatingCost = assignments.reduce((acc, a) => acc + a.operatingCost, 0);
  const totalTravelCost = assignments.reduce((acc, a) => acc + a.travelCost, 0);
  const totalCost = totalOperatingCost + totalTravelCost;
  const avgCostPerTonne =
    totalResidueScheduledT > 0 ? Math.round(totalCost / totalResidueScheduledT) : 0;

  const onTimeRequests = orderedRequests.length - missedDeadlinesCount;
  const deadlineAdherencePct =
    orderedRequests.length > 0
      ? Math.round((onTimeRequests / orderedRequests.length) * 100)
      : 100;

  const metrics: SchedulerMetrics = {
    totalResidueAvailableT,
    totalResidueScheduledT,
    assignedFieldsCount,
    totalRequestsCount: orderedRequests.length,
    unassignedFieldsCount,
    missedDeadlinesCount,
    machineryUtilisationPct,
    totalOperatingCost,
    totalTravelCost,
    totalCost,
    avgCostPerTonne,
    deadlineAdherencePct,
  };

  return {
    id: `sched-${strategy}-${horizonStart}`,
    strategy,
    generatedAt: new Date().toISOString(),
    horizonStart,
    horizonEnd,
    assignments,
    unassignedRequestIds,
    missedDeadlineRequestIds,
    metrics,
    infeasibilityNotes,
  };
}
