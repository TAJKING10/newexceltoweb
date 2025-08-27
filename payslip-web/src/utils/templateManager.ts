import { 
  PayslipTemplate, 
  EmployeePayslip, 
  PayslipBatch, 
  TemplateAction,
  DEFAULT_TEMPLATE 
} from '../types/PayslipTypes';

export class TemplateManager {
  private templates: Map<string, PayslipTemplate> = new Map();
  private payslips: Map<string, EmployeePayslip> = new Map();
  private batches: Map<string, PayslipBatch> = new Map();

  constructor() {
    // Load default template
    this.templates.set(DEFAULT_TEMPLATE.id, DEFAULT_TEMPLATE);
    this.loadFromStorage();
  }

  // Template Management
  createTemplate(template: Omit<PayslipTemplate, 'id'>): string {
    const id = `template-${Date.now()}`;
    const newTemplate: PayslipTemplate = {
      ...template,
      id
    };
    this.templates.set(id, newTemplate);
    this.saveToStorage();
    return id;
  }

  getTemplate(id: string): PayslipTemplate | null {
    return this.templates.get(id) || null;
  }

  getAllTemplates(): PayslipTemplate[] {
    return Array.from(this.templates.values());
  }

  updateTemplate(id: string, action: TemplateAction): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    const updatedTemplate = this.applyTemplateAction(template, action);
    this.templates.set(id, updatedTemplate);
    this.saveToStorage();
    return true;
  }

  duplicateTemplate(id: string, newName: string): string | null {
    const template = this.templates.get(id);
    if (!template) return null;

    const newId = `template-${Date.now()}`;
    const duplicatedTemplate: PayslipTemplate = {
      ...JSON.parse(JSON.stringify(template)), // Deep clone
      id: newId,
      name: newName,
      version: '1.0'
    };

    this.templates.set(newId, duplicatedTemplate);
    this.saveToStorage();
    return newId;
  }

  deleteTemplate(id: string): boolean {
    if (id === DEFAULT_TEMPLATE.id) return false; // Can't delete default template
    const deleted = this.templates.delete(id);
    if (deleted) this.saveToStorage();
    return deleted;
  }

  // Template Action Reducer
  private applyTemplateAction(template: PayslipTemplate, action: TemplateAction): PayslipTemplate {
    const newTemplate = JSON.parse(JSON.stringify(template)); // Deep clone

    switch (action.type) {
      case 'ADD_SECTION':
        newTemplate.sections.push(action.section);
        break;

      case 'REMOVE_SECTION':
        newTemplate.sections = newTemplate.sections.filter((s: any) => s.id !== action.sectionId);
        break;

      case 'UPDATE_SECTION':
        const sectionIndex = newTemplate.sections.findIndex((s: any) => s.id === action.sectionId);
        if (sectionIndex >= 0) {
          newTemplate.sections[sectionIndex] = { ...newTemplate.sections[sectionIndex], ...action.updates };
        }
        break;

      case 'ADD_FIELD':
        const section = newTemplate.sections.find((s: any) => s.id === action.sectionId);
        if (section) {
          section.fields.push(action.field);
        }
        break;

      case 'REMOVE_FIELD':
        const sectionToUpdate = newTemplate.sections.find((s: any) => s.id === action.sectionId);
        if (sectionToUpdate) {
          sectionToUpdate.fields = sectionToUpdate.fields.filter((f: any) => f.id !== action.fieldId);
        }
        break;

      case 'UPDATE_FIELD':
        const sectionWithField = newTemplate.sections.find((s: any) => s.id === action.sectionId);
        if (sectionWithField) {
          const fieldIndex = sectionWithField.fields.findIndex((f: any) => f.id === action.fieldId);
          if (fieldIndex >= 0) {
            sectionWithField.fields[fieldIndex] = { ...sectionWithField.fields[fieldIndex], ...action.updates };
          }
        }
        break;

      case 'ADD_TABLE':
        newTemplate.tables.push(action.table);
        break;

      case 'REMOVE_TABLE':
        newTemplate.tables = newTemplate.tables.filter((t: any) => t.id !== action.tableId);
        break;

      case 'UPDATE_TABLE':
        const tableIndex = newTemplate.tables.findIndex((t: any) => t.id === action.tableId);
        if (tableIndex >= 0) {
          newTemplate.tables[tableIndex] = { ...newTemplate.tables[tableIndex], ...action.updates };
        }
        break;

      case 'ADD_TABLE_COLUMN':
        const table = newTemplate.tables.find((t: any) => t.id === action.tableId);
        if (table) {
          table.columns.push(action.column);
          // Add empty values for existing rows
          table.rows.forEach((row: any) => {
            row[action.column.id] = '';
          });
        }
        break;

      case 'REMOVE_TABLE_COLUMN':
        const tableToUpdate = newTemplate.tables.find((t: any) => t.id === action.tableId);
        if (tableToUpdate) {
          tableToUpdate.columns = tableToUpdate.columns.filter((c: any) => c.id !== action.columnId);
          // Remove column data from all rows
          tableToUpdate.rows.forEach((row: any) => {
            delete row[action.columnId];
          });
        }
        break;

      case 'ADD_TABLE_ROW':
        const targetTable = newTemplate.tables.find((t: any) => t.id === action.tableId);
        if (targetTable) {
          targetTable.rows.push(action.row);
        }
        break;

      case 'REMOVE_TABLE_ROW':
        const tableWithRow = newTemplate.tables.find((t: any) => t.id === action.tableId);
        if (tableWithRow && action.rowIndex < tableWithRow.rows.length) {
          tableWithRow.rows.splice(action.rowIndex, 1);
        }
        break;

      case 'UPDATE_TEMPLATE_SETTINGS':
        Object.assign(newTemplate, action.updates);
        break;
    }

    return newTemplate;
  }

  // Payslip Management
  createPayslip(templateId: string, employeeId: string, data: { [fieldId: string]: any }): string {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    const id = `payslip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const payslip: EmployeePayslip = {
      id,
      templateId,
      employeeId,
      data,
      tableData: {},
      calculatedValues: {},
      generatedDate: new Date(),
      payPeriod: data.pay_period || new Date().toISOString().substr(0, 7)
    };

    // Initialize table data
    template.tables.forEach(table => {
      payslip.tableData[table.id] = [...table.rows];
    });

    // Calculate formulas
    payslip.calculatedValues = this.calculateFormulas(template, payslip);

    this.payslips.set(id, payslip);
    this.saveToStorage();
    return id;
  }

  updatePayslip(id: string, data: { [fieldId: string]: any }, tableData?: { [tableId: string]: { [columnId: string]: any }[] }): boolean {
    const payslip = this.payslips.get(id);
    if (!payslip) return false;

    const template = this.templates.get(payslip.templateId);
    if (!template) return false;

    // Update data
    payslip.data = { ...payslip.data, ...data };
    
    // Update table data if provided
    if (tableData) {
      payslip.tableData = { ...payslip.tableData, ...tableData };
    }

    // Recalculate formulas
    payslip.calculatedValues = this.calculateFormulas(template, payslip);

    this.payslips.set(id, payslip);
    this.saveToStorage();
    return true;
  }

  getPayslip(id: string): EmployeePayslip | null {
    return this.payslips.get(id) || null;
  }

  getAllPayslips(): EmployeePayslip[] {
    return Array.from(this.payslips.values());
  }

  // Batch Processing
  createBatch(name: string, templateId: string, employeeData: Array<{ employeeId: string; data: { [fieldId: string]: any } }>): string {
    const batchId = `batch-${Date.now()}`;
    const batch: PayslipBatch = {
      id: batchId,
      name,
      templateId,
      payslips: [],
      status: 'draft',
      createdDate: new Date()
    };

    // Create payslips for each employee
    employeeData.forEach(empData => {
      const payslipId = this.createPayslip(templateId, empData.employeeId, empData.data);
      const payslip = this.payslips.get(payslipId);
      if (payslip) {
        batch.payslips.push(payslip);
      }
    });

    batch.status = 'completed';
    batch.processedDate = new Date();

    this.batches.set(batchId, batch);
    this.saveToStorage();
    return batchId;
  }

  getBatch(id: string): PayslipBatch | null {
    return this.batches.get(id) || null;
  }

  getAllBatches(): PayslipBatch[] {
    return Array.from(this.batches.values());
  }

  // Formula Calculation
  private calculateFormulas(template: PayslipTemplate, payslip: EmployeePayslip): { [key: string]: any } {
    const calculated: { [key: string]: any } = {};
    const allData = { ...payslip.data };

    // Helper function to get section totals
    const getSectionTotal = (sectionId: string): number => {
      const section = template.sections.find(s => s.id === sectionId);
      if (!section) return 0;
      
      return section.fields
        .filter(f => f.type === 'number' || (f.type === 'formula' && calculated[f.id]))
        .reduce((total, field) => {
          const value = calculated[field.id] || allData[field.id] || 0;
          return total + (typeof value === 'number' ? value : 0);
        }, 0);
    };

    // Process all sections
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'formula' && field.formula) {
          try {
            let formula = field.formula;
            
            // Replace section totals
            formula = formula.replace(/SUM\(([^)]+)\)/g, (match, sectionId) => {
              return getSectionTotal(sectionId).toString();
            });

            // Replace field references
            Object.keys(allData).forEach(fieldId => {
              const value = allData[fieldId] || 0;
              formula = formula.replace(new RegExp(`\\b${fieldId}\\b`, 'g'), value.toString());
            });

            // Replace previously calculated values
            Object.keys(calculated).forEach(fieldId => {
              formula = formula.replace(new RegExp(`\\b${fieldId}\\b`, 'g'), calculated[fieldId].toString());
            });

            // Evaluate the formula
            // eslint-disable-next-line no-eval
            calculated[field.id] = eval(formula);
          } catch (error) {
            console.error(`Error calculating formula for ${field.id}:`, error);
            calculated[field.id] = 0;
          }
        }
      });
    });

    return calculated;
  }

  // Storage Management
  private saveToStorage(): void {
    try {
      localStorage.setItem('payslip-templates', JSON.stringify(Array.from(this.templates.entries())));
      localStorage.setItem('payslip-payslips', JSON.stringify(Array.from(this.payslips.entries())));
      localStorage.setItem('payslip-batches', JSON.stringify(Array.from(this.batches.entries())));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const templatesData = localStorage.getItem('payslip-templates');
      if (templatesData) {
        const entries = JSON.parse(templatesData);
        this.templates = new Map(entries);
      }

      const payslipsData = localStorage.getItem('payslip-payslips');
      if (payslipsData) {
        const entries = JSON.parse(payslipsData);
        this.payslips = new Map(entries);
      }

      const batchesData = localStorage.getItem('payslip-batches');
      if (batchesData) {
        const entries = JSON.parse(batchesData);
        this.batches = new Map(entries);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  // Export/Import
  exportTemplate(id: string): string {
    const template = this.templates.get(id);
    if (!template) throw new Error('Template not found');
    return JSON.stringify(template, null, 2);
  }

  importTemplate(templateJson: string): string {
    try {
      const template: PayslipTemplate = JSON.parse(templateJson);
      const newId = `template-${Date.now()}`;
      template.id = newId;
      this.templates.set(newId, template);
      this.saveToStorage();
      return newId;
    } catch (error) {
      throw new Error('Invalid template JSON');
    }
  }
}

// Singleton instance
export const templateManager = new TemplateManager();