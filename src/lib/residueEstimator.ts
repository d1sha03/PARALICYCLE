import { Crop, CropConfig, Priority, ResidueEstimateInput, ResidueEstimateResult, Urgency } from '../types/paralicycle';

export const CROPS: Record<Crop, CropConfig> = {
  wheat: {
    label: 'Wheat (rabi stubble)',
    short: 'Wheat',
    factor: 1.3,
    min: 1.1,
    max: 1.6,
    window: [7, 14],
  },
  rice: {
    label: 'Rice / paddy (parali)',
    short: 'Rice',
    factor: 0.9,
    min: 0.7,
    max: 1.2,
    window: [5, 12],
  },
  mustard: {
    label: 'Mustard (sarson)',
    short: 'Mustard',
    factor: 1.1,
    min: 0.9,
    max: 1.4,
    window: [8, 15],
  },
};

export function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

export function formatShortDate(dateStr: string): string {
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function addDaysLabel(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '—';
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function diffDays(startIso: string, endIso: string): number {
  const a = new Date(`${startIso}T00:00:00`).getTime();
  const b = new Date(`${endIso}T00:00:00`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.NaN;
  return Math.round((b - a) / 86400000);
}

/**
 * Documented deterministic residue estimation model:
 * - Estimated Tonnage = areaHa * crop.factor
 * - Availability Range = [areaHa * crop.min, areaHa * crop.max]
 * - Priority & Urgency derived from collection offset relative to crop's optimal recovery window.
 */
export function calculateResidueEstimate(input: ResidueEstimateInput): ResidueEstimateResult {
  const { crop, areaHa, harvestDate, preferredCollectionDate } = input;
  const c = CROPS[crop];

  if (!Number.isFinite(areaHa) || areaHa <= 0) {
    return {
      valid: false,
      error: 'Field area must be greater than 0 hectares.',
      estimatedResidueT: 0,
      availabilityRange: [0, 0],
      daysToPickup: 0,
      winStartLabel: '—',
      winEndLabel: '—',
      priority: 'P3',
      urgency: 'low',
      riskLabel: 'Invalid area',
      riskTone: 'error',
      riskNote: 'Enter a positive field area between 0.5 ha and 250 ha.',
    };
  }

  if (areaHa > 250) {
    return {
      valid: false,
      error: 'Single parcel area cannot exceed 250 hectares.',
      estimatedResidueT: 0,
      availabilityRange: [0, 0],
      daysToPickup: 0,
      winStartLabel: '—',
      winEndLabel: '—',
      priority: 'P3',
      urgency: 'low',
      riskLabel: 'Area out of bounds',
      riskTone: 'error',
      riskNote: 'Split parcels larger than 250 ha into separate recovery requests.',
    };
  }

  const daysToPickup = diffDays(harvestDate, preferredCollectionDate);
  if (Number.isNaN(daysToPickup)) {
    return {
      valid: false,
      error: 'Please enter valid harvest and collection dates.',
      estimatedResidueT: 0,
      availabilityRange: [0, 0],
      daysToPickup: 0,
      winStartLabel: '—',
      winEndLabel: '—',
      priority: 'P3',
      urgency: 'low',
      riskLabel: 'Invalid dates',
      riskTone: 'error',
      riskNote: 'Both harvest date and preferred collection date must be valid calendar dates.',
    };
  }

  const estimatedResidueT = round1(areaHa * c.factor);
  const low = round1(areaHa * c.min);
  const high = round1(areaHa * c.max);
  const winStartLabel = addDaysLabel(harvestDate, c.window[0]);
  const winEndLabel = addDaysLabel(harvestDate, c.window[1]);

  if (daysToPickup < 0) {
    return {
      valid: false,
      error: 'Preferred collection date must be on or after the harvest date.',
      estimatedResidueT,
      availabilityRange: [low, high],
      daysToPickup,
      winStartLabel,
      winEndLabel,
      priority: 'P3',
      urgency: 'low',
      riskLabel: 'Invalid dates',
      riskTone: 'error',
      riskNote: 'Preferred collection date must be on or after the harvest date.',
    };
  }

  let priority: Priority;
  let urgency: Urgency;
  let riskLabel: string;
  let riskTone: ResidueEstimateResult['riskTone'];
  let riskNote: string;

  if (daysToPickup < c.window[0] - 2) {
    priority = 'P3';
    urgency = 'low';
    riskLabel = 'Early moisture window';
    riskTone = 'info';
    riskNote = `Stubble may still hold high moisture. Recommended recovery window opens ${winStartLabel}.`;
  } else if (daysToPickup <= c.window[1]) {
    priority = estimatedResidueT >= 22 ? 'P2' : 'P2';
    urgency = estimatedResidueT >= 22 ? 'high' : 'medium';
    riskLabel = 'Optimal recovery window';
    riskTone = 'optimal';
    riskNote = 'Collection falls inside the recommended window — ideal baling moisture and low burn probability.';
  } else if (daysToPickup <= c.window[1] + 5) {
    priority = 'P1';
    urgency = 'high';
    riskLabel = 'Elevated burn risk';
    riskTone = 'warning';
    riskNote = `Past the ${winEndLabel} window end. Residue is drying quickly — prioritise baler dispatch.`;
  } else {
    priority = 'P1';
    urgency = 'critical';
    riskLabel = 'High burn risk';
    riskTone = 'critical';
    riskNote = 'Well beyond the optimal window — this field enters the P1 urgent triage queue.';
  }

  return {
    valid: true,
    estimatedResidueT,
    availabilityRange: [low, high],
    daysToPickup,
    winStartLabel,
    winEndLabel,
    priority,
    urgency,
    riskLabel,
    riskTone,
    riskNote,
  };
}
