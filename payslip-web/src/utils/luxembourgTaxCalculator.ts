import { FormulaParser } from './formulaParser';

export interface LuxembourgTaxResult {
  grossSalary: number;
  incomeTax: number;
  socialSecurity: {
    sickness: number;
    pension: number;
    dependency: number;
    total: number;
  };
  employerContributions: {
    sicknessAndCash: number;
    accident: number;
    health: number;
    mutuality: number;
    pension: number;
    total: number;
  };
  netSalary: number;
  totalCostToEmployer: number;
}

export interface TaxParameters {
  taxClass: 1 | 2; // 1 = single, 2 = married/civil partner
  hasChildren: boolean;
  isOver65: boolean;
  monthlyGrossSalary: number;
}

export class LuxembourgTaxCalculator {
  
  static calculate(params: TaxParameters): LuxembourgTaxResult {
    const { monthlyGrossSalary, taxClass, hasChildren } = params;
    
    // Calculate income tax
    const incomeTax = FormulaParser.calculateLuxembourgIncomeTax(monthlyGrossSalary, taxClass);
    
    // Calculate employee social security contributions
    const socialSecurity = FormulaParser.calculateLuxembourgSocialSecurity(monthlyGrossSalary);
    
    // Calculate employer contributions
    const employerContributions = FormulaParser.calculateEmployerSocialSecurity(monthlyGrossSalary);
    
    // Apply tax credits
    let adjustedTax = incomeTax;
    if (hasChildren && taxClass === 1) {
      // Single parent tax credit: €3,504 annually = €292 monthly for 2025
      adjustedTax = Math.max(0, incomeTax - 292);
    }
    
    // Calculate net salary
    const netSalary = monthlyGrossSalary - adjustedTax - socialSecurity.total;
    
    // Total cost to employer (gross + employer contributions)
    const totalCostToEmployer = monthlyGrossSalary + employerContributions.total;
    
    return {
      grossSalary: monthlyGrossSalary,
      incomeTax: adjustedTax,
      socialSecurity,
      employerContributions,
      netSalary,
      totalCostToEmployer
    };
  }
  
  static calculateAnnual(params: TaxParameters): LuxembourgTaxResult {
    const monthlyResult = this.calculate(params);
    
    return {
      grossSalary: monthlyResult.grossSalary * 12,
      incomeTax: monthlyResult.incomeTax * 12,
      socialSecurity: {
        sickness: monthlyResult.socialSecurity.sickness * 12,
        pension: monthlyResult.socialSecurity.pension * 12,
        dependency: monthlyResult.socialSecurity.dependency * 12,
        total: monthlyResult.socialSecurity.total * 12
      },
      employerContributions: {
        sicknessAndCash: monthlyResult.employerContributions.sicknessAndCash * 12,
        accident: monthlyResult.employerContributions.accident * 12,
        health: monthlyResult.employerContributions.health * 12,
        mutuality: monthlyResult.employerContributions.mutuality * 12,
        pension: monthlyResult.employerContributions.pension * 12,
        total: monthlyResult.employerContributions.total * 12
      },
      netSalary: monthlyResult.netSalary * 12,
      totalCostToEmployer: monthlyResult.totalCostToEmployer * 12
    };
  }
  
  static formatResult(result: LuxembourgTaxResult): string {
    return `
Luxembourg Payslip Calculation:
===============================
Gross Salary: ${FormulaParser.formatCurrency(result.grossSalary)}
Income Tax: ${FormulaParser.formatCurrency(result.incomeTax)}

Employee Social Security Contributions:
- Sickness Insurance (2.8%): ${FormulaParser.formatCurrency(result.socialSecurity.sickness)}
- Pension (8%): ${FormulaParser.formatCurrency(result.socialSecurity.pension)}
- Dependency (1.4%): ${FormulaParser.formatCurrency(result.socialSecurity.dependency)}
Total Employee Contributions: ${FormulaParser.formatCurrency(result.socialSecurity.total)}

NET SALARY: ${FormulaParser.formatCurrency(result.netSalary)}

Employer Contributions:
- Sickness & Cash (3.05%): ${FormulaParser.formatCurrency(result.employerContributions.sicknessAndCash)}
- Accident (1%): ${FormulaParser.formatCurrency(result.employerContributions.accident)}
- Health (0.14%): ${FormulaParser.formatCurrency(result.employerContributions.health)}
- Mutuality (1.5%): ${FormulaParser.formatCurrency(result.employerContributions.mutuality)}
- Pension (8%): ${FormulaParser.formatCurrency(result.employerContributions.pension)}
Total Employer Cost: ${FormulaParser.formatCurrency(result.totalCostToEmployer)}
    `.trim();
  }
  
  // Quick calculation functions for common scenarios
  static calculateSingle(monthlyGrossSalary: number): LuxembourgTaxResult {
    return this.calculate({
      taxClass: 1,
      hasChildren: false,
      isOver65: false,
      monthlyGrossSalary
    });
  }
  
  static calculateMarried(monthlyGrossSalary: number): LuxembourgTaxResult {
    return this.calculate({
      taxClass: 2,
      hasChildren: false,
      isOver65: false,
      monthlyGrossSalary
    });
  }
  
  static calculateSingleParent(monthlyGrossSalary: number): LuxembourgTaxResult {
    return this.calculate({
      taxClass: 1,
      hasChildren: true,
      isOver65: false,
      monthlyGrossSalary
    });
  }
}

export default LuxembourgTaxCalculator;