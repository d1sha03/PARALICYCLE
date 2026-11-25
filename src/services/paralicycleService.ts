import {
  CollectionSchedule,
  Crop,
  Field,
  Machinery,
  MachineStatus,
  RecoveryRequest,
} from '../types/paralicycle';
import {
  computeCentroid,
  FIELDS,
  INITIAL_MACHINERY,
  INITIAL_REQUESTS,
  VILLAGES,
} from '../data/paralicycleData';
import { calculateResidueEstimate, formatShortDate } from '../lib/residueEstimator';
import { generateSchedule } from '../lib/scheduler';

const STORAGE_KEY = 'paralicycle_mvp_state_v1';

export const API_CONFIG = {
  mode: 'simulated-local' as const,
  fastApiBaseUrl: import.meta.env?.VITE_FASTAPI_URL ?? '',
  supabaseConfigured: Boolean(import.meta.env?.VITE_SUPABASE_URL),
};

export interface AppStateSnapshot {
  fields: Field[];
  machinery: Machinery[];
  requests: RecoveryRequest[];
  optimisedSchedule: CollectionSchedule;
  baselineSchedule: CollectionSchedule;
}

export interface CreateRequestPayload {
  farmerName: string;
  phone: string;
  village: string;
  crop: Crop;
  areaHa: number;
  harvestDate: string;
  preferredCollectionDate: string;
  notes: string;
}

function buildSchedules(
  requests: RecoveryRequest[],
  fields: Field[],
  machinery: Machinery[]
): { optimisedSchedule: CollectionSchedule; baselineSchedule: CollectionSchedule } {
  const optimisedSchedule = generateSchedule({
    strategy: 'optimised',
    requests,
    fields,
    machinery,
    villages: VILLAGES,
  });
  const baselineSchedule = generateSchedule({
    strategy: 'fcfs',
    requests,
    fields,
    machinery,
    villages: VILLAGES,
  });
  return { optimisedSchedule, baselineSchedule };
}

function createPolygonNearVillage(villageName: string, index: number): [number, number][] {
  const v = VILLAGES.find((x) => x.name === villageName) ?? VILLAGES[0];
  const offsetX = ((index % 3) - 1) * 42;
  const offsetY = (Math.floor(index / 3) % 2 === 0 ? 1 : -1) * 34;
  const cx = Math.max(80, Math.min(900, v.x + offsetX));
  const cy = Math.max(80, Math.min(520, v.y + offsetY));
  return [
    [cx - 28, cy - 22],
    [cx + 26, cy - 26],
    [cx + 34, cy + 18],
    [cx - 22, cy + 26],
  ];
}

export function loadInitialState(): AppStateSnapshot {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          fields: Field[];
          machinery: Machinery[];
          requests: RecoveryRequest[];
        };
        if (
          Array.isArray(parsed.fields) &&
          Array.isArray(parsed.machinery) &&
          Array.isArray(parsed.requests)
        ) {
          const schedules = buildSchedules(parsed.requests, parsed.fields, parsed.machinery);
          return { ...parsed, ...schedules };
        }
      }
    } catch {
      // Fallback to deterministic seed state
    }
  }

  const schedules = buildSchedules(INITIAL_REQUESTS, FIELDS, INITIAL_MACHINERY);
  return {
    fields: FIELDS,
    machinery: INITIAL_MACHINERY,
    requests: INITIAL_REQUESTS,
    ...schedules,
  };
}

export function persistState(state: Pick<AppStateSnapshot, 'fields' | 'machinery' | 'requests'>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetDemoState(): AppStateSnapshot {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  const schedules = buildSchedules(INITIAL_REQUESTS, FIELDS, INITIAL_MACHINERY);
  return {
    fields: FIELDS,
    machinery: INITIAL_MACHINERY,
    requests: INITIAL_REQUESTS,
    ...schedules,
  };
}

export function createRecoveryRequest(
  current: AppStateSnapshot,
  payload: CreateRequestPayload
): { nextState: AppStateSnapshot; createdRequest: RecoveryRequest; error?: string } {
  const est = calculateResidueEstimate({
    crop: payload.crop,
    areaHa: payload.areaHa,
    harvestDate: payload.harvestDate,
    preferredCollectionDate: payload.preferredCollectionDate,
  });

  if (!est.valid) {
    return {
      nextState: current,
      createdRequest: current.requests[0],
      error: est.error ?? 'Invalid field parameters.',
    };
  }

  const nextNum = 101 + current.fields.length;
  const fieldId = `f${nextNum}`;
  const fieldCode = `F-${nextNum}`;
  const villageObj = VILLAGES.find((v) => v.name === payload.village) ?? VILLAGES[0];
  const points = createPolygonNearVillage(payload.village, current.fields.length);

  const newField: Field = {
    id: fieldId,
    code: fieldCode,
    villageId: villageObj.id,
    village: payload.village,
    crop: payload.crop,
    areaHa: payload.areaHa,
    residueT: est.estimatedResidueT,
    residueRange: est.availabilityRange,
    urgency: est.urgency,
    status: 'estimated',
    harvestDate: payload.harvestDate,
    preferredCollectionDate: payload.preferredCollectionDate,
    harvest: formatShortDate(payload.harvestDate),
    lastPass: 'Just submitted',
    window: `${est.winStartLabel} – ${est.winEndLabel}`,
    points,
    centroid: computeCentroid(points),
  };

  const createdRequest: RecoveryRequest = {
    id: `req-${fieldId}-${Date.now()}`,
    code: `RQ-${1001 + current.requests.length}`,
    fieldId,
    farmerName: payload.farmerName.trim(),
    phone: payload.phone.trim(),
    village: payload.village,
    crop: payload.crop,
    areaHa: payload.areaHa,
    harvestDate: payload.harvestDate,
    preferredCollectionDate: payload.preferredCollectionDate,
    estimatedResidueT: est.estimatedResidueT,
    availabilityRange: est.availabilityRange,
    priority: est.priority,
    urgency: est.urgency,
    status: 'pending',
    notes: payload.notes.trim(),
    createdAt: new Date().toISOString(),
    isSynthetic: true,
  };

  const fields = [...current.fields, newField];
  const requests = [createdRequest, ...current.requests];
  const schedules = buildSchedules(requests, fields, current.machinery);

  const nextState: AppStateSnapshot = {
    fields,
    machinery: current.machinery,
    requests,
    ...schedules,
  };
  persistState({ fields, machinery: current.machinery, requests });

  return { nextState, createdRequest };
}

export function updateMachineStatus(
  current: AppStateSnapshot,
  machineId: string,
  status: MachineStatus
): AppStateSnapshot {
  const machinery = current.machinery.map((m) =>
    m.id === machineId ? { ...m, status } : m
  );
  const schedules = buildSchedules(current.requests, current.fields, machinery);
  const nextState: AppStateSnapshot = {
    ...current,
    machinery,
    ...schedules,
  };
  persistState({ fields: current.fields, machinery, requests: current.requests });
  return nextState;
}

export function deleteRecoveryRequest(
  current: AppStateSnapshot,
  requestId: string
): AppStateSnapshot {
  const requests = current.requests.filter((r) => r.id !== requestId);
  const schedules = buildSchedules(requests, current.fields, current.machinery);
  const nextState: AppStateSnapshot = {
    ...current,
    requests,
    ...schedules,
  };
  persistState({ fields: current.fields, machinery: current.machinery, requests });
  return nextState;
}

export function recomputeSchedules(current: AppStateSnapshot): AppStateSnapshot {
  const schedules = buildSchedules(current.requests, current.fields, current.machinery);
  return {
    ...current,
    ...schedules,
  };
}
