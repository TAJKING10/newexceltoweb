// Excel formula parser and JavaScript equivalent generator
export class FormulaParser {
  
  // Convert Excel cell reference to array coordinates
  static cellRefToCoords(cellRef: string): { row: number; col: number } {
    const match = cellRef.match(/([A-Z]+)(\d+)/);
    if (!match) throw new Error(`Invalid cell reference: ${cellRef}`);
    
    const colStr = match[1];
    const rowStr = match[2];
    
    // Convert column letters to number (A=0, B=1, etc.)
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 65 + 1);
    }
    col -= 1; // Convert to 0-based index
    
    const row = parseInt(rowStr) - 1; // Convert to 0-based index
    
    return { row, col };
  }

  // Convert array coordinates back to Excel cell reference
  static coordsToCellRef(row: number, col: number): string {
    let colStr = '';
    let colNum = col + 1; // Convert to 1-based
    
    while (colNum > 0) {
      colNum--;
      colStr = String.fromCharCode(65 + (colNum % 26)) + colStr;
      colNum = Math.floor(colNum / 26);
    }
    
    return colStr + (row + 1);
  }

  // Parse Excel formula and convert to JavaScript
  static parseFormula(formula: string, getCellValue: (ref: string) => any): any {
    if (!formula.startsWith('=')) {
      return formula;
    }

    // Remove the '=' prefix
    let jsFormula = formula.substring(1);

    // Replace SUM function
    jsFormula = jsFormula.replace(/SUM\(([^)]+)\)/gi, (match, range) => {
      return `this.sum('${range}')`;
    });

    // Replace IF function
    jsFormula = jsFormula.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/gi, (match, condition, trueValue, falseValue) => {
      return `(${condition} ? ${trueValue} : ${falseValue})`;
    });

    // Replace VLOOKUP (basic implementation)
    jsFormula = jsFormula.replace(/VLOOKUP\(([^,]+),([^,]+),([^,]+),([^)]+)\)/gi, (match, lookup, table, col, exact) => {
      return `this.vlookup(${lookup}, '${table}', ${col}, ${exact})`;
    });

    // Replace cell references with actual values
    jsFormula = jsFormula.replace(/([A-Z]+\d+)/g, (cellRef) => {
      const value = getCellValue(cellRef);
      return typeof value === 'number' ? value.toString() : `"${value}"`;
    });

    // Replace Excel operators with JavaScript equivalents
    jsFormula = jsFormula.replace(/&/g, '+'); // Concatenation
    jsFormula = jsFormula.replace(/\^/g, '**'); // Exponentiation

    try {
      // eslint-disable-next-line no-eval
      return eval(jsFormula);
    } catch (error) {
      console.error(`Error evaluating formula: ${formula}`, error);
      return `#ERROR: ${formula}`;
    }
  }

  // Helper function for SUM
  static sum(range: string, getCellValue: (ref: string) => any): number {
    if (range.includes(':')) {
      // Range like A1:A5
      const [start, end] = range.split(':');
      const startCoords = this.cellRefToCoords(start);
      const endCoords = this.cellRefToCoords(end);
      
      let total = 0;
      for (let row = startCoords.row; row <= endCoords.row; row++) {
        for (let col = startCoords.col; col <= endCoords.col; col++) {
          const cellRef = this.coordsToCellRef(row, col);
          const value = getCellValue(cellRef);
          if (typeof value === 'number') {
            total += value;
          }
        }
      }
      return total;
    } else {
      // Single cell or comma-separated list
      const cells = range.split(',');
      let total = 0;
      for (const cell of cells) {
        const value = getCellValue(cell.trim());
        if (typeof value === 'number') {
          total += value;
        }
      }
      return total;
    }
  }

  // Helper function for VLOOKUP (basic implementation)
  static vlookup(lookupValue: any, tableRange: string, colIndex: number, exactMatch: boolean = true): any {
    // This is a simplified implementation
    // In a real scenario, you'd need access to the full data range
    console.warn('VLOOKUP not fully implemented in this demo');
    return lookupValue;
  }

  // Convert Excel-style percentage to decimal
  static parsePercentage(value: string): number {
    if (typeof value === 'string' && value.includes('%')) {
      return parseFloat(value.replace('%', '')) / 100;
    }
    return typeof value === 'number' ? value : parseFloat(value) || 0;
  }

  // Format number as currency (Luxembourg uses Euro)
  static formatCurrency(value: number, currency: string = '€'): string {
    return `${value.toFixed(2)} ${currency}`;
  }

  // Luxembourg payroll calculations (2025)
  static calculateLuxembourgIncomeTax(grossSalary: number, taxClass: number = 1): number {
    const annualSalary = grossSalary * 12;
    let tax = 0;
    
    // Luxembourg tax brackets for 2025
    const brackets = [
      { min: 0, max: 13230, rate: 0 },
      { min: 13230, max: 15456, rate: 0.08 },
      { min: 15456, max: 17682, rate: 0.09 },
      { min: 17682, max: 19908, rate: 0.10 },
      { min: 19908, max: 22134, rate: 0.11 },
      { min: 22134, max: 24360, rate: 0.12 },
      { min: 24360, max: 26586, rate: 0.14 },
      { min: 26586, max: 28812, rate: 0.16 },
      { min: 28812, max: 31038, rate: 0.18 },
      { min: 31038, max: 33264, rate: 0.20 },
      { min: 33264, max: 35490, rate: 0.22 },
      { min: 35490, max: 37716, rate: 0.24 },
      { min: 37716, max: 39942, rate: 0.26 },
      { min: 39942, max: 42168, rate: 0.28 },
      { min: 42168, max: 44394, rate: 0.30 },
      { min: 44394, max: 46620, rate: 0.32 },
      { min: 46620, max: 48846, rate: 0.34 },
      { min: 48846, max: 51072, rate: 0.36 },
      { min: 51072, max: 53298, rate: 0.38 },
      { min: 53298, max: 234870, rate: 0.40 },
      { min: 234870, max: Infinity, rate: 0.42 }
    ];

    for (const bracket of brackets) {
      if (annualSalary > bracket.min) {
        const taxableAmount = Math.min(annualSalary, bracket.max) - bracket.min;
        tax += taxableAmount * bracket.rate;
      }
    }

    // Apply solidarity tax (7% or 9% based on income)
    const solidarityRate = (taxClass === 1 && annualSalary > 150000) || 
                          (taxClass === 2 && annualSalary > 300000) ? 0.09 : 0.07;
    tax += tax * solidarityRate;

    return tax / 12; // Return monthly tax
  }

  static calculateLuxembourgSocialSecurity(grossSalary: number): {
    sickness: number;
    pension: number;
    dependency: number;
    total: number;
  } {
    // Employee contribution rates for 2025
    const sicknessRate = 0.028; // 2.8%
    const pensionRate = 0.08;   // 8%
    const dependencyRate = 0.014; // 1.4%

    const sickness = grossSalary * sicknessRate;
    const pension = grossSalary * pensionRate;
    const dependency = grossSalary * dependencyRate;

    return {
      sickness,
      pension,
      dependency,
      total: sickness + pension + dependency
    };
  }

  static calculateEmployerSocialSecurity(grossSalary: number): {
    sicknessAndCash: number;
    accident: number;
    health: number;
    mutuality: number;
    pension: number;
    total: number;
  } {
    // Employer contribution rates for 2025
    const sicknessAndCashRate = 0.0305; // 3.05%
    const accidentRate = 0.01;          // 1%
    const healthRate = 0.0014;          // 0.14%
    const mutualityRate = 0.015;        // 1.5%
    const pensionRate = 0.08;           // 8%

    const sicknessAndCash = grossSalary * sicknessAndCashRate;
    const accident = grossSalary * accidentRate;
    const health = grossSalary * healthRate;
    const mutuality = grossSalary * mutualityRate;
    const pension = grossSalary * pensionRate;

    return {
      sicknessAndCash,
      accident,
      health,
      mutuality,
      pension,
      total: sicknessAndCash + accident + health + mutuality + pension
    };
  }

  static calculateNetSalary(
    grossSalary: number, 
    taxClass: number = 1,
    hasChildren: boolean = false
  ): {
    grossSalary: number;
    incomeTax: number;
    socialSecurity: number;
    netSalary: number;
    breakdown: {
      sickness: number;
      pension: number;
      dependency: number;
    };
  } {
    const incomeTax = this.calculateLuxembourgIncomeTax(grossSalary, taxClass);
    const socialSecurity = this.calculateLuxembourgSocialSecurity(grossSalary);
    
    // Apply tax credits for children or single parents
    let adjustedTax = incomeTax;
    if (hasChildren && taxClass === 1) {
      // Single parent tax credit up to €3,504 for 2025
      adjustedTax = Math.max(0, incomeTax - 292); // €3,504 / 12 months
    }

    const netSalary = grossSalary - adjustedTax - socialSecurity.total;

    return {
      grossSalary,
      incomeTax: adjustedTax,
      socialSecurity: socialSecurity.total,
      netSalary,
      breakdown: {
        sickness: socialSecurity.sickness,
        pension: socialSecurity.pension,
        dependency: socialSecurity.dependency
      }
    };
  }

  // Generate JavaScript calculation function from Excel formulas
  static generateCalculationFunction(formulas: { address: string; formula: string }[], cellData: { [address: string]: any }): string {
    let jsFunction = `
function calculatePayslip(inputData) {
  const data = { ...inputData };
  
  // Helper functions
  const sum = (range) => {
    if (typeof range === 'string' && range.includes(':')) {
      // Handle range calculation
      return 0; // Simplified for demo
    }
    return Array.isArray(range) ? range.reduce((a, b) => a + b, 0) : range;
  };
  
  const getCellValue = (ref) => data[ref] || 0;
  
  // Calculated fields
`;

    formulas.forEach(({ address, formula }) => {
      try {
        const jsFormula = this.parseFormula(formula, (ref) => cellData[ref]);
        jsFunction += `  data['${address}'] = ${jsFormula};\n`;
      } catch (error) {
        jsFunction += `  // Error parsing formula for ${address}: ${formula}\n`;
        jsFunction += `  data['${address}'] = 0;\n`;
      }
    });

    jsFunction += `
  return data;
}`;

    return jsFunction;
  }
}

export default FormulaParser;