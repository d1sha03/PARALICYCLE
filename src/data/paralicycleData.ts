import heroStubbleImage from '../assets/hero-paraliCycle.jpg';
import satelliteImage from '../assets/satellite-north-india.jpg';
import {
  Field,
  FieldStatus,
  Machinery,
  Operator,
  RecoveryRequest,
  Urgency,
  Village,
} from '../types/paralicycle';
import { calculateResidueEstimate, CROPS } from '../lib/residueEstimator';

export { CROPS };
export type {
  Crop,
  Field,
  FieldStatus,
  Machinery,
  Operator,
  RecoveryRequest,
  Urgency,
  Village,
} from '../types/paralicycle';

export const HERO_IMAGE = heroStubbleImage;
export const SATELLITE_IMAGE = satelliteImage;

export const EDITORIAL_IMAGES = {
  heroWheat:
    'https://images.pexels.com/photos/6732931/pexels-photo-6732931.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600',
  heroInset:
    'https://images.pexels.com/photos/26587547/pexels-photo-26587547.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=700',
  farmerDroneBanner:
    'https://images.pexels.com/photos/32730139/pexels-photo-32730139.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1500',
  balerField:
    'https://images.pexels.com/photos/27135349/pexels-photo-27135349.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
  wheatSunset:
    'https://images.pexels.com/photos/12873375/pexels-photo-12873375.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
  indianFarmer:
    'https://images.pexels.com/photos/20445181/pexels-photo-20445181.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
  modernHarvester:
    'https://images.pexels.com/photos/40467647/pexels-photo-40467647.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
  grainField:
    'https://images.pexels.com/photos/20806405/pexels-photo-20806405.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
};

/* =====================================================================
   All data below is SIMULATED demo data for the PARALICYCLE prototype.
   It contains no real farmers, no live satellite detections, no real
   machinery availability and no verified environmental impact.
   ===================================================================== */

export const URGENCY_META: Record<Urgency, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#E04F33' },
  high: { label: 'High', color: '#EAB308' },
  medium: { label: 'Medium', color: '#5A8DEE' },
  low: { label: 'Low', color: '#8A8D86' },
};

export const STATUS_META: Record<
  FieldStatus,
  { label: string; color: string; fill: string; dashed: boolean }
> = {
  registered: { label: 'Registered', color: '#9CA098', fill: 'rgba(156,160,152,0.14)', dashed: true },
  estimated: { label: 'AI-estimated', color: '#6FA8FF', fill: 'rgba(111,168,255,0.16)', dashed: false },
  assigned: { label: 'Assigned', color: '#F3B72B', fill: 'rgba(243,183,43,0.18)', dashed: false },
  scheduled: { label: 'Scheduled', color: '#FCEAB6', fill: 'rgba(252,234,182,0.22)', dashed: false },
  recovered: { label: 'Recovered', color: '#A3E635', fill: 'rgba(163,230,53,0.24)', dashed: false },
};

export const VILLAGES: Village[] = [
  { id: 'v1', name: 'Kalar Kalan', block: 'Fazilka block', x: 205, y: 168 },
  { id: 'v2', name: 'Bhogpur', block: 'Ludhiana block', x: 322, y: 448 },
  { id: 'v3', name: 'Kurali', block: 'Jalandhar block', x: 566, y: 318 },
  { id: 'v4', name: 'Chak Kala', block: 'Fazilka block', x: 712, y: 160 },
  { id: 'v5', name: 'Sarai Gharan', block: 'Ludhiana block', x: 762, y: 442 },
];

export function computeCentroid(points: [number, number][]): [number, number] {
  const n = points.length;
  if (n === 0) return [500, 310];
  const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
  return [Math.round(sum[0] / n), Math.round(sum[1] / n)];
}

function makeField(
  raw: Omit<Field, 'residueT' | 'residueRange' | 'centroid'>
): Field {
  const est = calculateResidueEstimate({
    crop: raw.crop,
    areaHa: raw.areaHa,
    harvestDate: raw.harvestDate,
    preferredCollectionDate: raw.preferredCollectionDate,
  });
  return {
    ...raw,
    residueT: est.estimatedResidueT,
    residueRange: est.availabilityRange,
    centroid: computeCentroid(raw.points),
  };
}

