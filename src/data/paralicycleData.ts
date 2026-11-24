import heroStubbleImage from '../assets/hero-paraliCycle.jpg';
import satelliteImage from '../assets/satellite-north-india.jpg';

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

export type Crop = 'wheat' | 'rice' | 'mustard';
export type FieldStatus = 'registered' | 'estimated' | 'assigned' | 'scheduled' | 'recovered';
export type Urgency = 'critical' | 'high' | 'medium' | 'low';

export interface Field {
  id: string;
  code: string;
  village: string;
  crop: Crop;
  areaHa: number;
  residueT: number;
  urgency: Urgency;
  status: FieldStatus;
  harvest: string;
  lastPass: string;
  window: string;
  points: [number, number][];
}

export interface Village {
  id: string;
  name: string;
  block: string;
  x: number;
  y: number;
}

export const CROPS: Record<
  Crop,
  { label: string; short: string; factor: number; min: number; max: number; window: [number, number] }
> = {
  wheat: { label: 'Wheat (rabi stubble)', short: 'Wheat', factor: 1.3, min: 1.1, max: 1.6, window: [7, 14] },
  rice: { label: 'Rice / paddy (parali)', short: 'Rice', factor: 0.9, min: 0.7, max: 1.2, window: [5, 12] },
  mustard: { label: 'Mustard (sarson)', short: 'Mustard', factor: 1.1, min: 0.9, max: 1.4, window: [8, 15] },
};

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

