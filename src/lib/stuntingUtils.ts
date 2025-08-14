import { differenceInMonths } from 'date-fns';
import whoGrowthStandards from '@/data/who_growth_standards.json';

interface GrowthStandard {
  month: number;
  L: number;
  M: number;
  S: number;
}

// Function to get the appropriate growth standard data based on gender and type
function getGrowthStandardData(gender: string, type: 'length_for_age_boys' | 'length_for_age_girls'): GrowthStandard[] {
  if (gender.toLowerCase() === 'male' || gender.toLowerCase() === 'laki-laki') {
    return whoGrowthStandards.length_for_age_boys;
  } else if (gender.toLowerCase() === 'female' || gender.toLowerCase() === 'perempuan') {
    return whoGrowthStandards.length_for_age_girls;
  }
  return []; // Or throw an error for unsupported gender
}

// Function to interpolate L, M, S values for a given age in months
function interpolateLMS(data: GrowthStandard[], ageInMonths: number): { L: number; M: number; S: number } | null {
  if (data.length === 0) return null;

  // Find the two closest data points
  let lowerBound = data.findLast(d => d.month <= ageInMonths);
  let upperBound = data.find(d => d.month >= ageInMonths);

  if (lowerBound && upperBound && lowerBound.month === upperBound.month) {
    // Exact match or only one data point
    return { L: lowerBound.L, M: lowerBound.M, S: lowerBound.S };
  }

  if (!lowerBound || !upperBound) {
    // Age is outside the range of available data
    // For simplicity, return the closest available data point or null
    if (ageInMonths < data[0].month) return { L: data[0].L, M: data[0].M, S: data[0].S };
    if (ageInMonths > data[data.length - 1].month) return { L: data[data.length - 1].L, M: data[data.length - 1].M, S: data[data.length - 1].S };
    return null; // Should not happen if data is well-formed
  }

  // Linear interpolation
  const ratio = (ageInMonths - lowerBound.month) / (upperBound.month - lowerBound.month);
  const L = lowerBound.L + ratio * (upperBound.L - lowerBound.L);
  const M = lowerBound.M + ratio * (upperBound.M - lowerBound.M);
  const S = lowerBound.S + ratio * (upperBound.S - lowerBound.S);

  return { L, M, S };
}

// Function to calculate Z-score
export function calculateZScore(
  measurement: number,
  ageInMonths: number,
  gender: string,
  type: 'length_for_age_boys' | 'length_for_age_girls' // Allow both types
): number | null {
  const growthData = getGrowthStandardData(gender, type);
  const lms = interpolateLMS(growthData, ageInMonths);

  if (!lms) {
    console.warn(`No WHO growth standard data found for age ${ageInMonths} months and gender ${gender} for type ${type}.`);
    return null;
  }

  const { L, M, S } = lms;

  if (L === 0) { // Special case for L=0 (logarithmic transformation)
    return Math.log(measurement / M) / S;
  } else {
    return (Math.pow(measurement / M, L) - 1) / (L * S);
  }
}

// Helper to calculate age in months
export function getAgeInMonths(dateOfBirth: Date, measurementDate: Date): number {
  return differenceInMonths(measurementDate, dateOfBirth);
}
