import * as XLSX from 'xlsx';

export interface PayslipData {
  [key: string]: any;
}

export interface CellData {
  value: any;
  formula?: string;
  address: string;
  type: string;
}

export class ExcelReader {
  private workbook: XLSX.WorkBook | null = null;
  private worksheet: XLSX.WorkSheet | null = null;

  async loadFile(file: File | string): Promise<void> {
    try {
      let data: ArrayBuffer;
      
      if (typeof file === 'string') {
        // Load from public folder
        const response = await fetch(file);
        data = await response.arrayBuffer();
      } else {
        // Load from file input
        data = await file.arrayBuffer();
      }

      this.workbook = XLSX.read(data, { type: 'array' });
      const sheetName = this.workbook.SheetNames[0];
      this.worksheet = this.workbook.Sheets[sheetName];
    } catch (error) {
      console.error('Error loading Excel file:', error);
      throw error;
    }
  }

  getSheetNames(): string[] {
    if (!this.workbook) return [];
    return this.workbook.SheetNames;
  }

  getCellValue(address: string): any {
    if (!this.worksheet) return null;
    const cell = this.worksheet[address];
    return cell ? cell.v : null;
  }

  getCellFormula(address: string): string | undefined {
    if (!this.worksheet) return undefined;
    const cell = this.worksheet[address];
    return cell ? cell.f : undefined;
  }

  getAllCells(): CellData[] {
    if (!this.worksheet) return [];
    
    const cells: CellData[] = [];
    const range = XLSX.utils.decode_range(this.worksheet['!ref'] || 'A1:A1');
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const address = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = this.worksheet[address];
        
        if (cell) {
          cells.push({
            address,
            value: cell.v,
            formula: cell.f,
            type: cell.t || 'unknown'
          });
        }
      }
    }
    
    return cells;
  }

  getDataAsJson(): PayslipData[] {
    if (!this.worksheet) return [];
    return XLSX.utils.sheet_to_json(this.worksheet, { header: 1 });
  }

  getRange(): string {
    if (!this.worksheet || !this.worksheet['!ref']) return 'A1:A1';
    return this.worksheet['!ref'];
  }

  analyzeCellTypes(): { [type: string]: number } {
    const cells = this.getAllCells();
    const types: { [type: string]: number } = {};
    
    cells.forEach(cell => {
      const type = cell.type;
      types[type] = (types[type] || 0) + 1;
    });
    
    return types;
  }

  getFormulas(): { address: string; formula: string }[] {
    const cells = this.getAllCells();
    return cells
      .filter(cell => cell.formula)
      .map(cell => ({
        address: cell.address,
        formula: cell.formula!
      }));
  }
}

export const excelReader = new ExcelReader();