export const FIELDS: Field[] = [
  {
    id: 'f101', code: 'F-101', village: 'Kalar Kalan', crop: 'wheat', areaHa: 18.2, residueT: 23.7,
    urgency: 'high', status: 'scheduled', harvest: 'Nov 01', lastPass: 'Nov 03 · 17:23',
    window: 'Nov 10 – Nov 14', points: [[148, 118], [216, 104], [264, 142], [240, 200], [166, 208]],
  },
  {
    id: 'f102', code: 'F-102', village: 'Kalar Kalan', crop: 'rice', areaHa: 12.4, residueT: 11.2,
    urgency: 'medium', status: 'estimated', harvest: 'Oct 24', lastPass: 'Nov 03 · 17:23',
    window: 'Nov 09 – Nov 16', points: [[240, 200], [264, 142], [332, 152], [324, 216], [258, 238]],
  },
  {
    id: 'f103', code: 'F-103', village: 'Kalar Kalan', crop: 'mustard', areaHa: 9.6, residueT: 10.6,
    urgency: 'low', status: 'registered', harvest: 'Nov 05 (est.)', lastPass: 'Nov 02 · 06:11',
    window: 'Nov 13 – Nov 20', points: [[148, 210], [166, 208], [240, 200], [234, 264], [156, 274]],
  },
  {
    id: 'f104', code: 'F-104', village: 'Kurali', crop: 'wheat', areaHa: 24.8, residueT: 32.2,
    urgency: 'critical', status: 'scheduled', harvest: 'Oct 28', lastPass: 'Nov 03 · 17:23',
    window: 'Nov 08 – Nov 11', points: [[498, 240], [586, 226], [620, 282], [566, 332], [496, 318]],
  },
  {
    id: 'f105', code: 'F-105', village: 'Kurali', crop: 'wheat', areaHa: 15.3, residueT: 19.9,
    urgency: 'high', status: 'assigned', harvest: 'Oct 30', lastPass: 'Nov 03 · 17:23',
    window: 'Nov 10 – Nov 13', points: [[566, 332], [620, 282], [690, 300], [672, 358], [592, 370]],
  },
  {
    id: 'f106', code: 'F-106', village: 'Kurali', crop: 'rice', areaHa: 11.7, residueT: 10.5,
    urgency: 'medium', status: 'scheduled', harvest: 'Oct 22', lastPass: 'Nov 03 · 17:23',
    window: 'Nov 08 – Nov 15', points: [[420, 300], [496, 318], [486, 382], [408, 362]],
  },
  {
    id: 'f107', code: 'F-107', village: 'Kurali', crop: 'mustard', areaHa: 8.9, residueT: 9.8,
    urgency: 'low', status: 'estimated', harvest: 'Nov 06 (est.)', lastPass: 'Nov 03 · 17:23',
    window: 'Nov 14 – Nov 21', points: [[566, 332], [592, 370], [552, 422], [486, 382]],
  },
  {
    id: 'f108', code: 'F-108', village: 'Bhogpur', crop: 'rice', areaHa: 13.5, residueT: 12.2,
    urgency: 'high', status: 'assigned', harvest: 'Oct 25', lastPass: 'Nov 03 · 17:23',
    window: 'Nov 09 – Nov 16', points: [[330, 340], [408, 362], [420, 422], [348, 438]],
  },
  {
    id: 'f109', code: 'F-109', village: 'Bhogpur', crop: 'wheat', areaHa: 16.1, residueT: 20.9,
    urgency: 'critical', status: 'recovered', harvest: 'Oct 18', lastPass: 'Nov 03 · 17:23',
    window: 'Completed Nov 01', points: [[262, 402], [330, 382], [352, 438], [288, 472]],
  },
  {
    id: 'f110', code: 'F-110', village: 'Chak Kala', crop: 'wheat', areaHa: 20.4, residueT: 26.5,
    urgency: 'high', status: 'scheduled', harvest: 'Oct 29', lastPass: 'Nov 03 · 17:23',
    window: 'Nov 09 – Nov 12', points: [[648, 118], [730, 106], [764, 158], [700, 194], [650, 178]],
  },
  {
    id: 'f111', code: 'F-111', village: 'Chak Kala', crop: 'rice', areaHa: 10.2, residueT: 9.2,
    urgency: 'medium', status: 'registered', harvest: 'Oct 30', lastPass: 'Nov 02 · 06:11',
    window: 'Nov 11 – Nov 18', points: [[700, 194], [764, 158], [814, 192], [776, 244], [708, 238]],
  },
  {
    id: 'f112', code: 'F-112', village: 'Sarai Gharan', crop: 'mustard', areaHa: 12.8, residueT: 14.1,
    urgency: 'medium', status: 'assigned', harvest: 'Nov 02', lastPass: 'Nov 03 · 17:23',
    window: 'Nov 12 – Nov 19', points: [[700, 382], [782, 368], [814, 422], [742, 454]],
  },
  {
    id: 'f113', code: 'F-113', village: 'Sarai Gharan', crop: 'wheat', areaHa: 14.6, residueT: 19.0,
    urgency: 'critical', status: 'scheduled', harvest: 'Oct 27', lastPass: 'Nov 03 · 17:23',
    window: 'Nov 08 – Nov 10', points: [[620, 422], [700, 382], [708, 448], [640, 472]],
  },
];

/* ---------------- Machinery (simulated availability) ---------------- */

export interface Machine {
  id: string;
  code: string;
  name: string;
  type: string;
  capacityTDay: number;
  operator: string;
  window: string;
  costPerHr: number;
  status: 'available' | 'on-field' | 'service';
}

export const MACHINES: Machine[] = [
  {
    id: 'm1', code: 'RB-07', name: 'Round Baler R1250', type: 'Round baler · 1.25 m',
    capacityTDay: 12, operator: 'S. Gill (demo)', window: 'Nov 04 – Nov 12',
    costPerHr: 1450, status: 'available',
  },
  {
    id: 'm2', code: 'RB-12', name: 'Round Baler R1140', type: 'Round baler · 1.14 m',
    capacityTDay: 10, operator: 'H. Dhillon (demo)', window: 'Nov 05 – Nov 14',
    costPerHr: 1300, status: 'on-field',
  },
  {
    id: 'm3', code: 'SH-03', name: 'Straw Harvester 4W', type: 'Straw harvester · 4-wheel',
    capacityTDay: 18, operator: 'M. Sandhu (demo)', window: 'Nov 06 – Nov 13',
    costPerHr: 2100, status: 'available',
  },
  {
    id: 'm4', code: 'CH-01', name: 'Chaff Spreader CS-220', type: 'Combine chaff spreader',
    capacityTDay: 22, operator: 'A. Brar (demo)', window: 'Nov 04 – Nov 09',
    costPerHr: 2600, status: 'service',
  },
  {
    id: 'm5', code: 'RB-19', name: 'Compact Baler R8050', type: 'Compact baler · 0.8 m',
    capacityTDay: 8, operator: 'J. Chaudhary (demo)', window: 'Nov 07 – Nov 15',
    costPerHr: 950, status: 'available',
  },
];

