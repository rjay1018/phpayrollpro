import {
  SSS_CONTRIBUTION_RATE,
  SSS_MAX_MSC,
  SSS_MIN_MSC,
  PHILHEALTH_RATE,
  PHILHEALTH_MIN_SALARY_BASE,
  PHILHEALTH_MAX_SALARY_BASE,
  PAGIBIG_RATE,
  PAGIBIG_MAX_COMPENSATION_BASE,
  BIR_TAX_TABLE_JSON,
} from './constants';
import { calculateTax } from '@/ai/flows/tax-calculation-tool';

export interface EmployeeData {
  id: number;
  name: string;
  monthlySalary: number;
}

export interface PayrollResult {
  employee: EmployeeData;
  grossPay: number;
  deductions: {
    sss: number;
    philhealth: number;
    pagibig: number;
    tax: number;
    total: number;
  };
  contributions: {
    sss: number;
    philhealth: number;
    pagibig: number;
    total: number;
  };
  netPay: number;
  totalERCost: number;
}

export interface Totals {
    grossPay: number;
    netPay: number;
    sss: { ee: number, er: number };
    philhealth: { ee: number, er: number };
    pagibig: { ee: number, er: number };
    tax: number;
}

const getSssMsc = (salary: number): number => {
  if (salary < SSS_MIN_MSC) return SSS_MIN_MSC;
  if (salary > SSS_MAX_MSC) return SSS_MAX_MSC;
  
  // Round to the nearest 500, but up to the next bracket for amounts like 4250.01
  const remainder = salary % 1000;
  if (remainder === 0) return salary;
  if (remainder <= 500) return Math.floor(salary / 1000) * 1000 + 500;
  return Math.ceil(salary / 1000) * 1000;
}

const calculateSss = (salary: number): { ee: number; er: number } => {
  const msc = getSssMsc(salary);
  const employeeShare = msc * SSS_CONTRIBUTION_RATE.employee;
  const employerShare = msc * SSS_CONTRIBUTION_RATE.employer;
  return { ee: employeeShare, er: employerShare };
};

const calculatePhilhealth = (salary: number): { ee: number; er: number } => {
    const base = Math.max(PHILHEALTH_MIN_SALARY_BASE, Math.min(salary, PHILHEALTH_MAX_SALARY_BASE));
    const totalContribution = base * PHILHEALTH_RATE;
    return { ee: totalContribution / 2, er: totalContribution / 2 };
};

const calculatePagibig = (salary: number): { ee: number; er: number } => {
    const employeeRate = salary <= 1500 ? PAGIBIG_RATE.employee_low : PAGIBIG_RATE.employee_high;
    const base = Math.min(salary, PAGIBIG_MAX_COMPENSATION_BASE);
    const employeeShare = base * employeeRate;
    const employerShare = base * PAGIBIG_RATE.employer;
    return { ee: Math.min(100, employeeShare), er: Math.min(100, employerShare)}; // HDMF Circular 274 caps EE share at P100.
};

export async function processPayroll(employees: EmployeeData[]): Promise<{ results: PayrollResult[], totals: Totals }> {
  const results: PayrollResult[] = [];
  const totals: Totals = {
    grossPay: 0,
    netPay: 0,
    sss: { ee: 0, er: 0 },
    philhealth: { ee: 0, er: 0 },
    pagibig: { ee: 0, er: 0 },
    tax: 0,
  };

  for (const employee of employees) {
    const grossPay = employee.monthlySalary;

    const sss = calculateSss(grossPay);
    const philhealth = calculatePhilhealth(grossPay);
    const pagibig = calculatePagibig(grossPay);
    
    // The GenAI tool is prompted to calculate withholding tax based on the provided salary and tax table.
    // It is expected to handle annualization and deduction logic as an expert.
    const taxResponse = await calculateTax({ 
      monthlySalary: grossPay,
      taxTable: BIR_TAX_TABLE_JSON 
    });

    const withholdingTax = taxResponse.monthlyWithholdingTax || 0;

    const totalDeductions = sss.ee + philhealth.ee + pagibig.ee + withholdingTax;
    const netPay = grossPay - totalDeductions;
    
    const totalERContributions = sss.er + philhealth.er + pagibig.er;
    const totalERCost = grossPay + totalERContributions;

    results.push({
      employee,
      grossPay,
      deductions: {
        sss: sss.ee,
        philhealth: philhealth.ee,
        pagibig: pagibig.ee,
        tax: withholdingTax,
        total: totalDeductions,
      },
      contributions: {
        sss: sss.er,
        philhealth: philhealth.er,
        pagibig: pagibig.er,
        total: totalERContributions,
      },
      netPay,
      totalERCost
    });

    // Aggregate totals
    totals.grossPay += grossPay;
    totals.netPay += netPay;
    totals.sss.ee += sss.ee;
    totals.sss.er += sss.er;
    totals.philhealth.ee += philhealth.ee;
    totals.philhealth.er += philhealth.er;
    totals.pagibig.ee += pagibig.ee;
    totals.pagibig.er += pagibig.er;
    totals.tax += withholdingTax;
  }
  
  return { results, totals };
}
