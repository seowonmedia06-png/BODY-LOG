export interface User {
  id: string;
  email: string;
}

export interface UserProfile {
  userId: string;
  nickname: string;
  privacyMode?: boolean;
}

export interface MetricReferenceRange {
  min?: number;
  max?: number;
  unit?: string;
  rawLabel?: string;
}

export interface SheetReferenceRanges {
  weight?: MetricReferenceRange;
  skeletalMuscle?: MetricReferenceRange;
  bodyFatPercent?: MetricReferenceRange;
  bodyFatMass?: MetricReferenceRange;
  bmi?: MetricReferenceRange;
  visceralFat?: MetricReferenceRange;
}

export interface MeasurementRecord {
  id: string;
  userId: string;
  date: string; // e.g. "2026.09.18"
  dateLabel: string; // e.g. "09.18"
  rawDate: string; // ISO date "2026-09-18"
  weight: number;
  weightDelta: number; // delta compared to user's previous record
  skeletalMuscle: number;
  muscleDelta: number;
  bodyFatPercent: number;
  fatDelta: number;
  bodyFatMass: number;
  bmi: number;
  visceralFat: number;
  isLatest?: boolean;
  isBaseline?: boolean;
  createdAt: string;
  sourceType?: 'camera' | 'gallery' | 'file';
  referenceRanges?: SheetReferenceRanges;
}

export type TabType = 'home' | 'record' | 'my';

export type AuthScreenType = 'login' | 'signup' | 'nickname-setup';

export type ViewType = 'auth' | 'main' | 'detail';

export type MetricType = 'weight' | 'muscle' | 'fat';
