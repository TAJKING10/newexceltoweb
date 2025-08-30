import { LuxembourgTaxCalculator } from './luxembourgTaxCalculator';

export interface PayslipDataState {
  [key: string]: any;
  personName: string;
  personId: string;
  department: string;
  position: string;
  year: number;
  months: {
    [monthIndex: number]: {
      [rowName: string]: number;
    };
  };
  totals: {
    [rowName: string]: number;
  };
  taxClass?: number;
  hasChildren?: boolean;
  customRows: string[];
  groups: any[];
  header: any;
  subHeaders: any[];
}

export class OptimizedDataManager {
  private static isLuxembourgTaxRow(rowName: string): boolean {
    const rowLower = rowName.toLowerCase();
    return rowLower.includes('income tax') ||
           rowLower.includes('social security') ||
           rowLower.includes('sickness') ||
           rowLower.includes('pension') ||
           rowLower.includes('dependency') ||
           rowLower.includes('net salary') ||
           rowLower.includes('total deductions') ||
           rowLower.includes('employer cost');
  }

  private static isSalaryField(rowName: string): boolean {
    const rowLower = rowName.toLowerCase();
    return rowLower.includes('salary') ||
           rowLower.includes('basic') ||
           rowLower.includes('allowance') ||
           rowLower.includes('overtime') ||
           rowLower.includes('bonus');
  }

  // Update only a specific cell without recreating the whole object
  static updateCell(
    state: PayslipDataState,
    monthIndex: number,
    rowName: string,
    value: number
  ): PayslipDataState {
    // Create minimal update - only the changed path
    const newState = {
      ...state,
      months: {
        ...state.months,
        [monthIndex]: {
          ...state.months[monthIndex],
          [rowName]: value
        }
      }
    };

    return newState;
  }

  // Calculate Luxembourg taxes for a specific month
  static calculateLuxembourgTaxes(
    monthData: { [rowName: string]: number },
    taxClass: number = 1,
    hasChildren: boolean = false
  ): { [rowName: string]: number } {
    // Find gross salary from various possible fields
    const grossSalary = monthData['Gross Salary'] || 
                       monthData['Basic Salary'] || 
                       monthData['Salary'] ||
                       (monthData['Basic Salary'] || 0) + 
                       (monthData['Allowances'] || 0) + 
                       (monthData['Overtime Pay'] || 0) + 
                       (monthData['Bonus'] || 0);

    if (grossSalary <= 0) {
      return monthData;
    }

    try {
      // Calculate Luxembourg taxes
      const taxResult = LuxembourgTaxCalculator.calculate({
        monthlyGrossSalary: grossSalary,
        taxClass: taxClass as 1 | 2,
        hasChildren,
        isOver65: false
      });

      const employerContributions = LuxembourgTaxCalculator.calculateEmployerContributions(grossSalary);

      // Update only calculated fields
      const updatedMonthData = { ...monthData };
      
      // Set gross salary if not manually set
      if (!updatedMonthData['Gross Salary'] && grossSalary > 0) {
        updatedMonthData['Gross Salary'] = grossSalary;
      }

      // Auto-populate Luxembourg tax fields
      updatedMonthData['Income Tax'] = taxResult.incomeTax;
      updatedMonthData['Social Security Total'] = taxResult.socialSecurity.total;
      updatedMonthData['Sickness Insurance'] = taxResult.socialSecurity.sickness;
      updatedMonthData['Pension Contribution'] = taxResult.socialSecurity.pension;
      updatedMonthData['Dependency Insurance'] = taxResult.socialSecurity.dependency;
      updatedMonthData['Total Deductions'] = taxResult.incomeTax + taxResult.socialSecurity.total + (updatedMonthData['Other Deductions'] || 0);
      updatedMonthData['Net Salary'] = grossSalary - (taxResult.incomeTax + taxResult.socialSecurity.total);
      updatedMonthData['Employer Cost'] = grossSalary + employerContributions.total;

      return updatedMonthData;
    } catch (error) {
      console.error('Error calculating Luxembourg taxes:', error);
      return monthData;
    }
  }

  // Recalculate totals for specific rows only
  static recalculateTotals(
    state: PayslipDataState,
    changedRows: string[]
  ): PayslipDataState {
    const newTotals = { ...state.totals };

    changedRows.forEach(rowName => {
      let total = 0;
      for (let i = 0; i < 12; i++) {
        total += state.months[i]?.[rowName] || 0;
      }
      newTotals[rowName] = total;
    });

    return {
      ...state,
      totals: newTotals
    };
  }

  // Get list of dependent rows that need recalculation when a row changes
  static getDependentRows(changedRowName: string): string[] {
    const dependentRows = [changedRowName];

    if (this.isSalaryField(changedRowName)) {
      // If salary field changed, all tax fields need recalculation
      dependentRows.push(
        'Gross Salary',
        'Income Tax',
        'Social Security Total',
        'Sickness Insurance',
        'Pension Contribution',
        'Dependency Insurance',
        'Total Deductions',
        'Net Salary',
        'Employer Cost'
      );
    }

    return Array.from(new Set(dependentRows)); // Remove duplicates
  }

  // Batch update multiple cells efficiently
  static batchUpdateCells(
    state: PayslipDataState,
    updates: Array<{
      monthIndex: number;
      rowName: string;
      value: number;
    }>
  ): PayslipDataState {
    let newState = state;

    // Group updates by month for efficiency
    const updatesByMonth: { [month: number]: { [row: string]: number } } = {};
    
    updates.forEach(({ monthIndex, rowName, value }) => {
      if (!updatesByMonth[monthIndex]) {
        updatesByMonth[monthIndex] = {};
      }
      updatesByMonth[monthIndex][rowName] = value;
    });

    // Apply updates month by month
    const newMonths = { ...state.months };
    Object.entries(updatesByMonth).forEach(([month, rowUpdates]) => {
      const monthIndex = parseInt(month);
      newMonths[monthIndex] = {
        ...newMonths[monthIndex],
        ...rowUpdates
      };
    });

    newState = {
      ...newState,
      months: newMonths
    };

    // Recalculate totals for all affected rows
    const allChangedRows = updates.map(u => u.rowName);
    const dependentRows = Array.from(new Set(allChangedRows.flatMap(row => this.getDependentRows(row))));
    
    return this.recalculateTotals(newState, dependentRows);
  }
}