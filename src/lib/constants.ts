// src/lib/constants.ts

// Revised Withholding Tax Table, effective January 1, 2023 (RA 10963)
// This is a simplified representation for the AI prompt.
// The AI is expected to understand how to apply it based on compensation levels.
// The tax is computed based on ANNUAL taxable income. The AI will need to annualize the monthly salary.
export const BIR_TAX_TABLE_JSON = JSON.stringify([
  {
    range: "250,000 and below",
    taxRate: "0%",
    taxOnBase: 0,
  },
  {
    range: "Over 250,000 up to 400,000",
    taxRate: "15% of the excess over 250,000",
    taxOnBase: 0,
  },
  {
    range: "Over 400,000 up to 800,000",
    taxRate: "20% of the excess over 400,000",
    taxOnBase: 22500,
  },
  {
    range: "Over 800,000 up to 2,000,000",
    taxRate: "25% of the excess over 800,000",
    taxOnBase: 102500,
  },
  {
    range: "Over 2,000,000 up to 8,000,000",
    taxRate: "30% of the excess over 2,000,000",
    taxOnBase: 402500,
  },
  {
    range: "Over 8,000,000",
    taxRate: "35% of the excess over 8,000,000",
    taxOnBase: 2202500,
  },
]);

// SSS Contribution Table (Effective 2023)
export const SSS_CONTRIBUTION_RATE = {
  employee: 0.045,
  employer: 0.095,
  total: 0.14,
};
export const SSS_MIN_MSC = 4000;
export const SSS_MAX_MSC = 30000;

// PhilHealth Contribution (Effective 2024 - 5% rate)
export const PHILHEALTH_RATE = 0.05;
export const PHILHEALTH_MIN_SALARY_BASE = 10000;
export const PHILHEALTH_MAX_SALARY_BASE = 100000;

// Pag-IBIG Contribution (Effective Feb 2024)
export const PAGIBIG_MAX_COMPENSATION_BASE = 10000;
export const PAGIBIG_RATE = {
  employee_low: 0.01, // for salary <= 1500
  employee_high: 0.02, // for salary > 1500
  employer: 0.02,
};
