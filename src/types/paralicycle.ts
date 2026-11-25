export type Crop = 'wheat' | 'rice' | 'mustard';
export type FieldStatus = 'registered' | 'estimated' | 'assigned' | 'scheduled' | 'recovered';
export type Urgency = 'critical' | 'high' | 'medium' | 'low';
export type Priority = 'P1' | 'P2' | 'P3';
export type MachineStatus = 'available' | 'on-field' | 'service';
export type RequestStatus = 'pending' | 'scheduled' | 'completed' | 'missed';
export type ScheduleStrategy = 'optimised' | 'fcfs';

export interface CropConfig {
  label: string;
  short: string;
  factor: number; // tonnes per hectare
  min: number; // lower bound tonnes/ha
  max: number; // upper bound tonnes/ha
  window: [number, number]; // optimal days after harvest [minDays, maxDays]
}

export interface Village {
  id: string;
  name: string;
  block: string;
  x: number;
  y: number;
}

export interface Field {
  id: string;
  code: string;
  villageId: string;
  village: string;
  crop: Crop;
  areaHa: number;
  residueT: number;
  residueRange: [number, number];
  urgency: Urgency;
  status: FieldStatus;
  harvestDate: string; // YYYY-MM-DD
  preferredCollectionDate: string; // YYYY-MM-DD
  harvest: string; // display label
  lastPass: string;
  window: string;
  points: [number, number][];
  centroid: [number, number];
}

export interface Operator {
  id: string;
  name: string;
  phone: string;
  homeVillageId: string;
  experienceYears: number;
  rating: number;
  isSynthetic: true;
}

export interface Machinery {
  id: string;
  code: string;
  name: string;
  type: string;
  capacityTDay: number;
  operatorId: string;
  operator: string;
  homeVillageId: string;
  availableFrom: string; // YYYY-MM-DD
  availableTo: string; // YYYY-MM-DD
  window: string;
  costPerHr: number;
  travelCostPerKm: number;
  status: MachineStatus;
}

export interface RecoveryRequest {
  id: string;
  code: string;
  fieldId: string;
  farmerName: string;
  phone: string;
  village: string;
  crop: Crop;
  areaHa: number;
  harvestDate: string; // YYYY-MM-DD
  preferredCollectionDate: string; // YYYY-MM-DD
  estimatedResidueT: number;
  availabilityRange: [number, number];
  priority: Priority;
  urgency: Urgency;
  status: RequestStatus;
  notes: string;
  createdAt: string; // ISO timestamp
  isSynthetic: boolean;
}

export interface Assignment {
  id: string;
  requestId: string;
  fieldId: string;
  fieldCode: string;
  village: string;
  machineId: string;
  machineCode: string;
  operatorName: string;
  day: string; // Display e.g. "Nov 04"
  dateIso: string; // YYYY-MM-DD
  tons: number;
  window: string;
  travelKm: number;
  operatingCost: number;
  travelCost: number;
  cost: number;
  priority: Priority;
  deadlineMet: boolean;
}

export interface SchedulerMetrics {
  totalResidueAvailableT: number;
  totalResidueScheduledT: number;
  assignedFieldsCount: number;
  totalRequestsCount: number;
  unassignedFieldsCount: number;
  missedDeadlinesCount: number;
  machineryUtilisationPct: number;
  totalOperatingCost: number;
  totalTravelCost: number;
  totalCost: number;
  avgCostPerTonne: number;
  deadlineAdherencePct: number;
}

export interface CollectionSchedule {
  id: string;
  strategy: ScheduleStrategy;
  generatedAt: string;
  horizonStart: string;
  horizonEnd: string;
  assignments: Assignment[];
  unassignedRequestIds: string[];
  missedDeadlineRequestIds: string[];
  metrics: SchedulerMetrics;
  infeasibilityNotes: string[];
}

export interface ResidueEstimateInput {
  crop: Crop;
  areaHa: number;
  harvestDate: string;
  preferredCollectionDate: string;
}

export interface ResidueEstimateResult {
  valid: boolean;
  error?: string;
  estimatedResidueT: number;
  availabilityRange: [number, number];
  daysToPickup: number;
  winStartLabel: string;
  winEndLabel: string;
  priority: Priority;
  urgency: Urgency;
  riskLabel: string;
  riskTone: 'error' | 'info' | 'optimal' | 'warning' | 'critical';
  riskNote: string;
}