export const FIELDS: Field[] = [
  makeField({
    id: 'f101', code: 'F-101', villageId: 'v1', village: 'Kalar Kalan', crop: 'wheat', areaHa: 18.2,
    urgency: 'high', status: 'scheduled', harvestDate: '2026-10-28', preferredCollectionDate: '2026-11-08',
    harvest: 'Oct 28', lastPass: 'Nov 03 · 17:23', window: 'Nov 04 – Nov 11',
    points: [[148, 118], [216, 104], [264, 142], [240, 200], [166, 208]],
  }),
  makeField({
    id: 'f102', code: 'F-102', villageId: 'v1', village: 'Kalar Kalan', crop: 'rice', areaHa: 12.4,
    urgency: 'medium', status: 'estimated', harvestDate: '2026-10-26', preferredCollectionDate: '2026-11-09',
    harvest: 'Oct 26', lastPass: 'Nov 03 · 17:23', window: 'Nov 05 – Nov 12',
    points: [[240, 200], [264, 142], [332, 152], [324, 216], [258, 238]],
  }),
  makeField({
    id: 'f103', code: 'F-103', villageId: 'v1', village: 'Kalar Kalan', crop: 'mustard', areaHa: 9.6,
    urgency: 'low', status: 'registered', harvestDate: '2026-11-02', preferredCollectionDate: '2026-11-12',
    harvest: 'Nov 02', lastPass: 'Nov 02 · 06:11', window: 'Nov 10 – Nov 17',
    points: [[148, 210], [166, 208], [240, 200], [234, 264], [156, 274]],
  }),
  makeField({
    id: 'f104', code: 'F-104', villageId: 'v3', village: 'Kurali', crop: 'wheat', areaHa: 24.8,
    urgency: 'critical', status: 'scheduled', harvestDate: '2026-10-20', preferredCollectionDate: '2026-11-05',
    harvest: 'Oct 20', lastPass: 'Nov 03 · 17:23', window: 'Nov 04 – Nov 06',
    points: [[498, 240], [586, 226], [620, 282], [566, 332], [496, 318]],
  }),
  makeField({
    id: 'f105', code: 'F-105', villageId: 'v3', village: 'Kurali', crop: 'wheat', areaHa: 15.3,
    urgency: 'high', status: 'assigned', harvestDate: '2026-10-24', preferredCollectionDate: '2026-11-07',
    harvest: 'Oct 24', lastPass: 'Nov 03 · 17:23', window: 'Nov 04 – Nov 09',
    points: [[566, 332], [620, 282], [690, 300], [672, 358], [592, 370]],
  }),
  makeField({
    id: 'f106', code: 'F-106', villageId: 'v3', village: 'Kurali', crop: 'rice', areaHa: 11.7,
    urgency: 'medium', status: 'scheduled', harvestDate: '2026-10-27', preferredCollectionDate: '2026-11-09',
    harvest: 'Oct 27', lastPass: 'Nov 03 · 17:23', window: 'Nov 05 – Nov 11',
    points: [[420, 300], [496, 318], [486, 382], [408, 362]],
  }),
  makeField({
    id: 'f107', code: 'F-107', villageId: 'v3', village: 'Kurali', crop: 'mustard', areaHa: 8.9,
    urgency: 'low', status: 'estimated', harvestDate: '2026-11-01', preferredCollectionDate: '2026-11-12',
    harvest: 'Nov 01', lastPass: 'Nov 03 · 17:23', window: 'Nov 09 – Nov 16',
    points: [[566, 332], [592, 370], [552, 422], [486, 382]],
  }),
  makeField({
    id: 'f108', code: 'F-108', villageId: 'v2', village: 'Bhogpur', crop: 'rice', areaHa: 13.5,
    urgency: 'high', status: 'assigned', harvestDate: '2026-10-22', preferredCollectionDate: '2026-11-07',
    harvest: 'Oct 22', lastPass: 'Nov 03 · 17:23', window: 'Nov 04 – Nov 08',
    points: [[330, 340], [408, 362], [420, 422], [348, 438]],
  }),
  makeField({
    id: 'f109', code: 'F-109', villageId: 'v2', village: 'Bhogpur', crop: 'wheat', areaHa: 16.1,
    urgency: 'critical', status: 'recovered', harvestDate: '2026-10-18', preferredCollectionDate: '2026-11-01',
    harvest: 'Oct 18', lastPass: 'Nov 03 · 17:23', window: 'Completed Nov 01',
    points: [[262, 402], [330, 382], [352, 438], [288, 472]],
  }),
  makeField({
    id: 'f110', code: 'F-110', villageId: 'v4', village: 'Chak Kala', crop: 'wheat', areaHa: 20.4,
    urgency: 'high', status: 'scheduled', harvestDate: '2026-10-25', preferredCollectionDate: '2026-11-06',
    harvest: 'Oct 25', lastPass: 'Nov 03 · 17:23', window: 'Nov 04 – Nov 08',
    points: [[648, 118], [730, 106], [764, 158], [700, 194], [650, 178]],
  }),
  makeField({
    id: 'f111', code: 'F-111', villageId: 'v4', village: 'Chak Kala', crop: 'rice', areaHa: 10.2,
    urgency: 'medium', status: 'registered', harvestDate: '2026-10-29', preferredCollectionDate: '2026-11-11',
    harvest: 'Oct 29', lastPass: 'Nov 02 · 06:11', window: 'Nov 06 – Nov 13',
    points: [[700, 194], [764, 158], [814, 192], [776, 244], [708, 238]],
  }),
  makeField({
    id: 'f112', code: 'F-112', villageId: 'v5', village: 'Sarai Gharan', crop: 'mustard', areaHa: 12.8,
    urgency: 'medium', status: 'assigned', harvestDate: '2026-10-28', preferredCollectionDate: '2026-11-10',
    harvest: 'Oct 28', lastPass: 'Nov 03 · 17:23', window: 'Nov 06 – Nov 12',
    points: [[700, 382], [782, 368], [814, 422], [742, 454]],
  }),
  makeField({
    id: 'f113', code: 'F-113', villageId: 'v5', village: 'Sarai Gharan', crop: 'wheat', areaHa: 14.6,
    urgency: 'critical', status: 'scheduled', harvestDate: '2026-10-21', preferredCollectionDate: '2026-11-05',
    harvest: 'Oct 21', lastPass: 'Nov 03 · 17:23', window: 'Nov 04 – Nov 06',
    points: [[620, 422], [700, 382], [708, 448], [640, 472]],
  }),
  makeField({
    id: 'f114', code: 'F-114', villageId: 'v2', village: 'Bhogpur', crop: 'rice', areaHa: 14.0,
    urgency: 'high', status: 'estimated', harvestDate: '2026-10-23', preferredCollectionDate: '2026-11-08',
    harvest: 'Oct 23', lastPass: 'Nov 03 · 17:23', window: 'Nov 05 – Nov 10',
    points: [[352, 438], [420, 422], [446, 480], [368, 496]],
  }),
  makeField({
    id: 'f115', code: 'F-115', villageId: 'v4', village: 'Chak Kala', crop: 'wheat', areaHa: 11.2,
    urgency: 'medium', status: 'registered', harvestDate: '2026-10-30', preferredCollectionDate: '2026-11-11',
    harvest: 'Oct 30', lastPass: 'Nov 03 · 06:11', window: 'Nov 07 – Nov 13',
    points: [[764, 158], [834, 144], [858, 198], [814, 192]],
  }),
];

