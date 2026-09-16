export interface StampDutyState {
  name: string;
  stampDutyMale: number; // % of property value
  stampDutyFemale: number; // % of property value
  registrationPct: number; // % of property value
  registrationCap?: number; // ₹ — some states cap the flat registration charge
  note?: string;
}

// Indicative state-level rates compiled from public real-estate sources
// (2026). States commonly add municipal/local-body surcharges, and slabs
// or caps can differ by urban vs. rural areas within the same state —
// always confirm the exact figure with the local sub-registrar office.
export const stampDutyStates: StampDutyState[] = [
  {
    name: "Maharashtra",
    stampDutyMale: 5,
    stampDutyFemale: 4,
    registrationPct: 1,
    registrationCap: 30000,
    note: "Registration is often capped around ₹30,000 in rural areas; urban registration may not be capped.",
  },
  { name: "Delhi", stampDutyMale: 6, stampDutyFemale: 4, registrationPct: 1 },
  {
    name: "Karnataka",
    stampDutyMale: 5,
    stampDutyFemale: 5,
    registrationPct: 1,
    registrationCap: 15000,
  },
  { name: "Tamil Nadu", stampDutyMale: 7, stampDutyFemale: 7, registrationPct: 1 },
  { name: "Uttar Pradesh", stampDutyMale: 7, stampDutyFemale: 6, registrationPct: 1 },
  {
    name: "Telangana",
    stampDutyMale: 4,
    stampDutyFemale: 4,
    registrationPct: 0.5,
    registrationCap: 20000,
  },
  { name: "Gujarat", stampDutyMale: 4.9, stampDutyFemale: 4.9, registrationPct: 1 },
  { name: "Rajasthan", stampDutyMale: 5, stampDutyFemale: 4, registrationPct: 1 },
  { name: "West Bengal", stampDutyMale: 5, stampDutyFemale: 5, registrationPct: 1 },
  { name: "Haryana", stampDutyMale: 7, stampDutyFemale: 5, registrationPct: 1 },
  { name: "Madhya Pradesh", stampDutyMale: 7.5, stampDutyFemale: 7.5, registrationPct: 1 },
  { name: "Kerala", stampDutyMale: 8, stampDutyFemale: 8, registrationPct: 2 },
  { name: "Andhra Pradesh", stampDutyMale: 5, stampDutyFemale: 5, registrationPct: 1 },
  { name: "Punjab", stampDutyMale: 7, stampDutyFemale: 5, registrationPct: 1 },
  { name: "Bihar", stampDutyMale: 6, stampDutyFemale: 5.7, registrationPct: 2 },
];