export interface Assignment {
  id: string;
  day: string;
  fieldId: string;
  machineId: string;
  tons: number;
  window: string;
  cost: number;
  priority: 'P1' | 'P2' | 'P3';
}

export const ASSIGNMENTS: Assignment[] = [
  { id: 'a1', day: 'Nov 04', fieldId: 'f104', machineId: 'm3', tons: 24.8, window: '06:00 – 14:00', cost: 17100, priority: 'P1' },
  { id: 'a2', day: 'Nov 04', fieldId: 'f110', machineId: 'm1', tons: 20.4, window: '08:00 – 16:30', cost: 12240, priority: 'P1' },
  { id: 'a3', day: 'Nov 05', fieldId: 'f105', machineId: 'm2', tons: 15.3, window: '07:00 – 14:00', cost: 9180, priority: 'P2' },
  { id: 'a4', day: 'Nov 06', fieldId: 'f108', machineId: 'm3', tons: 13.5, window: '09:00 – 13:30', cost: 9450, priority: 'P2' },
  { id: 'a5', day: 'Nov 07', fieldId: 'f113', machineId: 'm5', tons: 14.6, window: '06:30 – 14:00', cost: 7300, priority: 'P1' },
  { id: 'a6', day: 'Nov 08', fieldId: 'f112', machineId: 'm1', tons: 12.8, window: '10:00 – 15:00', cost: 7500, priority: 'P3' },
];

/* ---------------- Operations dashboard (simulated) ---------------- */

export const DASHBOARD_STATS = [
  { label: 'Registered fields', value: 1284, suffix: '', delta: '+38 this week', icon: 'map' as const },
  { label: 'Residue mapped', value: 9860, suffix: ' t', delta: '+1,240 t this week', icon: 'wheat' as const },
  { label: 'Recovery requests', value: 143, suffix: '', delta: '19 pending triage', icon: 'inbox' as const },
  { label: 'Machinery utilisation', value: 74, suffix: '%', delta: '5 of 38 units active', icon: 'gauge' as const },
  { label: 'Scheduled · next 7d', value: 2410, suffix: ' t', delta: '41 slots confirmed', icon: 'calendar' as const },
];

/* ---------------- Analytics (simulated model outputs) ---------------- */

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

export const COMPARISON_METRICS = [
  { label: 'Residue recovered (t)', baseline: 2100, ai: 7450, unit: 't', smallerBetter: false },
  { label: 'Residue burned (t)', baseline: 7700, ai: 2350, unit: 't', smallerBetter: true },
  { label: 'Operating cost (₹ / t)', baseline: 185, ai: 142, unit: '₹', smallerBetter: true },
  { label: 'Deadline adherence (%)', baseline: 78, ai: 96, unit: '%', smallerBetter: false },
];

export const CUMULATIVE_SERIES = {
  labels: ['Nov 04', 'Nov 07', 'Nov 10', 'Nov 13', 'Nov 16', 'Nov 19', 'Nov 22', 'Nov 25', 'Nov 28', 'Dec 01', 'Dec 04'],
  baseline: [30, 120, 240, 400, 600, 820, 1050, 1300, 1550, 1800, 2100],
  ai: [100, 320, 640, 1100, 1700, 2400, 3300, 4400, 5600, 6800, 7450],
};

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
  { name: 'Next.js + TypeScript', role: 'Frontend · component parity with this demo' },
  { name: 'Python FastAPI', role: 'Inference, residue estimation & routing APIs' },
  { name: 'Supabase', role: 'Geospatial fields, requests & audit records' },
  { name: 'Google OR-Tools', role: 'Constraint-based machinery scheduling engine' },
];