/* ---------------- Operators (5 simulated operators) ---------------- */

export const OPERATORS: Operator[] = [
  { id: 'op1', name: 'S. Gill (demo)', phone: '+91 98140-00101', homeVillageId: 'v1', experienceYears: 8, rating: 4.9, isSynthetic: true },
  { id: 'op2', name: 'H. Dhillon (demo)', phone: '+91 98140-00102', homeVillageId: 'v3', experienceYears: 6, rating: 4.7, isSynthetic: true },
  { id: 'op3', name: 'M. Sandhu (demo)', phone: '+91 98140-00103', homeVillageId: 'v2', experienceYears: 11, rating: 4.9, isSynthetic: true },
  { id: 'op4', name: 'A. Brar (demo)', phone: '+91 98140-00104', homeVillageId: 'v4', experienceYears: 5, rating: 4.6, isSynthetic: true },
  { id: 'op5', name: 'J. Chaudhary (demo)', phone: '+91 98140-00105', homeVillageId: 'v5', experienceYears: 7, rating: 4.8, isSynthetic: true },
];

/* ---------------- Machinery (7 simulated units across 5 operators) ---------------- */

export const INITIAL_MACHINERY: Machinery[] = [
  {
    id: 'm1', code: 'RB-07', name: 'Round Baler R1250', type: 'Round baler · 1.25 m',
    capacityTDay: 14, operatorId: 'op1', operator: 'S. Gill (demo)', homeVillageId: 'v1',
    availableFrom: '2026-11-04', availableTo: '2026-11-13', window: 'Nov 04 – Nov 13',
    costPerHr: 1450, travelCostPerKm: 42, status: 'available',
  },
  {
    id: 'm2', code: 'RB-12', name: 'Round Baler R1140', type: 'Round baler · 1.14 m',
    capacityTDay: 12, operatorId: 'op2', operator: 'H. Dhillon (demo)', homeVillageId: 'v3',
    availableFrom: '2026-11-04', availableTo: '2026-11-13', window: 'Nov 04 – Nov 13',
    costPerHr: 1300, travelCostPerKm: 38, status: 'on-field',
  },
  {
    id: 'm3', code: 'SH-03', name: 'Straw Harvester 4W', type: 'Straw harvester · 4-wheel',
    capacityTDay: 20, operatorId: 'op3', operator: 'M. Sandhu (demo)', homeVillageId: 'v2',
    availableFrom: '2026-11-04', availableTo: '2026-11-13', window: 'Nov 04 – Nov 13',
    costPerHr: 2100, travelCostPerKm: 55, status: 'available',
  },
  {
    id: 'm4', code: 'CH-01', name: 'Chaff Spreader CS-220', type: 'Combine chaff spreader',
    capacityTDay: 22, operatorId: 'op4', operator: 'A. Brar (demo)', homeVillageId: 'v4',
    availableFrom: '2026-11-04', availableTo: '2026-11-11', window: 'Nov 04 – Nov 11',
    costPerHr: 2600, travelCostPerKm: 60, status: 'service',
  },
  {
    id: 'm5', code: 'RB-19', name: 'Compact Baler R8050', type: 'Compact baler · 0.8 m',
    capacityTDay: 10, operatorId: 'op5', operator: 'J. Chaudhary (demo)', homeVillageId: 'v5',
    availableFrom: '2026-11-04', availableTo: '2026-11-13', window: 'Nov 04 – Nov 13',
    costPerHr: 950, travelCostPerKm: 32, status: 'available',
  },
  {
    id: 'm6', code: 'SB-09', name: 'Square Baler SB-900', type: 'High-density square baler',
    capacityTDay: 18, operatorId: 'op1', operator: 'S. Gill (demo)', homeVillageId: 'v4',
    availableFrom: '2026-11-05', availableTo: '2026-11-13', window: 'Nov 05 – Nov 13',
    costPerHr: 1850, travelCostPerKm: 48, status: 'available',
  },
  {
    id: 'm7', code: 'SH-08', name: 'Raker & Baler Combo', type: 'Twin-rotor rake + baler',
    capacityTDay: 15, operatorId: 'op2', operator: 'H. Dhillon (demo)', homeVillageId: 'v3',
    availableFrom: '2026-11-06', availableTo: '2026-11-13', window: 'Nov 06 – Nov 13',
    costPerHr: 1600, travelCostPerKm: 44, status: 'available',
  },
];

