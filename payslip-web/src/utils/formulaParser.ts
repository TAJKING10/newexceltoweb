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

  // Format number as currency
  static formatCurrency(value: number, currency: string = '$'): string {
    return `${currency}${value.toFixed(2)}`;
  }

  // Common payroll calculations
  static calculateTax(grossSalary: number, taxRate: number): number {
    return grossSalary * taxRate;
  }

  static calculateSocialSecurity(baseSalary: number, rate: number = 0.062): number {
    // US Social Security rate is typically 6.2%
    return baseSalary * rate;
  }

  static calculateMedicare(grossSalary: number, rate: number = 0.0145): number {
    // US Medicare rate is typically 1.45%
    return grossSalary * rate;
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