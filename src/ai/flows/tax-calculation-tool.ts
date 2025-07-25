// src/ai/flows/tax-calculation-tool.ts
'use server';

/**
 * @fileOverview A tax calculation AI agent that uses Philippine tax law to prepare withholding tax calculations.
 *
 * - calculateTax - A function that handles the tax calculation process.
 * - TaxCalculationInput - The input type for the calculateTax function.
 * - TaxCalculationOutput - The return type for the calculateTax function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaxCalculationInputSchema = z.object({
  monthlySalary: z.number().describe('The monthly salary of the employee.'),
  annualTaxableIncome: z.number().optional().describe('The annual taxable income of the employee, if available.'),
  taxTable: z.string().describe('The current BIR tax table in JSON format.'),
});
export type TaxCalculationInput = z.infer<typeof TaxCalculationInputSchema>;

const TaxCalculationOutputSchema = z.object({
  monthlyWithholdingTax: z
    .number()
    .describe('The monthly withholding tax to be deducted from the employee.'),
  annualizedTax: z.number().optional().describe('The annualized tax, if applicable.'),
});
export type TaxCalculationOutput = z.infer<typeof TaxCalculationOutputSchema>;

export async function calculateTax(input: TaxCalculationInput): Promise<TaxCalculationOutput> {
  return calculateTaxFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taxCalculationPrompt',
  input: {schema: TaxCalculationInputSchema},
  output: {schema: TaxCalculationOutputSchema},
  prompt: `You are an expert in Philippine tax law.
  Given the monthly salary, annual taxable income (if available), and the current BIR tax table, calculate the monthly withholding tax for the employee.
  If annualTaxableIncome is provided, calculate and return the annualized tax as well.
  Ensure the calculation adheres to the provided taxTable.

  Monthly Salary: {{{monthlySalary}}}
  Annual Taxable Income (if available): {{{annualTaxableIncome}}}
  Tax Table (JSON format): {{{taxTable}}}

  Return the monthlyWithholdingTax and annualizedTax (if applicable) in JSON format.
  `,
});

const calculateTaxFlow = ai.defineFlow(
  {
    name: 'calculateTaxFlow',
    inputSchema: TaxCalculationInputSchema,
    outputSchema: TaxCalculationOutputSchema,
  },
  async input => {
    try {
      // Parse the tax table to ensure it's a valid JSON
      JSON.parse(input.taxTable);
    } catch (e) {
      throw new Error('Invalid tax table format: ' + (e as any).message);
    }

    const {output} = await prompt(input);
    return output!;
  }
);