/* ---------------- Initial Recovery Requests (simulated queue) ---------------- */

const DEMO_FARMERS = [
  'Harpreet S. (demo)',
  'Gurpreet K. (demo)',
  'Maninder S. (demo)',
  'Balwinder G. (demo)',
  'Sukhwinder B. (demo)',
  'Rajinder D. (demo)',
  'Amandeep S. (demo)',
  'Kulwant K. (demo)',
  'Jasbir M. (demo)',
  'Paramjit S. (demo)',
  'Navjot R. (demo)',
  'Daljit T. (demo)',
  'Sukhdev V. (demo)',
  'Lakhwinder P. (demo)',
];

export const INITIAL_REQUESTS: RecoveryRequest[] = FIELDS.filter(
  (f) => f.status !== 'recovered'
).map((f, idx) => {
  const est = calculateResidueEstimate({
    crop: f.crop,
    areaHa: f.areaHa,
    harvestDate: f.harvestDate,
    preferredCollectionDate: f.preferredCollectionDate,
  });
  return {
    id: `req-${f.id}`,
    code: `RQ-${1001 + idx}`,
    fieldId: f.id,
    farmerName: DEMO_FARMERS[idx % DEMO_FARMERS.length],
    phone: `+91 98765-${String(10100 + idx * 17).slice(0, 5)}`,
    village: f.village,
    crop: f.crop,
    areaHa: f.areaHa,
    harvestDate: f.harvestDate,
    preferredCollectionDate: f.preferredCollectionDate,
    estimatedResidueT: est.estimatedResidueT,
    availabilityRange: est.availabilityRange,
    priority: est.priority,
    urgency: f.urgency,
    status: f.status === 'scheduled' ? 'scheduled' : 'pending',
    notes: `Simulated ${f.crop} parcel in ${f.village}.`,
    createdAt: `2026-11-01T0${Math.min(9, idx)}:${String((idx * 11) % 60).padStart(2, '0')}:00Z`,
    isSynthetic: true,
  };
});

