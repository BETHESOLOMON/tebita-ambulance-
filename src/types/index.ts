import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type UserRole = 'EMT' | 'Admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  ambulanceId?: string;
}

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: number;
  label?: string; // e.g., 'Scene', 'Hospital'
}

export interface VitalSignRecord {
  time: string;
  avpu: string;
  rr: number | string;
  pr: number | string;
  bp: string;
  spo2: number | string;
  skin: string;
  status: 'Stable' | 'Critical';
}

export interface CasualtyReport {
  id: string;
  status: 'Draft' | 'Submitted' | 'Synced';
  createdAt: number;
  updatedAt: number;
  emtId: string;
  emtName: string;
  ambulanceId: string;
  
  // Section 1: Demography
  serviceDate: string;
  callerPoint: 'Home' | 'Health facility' | 'Street' | 'Other';
  patientName: string;
  age: string;
  sex: 'Male' | 'Female' | 'Other';
  phoneNumber: string;
  region: string;
  subCity: string;

  // Section 2: Ambulance & Time
  callTime: string;
  departureTime: string;
  departureKM: number;
  emergencyType: 'EMPD' | 'NEMPD';
  sceneArrivalTime: string;
  sceneArrivalKM: number;
  sceneLeaveTime: string;
  destinationArrivalTime: string;
  destinationArrivalKM: number;
  returnToDispatchTime: string;
  returnKM: number;
  ambulanceLevel: 'BLS' | 'ALS';
  vehicleType: 'Toyota' | 'Hyundai' | 'Mercedes';

  // Section 3: Primary Survey
  severity: 1 | 2 | 3 | 4;
  responsiveness: string;
  airwayStatus: string;
  cCollarApplied: boolean;
  airwayAdjuncts: string[]; // OPA, NPA, LMA
  breathingStatus: string;
  oxygenFlow: string;
  assistedVentilation: string; // BVM, MV
  circulation: string;
  peripheralPulse: string;
  carotidPulse: string;
  cprPerformed: boolean;
  severeBleeding: boolean;
  bleedingControlMethod: string;
  ivAccess: boolean;
  fluidsTypeRate: string;
  bloodGlucose: string;
  gcs: string;
  
  vitals: VitalSignRecord[];

  // Section 4: Secondary Survey
  symptoms: string;
  allergies: string;
  medications: string;
  medicalHistory: string;
  lastMeal: string;
  incidentEvents: string;
  examinationHeadToToe: string;
  injuryFindings: string;
  causeOfInjury: 'RTI' | 'Fall' | 'Violence' | 'Others';
  provisionalDiagnosis: string;

  // Section 5: Care in Transit
  treatmentGiven: string;
  sirenUsed: boolean;
  callerPlace: string;
  accessibility: 'Easy' | 'Difficult';

  // Section 6: Transfer to Definitive Care
  conditionOnHandover: string;
  handoverBloodPressure: string;
  handoverPulse: string;
  handoverOxygenSaturation: string;
  deathOnArrival: boolean;
  handoverTime: string;
  destinationFacility: string;
  receivingPersonnel: string;
  emtSignature: string;
  driverName: string;
  driverSignature: string;

  // Section 7: Others
  ambulanceNumber: string;
  callType: 'New' | 'Repeat';
  serviceFee: string;
  invoiceNumber: string;

  // GPS Data
  route: GPSPoint[];
  sceneLocation?: GPSPoint;
  destinationLocation?: GPSPoint;
  totalDistance?: number;
}