/* ---------------- Analytics horizon breakdown (simulated baseline) ---------------- */

export const STACKED_HORIZON_BARS = [
  { label: 'Oct 15', wheat: 180, rice: 260, mustard: 90 },
  { label: 'Oct 20', wheat: 240, rice: 340, mustard: 110 },
  { label: 'Oct 25', wheat: 310, rice: 420, mustard: 140 },
  { label: 'Oct 30', wheat: 380, rice: 510, mustard: 165 },
  { label: 'Nov 04', wheat: 490, rice: 540, mustard: 190 },
  { label: 'Nov 09', wheat: 540, rice: 480, mustard: 220 },
  { label: 'Nov 14', wheat: 610, rice: 410, mustard: 260 },
  { label: 'Nov 19', wheat: 520, rice: 320, mustard: 240 },
  { label: 'Nov 24', wheat: 410, rice: 240, mustard: 190 },
  { label: 'Nov 29', wheat: 290, rice: 180, mustard: 150 },
];

/* ---------------- How it works ---------------- */

export const WORKFLOW_STEPS = [
  {
    id: '01',
    title: 'Farmer submits field',
    tags: ['Village Pin', 'Crop Type', 'Field Area', 'Harvest Date', 'WhatsApp / Web'],
    text: 'Village, crop, field area and harvest date are registered via web, WhatsApp or local field office. Geo-fencing anchors the parcel on the map.',
  },
  {
    id: '02',
    title: 'AI estimates residue',
    tags: ['Satellite Pass', 'Tonnage Range', 'Moisture Window', 'Burn-Risk Score'],
    text: 'Satellite imagery, crop yield factors and harvest metadata estimate recoverable stubble tonnage and the ideal pickup window before burning risk peaks.',
  },
  {
    id: '03',
    title: 'Optimisation assigns machinery',
    tags: ['OR-Tools', 'Balers & Harvesters', 'Route Cost', 'Operator Slots'],
    text: 'Our scheduling engine matches balers, straw harvesters and operators to field priorities, minimising deadhead kilometres and per-tonne operating costs.',
  },
  {
    id: '04',
    title: 'Recovery schedule generated',
    tags: ['Day-by-Day Plan', 'P1–P3 Triage', 'Live Status', 'Audit Trail'],
    text: 'A verified time-window plan is dispatched to machinery operators and tracked until bales are cleared and weighed off the field.',
  },
];

export const ARCHITECTURE = [
  { name: 'React + TypeScript', role: 'Frontend · modular typed components & state' },
  { name: 'Python FastAPI', role: 'Inference, residue estimation & routing APIs' },
  { name: 'Supabase', role: 'Geospatial fields, requests & audit records' },
  { name: 'Google OR-Tools', role: 'Constraint-based machinery scheduling engine' },
];
